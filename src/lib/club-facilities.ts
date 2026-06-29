export type FacilityDivisionMode = 'full' | 'halves_2' | 'quarters_4';

export type TrainingDivision =
  | 'full'
  | 'half_1'
  | 'half_2'
  | 'quarter_1'
  | 'quarter_2'
  | 'quarter_3'
  | 'quarter_4';

/** Deporte principal de la instalación (plataforma multideporte). */
export type ClubSport =
  | 'football'
  | 'futsal'
  | 'basketball'
  | 'volleyball'
  | 'handball'
  | 'multisport'
  | 'other';

export type FacilityKind =
  | 'football_11'
  | 'football_7'
  | 'futsal_court'
  | 'basketball_court'
  | 'volleyball_court'
  | 'handball_court'
  | 'multisport_hall'
  | 'gym'
  | 'other';

export type ClubFacility = {
  id: string;
  name: string;
  sport: ClubSport;
  facility_kind: FacilityKind;
  surface_type: string | null;
  division_mode: FacilityDivisionMode;
  address: string | null;
  availability_days: string;
  availability_start: string;
  availability_end: string;
  is_match_venue: boolean;
  /** Texto legado / resumen generado al guardar */
  availability_note: string | null;
  notes: string | null;
  active: boolean;
};

export const SPORT_LABELS: Record<ClubSport, string> = {
  football: 'Fútbol',
  futsal: 'Fútbol sala',
  basketball: 'Baloncesto',
  volleyball: 'Voleibol',
  handball: 'Balonmano',
  multisport: 'Polideportivo',
  other: 'Otro',
};

export const FACILITY_KIND_LABELS: Record<FacilityKind, string> = {
  football_11: 'Campo de fútbol 11',
  football_7: 'Campo de fútbol 7',
  futsal_court: 'Pista de fútbol sala',
  basketball_court: 'Pista de baloncesto',
  volleyball_court: 'Pista de voleibol',
  handball_court: 'Pista de balonmano',
  multisport_hall: 'Pabellón polideportivo',
  gym: 'Gimnasio / sala de musculación',
  other: 'Otra instalación',
};

export const DIVISION_MODE_LABELS: Record<FacilityDivisionMode, string> = {
  full: 'Campo completo (sin dividir)',
  halves_2: 'División en 2 mitades',
  quarters_4: 'División en 4 cuartos',
};

export const TRAINING_DIVISION_LABELS: Record<TrainingDivision, string> = {
  full: 'Campo completo',
  half_1: 'Mitad 1',
  half_2: 'Mitad 2',
  quarter_1: 'Cuarto 1',
  quarter_2: 'Cuarto 2',
  quarter_3: 'Cuarto 3',
  quarter_4: 'Cuarto 4',
};

const SPLITTABLE_KINDS = new Set<FacilityKind>(['football_11', 'football_7', 'futsal_court']);

export const FACILITY_KINDS_BY_SPORT: Record<ClubSport, FacilityKind[]> = {
  football: ['football_11', 'football_7', 'multisport_hall', 'gym', 'other'],
  futsal: ['futsal_court', 'multisport_hall', 'gym', 'other'],
  basketball: ['basketball_court', 'multisport_hall', 'gym', 'other'],
  volleyball: ['volleyball_court', 'multisport_hall', 'gym', 'other'],
  handball: ['handball_court', 'multisport_hall', 'gym', 'other'],
  multisport: [
    'multisport_hall',
    'football_11',
    'football_7',
    'futsal_court',
    'basketball_court',
    'gym',
    'other',
  ],
  other: ['other', 'multisport_hall', 'gym'],
};

export const SURFACE_OPTIONS: Record<FacilityKind, string[]> = {
  football_11: ['Césped natural', 'Césped artificial', 'Tierra / no regado'],
  football_7: ['Césped artificial', 'Césped natural', 'Tierra / no regado'],
  futsal_court: ['Parquet', 'Resina / pavimento', 'Césped artificial'],
  basketball_court: ['Parquet', 'Resina / pavimento', 'Hormigón poroso'],
  volleyball_court: ['Parquet', 'Resina / pavimento', 'Arena (playa)'],
  handball_court: ['Parquet', 'Resina / pavimento'],
  multisport_hall: ['Parquet', 'Resina / pavimento', 'Césped artificial'],
  gym: ['Suelo de goma', 'Parquet', 'Resina / pavimento'],
  other: ['Césped natural', 'Césped artificial', 'Parquet', 'Resina / pavimento', 'Otro'],
};

export const DEMO_FACILITIES: ClubFacility[] = [
  {
    id: 'demo-facility-main',
    name: 'Campo principal F-11',
    sport: 'football',
    facility_kind: 'football_11',
    surface_type: 'Césped natural',
    division_mode: 'quarters_4',
    address: 'Polideportivo municipal — acceso norte',
    availability_days: 'mon,tue,wed,thu,fri',
    availability_start: '17:00',
    availability_end: '22:00',
    is_match_venue: true,
    availability_note: 'L M X J V · 17:00 – 22:00',
    notes: 'Compartido con escuela de fútbol los martes por la mañana.',
    active: true,
  },
  {
    id: 'demo-facility-annex',
    name: 'Campo anexo F-7',
    sport: 'football',
    facility_kind: 'football_7',
    surface_type: 'Césped artificial',
    division_mode: 'halves_2',
    address: 'Anexo del club',
    availability_days: 'mon,tue,wed,thu,fri,sat,sun',
    availability_start: '09:00',
    availability_end: '21:00',
    is_match_venue: false,
    availability_note: 'L M X J V S D · 09:00 – 21:00',
    notes: null,
    active: true,
  },
];

export function sportOptions() {
  return (Object.keys(SPORT_LABELS) as ClubSport[]).map((sport) => ({
    value: sport,
    label: SPORT_LABELS[sport],
  }));
}

export function facilityKindOptions(sport: ClubSport) {
  return FACILITY_KINDS_BY_SPORT[sport].map((kind) => ({
    value: kind,
    label: FACILITY_KIND_LABELS[kind],
  }));
}

export function surfaceOptionsForKind(kind: FacilityKind) {
  return SURFACE_OPTIONS[kind].map((surface) => ({
    value: surface,
    label: surface,
  }));
}

export function facilitySupportsDivisions(kind: FacilityKind): boolean {
  return SPLITTABLE_KINDS.has(kind);
}

export function defaultDivisionModeForKind(kind: FacilityKind): FacilityDivisionMode {
  if (!facilitySupportsDivisions(kind)) return 'full';
  if (kind === 'football_11') return 'quarters_4';
  return 'halves_2';
}

export function facilitySummary(facility: ClubFacility): string {
  const parts = [
    SPORT_LABELS[facility.sport],
    FACILITY_KIND_LABELS[facility.facility_kind],
    facility.surface_type,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function parseFacilityFromForm(formData: FormData) {
  const sport = String(formData.get('sport') ?? 'football') as ClubSport;
  const facilityKind = String(formData.get('facilityKind') ?? 'football_11') as FacilityKind;
  const divisionMode = String(formData.get('divisionMode') ?? 'full') as FacilityDivisionMode;
  const availabilityDays = String(formData.get('availabilityDays') ?? '').trim();
  const availabilityStart = String(formData.get('availabilityStart') ?? '').trim();
  const availabilityEnd = String(formData.get('availabilityEnd') ?? '').trim();
  const isMatchVenue = formData.get('isMatchVenue') === 'on';

  return {
    name: String(formData.get('name') ?? '').trim(),
    sport,
    facility_kind: facilityKind,
    surface_type: String(formData.get('surfaceType') ?? '').trim() || null,
    division_mode: facilitySupportsDivisions(facilityKind) ? divisionMode : ('full' as const),
    address: String(formData.get('address') ?? '').trim() || null,
    availability_days: availabilityDays,
    availability_start: availabilityStart,
    availability_end: availabilityEnd,
    is_match_venue: isMatchVenue,
    notes: String(formData.get('notes') ?? '').trim() || null,
  };
}

export function buildAvailabilityNote(
  days: string,
  start: string,
  end: string
): string | null {
  const dayLetters = formatTrainingDayLetters(days);
  const time = formatTimeRange(start || null, end || null);
  const parts = [dayLetters !== '—' ? dayLetters : null, time !== '—' ? time : null].filter(
    Boolean
  );
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function facilityToDbPayload(data: ReturnType<typeof parseFacilityFromForm>) {
  return {
    name: data.name,
    sport: data.sport,
    facility_kind: data.facility_kind,
    surface_type: data.surface_type,
    division_mode: data.division_mode,
    address: data.address,
    availability_days: data.availability_days || null,
    availability_start: data.availability_start || null,
    availability_end: data.availability_end || null,
    is_match_venue: data.is_match_venue,
    availability_note: buildAvailabilityNote(
      data.availability_days,
      data.availability_start,
      data.availability_end
    ),
    notes: data.notes,
  };
}

export function divisionOptionsForFacility(
  facility: ClubFacility | undefined
): { value: TrainingDivision; label: string }[] {
  if (!facility) return [];
  if (!facilitySupportsDivisions(facility.facility_kind)) {
    return [{ value: 'full', label: TRAINING_DIVISION_LABELS.full }];
  }
  if (facility.division_mode === 'full') {
    return [{ value: 'full', label: TRAINING_DIVISION_LABELS.full }];
  }
  if (facility.division_mode === 'halves_2') {
    return [
      { value: 'half_1', label: TRAINING_DIVISION_LABELS.half_1 },
      { value: 'half_2', label: TRAINING_DIVISION_LABELS.half_2 },
    ];
  }
  return [
    { value: 'quarter_1', label: TRAINING_DIVISION_LABELS.quarter_1 },
    { value: 'quarter_2', label: TRAINING_DIVISION_LABELS.quarter_2 },
    { value: 'quarter_3', label: TRAINING_DIVISION_LABELS.quarter_3 },
    { value: 'quarter_4', label: TRAINING_DIVISION_LABELS.quarter_4 },
  ];
}

export const WEEKDAY_BUTTONS = [
  { value: 'mon', letter: 'L', title: 'Lunes' },
  { value: 'tue', letter: 'M', title: 'Martes' },
  { value: 'wed', letter: 'X', title: 'Miércoles' },
  { value: 'thu', letter: 'J', title: 'Jueves' },
  { value: 'fri', letter: 'V', title: 'Viernes' },
  { value: 'sat', letter: 'S', title: 'Sábado' },
  { value: 'sun', letter: 'D', title: 'Domingo' },
] as const;

export const WEEKDAY_OPTIONS = WEEKDAY_BUTTONS.map((day) => ({
  value: day.value,
  label: day.title,
}));

export function sortWeekdayCodes(codes: string[]): string[] {
  const order = WEEKDAY_BUTTONS.map((day) => day.value);
  return [...codes].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
  if (!codes.trim()) return '—';
  const map = new Map<string, string>(WEEKDAY_BUTTONS.map((day) => [day.value, day.letter]));
  return codes
    .split(',')
    .map((code) => map.get(code.trim()) ?? '')
    .filter(Boolean)
    .join(' ');
}

export function formatFacilityAvailability(
  facility: Pick<
    ClubFacility,
    'availability_days' | 'availability_start' | 'availability_end' | 'availability_note'
  >
): string {
  const fromFields = buildAvailabilityNote(
    facility.availability_days,
    facility.availability_start,
    facility.availability_end
  );
  return fromFields ?? facility.availability_note ?? '—';
}

export function formatTrainingDays(codes: string): string {
  if (!codes.trim()) return '—';
  const map = new Map<string, string>(WEEKDAY_OPTIONS.map((day) => [day.value, day.label]));
  return codes
    .split(',')
    .map((code) => map.get(code.trim()) ?? code)
    .filter(Boolean)
    .join(', ');
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—';
  const fmt = (value: string | null) => (value ? value.slice(0, 5) : '—');
  return `${fmt(start)} – ${fmt(end)}`;
}

const FACILITY_SELECT =
  'id, name, sport, facility_kind, surface_type, division_mode, address, availability_days, availability_start, availability_end, is_match_venue, availability_note, notes, active';

export { FACILITY_SELECT };
