import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  TRAINING_DIVISION_LABELS,
  WEEKDAY_BUTTONS,
  type TrainingDivision,
} from '@/lib/club-facilities';
import type { TeamTrainingSlot } from '@/lib/team-setup';

export type TrainingCalendarTeamMeta = {
  teamId: string;
  teamName: string;
  categorySlug: CanteraCategorySlug | null;
};

export type TrainingCalendarFacility = {
  id: string;
  name: string;
};

export type TrainingCalendarEvent = {
  id: string;
  teamId: string;
  teamName: string;
  categorySlug: CanteraCategorySlug | null;
  weekday: string;
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  facilityId: string;
  facilityName: string;
  division: TrainingDivision | null;
  divisionLabel: string | null;
};

export type PositionedCalendarEvent = TrainingCalendarEvent & {
  lane: number;
  laneCount: number;
};

export type CalendarTimeGrid = {
  startMinutes: number;
  endMinutes: number;
  slotMinutes: number;
};

export const CALENDAR_SLOT_MINUTES = 30;
export const CALENDAR_ROW_HEIGHT_PX = 32;

export const CATEGORY_EVENT_STYLES: Record<
  CanteraCategorySlug,
  { block: string; dot: string }
> = {
  debutantes: {
    block: 'border-fuchsia-400/70 bg-fuchsia-400/25 text-fuchsia-100',
    dot: 'bg-fuchsia-400',
  },
  prebenjamin: {
    block: 'border-white/70 bg-white/20 text-white',
    dot: 'bg-white',
  },
  benjamin: {
    block: 'border-emerald-400/70 bg-emerald-400/25 text-emerald-100',
    dot: 'bg-emerald-400',
  },
  alevin: {
    block: 'border-sky-400/70 bg-sky-400/25 text-sky-100',
    dot: 'bg-sky-400',
  },
  infantil: {
    block: 'border-violet-400/70 bg-violet-400/25 text-violet-100',
    dot: 'bg-violet-400',
  },
  cadete: {
    block: 'border-amber-400/70 bg-amber-400/25 text-amber-100',
    dot: 'bg-amber-400',
  },
  juvenil: {
    block: 'border-rose-400/70 bg-rose-400/25 text-rose-100',
    dot: 'bg-rose-400',
  },
};

export const DEFAULT_EVENT_STYLE = {
  block: 'border-primary/70 bg-primary/20 text-primary-foreground',
  dot: 'bg-primary',
};

const FACILITY_EVENT_STYLES = [
  {
    block: 'border-cyan-400/70 bg-cyan-400/20 text-cyan-100',
    dot: 'bg-cyan-400',
  },
  {
    block: 'border-amber-400/70 bg-amber-400/20 text-amber-100',
    dot: 'bg-amber-400',
  },
  {
    block: 'border-lime-400/70 bg-lime-400/20 text-lime-100',
    dot: 'bg-lime-400',
  },
  {
    block: 'border-orange-400/70 bg-orange-400/20 text-orange-100',
    dot: 'bg-orange-400',
  },
] as const;

function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const [hours, minutes] = trimmed.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatMinutes(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function roundDownToSlot(minutes: number, slot: number): number {
  return Math.floor(minutes / slot) * slot;
}

function roundUpToSlot(minutes: number, slot: number): number {
  return Math.ceil(minutes / slot) * slot;
}

export function buildTrainingCalendarEvents(
  slots: TeamTrainingSlot[],
  teams: TrainingCalendarTeamMeta[],
  facilities: TrainingCalendarFacility[]
): TrainingCalendarEvent[] {
  const teamById = new Map(teams.map((team) => [team.teamId, team]));
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));
  const events: TrainingCalendarEvent[] = [];

  for (const slot of slots) {
    if (!slot.training_days.trim() || !slot.training_start || !slot.training_end) continue;

    const startMinutes = parseTimeToMinutes(slot.training_start);
    const endMinutes = parseTimeToMinutes(slot.training_end);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) continue;

    const team = teamById.get(slot.teamId);
    const facility = facilityById.get(slot.training_facility_id);
    const divisionLabel = slot.training_division
      ? TRAINING_DIVISION_LABELS[slot.training_division]
      : null;

    for (const weekday of slot.training_days.split(',').map((day) => day.trim()).filter(Boolean)) {
      events.push({
        id: `${slot.teamId}-${weekday}-${slot.training_start}`,
        teamId: slot.teamId,
        teamName: slot.teamName,
        categorySlug: team?.categorySlug ?? null,
        weekday,
        start: slot.training_start,
        end: slot.training_end,
        startMinutes,
        endMinutes,
        facilityId: slot.training_facility_id,
        facilityName: facility?.name ?? 'Instalación',
        division: slot.training_division,
        divisionLabel,
      });
    }
  }

  return events.sort(
    (a, b) =>
      WEEKDAY_BUTTONS.findIndex((day) => day.value === a.weekday) -
        WEEKDAY_BUTTONS.findIndex((day) => day.value === b.weekday) ||
      a.startMinutes - b.startMinutes ||
      a.teamName.localeCompare(b.teamName, 'es')
  );
}

export function countWeeklyTrainingSessions(slots: TeamTrainingSlot[]): number {
  let count = 0;

  for (const slot of slots) {
    if (!slot.training_days.trim() || !slot.training_start || !slot.training_end) continue;

    const startMinutes = parseTimeToMinutes(slot.training_start);
    const endMinutes = parseTimeToMinutes(slot.training_end);
    if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) continue;

    count += slot.training_days
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean).length;
  }

  return count;
}

export function computeCalendarTimeGrid(
  events: TrainingCalendarEvent[],
  slotMinutes = CALENDAR_SLOT_MINUTES
): CalendarTimeGrid {
  if (events.length === 0) {
    return { startMinutes: 16 * 60, endMinutes: 22 * 60, slotMinutes };
  }

  const minStart = Math.min(...events.map((event) => event.startMinutes));
  const maxEnd = Math.max(...events.map((event) => event.endMinutes));

  return {
    startMinutes: roundDownToSlot(Math.max(0, minStart - slotMinutes), slotMinutes),
    endMinutes: roundUpToSlot(maxEnd + slotMinutes, slotMinutes),
    slotMinutes,
  };
}

export function buildCalendarTimeLabels(grid: CalendarTimeGrid): string[] {
  const labels: string[] = [];
  for (let minutes = grid.startMinutes; minutes < grid.endMinutes; minutes += grid.slotMinutes) {
    labels.push(formatMinutes(minutes));
  }
  return labels;
}

export function positionEventsForWeekday(
  events: TrainingCalendarEvent[]
): PositionedCalendarEvent[] {
  const sorted = [...events].sort(
    (a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes
  );
  const laneEnds: number[] = [];
  const positioned: PositionedCalendarEvent[] = [];

  for (const event of sorted) {
    let lane = laneEnds.findIndex((end) => end <= event.startMinutes);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(event.endMinutes);
    } else {
      laneEnds[lane] = event.endMinutes;
    }
    positioned.push({ ...event, lane, laneCount: 1 });
  }

  const laneCount = Math.max(1, laneEnds.length);
  return positioned.map((event) => ({ ...event, laneCount }));
}

export function eventStyleForTeam(categorySlug: CanteraCategorySlug | null) {
  if (categorySlug && CATEGORY_EVENT_STYLES[categorySlug]) {
    return CATEGORY_EVENT_STYLES[categorySlug];
  }
  return DEFAULT_EVENT_STYLE;
}

export function eventStyleForFacility(facilityId: string, facilityIds: string[]) {
  const index = facilityIds.indexOf(facilityId);
  if (index === -1) return DEFAULT_EVENT_STYLE;
  return FACILITY_EVENT_STYLES[index % FACILITY_EVENT_STYLES.length];
}

export function minutesToGridOffset(minutes: number, gridStart: number, slotMinutes: number): number {
  return ((minutes - gridStart) / slotMinutes) * CALENDAR_ROW_HEIGHT_PX;
}

export function durationToGridHeight(
  startMinutes: number,
  endMinutes: number,
  slotMinutes: number
): number {
  return ((endMinutes - startMinutes) / slotMinutes) * CALENDAR_ROW_HEIGHT_PX;
}
