/**
 * Motor de planificación de torneos: ventanas horarias, división de campos,
 * estrategias de ordenación y asignación de slots.
 */

import type {
  FieldDivisionMode,
  Tournament,
  TournamentField,
  TournamentGroup,
  TournamentMatch,
} from '@/lib/tournaments';

export type { FieldDivisionMode };
export { FIELD_DIVISION_MODES } from '@/lib/tournaments';

export const FIELD_DIVISION_MODE_LABELS: Record<FieldDivisionMode, string> = {
  full: 'Campo completo',
  halves_2: '2 mitades (ej. F11 → 2× F7)',
  quarters_4: '4 cuartos',
};

export const GROUP_SCHEDULE_STRATEGIES = [
  'field_first',
  'group_first',
  'group_alternate',
  'group_block',
] as const;
export type GroupScheduleStrategy = (typeof GROUP_SCHEDULE_STRATEGIES)[number];

export const KNOCKOUT_SCHEDULE_STRATEGIES = ['field_first'] as const;
export type KnockoutScheduleStrategy = (typeof KNOCKOUT_SCHEDULE_STRATEGIES)[number];

export const MATCH_FORMAT_PRESETS = [
  'football_11',
  'football_7',
  'football_5',
  'futsal',
  'basketball',
  'custom',
] as const;
export type MatchFormatPreset = (typeof MATCH_FORMAT_PRESETS)[number];

export const MATCH_FORMAT_PRESET_LABELS: Record<MatchFormatPreset, string> = {
  football_11: 'Fútbol 11 (2×25′)',
  football_7: 'Fútbol 7 (2×20′)',
  football_5: 'Fútbol 5 (2×15′)',
  futsal: 'Fútbol sala (2×20′)',
  basketball: 'Baloncesto (4×10′)',
  custom: 'Personalizado',
};

export const GROUP_STRATEGY_LABELS: Record<GroupScheduleStrategy, string> = {
  field_first: 'Rellenar campos en paralelo',
  group_first: 'Grupo a grupo (A completo, luego B…)',
  group_alternate: 'Alternar grupos (A1, B1, C1…)',
  group_block: 'Bloques por grupo consecutivos',
};

export type TournamentSchedulingConfig = {
  match_format_preset: MatchFormatPreset;
  periods: 1 | 2 | 4;
  period_minutes: number;
  break_minutes: number;
  turnover_minutes: number;
  min_rest_same_team_minutes: number;
  day_start: string;
  day_end: string;
  lunch_break_enabled: boolean;
  lunch_start: string;
  lunch_end: string;
  group_strategy: GroupScheduleStrategy;
  knockout_strategy: KnockoutScheduleStrategy;
};

export const DEFAULT_SCHEDULING_CONFIG: TournamentSchedulingConfig = {
  match_format_preset: 'football_7',
  periods: 2,
  period_minutes: 20,
  break_minutes: 5,
  turnover_minutes: 8,
  min_rest_same_team_minutes: 60,
  day_start: '09:00',
  day_end: '20:00',
  lunch_break_enabled: true,
  lunch_start: '14:00',
  lunch_end: '15:30',
  group_strategy: 'group_alternate',
  knockout_strategy: 'field_first',
};

const PRESET_VALUES: Record<
  Exclude<MatchFormatPreset, 'custom'>,
  Pick<TournamentSchedulingConfig, 'periods' | 'period_minutes' | 'break_minutes' | 'turnover_minutes'>
> = {
  football_11: { periods: 2, period_minutes: 25, break_minutes: 5, turnover_minutes: 10 },
  football_7: { periods: 2, period_minutes: 20, break_minutes: 5, turnover_minutes: 8 },
  football_5: { periods: 2, period_minutes: 15, break_minutes: 3, turnover_minutes: 5 },
  futsal: { periods: 2, period_minutes: 20, break_minutes: 5, turnover_minutes: 8 },
  basketball: { periods: 4, period_minutes: 10, break_minutes: 2, turnover_minutes: 10 },
};

export type ScheduleSlot = {
  field_id: string;
  division_key: string;
  label: string;
  sort_order: number;
};

export type TimeSlot = {
  starts_at: Date;
  ends_at: Date;
  slot_index: number;
};

export type ScheduleAssignment = {
  match_id: string;
  field_id: string;
  division_key: string;
  scheduled_at: string;
};

export type ScheduleCapacityEstimate = {
  slot_duration_minutes: number;
  parallel_slots: number;
  slots_per_day: number;
  tournament_days: number;
  total_capacity: number;
  match_count: number;
  fits: boolean;
  overflow: number;
};

export type ScheduleValidationResult = {
  ok: boolean;
  assigned: ScheduleAssignment[];
  unassigned_match_ids: string[];
  capacity: ScheduleCapacityEstimate;
  message: string;
};

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function divisionKeysForMode(mode: FieldDivisionMode): string[] {
  if (mode === 'halves_2') return ['half_1', 'half_2'];
  if (mode === 'quarters_4') return ['quarter_1', 'quarter_2', 'quarter_3', 'quarter_4'];
  return ['full'];
}

export function getFieldDivisionMode(
  field: TournamentField,
  tournament?: Pick<Tournament, 'format_json'>
): FieldDivisionMode {
  if (field.division_mode) return field.division_mode;
  const map = tournament?.format_json?.field_divisions as Record<string, FieldDivisionMode> | undefined;
  return map?.[field.id] ?? 'full';
}

export function resolveSchedulingConfig(
  raw: unknown,
  presetOverride?: MatchFormatPreset
): TournamentSchedulingConfig {
  const base = { ...DEFAULT_SCHEDULING_CONFIG, ...(raw as Partial<TournamentSchedulingConfig>) };
  const preset = presetOverride ?? base.match_format_preset;
  if (preset !== 'custom' && PRESET_VALUES[preset]) {
    return { ...base, match_format_preset: preset, ...PRESET_VALUES[preset] };
  }
  return { ...base, match_format_preset: preset };
}

export function getSchedulingConfig(tournament: Pick<Tournament, 'format_json'>): TournamentSchedulingConfig {
  const raw = tournament.format_json?.scheduling;
  return resolveSchedulingConfig(raw);
}

export function matchDurationMinutes(config: TournamentSchedulingConfig): number {
  const playing =
    config.periods === 1
      ? config.period_minutes
      : config.periods * config.period_minutes + (config.periods > 1 ? config.break_minutes : 0);
  return playing;
}

export function slotDurationMinutes(config: TournamentSchedulingConfig): number {
  return matchDurationMinutes(config) + config.turnover_minutes;
}

export function buildScheduleSlots(
  fields: TournamentField[],
  tournament?: Pick<Tournament, 'format_json'>
): ScheduleSlot[] {
  const sorted = [...fields].sort((a, b) => a.sort_order - b.sort_order);
  const slots: ScheduleSlot[] = [];
  let order = 0;
  for (const field of sorted) {
    const mode = getFieldDivisionMode(field, tournament);
    for (const key of divisionKeysForMode(mode)) {
      const divLabel =
        key === 'full'
          ? ''
          : key.startsWith('half')
            ? ` · ${key === 'half_1' ? 'Mitad 1' : 'Mitad 2'}`
            : ` · C${key.replace('quarter_', '')}`;
      slots.push({
        field_id: field.id,
        division_key: key,
        label: `${field.label}${divLabel}`,
        sort_order: order++,
      });
    }
  }
  return slots;
}

function tournamentDayKeys(tournament: Pick<Tournament, 'starts_at' | 'ends_at'>): string[] {
  if (!tournament.starts_at) {
    const today = new Date();
    return [today.toISOString().slice(0, 10)];
  }
  const start = new Date(tournament.starts_at);
  const end = tournament.ends_at ? new Date(tournament.ends_at) : new Date(start);
  const days: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (cursor <= endDay) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days.length > 0 ? days : [start.toISOString().slice(0, 10)];
}

function generateDayTimeSlots(dateKey: string, config: TournamentSchedulingConfig): TimeSlot[] {
  const dayStart = parseTimeToMinutes(config.day_start);
  const dayEnd = parseTimeToMinutes(config.day_end);
  const slotDur = slotDurationMinutes(config);
  const lunchStart = config.lunch_break_enabled ? parseTimeToMinutes(config.lunch_start) : null;
  const lunchEnd = config.lunch_break_enabled ? parseTimeToMinutes(config.lunch_end) : null;

  const slots: TimeSlot[] = [];
  let cursor = dayStart;
  let idx = 0;
  while (cursor + slotDur <= dayEnd) {
    if (lunchStart !== null && lunchEnd !== null && cursor < lunchEnd && cursor + slotDur > lunchStart) {
      cursor = lunchEnd;
      continue;
    }
    const start = new Date(`${dateKey}T${minutesToTime(cursor)}:00`);
    const end = new Date(start.getTime() + slotDur * 60_000);
    slots.push({ starts_at: start, ends_at: end, slot_index: idx++ });
    cursor += slotDur;
  }
  return slots;
}

export function estimateScheduleCapacity(input: {
  tournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'>;
  fields: TournamentField[];
  matchCount: number;
  config?: TournamentSchedulingConfig;
}): ScheduleCapacityEstimate {
  const config = input.config ?? getSchedulingConfig(input.tournament);
  const slotDur = slotDurationMinutes(config);
  const parallel = buildScheduleSlots(input.fields, input.tournament).length;
  const days = tournamentDayKeys(input.tournament);
  const timeSlotsPerDay = days.length > 0 ? generateDayTimeSlots(days[0]!, config).length : 0;
  const perDayOnly = timeSlotsPerDay * Math.max(parallel, 1);
  const totalCapacity = perDayOnly * days.length;
  const fits = input.matchCount <= totalCapacity;
  return {
    slot_duration_minutes: slotDur,
    parallel_slots: parallel,
    slots_per_day: perDayOnly,
    tournament_days: days.length,
    total_capacity: totalCapacity,
    match_count: input.matchCount,
    fits,
    overflow: fits ? 0 : input.matchCount - totalCapacity,
  };
}

function groupCodeForMatch(match: TournamentMatch, groups: TournamentGroup[]): string {
  if (match.group_id) {
    return groups.find((g) => g.id === match.group_id)?.code ?? 'Z';
  }
  const meta = match.metadata_json as { group_code?: string };
  return meta.group_code ?? 'Z';
}

function roundOrder(round: TournamentMatch['round_key']): number {
  const order: Record<TournamentMatch['round_key'], number> = {
    group: 0,
    r16: 1,
    qf: 2,
    sf: 3,
    final: 4,
    third_place: 5,
    consolation_final: 6,
  };
  return order[round] ?? 99;
}

function interleaveByGroup<T extends { groupCode: string }>(items: T[]): T[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.groupCode) ?? [];
    list.push(item);
    buckets.set(item.groupCode, list);
  }
  const codes = [...buckets.keys()].sort();
  const result: T[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const code of codes) {
      const bucket = buckets.get(code);
      if (bucket && bucket.length > 0) {
        result.push(bucket.shift()!);
        added = true;
      }
    }
  }
  return result;
}

export function orderMatchesForScheduling(
  matches: TournamentMatch[],
  groups: TournamentGroup[],
  config: TournamentSchedulingConfig
): TournamentMatch[] {
  const groupMatches = matches.filter((m) => m.round_key === 'group');
  const knockoutMatches = matches.filter((m) => m.round_key !== 'group');

  const withGroup = groupMatches.map((m) => ({
    match: m,
    groupCode: groupCodeForMatch(m, groups),
  }));

  let orderedGroup: TournamentMatch[];
  switch (config.group_strategy) {
    case 'group_first':
    case 'group_block':
      orderedGroup = withGroup
        .sort((a, b) => a.groupCode.localeCompare(b.groupCode) || a.match.match_number - b.match.match_number)
        .map((x) => x.match);
      break;
    case 'group_alternate':
      orderedGroup = interleaveByGroup(withGroup).map((x) => x.match);
      break;
    case 'field_first':
    default:
      orderedGroup = [...groupMatches].sort((a, b) => a.match_number - b.match_number);
      break;
  }

  const orderedKnockout = [...knockoutMatches].sort(
    (a, b) => roundOrder(a.round_key) - roundOrder(b.round_key) || a.match_number - b.match_number
  );

  return [...orderedGroup, ...orderedKnockout];
}

type PhysicalSlot = ScheduleSlot & { time: TimeSlot };

function buildPhysicalSlots(
  tournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'>,
  fields: TournamentField[],
  config: TournamentSchedulingConfig
): PhysicalSlot[] {
  const scheduleSlots = buildScheduleSlots(fields, tournament);
  const days = tournamentDayKeys(tournament);
  const physical: PhysicalSlot[] = [];
  for (const dateKey of days) {
    const times = generateDayTimeSlots(dateKey, config);
    for (const time of times) {
      for (const slot of scheduleSlots) {
        physical.push({ ...slot, time });
      }
    }
  }
  return physical;
}

function teamIdsForMatch(match: TournamentMatch): string[] {
  const ids: string[] = [];
  if (match.home_team_id) ids.push(match.home_team_id);
  if (match.away_team_id) ids.push(match.away_team_id);
  return ids;
}

export function calculateTournamentSchedule(input: {
  tournament: Tournament;
  fields: TournamentField[];
  groups: TournamentGroup[];
  matches: TournamentMatch[];
  config?: TournamentSchedulingConfig;
  /** Si true, solo reprograma partidos en estado scheduled */
  onlyUnplayed?: boolean;
}): ScheduleValidationResult {
  const config = input.config ?? getSchedulingConfig(input.tournament);
  const toSchedule = input.matches.filter((m) =>
    input.onlyUnplayed ? m.status === 'scheduled' : m.status !== 'finished' && m.status !== 'live'
  );

  if (input.fields.length === 0) {
    return {
      ok: false,
      assigned: [],
      unassigned_match_ids: toSchedule.map((m) => m.id),
      capacity: estimateScheduleCapacity({
        tournament: input.tournament,
        fields: input.fields,
        matchCount: toSchedule.length,
        config,
      }),
      message: 'Añade al menos un campo antes de calcular horarios.',
    };
  }

  const capacity = estimateScheduleCapacity({
    tournament: input.tournament,
    fields: input.fields,
    matchCount: toSchedule.length,
    config,
  });

  const ordered = orderMatchesForScheduling(toSchedule, input.groups, config);
  const physicalSlots = buildPhysicalSlots(input.tournament, input.fields, config);
  const slotDurMs = slotDurationMinutes(config) * 60_000;
  const minRestMs = config.min_rest_same_team_minutes * 60_000;

  const occupied = new Set<string>();
  const teamLastEnd = new Map<string, number>();
  const assigned: ScheduleAssignment[] = [];
  const unassigned: string[] = [];

  for (const match of ordered) {
    const teams = teamIdsForMatch(match);
    let placed = false;

    for (const slot of physicalSlots) {
      const slotKey = `${slot.time.starts_at.toISOString()}|${slot.field_id}|${slot.division_key}`;
      if (occupied.has(slotKey)) continue;

      const slotStart = slot.time.starts_at.getTime();
      const slotEnd = slotStart + slotDurMs;

      if (teams.length > 0) {
        const restOk = teams.every((tid) => {
          const last = teamLastEnd.get(tid);
          if (last === undefined) return true;
          return slotStart - last >= minRestMs;
        });
        if (!restOk) continue;
      }

      occupied.add(slotKey);
      for (const tid of teams) teamLastEnd.set(tid, slotEnd);
      assigned.push({
        match_id: match.id,
        field_id: slot.field_id,
        division_key: slot.division_key,
        scheduled_at: slot.time.starts_at.toISOString(),
      });
      placed = true;
      break;
    }

    if (!placed) unassigned.push(match.id);
  }

  const ok = unassigned.length === 0;
  const message = ok
    ? `Programados ${assigned.length} partidos en ${capacity.tournament_days} día(s) · ${capacity.parallel_slots} pista(s) paralela(s).`
    : `No caben todos los partidos: faltan ${unassigned.length} hueco(s). Capacidad estimada: ${capacity.total_capacity} slots, necesarios: ${toSchedule.length}.`;

  return { ok, assigned, unassigned_match_ids: unassigned, capacity, message };
}

export function formatCapacitySummary(capacity: ScheduleCapacityEstimate): string {
  return `${capacity.match_count} partidos · ${capacity.total_capacity} huecos (${capacity.slots_per_day}/día × ${capacity.tournament_days} días · ${capacity.parallel_slots} pistas · ${capacity.slot_duration_minutes}′/slot)`;
}
