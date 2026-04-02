"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { loadTournamentConfigById, loadTournamentTeamsById } from "@/lib/tournaments-storage";

function buildPairings(teams: string[]) {
  const out: Array<{ left: string; right: string }> = [];
  for (let i = 0; i < teams.length; i += 2) {
    out.push({
      left: teams[i] ?? "TBD",
      right: teams[i + 1] ?? "TBD",
    });
  }
  return out;
}

export default function TournamentBracketPage() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";

  const config = useMemo(
    () => loadTournamentConfigById(clubScopeId, tournamentId),
    [clubScopeId, tournamentId],
  );
  const teamNames = useMemo(() => {
    const rows = loadTournamentTeamsById(clubScopeId, tournamentId);
    return rows
      .map((row) => (row && typeof row === "object" ? String((row as { name?: unknown }).name ?? "").trim() : ""))
      .filter((name): name is string => name.length > 0);
  }, [clubScopeId, tournamentId]);

  const quarter = useMemo(() => buildPairings(teamNames), [teamNames]);
  const semi = useMemo(
    () => buildPairings(Array.from({ length: Math.max(2, Math.ceil(quarter.length / 2)) }, (_, i) => `Ganador QF${i + 1}`)),
    [quarter.length],
  );
  const finalRound = useMemo(() => [{ left: "Ganador SF1", right: "Ganador SF2" }], []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">TORNEOS · CRUCES</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
            {config?.tournamentName ?? "Cruces del torneo"}
          </h1>
        </div>
        <Link
          href="/dashboard/tournaments/list"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Cuadro eliminatorio (fase C base)
          </CardTitle>
          <CardDescription>
            Vista inicial de cruces por torneo. En siguientes fases se conectará a resultados reales.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RoundCard title="Cuartos / Primera ronda" pairings={quarter} />
          <RoundCard title="Semifinales" pairings={semi} />
          <RoundCard title="Final" pairings={finalRound} final />
        </CardContent>
      </Card>
    </div>
  );
}

function RoundCard({
  title,
  pairings,
  final = false,
}: {
  title: string;
  pairings: Array<{ left: string; right: string }>;
  final?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${final ? "border-amber-400/30 bg-amber-500/5" : "border-primary/20 bg-black/25"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
        {final ? <Trophy className="h-3.5 w-3.5 text-amber-300" /> : null}
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {pairings.length === 0 ? (
          <p className="text-[11px] text-white/55">Sin cruces.</p>
        ) : (
          pairings.map((p, idx) => (
            <div key={`${title}_${idx}`} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[11px] font-black text-white truncate">{p.left}</p>
              <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
              <p className="text-[11px] font-black text-white truncate">{p.right}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
