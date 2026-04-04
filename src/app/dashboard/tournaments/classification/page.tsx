"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, GitBranch, Minus, Plus, Save, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  loadTournamentConfigById,
  loadTournamentTeamsById,
  loadTournamentMatchesById,
  saveTournamentMatchesById,
  type TournamentMatchResultRow,
} from "@/lib/tournaments-storage";

type GroupRow = { name: string; pj: number; g: number; e: number; p: number; gf: number; gc: number; dg: number; pts: number };
type GroupView = { id: string; name: string; teams: GroupRow[] };

type ScheduleSlot = { day: number; start: string; end: string };
type ScheduledMatchRow = {
  key: string;
  fieldIndex: number; // 0..fieldsCount-1
  fieldLabel: string; // "Campo 1"
  groupName: string; // "Grupo A"
  round: number; // Jornada 1..N
  day: number;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
  localTeam: string;
  awayTeam: string;
  localGoals: number;
  awayGoals: number;
};

function ScoreInput(props: { value: number; disabled?: boolean; onChange: (next: number) => void }) {
  const v = Math.max(0, Number(props.value) || 0);
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/40 overflow-hidden">
      <button
        type="button"
        disabled={props.disabled || v <= 0}
        onClick={() => props.onChange(Math.max(0, v - 1))}
        className="h-9 w-10 grid place-items-center text-white/80 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,color,opacity,transform]"
        title="Restar"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={String(v)}
        disabled={props.disabled}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            props.onChange(0);
            return;
          }
          if (!/^\d+$/.test(raw)) return;
          props.onChange(Math.max(0, Number(raw) || 0));
        }}
        className="h-9 w-12 bg-transparent text-center text-white font-black outline-none"
        aria-label="Goles"
      />
      <button
        type="button"
        disabled={props.disabled}
        onClick={() => props.onChange(v + 1)}
        className="h-9 w-10 grid place-items-center text-[#00F2FF] hover:text-[#00F2FF] disabled:opacity-40 disabled:pointer-events-none transition-[background-color,border-color,color,opacity,transform]"
        title="Sumar"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function groupLetter(groupName: string): string {
  const m = /^\s*Grupo\s+([A-Z])\s*$/i.exec(String(groupName || "").trim());
  return (m?.[1] ?? "").toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mix(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  const tt = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * tt),
    g: Math.round(a.g + (b.g - a.g) * tt),
    b: Math.round(a.b + (b.b - a.b) * tt),
  };
}

function groupColor(groupName: string, totalGroups?: number): {
  badgeStyle: React.CSSProperties;
  borderStyle: React.CSSProperties;
  textStyle: React.CSSProperties;
} {
  // Paleta SynqAI: colores base con variaciones (claras/oscuras) cuando hay más grupos que la base.
  const letter = groupLetter(groupName);
  const idx = letter ? Math.max(0, letter.charCodeAt(0) - 65) : 0; // A=0
  const base = ["#00F2FF", "#34D399", "#A78BFA", "#FBBF24", "#FB7185", "#60A5FA", "#F472B6", "#22C55E"];
  const baseColor = hexToRgb(base[idx % base.length] ?? "#00F2FF") ?? { r: 0, g: 242, b: 255 };
  const cycle = Math.floor(idx / base.length); // 0,1,2...
  const isLight = cycle % 2 === 0;
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  const strength = Math.min(0.45, 0.14 + cycle * 0.08); // variación progresiva
  const accent = isLight ? mix(baseColor, white, strength) : mix(baseColor, black, strength * 0.65);

  const a = `${accent.r} ${accent.g} ${accent.b}`;
  return {
    borderStyle: { borderColor: `rgb(${a} / 0.25)` },
    badgeStyle: { backgroundColor: `rgb(${a} / 0.10)`, borderColor: `rgb(${a} / 0.25)` },
    textStyle: { color: `rgb(${a} / 0.95)` },
  };
}

function canonicalPairKey(a: string, b: string) {
  const aa = String(a || "").trim();
  const bb = String(b || "").trim();
  return [aa, bb].sort((x, y) => x.localeCompare(y)).join("__vs__");
}

function matchKey(groupName: string, a: string, b: string) {
  return `m_${String(groupName || "").trim()}__${canonicalPairKey(a, b)}`;
}

function buildRoundRobinRounds(teams: string[]): Array<Array<{ home: string; away: string }>> {
  const names = teams.map((t) => String(t || "").trim()).filter(Boolean);
  if (names.length < 2) return [];

  // Método del círculo (single round-robin).
  const list = [...names];
  const hasBye = list.length % 2 === 1;
  if (hasBye) list.push("BYE");

  const n = list.length;
  const rounds: Array<Array<{ home: string; away: string }>> = [];
  const fixed = list[0];
  let rot = list.slice(1);
  const roundsCount = n - 1;

  for (let r = 0; r < roundsCount; r++) {
    const left = [fixed, ...rot.slice(0, (n / 2) - 1)];
    const right = rot.slice((n / 2) - 1).slice().reverse();
    const pairings: Array<{ home: string; away: string }> = [];

    for (let i = 0; i < left.length; i++) {
      const a = left[i];
      const b = right[i];
      if (a === "BYE" || b === "BYE") continue;
      // Alternamos local/visitante para no sesgar demasiado.
      const even = r % 2 === 0;
      pairings.push(even ? { home: a, away: b } : { home: b, away: a });
    }

    rounds.push(pairings);

    // rotación
    rot = [rot[rot.length - 1], ...rot.slice(0, rot.length - 1)];
  }

  return rounds;
}

function normalizeSingleLegMatches(matches: TournamentMatchResultRow[]) {
  // Invariante: 1 partido por pareja en cada grupo (single-leg).
  // Guardamos/normalizamos con ID estable por partido para evitar duplicados en memoria/localStorage.
  // Elegimos "la última" aparición para respetar el último cambio del usuario.
  const byKey = new Map<string, TournamentMatchResultRow>();
  for (const m of matches) {
    const id = matchKey(m.groupName, m.localTeam, m.awayTeam);
    const normalized: TournamentMatchResultRow = {
      ...m,
      id,
      groupName: String(m.groupName || "").trim(),
      localTeam: String(m.localTeam || "").trim(),
      awayTeam: String(m.awayTeam || "").trim(),
      localGoals: Math.max(0, Number(m.localGoals) || 0),
      awayGoals: Math.max(0, Number(m.awayGoals) || 0),
    };
    byKey.set(id, normalized);
  }
  return Array.from(byKey.values());
}

function goalsForDisplayedPair(args: {
  stored: TournamentMatchResultRow | undefined;
  home: string;
  away: string;
}): { localGoals: number; awayGoals: number } {
  const m = args.stored;
  if (!m) return { localGoals: 0, awayGoals: 0 };
  const home = String(args.home || "").trim();
  const away = String(args.away || "").trim();
  if (m.localTeam === home && m.awayTeam === away) return { localGoals: m.localGoals, awayGoals: m.awayGoals };
  if (m.localTeam === away && m.awayTeam === home) return { localGoals: m.awayGoals, awayGoals: m.localGoals };
  // Fallback: si viene normalizado canónicamente, inferimos por coincidencia de nombres.
  // Si no coincide, devolvemos tal cual (fail-open).
  const set = new Set([m.localTeam, m.awayTeam]);
  if (set.has(home) && set.has(away)) {
    return m.localTeam === home ? { localGoals: m.localGoals, awayGoals: m.awayGoals } : { localGoals: m.awayGoals, awayGoals: m.localGoals };
  }
  return { localGoals: m.localGoals, awayGoals: m.awayGoals };
}

function getStoredMatchForPair(args: {
  matches: TournamentMatchResultRow[];
  groupName: string;
  home: string;
  away: string;
}): TournamentMatchResultRow | undefined {
  const key = canonicalPairKey(args.home, args.away);
  const id = matchKey(args.groupName, args.home, args.away);
  return args.matches.find((m) => m.id === id) ?? args.matches.find((m) => m.groupName === args.groupName && canonicalPairKey(m.localTeam, m.awayTeam) === key);
}

function buildCanonicalPayloadFromDisplayed(args: {
  existing: TournamentMatchResultRow | undefined;
  groupName: string;
  home: string;
  away: string;
  nextHomeGoals?: number;
  nextAwayGoals?: number;
}): TournamentMatchResultRow {
  const home = String(args.home || "").trim();
  const away = String(args.away || "").trim();
  const pairSorted = [home, away].sort((a, b) => a.localeCompare(b));
  const canonLocal = pairSorted[0]!;
  const canonAway = pairSorted[1]!;

  const currentDisplayed = goalsForDisplayedPair({ stored: args.existing, home, away });
  const displayHomeGoals = typeof args.nextHomeGoals === "number" ? args.nextHomeGoals : currentDisplayed.localGoals;
  const displayAwayGoals = typeof args.nextAwayGoals === "number" ? args.nextAwayGoals : currentDisplayed.awayGoals;

  // Mapear goles mostrados (home/away) al orden canónico (canonLocal/canonAway)
  let canonLocalGoals: number;
  let canonAwayGoals: number;
  if (canonLocal === home && canonAway === away) {
    canonLocalGoals = displayHomeGoals;
    canonAwayGoals = displayAwayGoals;
  } else {
    // invertido
    canonLocalGoals = displayAwayGoals;
    canonAwayGoals = displayHomeGoals;
  }

  return {
    id: args.existing?.id && args.existing.id.startsWith("m_") ? args.existing.id : matchKey(args.groupName, home, away),
    groupName: args.groupName,
    localTeam: canonLocal,
    awayTeam: canonAway,
    localGoals: Math.max(0, canonLocalGoals),
    awayGoals: Math.max(0, canonAwayGoals),
  };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

function addMinutesToHHMM(hhmm: string, delta: number) {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  const total = h * 60 + m + delta;
  const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function clampStartToRange(start: string, range: { start: string; end: string }) {
  if (toMinutes(start) < toMinutes(range.start)) return range.start;
  if (toMinutes(start) > toMinutes(range.end)) return range.end;
  return start;
}

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
  const [matches, setMatches] = useState<TournamentMatchResultRow[]>(
    () => loadTournamentMatchesById(clubScopeId, tournamentId),
  );

  useEffect(() => {
    setMatches(loadTournamentMatchesById(clubScopeId, tournamentId));
  }, [clubScopeId, tournamentId]);

  const normalizedMatches = useMemo(() => normalizeSingleLegMatches(matches), [matches]);

  const downloadCsv = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportStandingsCsv = () => {
    if (!tournamentId || !config) return;
    const lines: string[] = [];
    lines.push(["tournamentId", "tournamentName", "groupName", "pos", "team", "pj", "g", "e", "p", "gf", "gc", "dg", "pts"].join(","));
    for (const g of groups) {
      g.teams.forEach((t, idx) => {
        lines.push(
          [
            tournamentId,
            config.tournamentName ?? "",
            g.name,
            String(idx + 1),
            t.name,
            String(t.pj),
            String(t.g),
            String(t.e),
            String(t.p),
            String(t.gf),
            String(t.gc),
            String(t.dg),
            String(t.pts),
          ]
            .map((v) => `"${String(v).replaceAll("\"", "\"\"")}"`)
            .join(","),
        );
      });
    }
    downloadCsv(`clasificacion_${tournamentId}.csv`, lines.join("\n"));
  };

  const exportMatchesCsv = () => {
    if (!tournamentId || !config) return;
    const lines: string[] = [];
    lines.push(["tournamentId", "tournamentName", "groupName", "localTeam", "awayTeam", "localGoals", "awayGoals"].join(","));
    for (const m of normalizedMatches) {
      lines.push(
        [tournamentId, config.tournamentName ?? "", m.groupName, m.localTeam, m.awayTeam, String(m.localGoals), String(m.awayGoals)]
          .map((v) => `"${String(v).replaceAll("\"", "\"\"")}"`)
          .join(","),
      );
    }
    downloadCsv(`resultados_grupos_${tournamentId}.csv`, lines.join("\n"));
  };

  const isFinished = useMemo(() => {
    // Estado del torneo se guarda en índice, pero para esta fase basta con respetar "finished" si existe en el registro.
    // Si no se encuentra, no bloqueamos (fail-open UI) para no romper demo.
    try {
      const idx = JSON.parse(localStorage.getItem(`synq_tournaments_index_v1_${clubScopeId}`) || "[]") as Array<{ id: string; status?: string }>;
      const rec = Array.isArray(idx) ? idx.find((x) => x?.id === tournamentId) : null;
      return rec?.status === "finished";
    } catch {
      return false;
    }
  }, [clubScopeId, tournamentId]);

  const groups = useMemo<GroupView[]>(() => {
    const groupsCount = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
    const teamsPerGroup =
      Number(config?.teamsPerGroup ?? 0) > 1
        ? Number(config?.teamsPerGroup)
        : Math.max(2, Math.ceil((Number(config?.teamsCount ?? 0) || 0) / groupsCount));
    const allNamedTeams: Array<{ name: string; groupIndex: number | undefined }> = (Array.isArray(teams) ? teams : [])
      .map((t) => {
        if (!t || typeof t !== "object") return null;
        const id = String((t as { id?: unknown }).id ?? "").trim();
        const name = String((t as { name?: unknown }).name ?? "").trim();
        if (!name) return null;
        const groupIndexRaw = (t as { groupIndex?: unknown }).groupIndex;
        let groupIndex = typeof groupIndexRaw === "number" && Number.isFinite(groupIndexRaw) ? groupIndexRaw : undefined;
        if (groupIndex == null && id) {
          const m = /^slot_(\d+)_\d+$/.exec(id);
          if (m) {
            const inferred = Number(m[1]);
            if (Number.isFinite(inferred)) groupIndex = inferred;
          }
        }
        if (typeof groupIndex === "number" && Number.isFinite(groupIndex)) {
          groupIndex = Math.max(0, Math.min(groupsCount - 1, groupIndex));
        }
        return { name, groupIndex };
      })
      .filter((x): x is { name: string; groupIndex: number | undefined } => x !== null);

    const hasAnyGroupIndex = allNamedTeams.some((t) => typeof t.groupIndex === "number" && Number.isFinite(t.groupIndex));
    const fallbackNames =
      allNamedTeams.length > 0
        ? allNamedTeams.map((t) => t.name)
        : Array.from({ length: Number(config?.teamsCount ?? 0) || 0 }, (_, i) => `Equipo ${i + 1}`);
    const out: GroupView[] = [];
    const pointsWin = Math.max(0, Number(config?.pointsWin ?? 3) || 0);
    const pointsDraw = Math.max(0, Number(config?.pointsDraw ?? 1) || 0);
    const pointsLoss = Math.max(0, Number(config?.pointsLoss ?? 0) || 0);
    for (let g = 0; g < groupsCount; g++) {
      const groupLabel = `Grupo ${String.fromCharCode(65 + g)}`;
      const groupNames = hasAnyGroupIndex
        ? allNamedTeams
            .filter((t) => {
              const gi = typeof t.groupIndex === "number" && Number.isFinite(t.groupIndex) ? t.groupIndex : -1;
              return gi === g;
            })
            .map((t) => t.name)
        : fallbackNames.slice(g * teamsPerGroup, g * teamsPerGroup + teamsPerGroup);

      const rows = groupNames.map((name) => ({ name, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }));
      const rowMap = new Map(rows.map((r) => [r.name, r]));

      const relevant = normalizedMatches.filter((m) => m.groupName === groupLabel);
      for (const m of relevant) {
        const local = rowMap.get(m.localTeam);
        const away = rowMap.get(m.awayTeam);
        if (!local || !away) continue;
        local.pj += 1;
        away.pj += 1;
        local.gf += m.localGoals;
        local.gc += m.awayGoals;
        away.gf += m.awayGoals;
        away.gc += m.localGoals;
        if (m.localGoals > m.awayGoals) {
          local.g += 1;
          away.p += 1;
          local.pts += pointsWin;
          away.pts += pointsLoss;
        } else if (m.localGoals < m.awayGoals) {
          away.g += 1;
          local.p += 1;
          away.pts += pointsWin;
          local.pts += pointsLoss;
        } else {
          local.e += 1;
          away.e += 1;
          local.pts += pointsDraw;
          away.pts += pointsDraw;
        }
      }
      for (const r of rows) r.dg = r.gf - r.gc;
      rows.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf || a.name.localeCompare(b.name));
      out.push({
        id: `G${g + 1}`,
        name: groupLabel,
        teams: rows,
      });
    }
    return out;
  }, [config, teams, normalizedMatches]);

  const groupSeeds = useMemo(() => {
    // IMPORTANTE: para generar jornadas y asociar inputs, NO podemos usar el orden de `groups[g].teams`
    // porque se reordena por puntos/DG y eso hace que los cruces “cambien” mientras editas.
    // Usamos un orden estable derivado del array `teams` (slots) o del fallback slice.
    const groupsCount = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
    const teamsPerGroup =
      Number(config?.teamsPerGroup ?? 0) > 1
        ? Number(config?.teamsPerGroup)
        : Math.max(2, Math.ceil((Number(config?.teamsCount ?? 0) || 0) / groupsCount));

    const namedTeamsWithGroup: Array<{ name: string; groupIndex: number | undefined }> = (Array.isArray(teams) ? teams : [])
      .map((t) => {
        if (!t || typeof t !== "object") return null;
        const name = String((t as { name?: unknown }).name ?? "").trim();
        if (!name) return null;
        const groupIndexRaw = (t as { groupIndex?: unknown }).groupIndex;
        let groupIndex = typeof groupIndexRaw === "number" && Number.isFinite(groupIndexRaw) ? groupIndexRaw : undefined;
        // Fallback adicional: inferir del id de slot si no existe groupIndex (slot_0_0 -> Grupo A)
        if (groupIndex == null) {
          const id = String((t as { id?: unknown }).id ?? "");
          const m = /^slot_(\d+)_\d+$/i.exec(id.trim());
          if (m) groupIndex = Math.max(0, Number(m[1]) || 0);
        }
        return { name, groupIndex };
      })
      .filter((x): x is { name: string; groupIndex: number | undefined } => x !== null);

    const hasAnyGroupIndex = namedTeamsWithGroup.some((t) => typeof t.groupIndex === "number" && Number.isFinite(t.groupIndex));
    const fallbackNames =
      namedTeamsWithGroup.length > 0
        ? namedTeamsWithGroup.map((t) => t.name)
        : Array.from({ length: Number(config?.teamsCount ?? 0) || 0 }, (_, i) => `Equipo ${i + 1}`);

    const seeds = new Map<string, string[]>();
    for (let g = 0; g < groupsCount; g++) {
      const groupLabel = `Grupo ${String.fromCharCode(65 + g)}`;
      const names = hasAnyGroupIndex
        ? namedTeamsWithGroup
            .filter((t) => {
              const gi = typeof t.groupIndex === "number" && Number.isFinite(t.groupIndex) ? t.groupIndex : -1;
              return gi === g;
            })
            .map((t) => t.name)
        : fallbackNames.slice(g * teamsPerGroup, g * teamsPerGroup + teamsPerGroup);
      seeds.set(groupLabel, names);
    }
    return seeds;
  }, [config, teams]);

  const editableRows = useMemo(() => {
    const rows: Array<{
      key: string;
      groupName: string;
      round: number; // Jornada 1..N
      localTeam: string;
      awayTeam: string;
      localGoals: number;
      awayGoals: number;
    }> = [];
    for (const g of groups) {
      const teamNames = (groupSeeds.get(g.name) ?? g.teams.map((t) => t.name))
        .map((n) => String(n || "").trim())
        .filter((n) => n.length > 0);
      const rounds = buildRoundRobinRounds(teamNames);
      for (let r = 0; r < rounds.length; r++) {
        for (const p of rounds[r]) {
          const key = canonicalPairKey(p.home, p.away);
          const existing = normalizedMatches.find(
            (m) => m.groupName === g.name && canonicalPairKey(m.localTeam, m.awayTeam) === key,
          );
          const displayedGoals = goalsForDisplayedPair({ stored: existing, home: p.home, away: p.away });
          rows.push({
            key: `${g.id}_R${r + 1}_${key}`,
            groupName: g.name,
            round: r + 1,
            localTeam: p.home,
            awayTeam: p.away,
            localGoals: displayedGoals.localGoals,
            awayGoals: displayedGoals.awayGoals,
          });
        }
      }
    }
    return rows;
  }, [groups, groupSeeds, normalizedMatches]);

  const scheduledByField = useMemo(() => {
    const fieldsCount = Math.max(1, Number(config?.fieldsCount ?? 1) || 1);
    const halvesCount = Number(config?.halvesCount ?? 2) === 1 ? 1 : 2;
    const minutesPerHalf = Math.max(1, Number(config?.minutesPerHalf ?? 0) || 0);
    const breakMinutes = Math.max(0, Number(config?.breakMinutes ?? 0) || 0);
    const bufferBetweenMatches = Math.max(0, Number(config?.bufferBetweenMatches ?? 0) || 0);
    const matchTotalMinutes = halvesCount * minutesPerHalf + (halvesCount === 2 ? breakMinutes : 0);
    const slotMinutes = matchTotalMinutes + bufferBetweenMatches;
    const tournamentDays = Math.max(1, Number(config?.tournamentDays ?? 1) || 1);
    const scheduleMode = config?.scheduleMode === "rounds_by_group" ? "rounds_by_group" : "normal";

    const timeWindow = (config?.timeWindow ?? "both") as "morning" | "afternoon" | "both";
    const ranges: Array<{ start: string; end: string }> = [];
    if (timeWindow === "morning" || timeWindow === "both") {
      ranges.push({ start: String(config?.morningStart ?? "09:00"), end: String(config?.morningEnd ?? "14:00") });
    }
    if (timeWindow === "afternoon" || timeWindow === "both") {
      ranges.push({ start: String(config?.afternoonStart ?? "16:00"), end: String(config?.afternoonEnd ?? "21:00") });
    }

    const buildSlotsForTournament = (): ScheduleSlot[] => {
      const out: ScheduleSlot[] = [];
      if (slotMinutes <= 0 || ranges.length === 0) return out;
      const scheduleStart = String(config?.scheduleStart ?? "").trim();
      for (let day = 1; day <= tournamentDays; day++) {
        for (const r of ranges) {
          let cur = r.start;
          if (scheduleStart) {
            cur = clampStartToRange(scheduleStart, r);
          }
          while (toMinutes(addMinutesToHHMM(cur, matchTotalMinutes)) <= toMinutes(r.end)) {
            out.push({ day, start: cur, end: addMinutesToHHMM(cur, matchTotalMinutes) });
            cur = addMinutesToHHMM(cur, slotMinutes);
          }
        }
      }
      return out;
    };

    const slots = buildSlotsForTournament();

    const byField: Array<{ fieldIndex: number; fieldLabel: string; groups: string[]; matches: ScheduledMatchRow[]; overflow: number }> =
      Array.from({ length: fieldsCount }).map((_, idx) => ({
        fieldIndex: idx,
        fieldLabel: `Campo ${idx + 1}`,
        groups: [],
        matches: [],
        overflow: 0,
      }));

    const assignNormal = () => {
      // Grupo A -> Campo 1, Grupo B -> Campo 2 ... (wrap)
      const groupToFieldIndex = new Map<string, number>();
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        groupToFieldIndex.set(g.name, gi % fieldsCount);
      }

      const rowsByField = new Map<number, typeof editableRows>();
      for (const r of editableRows) {
        const fi = groupToFieldIndex.get(r.groupName) ?? 0;
        if (!rowsByField.has(fi)) rowsByField.set(fi, []);
        rowsByField.get(fi)!.push(r);
      }

      for (const field of byField) {
        const rows = rowsByField.get(field.fieldIndex) ?? [];
        const availableSlots = slots; // timeline propio por campo
        const scheduled: ScheduledMatchRow[] = [];
        const limit = Math.min(rows.length, availableSlots.length);
        for (let i = 0; i < limit; i++) {
          const r = rows[i];
          const s = availableSlots[i];
          scheduled.push({
            key: `${field.fieldIndex}_${r.key}`,
            fieldIndex: field.fieldIndex,
            fieldLabel: field.fieldLabel,
            groupName: r.groupName,
            round: r.round,
            day: s.day,
            start: s.start,
            end: s.end,
            localTeam: r.localTeam,
            awayTeam: r.awayTeam,
            localGoals: r.localGoals,
            awayGoals: r.awayGoals,
          });
        }
        field.matches = scheduled;
        field.overflow = Math.max(0, rows.length - availableSlots.length);
      }
    };

    const assignRotateGroupsBySlots = () => {
      // En cada slot (hora), programamos partidos del MISMO grupo en paralelo (hasta fieldsCount).
      // En el siguiente slot, pasamos al siguiente grupo (rotación), ayudando al descanso.
      const byGroupRound = new Map<string, Map<number, typeof editableRows>>();
      const totalsByGroup = new Map<string, number>();
      for (const r of editableRows) {
        if (!byGroupRound.has(r.groupName)) byGroupRound.set(r.groupName, new Map());
        const m = byGroupRound.get(r.groupName)!;
        if (!m.has(r.round)) m.set(r.round, []);
        m.get(r.round)!.push(r);
        totalsByGroup.set(r.groupName, (totalsByGroup.get(r.groupName) ?? 0) + 1);
      }
      // Orden estable: por ronda y por nombre
      for (const [gname, roundsMap] of byGroupRound.entries()) {
        for (const [round, rows] of roundsMap.entries()) {
          rows.sort((a, b) => a.localTeam.localeCompare(b.localTeam) || a.awayTeam.localeCompare(b.awayTeam));
          roundsMap.set(round, rows);
        }
        byGroupRound.set(gname, new Map([...roundsMap.entries()].sort((a, b) => a[0] - b[0])));
      }

      const groupNames = groups.map((g) => g.name);
      const pointer = new Map<string, { roundIdx: number; matchIdx: number; rounds: number[] }>();
      for (const gname of groupNames) {
        const rounds = Array.from(byGroupRound.get(gname)?.keys() ?? []);
        pointer.set(gname, { roundIdx: 0, matchIdx: 0, rounds });
      }

      const scheduledCountByGroup = new Map<string, number>();
      const scheduledPerField: Array<ScheduledMatchRow[]> = Array.from({ length: fieldsCount }).map(() => []);

      const hasRemaining = (gname: string) => (scheduledCountByGroup.get(gname) ?? 0) < (totalsByGroup.get(gname) ?? 0);

      const totalRoundsByGroup = new Map<string, number>();
      for (const gname of groupNames) {
        totalRoundsByGroup.set(gname, (pointer.get(gname)?.rounds?.length ?? 0) || 0);
      }

      // Elegir el grupo "más retrasado" para balancear finalización cuando hay menos campos que grupos.
      const pickNextGroupBalanced = () => {
        let best: string | null = null;
        let bestScore = Number.POSITIVE_INFINITY;
        for (const gname of groupNames) {
          if (!hasRemaining(gname)) continue;
          const p = pointer.get(gname);
          if (!p) continue;
          const totalRounds = Math.max(1, totalRoundsByGroup.get(gname) ?? 1);
          const progressRounds = Math.min(totalRounds, p.roundIdx + (p.matchIdx > 0 ? 0.5 : 0)); // 0..N aprox
          const progressMatches = (scheduledCountByGroup.get(gname) ?? 0) / Math.max(1, totalsByGroup.get(gname) ?? 1);
          // Score menor = más retrasado (prioridad). Mezclamos rounds y % partidos.
          const score = progressRounds / totalRounds + progressMatches;
          if (score < bestScore) {
            bestScore = score;
            best = gname;
          }
        }
        return best;
      };

      for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
        // En un mismo slot, podemos repartir campos entre varios grupos (si hay campos suficientes).
        // Ej: 4 campos y grupos con 2 partidos por jornada -> Campo1-2 Grupo A, Campo3-4 Grupo B.
        const s = slots[slotIdx];
        let fieldCursor = 0;
        let safety = 0;
        while (fieldCursor < fieldsCount && safety < 50) {
          safety += 1;
          const currentGroup = pickNextGroupBalanced();
          if (!currentGroup || !hasRemaining(currentGroup)) break;

          const p = pointer.get(currentGroup)!;
          const currentRound = p.rounds[p.roundIdx];
          const roundRows = byGroupRound.get(currentGroup)?.get(currentRound) ?? [];
          if (roundRows.length === 0) {
            // sin datos de ronda, saltar a otro grupo
            // Evita bucles si hay inconsistencias.
            pointer.set(currentGroup, { ...p, roundIdx: p.roundIdx + 1, matchIdx: 0 });
            continue;
          }

          const remainingInRound = Math.max(0, roundRows.length - p.matchIdx);
          if (remainingInRound === 0) {
            // avanzar ronda
            pointer.set(currentGroup, { ...p, roundIdx: p.roundIdx + 1, matchIdx: 0 });
            continue;
          }

          const availableFields = fieldsCount - fieldCursor;
          const take = Math.max(0, Math.min(availableFields, remainingInRound));
          for (let k = 0; k < take; k++) {
            const rr = roundRows[p.matchIdx];
            if (!rr) break;
            const fieldIndex = fieldCursor + k;
            scheduledPerField[fieldIndex].push({
              key: `${fieldIndex}_${rr.key}_S${slotIdx}`,
              fieldIndex,
              fieldLabel: `Campo ${fieldIndex + 1}`,
              groupName: rr.groupName,
              round: rr.round,
              day: s.day,
              start: s.start,
              end: s.end,
              localTeam: rr.localTeam,
              awayTeam: rr.awayTeam,
              localGoals: rr.localGoals,
              awayGoals: rr.awayGoals,
            });
            p.matchIdx += 1;
            scheduledCountByGroup.set(currentGroup, (scheduledCountByGroup.get(currentGroup) ?? 0) + 1);
          }

          // Si hemos terminado la ronda, avanzamos a la siguiente y reseteamos matchIdx
          if (p.matchIdx >= roundRows.length) {
            p.roundIdx += 1;
            p.matchIdx = 0;
          }
          pointer.set(currentGroup, p);
          fieldCursor += take;
        }
      }

      for (let fi = 0; fi < fieldsCount; fi++) {
        byField[fi].matches = scheduledPerField[fi];
        byField[fi].groups = Array.from(new Set(scheduledPerField[fi].map((m) => m.groupName))).sort();
      }

      const totalScheduled = scheduledPerField.reduce((acc: number, arr) => acc + arr.length, 0);
      const totalRows = editableRows.length;
      const overflow = Math.max(0, totalRows - totalScheduled);
      if (overflow > 0) {
        // repartir overflow como aviso en todos los campos (solo UI)
        for (const f of byField) f.overflow = overflow;
      }
    };

    if (scheduleMode === "rounds_by_group") assignRotateGroupsBySlots();
    else assignNormal();

    // Completar grupos por campo si faltan (modo normal no los llena todavía)
    for (const field of byField) {
      if (field.groups.length === 0 && field.matches.length > 0) {
        field.groups = Array.from(new Set(field.matches.map((m) => m.groupName))).sort();
      }
    }

    return {
      matchTotalMinutes,
      slotMinutes,
      fields: byField,
    };
  }, [config, groups, editableRows]);

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
          href={`/dashboard/tournaments/bracket?tournamentId=${encodeURIComponent(tournamentId)}`}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
        >
          <GitBranch className="h-4 w-4" />
          Ver cruces
        </Link>
        <button
          type="button"
          onClick={exportStandingsCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80"
          title="Exportar clasificación CSV"
        >
          <Download className="h-4 w-4" />
          CSV clasificación
        </button>
        <button
          type="button"
          onClick={exportMatchesCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/80"
          title="Exportar resultados CSV"
        >
          <Download className="h-4 w-4" />
          CSV resultados
        </button>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider">Clasificación por grupos</CardTitle>
          <CardDescription>Calculada automáticamente según resultados registrados.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groups.map((g) => (
            <div
              key={g.id}
              className="rounded-2xl border bg-black/25 p-4"
              style={groupColor(g.name).borderStyle}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={groupColor(g.name).textStyle}>
                  {g.name}
                </p>
                {groupLetter(g.name) ? (
                  <span
                    className="inline-flex items-center rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]"
                    style={{ ...groupColor(g.name).badgeStyle, ...groupColor(g.name).textStyle }}
                  >
                    Grupo {groupLetter(g.name)}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 space-y-2">
                {g.teams.length === 0 ? (
                  <p className="text-[11px] text-white/55">Sin equipos.</p>
                ) : (
                  g.teams.map((t, idx) => (
                    <div key={`${g.id}_${t.name}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 gap-2">
                      <span className="text-[11px] font-black text-primary/80 w-5">{idx + 1}</span>
                      <span className="text-[11px] font-black text-white truncate flex-1">{t.name}</span>
                      <span className="text-[10px] font-black uppercase text-white/70">PJ {t.pj}</span>
                      <span className="text-[10px] font-black uppercase text-white/70">DG {t.dg}</span>
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
          <CardTitle className="text-white font-black uppercase tracking-wider">Horario por campo</CardTitle>
          <CardDescription>
            Cada grupo se asigna a un campo (Grupo A → Campo 1, Grupo B → Campo 2, ...). Si hay varios campos, hay partidos a la misma hora.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scheduledByField.fields.map((f) => (
            <div key={f.fieldIndex} className="rounded-2xl border border-primary/20 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">{f.fieldLabel}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
                  Slot {scheduledByField.matchTotalMinutes}m + {Math.max(0, scheduledByField.slotMinutes - scheduledByField.matchTotalMinutes)}m
                </p>
              </div>
              <div className="mt-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/50">Grupos en este campo</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {f.groups.length > 0 ? (
                    f.groups.map((gn) => (
                      <span
                        key={gn}
                        className="inline-flex items-center rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]"
                        style={{ ...groupColor(gn).badgeStyle, ...groupColor(gn).textStyle }}
                      >
                        {gn}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] font-black text-white/85">—</span>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {f.matches.length === 0 ? (
                  <p className="text-[11px] text-white/55">Sin partidos asignados.</p>
                ) : (
                  f.matches.map((m) => (
                    <div
                      key={m.key}
                      className="rounded-xl border bg-white/[0.03] px-3 py-2 flex items-center gap-3"
                      style={groupColor(m.groupName).borderStyle}
                    >
                      <div className="w-[92px] shrink-0">
                        <p className="text-[10px] font-black text-primary/90">
                          D{m.day} {m.start}
                        </p>
                        <span
                          className="mt-1 inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em]"
                          style={{ ...groupColor(m.groupName).badgeStyle, ...groupColor(m.groupName).textStyle }}
                        >
                          {m.groupName} · J{m.round}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-white truncate">
                          {m.localTeam} <span className="text-white/60">vs</span> {m.awayTeam}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[10px] font-black uppercase text-white/60">{m.end}</span>
                      </div>
                    </div>
                  ))
                )}
                {f.overflow > 0 ? (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/90 font-black">
                    Faltan huecos: {f.overflow} partidos no caben en la ventana horaria.
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider">Resultados de fase de grupos</CardTitle>
          <CardDescription>
            Guarda aquí los marcadores para recalcular la clasificación automáticamente.
            {isFinished ? " (Torneo finalizado: edición bloqueada)" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {editableRows.length === 0 ? (
            <p className="text-[11px] text-white/55">No hay cruces de grupo (faltan equipos o grupos).</p>
          ) : (
            <>
              {(() => {
                const byGroup = new Map<string, typeof editableRows>();
                for (const r of editableRows) {
                  if (!byGroup.has(r.groupName)) byGroup.set(r.groupName, []);
                  byGroup.get(r.groupName)!.push(r);
                }
                const groupNames = Array.from(byGroup.keys()).sort();
                return groupNames.map((gn) => {
                  const rows = byGroup.get(gn) ?? [];
                  const rounds = Array.from(new Set(rows.map((r) => r.round))).sort((a, b) => a - b);
                  return (
                    <div key={gn} className="space-y-3">
                      <div className="rounded-2xl border bg-white/[0.02] px-4 py-3" style={groupColor(gn).borderStyle}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={groupColor(gn).textStyle}>
                            {gn}
                          </p>
                          <span
                            className="inline-flex items-center rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]"
                            style={{ ...groupColor(gn).badgeStyle, ...groupColor(gn).textStyle }}
                          >
                            {gn}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-white/60">Jornadas: {rounds.length || 0}</p>
                      </div>
                      {rounds.map((round) => (
                        <div key={`${gn}_R${round}`} className="space-y-2">
                          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">Jornada {round}</p>
                          {rows
                            .filter((r) => r.round === round)
                            .map((row) => (
                              <div key={row.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary/80">
                                  {row.groupName} · Jornada {row.round}
                                </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex-1 text-[11px] font-black text-white truncate">{row.localTeam}</span>
                    <ScoreInput
                      disabled={isFinished}
                      value={row.localGoals}
                      onChange={(value) => {
                        if (isFinished) return;
                        setMatches((prev) => {
                          const next = Array.isArray(prev) ? [...prev] : [];
                          const existing = getStoredMatchForPair({
                            matches: next,
                            groupName: row.groupName,
                            home: row.localTeam,
                            away: row.awayTeam,
                          });
                          const payload = buildCanonicalPayloadFromDisplayed({
                            existing,
                            groupName: row.groupName,
                            home: row.localTeam,
                            away: row.awayTeam,
                            nextHomeGoals: value,
                          });
                          const map = new Map<string, TournamentMatchResultRow>();
                          for (const m of next) {
                            const id = matchKey(m.groupName, m.localTeam, m.awayTeam);
                            map.set(id, { ...m, id });
                          }
                          map.set(payload.id, payload);
                          return Array.from(map.values());
                        });
                      }}
                    />
                    <span className="text-white/70 text-xs font-black">vs</span>
                    <ScoreInput
                      disabled={isFinished}
                      value={row.awayGoals}
                      onChange={(value) => {
                        if (isFinished) return;
                        setMatches((prev) => {
                          const next = Array.isArray(prev) ? [...prev] : [];
                          const existing = getStoredMatchForPair({
                            matches: next,
                            groupName: row.groupName,
                            home: row.localTeam,
                            away: row.awayTeam,
                          });
                          const payload = buildCanonicalPayloadFromDisplayed({
                            existing,
                            groupName: row.groupName,
                            home: row.localTeam,
                            away: row.awayTeam,
                            nextAwayGoals: value,
                          });
                          const map = new Map<string, TournamentMatchResultRow>();
                          for (const m of next) {
                            const id = matchKey(m.groupName, m.localTeam, m.awayTeam);
                            map.set(id, { ...m, id });
                          }
                          map.set(payload.id, payload);
                          return Array.from(map.values());
                        });
                      }}
                    />
                    <span className="flex-1 text-right text-[11px] font-black text-white truncate">{row.awayTeam}</span>
                  </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
              <button
                type="button"
                disabled={isFinished}
                onClick={() => {
                  if (isFinished) return;
                  // Persistimos sin ida/vuelta.
                  saveTournamentMatchesById(clubScopeId, tournamentId, normalizeSingleLegMatches(matches));
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
              >
                <Save className="h-3.5 w-3.5" />
                Guardar resultados
              </button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Cruces (resumen rápido)
          </CardTitle>
          <CardDescription>Generados desde la clasificación actual (1º/2º de grupo).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Mini
              label="Semifinal 1"
              value={`${groups[0]?.teams[0]?.name ?? "1º Grupo A"} vs ${groups[1]?.teams[1]?.name ?? "2º Grupo B"}`}
            />
            <Mini
              label="Semifinal 2"
              value={`${groups[1]?.teams[0]?.name ?? "1º Grupo B"} vs ${groups[0]?.teams[1]?.name ?? "2º Grupo A"}`}
            />
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
