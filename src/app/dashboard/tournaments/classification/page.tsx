"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitBranch, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { loadTournamentConfigById, loadTournamentTeamsById } from "@/lib/tournaments-storage";

type GroupRow = { name: string; pts: number };
type GroupView = { id: string; name: string; teams: GroupRow[] };

export default function TournamentClassificationPage() {
  const params = useSearchParams();
  const tournamentId = params.get("tournamentId");
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";

  const config = useMemo(
    () => loadTournamentConfigById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );
  const teams = useMemo(
    () => loadTournamentTeamsById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );

  const groups = useMemo<GroupView[]>(() => {
    const groupsCount = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
    const teamsPerGroup =
      Number(config?.teamsPerGroup ?? 0) > 1
        ? Number(config?.teamsPerGroup)
        : Math.max(2, Math.ceil((Number(config?.teamsCount ?? 0) || 0) / groupsCount));
    const names = (Array.isArray(teams) ? teams : [])
      .map((t) => (t && typeof t === "object" ? String((t as { name?: unknown }).name ?? "").trim() : ""))
      .filter((v): v is string => v.length > 0);
    const fallback = names.length > 0 ? names : Array.from({ length: Number(config?.teamsCount ?? 0) || 0 }, (_, i) => `Equipo ${i + 1}`);
    const out: GroupView[] = [];
    for (let g = 0; g < groupsCount; g++) {
      const slice = fallback.slice(g * teamsPerGroup, g * teamsPerGroup + teamsPerGroup);
      out.push({
        id: `G${g + 1}`,
        name: `Grupo ${String.fromCharCode(65 + g)}`,
        teams: slice.map((name) => ({ name, pts: 0 })),
      });
    }
    return out;
  }, [config, teams]);

  if (!tournamentId || !config) {
    return (
      <div className="space-y-6">
        <p className="text-white/70">Selecciona un torneo desde Ver Torneos para ver la clasificación.</p>
        <Link
          href="/dashboard/tournaments/list"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">TORNEOS · CLASIFICACIÓN</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">{config.tournamentName || "Torneo"}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dashboard/tournaments/list"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <Link
          href={`/dashboard/tournaments/brackets?tournamentId=${encodeURIComponent(tournamentId)}`}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
        >
          <GitBranch className="h-4 w-4" />
          Ver cruces
        </Link>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider">Clasificación por grupos</CardTitle>
          <CardDescription>Vista preparada para cálculo dinámico por resultados.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl border border-primary/20 bg-black/25 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{g.name}</p>
              <div className="mt-3 space-y-2">
                {g.teams.length === 0 ? (
                  <p className="text-[11px] text-white/55">Sin equipos.</p>
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

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Cruces (resumen rápido)
          </CardTitle>
          <CardDescription>Vista previa. Para detalle usa el botón "Ver cruces".</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Mini label="Semifinal 1" value="1º Grupo A vs 2º Grupo B" />
            <Mini label="Semifinal 2" value="1º Grupo B vs 2º Grupo A" />
            <Mini label="Final" value="Ganador SF1 vs Ganador SF2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Mini(props: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">{props.label}</p>
      <p className="mt-1 text-[11px] font-black text-white">{props.value}</p>
    </div>
  );
}
