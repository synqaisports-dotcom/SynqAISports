"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Plus, QrCode, ShieldCheck, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getActiveTournamentId,
  loadTournamentConfigById,
  loadTournamentIndex,
  loadTournamentTeamsById,
  safeJsonParse,
  saveTournamentTeamsById,
} from "@/lib/tournaments-storage";

type RegistrationStatus =
  | "draft"
  | "preinscrito"
  | "pendiente_validacion"
  | "aprobado"
  | "waitlist"
  | "rechazado"
  | "completo";

type RegistrationTeam = {
  id: string;
  teamName: string;
  category: string;
  expectedPlayers: number;
  status: "incompleto" | "completo" | "verificado";
};

type TournamentRegistration = {
  id: string;
  tournamentId: string;
  clubName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  controlComment?: string;
  statusHistory?: Array<{
    at: string;
    from: RegistrationStatus;
    to: RegistrationStatus;
    by?: string;
    comment?: string;
  }>;
  status: RegistrationStatus;
  createdAt: string;
  updatedAt: string;
  teams: RegistrationTeam[];
};

type RegistrationsPayload = {
  registrations: TournamentRegistration[];
};

type RegistrationIssue = {
  code: "missing_contact" | "missing_team_name" | "duplicate_team_in_club" | "capacity_exceeded";
  level: "warning" | "error";
  message: string;
};

const DEFAULT_PAYLOAD: RegistrationsPayload = { registrations: [] };
const synqInputClass =
  "h-10 rounded-lg border border-[#00F2FF]/25 bg-[#0A1322]/80 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#00F2FF]/55 focus:ring-2 focus:ring-[#00F2FF]/20 transition-[background-color,border-color,color,opacity,transform]";
const synqSelectClass =
  "h-10 rounded-lg border border-[#00F2FF]/25 bg-[#0A1322]/85 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white appearance-none outline-none focus:border-[#00F2FF]/55 focus:ring-2 focus:ring-[#00F2FF]/20 transition-[background-color,border-color,color,opacity,transform]";

function registrationsLocalKey(clubId: string, tournamentId: string) {
  return `synq_tournament_registrations_v1_${clubId}_${tournamentId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function statusClass(status: RegistrationStatus) {
  if (status === "aprobado" || status === "completo") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-200";
  if (status === "rechazado") return "border-rose-500/25 bg-rose-500/10 text-rose-200";
  if (status === "waitlist") return "border-amber-500/25 bg-amber-500/10 text-amber-200";
  return "border-cyan-500/25 bg-cyan-500/10 text-cyan-200";
}

function toPayload(raw: unknown): RegistrationsPayload {
  if (!raw || typeof raw !== "object") return DEFAULT_PAYLOAD;
  const reg = Array.isArray((raw as { registrations?: unknown }).registrations)
    ? ((raw as { registrations: unknown[] }).registrations as unknown[])
    : [];
  const normalized = reg
    .map((r) => {
      if (!r || typeof r !== "object") return null;
      const x = r as Record<string, unknown>;
      const teamsRaw = Array.isArray(x.teams) ? x.teams : [];
      const teams = teamsRaw
        .map((t) => {
          if (!t || typeof t !== "object") return null;
          const y = t as Record<string, unknown>;
          const id = String(y.id ?? "").trim();
          const teamName = String(y.teamName ?? "").trim();
          if (!id || !teamName) return null;
          return {
            id,
            teamName,
            category: String(y.category ?? "").trim() || "-",
            expectedPlayers: Math.max(0, Number(y.expectedPlayers ?? 0) || 0),
            status: (String(y.status ?? "incompleto") as RegistrationTeam["status"]),
          } satisfies RegistrationTeam;
        })
        .filter((x): x is RegistrationTeam => x !== null);

      const id = String(x.id ?? "").trim();
      const tournamentId = String(x.tournamentId ?? "").trim();
      const clubName = String(x.clubName ?? "").trim();
      if (!id || !tournamentId || !clubName) return null;
      return {
        id,
        tournamentId,
        clubName,
        contactName: String(x.contactName ?? "").trim(),
        contactEmail: String(x.contactEmail ?? "").trim(),
        contactPhone: String(x.contactPhone ?? "").trim(),
        notes: String(x.notes ?? "").trim(),
        controlComment: String(x.controlComment ?? "").trim(),
        statusHistory: Array.isArray(x.statusHistory)
          ? (x.statusHistory as Array<Record<string, unknown>>)
              .map((h) => {
                const at = String(h.at ?? "").trim() || nowIso();
                const from = String(h.from ?? "draft").trim() as RegistrationStatus;
                const to = String(h.to ?? "draft").trim() as RegistrationStatus;
                if (!from || !to) return null;
                return {
                  at,
                  from,
                  to,
                  by: String(h.by ?? "").trim(),
                  comment: String(h.comment ?? "").trim(),
                };
              })
              .filter((h): h is NonNullable<TournamentRegistration["statusHistory"]>[number] => h !== null)
          : [],
        status: (String(x.status ?? "preinscrito") as RegistrationStatus),
        createdAt: String(x.createdAt ?? nowIso()),
        updatedAt: String(x.updatedAt ?? nowIso()),
        teams,
      } satisfies TournamentRegistration;
    })
    .filter((x): x is TournamentRegistration => x !== null);
  return { registrations: normalized };
}

function suggestStatusFromIssues(issues: RegistrationIssue[]): RegistrationStatus {
  if (issues.some((i) => i.code === "capacity_exceeded")) return "waitlist";
  if (issues.some((i) => i.level === "error")) return "pendiente_validacion";
  return "preinscrito";
}

export default function TournamentRegistrationPage() {
  const { profile, session } = useAuth();
  const searchParams = useSearchParams();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const canUseRemote = canUseOperativaSupabase(clubScopeId) && !!session?.access_token;

  const tournamentIdFromContext = useMemo(() => {
    const fromQuery = searchParams.get("tournamentId");
    return fromQuery || getActiveTournamentId(clubScopeId);
  }, [searchParams, clubScopeId]);
  const tournaments = useMemo(() => loadTournamentIndex(clubScopeId), [clubScopeId]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedTournamentId) return;
    if (tournamentIdFromContext) {
      setSelectedTournamentId(tournamentIdFromContext);
      return;
    }
    if (tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0]!.id);
    }
  }, [selectedTournamentId, tournamentIdFromContext, tournaments]);

  const [payload, setPayload] = useState<RegistrationsPayload>(DEFAULT_PAYLOAD);
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted" | "local_error">("local");
  const [savedAt, setSavedAt] = useState<string>("");

  const tournament = useMemo(
    () => tournaments.find((t) => t.id === selectedTournamentId) ?? null,
    [selectedTournamentId, tournaments],
  );
  const config = useMemo(
    () => loadTournamentConfigById(clubScopeId, selectedTournamentId),
    [clubScopeId, selectedTournamentId]
  );
  const slotsConfigured = Math.max(0, Number(config?.groupsCount ?? 0) * Number(config?.teamsPerGroup ?? 0));
  const occupiedSlots = payload.registrations.reduce((acc, r) => acc + r.teams.length, 0);
  const slotsAvailable = Math.max(0, slotsConfigured - occupiedSlots);
  const registrationIssuesById = useMemo(() => {
    const out = new Map<string, RegistrationIssue[]>();
    // Permitimos varios equipos del mismo club (ej: Benjamín A/B).
    // Sólo marcamos incidencia si se repite club + equipo + categoría.
    const duplicateEntryIds = new Set<string>();
    const seenTeamKey = new Set<string>();
    for (const r of payload.registrations) {
      const clubKey = r.clubName.trim().toLowerCase();
      for (const t of r.teams) {
        const teamKey = t.teamName.trim().toLowerCase();
        const categoryKey = t.category.trim().toLowerCase();
        if (!clubKey || !teamKey) continue;
        const key = `${clubKey}::${teamKey}::${categoryKey}`;
        if (seenTeamKey.has(key)) {
          duplicateEntryIds.add(r.id);
        } else {
          seenTeamKey.add(key);
        }
      }
    }

    let runningSlots = 0;
    for (const r of payload.registrations) {
      const issues: RegistrationIssue[] = [];
      if (!r.contactName.trim() || (!r.contactEmail.trim() && !r.contactPhone.trim())) {
        issues.push({
          code: "missing_contact",
          level: "warning",
          message: "Faltan datos de contacto (responsable y email o teléfono).",
        });
      }
      if (r.teams.some((t) => !t.teamName.trim())) {
        issues.push({
          code: "missing_team_name",
          level: "error",
          message: "Hay equipos sin nombre definido.",
        });
      }
      if (duplicateEntryIds.has(r.id)) {
        issues.push({
          code: "duplicate_team_in_club",
          level: "error",
          message: "Equipo duplicado dentro del mismo club/categoría.",
        });
      }
      runningSlots += r.teams.length;
      if (slotsConfigured > 0 && runningSlots > slotsConfigured) {
        issues.push({
          code: "capacity_exceeded",
          level: "warning",
          message: "Supera el cupo de plazas configuradas; debería pasar a lista de espera.",
        });
      }
      out.set(r.id, issues);
    }
    return out;
  }, [payload.registrations, slotsConfigured]);
  const totalIssues = useMemo(
    () => Array.from(registrationIssuesById.values()).reduce((acc, list) => acc + list.length, 0),
    [registrationIssuesById]
  );

  useEffect(() => {
    let cancelled = false;
    if (!selectedTournamentId) return;
    const local = safeJsonParse<RegistrationsPayload>(
      localStorage.getItem(registrationsLocalKey(clubScopeId, selectedTournamentId))
    );
    if (local && !cancelled) setPayload(toPayload(local));

    if (!canUseRemote || !session?.access_token) {
      if (!cancelled) setSyncMode("local");
      return;
    }

    void (async () => {
      try {
        const res = await fetch(`/api/club/tournament-registrations?tournamentId=${encodeURIComponent(selectedTournamentId)}`, {
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
        const json = (await res.json()) as { payload?: RegistrationsPayload };
        const normalized = toPayload(json.payload ?? {});
        if (!cancelled) {
          setPayload(normalized);
          setSyncMode("remote");
        }
        localStorage.setItem(registrationsLocalKey(clubScopeId, selectedTournamentId), JSON.stringify(normalized));
      } catch {
        if (!cancelled) setSyncMode("local_error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canUseRemote, clubScopeId, selectedTournamentId, session?.access_token]);

  useEffect(() => {
    if (!selectedTournamentId) return;
    const id = window.setTimeout(() => {
      localStorage.setItem(registrationsLocalKey(clubScopeId, selectedTournamentId), JSON.stringify(payload));
      setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));

      if (!canUseRemote || !session?.access_token) {
        setSyncMode("local");
        return;
      }
      void (async () => {
        try {
          const res = await fetch("/api/club/tournament-registrations", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ tournamentId: selectedTournamentId, payload }),
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
    }, 300);
    return () => window.clearTimeout(id);
  }, [canUseRemote, clubScopeId, payload, selectedTournamentId, session?.access_token]);

  const createRegistration = () => {
    if (!selectedTournamentId) return;
    const idx = payload.registrations.length + 1;
    const regId = `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const defaultTeamId = `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next: TournamentRegistration = {
      id: regId,
      tournamentId: selectedTournamentId,
      clubName: `Club invitado ${idx}`,
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      status: "preinscrito",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      teams: [
        {
          id: defaultTeamId,
          teamName: `Equipo ${idx}`,
          category: String(config?.categoryLabel || config?.categories?.[0] || "-"),
          expectedPlayers: Math.max(0, Number(config?.startersPerTeam ?? 0) + Number(config?.substitutesPerTeam ?? 0) || Number(config?.playersPerTeam ?? 12) || 12),
          status: "incompleto",
        },
      ],
    };
    setPayload((prev) => ({ registrations: [next, ...prev.registrations] }));
  };

  const updateRegistration = (id: string, patch: Partial<TournamentRegistration>) => {
    setPayload((prev) => ({
      registrations: prev.registrations.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r)),
    }));
  };

  const addTeam = (registrationId: string) => {
    setPayload((prev) => ({
      registrations: prev.registrations.map((r) => {
        if (r.id !== registrationId) return r;
        const team: RegistrationTeam = {
          id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          teamName: `Equipo ${r.teams.length + 1}`,
          category: String(config?.categoryLabel || config?.categories?.[0] || "-"),
          expectedPlayers: Math.max(0, Number(config?.startersPerTeam ?? 0) + Number(config?.substitutesPerTeam ?? 0) || Number(config?.playersPerTeam ?? 12) || 12),
          status: "incompleto",
        };
        return { ...r, teams: [...r.teams, team], updatedAt: nowIso() };
      }),
    }));
  };

  const updateRegistrationStatus = (id: string, to: RegistrationStatus, comment?: string) => {
    setPayload((prev) => ({
      registrations: prev.registrations.map((r) => {
        if (r.id !== id) return r;
        if (r.status === to && !comment) return r;
        const event = {
          at: nowIso(),
          from: r.status,
          to,
          by: profile?.email ?? profile?.clubName ?? "operator",
          comment: String(comment ?? "").trim(),
        };
        return {
          ...r,
          status: to,
          controlComment: String(comment ?? r.controlComment ?? "").trim(),
          statusHistory: [...(r.statusHistory ?? []), event],
          updatedAt: nowIso(),
        };
      }),
    }));
  };

  const applyBulkStatus = (from: RegistrationStatus, to: RegistrationStatus, comment: string) => {
    setPayload((prev) => ({
      registrations: prev.registrations.map((r) => {
        if (r.status !== from) return r;
        const event = {
          at: nowIso(),
          from: r.status,
          to,
          by: profile?.email ?? profile?.clubName ?? "operator",
          comment: String(comment).trim(),
        };
        return {
          ...r,
          status: to,
          controlComment: String(comment).trim(),
          statusHistory: [...(r.statusHistory ?? []), event],
          updatedAt: nowIso(),
        };
      }),
    }));
  };

  const importApprovedToTournamentTeams = () => {
    if (!selectedTournamentId) return;

    const approvedTeams = payload.registrations
      .filter((r) => r.status === "aprobado" || r.status === "completo")
      .flatMap((r) =>
        (r.teams ?? [])
          .map((t) => ({
            name: String(t.teamName ?? "").trim(),
            category: String(t.category ?? "").trim(),
            club: String(r.clubName ?? "").trim(),
          }))
          .filter((t) => t.name.length > 0),
      );
    if (approvedTeams.length === 0) return;

    const existing = loadTournamentTeamsById(clubScopeId, selectedTournamentId);
    const normalizedExisting = Array.isArray(existing)
      ? existing.map((t) => ({
          ...((t && typeof t === "object" ? t : {}) as Record<string, unknown>),
          id: String((t as { id?: unknown })?.id ?? `slot_${Math.random().toString(36).slice(2, 8)}`),
          name: String((t as { name?: unknown })?.name ?? "").trim(),
          groupIndex:
            typeof (t as { groupIndex?: unknown })?.groupIndex === "number"
              ? ((t as { groupIndex: number }).groupIndex ?? 0)
              : 0,
        }))
      : [];

    const filledKeys = new Set(
      normalizedExisting
        .filter((t) => String(t.name ?? "").trim().length > 0)
        .map((t) => String(t.name).trim().toLowerCase()),
    );

    const capacity = Math.max(0, Number(config?.groupsCount ?? 0) * Number(config?.teamsPerGroup ?? 0));
    const currentFilled = normalizedExisting.filter((t) => String(t.name ?? "").trim().length > 0).length;
    const remainingSlots = Math.max(0, capacity - currentFilled);
    let pending = approvedTeams.filter((t) => !filledKeys.has(t.name.toLowerCase()));
    if (remainingSlots > 0) pending = pending.slice(0, remainingSlots);
    if (pending.length === 0) return;

    // 1) Rellenar slots vacíos existentes.
    for (const entry of pending) {
      const emptyIdx = normalizedExisting.findIndex((t) => String(t.name ?? "").trim().length === 0);
      if (emptyIdx >= 0) {
        normalizedExisting[emptyIdx] = {
          ...normalizedExisting[emptyIdx],
          name: entry.name,
          source: "registration",
          categoryLabel: entry.category,
          clubName: entry.club,
        };
      } else {
        break;
      }
    }

    // 2) Si no hay suficientes slots precreados, añadimos hasta capacidad.
    const stillPending = pending.filter(
      (p) => !normalizedExisting.some((t) => String(t.name ?? "").trim().toLowerCase() === p.name.toLowerCase()),
    );
    let appendCounter = 0;
    for (const entry of stillPending) {
      if (capacity > 0 && normalizedExisting.filter((t) => String(t.name ?? "").trim().length > 0).length >= capacity) break;
      const teamIndex = normalizedExisting.length + appendCounter;
      const teamsPerGroup = Math.max(1, Number(config?.teamsPerGroup ?? 1));
      const groupIndex = Math.floor(teamIndex / teamsPerGroup);
      normalizedExisting.push({
        id: `slot_${groupIndex}_${teamIndex % teamsPerGroup}`,
        name: entry.name,
        groupIndex,
        source: "registration",
        categoryLabel: entry.category,
        clubName: entry.club,
      });
      appendCounter += 1;
    }

    saveTournamentTeamsById(clubScopeId, selectedTournamentId, normalizedExisting as any[]);
    setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/70">TORNEOS / INSCRIPCIÓN CLUBES</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Inscripción Digital</h1>
        <p className="mt-2 text-sm text-white/70">
          Fase 0/1: preinscripción de clubes y equipos con estados operativos y guardado híbrido.
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] font-black text-primary/70">
          {tournament?.name ?? "Sin torneo activo"} {savedAt ? `· Guardado ${savedAt}` : ""} ·{" "}
          {syncMode === "remote"
            ? "Fuente: Servidor"
            : syncMode === "restricted"
              ? "Local (permiso servidor denegado)"
              : syncMode === "local_error"
                ? "Local (error de sincronización)"
                : "Fuente: Local"}
        </p>
        <div className="max-w-md">
          <label className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/75">Torneo vinculado</label>
          <select
            value={selectedTournamentId ?? ""}
            onChange={(e) => setSelectedTournamentId(e.target.value || null)}
            className="mt-1 h-10 w-full rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
          >
            {tournaments.length === 0 ? <option value="">Sin torneos creados</option> : null}
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTournamentId ? (
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase text-primary">Primero crea un torneo</CardTitle>
            <CardDescription className="text-white/70">
              La inscripción debe estar ligada obligatoriamente a un torneo creado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/tournaments/list"
              className="inline-flex items-center h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
            >
              Ir a crear torneo
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <MiniKpi label="Plazas configuradas" value={`${slotsConfigured}`} />
        <MiniKpi label="Plazas ocupadas" value={`${occupiedSlots}`} />
        <MiniKpi label="Plazas disponibles" value={`${slotsAvailable}`} />
        <MiniKpi label="Preinscripciones" value={`${payload.registrations.length}`} highlight />
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Validación automática (Fase 2)
          </CardTitle>
          <CardDescription className="text-white/70">
            Revisión de plazas, duplicados y campos obligatorios con estado sugerido por inscripción.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MiniKpi label="Incidencias detectadas" value={`${totalIssues}`} highlight={totalIssues > 0} />
          <MiniKpi
            label="Con errores"
            value={`${Array.from(registrationIssuesById.values()).filter((x) => x.some((i) => i.level === "error")).length}`}
          />
          <MiniKpi
            label="Con warnings"
            value={`${Array.from(registrationIssuesById.values()).filter((x) => x.some((i) => i.level === "warning")).length}`}
          />
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Mesa de control (Fase 3)
          </CardTitle>
          <CardDescription className="text-white/70">
            Aprobación/rechazo operativo con trazabilidad de estado y comentarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyBulkStatus("pendiente_validacion", "aprobado", "Aprobación en lote desde mesa de control")}
              className="h-10 rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 text-[10px] font-black uppercase tracking-[0.14em]"
            >
              Aprobar pendientes
            </button>
            <button
              type="button"
              onClick={() => applyBulkStatus("pendiente_validacion", "waitlist", "Movido a lista de espera por operación")}
              className="h-10 rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-200 text-[10px] font-black uppercase tracking-[0.14em]"
            >
              Enviar a waitlist
            </button>
            <button
              type="button"
              onClick={() => applyBulkStatus("pendiente_validacion", "rechazado", "Rechazado por mesa de control")}
              className="h-10 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-200 text-[10px] font-black uppercase tracking-[0.14em]"
            >
              Rechazar pendientes
            </button>
          </div>
          <button
            type="button"
            onClick={importApprovedToTournamentTeams}
            className="h-10 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.14em] w-full md:w-auto px-3"
          >
            Volcar aprobados a equipos del torneo
          </button>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
            Estas acciones quedan registradas en el historial de cada inscripción.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cola de inscripción
            </CardTitle>
            <CardDescription className="text-white/70">Preinscripciones de clubs con equipos y estado.</CardDescription>
          </div>
          <button
            type="button"
            onClick={createRegistration}
            disabled={!selectedTournamentId}
            className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuevo club
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          {payload.registrations.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-[11px] text-white/65">
              Aún no hay preinscripciones.
            </div>
          ) : null}

          {payload.registrations.map((r) => (
            <div key={r.id} className="rounded-xl border border-primary/20 bg-[#0F172A]/50 p-3 space-y-2">
              {(() => {
                const issues = registrationIssuesById.get(r.id) ?? [];
                const suggested = suggestStatusFromIssues(issues);
                return (
                  <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/75">Validación automática</p>
                      <button
                        type="button"
                        onClick={() => updateRegistration(r.id, { status: suggested })}
                        className="h-7 px-2 rounded-lg border border-primary/25 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.14em]"
                      >
                        Aplicar estado sugerido: {suggested}
                      </button>
                    </div>
                    {issues.length === 0 ? (
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
                        OK · Sin incidencias
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {issues.map((iss, idx) => (
                          <p
                            key={`${r.id}_issue_${idx}`}
                            className={`text-[10px] font-black uppercase tracking-[0.12em] ${
                              iss.level === "error" ? "text-rose-300" : "text-amber-300"
                            }`}
                          >
                            {iss.message}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  value={r.clubName}
                  onChange={(e) => updateRegistration(r.id, { clubName: e.target.value })}
                  className="h-10 min-w-[220px] flex-1 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                />
                <select
                  value={r.status}
                  onChange={(e) => updateRegistration(r.id, { status: e.target.value as RegistrationStatus })}
                  className={`h-10 rounded-lg border px-2 text-[10px] font-black uppercase tracking-[0.14em] ${statusClass(r.status)}`}
                >
                  <option value="draft">Draft</option>
                  <option value="preinscrito">Preinscrito</option>
                  <option value="pendiente_validacion">Pendiente validación</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="completo">Completo</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  value={r.contactName}
                  placeholder="Responsable"
                  onChange={(e) => updateRegistration(r.id, { contactName: e.target.value })}
                  className="h-10 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                />
                <input
                  value={r.contactEmail}
                  placeholder="Email"
                  onChange={(e) => updateRegistration(r.id, { contactEmail: e.target.value })}
                  className="h-10 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                />
                <input
                  value={r.contactPhone}
                  placeholder="Teléfono"
                  onChange={(e) => updateRegistration(r.id, { contactPhone: e.target.value })}
                  className="h-10 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  value={r.controlComment ?? ""}
                  placeholder="Comentario de mesa de control"
                  onChange={(e) => updateRegistration(r.id, { controlComment: e.target.value })}
                  className="h-10 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none md:col-span-2"
                />
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateRegistrationStatus(r.id, "aprobado", r.controlComment)}
                    className="h-10 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-200 text-[9px] font-black uppercase tracking-[0.12em]"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRegistrationStatus(r.id, "waitlist", r.controlComment)}
                    className="h-10 rounded-lg border border-amber-500/25 bg-amber-500/10 text-amber-200 text-[9px] font-black uppercase tracking-[0.12em]"
                  >
                    Waitlist
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRegistrationStatus(r.id, "rechazado", r.controlComment)}
                    className="h-10 rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-200 text-[9px] font-black uppercase tracking-[0.12em]"
                  >
                    Rechazar
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/25 p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/70">Equipos inscritos</p>
                  <button
                    type="button"
                    onClick={() => addTeam(r.id)}
                    className="h-7 px-2 rounded-lg border border-primary/25 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.14em]"
                  >
                    + Equipo
                  </button>
                </div>
                {r.teams.map((t) => (
                  <div key={t.id} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      value={t.teamName}
                      onChange={(e) =>
                        setPayload((prev) => ({
                          registrations: prev.registrations.map((x) =>
                            x.id !== r.id
                              ? x
                              : {
                                  ...x,
                                  updatedAt: nowIso(),
                                  teams: x.teams.map((z) => (z.id === t.id ? { ...z, teamName: e.target.value } : z)),
                                }
                          ),
                        }))
                      }
                      className="h-9 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                    />
                    <input
                      value={t.category}
                      onChange={(e) =>
                        setPayload((prev) => ({
                          registrations: prev.registrations.map((x) =>
                            x.id !== r.id
                              ? x
                              : {
                                  ...x,
                                  updatedAt: nowIso(),
                                  teams: x.teams.map((z) => (z.id === t.id ? { ...z, category: e.target.value } : z)),
                                }
                          ),
                        }))
                      }
                      className="h-9 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      value={t.expectedPlayers}
                      onChange={(e) =>
                        setPayload((prev) => ({
                          registrations: prev.registrations.map((x) =>
                            x.id !== r.id
                              ? x
                              : {
                                  ...x,
                                  updatedAt: nowIso(),
                                  teams: x.teams.map((z) =>
                                    z.id === t.id ? { ...z, expectedPlayers: Math.max(0, Number(e.target.value) || 0) } : z
                                  ),
                                }
                          ),
                        }))
                      }
                      className="h-9 rounded-lg border border-primary/25 bg-black/25 px-3 text-sm text-white outline-none"
                    />
                    <div className="h-9 rounded-lg border border-primary/25 bg-black/25 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-primary/80 grid place-items-center">
                      {t.status}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-white/10 bg-black/25 p-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-primary/70 mb-1">Auditoría</p>
                {Array.isArray(r.statusHistory) && r.statusHistory.length > 0 ? (
                  <div className="space-y-1 max-h-28 overflow-auto pr-1">
                    {[...r.statusHistory].slice(-4).reverse().map((e, idx) => (
                      <div key={`${e.at}_${idx}`} className="text-[10px] text-white/75">
                        <span className="text-primary/80 font-black">{new Date(e.at).toLocaleString("es-ES")}</span>{" "}
                        · {e.from} → <span className="font-black">{e.to}</span>
                        {e.comment ? ` · ${e.comment}` : ""}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/55">Sin eventos de auditoría todavía.</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Terminales de acceso (siguiente fase)
          </CardTitle>
          <CardDescription className="text-white/70">
            Quedan preparados los estados y estructura para check-in terminal y mesa de control.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <MiniKpi label="Estado operativo" value="Fase 4 desplegada" highlight />
          <MiniKpi label="Check-in terminal" value="Fase 6 activa" highlight />
          <MiniKpi label="Mesa control" value="Fase 3 activa" />
          <Link
            href={`/tournaments/checkin?clubId=${encodeURIComponent(clubScopeId)}${selectedTournamentId ? `&tournamentId=${encodeURIComponent(selectedTournamentId)}` : ""}`}
            className="inline-flex items-center justify-center h-10 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.14em]"
          >
            Abrir terminal check-in
          </Link>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        Flujo híbrido activo: localStorage + Supabase (fallback automático)
      </div>
    </div>
  );
}

function MiniKpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${highlight ? "border-primary/35 bg-primary/10" : "border-white/10 bg-white/[0.03]"}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className={`mt-1 text-[12px] font-black ${highlight ? "text-primary" : "text-white"}`}>{value}</p>
    </div>
  );
}

