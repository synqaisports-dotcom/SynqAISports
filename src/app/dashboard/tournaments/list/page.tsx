"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarRange, ChevronDown, Pencil, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  ensureTournamentId,
  loadTournamentIndex,
  migrateLegacySingleTournamentIfNeeded,
  loadTournamentConfigById,
  loadTournamentTeamsById,
  saveTournamentIndex,
  saveTournamentConfigById,
  setActiveTournamentId,
  type TournamentIndexItem,
} from "@/lib/tournaments-storage";

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

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [tournaments, setTournaments] = useState<TournamentIndexItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    migrateLegacySingleTournamentIfNeeded({
      clubId: clubScopeId,
      legacyPlannerKey: `synq_tournaments_planner_v1_${clubScopeId}`,
      legacyTeamsKey: `synq_tournaments_teams_v1_${clubScopeId}`,
    });
    const list = loadTournamentIndex(clubScopeId);
    setTournaments(list);
    const first = list[0]?.id ?? "";
    setActiveId(first);
  }, [clubScopeId]);

  const activeTournament = useMemo(() => tournaments.find((t) => t.id === activeId) ?? null, [tournaments, activeId]);
  const config = useMemo(() => (activeId ? loadTournamentConfigById(clubScopeId, activeId) : null), [clubScopeId, activeId]);
  const teamsState = useMemo(
    () => (activeId ? loadTournamentTeamsById(clubScopeId, activeId) : []),
    [clubScopeId, activeId],
  );

  const inferredGroups = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
  const inferredTeamsCount = Math.max(0, Number(config?.teamsCount ?? 0) || 0);
  const teamsPerGroup =
    Number(config?.teamsPerGroup ?? 0) > 1
      ? Number(config?.teamsPerGroup)
      : inferredGroups > 0
        ? Math.max(2, Math.ceil(inferredTeamsCount / inferredGroups))
        : 0;

  const groupView = useMemo(() => {
    const teams = Array.isArray(teamsState) ? teamsState : [];
    const teamNames = teams
      .map((t) => (t && typeof t === "object" ? String((t as { name?: unknown }).name ?? "").trim() : ""))
      .filter((x): x is string => typeof x === "string" && x.length > 0);
    const safeTeams = teamNames.length > 0 ? teamNames : Array.from({ length: inferredTeamsCount }, (_, i) => `Equipo ${i + 1}`);
    const groups: Array<{ id: string; name: string; teams: Array<{ name: string; pts: number }> }> = [];
    for (let g = 0; g < inferredGroups; g++) {
      const start = g * teamsPerGroup;
      const end = start + teamsPerGroup;
      const slice = safeTeams.slice(start, end);
      groups.push({
        id: `G${g + 1}`,
        name: `Grupo ${String.fromCharCode(65 + g)}`,
        teams: slice.map((name: string) => ({ name, pts: 0 })),
      });
    }
    return groups;
  }, [teamsState, inferredTeamsCount, inferredGroups, teamsPerGroup]);

  const openTournament = (id: string) => {
    setActiveId(id);
    setActiveTournamentId(clubScopeId, id);
    setExpanded((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ver torneos</h1>
      </div>

      {tournaments.length === 0 ? (
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardContent className="py-8 text-center text-white/70">
            No hay torneos guardados todavía. Crea el primero desde el Planificador.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white font-black uppercase tracking-wider">Torneos</CardTitle>
                <CardDescription>Selecciona un torneo para ver equipos, grupos y cruces.</CardDescription>
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
                    openTournament(id);
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
              >
                + Nuevo torneo
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              {tournaments.map((t) => {
                const isOpen = !!expanded[t.id] || activeId === t.id;
                const cfg = loadTournamentConfigById(clubScopeId, t.id);
                return (
                  <div key={t.id} className="rounded-2xl border border-primary/20 bg-black/25">
                    <button
                      type="button"
                      onClick={() => openTournament(t.id)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="text-left">
                        <p className="text-[11px] font-black text-white uppercase">{t.name}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
                          {formatDate(cfg?.startDate)} - {formatDate(cfg?.endDate)} · {formatFootball(cfg?.footballFormat)}
                        </p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen ? (
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <Mini label="Fechas" value={`${formatDate(cfg?.startDate)} - ${formatDate(cfg?.endDate)}`} icon={CalendarRange} />
                          <Mini label="Categoría" value={(cfg?.categories?.[0] ?? "-").toString()} />
                          <Mini label="Formato" value={formatFootball(cfg?.footballFormat)} />
                          <Mini label="Equipos" value={String(cfg?.teamsCount ?? "-")} />
                          <Mini label="Grupos" value={String(cfg?.groupsCount ?? "-")} />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/dashboard/tournaments/planner?tournamentId=${encodeURIComponent(t.id)}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Modificar
                          </Link>
                          <Link
                            href={`/dashboard/tournaments/teams?tournamentId=${encodeURIComponent(t.id)}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Equipos
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {activeTournament && config ? (
            <div className="space-y-6">
              <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    {activeTournament.name}
                  </CardTitle>
                  <CardDescription>Ficha operativa (por torneo) · Club: {clubScopeId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <Mini label="Fechas" value={`${formatDate(config.startDate)} - ${formatDate(config.endDate)}`} icon={CalendarRange} />
                    <Mini label="Categoría" value={(config.categories?.[0] ?? "-").toString()} />
                    <Mini label="Formato" value={formatFootball(config.footballFormat)} />
                    <Mini label="Equipos" value={String(config.teamsCount ?? "-")} />
                    <Mini label="Grupos" value={String(config.groupsCount ?? "-")} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white font-black uppercase tracking-wider">Fase de grupos · Liguillas</CardTitle>
                  <CardDescription>Un contenedor por grupo con clasificación por puntos.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {groupView.map((g) => (
                    <div key={g.id} className="rounded-2xl border border-primary/20 bg-black/25 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{g.name}</p>
                        <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">{g.teams.length} equipos</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {g.teams.length === 0 ? (
                          <p className="text-[11px] text-white/55">Sin equipos asignados.</p>
                        ) : (
                          g.teams.map((t) => (
                            <div key={`${g.id}_${t.name}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                              <span className="text-[11px] font-black text-white truncate">{t.name}</span>
                              <span className="text-[10px] font-black uppercase text-primary/90">{t.pts} pts</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
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
