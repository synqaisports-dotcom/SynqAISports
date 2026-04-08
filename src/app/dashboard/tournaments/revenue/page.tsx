"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeEuro, Download, FileSpreadsheet, FileText, Megaphone, Plus, TicketPercent, Trash2, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import {
  getActiveTournamentId,
  loadTournamentConfigById,
  loadTournamentIndex,
  safeJsonParse,
} from "@/lib/tournaments-storage";

type RevenueSponsor = {
  id: string;
  name: string;
  type: "microapp" | "static";
  amount: number;
  assetDataUrl?: string;
};

type TournamentRevenueConfig = {
  ticketing: {
    enabled: boolean;
    includeMinors: boolean;
    adultPrice: number;
    minorPrice: number;
    expectedAdults: number;
    expectedMinors: number;
  };
  spaces: {
    standsEnabled: boolean;
    standsCount: number;
    standPrice: number;
    cafeteriaEnabled: boolean;
    cafeteriaPrice: number;
  };
  sponsors: RevenueSponsor[];
};

type ClubIdentitySnapshot = {
  name?: string;
  logoUrl?: string;
};

const DEFAULT_REVENUE: TournamentRevenueConfig = {
  ticketing: {
    enabled: true,
    includeMinors: true,
    adultPrice: 6,
    minorPrice: 3,
    expectedAdults: 0,
    expectedMinors: 0,
  },
  spaces: {
    standsEnabled: true,
    standsCount: 6,
    standPrice: 120,
    cafeteriaEnabled: true,
    cafeteriaPrice: 250,
  },
  sponsors: [],
};

function tournamentRevenueKey(clubId: string, tournamentId: string) {
  return `synq_tournament_revenue_v1_${clubId}_${tournamentId}`;
}

function toMoney(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

function clampInt(v: number, min = 0) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.floor(v));
}

function num(v: unknown) {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TournamentsRevenuePage() {
  const { profile, session } = useAuth();
  const searchParams = useSearchParams();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const canUseRemote = canUseOperativaSupabase(clubScopeId) && !!session?.access_token;
  const [revenue, setRevenue] = useState<TournamentRevenueConfig>(DEFAULT_REVENUE);
  const [savedAt, setSavedAt] = useState<string>("");
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted" | "local_error">("local");
  const [hydrated, setHydrated] = useState(false);
  const [clubIdentity, setClubIdentity] = useState<ClubIdentitySnapshot>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const tournamentId = useMemo(() => {
    const fromQuery = searchParams.get("tournamentId");
    return fromQuery || getActiveTournamentId(clubScopeId);
  }, [searchParams, clubScopeId]);

  const tournament = useMemo(
    () => loadTournamentIndex(clubScopeId).find((t) => t.id === tournamentId) ?? null,
    [clubScopeId, tournamentId],
  );
  const tournamentConfig = useMemo(
    () => loadTournamentConfigById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `synq_club_identity_v1_${clubScopeId}`;
    const parsed = safeJsonParse<unknown>(localStorage.getItem(key));
    if (!parsed || typeof parsed !== "object") {
      setClubIdentity({
        name: profile?.clubName || undefined,
      });
      return;
    }
    const row = parsed as Record<string, unknown>;
    setClubIdentity({
      name: typeof row.name === "string" && row.name.trim().length > 0 ? row.name.trim() : (profile?.clubName || undefined),
      logoUrl: typeof row.logoUrl === "string" && row.logoUrl.trim().length > 0 ? row.logoUrl.trim() : undefined,
    });
  }, [clubScopeId, profile?.clubName]);

  useEffect(() => {
    let cancelled = false;
    if (!tournamentId) return;

    const loadRevenue = async () => {
      const localParsed = safeJsonParse<TournamentRevenueConfig>(localStorage.getItem(tournamentRevenueKey(clubScopeId, tournamentId)));
      if (localParsed && typeof localParsed === "object" && !cancelled) {
        setRevenue({
          ticketing: {
            ...DEFAULT_REVENUE.ticketing,
            ...(localParsed.ticketing ?? {}),
          },
          spaces: {
            ...DEFAULT_REVENUE.spaces,
            ...(localParsed.spaces ?? {}),
          },
          sponsors: Array.isArray(localParsed.sponsors) ? localParsed.sponsors : [],
        });
      } else if (!cancelled) {
        setRevenue(DEFAULT_REVENUE);
      }

      if (!canUseRemote || !session?.access_token) {
        if (!cancelled) setSyncMode("local");
        return;
      }

      try {
        const res = await fetch(`/api/club/tournament-revenue?tournamentId=${encodeURIComponent(tournamentId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 403) {
          if (!cancelled) setSyncMode("restricted");
          return;
        }
        if (!res.ok) {
          if (!cancelled) setSyncMode("local_error");
          return;
        }
        const json = (await res.json()) as { payload?: TournamentRevenueConfig };
        if (json?.payload && !cancelled) {
          const remote = json.payload;
          const normalized: TournamentRevenueConfig = {
            ticketing: { ...DEFAULT_REVENUE.ticketing, ...(remote.ticketing ?? {}) },
            spaces: { ...DEFAULT_REVENUE.spaces, ...(remote.spaces ?? {}) },
            sponsors: Array.isArray(remote.sponsors) ? remote.sponsors : [],
          };
          setRevenue(normalized);
          localStorage.setItem(tournamentRevenueKey(clubScopeId, tournamentId), JSON.stringify(normalized));
        }
        if (!cancelled) setSyncMode("remote");
      } catch {
        if (!cancelled) setSyncMode("local_error");
      }
    };

    void loadRevenue();
    return () => {
      cancelled = true;
    };
  }, [canUseRemote, clubScopeId, session?.access_token, tournamentId]);

  useEffect(() => {
    if (!hydrated || !tournamentId) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(tournamentRevenueKey(clubScopeId, tournamentId), JSON.stringify(revenue));
        setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // ignore
      }

      if (!canUseRemote || !session?.access_token) {
        setSyncMode("local");
        return;
      }

      void (async () => {
        try {
          const res = await fetch("/api/club/tournament-revenue", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ tournamentId, payload: revenue }),
          });
          if (res.status === 403) {
            setSyncMode("restricted");
            return;
          }
          if (!res.ok) {
            setSyncMode("local_error");
            return;
          }
          setSyncMode("remote");
        } catch {
          setSyncMode("local_error");
        }
      })();
    }, 280);
    return () => window.clearTimeout(id);
  }, [canUseRemote, clubScopeId, hydrated, revenue, session?.access_token, tournamentId]);

  const estimatedPlayers = useMemo(() => {
    const teams = Math.max(0, Number(tournamentConfig?.teamsCount ?? 0) || 0);
    const ppt = Math.max(
      1,
      Number(tournamentConfig?.startersPerTeam ?? 0) + Number(tournamentConfig?.substitutesPerTeam ?? 0) || Number(tournamentConfig?.playersPerTeam ?? 0) || 1,
    );
    return teams * ppt;
  }, [tournamentConfig]);

  const estimatedCompanions = Math.round(estimatedPlayers * 1.5);
  const autoExpectedAdults = estimatedCompanions;

  useEffect(() => {
    setRevenue((prev) => {
      if (prev.ticketing.expectedAdults === autoExpectedAdults) return prev;
      return {
        ...prev,
        ticketing: {
          ...prev.ticketing,
          expectedAdults: autoExpectedAdults,
        },
      };
    });
  }, [autoExpectedAdults]);

  const ticketingEstimate = useMemo(() => {
    if (!revenue.ticketing.enabled) return 0;
    const adults = clampInt(autoExpectedAdults);
    const minors = revenue.ticketing.includeMinors ? clampInt(revenue.ticketing.expectedMinors) : 0;
    return adults * Math.max(0, num(revenue.ticketing.adultPrice)) + minors * Math.max(0, num(revenue.ticketing.minorPrice));
  }, [autoExpectedAdults, revenue.ticketing]);

  const spacesEstimate = useMemo(() => {
    const stands = revenue.spaces.standsEnabled
      ? clampInt(revenue.spaces.standsCount) * Math.max(0, num(revenue.spaces.standPrice))
      : 0;
    const cafeteria = revenue.spaces.cafeteriaEnabled ? Math.max(0, num(revenue.spaces.cafeteriaPrice)) : 0;
    return stands + cafeteria;
  }, [revenue.spaces]);

  const adsMicroappsEstimate = useMemo(
    () => revenue.sponsors.filter((s) => s.type === "microapp").reduce((acc, s) => acc + Math.max(0, num(s.amount)), 0),
    [revenue.sponsors],
  );
  const adsStaticEstimate = useMemo(
    () => revenue.sponsors.filter((s) => s.type === "static").reduce((acc, s) => acc + Math.max(0, num(s.amount)), 0),
    [revenue.sponsors],
  );
  const totalEstimate = ticketingEstimate + spacesEstimate + adsMicroappsEstimate + adsStaticEstimate;
  const tournamentLabel = tournament?.name ?? "Sin torneo seleccionado";
  const clubLabel = clubIdentity.name || profile?.clubName || "Club";

  const addSponsor = (type: RevenueSponsor["type"]) => {
    const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const label = type === "microapp" ? "Patrocinador MicroApp" : "Publicidad Estática";
    setRevenue((prev) => ({
      ...prev,
      sponsors: [...prev.sponsors, { id, name: label, type, amount: 0 }],
    }));
  };

  const removeSponsor = (id: string) => {
    setRevenue((prev) => ({
      ...prev,
      sponsors: prev.sponsors.filter((s) => s.id !== id),
    }));
  };

  const updateSponsor = (id: string, patch: Partial<RevenueSponsor>) => {
    setRevenue((prev) => ({
      ...prev,
      sponsors: prev.sponsors.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const onUploadSponsorAsset = (id: string, file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSponsor(id, { assetDataUrl: String(reader.result || "") });
    };
    reader.readAsDataURL(file);
  };

  const exportExcel = () => {
    if (!tournamentId) return;
    const wb = XLSX.utils.book_new();

    const resumenRows = [
      { campo: "Club", valor: clubLabel },
      { campo: "Torneo", valor: tournamentLabel },
      { campo: "Fecha exportación", valor: new Date().toLocaleString("es-ES") },
      { campo: "", valor: "" },
      { campo: "Jugadores esperados", valor: estimatedPlayers },
      { campo: "Acompañantes estimados (1.5x)", valor: estimatedCompanions },
      { campo: "Adultos esperados auto", valor: autoExpectedAdults },
      { campo: "Menores esperados", valor: revenue.ticketing.includeMinors ? revenue.ticketing.expectedMinors : 0 },
      { campo: "", valor: "" },
      { campo: "Ingresos entradas", valor: ticketingEstimate },
      { campo: "Ingresos espacios", valor: spacesEstimate },
      { campo: "Publicidad microapps", valor: adsMicroappsEstimate },
      { campo: "Publicidad estática", valor: adsStaticEstimate },
      { campo: "TOTAL estimado", valor: totalEstimate },
    ];
    const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

    const detalleSponsor = revenue.sponsors.map((s) => ({
      nombre: s.name,
      tipo: s.type === "microapp" ? "MicroApp" : "Estática",
      importe: Math.max(0, num(s.amount)),
      tieneImagen: s.assetDataUrl ? "Sí" : "No",
    }));
    const wsSponsors = XLSX.utils.json_to_sheet(
      detalleSponsor.length > 0 ? detalleSponsor : [{ nombre: "-", tipo: "-", importe: 0, tieneImagen: "No" }]
    );
    XLSX.utils.book_append_sheet(wb, wsSponsors, "Patrocinadores");

    const filename = `ingresos_${tournamentLabel.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  const exportPdf = async () => {
    if (!tournamentId) return;
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    let y = 14;

    if (clubIdentity.logoUrl && clubIdentity.logoUrl.startsWith("data:image/")) {
      try {
        const format = clubIdentity.logoUrl.includes("image/png") ? "PNG" : "JPEG";
        doc.addImage(clubIdentity.logoUrl, format, 14, 10, 18, 18);
      } catch {
        // Si falla la imagen, seguimos con texto.
      }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(clubLabel, 36, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(`Torneo: ${tournamentLabel}`, 36, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Fecha: ${new Date().toLocaleString("es-ES")}`, 36, y);
    y += 10;

    doc.setDrawColor(0, 242, 255);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Estadísticas de previsión", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const stats = [
      `Jugadores esperados: ${estimatedPlayers}`,
      `Acompañantes estimados (1.5x): ${estimatedCompanions}`,
      `Adultos esperados (auto): ${autoExpectedAdults}`,
      `Menores esperados: ${revenue.ticketing.includeMinors ? revenue.ticketing.expectedMinors : 0}`,
      `Ingresos entradas: ${toMoney(ticketingEstimate)}`,
      `Ingresos espacios: ${toMoney(spacesEstimate)}`,
      `Publicidad microapps: ${toMoney(adsMicroappsEstimate)}`,
      `Publicidad estática: ${toMoney(adsStaticEstimate)}`,
      `TOTAL estimado: ${toMoney(totalEstimate)}`,
    ];
    for (const line of stats) {
      doc.text(line, 14, y);
      y += 6;
    }

    y += 2;
    doc.setFont("helvetica", "bold");
    doc.text("Patrocinadores", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    if (revenue.sponsors.length === 0) {
      doc.text("Sin patrocinadores registrados.", 14, y);
    } else {
      revenue.sponsors.slice(0, 20).forEach((s, idx) => {
        if (y > 280) {
          doc.addPage();
          y = 16;
        }
        const row = `${idx + 1}. ${s.name} · ${s.type === "microapp" ? "MicroApp" : "Estática"} · ${toMoney(Math.max(0, num(s.amount)))}`;
        doc.text(row, 14, y);
        y += 5;
      });
    }

    const filename = `ingresos_${tournamentLabel.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] uppercase font-black tracking-[0.28em] text-primary/70">TORNEOS / PLANIFICADOR DE INGRESOS</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ingresos Torneo</h1>
        <p className="mt-2 text-sm text-white/70">
          Estimación completa por entradas, espacios comerciales y publicidad de patrocinadores (microapps + estática).
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] font-black text-primary/70">
          {tournament?.name ?? "Sin torneo seleccionado"} {savedAt ? `· Guardado ${savedAt}` : ""}{" "}
          · {syncMode === "remote" ? "Fuente: Servidor" : syncMode === "restricted" ? "Local (permiso servidor denegado)" : syncMode === "local_error" ? "Local (error de sincronización)" : "Fuente: Local"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              void exportPdf();
            }}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </button>
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/55">
            <Download className="h-3.5 w-3.5 text-primary/80" />
            Incluye club, torneo y estadísticas
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MiniKpi label="Ingresos entradas" value={toMoney(ticketingEstimate)} />
        <MiniKpi label="Espacios comerciales" value={toMoney(spacesEstimate)} />
        <MiniKpi label="Publicidad microapps" value={toMoney(adsMicroappsEstimate)} />
        <MiniKpi label="Publicidad estática" value={toMoney(adsStaticEstimate)} />
        <MiniKpi label="Total estimado" value={toMoney(totalEstimate)} highlight />
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <TicketPercent className="h-4 w-4" />
            Entradas familias
          </CardTitle>
          <CardDescription className="text-white/70">
            Incluye entrada de menores opcional y volumen esperado de asistentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          <Toggle
            label="Activar entradas"
            checked={revenue.ticketing.enabled}
            onChange={(v) => setRevenue((p) => ({ ...p, ticketing: { ...p.ticketing, enabled: v } }))}
          />
          <Toggle
            label="Cobro menores"
            checked={revenue.ticketing.includeMinors}
            onChange={(v) => setRevenue((p) => ({ ...p, ticketing: { ...p.ticketing, includeMinors: v } }))}
          />
          <MoneyInput
            label="Precio adulto (€)"
            value={revenue.ticketing.adultPrice}
            onChange={(v) => setRevenue((p) => ({ ...p, ticketing: { ...p.ticketing, adultPrice: v } }))}
          />
          <MoneyInput
            label="Precio menor (€)"
            value={revenue.ticketing.minorPrice}
            disabled={!revenue.ticketing.includeMinors}
            onChange={(v) => setRevenue((p) => ({ ...p, ticketing: { ...p.ticketing, minorPrice: v } }))}
          />
          <NumberInput
            label="Adultos esperados (auto)"
            value={autoExpectedAdults}
            disabled
            onChange={() => {
              // Campo automático: acompaña la previsión de acompañantes (1.5 x jugador).
            }}
          />
          <NumberInput
            label="Menores esperados"
            value={revenue.ticketing.expectedMinors}
            disabled={!revenue.ticketing.includeMinors}
            onChange={(v) => setRevenue((p) => ({ ...p, ticketing: { ...p.ticketing, expectedMinors: v } }))}
          />

          <div className="lg:col-span-6 rounded-xl border border-primary/20 bg-[#0F172A]/45 px-3 py-2">
            <p className="text-[10px] uppercase font-black tracking-[0.16em] text-primary/70">
              Referencia automática (config torneo): {estimatedPlayers} jugadores · {estimatedCompanions} acompañantes estimados (1.5 x jugador)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <BadgeEuro className="h-4 w-4" />
            Espacios comerciales del evento
          </CardTitle>
          <CardDescription className="text-white/70">
            Gestión de stands para patrocinadores y cafetería del club.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          <Toggle
            label="Habilitar stands"
            checked={revenue.spaces.standsEnabled}
            onChange={(v) => setRevenue((p) => ({ ...p, spaces: { ...p.spaces, standsEnabled: v } }))}
          />
          <NumberInput
            label="Nº stands"
            disabled={!revenue.spaces.standsEnabled}
            value={revenue.spaces.standsCount}
            onChange={(v) => setRevenue((p) => ({ ...p, spaces: { ...p.spaces, standsCount: v } }))}
          />
          <MoneyInput
            label="Precio por stand (€)"
            disabled={!revenue.spaces.standsEnabled}
            value={revenue.spaces.standPrice}
            onChange={(v) => setRevenue((p) => ({ ...p, spaces: { ...p.spaces, standPrice: v } }))}
          />
          <Toggle
            label="Cafetería club"
            checked={revenue.spaces.cafeteriaEnabled}
            onChange={(v) => setRevenue((p) => ({ ...p, spaces: { ...p.spaces, cafeteriaEnabled: v } }))}
          />
          <MoneyInput
            label="Alquiler cafetería (€)"
            disabled={!revenue.spaces.cafeteriaEnabled}
            value={revenue.spaces.cafeteriaPrice}
            onChange={(v) => setRevenue((p) => ({ ...p, spaces: { ...p.spaces, cafeteriaPrice: v } }))}
          />
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Publicidad y patrocinadores
          </CardTitle>
          <CardDescription className="text-white/70">
            Configura campañas para microapps del torneo y publicidad estática. Permite subir imagen/logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => addSponsor("microapp")}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir sponsor microapp
            </button>
            <button
              type="button"
              onClick={() => addSponsor("static")}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
            >
              <Plus className="h-3.5 w-3.5" />
              Añadir publicidad estática
            </button>
          </div>

          {revenue.sponsors.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-[11px] text-white/65">
              Aún no hay patrocinadores cargados para este torneo.
            </div>
          ) : null}

          {revenue.sponsors.map((sponsor) => (
            <div key={sponsor.id} className="rounded-xl border border-primary/20 bg-[#0F172A]/45 p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-4">
                  <label className="block text-[9px] font-black uppercase tracking-[0.16em] text-primary/70 mb-1">Nombre</label>
                  <input
                    value={sponsor.name}
                    onChange={(e) => updateSponsor(sponsor.id, { name: e.target.value })}
                    className="h-10 w-full rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.16em] text-primary/70 mb-1">Tipo</label>
                  <div className="h-10 rounded-lg border border-primary/25 bg-black/25 px-3 grid place-items-center text-[10px] font-black uppercase text-primary/85">
                    {sponsor.type === "microapp" ? "MicroApp" : "Estática"}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <MoneyInput
                    label="Importe (€)"
                    value={sponsor.amount}
                    onChange={(v) => updateSponsor(sponsor.id, { amount: v })}
                  />
                </div>
                <div className="lg:col-span-3">
                  <label className="block text-[9px] font-black uppercase tracking-[0.16em] text-primary/70 mb-1">Imagen sponsor</label>
                  <div className="h-10 flex items-center gap-2">
                    <input
                      ref={(el) => {
                        fileRefs.current[sponsor.id] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onUploadSponsorAsset(sponsor.id, e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => fileRefs.current[sponsor.id]?.click()}
                      className="h-10 px-3 rounded-lg border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.14em]"
                    >
                      Subir imagen
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-1 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeSponsor(sponsor.id)}
                    className="h-10 w-10 rounded-lg border border-red-500/25 bg-red-500/10 text-red-300 grid place-items-center"
                    title="Eliminar patrocinador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {sponsor.assetDataUrl ? (
                <div className="mt-2 flex items-center gap-3">
                  <img src={sponsor.assetDataUrl} alt={`Asset ${sponsor.name}`} className="h-16 w-24 rounded-lg object-cover border border-white/10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/65">
                    Asset listo para publicarse en microapps/soportes estáticos
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Nota de modelo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/75">
          Esta sección calcula la previsión económica por torneo y deja preparados los activos de patrocinio para integrarlos en las microapps del torneo.
        </CardContent>
      </Card>
    </div>
  );
}

function MiniKpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        highlight ? "border-primary/35 bg-primary/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className={`mt-1 text-[12px] font-black ${highlight ? "text-primary" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="rounded-xl border border-primary/20 bg-[#0F172A]/45 px-3 py-2 flex items-center justify-between gap-2">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/75">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`h-7 min-w-16 px-2 rounded-lg border text-[9px] font-black uppercase tracking-[0.14em] ${
          checked ? "border-primary/30 bg-primary/15 text-primary" : "border-white/10 bg-white/[0.04] text-white/65"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="rounded-xl border border-primary/20 bg-[#0F172A]/45 px-3 py-2 block">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/75">{label}</span>
      <input
        type="number"
        min={0}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(clampInt(num(e.target.value)))}
        className="mt-1 h-9 w-full rounded-lg border border-primary/20 bg-black/25 px-2 text-sm text-white outline-none disabled:opacity-50"
      />
    </label>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="rounded-xl border border-primary/20 bg-[#0F172A]/45 px-3 py-2 block">
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/75">{label}</span>
      <input
        type="number"
        min={0}
        step="0.01"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Math.max(0, num(e.target.value)))}
        className="mt-1 h-9 w-full rounded-lg border border-primary/20 bg-black/25 px-2 text-sm text-white outline-none disabled:opacity-50"
      />
    </label>
  );
}
