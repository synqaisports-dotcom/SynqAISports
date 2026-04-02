export type TournamentStatus = "draft" | "published" | "finished";

export type TournamentIndexItem = {
  id: string;
  name: string;
  status: TournamentStatus;
  createdAt: string;
  updatedAt: string;
  primaryCategory?: string;
  footballFormat?: "f11" | "f7" | "futsal";
};

export type TournamentConfig = {
  tournamentName: string;
  /** Categoría principal para la ficha (ej. Alevín). */
  categoryLabel?: string;
  categories: string[];
  teamsCount: number;
  tournamentDays: number;
  startDate: string;
  endDate: string;
  groupsCount: number;
  teamsPerGroup: number;
  timeWindow: "morning" | "afternoon" | "both";
  fieldsCount: number;
  footballFormat?: "f11" | "f7" | "futsal";
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
  halvesCount: 1 | 2;
  minutesPerHalf: number;
  breakMinutes: number;
  bufferBetweenMatches: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
};

export type TournamentRecord = TournamentIndexItem;

export type TournamentTeamsState = {
  teams: Array<{ id: string; name: string; groupIndex?: number }>;
};

export type TournamentGroupMatch = {
  id: string;
  groupIndex: number;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number | null;
  awayGoals: number | null;
  playedAt?: string;
};

export type TournamentMatchResultRow = {
  id: string;
  groupName: string; // "Grupo A", "Grupo B", ...
  localTeam: string;
  awayTeam: string;
  localGoals: number;
  awayGoals: number;
};

export function tournamentsIndexKey(clubId: string) {
  return `synq_tournaments_index_v1_${clubId}`;
}

export function tournamentConfigKey(clubId: string, tournamentId: string) {
  return `synq_tournament_config_v1_${clubId}_${tournamentId}`;
}

export function tournamentTeamsKey(clubId: string, tournamentId: string) {
  return `synq_tournament_teams_v1_${clubId}_${tournamentId}`;
}

export function tournamentMatchesKey(clubId: string, tournamentId: string) {
  return `synq_tournament_matches_v1_${clubId}_${tournamentId}`;
}

export function activeTournamentKey(clubId: string) {
  return `synq_tournaments_active_v1_${clubId}`;
}

export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadTournamentIndex(clubId: string): TournamentIndexItem[] {
  const parsed = safeJsonParse<unknown>(localStorage.getItem(tournamentsIndexKey(clubId)));
  if (!Array.isArray(parsed)) return [];
  const mapped = parsed.map((it): TournamentIndexItem | null => {
    if (!it || typeof it !== "object") return null;
    const r = it as Record<string, unknown>;
    const id = typeof r.id === "string" ? r.id : "";
    const name = typeof r.name === "string" ? r.name : "";
    const status = r.status === "published" || r.status === "finished" || r.status === "draft" ? r.status : "draft";
    const createdAt = typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString();
    const updatedAt = typeof r.updatedAt === "string" ? r.updatedAt : createdAt;
    if (!id || !name) return null;
    return {
      id,
      name,
      status,
      createdAt,
      updatedAt,
      primaryCategory: typeof r.primaryCategory === "string" ? r.primaryCategory : undefined,
      footballFormat: r.footballFormat === "f11" || r.footballFormat === "f7" || r.footballFormat === "futsal" ? r.footballFormat : undefined,
    };
  });
  return mapped.filter((x): x is TournamentIndexItem => x !== null);
}

export function saveTournamentIndex(clubId: string, next: TournamentIndexItem[]) {
  localStorage.setItem(tournamentsIndexKey(clubId), JSON.stringify(next));
}

export function getActiveTournamentId(clubId: string): string | null {
  const raw = localStorage.getItem(activeTournamentKey(clubId));
  const v = typeof raw === "string" ? raw.trim() : "";
  return v ? v : null;
}

export function setActiveTournamentId(clubId: string, tournamentId: string) {
  localStorage.setItem(activeTournamentKey(clubId), tournamentId);
}

export function ensureTournamentId(): string {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function upsertIndexItem(clubId: string, item: TournamentIndexItem) {
  const idx = loadTournamentIndex(clubId);
  const next = [item, ...idx.filter((x) => x.id !== item.id)];
  saveTournamentIndex(clubId, next);
}

export function migrateLegacySingleTournamentIfNeeded(args: {
  clubId: string;
  legacyPlannerKey: string;
  legacyTeamsKey: string;
}): { migrated: boolean; tournamentId?: string } {
  const currentIndex = loadTournamentIndex(args.clubId);
  if (currentIndex.length > 0) return { migrated: false };

  const legacyConfigRaw = localStorage.getItem(args.legacyPlannerKey);
  const legacyTeamsRaw = localStorage.getItem(args.legacyTeamsKey);
  if (!legacyConfigRaw && !legacyTeamsRaw) return { migrated: false };

  const tournamentId = ensureTournamentId();
  const createdAt = new Date().toISOString();

  if (legacyConfigRaw) {
    localStorage.setItem(tournamentConfigKey(args.clubId, tournamentId), legacyConfigRaw);
  }
  if (legacyTeamsRaw) {
    localStorage.setItem(tournamentTeamsKey(args.clubId, tournamentId), legacyTeamsRaw);
  }

  let name = "Torneo (migrado)";
  let primaryCategory: string | undefined;
  let footballFormat: TournamentIndexItem["footballFormat"];
  const legacyParsed = safeJsonParse<Record<string, unknown>>(legacyConfigRaw);
  if (legacyParsed) {
    const tn = typeof legacyParsed.tournamentName === "string" ? legacyParsed.tournamentName.trim() : "";
    if (tn) name = tn;
    const cats = Array.isArray(legacyParsed.categories) ? legacyParsed.categories.filter((c) => typeof c === "string") : [];
    primaryCategory = cats.length > 0 ? String(cats[0]) : undefined;
    const ff = legacyParsed.footballFormat;
    footballFormat = (ff === "f11" || ff === "f7" || ff === "futsal") ? ff : undefined;
  }

  const item: TournamentIndexItem = {
    id: tournamentId,
    name,
    status: "draft",
    createdAt,
    updatedAt: createdAt,
    primaryCategory,
    footballFormat,
  };
  saveTournamentIndex(args.clubId, [item]);
  setActiveTournamentId(args.clubId, tournamentId);

  return { migrated: true, tournamentId };
}

export function loadTournamentConfigById(clubId: string, tournamentId: string | null): TournamentConfig | null {
  if (!tournamentId) return null;
  return safeJsonParse<TournamentConfig>(localStorage.getItem(tournamentConfigKey(clubId, tournamentId)));
}

export function saveTournamentConfigById(clubId: string, tournamentId: string, config: TournamentConfig) {
  localStorage.setItem(tournamentConfigKey(clubId, tournamentId), JSON.stringify(config));
}

export function loadTournamentTeamsById(clubId: string, tournamentId: string | null): any[] {
  if (!tournamentId) return [];
  const parsed = safeJsonParse<unknown>(localStorage.getItem(tournamentTeamsKey(clubId, tournamentId)));
  return Array.isArray(parsed) ? parsed : [];
}

export function saveTournamentTeamsById(clubId: string, tournamentId: string | null, teams: any[]) {
  if (!tournamentId) return;
  localStorage.setItem(tournamentTeamsKey(clubId, tournamentId), JSON.stringify(teams));
}

export function loadTournamentMatchesById(clubId: string, tournamentId: string | null): TournamentMatchResultRow[] {
  if (!tournamentId) return [];
  const parsed = safeJsonParse<unknown>(localStorage.getItem(tournamentMatchesKey(clubId, tournamentId)));
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((m) => {
      if (!m || typeof m !== "object") return null;
      const r = m as Record<string, unknown>;
      const id = typeof r.id === "string" ? r.id : "";
      const groupName = typeof r.groupName === "string" ? r.groupName : "";
      const localTeam = typeof r.localTeam === "string" ? r.localTeam : "";
      const awayTeam = typeof r.awayTeam === "string" ? r.awayTeam : "";
      const localGoals = Number(r.localGoals);
      const awayGoals = Number(r.awayGoals);
      if (!id || !groupName || !localTeam || !awayTeam || Number.isNaN(localGoals) || Number.isNaN(awayGoals)) return null;
      return {
        id,
        groupName,
        localTeam,
        awayTeam,
        localGoals: Math.max(0, localGoals),
        awayGoals: Math.max(0, awayGoals),
      } satisfies TournamentMatchResultRow;
    })
    .filter((x): x is TournamentMatchResultRow => x !== null);
}

export function saveTournamentMatchesById(clubId: string, tournamentId: string | null, matches: TournamentMatchResultRow[]) {
  if (!tournamentId) return;
  localStorage.setItem(tournamentMatchesKey(clubId, tournamentId), JSON.stringify(matches));
}

export function removeTournamentTeamsById(clubId: string, tournamentId: string | null) {
  if (!tournamentId) return;
  localStorage.removeItem(tournamentTeamsKey(clubId, tournamentId));
}

export function removeTournamentMatchesById(clubId: string, tournamentId: string | null) {
  if (!tournamentId) return;
  localStorage.removeItem(tournamentMatchesKey(clubId, tournamentId));
}

export function loadTournamentResultsById(clubId: string, tournamentId: string | null): TournamentMatchResultRow[] {
  return loadTournamentMatchesById(clubId, tournamentId);
}

export type StandingRow = {
  team: string;
  pj: number;
  g: number;
  e: number;
  p: number;
  gf: number;
  gc: number;
  dg: number;
  pts: number;
};

export function computeGroupStandings(args: {
  teams: any[];
  results: TournamentMatchResultRow[];
  config: TournamentConfig | null;
}): Record<string, StandingRow[]> {
  const teams = Array.isArray(args.teams) ? args.teams : [];
  const results = Array.isArray(args.results) ? args.results : [];
  const pointsWin = Math.max(0, Number(args.config?.pointsWin ?? 3) || 0);
  const pointsDraw = Math.max(0, Number(args.config?.pointsDraw ?? 1) || 0);
  const pointsLoss = Math.max(0, Number(args.config?.pointsLoss ?? 0) || 0);

  const byGroup = new Map<string, string[]>();
  for (const t of teams) {
    const name = t && typeof t === "object" ? String((t as { name?: unknown }).name ?? "").trim() : "";
    if (!name) continue;
    const gi = t && typeof t === "object" ? Number((t as { groupIndex?: unknown }).groupIndex ?? 0) : 0;
    const label = `Grupo ${String.fromCharCode(65 + Math.max(0, Number.isFinite(gi) ? gi : 0))}`;
    if (!byGroup.has(label)) byGroup.set(label, []);
    byGroup.get(label)!.push(name);
  }

  // Fallback: inferir grupos mínimos si no hay groupIndex
  if (byGroup.size === 0 && teams.length > 0) {
    const names = teams
      .map((t) => (t && typeof t === "object" ? String((t as { name?: unknown }).name ?? "").trim() : ""))
      .filter((n): n is string => n.length > 0);
    byGroup.set("Grupo A", names);
  }

  const out: Record<string, StandingRow[]> = {};
  for (const [groupName, names] of byGroup.entries()) {
    const rows = names.map((team) => ({ team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }));
    const map = new Map(rows.map((r) => [r.team, r]));
    for (const m of results.filter((r) => r.groupName === groupName)) {
      const l = map.get(m.localTeam);
      const a = map.get(m.awayTeam);
      if (!l || !a) continue;
      l.pj += 1;
      a.pj += 1;
      l.gf += m.localGoals;
      l.gc += m.awayGoals;
      a.gf += m.awayGoals;
      a.gc += m.localGoals;
      if (m.localGoals > m.awayGoals) {
        l.g += 1;
        a.p += 1;
        l.pts += pointsWin;
        a.pts += pointsLoss;
      } else if (m.localGoals < m.awayGoals) {
        a.g += 1;
        l.p += 1;
        a.pts += pointsWin;
        l.pts += pointsLoss;
      } else {
        l.e += 1;
        a.e += 1;
        l.pts += pointsDraw;
        a.pts += pointsDraw;
      }
    }
    for (const r of rows) r.dg = r.gf - r.gc;
    rows.sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.team.localeCompare(y.team));
    out[groupName] = rows;
  }
  return out;
}

export function buildTournamentBracketFromResults(args: {
  standingsByGroup: Record<string, StandingRow[]>;
}): { semiFinals: Array<{ left: string; right: string }>; final: Array<{ left: string; right: string }> } {
  const groups = Object.keys(args.standingsByGroup).sort();
  const first = groups[0] ? args.standingsByGroup[groups[0]] : [];
  const second = groups[1] ? args.standingsByGroup[groups[1]] : [];
  const sf1 = {
    left: first?.[0]?.team ?? "1º Grupo A",
    right: second?.[1]?.team ?? "2º Grupo B",
  };
  const sf2 = {
    left: second?.[0]?.team ?? "1º Grupo B",
    right: first?.[1]?.team ?? "2º Grupo A",
  };
  return {
    semiFinals: [sf1, sf2],
    final: [{ left: "Ganador SF1", right: "Ganador SF2" }],
  };
}

// --------- Aliases/compat para pantallas (nombres anteriores) ---------
export const createTournamentId = ensureTournamentId;
export const ensureMigratedTournaments = (clubId: string) =>
  migrateLegacySingleTournamentIfNeeded({
    clubId,
    legacyPlannerKey: `synq_tournaments_planner_v1_${clubId}`,
    legacyTeamsKey: `synq_tournaments_teams_v1_${clubId}`,
  });

export const listTournamentsLocal = (clubId: string): TournamentRecord[] => loadTournamentIndex(clubId);
export const readTournamentConfigLocal = (clubId: string, tournamentId: string): TournamentConfig | null =>
  loadTournamentConfigById(clubId, tournamentId);
export const readTournamentTeamsLocal = (clubId: string, tournamentId: string): { teams: string[] } | null => {
  const raw = safeJsonParse<unknown>(localStorage.getItem(tournamentTeamsKey(clubId, tournamentId)));
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const names = raw
      .map((t) => (t && typeof t === "object" ? (t as any).name : t))
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    return { teams: names };
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as any).teams)) {
    const names = (raw as any).teams.filter((x: any) => typeof x === "string" && x.trim().length > 0);
    return { teams: names };
  }
  return null;
};

export const readActiveTournamentId = getActiveTournamentId;
export const writeActiveTournamentId = setActiveTournamentId;
export const readTournamentsIndex = loadTournamentIndex;

export const migrateLegacyTournamentToV2 = ensureMigratedTournaments;

export function upsertTournament(args: { clubId: string; tournamentId: string; config: TournamentConfig; status?: TournamentStatus }) {
  const now = new Date().toISOString();
  const existing = loadTournamentIndex(args.clubId).find((x) => x.id === args.tournamentId);
  const name = String(args.config.tournamentName || "").trim() || existing?.name || "Torneo";
  const primaryCategory =
    (args.config.categoryLabel?.trim() || "") ||
    (Array.isArray(args.config.categories) && args.config.categories.length > 0 ? String(args.config.categories[0]) : undefined);
  const item: TournamentIndexItem = {
    id: args.tournamentId,
    name,
    status: args.status ?? existing?.status ?? "draft",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    primaryCategory,
    footballFormat: args.config.footballFormat,
  };
  saveTournamentConfigById(args.clubId, args.tournamentId, args.config);
  upsertIndexItem(args.clubId, item);
  setActiveTournamentId(args.clubId, args.tournamentId);
}

