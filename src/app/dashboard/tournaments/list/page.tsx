"use client";

import { useMemo } from "react";
import { CalendarRange, Pencil, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

type PlannerConfig = {
  tournamentName?: string;
  startDate?: string;
  endDate?: string;
  teamsCount?: number;
  tournamentDays?: number;
  fieldsCount?: number;
  groupsCount?: number;
  teamsPerGroup?: number;
  pointsWin?: number;
  pointsDraw?: number;
  pointsLoss?: number;
};

type TeamsState = {
  teams?: string[];
};

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-ES");
}

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const storageKey = useMemo(() => `synq_tournaments_planner_v1_${clubScopeId}`, [clubScopeId]);
  const teamsKey = useMemo(() => `synq_tournaments_teams_v1_${clubScopeId}`, [clubScopeId]);

  const data = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as PlannerConfig;
    } catch {
      return null;
    }
  }, [storageKey]);

  const teamsState = useMemo(() => {
    try {
      const raw = localStorage.getItem(teamsKey);
      if (!raw) return null;
      return JSON.parse(raw) as TeamsState;
    } catch {
      return null;
    }
  }, [teamsKey]);

  const inferredGroups = Math.max(1, Number(data?.groupsCount ?? 1) || 1);
  const inferredTeamsCount = Math.max(0, Number(data?.teamsCount ?? 0) || 0);
  const teamsPerGroup =
    Number(data?.teamsPerGroup ?? 0) > 1
      ? Number(data?.teamsPerGroup)
      : inferredGroups > 0
        ? Math.max(2, Math.ceil(inferredTeamsCount / inferredGroups))
        : 0;

  const pointsWin = Math.max(0, Number(data?.pointsWin ?? 3) || 0);
  const pointsDraw = Math.max(0, Number(data?.pointsDraw ?? 1) || 0);
  const pointsLoss = Math.max(0, Number(data?.pointsLoss ?? 0) || 0);

  const groupView = useMemo(() => {
    const teams = Array.isArray(teamsState?.teams) ? teamsState!.teams!.filter(Boolean) : [];
    const safeTeams = teams.length > 0 ? teams : Array.from({ length: inferredTeamsCount }, (_, i) => `Equipo ${i + 1}`);
    const groups: Array<{ id: string; name: string; teams: Array<{ name: string; pts: number; pj: number; gf: number; gc: number }> }> = [];
    for (let g = 0; g < inferredGroups; g++) {
      const start = g * teamsPerGroup;
      const end = start + teamsPerGroup;
      const slice = safeTeams.slice(start, end);
      groups.push({
        id: `G${g + 1}`,
        name: `Grupo ${String.fromCharCode(65 + g)}`,
        teams: slice.map((name) => ({ name, pts: 0, pj: 0, gf: 0, gc: 0 })),
      });
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsState?.teams, inferredTeamsCount, inferredGroups, teamsPerGroup]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ver torneos</h1>
      </div>

      {!data ? (
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardContent className="py-8 text-center text-white/70">
            No hay torneos guardados todavía. Crea el primero desde el Planificador.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                {data.tournamentName || "Torneo sin nombre"}
              </CardTitle>
              <CardDescription>
                Club: {clubScopeId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Mini label="Fechas" value={`${formatDate(data.startDate)} - ${formatDate(data.endDate)}`} icon={CalendarRange} />
                <Mini label="Equipos" value={String(data.teamsCount ?? "-")} />
                <Mini label="Grupos" value={String(data.groupsCount ?? "-")} />
                <Mini label="Campos" value={String(data.fieldsCount ?? "-")} />
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/tournaments/planner"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Modificar
                </Link>
                <Link
                  href="/dashboard/tournaments/teams"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                >
                  <Users className="h-3.5 w-3.5" />
                  Equipos
                </Link>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-black/25 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/80">
                  Reglas liguilla
                </p>
                <p className="mt-2 text-[11px] font-black text-white/80">
                  Victoria {pointsWin} · Empate {pointsDraw} · Derrota {pointsLoss}
                </p>
                <p className="mt-1 text-[10px] text-white/55">
                  La clasificación por puntos se usará para calcular cruces cuando añadamos resultados.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-white font-black uppercase tracking-wider">
                Fase de grupos · Liguillas
              </CardTitle>
              <CardDescription>
                Un contenedor por grupo con clasificación por puntos.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {groupView.map((g) => (
                <div key={g.id} className="rounded-2xl border border-primary/20 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">
                      {g.name}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                      {g.teams.length} equipos
                    </span>
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
      )}
    </div>
  );
}

function Mini(props: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  const Icon = props.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55 flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 text-violet-300/80" /> : null}
        {props.label}
      </p>
      <p className="mt-1 text-[11px] font-black text-white">{props.value}</p>
    </div>
  );
}
