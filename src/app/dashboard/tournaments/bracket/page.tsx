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

function buildNormalBracket(args: {
  standingsByGroup: Record<string, Array<{ team: string }>>;
  includeThirdFourth?: boolean;
}): BracketView {
  const gnames = Object.keys(args.standingsByGroup).sort();
  const includeThirdFourth = !!args.includeThirdFourth;
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
    if (includeThirdFourth) {
      const a3 = gA ? args.standingsByGroup[gA]?.[2]?.team : undefined;
      const a4 = gA ? args.standingsByGroup[gA]?.[3]?.team : undefined;
      const b3 = gB ? args.standingsByGroup[gB]?.[2]?.team : undefined;
      const b4 = gB ? args.standingsByGroup[gB]?.[3]?.team : undefined;

      // Cruces ampliados: 1º vs 4º y 2º vs 3º del grupo siguiente.
      if (a1 && b4) teams.push(a1, b4);
      else if (a1) teams.push(a1);
      if (b1 && a4) teams.push(b1, a4);
      else if (b1) teams.push(b1);
      if (a2 && b3) teams.push(a2, b3);
      else if (a2) teams.push(a2);
      if (b2 && a3) teams.push(b2, a3);
      else if (b2) teams.push(b2);
    } else {
      if (a1 && b2) teams.push(a1, b2);
      else if (a1) teams.push(a1);
      if (b1 && a2) teams.push(b1, a2);
      else if (b1) teams.push(b1);
    }
  }

  // Fallback por si no hay 2º: usar los que existan
  const fallback = [...new Set([...firsts, ...seconds].filter(Boolean))];
  const seeded = teams.filter(Boolean);
  // Tope de cuadro: máximo desde octavos (16 equipos).
  const finalTeams = (seeded.length >= 2 ? seeded : fallback).slice(0, 16);

  return {
    title: includeThirdFourth ? "Modo normal · Cuadro ampliado (1º-4º)" : "Modo normal · Cuadro único",
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
    // Tope de cuadro por final: máximo octavos (16 equipos).
    const teams = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: f.place }).slice(0, 16);
    return {
      title: `${f.title} · ${f.place}º de cada grupo`,
      rounds: buildEliminationRounds({ teams }),
    };
  });
}

function splitRoundsForDoubleSidedBracket(rounds: BracketRound[]): {
  leftRounds: BracketRound[];
  rightRounds: BracketRound[];
  finalRound: BracketRound | null;
} | null {
  if (!Array.isArray(rounds) || rounds.length < 2) return null;
  const first = rounds[0];
  const last = rounds[rounds.length - 1];
  if (!first || !last) return null;
  const n = first.pairings.length;
  if (n < 8 || n % 2 !== 0) return null; // activamos desde octavos (8 cruces)
  if (last.pairings.length !== 1) return null;

  const half = n / 2;
  const left: BracketRound[] = [];
  const right: BracketRound[] = [];
  let leftCount = half;
  let rightCount = half;
  for (let i = 0; i < rounds.length - 1; i++) {
    const r = rounds[i];
    const leftPairings = r.pairings.slice(0, leftCount);
    const rightPairings = r.pairings.slice(leftCount, leftCount + rightCount);
    left.push({ title: r.title, pairings: leftPairings });
    right.push({ title: r.title, pairings: rightPairings });
    leftCount = Math.max(1, Math.floor(leftCount / 2));
    rightCount = Math.max(1, Math.floor(rightCount / 2));
  }
  return { leftRounds: left, rightRounds: right, finalRound: last };
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
  const [includeThirdFourth, setIncludeThirdFourth] = useState(false);
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

  const normal = useMemo(
    () => buildNormalBracket({ standingsByGroup: standings as any, includeThirdFourth }),
    [standings, includeThirdFourth],
  );
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
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                Incluir 3º y 4º en modo normal
              </p>
              <button
                type="button"
                onClick={() => setIncludeThirdFourth((v) => !v)}
                className={`inline-flex items-center h-8 rounded-lg border px-3 text-[10px] font-black uppercase tracking-[0.16em] transition-[background-color,border-color,color,opacity,transform] ${
                  includeThirdFourth
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-white/15 bg-black/25 text-white/70"
                }`}
              >
                {includeThirdFourth ? "Activado" : "Desactivado"}
              </button>
            </div>
          ) : null}

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-cyan-400/10 via-amber-300/10 to-cyan-400/10 blur-2xl" />
                <div className="relative h-44 w-44 rounded-full border border-cyan-300/10 bg-black/15 grid place-items-center">
                  <Trophy className="h-24 w-24 text-amber-300/20 drop-shadow-[0_0_28px_rgba(0,242,255,0.2)]" />
                </div>
              </div>
            </div>
            <div className="relative">
              {mode === "normal" ? (
                <BracketColumns title={normal.title} rounds={normal.rounds} crestByTeam={crestByTeam} />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {fourFinals.map((b) => (
                    <BracketColumns key={b.title} title={b.title} rounds={b.rounds} crestByTeam={crestByTeam} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bloque de datos/fallback ocultado para maximizar espacio visual del cuadro. */}
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
  const tones = finalsStyle(title);
  const canSplitOctavos =
    rounds.length >= 4 &&
    String(rounds[0]?.title || "").toLowerCase().includes("octavos") &&
    (rounds[0]?.pairings.length ?? 0) >= 8;
  return (
    <div className={`rounded-2xl border p-4 ${tones.borderClass} ${tones.bgClass}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${tones.textClass}`}>{title}</p>
      {rounds.length === 0 ? (
        <p className="mt-3 text-[11px] text-white/55">Sin cruces (faltan posiciones o grupos).</p>
      ) : (
        canSplitOctavos ? (
          <SplitClassicBracket
            rounds={rounds}
            crestByTeam={crestByTeam}
            lineClass={tones.borderClass.replace("border-", "bg-")}
            textClass={tones.textClass}
          />
        ) : (
          <ClassicBracket rounds={rounds} crestByTeam={crestByTeam} lineClass={tones.borderClass.replace("border-", "bg-")} />
        )
      )}
    </div>
  );
}

function SplitClassicBracket({
  rounds,
  crestByTeam,
  lineClass,
  textClass,
}: {
  rounds: BracketRound[];
  crestByTeam: Map<string, string>;
  lineClass: string;
  textClass: string;
}) {
  const leftRounds = rounds.slice(0, -1).map((r) => ({ ...r, pairings: r.pairings.slice(0, Math.ceil(r.pairings.length / 2)) }));
  const rightRounds = rounds.slice(0, -1).map((r) => ({ ...r, pairings: r.pairings.slice(Math.ceil(r.pairings.length / 2)) }));
  const finalPairing = rounds[rounds.length - 1]?.pairings?.[0];
  // Alineación vertical de la final con el centro del canvas de rondas.
  const leafPitch = 112;
  const nodeHeight = 74;
  const firstRoundCount = Math.max(1, leftRounds[0]?.pairings.length ?? rightRounds[0]?.pairings.length ?? 1);
  const canvasHeight = Math.max(nodeHeight, firstRoundCount * leafPitch);
  const finalTop = Math.max(0, canvasHeight / 2 - nodeHeight / 2);
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="min-w-max px-2 py-2 grid grid-cols-[auto_270px_auto] items-start gap-4">
        <ClassicBracket rounds={leftRounds} crestByTeam={crestByTeam} lineClass={lineClass} />
        <div className="relative" style={{ height: `${canvasHeight}px` }}>
          <div className="absolute left-0 right-0" style={{ top: `${Math.max(0, finalTop - 8)}px` }}>
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${textClass}`}>Final</p>
            </div>
            <div className="mt-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2">
              {finalPairing ? (
                <>
                  <TeamBadge name={finalPairing.left} crest={crestByTeam.get(finalPairing.left)} />
                  <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
                  <TeamBadge name={finalPairing.right} crest={crestByTeam.get(finalPairing.right)} />
                </>
              ) : (
                <p className="text-[11px] text-white/60">Sin final</p>
              )}
            </div>
          </div>
        </div>
        <ClassicBracket rounds={rightRounds} crestByTeam={crestByTeam} lineClass={lineClass} reverse />
      </div>
    </div>
  );
}

function BracketPhaseCard({
  title,
  pairings,
  crestByTeam,
  isFinal = false,
}: {
  title: string;
  pairings: Array<{ left: string; right: string }>;
  crestByTeam: Map<string, string>;
  isFinal?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${isFinal ? "border-amber-400/30 bg-amber-500/5" : "border-primary/20 bg-black/25"}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2">
        {isFinal ? <Trophy className="h-3.5 w-3.5 text-amber-300" /> : null}
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

function ClassicBracket({
  rounds,
  crestByTeam,
  lineClass,
  reverse = false,
}: {
  rounds: BracketRound[];
  crestByTeam: Map<string, string>;
  lineClass: string;
  reverse?: boolean;
}) {
  const lineBgClass = lineClass.startsWith("bg-") ? lineClass : "bg-primary/35";
  const leafPitch = 112; // separación vertical base de la primera ronda
  const nodeHeight = 74;
  const firstRoundCount = Math.max(1, rounds[0]?.pairings.length ?? 1);
  const canvasHeight = Math.max(nodeHeight, firstRoundCount * leafPitch);
  return (
    <div>
      <div className={`min-w-max px-2 py-2 flex items-start justify-center gap-5 ${reverse ? "flex-row-reverse" : ""}`}>
        {rounds.map((round, roundIndex) => {
          const isLastRound = roundIndex === rounds.length - 1;
          const blockSize = Math.pow(2, roundIndex);
          // Semidistancia al nodo de referencia (centro a centro) para enlazar ramas.
          const connectorSpan = Math.max(12, Math.round(leafPitch * Math.pow(2, roundIndex - 1)));
          return (
            <div key={round.title} className="w-[250px]">
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/60">{round.title}</p>
              <div className="relative" style={{ height: `${canvasHeight}px` }}>
                {round.pairings.map((p, idx) => {
                  // Centro matemático del partido según su bloque de referencia.
                  const centerY = (idx * blockSize + blockSize / 2) * leafPitch;
                  const top = Math.max(0, centerY - nodeHeight / 2);
                  return (
                    <div key={`${round.title}_${idx}`} className="absolute left-0 right-0" style={{ top: `${top}px` }}>
                      <MatchNode
                        left={p.left}
                        right={p.right}
                        crestByTeam={crestByTeam}
                        showLeftConnector={roundIndex > 0}
                        showRightConnector={!isLastRound}
                        matchIndex={idx}
                        roundSize={round.pairings.length}
                        mirror={reverse}
                        connectorSpan={connectorSpan}
                        lineBgClass={lineBgClass}
                        final={round.title === "Final"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchNode({
  left,
  right,
  crestByTeam,
  showLeftConnector,
  showRightConnector,
  matchIndex,
  roundSize,
  mirror = false,
  connectorSpan,
  lineBgClass,
  final,
}: {
  left: string;
  right: string;
  crestByTeam: Map<string, string>;
  showLeftConnector: boolean;
  showRightConnector: boolean;
  matchIndex: number;
  roundSize: number;
  mirror?: boolean;
  connectorSpan: number;
  lineBgClass: string;
  final?: boolean;
}) {
  const isEven = matchIndex % 2 === 0;
  const leftX = mirror ? "-right-3" : "-left-3";
  const rightX = mirror ? "-left-3" : "-right-3";
  return (
    <div className="relative h-[74px]">
      {showLeftConnector ? (
        <>
          <span className={`absolute ${leftX} top-1/2 h-[2px] w-3 -translate-y-1/2 ${lineBgClass}`} />
          {roundSize > 1 ? (
            <span
              className={`absolute ${leftX} left-auto w-[2px] ${lineBgClass} ${isEven ? "top-1/2" : "bottom-1/2"}`}
              style={{ height: `${connectorSpan}px` }}
            />
          ) : null}
        </>
      ) : null}
      {showRightConnector ? (
        <>
          <span className={`absolute ${rightX} top-1/2 h-[2px] w-3 -translate-y-1/2 ${lineBgClass}`} />
          {roundSize <= 1 ? null : isEven ? (
            <span
              className={`absolute ${rightX} top-1/2 w-[2px] ${lineBgClass}`}
              style={{ height: `${connectorSpan * 2}px` }}
            />
          ) : null}
        </>
      ) : null}
      <div className={`rounded-xl border px-3 py-2 ${final ? "border-amber-400/35 bg-amber-500/10" : "border-white/10 bg-white/[0.03]"}`}>
        <TeamBadge name={left} crest={crestByTeam.get(left)} />
        <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
        <TeamBadge name={right} crest={crestByTeam.get(right)} />
      </div>
    </div>
  );
}
