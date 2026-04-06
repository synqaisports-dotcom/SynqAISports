"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Trophy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  buildTournamentBracketFromResults,
  computeGroupStandings,
  getActiveTournamentId,
  loadTournamentConfigById,
  loadTournamentResultsById,
  loadTournamentTeamsById,
  setActiveTournamentId,
} from "@/lib/tournaments-storage";

type BracketRound = {
  title: string;
  pairings: Array<{ left: string; right: string }>;
};

type BracketView = {
  title: string;
  rounds: BracketRound[];
};

function finalsStyle(title: string): { borderClass: string; bgClass: string; textClass: string; badgeClass: string } {
  const t = String(title || "").toLowerCase();
  if (t.includes("platino")) {
    return {
      borderClass: "border-[#00F2FF]/25",
      bgClass: "bg-[#00F2FF]/[0.06]",
      textClass: "text-[#00F2FF]",
      badgeClass: "bg-[#00F2FF]/10 border-[#00F2FF]/25 text-[#00F2FF]",
    };
  }
  if (t.includes("oro")) {
    return {
      borderClass: "border-amber-400/30",
      bgClass: "bg-amber-500/[0.06]",
      textClass: "text-amber-200",
      badgeClass: "bg-amber-500/10 border-amber-400/25 text-amber-200",
    };
  }
  if (t.includes("plata")) {
    return {
      borderClass: "border-slate-300/25",
      bgClass: "bg-slate-300/[0.05]",
      textClass: "text-slate-200",
      badgeClass: "bg-slate-300/10 border-slate-300/25 text-slate-200",
    };
  }
  if (t.includes("bronce")) {
    return {
      borderClass: "border-orange-400/25",
      bgClass: "bg-orange-500/[0.06]",
      textClass: "text-orange-200",
      badgeClass: "bg-orange-500/10 border-orange-400/25 text-orange-200",
    };
  }
  return {
    borderClass: "border-primary/20",
    bgClass: "bg-black/25",
    textClass: "text-primary/80",
    badgeClass: "bg-primary/10 border-primary/25 text-primary",
  };
}

function buildEliminationRounds(args: { teams: string[]; roundTitlePrefix?: string }): BracketRound[] {
  const names = args.teams.map((t) => String(t || "").trim()).filter(Boolean);
  if (names.length < 2) return [];

  // Si no es potencia de 2, metemos "BYE" para completar y que avance automáticamente.
  const isPowerOfTwo = (n: number) => (n & (n - 1)) === 0;
  let list = [...names];
  if (!isPowerOfTwo(list.length)) {
    let nextPow = 1;
    while (nextPow < list.length) nextPow *= 2;
    while (list.length < nextPow) list.push("BYE");
  }

  const rounds: BracketRound[] = [];
  let current = list;
  let roundIdx = 0;

  while (current.length > 1) {
    const pairings: Array<{ left: string; right: string }> = [];
    const next: string[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const a = current[i] ?? "BYE";
      const b = current[i + 1] ?? "BYE";
      if (a === "BYE" && b === "BYE") continue;
      if (a === "BYE") {
        next.push(b);
        continue;
      }
      if (b === "BYE") {
        next.push(a);
        continue;
      }
      pairings.push({ left: a, right: b });
      next.push(`Ganador ${a} vs ${b}`);
    }
    const size = current.length;
    const title =
      size === 2 ? "Final" : size === 4 ? "Semifinales" : size === 8 ? "Cuartos" : size === 16 ? "Octavos" : `${args.roundTitlePrefix ?? "Ronda"} ${roundIdx + 1}`;
    rounds.push({ title, pairings });
    current = next;
    roundIdx += 1;
  }

  return rounds;
}

function pickSeededTeams(args: { standingsByGroup: Record<string, Array<{ team: string }>>; place: number }): string[] {
  const groups = Object.keys(args.standingsByGroup).sort(); // Grupo A, Grupo B, ...
  const out: string[] = [];
  for (const g of groups) {
    const row = args.standingsByGroup[g]?.[args.place - 1];
    if (row?.team) out.push(row.team);
  }
  return out;
}

function buildNormalBracket(args: { standingsByGroup: Record<string, Array<{ team: string }>> }): BracketView {
  const gnames = Object.keys(args.standingsByGroup).sort();
  // Clasificación mínima: 1º y 2º por grupo
  const firsts = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: 1 });
  const seconds = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: 2 });

  // Seed simple por parejas de grupos: A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2...
  const teams: string[] = [];
  for (let i = 0; i < gnames.length; i += 2) {
    const gA = gnames[i];
    const gB = gnames[i + 1];
    const a1 = gA ? args.standingsByGroup[gA]?.[0]?.team : undefined;
    const a2 = gA ? args.standingsByGroup[gA]?.[1]?.team : undefined;
    const b1 = gB ? args.standingsByGroup[gB]?.[0]?.team : undefined;
    const b2 = gB ? args.standingsByGroup[gB]?.[1]?.team : undefined;
    if (a1 && b2) teams.push(a1, b2);
    else if (a1) teams.push(a1);
    if (b1 && a2) teams.push(b1, a2);
    else if (b1) teams.push(b1);
  }

  // Fallback por si no hay 2º: usar los que existan
  const fallback = [...new Set([...firsts, ...seconds].filter(Boolean))];
  const seeded = teams.filter(Boolean);
  const finalTeams = seeded.length >= 2 ? seeded : fallback;

  return {
    title: "Modo normal · Cuadro único",
    rounds: buildEliminationRounds({ teams: finalTeams }),
  };
}

function buildFourFinals(args: { standingsByGroup: Record<string, Array<{ team: string }>> }): BracketView[] {
  const finals = [
    { title: "Final Platino", place: 1 },
    { title: "Final Oro", place: 2 },
    { title: "Final Plata", place: 3 },
    { title: "Final Bronce", place: 4 },
  ] as const;

  return finals.map((f) => {
    const teams = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: f.place });
    return {
      title: `${f.title} · ${f.place}º de cada grupo`,
      rounds: buildEliminationRounds({ teams }),
    };
  });
}

function initials(name: string): string {
  const n = String(name || "").trim();
  if (!n) return "?";
  return n.slice(0, 1).toUpperCase();
}

function TeamBadge({
  name,
  crest,
}: {
  name: string;
  crest?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {crest ? (
        <img src={crest} alt={`Escudo ${name}`} className="h-5 w-5 rounded-full object-cover border border-white/20 shrink-0" />
      ) : (
        <span className="h-5 w-5 rounded-full border border-white/20 bg-white/[0.06] text-[10px] font-black text-white/80 grid place-items-center shrink-0">
          {initials(name)}
        </span>
      )}
      <span className="text-[11px] font-black text-white truncate">{name}</span>
    </div>
  );
}

export default function TournamentBracketPage() {
  const searchParams = useSearchParams();
  const tournamentIdFromUrl = searchParams.get("tournamentId");
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [mode, setMode] = useState<"normal" | "four_finals">("normal");
  const [resolvedTournamentId, setResolvedTournamentId] = useState<string | null>(tournamentIdFromUrl);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!clubScopeId) return;
    // Si viene por URL, lo fijamos como activo.
    if (tournamentIdFromUrl) {
      setActiveTournamentId(clubScopeId, tournamentIdFromUrl);
      setResolvedTournamentId(tournamentIdFromUrl);
      return;
    }
    // Si no viene, usamos el activo.
    setResolvedTournamentId(getActiveTournamentId(clubScopeId));
  }, [clubScopeId, tournamentIdFromUrl]);

  // Releer datos al volver a esta vista/pestaña para reflejar guardados recientes.
  useEffect(() => {
    const bump = () => setReloadKey((k) => k + 1);
    const onStorage = (e: StorageEvent) => {
      if (!resolvedTournamentId) return;
      const key = `synq_tournament_matches_v1_${clubScopeId}_${resolvedTournamentId}`;
      if (e.key === key) bump();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener("focus", bump);
    window.addEventListener("pageshow", bump);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", bump);
      window.removeEventListener("pageshow", bump);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [clubScopeId, resolvedTournamentId]);

  const config = useMemo(
    () => loadTournamentConfigById(clubScopeId, resolvedTournamentId),
    [clubScopeId, resolvedTournamentId, reloadKey],
  );
  const teamsRows = useMemo(
    () => loadTournamentTeamsById(clubScopeId, resolvedTournamentId),
    [clubScopeId, resolvedTournamentId, reloadKey],
  );
  const crestByTeam = useMemo(() => {
    const out = new Map<string, string>();
    for (const t of teamsRows) {
      if (!t || typeof t !== "object") continue;
      const name = String((t as { name?: unknown }).name ?? "").trim();
      const crest = String((t as { crestDataUrl?: unknown }).crestDataUrl ?? "").trim();
      if (!name || !crest) continue;
      out.set(name, crest);
    }
    return out;
  }, [teamsRows]);
  const teamNames = useMemo(() => {
    const rows = teamsRows;
    return rows
      .map((row) => (row && typeof row === "object" ? String((row as { name?: unknown }).name ?? "").trim() : ""))
      .filter((name): name is string => name.length > 0);
  }, [teamsRows]);

  const results = useMemo(
    () => loadTournamentResultsById(clubScopeId, resolvedTournamentId),
    [clubScopeId, resolvedTournamentId, reloadKey],
  );
  const normalizedResults = useMemo(() => {
    const canonicalPair = (a: string, b: string) => [a, b].sort((x, y) => x.localeCompare(y)).join("__vs__");
    const groupLabel = (idx: number) => `Grupo ${String.fromCharCode(65 + Math.max(0, idx))}`;
    const byTeamGroup = new Map<string, number>();
    for (const t of teamsRows) {
      if (!t || typeof t !== "object") continue;
      const name = String((t as { name?: unknown }).name ?? "").trim();
      if (!name) continue;
      const groupIndexRaw = (t as { groupIndex?: unknown }).groupIndex;
      let gi = typeof groupIndexRaw === "number" && Number.isFinite(groupIndexRaw) ? groupIndexRaw : NaN;
      if (!Number.isFinite(gi)) {
        const id = String((t as { id?: unknown }).id ?? "").trim();
        const m = /^slot_(\d+)_\d+$/i.exec(id);
        if (m) gi = Number(m[1]);
      }
      if (Number.isFinite(gi)) byTeamGroup.set(name, Math.max(0, gi));
    }

    const dedup = new Map<string, (typeof results)[number]>();
    for (const r of results) {
      const local = String(r.localTeam || "").trim();
      const away = String(r.awayTeam || "").trim();
      if (!local || !away) continue;
      const gLocal = byTeamGroup.get(local);
      const gAway = byTeamGroup.get(away);
      const sameKnownGroup = typeof gLocal === "number" && typeof gAway === "number" && gLocal === gAway;
      const groupName = sameKnownGroup ? groupLabel(gLocal) : String(r.groupName || "").trim();
      const id = `${groupName}__${canonicalPair(local, away)}`;
      dedup.set(id, { ...r, id, groupName, localTeam: local, awayTeam: away });
    }
    return Array.from(dedup.values());
  }, [results, teamsRows]);
  const standings = useMemo(
    () => computeGroupStandings({ teams: teamsRows, results: normalizedResults, config }),
    [teamsRows, normalizedResults, config],
  );
  const bracket = useMemo(
    () => buildTournamentBracketFromResults({ standingsByGroup: standings }),
    [standings],
  );

  const normal = useMemo(() => buildNormalBracket({ standingsByGroup: standings as any }), [standings]);
  const fourFinals = useMemo(() => buildFourFinals({ standingsByGroup: standings as any }), [standings]);

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
            Cruces eliminatorios
          </CardTitle>
          <CardDescription>
            Generados automáticamente desde la clasificación real de fase de grupos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { value: "normal", label: "Modo normal", help: "Cuadro único: 1º vs 2º de grupos, hasta final." },
              { value: "four_finals", label: "4 finales", help: "Platino/Oro/Plata/Bronce: por posiciones (1º..4º)." },
            ].map((opt) => {
              const active = mode === (opt.value as any);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMode(opt.value as any)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-[background-color,border-color,color,opacity,transform] ${
                    active ? "border-primary/35 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.03] text-white/80"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.18em]">{opt.label}</p>
                  <p className={`mt-1 text-[11px] ${active ? "text-primary/80" : "text-white/55"}`}>{opt.help}</p>
                </button>
              );
            })}
          </div>

          {mode === "normal" ? (
            <BracketColumns title={normal.title} rounds={normal.rounds} crestByTeam={crestByTeam} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {fourFinals.map((b) => (
                <BracketColumns key={b.title} title={b.title} rounds={b.rounds} crestByTeam={crestByTeam} />
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Datos</p>
            <p className="mt-2 text-[11px] text-white/75">Equipos cargados: {teamNames.length}</p>
            <p className="mt-1 text-[11px] text-white/75">Grupos detectados: {Object.keys(standings).length}</p>
            <p className="mt-2 text-[10px] text-white/50">
              Si faltan cruces, completa resultados en Clasificación para definir posiciones por grupo.
            </p>
            <p className="mt-2 text-[10px] text-white/50">
              (Compat) Vista base anterior: Semis+Final se mantiene como fallback automático.
            </p>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-2">
              <RoundCard title="Semifinales (fallback)" pairings={bracket.semiFinals} crestByTeam={crestByTeam} />
              <RoundCard title="Final (fallback)" pairings={bracket.final} final crestByTeam={crestByTeam} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BracketColumns({
  title,
  rounds,
  crestByTeam,
}: {
  title: string;
  rounds: BracketRound[];
  crestByTeam: Map<string, string>;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-black/25 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">{title}</p>
      {rounds.length === 0 ? (
        <p className="mt-3 text-[11px] text-white/55">Sin cruces (faltan posiciones o grupos).</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {rounds.map((r) => (
            <RoundCard key={r.title} title={r.title} pairings={r.pairings} final={r.title === "Final"} crestByTeam={crestByTeam} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoundCard({
  title,
  pairings,
  final = false,
  crestByTeam,
}: {
  title: string;
  pairings: Array<{ left: string; right: string }>;
  final?: boolean;
  crestByTeam: Map<string, string>;
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
              <TeamBadge name={p.left} crest={crestByTeam.get(p.left)} />
              <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
              <TeamBadge name={p.right} crest={crestByTeam.get(p.right)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
