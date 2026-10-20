/**
 * Planificación por categoría: ventanas horarias exclusivas, estimación de partidos
 * y validación de capacidad antes de invitar equipos.
 */

import { generateMultifinalCompetition } from '@/lib/tournament-brackets';
import {
  buildScheduleSlots,
  getSchedulingConfig,
  slotDurationMinutes,
  tournamentDayKeys,
  type ScheduleCapacityEstimate,
  type TournamentSchedulingConfig,
} from '@/lib/tournament-scheduling';
import type { Tournament, TournamentCategory, TournamentField, CategorySchedulingWindow } from '@/lib/tournaments';
import { getCategorySchedulingMap } from '@/lib/tournaments';

export type { CategorySchedulingWindow };

export type CategoryCapacityAnalysis = {
  category_id: string;
  category_name: string;
  window: CategorySchedulingWindow | null;
  match_count: number;
  team_slots: number;
  teams_registered: number;
  capacity: ScheduleCapacityEstimate | null;
  fits_structure: boolean;
  fits_current_teams: boolean;
  overflow_matches: number;
  can_invite_more: boolean;
  invites_remaining: number;
  window_label: string;
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

export function getCategoryWindow(
  categoryId: string,
  tournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'>,
  config?: TournamentSchedulingConfig
): CategorySchedulingWindow | null {
  const saved = getCategorySchedulingMap(tournament)[categoryId];
  if (saved?.day_date) return saved;

  const days = tournamentDayKeys(tournament);
  const base = config ?? getSchedulingConfig(tournament);
  return {
    day_date: days[0]!,
    day_start: base.day_start,
    day_end: base.day_end,
    lunch_break_enabled: base.lunch_break_enabled,
    lunch_start: base.lunch_start,
    lunch_end: base.lunch_end,
  };
}

export function formatCategoryWindowLabel(window: CategorySchedulingWindow): string {
  const date = new Date(`${window.day_date}T12:00:00`);
  const dayName = date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${dayName} · ${window.day_start}–${window.day_end}`;
}

export function estimateMatchCountForCategory(
  category: Pick<TournamentCategory, 'groups_count' | 'teams_per_group' | 'placement_brackets_json' | 'format_type'>
): number {
  if (category.format_type === 'groups_multifinal') {
    return generateMultifinalCompetition(category).matches.length;
  }
  const teams = category.groups_count * category.teams_per_group;
  if (category.format_type === 'league') {
    return (teams * (teams - 1)) / 2;
  }
  if (category.format_type === 'knockout') {
    return teams - 1;
  }
  const groupMatches = category.groups_count * ((category.teams_per_group * (category.teams_per_group - 1)) / 2);
  return groupMatches + category.groups_count;
}

function windowConfig(
  window: CategorySchedulingWindow,
  base: TournamentSchedulingConfig
): TournamentSchedulingConfig {
  return {
    ...base,
    day_start: window.day_start,
    day_end: window.day_end,
    lunch_break_enabled: window.lunch_break_enabled ?? base.lunch_break_enabled,
    lunch_start: window.lunch_start ?? base.lunch_start,
    lunch_end: window.lunch_end ?? base.lunch_end,
  };
}

function timeSlotsInWindow(window: CategorySchedulingWindow, config: TournamentSchedulingConfig): number {
  const cfg = windowConfig(window, config);
  const slotDur = slotDurationMinutes(cfg);
  const dayStart = parseTimeToMinutes(cfg.day_start);
  const dayEnd = parseTimeToMinutes(cfg.day_end);
  const lunchStart = cfg.lunch_break_enabled ? parseTimeToMinutes(cfg.lunch_start) : null;
  const lunchEnd = cfg.lunch_break_enabled ? parseTimeToMinutes(cfg.lunch_end) : null;

  let cursor = dayStart;
  let count = 0;
  while (cursor + slotDur <= dayEnd) {
    if (lunchStart !== null && lunchEnd !== null && cursor < lunchEnd && cursor + slotDur > lunchStart) {
      cursor = lunchEnd;
      continue;
    }
    count++;
    cursor += slotDur;
  }
  return count;
}

export function estimateCategoryCapacity(input: {
  window: CategorySchedulingWindow;
  fields: TournamentField[];
  tournament: Pick<Tournament, 'format_json'>;
  config: TournamentSchedulingConfig;
  matchCount: number;
}): ScheduleCapacityEstimate {
  const slotDur = slotDurationMinutes(windowConfig(input.window, input.config));
  const parallel = buildScheduleSlots(input.fields, input.tournament).length;
  const timeSlots = timeSlotsInWindow(input.window, input.config);
  const perDay = timeSlots * Math.max(parallel, 1);
  const fits = input.matchCount <= perDay;
  return {
    slot_duration_minutes: slotDur,
    parallel_slots: parallel,
    slots_per_day: perDay,
    tournament_days: 1,
    total_capacity: perDay,
    match_count: input.matchCount,
    fits,
    overflow: fits ? 0 : input.matchCount - perDay,
  };
}

export function windowsOverlap(a: CategorySchedulingWindow, b: CategorySchedulingWindow): boolean {
  if (a.day_date !== b.day_date) return false;
  const aStart = parseTimeToMinutes(a.day_start);
  const aEnd = parseTimeToMinutes(a.day_end);
  const bStart = parseTimeToMinutes(b.day_start);
  const bEnd = parseTimeToMinutes(b.day_end);
  return aStart < bEnd && bStart < aEnd;
}

export function validateCategoryWindows(
  categories: Pick<TournamentCategory, 'id' | 'name'>[],
  windows: Record<string, CategorySchedulingWindow>
): { ok: boolean; conflicts: string[] } {
  const conflicts: string[] = [];
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const a = categories[i]!;
      const b = categories[j]!;
      const wa = windows[a.id];
      const wb = windows[b.id];
      if (wa && wb && windowsOverlap(wa, wb)) {
        conflicts.push(`${a.name} y ${b.name} se solapan (${formatCategoryWindowLabel(wa)} / ${formatCategoryWindowLabel(wb)})`);
      }
    }
  }
  return { ok: conflicts.length === 0, conflicts };
}

export function suggestCategoryWindows(input: {
  categories: TournamentCategory[];
  tournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'>;
  fields: TournamentField[];
  config?: TournamentSchedulingConfig;
  buffer_minutes?: number;
}): Record<string, CategorySchedulingWindow> {
  const config = input.config ?? getSchedulingConfig(input.tournament);
  const days = tournamentDayKeys(input.tournament);
  const parallel = Math.max(buildScheduleSlots(input.fields, input.tournament).length, 1);
  const slotDur = slotDurationMinutes(config);
  const buffer = input.buffer_minutes ?? 15;
  const sorted = [...input.categories].sort((a, b) => a.sort_order - b.sort_order);

  const result: Record<string, CategorySchedulingWindow> = {};
  let dayIdx = 0;
  let cursor = parseTimeToMinutes(config.day_start);
  const hardDayEnd = parseTimeToMinutes(config.day_end);

  for (const cat of sorted) {
    const matchCount = estimateMatchCountForCategory(cat);
    const slotsNeeded = Math.ceil(matchCount / parallel);
    const windowMinutes = slotsNeeded * slotDur;

    if (cursor + windowMinutes > hardDayEnd) {
      dayIdx = Math.min(dayIdx + 1, days.length - 1);
      cursor = parseTimeToMinutes(config.day_start);
    }

    const endMinutes = Math.min(cursor + windowMinutes, hardDayEnd);
    result[cat.id] = {
      day_date: days[dayIdx]!,
      day_start: minutesToTime(cursor),
      day_end: minutesToTime(endMinutes),
      lunch_break_enabled: false,
    };

    cursor = endMinutes + buffer;
    if (cursor + slotDur > hardDayEnd) {
      dayIdx = Math.min(dayIdx + 1, days.length - 1);
      cursor = parseTimeToMinutes(config.day_start);
    }
  }

  return result;
}

export function analyzeCategoryCapacity(input: {
  category: TournamentCategory;
  tournament: Tournament;
  fields: TournamentField[];
  teamsRegistered: number;
  config?: TournamentSchedulingConfig;
}): CategoryCapacityAnalysis {
  const config = input.config ?? getSchedulingConfig(input.tournament);
  const window = getCategoryWindow(input.category.id, input.tournament, config);
  const matchCount = estimateMatchCountForCategory(input.category);
  const teamSlots = input.category.groups_count * input.category.teams_per_group;

  const capacity =
    window && input.fields.length > 0
      ? estimateCategoryCapacity({
          window,
          fields: input.fields,
          tournament: input.tournament,
          config,
          matchCount,
        })
      : null;

  const fitsStructure = capacity?.fits ?? false;
  const invitesRemaining = Math.max(0, teamSlots - input.teamsRegistered);

  return {
    category_id: input.category.id,
    category_name: input.category.name,
    window,
    match_count: matchCount,
    team_slots: teamSlots,
    teams_registered: input.teamsRegistered,
    capacity,
    fits_structure: fitsStructure,
    fits_current_teams: input.teamsRegistered <= teamSlots,
    overflow_matches: capacity?.overflow ?? matchCount,
    can_invite_more: invitesRemaining > 0 && fitsStructure,
    invites_remaining: invitesRemaining,
    window_label: window ? formatCategoryWindowLabel(window) : 'Sin ventana asignada',
  };
}

export function analyzeAllCategories(input: {
  categories: TournamentCategory[];
  tournament: Tournament;
  fields: TournamentField[];
  teams: { category_id: string }[];
  config?: TournamentSchedulingConfig;
}): CategoryCapacityAnalysis[] {
  return input.categories.map((category) =>
    analyzeCategoryCapacity({
      category,
      tournament: input.tournament,
      fields: input.fields,
      teamsRegistered: input.teams.filter((t) => t.category_id === category.id).length,
      config: input.config,
    })
  );
}

export function maxTeamsPerGroupForWindow(input: {
  groupsCount: number;
  teamsPerGroup: number;
  window: CategorySchedulingWindow;
  fields: TournamentField[];
  tournament: Pick<Tournament, 'format_json'>;
  config: TournamentSchedulingConfig;
  formatType: TournamentCategory['format_type'];
  placementBrackets: TournamentCategory['placement_brackets_json'];
}): number {
  for (let tpg = input.teamsPerGroup; tpg >= 2; tpg--) {
    const cat = {
      groups_count: input.groupsCount,
      teams_per_group: tpg,
      format_type: input.formatType,
      placement_brackets_json: input.placementBrackets,
    };
    const matchCount = estimateMatchCountForCategory(cat);
    const cap = estimateCategoryCapacity({
      window: input.window,
      fields: input.fields,
      tournament: input.tournament,
      config: input.config,
      matchCount,
    });
    if (cap.fits) return tpg;
  }
  return 2;
}
