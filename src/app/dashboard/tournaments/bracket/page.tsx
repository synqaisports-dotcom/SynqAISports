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
  safeJsonParse,
  setActiveTournamentId,
  tournamentConfigKey,
} from "@/lib/tournaments-storage";

type BracketRound = {
  title: string;
  pairings: Array<{ left: string; right: string }>;
};

type BracketView = {
  title: string;
  rounds: BracketRound[];
};

type ScheduledBracketMatch = {
  bracketTitle?: string;
  phaseTitle: string;
  matchIndex: number;
  field: string;
  day: number;
  start: string;
  end: string;
  left: string;
  right: string;
};

type BracketResultRow = {
  id: string;
  localTeam: string;
  awayTeam: string;
  localGoals: number;
  awayGoals: number;
  status?: "open" | "closed";
};

function tournamentBracketResultsKey(clubId: string, tournamentId: string) {
  return `synq_tournament_bracket_results_v1_${clubId}_${tournamentId}`;
}

function bracketMatchId(bracketTitle: string, phaseTitle: string, left: string, right: string) {
  return `${String(bracketTitle || "").trim()}__${String(phaseTitle || "").trim()}__${canonicalPair(left, right)}`;
}

function resolveRoundsWithWinners(args: {
  bracketTitle: string;
  rounds: BracketRound[];
  bracketResults: Map<string, BracketResultRow>;
}): BracketRound[] {
  const resolved = args.rounds.map((r) => ({ title: r.title, pairings: r.pairings.map((p) => ({ ...p })) }));
  for (let ri = 0; ri < args.rounds.length - 1; ri++) {
    const baseRound = args.rounds[ri]!;
    const currentResolvedRound = resolved[ri]!;
    const nextResolvedRound = resolved[ri + 1]!;
    for (let mi = 0; mi < baseRound.pairings.length; mi++) {
      const basePair = baseRound.pairings[mi]!;
      const resolvedPair = currentResolvedRound.pairings[mi]!;
      const rid = bracketMatchId(args.bracketTitle, baseRound.title, basePair.left, basePair.right);
      const row = args.bracketResults.get(rid);
      if (!row || row.status !== "closed" || row.localGoals === row.awayGoals) continue;
      const winner = row.localGoals > row.awayGoals ? resolvedPair.left : resolvedPair.right;
      const token = `Ganador ${basePair.left} vs ${basePair.right}`;
      for (let ni = 0; ni < nextResolvedRound.pairings.length; ni++) {
        const n = nextResolvedRound.pairings[ni]!;
        if (n.left === token) n.left = winner;
        if (n.right === token) n.right = winner;
      }
    }
  }
  return resolved;
}

function canCloseMatch(row: BracketResultRow | undefined): boolean {
  if (!row) return false;
  return row.localGoals !== row.awayGoals;
}

function winnerTeamFromRow(row: BracketResultRow | undefined): string | null {
  if (!row || row.status !== "closed" || row.localGoals === row.awayGoals) return null;
  return row.localGoals > row.awayGoals ? row.localTeam : row.awayTeam;
}

function inferGroupIndexFromTeamRow(t: any): number | null {
  if (!t || typeof t !== "object") return null;
  const groupIndexRaw = (t as { groupIndex?: unknown }).groupIndex;
  let gi = typeof groupIndexRaw === "number" && Number.isFinite(groupIndexRaw) ? groupIndexRaw : NaN;
  if (!Number.isFinite(gi)) {
    const id = String((t as { id?: unknown }).id ?? "").trim();
    const m = /^slot_(\d+)_\d+$/i.exec(id);
    if (m) gi = Number(m[1]);
  }
  return Number.isFinite(gi) ? Math.max(0, gi) : null;
}

function inferGroupIndexFromTeamName(name: string): number | null {
  const n = String(name || "").trim();
  if (!n) return null;
  const m = /grupo\s+([a-z])/i.exec(n);
  if (!m) return null;
  const ch = m[1]!.toUpperCase();
  const code = ch.charCodeAt(0);
  if (code < 65 || code > 90) return null;
  return code - 65;
}

function groupTextColorByIndex(groupIndex: number): string {
  const palette = [
    "0 242 255", // cyan SynqAI
    "56 189 248", // sky
    "168 85 247", // violet
    "45 212 191", // teal
    "250 204 21", // amber
    "251 146 60", // orange
    "244 114 182", // pink
    "34 197 94", // green
  ];
  return palette[Math.max(0, groupIndex) % palette.length] ?? "255 255 255";
}

function teamNameColorStyle(name: string, groupIndexByTeam?: Map<string, number>): { color: string } | undefined {
  const direct = groupIndexByTeam?.get(String(name || "").trim());
  const inferred = typeof direct === "number" ? direct : inferGroupIndexFromTeamName(name);
  if (typeof inferred !== "number") return undefined;
  return { color: `rgb(${groupTextColorByIndex(inferred)} / 0.95)` };
}

function canonicalPair(a: string, b: string): string {
  return [String(a || "").trim(), String(b || "").trim()].sort((x, y) => x.localeCompare(y)).join("__vs__");
}

function phaseRank(title: string): number {
  const t = String(title || "").toLowerCase();
  if (t.includes("octavos")) return 5;
  if (t.includes("cuartos")) return 4;
  if (t.includes("semifinal")) return 3;
  if (t.includes("final")) return 2;
  return 1;
}

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

function toMinutes(hhmm: string): number {
  const [h, m] = String(hhmm || "00:00").split(":").map((v) => Number(v));
  return Math.max(0, (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0));
}

function toHHMM(totalMinutes: number): string {
  const minsInDay = 24 * 60;
  const normalized = ((Math.round(totalMinutes) % minsInDay) + minsInDay) % minsInDay;
  const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
  const mm = String(normalized % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function addMinutesToHHMM(hhmm: string, delta: number) {
  return toHHMM(toMinutes(hhmm) + delta);
}

function clampStartToRange(start: string, range: { start: string; end: string }) {
  if (toMinutes(start) < toMinutes(range.start)) return range.start;
  if (toMinutes(start) > toMinutes(range.end)) return range.end;
  return start;
}

function buildRoundRobinRounds(teams: string[]): Array<Array<{ home: string; away: string }>> {
  const names = teams.map((t) => String(t || "").trim()).filter(Boolean);
  if (names.length < 2) return [];
  const list = [...names];
  if (list.length % 2 === 1) list.push("BYE");
  const n = list.length;
  const rounds: Array<Array<{ home: string; away: string }>> = [];
  const fixed = list[0];
  let rot = list.slice(1);
  for (let r = 0; r < n - 1; r++) {
    const left = [fixed, ...rot.slice(0, n / 2 - 1)];
    const right = rot.slice(n / 2 - 1).slice().reverse();
    const pairings: Array<{ home: string; away: string }> = [];
    for (let i = 0; i < left.length; i++) {
      const a = left[i];
      const b = right[i];
      if (a === "BYE" || b === "BYE") continue;
      pairings.push(r % 2 === 0 ? { home: a, away: b } : { home: b, away: a });
    }
    rounds.push(pairings);
    rot = [rot[rot.length - 1], ...rot.slice(0, rot.length - 1)];
  }
  return rounds;
}

function estimateGroupsEndMinutes(args: {
  config: ReturnType<typeof loadTournamentConfigById> | null;
  teamsRows: any[];
}): number {
  const cfg = args.config;
  const start = String(cfg?.scheduleStart ?? "09:00");
  const startMinutes = toMinutes(start);
  const fieldsCount = Math.max(1, Number(cfg?.fieldsCount ?? 1) || 1);
  const tournamentDays = Math.max(1, Number(cfg?.tournamentDays ?? 1) || 1);
  const scheduleMode = cfg?.scheduleMode === "rounds_by_group" ? "rounds_by_group" : "normal";

  // Preferimos equipos reales del torneo para evitar subestimar la liguilla.
  const byGroup = new Map<number, number>();
  for (const t of Array.isArray(args.teamsRows) ? args.teamsRows : []) {
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
    if (!Number.isFinite(gi)) gi = 0;
    byGroup.set(gi, (byGroup.get(gi) ?? 0) + 1);
  }
  const realGroups = Array.from(byGroup.entries())
    .filter(([, n]) => n > 0)
    .sort((a, b) => a[0] - b[0]);
  const fallbackGroupsCount = Math.max(1, Number(cfg?.groupsCount ?? 1) || 1);
  const fallbackTeamsPerGroup = Math.max(2, Number(cfg?.teamsPerGroup ?? 0) || 2);
  const groups =
    realGroups.length > 0
      ? realGroups.map(([idx, size]) => ({ idx, size }))
      : Array.from({ length: fallbackGroupsCount }, (_, idx) => ({ idx, size: fallbackTeamsPerGroup }));
  const halves = Number(cfg?.halvesCount ?? 2) === 1 ? 1 : 2;
  const minutesPerHalf = Math.max(1, Number(cfg?.minutesPerHalf ?? 20) || 20);
  const breakMinutes = halves === 2 ? Math.max(0, Number(cfg?.breakMinutes ?? 0)) : 0;
  const buffer = Math.max(0, Number(cfg?.bufferBetweenMatches ?? 0));
  const matchMinutes = halves * minutesPerHalf + breakMinutes;
  const slotMinutes = Math.max(1, matchMinutes + buffer);
  const timeWindow = (cfg?.timeWindow ?? "both") as "morning" | "afternoon" | "both";
  const ranges: Array<{ start: string; end: string }> = [];
  if (timeWindow === "morning" || timeWindow === "both") {
    ranges.push({ start: String(cfg?.morningStart ?? "09:00"), end: String(cfg?.morningEnd ?? "14:00") });
  }
  if (timeWindow === "afternoon" || timeWindow === "both") {
    ranges.push({ start: String(cfg?.afternoonStart ?? "16:00"), end: String(cfg?.afternoonEnd ?? "21:00") });
  }
  const slots: Array<{ day: number; start: string; end: string }> = [];
  if (slotMinutes > 0 && ranges.length > 0) {
    for (let day = 1; day <= tournamentDays; day++) {
      for (const r of ranges) {
        let cur = r.start;
        if (start) cur = clampStartToRange(start, r);
        while (toMinutes(addMinutesToHHMM(cur, matchMinutes)) <= toMinutes(r.end)) {
          slots.push({ day, start: cur, end: addMinutesToHHMM(cur, matchMinutes) });
          cur = addMinutesToHHMM(cur, slotMinutes);
        }
      }
    }
  }
  if (slots.length === 0) return startMinutes;

  let requiredSlots = 0;
  if (scheduleMode === "normal") {
    const matchesPerField = new Map<number, number>();
    for (let i = 0; i < groups.length; i++) {
      const size = Math.max(2, groups[i]!.size);
      const groupMatches = (size * (size - 1)) / 2;
      const fi = i % fieldsCount;
      matchesPerField.set(fi, (matchesPerField.get(fi) ?? 0) + groupMatches);
    }
    requiredSlots = Math.max(0, ...Array.from(matchesPerField.values()));
  } else {
    // Simulación equivalente al modo "por jornadas y grupo" de clasificación (nivel slots).
    const groupMeta = groups.map((g) => {
      const names = Array.from({ length: Math.max(2, g.size) }, (_, i) => `G${g.idx}_T${i + 1}`);
      const rounds = buildRoundRobinRounds(names).map((r) => r.length);
      return { rounds, roundIdx: 0, matchIdx: 0, scheduled: 0, total: rounds.reduce((a, b) => a + b, 0) };
    });
    const hasRemaining = (g: (typeof groupMeta)[number]) => g.scheduled < g.total;
    const pickNext = () => {
      let best = -1;
      let bestScore = Number.POSITIVE_INFINITY;
      for (let i = 0; i < groupMeta.length; i++) {
        const g = groupMeta[i]!;
        if (!hasRemaining(g)) continue;
        const totalRounds = Math.max(1, g.rounds.length);
        const progressRounds = Math.min(totalRounds, g.roundIdx + (g.matchIdx > 0 ? 0.5 : 0));
        const progressMatches = g.scheduled / Math.max(1, g.total);
        const score = progressRounds / totalRounds + progressMatches;
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }
      return best;
    };
    let usedSlots = 0;
    for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
      let fieldCursor = 0;
      let safety = 0;
      let usedThisSlot = false;
      while (fieldCursor < fieldsCount && safety < 50) {
        safety += 1;
        const gi = pickNext();
        if (gi < 0) break;
        const g = groupMeta[gi]!;
        const roundLen = g.rounds[g.roundIdx] ?? 0;
        const remainingInRound = Math.max(0, roundLen - g.matchIdx);
        if (remainingInRound === 0) {
          g.roundIdx += 1;
          g.matchIdx = 0;
          continue;
        }
        const take = Math.max(0, Math.min(fieldsCount - fieldCursor, remainingInRound));
        if (take <= 0) break;
        usedThisSlot = true;
        g.matchIdx += take;
        g.scheduled += take;
        if (g.matchIdx >= roundLen) {
          g.roundIdx += 1;
          g.matchIdx = 0;
        }
        fieldCursor += take;
      }
      if (usedThisSlot) usedSlots = slotIdx + 1;
    }
    requiredSlots = usedSlots;
  }

  const slotIndexEnd = Math.max(0, requiredSlots - 1);
  if (slotIndexEnd < slots.length) {
    const endSlot = slots[slotIndexEnd]!;
    return (endSlot.day - 1) * 24 * 60 + toMinutes(endSlot.end);
  }
  return startMinutes + requiredSlots * slotMinutes;
}

function buildBracketSchedule(args: {
  rounds: BracketRound[];
  fieldsCount: number;
  startAt: string;
  matchMinutes: number;
}) {
  const out: ScheduledBracketMatch[] = [];
  let cursor = toMinutes(args.startAt);
  const fields = Math.max(1, args.fieldsCount || 1);
  const duration = Math.max(1, args.matchMinutes || 1);
  for (const round of args.rounds) {
    const pairings = Array.isArray(round.pairings) ? round.pairings : [];
    const activeFields = Math.max(1, Math.min(fields, pairings.length || 1));
    const slotsNeeded = Math.max(1, Math.ceil((pairings.length || 0) / activeFields));
    for (let i = 0; i < pairings.length; i++) {
      const slot = Math.floor(i / activeFields);
      const fieldIndex = i % activeFields;
      const start = cursor + slot * duration;
      const end = start + duration;
      out.push({
        phaseTitle: round.title,
        matchIndex: i,
        field: `Campo ${fieldIndex + 1}`,
        day: 1,
        start: toHHMM(start),
        end: toHHMM(end),
        left: pairings[i]?.left ?? "",
        right: pairings[i]?.right ?? "",
      });
    }
    cursor += slotsNeeded * duration;
  }
  return out;
}

function buildBracketScheduleForViews(args: {
  views: Array<{ title: string; rounds: BracketRound[] }>;
  fieldsCount: number;
  startAt: string;
  matchMinutes: number;
}) {
  const out = new Map<string, ScheduledBracketMatch>();
  let cursor = toMinutes(args.startAt);
  const fields = Math.max(1, args.fieldsCount || 1);
  const duration = Math.max(1, args.matchMinutes || 1);
  const staged = new Map<number, Array<{ viewTitle: string; phaseTitle: string; left: string; right: string }>>();

  for (const v of args.views) {
    for (const round of v.rounds) {
      const rank = phaseRank(round.title);
      if (!staged.has(rank)) staged.set(rank, []);
      for (const p of round.pairings ?? []) {
        staged.get(rank)!.push({
          viewTitle: v.title,
          phaseTitle: round.title,
          left: p.left,
          right: p.right,
        });
      }
    }
  }

  const ranks = Array.from(staged.keys()).sort((a, b) => b - a);
  for (const rank of ranks) {
    const matches = staged.get(rank) ?? [];
    if (matches.length === 0) continue;
    const slotsNeeded = Math.max(1, Math.ceil(matches.length / fields));
    for (let i = 0; i < matches.length; i++) {
      const slot = Math.floor(i / fields);
      const fieldIndex = i % fields;
      const start = cursor + slot * duration;
      const end = start + duration;
      const m = matches[i]!;
      const row: ScheduledBracketMatch = {
        bracketTitle: m.viewTitle,
        phaseTitle: m.phaseTitle,
        matchIndex: i,
        field: `Campo ${fieldIndex + 1}`,
        day: 1,
        start: toHHMM(start),
        end: toHHMM(end),
        left: m.left,
        right: m.right,
      };
      out.set(`${m.viewTitle}__${m.phaseTitle}__${canonicalPair(m.left, m.right)}`, row);
    }
    cursor += slotsNeeded * duration;
  }

  return out;
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

function buildGroupLabelsFromConfig(config: ReturnType<typeof loadTournamentConfigById>): string[] {
  const groupsCount = Math.max(1, Number(config?.groupsCount ?? 1) || 1);
  return Array.from({ length: groupsCount }).map((_, i) => `Grupo ${String.fromCharCode(65 + i)}`);
}

function buildNormalBracket(args: {
  standingsByGroup: Record<string, Array<{ team: string }>>;
  includeThirdFourth?: boolean;
  config: ReturnType<typeof loadTournamentConfigById>;
}): BracketView {
  const gnames = Object.keys(args.standingsByGroup).sort();
  const fallbackGroupNames = gnames.length > 0 ? gnames : buildGroupLabelsFromConfig(args.config);
  const includeThirdFourth = !!args.includeThirdFourth;
  // Clasificación mínima: 1º y 2º por grupo
  const firsts = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: 1 });
  const seconds = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: 2 });

  // Seed simple por parejas de grupos: A1 vs B2, B1 vs A2, C1 vs D2, D1 vs C2...
  const teams: string[] = [];
  for (let i = 0; i < fallbackGroupNames.length; i += 2) {
    const gA = fallbackGroupNames[i];
    const gB = fallbackGroupNames[i + 1];
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
      const a1p = a1 || (gA ? `1º ${gA}` : "");
      const a2p = a2 || (gA ? `2º ${gA}` : "");
      const a3p = a3 || (gA ? `3º ${gA}` : "");
      const a4p = a4 || (gA ? `4º ${gA}` : "");
      const b1p = b1 || (gB ? `1º ${gB}` : "");
      const b2p = b2 || (gB ? `2º ${gB}` : "");
      const b3p = b3 || (gB ? `3º ${gB}` : "");
      const b4p = b4 || (gB ? `4º ${gB}` : "");

      if (a1p && b4p) teams.push(a1p, b4p);
      else if (a1p) teams.push(a1p);
      if (b1p && a4p) teams.push(b1p, a4p);
      else if (b1p) teams.push(b1p);
      if (a2p && b3p) teams.push(a2p, b3p);
      else if (a2p) teams.push(a2p);
      if (b2p && a3p) teams.push(b2p, a3p);
      else if (b2p) teams.push(b2p);
    } else {
      const a1p = a1 || (gA ? `1º ${gA}` : "");
      const a2p = a2 || (gA ? `2º ${gA}` : "");
      const b1p = b1 || (gB ? `1º ${gB}` : "");
      const b2p = b2 || (gB ? `2º ${gB}` : "");
      if (a1p && b2p) teams.push(a1p, b2p);
      else if (a1p) teams.push(a1p);
      if (b1p && a2p) teams.push(b1p, a2p);
      else if (b1p) teams.push(b1p);
    }
  }

  // Fallback por si no hay 2º: usar los que existan
  const fallbackPlaceholders = fallbackGroupNames.flatMap((g) => [`1º ${g}`, `2º ${g}`]);
  const fallback = [...new Set([...firsts, ...seconds, ...fallbackPlaceholders].filter(Boolean))];
  const seeded = teams.filter(Boolean);
  // Tope de cuadro: máximo desde octavos (16 equipos).
  const finalTeams = (seeded.length >= 2 ? seeded : fallback).slice(0, 16);

  return {
    title: includeThirdFourth ? "Modo normal · Cuadro ampliado (1º-4º)" : "Modo normal · Cuadro único",
    rounds: buildEliminationRounds({ teams: finalTeams }),
  };
}

function buildFourFinals(args: {
  standingsByGroup: Record<string, Array<{ team: string }>>;
  config: ReturnType<typeof loadTournamentConfigById>;
}): BracketView[] {
  const finals = [
    { title: "Final Platino", place: 1 },
    { title: "Final Oro", place: 2 },
    { title: "Final Plata", place: 3 },
    { title: "Final Bronce", place: 4 },
  ] as const;
  const fallbackGroupNames = Object.keys(args.standingsByGroup).sort();
  const groupNames = fallbackGroupNames.length > 0 ? fallbackGroupNames : buildGroupLabelsFromConfig(args.config);

  return finals.map((f) => {
    // Tope de cuadro por final: máximo octavos (16 equipos).
    const seeded = pickSeededTeams({ standingsByGroup: args.standingsByGroup, place: f.place });
    const placeholders = groupNames.map((g) => `${f.place}º ${g}`);
    const teams = (seeded.length > 0 ? seeded : placeholders).slice(0, 16);
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
  textStyle,
}: {
  name: string;
  crest?: string;
  textStyle?: { color: string };
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
      <span className="text-[11px] font-black truncate" style={textStyle}>{name}</span>
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
  const [bracketResults, setBracketResults] = useState<Map<string, BracketResultRow>>(new Map());

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
      const cfgKey = tournamentConfigKey(clubScopeId, resolvedTournamentId);
      if (e.key === key || e.key === cfgKey) bump();
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

  useEffect(() => {
    if (!resolvedTournamentId) {
      setBracketResults(new Map());
      return;
    }
    try {
      const raw = localStorage.getItem(tournamentBracketResultsKey(clubScopeId, resolvedTournamentId));
      const parsed = safeJsonParse<unknown>(raw);
      const rows = Array.isArray(parsed) ? parsed : [];
      const next = new Map<string, BracketResultRow>();
      for (const row of rows) {
        if (!row || typeof row !== "object") continue;
        const r = row as Partial<BracketResultRow>;
        const id = String(r.id ?? "").trim();
        const localTeam = String(r.localTeam ?? "").trim();
        const awayTeam = String(r.awayTeam ?? "").trim();
        const localGoals = Math.max(0, Number(r.localGoals ?? 0) || 0);
        const awayGoals = Math.max(0, Number(r.awayGoals ?? 0) || 0);
        if (!id || !localTeam || !awayTeam) continue;
        next.set(id, { id, localTeam, awayTeam, localGoals, awayGoals });
      }
      setBracketResults(next);
    } catch {
      setBracketResults(new Map());
    }
  }, [clubScopeId, resolvedTournamentId, reloadKey]);

  useEffect(() => {
    if (!resolvedTournamentId) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(
          tournamentBracketResultsKey(clubScopeId, resolvedTournamentId),
          JSON.stringify(Array.from(bracketResults.values())),
        );
      } catch {
        // ignore
      }
    }, 250);
    return () => window.clearTimeout(id);
  }, [clubScopeId, resolvedTournamentId, bracketResults]);

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
  const groupIndexByTeam = useMemo(() => {
    const out = new Map<string, number>();
    for (const t of teamsRows) {
      if (!t || typeof t !== "object") continue;
      const name = String((t as { name?: unknown }).name ?? "").trim();
      if (!name) continue;
      const gi = inferGroupIndexFromTeamRow(t);
      if (typeof gi === "number") out.set(name, gi);
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
  const normal = useMemo(
    () => buildNormalBracket({ standingsByGroup: standings as any, includeThirdFourth, config }),
    [standings, includeThirdFourth, config],
  );
  const fourFinals = useMemo(() => buildFourFinals({ standingsByGroup: standings as any, config }), [standings, config]);
  const globalFourFinalsSchedule = useMemo(() => {
    if (mode !== "four_finals") return new Map<string, ScheduledBracketMatch>();
    const bracketStartAt = toHHMM(estimateGroupsEndMinutes({ config, teamsRows }) + 15);
    const matchMinutes = Math.max(
      1,
      (Number(config?.halvesCount ?? 2) === 1 ? 1 : 2) * Math.max(1, Number(config?.minutesPerHalf ?? 20))
        + (Number(config?.halvesCount ?? 2) === 2 ? Math.max(0, Number(config?.breakMinutes ?? 0)) : 0),
    );
    return buildBracketScheduleForViews({
      views: fourFinals,
      fieldsCount: Math.max(1, Number(config?.fieldsCount ?? 1) || 1),
      startAt: bracketStartAt,
      matchMinutes,
    });
  }, [mode, fourFinals, config, teamsRows]);

  const upsertBracketResult = (id: string, localTeam: string, awayTeam: string, localGoals: number, awayGoals: number) => {
    const normalizedId = String(id || "").trim();
    if (!normalizedId) return;
    setBracketResults((prev) => {
      const next = new Map(prev);
      next.set(normalizedId, {
        id: normalizedId,
        localTeam: String(localTeam || "").trim(),
        awayTeam: String(awayTeam || "").trim(),
        localGoals: Math.max(0, Number(localGoals) || 0),
        awayGoals: Math.max(0, Number(awayGoals) || 0),
      });
      return next;
    });
  };

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
            {mode === "normal" ? (
              <BracketColumns
                title={normal.title}
                rounds={normal.rounds}
                crestByTeam={crestByTeam}
                config={config}
                teamsRows={teamsRows}
                groupIndexByTeam={groupIndexByTeam}
                bracketResults={bracketResults}
                onUpsertResult={upsertBracketResult}
              />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {fourFinals.map((b) => (
                  <BracketColumns
                    key={b.title}
                    title={b.title}
                    rounds={b.rounds}
                    crestByTeam={crestByTeam}
                    config={config}
                    teamsRows={teamsRows}
                    globalScheduleByViewPair={globalFourFinalsSchedule}
                    groupIndexByTeam={groupIndexByTeam}
                    bracketResults={bracketResults}
                    onUpsertResult={upsertBracketResult}
                  />
                ))}
              </div>
            )}
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
  config,
  teamsRows,
  globalScheduleByViewPair,
  groupIndexByTeam,
  bracketResults,
  onUpsertResult,
}: {
  title: string;
  rounds: BracketRound[];
  crestByTeam: Map<string, string>;
  config: ReturnType<typeof loadTournamentConfigById>;
  teamsRows: any[];
  globalScheduleByViewPair?: Map<string, ScheduledBracketMatch>;
  groupIndexByTeam?: Map<string, number>;
  bracketResults: Map<string, BracketResultRow>;
  onUpsertResult: (id: string, localTeam: string, awayTeam: string, localGoals: number, awayGoals: number) => void;
}) {
  const tones = finalsStyle(title);
  const bracketStartAt = useMemo(() => {
    const groupsEndMinutes = estimateGroupsEndMinutes({ config, teamsRows });
    // Cruces: después de terminar la liguilla + 15 min de margen.
    return toHHMM(groupsEndMinutes + 15);
  }, [config, teamsRows]);
  const matchMinutes = Math.max(
    1,
    (Number(config?.halvesCount ?? 2) === 1 ? 1 : 2) * Math.max(1, Number(config?.minutesPerHalf ?? 20))
      + (Number(config?.halvesCount ?? 2) === 2 ? Math.max(0, Number(config?.breakMinutes ?? 0)) : 0),
  );
  const scheduled = useMemo(
    () =>
      buildBracketSchedule({
        rounds,
        fieldsCount: Math.max(1, Number(config?.fieldsCount ?? 1) || 1),
        startAt: bracketStartAt,
        matchMinutes,
      }),
    [rounds, config, matchMinutes, bracketStartAt],
  );
  const localScheduledByPair = useMemo(() => {
    const map = new Map<string, ScheduledBracketMatch>();
    for (const s of scheduled) {
      map.set(`${s.phaseTitle}__${canonicalPair(s.left, s.right)}`, s);
    }
    return map;
  }, [scheduled]);
  const scheduledByPair = useMemo(() => {
    if (!globalScheduleByViewPair || globalScheduleByViewPair.size === 0) return localScheduledByPair;
    const map = new Map<string, ScheduledBracketMatch>();
    for (const round of rounds) {
      for (const p of round.pairings ?? []) {
        const k = `${title}__${round.title}__${canonicalPair(p.left, p.right)}`;
        const row = globalScheduleByViewPair.get(k);
        if (row) map.set(`${round.title}__${canonicalPair(p.left, p.right)}`, row);
      }
    }
    return map;
  }, [globalScheduleByViewPair, localScheduledByPair, rounds, title]);
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
            bracketTitle={title}
            crestByTeam={crestByTeam}
            lineClass={tones.borderClass.replace("border-", "bg-")}
            textClass={tones.textClass}
            scheduledByPair={scheduledByPair}
            groupIndexByTeam={groupIndexByTeam}
            bracketResults={bracketResults}
            onUpsertResult={onUpsertResult}
          />
        ) : (
          <ClassicBracket
            rounds={rounds}
            bracketTitle={title}
            crestByTeam={crestByTeam}
            lineClass={tones.borderClass.replace("border-", "bg-")}
            scheduledByPair={scheduledByPair}
            groupIndexByTeam={groupIndexByTeam}
            bracketResults={bracketResults}
            onUpsertResult={onUpsertResult}
          />
        )
      )}
    </div>
  );
}

function SplitClassicBracket({
  rounds,
  bracketTitle,
  crestByTeam,
  lineClass,
  textClass,
  scheduledByPair,
  groupIndexByTeam,
  bracketResults,
  onUpsertResult,
}: {
  rounds: BracketRound[];
  bracketTitle: string;
  crestByTeam: Map<string, string>;
  lineClass: string;
  textClass: string;
  scheduledByPair: Map<string, ScheduledBracketMatch>;
  groupIndexByTeam?: Map<string, number>;
  bracketResults: Map<string, BracketResultRow>;
  onUpsertResult: (id: string, localTeam: string, awayTeam: string, localGoals: number, awayGoals: number) => void;
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
        <ClassicBracket
          rounds={leftRounds}
          bracketTitle={bracketTitle}
          crestByTeam={crestByTeam}
          lineClass={lineClass}
          scheduledByPair={scheduledByPair}
          groupIndexByTeam={groupIndexByTeam}
          bracketResults={bracketResults}
          onUpsertResult={onUpsertResult}
        />
        <div className="relative" style={{ height: `${canvasHeight}px` }}>
          <div className="absolute left-0 right-0" style={{ top: `${Math.max(0, finalTop - 8)}px` }}>
            <div className="flex flex-col items-center gap-1">
              <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${textClass}`}>Final</p>
            </div>
            <div className="mt-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-3 py-2">
              {finalPairing ? (
                <div className="mb-1 flex items-center justify-between gap-2">
                  {(() => {
                    const meta = scheduledByPair.get(`Final__${canonicalPair(finalPairing.left, finalPairing.right)}`);
                    return (
                      <span className="inline-flex items-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200">
                        {meta ? `D${meta.day} · ${meta.field} · ${meta.start}` : "Horario pendiente"}
                      </span>
                    );
                  })()}
                  <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9px] font-black text-white/80 tabular-nums">
                    {(() => {
                      const rid = bracketMatchId(bracketTitle, "Final", finalPairing.left, finalPairing.right);
                      const row = bracketResults.get(rid);
                      return (
                        <span className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={row?.localGoals ?? 0}
                            onChange={(e) =>
                              onUpsertResult(
                                rid,
                                finalPairing.left,
                                finalPairing.right,
                                Math.max(0, Number(e.target.value) || 0),
                                row?.awayGoals ?? 0,
                              )
                            }
                            className="h-5 w-8 rounded border border-white/20 bg-black/25 px-1 text-center text-[9px] font-black text-white outline-none"
                          />
                          <span>:</span>
                          <input
                            type="number"
                            min={0}
                            value={row?.awayGoals ?? 0}
                            onChange={(e) =>
                              onUpsertResult(
                                rid,
                                finalPairing.left,
                                finalPairing.right,
                                row?.localGoals ?? 0,
                                Math.max(0, Number(e.target.value) || 0),
                              )
                            }
                            className="h-5 w-8 rounded border border-white/20 bg-black/25 px-1 text-center text-[9px] font-black text-white outline-none"
                          />
                        </span>
                      );
                    })()}
                  </span>
                </div>
              ) : null}
              {finalPairing ? (
                <>
                  <TeamBadge
                    name={finalPairing.left}
                    crest={crestByTeam.get(finalPairing.left)}
                    textStyle={teamNameColorStyle(finalPairing.left, groupIndexByTeam)}
                  />
                  <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
                  <TeamBadge
                    name={finalPairing.right}
                    crest={crestByTeam.get(finalPairing.right)}
                    textStyle={teamNameColorStyle(finalPairing.right, groupIndexByTeam)}
                  />
                </>
              ) : (
                <p className="text-[11px] text-white/60">Sin final</p>
              )}
            </div>
          </div>
        </div>
        <ClassicBracket
          rounds={rightRounds}
          bracketTitle={bracketTitle}
          crestByTeam={crestByTeam}
          lineClass={lineClass}
          reverse
          scheduledByPair={scheduledByPair}
          groupIndexByTeam={groupIndexByTeam}
          bracketResults={bracketResults}
          onUpsertResult={onUpsertResult}
        />
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
  bracketTitle,
  crestByTeam,
  lineClass,
  reverse = false,
  scheduledByPair,
  groupIndexByTeam,
  bracketResults,
  onUpsertResult,
}: {
  rounds: BracketRound[];
  bracketTitle: string;
  crestByTeam: Map<string, string>;
  lineClass: string;
  reverse?: boolean;
  scheduledByPair: Map<string, ScheduledBracketMatch>;
  groupIndexByTeam?: Map<string, number>;
  bracketResults: Map<string, BracketResultRow>;
  onUpsertResult: (id: string, localTeam: string, awayTeam: string, localGoals: number, awayGoals: number) => void;
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
                        phaseTitle={round.title}
                        crestByTeam={crestByTeam}
                        showLeftConnector={roundIndex > 0}
                        showRightConnector={!isLastRound}
                        matchIndex={idx}
                        roundSize={round.pairings.length}
                        mirror={reverse}
                        connectorSpan={connectorSpan}
                        lineBgClass={lineBgClass}
                        schedule={scheduledByPair.get(`${round.title}__${canonicalPair(p.left, p.right)}`)}
                        final={round.title === "Final"}
                        groupIndexByTeam={groupIndexByTeam}
                        resultId={bracketMatchId(bracketTitle, round.title, p.left, p.right)}
                        bracketResults={bracketResults}
                        onUpsertResult={onUpsertResult}
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
  phaseTitle,
  crestByTeam,
  showLeftConnector,
  showRightConnector,
  matchIndex,
  roundSize,
  mirror = false,
  connectorSpan,
  lineBgClass,
  schedule,
  final,
  groupIndexByTeam,
  resultId,
  bracketResults,
  onUpsertResult,
}: {
  left: string;
  right: string;
  phaseTitle: string;
  crestByTeam: Map<string, string>;
  showLeftConnector: boolean;
  showRightConnector: boolean;
  matchIndex: number;
  roundSize: number;
  mirror?: boolean;
  connectorSpan: number;
  lineBgClass: string;
  schedule?: ScheduledBracketMatch;
  final?: boolean;
  groupIndexByTeam?: Map<string, number>;
  resultId: string;
  bracketResults: Map<string, BracketResultRow>;
  onUpsertResult: (id: string, localTeam: string, awayTeam: string, localGoals: number, awayGoals: number) => void;
}) {
  const isEven = matchIndex % 2 === 0;
  const leftX = mirror ? "-right-3" : "-left-3";
  const rightX = mirror ? "-left-3" : "-right-3";
  const row = bracketResults.get(resultId);
  const localGoals = row?.localGoals ?? 0;
  const awayGoals = row?.awayGoals ?? 0;
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
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-cyan-200">
            {schedule ? `D${schedule.day} · ${schedule.field} · ${schedule.start}` : `${phaseTitle} · por definir`}
          </span>
          <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[9px] font-black text-white/80 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <input
                type="number"
                min={0}
                value={localGoals}
                onChange={(e) =>
                  onUpsertResult(resultId, left, right, Math.max(0, Number(e.target.value) || 0), awayGoals)
                }
                className="h-5 w-8 rounded border border-white/20 bg-black/25 px-1 text-center text-[9px] font-black text-white outline-none"
              />
              <span>:</span>
              <input
                type="number"
                min={0}
                value={awayGoals}
                onChange={(e) =>
                  onUpsertResult(resultId, left, right, localGoals, Math.max(0, Number(e.target.value) || 0))
                }
                className="h-5 w-8 rounded border border-white/20 bg-black/25 px-1 text-center text-[9px] font-black text-white outline-none"
              />
            </span>
          </span>
        </div>
        <TeamBadge name={left} crest={crestByTeam.get(left)} textStyle={teamNameColorStyle(left, groupIndexByTeam)} />
        <p className="text-[9px] text-white/45 uppercase tracking-[0.12em]">vs</p>
        <TeamBadge name={right} crest={crestByTeam.get(right)} textStyle={teamNameColorStyle(right, groupIndexByTeam)} />
      </div>
    </div>
  );
}
