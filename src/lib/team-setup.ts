import type { ClubFacility, FacilityDivisionMode, TrainingDivision } from '@/lib/club-facilities';
import {
  DIVISION_MODE_LABELS,
  TRAINING_DIVISION_LABELS,
  divisionOptionsForFacility,
  facilityHasSharedDivisions,
  formatTimeRange,
  formatTrainingDayLetters,
} from '@/lib/club-facilities';

export type TeamPurpose = 'competition' | 'formation';
export type MatchVenueType = 'own' | 'external';

export type TeamSetupData = {
  team_purpose: TeamPurpose;
  training_facility_id: string | null;
  training_division: TrainingDivision | null;
  training_days: string;
  training_start: string;
  training_end: string;
  match_venue_type: MatchVenueType;
  match_own_single_venue: boolean;
  match_home_mode: string;
  match_away_mode: string;
  external_venue_name: string;
  external_venue_address: string;
};

export const DEFAULT_TEAM_SETUP: TeamSetupData = {
  team_purpose: 'competition',
  training_facility_id: null,
  training_division: null,
  training_days: '',
  training_start: '',
  training_end: '',
  match_venue_type: 'own',
  match_own_single_venue: true,
  match_home_mode: '',
  match_away_mode: '',
  external_venue_name: '',
  external_venue_address: '',
};

export const TEAM_PURPOSE_LABELS: Record<TeamPurpose, string> = {
  competition: 'Competición',
  formation: 'Formación',
};

export const MATCH_VENUE_LABELS: Record<MatchVenueType, string> = {
  own: 'Sede propia del club',
  external: 'Sede externa',
};

export function parseTeamSetupFromForm(formData: FormData): TeamSetupData {
  const trainingDays = String(formData.get('trainingDays') ?? '').trim();
  const matchVenueType = String(formData.get('matchVenueType') ?? 'own') as MatchVenueType;
  const matchOwnSingle = formData.get('matchOwnSingleVenue') === 'on';

  return {
    team_purpose: (String(formData.get('teamPurpose') ?? 'competition') as TeamPurpose) || 'competition',
    training_facility_id: String(formData.get('trainingFacilityId') ?? '').trim() || null,
    training_division: (String(formData.get('trainingDivision') ?? '').trim() ||
      null) as TrainingDivision | null,
    training_days: trainingDays,
    training_start: String(formData.get('trainingStart') ?? '').trim(),
    training_end: String(formData.get('trainingEnd') ?? '').trim(),
    match_venue_type: matchVenueType === 'external' ? 'external' : 'own',
    match_own_single_venue: matchOwnSingle,
    match_home_mode: String(formData.get('matchHomeMode') ?? '').trim(),
    match_away_mode: String(formData.get('matchAwayMode') ?? '').trim(),
    external_venue_name: String(formData.get('externalVenueName') ?? '').trim(),
    external_venue_address: String(formData.get('externalVenueAddress') ?? '').trim(),
  };
}

export function teamSetupToDbPayload(setup: TeamSetupData) {
  return {
    team_purpose: setup.team_purpose,
    training_facility_id:
      setup.training_facility_id && !setup.training_facility_id.startsWith('demo-')
        ? setup.training_facility_id
        : null,
    training_division: setup.training_division,
    training_days: setup.training_days || null,
    training_start: setup.training_start || null,
    training_end: setup.training_end || null,
    match_venue_type: setup.match_venue_type,
    match_own_single_venue: setup.match_own_single_venue,
    match_home_mode:
      setup.match_venue_type === 'own' && !setup.match_own_single_venue
        ? setup.match_home_mode || null
        : null,
    match_away_mode:
      setup.match_venue_type === 'own' && !setup.match_own_single_venue
        ? setup.match_away_mode || null
        : null,
    external_venue_name:
      setup.match_venue_type === 'external' ? setup.external_venue_name || null : null,
    external_venue_address:
      setup.match_venue_type === 'external' ? setup.external_venue_address || null : null,
  };
}

export function describeMatchVenue(setup: TeamSetupData): string {
  if (setup.match_venue_type === 'external') {
    return setup.external_venue_name || 'Sede externa (sin nombre)';
  }
  if (setup.match_own_single_venue) return 'Sede única propia';
  const home = setup.match_home_mode || 'Local sin detallar';
  const away = setup.match_away_mode || 'Visitante sin detallar';
  return `Local: ${home} · Visitante: ${away}`;
}

export function describeTrainingSetup(
  setup: TeamSetupData,
  facilityName?: string | null
): string {
  const days = formatTrainingDayLetters(setup.training_days);
  const time = formatTimeRange(setup.training_start, setup.training_end);
  const division = setup.training_division
    ? TRAINING_DIVISION_LABELS[setup.training_division]
    : null;
  const parts = [facilityName, division, days !== '—' ? days : null, time !== '—' ? time : null].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join(' · ') : 'Sin asignar';
}

export function formatTrainingSlotBrief(slot: TeamTrainingSlot): string {
  const days = formatTrainingDayLetters(slot.training_days);
  const time = formatTimeRange(slot.training_start, slot.training_end);
  return `${days} · ${time}`;
}

export type DivisionScheduleEntry = {
  teamId?: string;
  teamName: string;
  days: string;
  time: string;
  isPreview?: boolean;
};

export type DivisionScheduleRow = {
  division: TrainingDivision;
  label: string;
  entries: DivisionScheduleEntry[];
};

export function buildFacilityDivisionSchedule(
  facility: ClubFacility,
  slots: TeamTrainingSlot[],
  options?: {
    excludeTeamId?: string;
    preview?: {
      teamName: string;
      training_division: TrainingDivision;
      training_days: string;
      training_start: string;
      training_end: string;
    };
  }
): DivisionScheduleRow[] {
  if (!facilityHasSharedDivisions(facility)) return [];

  const facilitySlots = slots.filter(
    (slot) =>
      slot.training_facility_id === facility.id &&
      (!options?.excludeTeamId || slot.teamId !== options.excludeTeamId)
  );

  return divisionOptionsForFacility(facility).map((option) => {
    const entries: DivisionScheduleEntry[] = facilitySlots
      .filter((slot) => slot.training_division === option.value)
      .map((slot) => ({
        teamId: slot.teamId,
        teamName: slot.teamName,
        days: formatTrainingDayLetters(slot.training_days),
        time: formatTimeRange(slot.training_start, slot.training_end),
      }));

    const preview = options?.preview;
    if (preview?.training_division === option.value && preview.training_days.trim()) {
      entries.push({
        teamName: preview.teamName,
        days: formatTrainingDayLetters(preview.training_days),
        time: formatTimeRange(preview.training_start, preview.training_end),
        isPreview: true,
      });
    }

    return {
      division: option.value,
      label: option.label,
      entries,
    };
  });
}

export type TeamTrainingSlot = {
  teamId: string;
  teamName: string;
  training_facility_id: string;
  training_division: TrainingDivision | null;
  training_days: string;
  training_start: string;
  training_end: string;
};

type TeamSetupRow = {
  team_purpose?: string | null;
  training_facility_id?: string | null;
  training_division?: string | null;
  training_days?: string | null;
  training_start?: string | null;
  training_end?: string | null;
  match_venue_type?: string | null;
  match_own_single_venue?: boolean | null;
  match_home_mode?: string | null;
  match_away_mode?: string | null;
  external_venue_name?: string | null;
  external_venue_address?: string | null;
};

function normalizeTime(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 5);
}

function parseTimeToMinutes(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const [hours, minutes] = trimmed.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);
  if (sA == null || eA == null || sB == null || eB == null) return false;
  return sA < eB && sB < eA;
}

function daysOverlap(daysA: string, daysB: string): boolean {
  const setA = new Set(
    daysA
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean)
  );
  return daysB
    .split(',')
    .map((day) => day.trim())
    .filter(Boolean)
    .some((day) => setA.has(day));
}

export function trainingDivisionsConflict(
  divisionA: TrainingDivision | null,
  divisionB: TrainingDivision | null,
  facilityMode: FacilityDivisionMode
): boolean {
  if (!divisionA || !divisionB) return false;
  if (divisionA === 'full' || divisionB === 'full') return true;
  if (facilityMode === 'full') return true;
  return divisionA === divisionB;
}

export function findTrainingConflicts(
  setup: Pick<
    TeamSetupData,
    | 'training_facility_id'
    | 'training_division'
    | 'training_days'
    | 'training_start'
    | 'training_end'
  >,
  facility: ClubFacility | undefined,
  slots: TeamTrainingSlot[],
  excludeTeamId?: string
): TeamTrainingSlot[] {
  if (!setup.training_facility_id || !facility) return [];

  return slots.filter((slot) => {
    if (excludeTeamId && slot.teamId === excludeTeamId) return false;
    if (slot.training_facility_id !== setup.training_facility_id) return false;
    if (!daysOverlap(setup.training_days, slot.training_days)) return false;
    if (
      !timesOverlap(
        setup.training_start,
        setup.training_end,
        slot.training_start,
        slot.training_end
      )
    ) {
      return false;
    }
    return trainingDivisionsConflict(
      setup.training_division,
      slot.training_division,
      facility.division_mode
    );
  });
}

export function teamSetupFromDb(row: TeamSetupRow | null | undefined): TeamSetupData {
  if (!row) return { ...DEFAULT_TEAM_SETUP };

  const purpose = row.team_purpose === 'formation' ? 'formation' : 'competition';
  const venueType = row.match_venue_type === 'external' ? 'external' : 'own';
  const division = row.training_division as TrainingDivision | null;

  return {
    team_purpose: purpose,
    training_facility_id: row.training_facility_id ?? null,
    training_division: division,
    training_days: row.training_days ?? '',
    training_start: normalizeTime(row.training_start),
    training_end: normalizeTime(row.training_end),
    match_venue_type: venueType,
    match_own_single_venue: row.match_own_single_venue ?? true,
    match_home_mode: row.match_home_mode ?? '',
    match_away_mode: row.match_away_mode ?? '',
    external_venue_name: row.external_venue_name ?? '',
    external_venue_address: row.external_venue_address ?? '',
  };
}

export const DEMO_TEAM_SETUP: Record<string, TeamSetupData> = {
  'demo-team-debutantes-a': {
    team_purpose: 'formation',
    training_facility_id: 'demo-facility-annex',
    training_division: 'half_1',
    training_days: 'wed,fri',
    training_start: '17:00',
    training_end: '18:00',
    match_venue_type: 'own',
    match_own_single_venue: true,
    match_home_mode: '',
    match_away_mode: '',
    external_venue_name: '',
    external_venue_address: '',
  },
  'demo-team-prebenjamin-a': {
    team_purpose: 'formation',
    training_facility_id: 'demo-facility-annex',
    training_division: 'half_2',
    training_days: 'tue,thu',
    training_start: '17:30',
    training_end: '18:30',
    match_venue_type: 'own',
    match_own_single_venue: true,
    match_home_mode: '',
    match_away_mode: '',
    external_venue_name: '',
    external_venue_address: '',
  },
  'demo-team-benjamin-a': {
    team_purpose: 'competition',
    training_facility_id: 'demo-facility-annex',
    training_division: 'half_1',
    training_days: 'mon,wed',
    training_start: '18:00',
    training_end: '19:15',
    match_venue_type: 'own',
    match_own_single_venue: false,
    match_home_mode: 'Campo anexo F-7',
    match_away_mode: 'Desplazamientos en comarca',
    external_venue_name: '',
    external_venue_address: '',
  },
  'demo-team-alevin-a': {
    team_purpose: 'competition',
    training_facility_id: 'demo-facility-main',
    training_division: 'quarter_2',
    training_days: 'tue,thu',
    training_start: '18:30',
    training_end: '20:00',
    match_venue_type: 'own',
    match_own_single_venue: true,
    match_home_mode: '',
    match_away_mode: '',
    external_venue_name: '',
    external_venue_address: '',
  },
  'demo-team-infantil-a': {
    team_purpose: 'competition',
    training_facility_id: 'demo-facility-main',
    training_division: 'quarter_1',
    training_days: 'mon,wed,fri',
    training_start: '19:00',
    training_end: '20:30',
    match_venue_type: 'external',
    match_own_single_venue: false,
    match_home_mode: '',
    match_away_mode: '',
    external_venue_name: 'Municipal La Vega',
    external_venue_address: 'Calle Deportiva 12, Madrid',
  },
  'demo-team-cadete-a': {
    team_purpose: 'competition',
    training_facility_id: 'demo-facility-main',
    training_division: 'quarter_3',
    training_days: 'mon,wed,fri',
    training_start: '20:00',
    training_end: '21:30',
    match_venue_type: 'own',
    match_own_single_venue: false,
    match_home_mode: 'Campo principal (mitad norte)',
    match_away_mode: 'Fuera en liguilla provincial',
    external_venue_name: '',
    external_venue_address: '',
  },
  'demo-team-juvenil-a': {
    team_purpose: 'competition',
    training_facility_id: 'demo-facility-main',
    training_division: 'quarter_4',
    training_days: 'tue,thu,sat',
    training_start: '20:30',
    training_end: '22:00',
    match_venue_type: 'own',
    match_own_single_venue: true,
    match_home_mode: '',
    match_away_mode: '',
    external_venue_name: '',
    external_venue_address: '',
  },
};

export { DIVISION_MODE_LABELS };
