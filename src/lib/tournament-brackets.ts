/**
 * Generador de competición: fase de grupos (round-robin) + bandejas paralelas
 * por puesto (Platinum, Silver…) con eliminatorias hasta semifinales, finales
 * y final de consolación.
 */

import {
  CONSOLATION_BRACKET,
  DEFAULT_PLACEMENT_BRACKETS,
  groupCodeFromIndex,
  type PlacementBracketConfig,
  type RoundKey,
  type TournamentCategory,
  type TournamentGroup,
  type TournamentMatch,
  type TournamentPhase,
  type TournamentTeam,
} from '@/lib/tournaments';

export type BracketTeamSlot = {
  team_id: string | null;
  label: string;
  group_code?: string;
  seed?: number;
};

export type GeneratedMatch = {
  temp_id: string;
  phase_id: string;
  group_id: string | null;
  bracket_key: string | null;
  round_key: RoundKey;
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  field_id: string | null;
  scheduled_at: string | null;
  status: TournamentMatch['status'];
  score_home: number;
  score_away: number;
  score_penalties_home: number | null;
  score_penalties_away: number | null;
  went_to_penalties: boolean;
  mesa_token: string | null;
  mesa_token_expires_at: string | null;
  live_started_at: string | null;
  live_finished_at: string | null;
  events_json: TournamentMatch['events_json'];
  metadata_json: Record<string, unknown>;
};

export type GeneratedPhase = Omit<TournamentPhase, 'id' | 'tournament_id' | 'category_id'> & {
  temp_id: string;
};

export type GeneratedGroup = Omit<TournamentGroup, 'id' | 'tournament_id' | 'category_id'> & {
  temp_id: string;
};

export type CompetitionStructure = {
  phases: GeneratedPhase[];
  groups: GeneratedGroup[];
  matches: GeneratedMatch[];
};

type IdFactory = () => string;

function defaultIdFactory(): IdFactory {
  let n = 0;
  return () => `gen-${++n}-${Date.now().toString(36)}`;
}

/** Partidos round-robin para n equipos en un grupo. */
export function roundRobinPairings(teamIds: string[]): [string, string][] {
  const ids = [...teamIds];
  if (ids.length % 2 === 1) ids.push('__bye__');
  const n = ids.length;
  const rounds = n - 1;
  const half = n / 2;
  const pairings: [string, string][] = [];

  const arr = [...ids];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (home !== '__bye__' && away !== '__bye__') {
        pairings.push([home, away]);
      }
    }
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop()!);
    arr.splice(0, arr.length, fixed, ...rest);
  }
  return pairings;
}

/** Siguiente potencia de 2 >= n. */
function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Emparejamientos eliminatorios con byes para n equipos.
 * Devuelve rondas desde primera ronda hasta final.
 */
export function singleEliminationRounds(
  slots: BracketTeamSlot[]
): { round_key: RoundKey; pairings: [BracketTeamSlot, BracketTeamSlot][] }[] {
  const n = slots.length;
  if (n < 2) return [];

  const bracketSize = nextPowerOf2(n);
  const byes = bracketSize - n;

  const seeded = [...slots];
  const rounds: { round_key: RoundKey; pairings: [BracketTeamSlot, BracketTeamSlot][] }[] = [];

  let current = seeded.map((s, i) => ({ ...s, seed: i + 1 }));

  const roundKeysForSize: Record<number, RoundKey[]> = {
    2: ['final'],
    4: ['sf', 'final'],
    8: ['qf', 'sf', 'final'],
    16: ['r16', 'qf', 'sf', 'final'],
  };

  const keys = roundKeysForSize[bracketSize] ?? ['qf', 'sf', 'final'];
  let roundIdx = 0;

  if (byes > 0 && current.length > 2) {
    const playIn = current.slice(byes);
    const byeTeams = current.slice(0, byes);
    const playInPairings: [BracketTeamSlot, BracketTeamSlot][] = [];
    for (let i = 0; i < playIn.length; i += 2) {
      if (playIn[i + 1]) playInPairings.push([playIn[i], playIn[i + 1]]);
    }
    if (playInPairings.length > 0) {
      rounds.push({ round_key: keys[0] ?? 'qf', pairings: playInPairings });
      roundIdx = 1;
    }
    current = [
      ...byeTeams.map((t) => ({ ...t, label: `${t.label} (bye)` })),
      ...playInPairings.map((_, i) => ({
        team_id: null,
        label: 'Por determinar',
        seed: byeTeams.length + i + 1,
      })),
    ];
  }

  while (current.length > 1 && roundIdx < keys.length) {
    const pairings: [BracketTeamSlot, BracketTeamSlot][] = [];
    for (let i = 0; i < current.length; i += 2) {
      if (current[i + 1]) pairings.push([current[i], current[i + 1]]);
    }
    rounds.push({ round_key: keys[roundIdx], pairings });
    current = pairings.map((_, i) => ({
      team_id: null,
      label: 'Por determinar',
      seed: i + 1,
    }));
    roundIdx++;
  }

  return rounds;
}

/** Cruce serpentino entre grupos: 1A, 1B, 1C… para bandeja de puesto N. */
export function placementSlotsFromGroups(
  groupCodes: string[],
  position: number,
  teamsByGroup: Map<string, TournamentTeam[]>
): BracketTeamSlot[] {
  return groupCodes.map((code) => {
    const groupTeams = teamsByGroup.get(code) ?? [];
    const team = groupTeams.find((t) => t.group_position === position) ?? null;
    return {
      team_id: team?.id ?? null,
      label: team?.name ?? `${position}º Grupo ${code}`,
      group_code: code,
    };
  });
}

export function resolvePlacementBrackets(category: Pick<TournamentCategory, 'teams_per_group' | 'placement_brackets_json'>): PlacementBracketConfig[] {
  if (category.placement_brackets_json.length > 0) return category.placement_brackets_json;
  return DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= category.teams_per_group);
}

export function generateGroupPhaseStructure(
  category: Pick<TournamentCategory, 'groups_count' | 'teams_per_group'>,
  phaseTempId: string,
  nextId: IdFactory
): { groups: GeneratedGroup[]; matches: GeneratedMatch[] } {
  const groups: GeneratedGroup[] = [];
  const matches: GeneratedMatch[] = [];
  let matchNum = 1;

  for (let g = 0; g < category.groups_count; g++) {
    const code = groupCodeFromIndex(g);
    const groupTempId = nextId();
    groups.push({
      temp_id: groupTempId,
      phase_id: phaseTempId,
      code,
      name: `Grupo ${code}`,
      sort_order: g,
    });

    const placeholderTeams = Array.from({ length: category.teams_per_group }, (_, i) => `${code}-t${i + 1}`);
    const pairings = roundRobinPairings(placeholderTeams);

    for (const [home, away] of pairings) {
      matches.push({
        temp_id: nextId(),
        phase_id: phaseTempId,
        group_id: groupTempId,
        bracket_key: null,
        round_key: 'group',
        match_number: matchNum++,
        home_team_id: null,
        away_team_id: null,
        field_id: null,
        scheduled_at: null,
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        score_penalties_home: null,
        score_penalties_away: null,
        went_to_penalties: false,
        mesa_token: null,
        mesa_token_expires_at: null,
        live_started_at: null,
        live_finished_at: null,
        events_json: [],
        metadata_json: { placeholder_home: home, placeholder_away: away, group_code: code },
      });
    }
  }

  return { groups, matches };
}

export function generatePlacementBracketStructure(
  bracket: PlacementBracketConfig,
  groupCodes: string[],
  categoryPhaseTempId: string,
  nextId: IdFactory,
  matchNumStart: number
): { phases: GeneratedPhase[]; matches: GeneratedMatch[]; nextMatchNum: number } {
  const phases: GeneratedPhase[] = [];
  const matches: GeneratedMatch[] = [];
  let matchNum = matchNumStart;

  const bracketPhaseTempId = nextId();
  phases.push({
    temp_id: bracketPhaseTempId,
    phase_type: 'placement_bracket',
    bracket_key: bracket.bracket_key,
    name: bracket.name,
    group_position_source: bracket.position === 99 ? null : bracket.position,
    sort_order: bracket.position,
  });

  const slots: BracketTeamSlot[] = groupCodes.map((code) => ({
    team_id: null,
    label: `${bracket.position === 99 ? 'Cons.' : `${bracket.position}º`} Grupo ${code}`,
    group_code: code,
  }));

  const rounds = singleEliminationRounds(slots);
  for (const round of rounds) {
    for (const [home, away] of round.pairings) {
      matches.push({
        temp_id: nextId(),
        phase_id: bracketPhaseTempId,
        group_id: null,
        bracket_key: bracket.bracket_key,
        round_key: round.round_key,
        match_number: matchNum++,
        home_team_id: home.team_id,
        away_team_id: away.team_id,
        field_id: null,
        scheduled_at: null,
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        score_penalties_home: null,
        score_penalties_away: null,
        went_to_penalties: false,
        mesa_token: null,
        mesa_token_expires_at: null,
        live_started_at: null,
        live_finished_at: null,
        events_json: [],
        metadata_json: {
          bracket_name: bracket.name,
          home_label: home.label,
          away_label: away.label,
        },
      });
    }
  }

  if (rounds.length >= 2) {
    const sfRound = rounds.find((r) => r.round_key === 'sf');
    if (sfRound && sfRound.pairings.length >= 1) {
      matches.push({
        temp_id: nextId(),
        phase_id: bracketPhaseTempId,
        group_id: null,
        bracket_key: bracket.bracket_key,
        round_key: 'third_place',
        match_number: matchNum++,
        home_team_id: null,
        away_team_id: null,
        field_id: null,
        scheduled_at: null,
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        score_penalties_home: null,
        score_penalties_away: null,
        went_to_penalties: false,
        mesa_token: null,
        mesa_token_expires_at: null,
        live_started_at: null,
        live_finished_at: null,
        events_json: [],
        metadata_json: { bracket_name: bracket.name, note: 'Perdedores semifinales' },
      });
    }
  }

  if (bracket.bracket_key === 'consolation' || bracket.position === 99) {
    const existingFinal = matches.some((m) => m.round_key === 'final' && m.bracket_key === bracket.bracket_key);
    if (!existingFinal && matches.length > 0) {
      matches.push({
        temp_id: nextId(),
        phase_id: bracketPhaseTempId,
        group_id: null,
        bracket_key: bracket.bracket_key,
        round_key: 'consolation_final',
        match_number: matchNum++,
        home_team_id: null,
        away_team_id: null,
        field_id: null,
        scheduled_at: null,
        status: 'scheduled',
        score_home: 0,
        score_away: 0,
        score_penalties_home: null,
        score_penalties_away: null,
        went_to_penalties: false,
        mesa_token: null,
        mesa_token_expires_at: null,
        live_started_at: null,
        live_finished_at: null,
        events_json: [],
        metadata_json: { bracket_name: bracket.name },
      });
    }
  }

  return { phases, matches, nextMatchNum: matchNum };
}

/** Genera estructura completa para una categoría con formato groups_multifinal. */
export function generateMultifinalCompetition(
  category: Pick<TournamentCategory, 'groups_count' | 'teams_per_group' | 'placement_brackets_json' | 'format_type'>,
  nextId: IdFactory = defaultIdFactory()
): CompetitionStructure {
  const phases: GeneratedPhase[] = [];
  const groups: GeneratedGroup[] = [];
  const matches: GeneratedMatch[] = [];

  const groupPhaseTempId = nextId();
  phases.push({
    temp_id: groupPhaseTempId,
    phase_type: 'group',
    bracket_key: 'groups',
    name: 'Fase de grupos',
    group_position_source: null,
    sort_order: 0,
  });

  const groupStructure = generateGroupPhaseStructure(category, groupPhaseTempId, nextId);
  groups.push(...groupStructure.groups);
  matches.push(...groupStructure.matches);

  const groupCodes = groups.map((g) => g.code);
  const brackets = resolvePlacementBrackets(category);

  const consolationEnabled = category.teams_per_group >= 4;
  const allBrackets = consolationEnabled
    ? [...brackets, CONSOLATION_BRACKET]
    : brackets;

  let matchNum = matches.length + 1;
  for (const bracket of allBrackets) {
    const result = generatePlacementBracketStructure(
      bracket,
      groupCodes,
      groupPhaseTempId,
      nextId,
      matchNum
    );
    phases.push(...result.phases);
    matches.push(...result.matches);
    matchNum = result.nextMatchNum;
  }

  return { phases, groups, matches };
}

/** Asigna equipos confirmados a grupos (sorteo equilibrado por orden de inscripción). */
export function assignTeamsToGroups(
  teams: TournamentTeam[],
  groupsCount: number
): Map<string, string[]> {
  const confirmed = teams.filter((t) => t.status === 'confirmed' || t.status === 'invited');
  const byGroup = new Map<string, string[]>();
  for (let g = 0; g < groupsCount; g++) {
    byGroup.set(groupCodeFromIndex(g), []);
  }

  confirmed.forEach((team, index) => {
    const code = groupCodeFromIndex(index % groupsCount);
    byGroup.get(code)!.push(team.id);
  });

  return byGroup;
}

/** Vincula partidos de grupo con team_ids reales tras el sorteo. */
export function bindGroupMatchesToTeams(
  matches: TournamentMatch[],
  groups: TournamentGroup[],
  teams: TournamentTeam[]
): TournamentMatch[] {
  const teamsByGroup = new Map<string, TournamentTeam[]>();
  for (const team of teams) {
    if (!team.group_code) continue;
    const list = teamsByGroup.get(team.group_code) ?? [];
    list.push(team);
    teamsByGroup.set(team.group_code, list);
  }

  const groupById = new Map(groups.map((g) => [g.id, g]));

  return matches.map((match) => {
    if (match.round_key !== 'group' || !match.group_id) return match;
    const group = groupById.get(match.group_id);
    if (!group) return match;

    const meta = match.metadata_json as { placeholder_home?: string; placeholder_away?: string };
    const groupTeams = teamsByGroup.get(group.code) ?? [];
    const homeIdx = meta.placeholder_home ? parseInt(meta.placeholder_home.split('-t')[1] ?? '1', 10) - 1 : 0;
    const awayIdx = meta.placeholder_away ? parseInt(meta.placeholder_away.split('-t')[1] ?? '2', 10) - 1 : 1;

    return {
      ...match,
      home_team_id: groupTeams[homeIdx]?.id ?? match.home_team_id,
      away_team_id: groupTeams[awayIdx]?.id ?? match.away_team_id,
    };
  });
}

export function matchesByBracket(
  matches: TournamentMatch[],
  bracketKey: string
): TournamentMatch[] {
  return matches
    .filter((m) => m.bracket_key === bracketKey)
    .sort((a, b) => {
      const roundOrder: Record<RoundKey, number> = {
        group: 0,
        r16: 1,
        qf: 2,
        sf: 3,
        final: 4,
        third_place: 5,
        consolation_final: 6,
      };
      return roundOrder[a.round_key] - roundOrder[b.round_key] || a.match_number - b.match_number;
    });
}

export function groupStandings(
  groupCode: string,
  teams: TournamentTeam[],
  matches: TournamentMatch[]
): { team: TournamentTeam; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; pts: number }[] {
  const groupTeams = teams.filter((t) => t.group_code === groupCode);
  const groupMatches = matches.filter(
    (m) => m.round_key === 'group' && m.status === 'finished' && groupTeams.some((t) => t.id === m.home_team_id || t.id === m.away_team_id)
  );

  const stats = new Map(
    groupTeams.map((t) => [t.id, { team: t, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }])
  );

  for (const m of groupMatches) {
    if (!m.home_team_id || !m.away_team_id) continue;
    const home = stats.get(m.home_team_id);
    const away = stats.get(m.away_team_id);
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.gf += m.score_home;
    home.ga += m.score_away;
    away.gf += m.score_away;
    away.ga += m.score_home;

    if (m.score_home > m.score_away) {
      home.won++;
      home.pts += 3;
      away.lost++;
    } else if (m.score_home < m.score_away) {
      away.won++;
      away.pts += 3;
      home.lost++;
    } else {
      home.drawn++;
      away.drawn++;
      home.pts += 1;
      away.pts += 1;
    }
  }

  return [...stats.values()].sort((a, b) => b.pts - a.pts || b.gf - b.ga - (a.gf - a.ga) || a.team.name.localeCompare(b.team.name));
}
