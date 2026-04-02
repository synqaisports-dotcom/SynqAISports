"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, CalendarRange, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { loadTournamentConfigById, loadTournamentIndex, loadTournamentTeamsById } from "@/lib/tournaments-storage";

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

  const loadedTeams = Array.isArray(teams) ? teams.length : 0;
  const expectedTeams = Number(config?.teamsCount ?? 0) || 0;
  const groups = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
  const completion = expectedTeams > 0 ? Math.min(100, Math.round((loadedTeams / expectedTeams) * 100)) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">TORNEOS · ANALÍTICA</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {tournament?.name ?? "Analítica de torneo"}
        </h1>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">KPIs del torneo (Fase 3 base)</CardTitle>
          <CardDescription>
            Base de analítica lista para ampliar con goles, minutos jugados, asistencias y rendimiento por equipo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Mini label="Equipos cargados" value={`${loadedTeams}`} />
          <Mini label="Equipos esperados" value={`${expectedTeams}`} />
          <Mini label="Grupos" value={`${groups}`} />
          <Mini label="Completitud roster" value={`${completion}%`} />
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white">Navegación rápida</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/tournaments/classification?tournamentId=${encodeURIComponent(tournamentId ?? "")}`}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
          >
            <Trophy className="h-3.5 w-3.5" />
            Clasificación + cruces
          </Link>
          <Link
            href="/dashboard/tournaments/list"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80"
          >
            <CalendarRange className="h-3.5 w-3.5" />
            Volver a listado
          </Link>
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
