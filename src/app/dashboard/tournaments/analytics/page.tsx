"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, CalendarRange, GitBranch, ListOrdered, Settings2, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { loadTournamentConfigById, loadTournamentIndex, loadTournamentResultsById, loadTournamentTeamsById, safeJsonParse } from "@/lib/tournaments-storage";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TournamentAnalyticsPage() {
  const { profile } = useAuth();
  const searchParams = useSearchParams();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const tournamentId = searchParams.get("tournamentId");

  const tournament = useMemo(
    () => loadTournamentIndex(clubScopeId).find((t) => t.id === tournamentId) ?? null,
    [clubScopeId, tournamentId],
  );
  const config = useMemo(
    () => loadTournamentConfigById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );
  const teams = useMemo(
    () => loadTournamentTeamsById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );
  const groupResults = useMemo(
    () => loadTournamentResultsById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );
  const bracketResults = useMemo(() => {
    if (!tournamentId) return [] as Array<{ localTeam: string; awayTeam: string; localGoals: number; awayGoals: number; status?: string }>;
    try {
      const key = `synq_tournament_bracket_results_v1_${clubScopeId}_${tournamentId}`;
      const parsed = safeJsonParse<unknown>(localStorage.getItem(key));
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((row) => {
          if (!row || typeof row !== "object") return null;
          const r = row as Record<string, unknown>;
          const localTeam = String(r.localTeam ?? "").trim();
          const awayTeam = String(r.awayTeam ?? "").trim();
          const localGoals = Math.max(0, Number(r.localGoals ?? 0) || 0);
          const awayGoals = Math.max(0, Number(r.awayGoals ?? 0) || 0);
          const status = String(r.status ?? "").trim().toLowerCase();
          if (!localTeam || !awayTeam) return null;
          return { localTeam, awayTeam, localGoals, awayGoals, status };
        })
        .filter((x): x is { localTeam: string; awayTeam: string; localGoals: number; awayGoals: number; status: string } => x !== null);
    } catch {
      return [];
    }
  }, [clubScopeId, tournamentId]);

  const loadedTeams = Array.isArray(teams) ? teams.length : 0;
  const expectedTeams = Number(config?.teamsCount ?? 0) || 0;
  const groups = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
  const completion = expectedTeams > 0 ? Math.min(100, Math.round((loadedTeams / expectedTeams) * 100)) : 0;

  const playersPerTeam = Math.max(
    1,
    Number(config?.startersPerTeam ?? 0) + Number(config?.substitutesPerTeam ?? 0) || Number(config?.playersPerTeam ?? 0) || 1,
  );
  const expectedPlayers = expectedTeams * playersPerTeam;
  const loadedPlayers = Array.isArray(teams)
    ? teams.reduce((acc, t) => {
        const players = t && typeof t === "object" && Array.isArray((t as { players?: unknown }).players)
          ? (t as { players: Array<{ name?: unknown }> }).players
          : [];
        const nonEmpty = players.filter((p) => String(p?.name ?? "").trim().length > 0).length;
        return acc + nonEmpty;
      }, 0)
    : 0;

  const teamsPerGroup =
    Math.max(2, Number(config?.teamsPerGroup ?? 0) || (expectedTeams > 0 ? Math.ceil(expectedTeams / groups) : 2));
  const matchesPerGroup = (teamsPerGroup * (teamsPerGroup - 1)) / 2; // liguilla a una vuelta
  const estimatedGroupMatches = groups * matchesPerGroup;

  // Estimación de cuadro final normal: 2 clasificados por grupo, eliminación directa.
  const qualifiedToBracket = groups * 2;
  const estimatedBracketMatches = qualifiedToBracket >= 2 ? qualifiedToBracket - 1 : 0;
  const estimatedTotalMatches = estimatedGroupMatches + estimatedBracketMatches;

  const fieldsCount = Math.max(1, Number(config?.fieldsCount ?? 1) || 1);
  const estimatedSlots = Math.ceil(estimatedTotalMatches / fieldsCount);

  // Previsión solicitada: 1,5 acompañantes por jugador.
  const companionsPerPlayer = 1.5;
  const estimatedCompanions = expectedPlayers * companionsPerPlayer;
  const estimatedPeopleTotal = expectedPlayers + estimatedCompanions;
  const groupGoalsTotal = groupResults.reduce((acc, r) => acc + Math.max(0, Number(r.localGoals) || 0) + Math.max(0, Number(r.awayGoals) || 0), 0);
  const closedBracketRows = bracketResults.filter((r) => r.status === "closed");
  const bracketGoalsTotal = closedBracketRows.reduce((acc, r) => acc + r.localGoals + r.awayGoals, 0);
  const totalGoalsAllTeams = groupGoalsTotal + bracketGoalsTotal;
  const playedGroupMatches = groupResults.length;
  const playedBracketMatches = closedBracketRows.length;
  const playedTotalMatches = playedGroupMatches + playedBracketMatches;
  const completionMatchesPct = estimatedTotalMatches > 0 ? Math.min(100, Math.round((playedTotalMatches / estimatedTotalMatches) * 100)) : 0;

  const goalsByTeam = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of groupResults) {
      map.set(r.localTeam, (map.get(r.localTeam) ?? 0) + Math.max(0, Number(r.localGoals) || 0));
      map.set(r.awayTeam, (map.get(r.awayTeam) ?? 0) + Math.max(0, Number(r.awayGoals) || 0));
    }
    for (const r of closedBracketRows) {
      map.set(r.localTeam, (map.get(r.localTeam) ?? 0) + r.localGoals);
      map.set(r.awayTeam, (map.get(r.awayTeam) ?? 0) + r.awayGoals);
    }
    return Array.from(map.entries())
      .map(([team, goals]) => ({ team, goals }))
      .sort((a, b) => b.goals - a.goals || a.team.localeCompare(b.team));
  }, [groupResults, closedBracketRows]);

  const progressPie = [
    { name: "Jugados", value: playedTotalMatches, color: "#00F2FF" },
    { name: "Pendientes", value: Math.max(0, estimatedTotalMatches - playedTotalMatches), color: "rgba(255,255,255,0.22)" },
  ];
  const matchesByPhase = [
    { phase: "Liguilla", jugados: playedGroupMatches, estimados: estimatedGroupMatches },
    { phase: "Cruces", jugados: playedBracketMatches, estimados: estimatedBracketMatches },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">TORNEOS · ANALÍTICA</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {tournament?.name ?? "Analítica de torneo"}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/tournaments/planner?tournamentId=${encodeURIComponent(tournamentId ?? "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Planner
            </Link>
            <Link
              href={`/dashboard/tournaments/teams?tournamentId=${encodeURIComponent(tournamentId ?? "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
            >
              <Users className="h-3.5 w-3.5" />
              Equipos
            </Link>
            <Link
              href={`/dashboard/tournaments/classification?tournamentId=${encodeURIComponent(tournamentId ?? "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Clasificación
            </Link>
            <Link
              href={`/dashboard/tournaments/bracket?tournamentId=${encodeURIComponent(tournamentId ?? "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Cruces
            </Link>
            <Link
              href="/dashboard/tournaments/list"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Listado
            </Link>
          </div>
        </div>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">KPIs del torneo (Fase 3 base)</CardTitle>
          <CardDescription>
            Estadísticas calculadas desde el configurador para preparar operativa e ingresos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Mini label="Equipos cargados" value={`${loadedTeams}`} />
          <Mini label="Equipos esperados" value={`${expectedTeams}`} />
          <Mini label="Grupos" value={`${groups}`} />
          <Mini label="Completitud roster" value={`${completion}%`} />
          <Mini label="Jugadores por equipo (cfg)" value={`${playersPerTeam}`} />
          <Mini label="Jugadores esperados" value={`${expectedPlayers}`} />
          <Mini label="Jugadores cargados" value={`${loadedPlayers}`} />
          <Mini label="Partidos liguilla (est.)" value={`${estimatedGroupMatches}`} />
          <Mini label="Partidos cuadro final (est.)" value={`${estimatedBracketMatches}`} />
          <Mini label="Partidos totales (est.)" value={`${estimatedTotalMatches}`} />
          <Mini label="Partidos jugados (reales)" value={`${playedTotalMatches}`} />
          <Mini label="Avance competición" value={`${completionMatchesPct}%`} />
          <Mini label={`Slots necesarios (${fieldsCount} campos)`} value={`${estimatedSlots}`} />
          <Mini label="Goles totales (todos los equipos)" value={`${totalGoalsAllTeams}`} />
          <Mini label="Acompañantes (1,5 x jugador)" value={estimatedCompanions.toLocaleString("es-ES", { maximumFractionDigits: 0 })} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Goles marcados por equipo</CardTitle>
            <CardDescription>
              Suma de fase de grupos + cruces cerrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {goalsByTeam.length === 0 ? (
              <p className="text-[11px] text-white/55">Aún no hay resultados para pintar la gráfica.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={goalsByTeam.slice(0, 16)} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="team"
                    tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 10 }}
                    angle={-18}
                    textAnchor="end"
                    height={64}
                  />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "1px solid rgba(0,242,255,0.25)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="goals" radius={[8, 8, 0, 0]}>
                    {goalsByTeam.slice(0, 16).map((entry, idx) => (
                      <Cell key={`${entry.team}_${idx}`} fill={idx % 2 === 0 ? "#00F2FF" : "#38BDF8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white">Avance de competición</CardTitle>
            <CardDescription>
              Comparativa jugados vs estimados por fase.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "1px solid rgba(0,242,255,0.25)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                  />
                  <Pie data={progressPie} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} stroke="rgba(255,255,255,0.08)">
                    {progressPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={matchesByPhase} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="phase" tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0F172A",
                      border: "1px solid rgba(0,242,255,0.25)",
                      borderRadius: 12,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="jugados" fill="#00F2FF" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="estimados" fill="rgba(255,255,255,0.28)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Previsión base para ingresos</CardTitle>
          <CardDescription>
            Referencia inicial para cálculo económico del torneo (entradas/pases).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Mini label="Jugadores previstos" value={expectedPlayers.toLocaleString("es-ES")} />
          <Mini label="Acompañantes previstos" value={estimatedCompanions.toLocaleString("es-ES", { maximumFractionDigits: 0 })} />
          <Mini label="Asistentes totales previstos" value={estimatedPeopleTotal.toLocaleString("es-ES", { maximumFractionDigits: 0 })} />
        </CardContent>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">{label}</p>
      <p className="mt-1 text-[11px] font-black text-white">{value}</p>
    </div>
  );
}
