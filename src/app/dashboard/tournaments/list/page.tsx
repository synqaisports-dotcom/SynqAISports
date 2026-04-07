"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarRange, Copy, FileText, ListOrdered, Pencil, QrCode, Search, Swords, TicketPercent, Trophy, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import {
  ensureTournamentId,
  getActiveTournamentId,
  loadTournamentIndex,
  migrateLegacySingleTournamentIfNeeded,
  loadTournamentConfigById,
  loadTournamentTeamsById,
  deleteTournamentById,
  applyTournamentAutoStatuses,
  isTournamentDeletableWithGrace,
  saveTournamentIndex,
  saveTournamentConfigById,
  setActiveTournamentId,
  type TournamentIndexItem,
} from "@/lib/tournaments-storage";

const PARENTS_TOURNAMENTS_PATH = "/tournaments/parents";

// Clase para la tarjeta de torneo (SynqAI style)
const tournamentCardClass = `
  relative overflow-hidden bg-[#0F172A]/60 backdrop-blur-md
  border border-white/5 hover:border-[#00F2FF]/40
  p-6 rounded-xl transition-all duration-300 group
  before:absolute before:left-0 before:top-0 before:h-full before:w-1
  before:bg-[#00F2FF] before:opacity-0 hover:before:opacity-100
`;

// Estilo para los bloques de datos (Fechas, Equipos...)
const dataBlockClass = `
  flex flex-col gap-1 px-4 border-r border-white/5 last:border-none
`;

const labelClass = `text-[10px] uppercase tracking-widest text-[#00F2FF]/60 font-bold`;
const valueClass = `text-sm text-white font-medium`;

type ClubIdentitySnapshot = {
  name?: string;
  country?: string;
  sport?: string;
  address?: string;
  mapQuery?: string;
  website?: string;
  logoUrl?: string;
};

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-ES");
}

function formatFootball(value?: TournamentIndexItem["footballFormat"]): string {
  if (!value) return "-";
  return value === "f11" ? "F11" : value === "f7" ? "F7" : "FUTSAL";
}

function imageFormatFromDataUrl(dataUrl: string): "PNG" | "JPEG" {
  const m = /^data:image\/([a-zA-Z0-9+.-]+);base64,/.exec(dataUrl);
  const mime = String(m?.[1] ?? "").toLowerCase();
  if (mime.includes("jpeg") || mime.includes("jpg") || mime.includes("webp")) return "JPEG";
  return "PNG";
}

function formatStatusLabel(status: TournamentIndexItem["status"]): string {
  if (status === "published") return "Activo";
  if (status === "finished") return "Finalizado";
  return "Pendiente";
}

function buildCoachTeamUrl(args: { clubId: string; tournamentId: string; teamId: string }) {
  const qs = new URLSearchParams({
    clubId: args.clubId,
    tournamentId: args.tournamentId,
    teamId: args.teamId,
  });
  return `/tournaments/coach-team?${qs.toString()}`;
}

async function loadImageAsDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer imagen"));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function statusBadgeClass(status: TournamentIndexItem["status"]): string {
  // Pendiente: ámbar, Activo: verde, Finalizado: rojo
  if (status === "published") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  if (status === "finished") return "border-red-500/25 bg-red-500/10 text-red-200";
  return "border-amber-500/25 bg-amber-500/10 text-amber-200";
}

type TournamentListItem = {
  record: TournamentIndexItem;
  startDate?: string;
  endDate?: string;
  category: string;
  footballFormat?: TournamentIndexItem["footballFormat"];
  configuredTeams: number;
  loadedTeams: number;
  year: string;
};

function Segmented({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
}) {
  return (
    <div className="min-h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-2 py-1 flex items-center gap-1">
      <span className="hidden lg:inline text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200/70 px-1.5">
        {label}
      </span>
      <div className="flex-1 flex items-center gap-1 overflow-x-auto overscroll-x-contain pr-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`shrink-0 whitespace-nowrap h-8 px-2.5 rounded-lg border text-[9px] font-black uppercase tracking-[0.14em] transition-[background-color,border-color,color,opacity,transform] ${
                active
                  ? "border-cyan-500/35 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 bg-white/[0.03] text-white/65 hover:text-white/80 hover:bg-white/[0.05]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PrettySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
}) {
  const current = options.find((o) => o.value === value)?.label ?? "—";
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-full rounded-xl border border-white/5 bg-[#0F172A]/35 px-3 text-left text-white/90 hover:border-[#00F2FF]/30 hover:bg-[#0F172A]/45 focus:ring-0 focus:ring-offset-0 transition-[background-color,border-color,color,opacity,transform]">
        <div className="min-w-0 flex flex-col items-start leading-none">
          <span className={labelClass}>{label}</span>
          <span className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-white truncate">
            {current}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#0a0f18] border-[#00F2FF]/20 text-white rounded-2xl shadow-2xl p-1">
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="rounded-xl focus:bg-[#00F2FF]/10 focus:text-[#00F2FF] data-[state=checked]:bg-[#00F2FF]/10"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">{opt.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [tournaments, setTournaments] = useState<TournamentIndexItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [qrTarget, setQrTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeTournamentId, setActiveTournamentIdState] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TournamentIndexItem["status"]>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | "f11" | "f7" | "futsal">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [exportingTournamentId, setExportingTournamentId] = useState<string | null>(null);

  useEffect(() => {
    migrateLegacySingleTournamentIfNeeded({
      clubId: clubScopeId,
      legacyPlannerKey: `synq_tournaments_planner_v1_${clubScopeId}`,
      legacyTeamsKey: `synq_tournaments_teams_v1_${clubScopeId}`,
    });
    const list = loadTournamentIndex(clubScopeId);
    setTournaments(list);
    setActiveTournamentIdState(getActiveTournamentId(clubScopeId));

    // Auto-estado por fechas (hora local): published mientras esté “activo”, finished después.
    // Reconciliamos al montar y luego cada 60s para cubrir cambios de día.
    const tick = () => {
      try {
        const { changed } = applyTournamentAutoStatuses({ clubId: clubScopeId });
        if (changed) setTournaments(loadTournamentIndex(clubScopeId));
        // Mantener botón de activación sincronizado si el active cambia fuera (raro pero posible).
        setActiveTournamentIdState(getActiveTournamentId(clubScopeId));
      } catch {
        // ignore
      }
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [clubScopeId]);

  const listItems = useMemo<TournamentListItem[]>(() => {
    return tournaments
      .map((t) => {
        const cfg = loadTournamentConfigById(clubScopeId, t.id);
        const teams = loadTournamentTeamsById(clubScopeId, t.id);
        const loadedTeams = Array.isArray(teams)
          ? teams.filter((x) => x && typeof x === "object" && String((x as { name?: unknown }).name ?? "").trim().length > 0).length
          : 0;
        const startDate = cfg?.startDate;
        const year = startDate?.slice(0, 4) || t.createdAt.slice(0, 4) || "-";
        const category = (cfg?.categoryLabel || cfg?.categories?.[0] || t.primaryCategory || "-").toString();
        return {
          record: t,
          startDate,
          endDate: cfg?.endDate,
          category,
          footballFormat: cfg?.footballFormat || t.footballFormat,
          configuredTeams: Number(cfg?.teamsCount || 0),
          loadedTeams,
          year,
        };
      })
      .sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt));
  }, [clubScopeId, tournaments]);

  const categories = useMemo(() => {
    return Array.from(new Set(listItems.map((x) => x.category).filter((x) => x && x !== "-"))).sort();
  }, [listItems]);

  const years = useMemo(() => {
    return Array.from(new Set(listItems.map((x) => x.year).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  }, [listItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listItems.filter((x) => {
      if (statusFilter !== "all" && x.record.status !== statusFilter) return false;
      if (formatFilter !== "all" && x.footballFormat !== formatFilter) return false;
      if (categoryFilter !== "all" && x.category !== categoryFilter) return false;
      if (yearFilter !== "all" && x.year !== yearFilter) return false;
      if (!q) return true;
      const haystack = `${x.record.name} ${x.category} ${formatFootball(x.footballFormat)}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [categoryFilter, formatFilter, listItems, query, statusFilter, yearFilter]);

  const qrUrl = useMemo(() => {
    if (!qrTarget) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams();
    params.set("clubId", clubScopeId);
    params.set("tournamentId", qrTarget.id);
    return `${origin}${PARENTS_TOURNAMENTS_PATH}?${params.toString()}`;
  }, [clubScopeId, qrTarget]);

  const exportInvitationDossier = async (tournamentId: string) => {
    try {
      setExportingTournamentId(tournamentId);
      const t = loadTournamentIndex(clubScopeId).find((x) => x.id === tournamentId);
      if (!t) return;
      const cfg = loadTournamentConfigById(clubScopeId, tournamentId);
      const teams = loadTournamentTeamsById(clubScopeId, tournamentId);
      const validTeams = Array.isArray(teams)
        ? teams.filter((row) => row && typeof row === "object" && String((row as { name?: unknown }).name ?? "").trim().length > 0)
        : [];

      const identityRaw = localStorage.getItem(`synq_club_identity_v1_${clubScopeId}`);
      const identity = (safeJsonParse<ClubIdentitySnapshot>(identityRaw) ?? {}) as ClubIdentitySnapshot;
      const clubName = String(identity.name || profile?.clubName || clubScopeId || "Club");
      const mapQuery = String(identity.mapQuery || identity.address || "Madrid, España").trim();
      const mapUrlGoogle = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
        mapQuery
      )}&zoom=14&size=1200x600&maptype=roadmap&markers=color:cyan|${encodeURIComponent(mapQuery)}`;
      const mapUrlFallback = `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(
        mapQuery
      )}&zoom=14&size=1200x600&markers=${encodeURIComponent(mapQuery)},lightblue1`;
      const logoDataUrl = identity.logoUrl ? await loadImageAsDataUrl(identity.logoUrl) : null;
      const mapDataUrl = (await loadImageAsDataUrl(mapUrlGoogle)) ?? (await loadImageAsDataUrl(mapUrlFallback));

      const slotsConfigured = Math.max(0, Number(cfg?.groupsCount ?? 0) * Number(cfg?.teamsPerGroup ?? 0));
      const playersPerTeam = Math.max(
        1,
        Number(cfg?.startersPerTeam ?? 0) + Number(cfg?.substitutesPerTeam ?? 0) || Number(cfg?.playersPerTeam ?? 0) || 1
      );
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const parentsLink = `${origin}${PARENTS_TOURNAMENTS_PATH}?${new URLSearchParams({
        clubId: clubScopeId,
        tournamentId,
      }).toString()}`;

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      let y = 14;

      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, imageFormatFromDataUrl(logoDataUrl), 14, y, 18, 18);
        } catch {
          doc.setDrawColor(0, 242, 255);
          doc.rect(14, y, 18, 18);
        }
      } else {
        doc.setDrawColor(0, 242, 255);
        doc.rect(14, y, 18, 18);
      }

      doc.setTextColor(0, 242, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("DOSSIER DE INVITACIÓN · TORNEO", 36, y + 5);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(String(cfg?.tournamentName || t.name || "Torneo"), 36, y + 13);
      doc.setFontSize(10);
      doc.setTextColor(180, 190, 200);
      doc.text(
        `${clubName} · ${identity.country || "España"} · ${identity.sport || "Fútbol"} · ${new Date().toLocaleDateString("es-ES")}`,
        36,
        y + 19
      );

      y += 26;
      doc.setDrawColor(0, 242, 255);
      doc.setFillColor(8, 16, 28);
      doc.roundedRect(14, y, pageW - 28, 24, 2, 2, "FD");
      doc.setTextColor(0, 242, 255);
      doc.setFontSize(9);
      doc.text("RESUMEN OPERATIVO", 18, y + 6);
      doc.setTextColor(230, 235, 240);
      doc.setFontSize(10);
      doc.text(`Fechas: ${formatDate(cfg?.startDate)} - ${formatDate(cfg?.endDate)}`, 18, y + 12);
      doc.text(`Formato: ${formatFootball(cfg?.footballFormat)} · Categoría: ${String(cfg?.categoryLabel || cfg?.categories?.[0] || "-")}`, 18, y + 17);
      doc.text(`Plazas equipos: ${slotsConfigured} · Equipos cargados: ${validTeams.length} · Jugadores/equipo (cfg): ${playersPerTeam}`, 18, y + 22);
      y += 30;

      doc.setTextColor(0, 242, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("LOCALIZACIÓN DEL EVENTO", 14, y);
      y += 2;
      if (mapDataUrl) {
        try {
          doc.addImage(mapDataUrl, imageFormatFromDataUrl(mapDataUrl), 14, y + 2, pageW - 28, 44);
          y += 50;
        } catch {
          doc.setTextColor(220, 225, 235);
          doc.setFont("helvetica", "normal");
          doc.text(`Mapa no disponible automáticamente. Referencia: ${mapQuery}`, 14, y + 8);
          y += 14;
        }
      } else {
        doc.setTextColor(220, 225, 235);
        doc.setFont("helvetica", "normal");
        doc.text(`Mapa no disponible automáticamente. Referencia: ${mapQuery}`, 14, y + 8);
        y += 14;
      }

      doc.setTextColor(0, 242, 255);
      doc.setFont("helvetica", "bold");
      doc.text("INSCRIPCIÓN Y AUTOMATIZACIÓN", 14, y);
      y += 6;
      doc.setTextColor(235, 240, 245);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const textLines = doc.splitTextToSize(
        "Invitación digital preparada: los clubes pueden preinscribirse por enlace y cada equipo tendrá su acceso QR para cargar plantilla de jugadores. Usa el enlace de padres para difusión y los enlaces por equipo para staff.",
        pageW - 28
      );
      doc.text(textLines, 14, y);
      y += textLines.length * 4 + 2;
      doc.setTextColor(120, 230, 255);
      doc.text(`Enlace torneo (padres/inscripción): ${parentsLink}`, 14, y);
      y += 8;

      doc.setTextColor(0, 242, 255);
      doc.setFont("helvetica", "bold");
      doc.text("SLOTS DE EQUIPOS Y ENLACES QR DE STAFF", 14, y);
      y += 5;

      const rows = Math.max(slotsConfigured, validTeams.length);
      for (let i = 0; i < rows; i++) {
        if (y > pageH - 16) {
          doc.addPage();
          y = 16;
        }
        const team = validTeams[i] as Record<string, unknown> | undefined;
        const teamId = String(team?.id ?? `slot_${i + 1}`);
        const teamName = String(team?.name ?? `Slot ${i + 1} (disponible)`).trim();
        const coachUrl = `${origin}${buildCoachTeamUrl({ clubId: clubScopeId, tournamentId, teamId })}`;
        doc.setTextColor(235, 240, 245);
        doc.setFont("helvetica", "bold");
        doc.text(`${String(i + 1).padStart(2, "0")}. ${teamName}`, 14, y);
        y += 4;
        doc.setTextColor(120, 230, 255);
        doc.setFont("helvetica", "normal");
        const line = doc.splitTextToSize(`QR/Staff: ${coachUrl}`, pageW - 28);
        doc.text(line, 14, y);
        y += line.length * 3.8 + 1;
      }

      const filenameBase = String(cfg?.tournamentName || t.name || "torneo")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
      doc.save(`dossier-invitacion-${filenameBase || "torneo"}.pdf`);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.alert("No se pudo generar el dossier. Revisa consola para más detalle.");
      }
      // eslint-disable-next-line no-console
      console.error("Error generando dossier de invitación", err);
    } finally {
      setExportingTournamentId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Torneos</h1>
        <p className="mt-2 text-xs text-white/65">
          Roadmap C por fases: F1 Historial y filtros · F2 Clasificación + cruces · F3 Analítica y exportables.
        </p>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => (open ? null : setDeleteTarget(null))}>
        <AlertDialogContent className="border border-[#00F2FF]/20 bg-[#0a0f18]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-wide">
              Borrar torneo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {deleteTarget ? (
                <>
                  ¿Borrar el torneo{" "}
                  <span className="text-white font-black">{deleteTarget.name}</span>? Se eliminarán equipos y resultados.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel className="h-10 rounded-xl border border-white/10 bg-black/30 text-white/80 hover:bg-white/[0.05] hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-xl border border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/15"
              onClick={() => {
                if (!deleteTarget) return;
                const res = deleteTournamentById({ clubId: clubScopeId, tournamentId: deleteTarget.id });
                if (res.nextActiveId) setActiveTournamentId(clubScopeId, res.nextActiveId);
                setTournaments(loadTournamentIndex(clubScopeId));
                setDeleteTarget(null);
              }}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!qrTarget} onOpenChange={(open) => (open ? null : setQrTarget(null))}>
        <AlertDialogContent className="border border-[#00F2FF]/20 bg-[#0a0f18]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-wide flex items-center gap-2">
              <QrCode className="h-4 w-4 text-[#00F2FF]" />
              QR · App Padres (Torneos)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {qrTarget ? (
                <>
                  Enlace del torneo{" "}
                  <span className="text-white font-black">{qrTarget.name}</span> para la futura micro‑app de padres.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4 flex items-center justify-center">
              {qrUrl ? (
                <div className="rounded-xl border border-[#00F2FF]/20 bg-[#0F172A]/60 p-3">
                  <QRCodeCanvas value={qrUrl} size={168} bgColor="#0A0F18" fgColor="#00F2FF" includeMargin />
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className={labelClass}>URL</p>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-[12px] font-black text-white break-all">{qrUrl || "—"}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <AlertDialogCancel className="h-10 rounded-xl border border-white/10 bg-black/30 text-white/80 hover:bg-white/[0.05] hover:text-white">
                  Cerrar
                </AlertDialogCancel>
                <AlertDialogAction
                  className="h-10 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] hover:bg-[#00F2FF]/15"
                  onClick={() => {
                    if (!qrUrl) return;
                    try {
                      navigator.clipboard.writeText(qrUrl);
                    } catch {
                      // ignore
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar enlace
                </AlertDialogAction>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-4">
        <Card className="glass-panel border border-cyan-500/20 bg-black/30 rounded-2xl">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white font-black uppercase tracking-wider">Torneos</CardTitle>
              <CardDescription>Histórico del club. Cada torneo es independiente.</CardDescription>
            </div>
            <button
              type="button"
              onClick={() => {
                const id = ensureTournamentId();
                const now = new Date().toISOString();
                const next: TournamentIndexItem = {
                  id,
                  name: `Nuevo torneo ${tournaments.length + 1}`,
                  status: "draft",
                  createdAt: now,
                  updatedAt: now,
                };
                try {
                  const merged = [...tournaments, next];
                  saveTournamentIndex(clubScopeId, merged);
                  saveTournamentConfigById(clubScopeId, id, {
                    tournamentName: next.name,
                    categoryLabel: "Alevín",
                    categories: [],
                    teamsCount: 8,
                    tournamentDays: 1,
                    startDate: new Date().toISOString().slice(0, 10),
                    endDate: new Date().toISOString().slice(0, 10),
                    groupsCount: 2,
                    teamsPerGroup: 4,
                    timeWindow: "both",
                    fieldsCount: 2,
                    scheduleStart: "09:00",
                    scheduleMode: "normal",
                    footballFormat: "f11",
                    morningStart: "09:00",
                    morningEnd: "14:00",
                    afternoonStart: "16:00",
                    afternoonEnd: "21:00",
                    halvesCount: 2,
                    minutesPerHalf: 20,
                    breakMinutes: 0,
                    bufferBetweenMatches: 10,
                    pointsWin: 3,
                    pointsDraw: 1,
                    pointsLoss: 0,
                  });
                  setTournaments(merged);
                  setActiveTournamentId(clubScopeId, id);
                } catch {
                  // ignore
                }
              }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
            >
              + Nuevo torneo
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tournaments.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-black/20 p-6 text-center text-white/70">
                No hay torneos guardados todavía. Crea el primero desde aquí.
              </div>
            ) : null}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <label className="lg:col-span-2 h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-300/80" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar torneo..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                  />
                </label>
                <div className="lg:col-span-3">
                  <PrettySelect
                    label="Estado"
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v as typeof statusFilter)}
                    options={[
                      { value: "all", label: "Todos" },
                      { value: "draft", label: "Pendiente" },
                      { value: "published", label: "Activo" },
                      { value: "finished", label: "Finalizado" },
                    ]}
                  />
                </div>
                <div className="lg:col-span-3">
                  <PrettySelect
                    label="Formato"
                    value={formatFilter}
                    onChange={(v) => setFormatFilter(v as typeof formatFilter)}
                    options={[
                      { value: "all", label: "Todos" },
                      { value: "f11", label: "F11" },
                      { value: "f7", label: "F7" },
                      { value: "futsal", label: "Futsal" },
                    ]}
                  />
                </div>
                <div className="lg:col-span-4">
                  <PrettySelect
                    label="Año"
                    value={yearFilter}
                    onChange={(v) => setYearFilter(v)}
                    options={[{ value: "all", label: "Todos" }, ...years.map((y) => ({ value: y, label: y }))]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-6">
                  <PrettySelect
                    label="Categoría"
                    value={categoryFilter}
                    onChange={(v) => setCategoryFilter(v)}
                    options={[{ value: "all", label: "Todas" }, ...categories.map((c) => ({ value: c, label: c }))]}
                  />
                </div>
                <div className="lg:col-span-6 min-h-10 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200/85">
                  <span>Total torneos visibles</span>
                  <span>{filtered.length}</span>
                </div>
              </div>

              {filtered.map((item) => {
                const t = item.record;
                const statusLabel = t.status === "published" ? "Activo" : t.status === "finished" ? "Finalizado" : "Pendiente";
                const isActive = activeTournamentId === t.id;
                const canDelete = isTournamentDeletableWithGrace({
                  config: loadTournamentConfigById(clubScopeId, t.id),
                  graceHours: 24,
                });
                return (
                  <div key={t.id} className={tournamentCardClass}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 text-[12px] font-black text-white uppercase tracking-wide truncate">
                            {t.name}
                          </p>
                          <span
                            className={`shrink-0 text-[10px] font-black uppercase tracking-[0.18em] px-2 py-1 rounded-lg border ${statusBadgeClass(
                              t.status
                            )}`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(0,242,255,0.08)] py-3">
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Fechas</p>
                            <p className={valueClass}>
                              {formatDate(item.startDate)} - {formatDate(item.endDate)}
                            </p>
                          </div>
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Categoría</p>
                            <p className={valueClass}>{item.category}</p>
                          </div>
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Formato</p>
                            <p className={valueClass}>{formatFootball(item.footballFormat)}</p>
                          </div>
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Equipos cfg</p>
                            <p className={valueClass}>{String(item.configuredTeams || "-")}</p>
                          </div>
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Equipos cargados</p>
                            <p className={valueClass}>{String(item.loadedTeams)}</p>
                          </div>
                          <div className={dataBlockClass}>
                            <p className={labelClass}>Año</p>
                            <p className={valueClass}>{item.year}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTournamentId(clubScopeId, t.id);
                            setActiveTournamentIdState(t.id);
                          }}
                          className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-[background-color,border-color,color,opacity,transform] ${statusBadgeClass(
                            t.status
                          )} ${isActive ? "opacity-100" : "opacity-45 hover:opacity-100"}`}
                          title={isActive ? "Torneo activo" : "Activar torneo"}
                        >
                          <Trophy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setQrTarget({ id: t.id, name: t.name })}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="QR App Padres"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!canDelete) return;
                            setDeleteTarget({ id: t.id, name: t.name });
                          }}
                          disabled={!canDelete}
                          className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border bg-black/20 transition-[background-color,border-color,color,opacity,transform] ${
                            canDelete
                              ? "border-white/10 text-white/70 hover:text-red-300 hover:border-red-500/25 hover:bg-red-500/10"
                              : "border-white/5 text-white/25 cursor-not-allowed opacity-50"
                          }`}
                          title={canDelete ? "Borrar torneo" : "No se puede borrar un torneo finalizado"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/dashboard/tournaments/planner?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Modificar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/teams?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Asignar equipos"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/classification?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Ver clasificación"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/bracket?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Ver cruces"
                        >
                          <Swords className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/analytics?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Analítica"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/revenue?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform]"
                          title="Ingresos"
                        >
                          <TicketPercent className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            void exportInvitationDossier(t.id);
                          }}
                          disabled={exportingTournamentId === t.id}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-[#00F2FF]/20 bg-black/20 text-[#00F2FF] hover:bg-[#00F2FF]/10 transition-[background-color,border-color,color,opacity,transform] disabled:opacity-50"
                          title="Acciones: generar dossier invitación"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-cyan-500/20 bg-black/25 p-4 text-sm text-white/65">
                  No hay torneos para los filtros actuales.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}

function Mini(props: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  const Icon = props.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55 flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 text-primary/80" /> : null}
        {props.label}
      </p>
      <p className="mt-1 text-[11px] font-black text-white">{props.value}</p>
    </div>
  );
}
