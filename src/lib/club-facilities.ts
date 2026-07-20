export type FacilityDivisionMode = 'full' | 'halves_2' | 'quarters_4';
export type FacilityBookingMode = 'instant' | 'approval';

export type TrainingDivision =
  | 'full'
  | 'half_1'
  | 'half_2'
  | 'quarter_1'
  | 'quarter_2'
  | 'quarter_3'
  | 'quarter_4';

/** Deporte o ámbito principal de la instalación (plataforma multideporte + espacios del club). */
export type ClubSport =
  | 'football'
  | 'futsal'
  | 'basketball'
  | 'volleyball'
  | 'handball'
  | 'waterpolo'
  | 'fitness'
  | 'physiotherapy'
  | 'training'
  | 'club_admin'
  | 'multisport'
  | 'other';

export type FacilityKind =
  | 'football_11'
  | 'football_7'
  | 'futsal_court'
  | 'basketball_court'
  | 'volleyball_court'
  | 'handball_court'
  | 'waterpolo_pool'
  | 'multisport_hall'
  | 'gym'
  | 'physiotherapy_room'
  | 'training_classroom'
  | 'meeting_room'
  | 'club_offices'
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
  division_schedule_days: string;
  division_schedule_start: string;
  division_schedule_end: string;
  is_match_venue: boolean;
  supports_reservations: boolean;
  reservation_capacity: number;
  slot_duration_minutes: number;
  booking_mode: 'instant' | 'approval';
  max_active_reservations_per_player: number;
  advance_booking_days: number;
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
  waterpolo: 'Waterpolo',
  fitness: 'Gimnasio',
  physiotherapy: 'Fisioterapia',
  training: 'Aula de formación',
  club_admin: 'Espacios del club',
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
  waterpolo_pool: 'Piscina / campo de waterpolo',
  multisport_hall: 'Pabellón polideportivo',
  gym: 'Gimnasio',
  physiotherapy_room: 'Sala de fisioterapia',
  training_classroom: 'Aula de formación',
  meeting_room: 'Sala de juntas',
  club_offices: 'Oficinas del club',
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

const MATCH_VENUE_KINDS = new Set<FacilityKind>([
  'football_11',
  'football_7',
  'futsal_court',
  'basketball_court',
  'volleyball_court',
  'handball_court',
  'waterpolo_pool',
]);

const RESERVATION_KINDS = new Set<FacilityKind>(['gym', 'physiotherapy_room']);

export const FACILITY_KINDS_BY_SPORT: Record<ClubSport, FacilityKind[]> = {
  football: ['football_11', 'football_7', 'multisport_hall', 'other'],
  futsal: ['futsal_court', 'multisport_hall', 'other'],
  basketball: ['basketball_court', 'multisport_hall', 'other'],
  volleyball: ['volleyball_court', 'multisport_hall', 'other'],
  handball: ['handball_court', 'multisport_hall', 'other'],
  waterpolo: ['waterpolo_pool', 'multisport_hall', 'other'],
  fitness: ['gym'],
  physiotherapy: ['physiotherapy_room'],
  training: ['training_classroom'],
  club_admin: ['meeting_room', 'club_offices'],
  multisport: [
    'multisport_hall',
    'football_11',
    'football_7',
    'futsal_court',
    'basketball_court',
    'volleyball_court',
    'handball_court',
    'waterpolo_pool',
    'gym',
    'physiotherapy_room',
    'training_classroom',
    'meeting_room',
    'other',
  ],
  other: ['other', 'multisport_hall', 'gym', 'training_classroom', 'meeting_room', 'club_offices'],
};

export const SURFACE_OPTIONS: Record<FacilityKind, string[]> = {
  football_11: ['Césped natural', 'Césped artificial', 'Tierra / no regado'],
  football_7: ['Césped artificial', 'Césped natural', 'Tierra / no regado'],
  futsal_court: ['Parquet', 'Resina / pavimento', 'Césped artificial'],
  basketball_court: ['Parquet', 'Resina / pavimento', 'Hormigón poroso'],
  volleyball_court: ['Parquet', 'Resina / pavimento', 'Arena (playa)'],
  handball_court: ['Parquet', 'Resina / pavimento'],
  waterpolo_pool: ['Agua — piscina olímpica', 'Agua — piscina corta'],
  multisport_hall: ['Parquet', 'Resina / pavimento', 'Césped artificial'],
  gym: ['Suelo de goma', 'Parquet', 'Resina / pavimento'],
  physiotherapy_room: ['Suelo de goma', 'Parquet', 'Linóleo sanitario'],
  training_classroom: ['Parquet', 'Moqueta', 'Linóleo'],
  meeting_room: ['Parquet', 'Moqueta', 'Linóleo'],
  club_offices: ['Parquet', 'Moqueta', 'Linóleo'],
  other: ['Césped natural', 'Césped artificial', 'Parquet', 'Resina / pavimento', 'Otro'],
};

function withReservationDefaults(
  facility: Omit<
    ClubFacility,
    | 'reservation_capacity'
    | 'slot_duration_minutes'
    | 'booking_mode'
    | 'max_active_reservations_per_player'
    | 'advance_booking_days'
  > &
    Partial<
      Pick<
        ClubFacility,
        | 'reservation_capacity'
        | 'slot_duration_minutes'
        | 'booking_mode'
        | 'max_active_reservations_per_player'
        | 'advance_booking_days'
      >
    >
): ClubFacility {
  const defaults = defaultBookingConfigForKind(facility.facility_kind);
  return {
    ...facility,
    reservation_capacity:
      facility.reservation_capacity ??
      (facility.supports_reservations ? defaults.reservation_capacity : 1),
    slot_duration_minutes:
      facility.slot_duration_minutes ??
      (facility.supports_reservations ? defaults.slot_duration_minutes : 60),
    booking_mode:
      facility.booking_mode ??
      (facility.supports_reservations ? defaults.booking_mode : 'instant'),
    max_active_reservations_per_player:
      facility.max_active_reservations_per_player ??
      (facility.supports_reservations ? defaults.max_active_reservations_per_player : 1),
    advance_booking_days:
      facility.advance_booking_days ??
      (facility.supports_reservations ? defaults.advance_booking_days : 7),
  };
}

const RAW_DEMO_FACILITIES = [
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
    division_schedule_days: 'mon,tue,wed,thu',
    division_schedule_start: '17:00',
    division_schedule_end: '21:00',
    is_match_venue: true,
    supports_reservations: false,
    availability_note: 'L M X J V · 17:00 – 22:00 | División: L M X J · 17:00 – 21:00',
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
    division_schedule_days: 'mon,tue,wed,thu,fri',
    division_schedule_start: '17:00',
    division_schedule_end: '20:00',
    is_match_venue: false,
    supports_reservations: false,
    availability_note: 'L M X J V S D · 09:00 – 21:00 | División: L M X J V · 17:00 – 20:00',
    notes: null,
    active: true,
  },
  {
    id: 'demo-facility-gym',
    name: 'Gimnasio del club',
    sport: 'fitness',
    facility_kind: 'gym',
    surface_type: 'Suelo de goma',
    division_mode: 'full',
    address: 'Edificio principal — planta baja',
    availability_days: 'mon,tue,wed,thu,fri',
    availability_start: '07:00',
    availability_end: '22:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: false,
    supports_reservations: true,
    availability_note: 'L M X J V · 07:00 – 22:00',
    notes: 'Gestión de reservas por franjas horarias.',
    active: true,
  },
  {
    id: 'demo-facility-physio',
    name: 'Sala de fisioterapia',
    sport: 'physiotherapy',
    facility_kind: 'physiotherapy_room',
    surface_type: 'Suelo de goma',
    division_mode: 'full',
    address: 'Edificio principal — planta 1',
    availability_days: 'mon,tue,wed,thu,fri',
    availability_start: '09:00',
    availability_end: '20:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: false,
    supports_reservations: true,
    availability_note: 'L M X J V · 09:00 – 20:00',
    notes: 'Citas de 45 minutos. Reserva previa obligatoria.',
    active: true,
  },
  {
    id: 'demo-facility-waterpolo',
    name: 'Piscina waterpolo',
    sport: 'waterpolo',
    facility_kind: 'waterpolo_pool',
    surface_type: 'Agua — piscina olímpica',
    division_mode: 'full',
    address: 'Centro acuático municipal',
    availability_days: 'tue,thu,sat',
    availability_start: '18:00',
    availability_end: '21:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: true,
    supports_reservations: false,
    availability_note: 'M J S · 18:00 – 21:00',
    notes: null,
    active: true,
  },
  {
    id: 'demo-facility-classroom',
    name: 'Aula de formación',
    sport: 'training',
    facility_kind: 'training_classroom',
    surface_type: 'Parquet',
    division_mode: 'full',
    address: 'Sede social — planta 2',
    availability_days: 'mon,wed,fri',
    availability_start: '10:00',
    availability_end: '14:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: false,
    supports_reservations: false,
    availability_note: 'L X V · 10:00 – 14:00',
    notes: 'Proyector y pizarra digital.',
    active: true,
  },
  {
    id: 'demo-facility-meeting',
    name: 'Sala de juntas',
    sport: 'club_admin',
    facility_kind: 'meeting_room',
    surface_type: 'Moqueta',
    division_mode: 'full',
    address: 'Sede social — planta 1',
    availability_days: 'mon,tue,wed,thu,fri',
    availability_start: '09:00',
    availability_end: '19:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: false,
    supports_reservations: false,
    availability_note: 'L M X J V · 09:00 – 19:00',
    notes: 'Capacidad 12 personas.',
    active: true,
  },
  {
    id: 'demo-facility-offices',
    name: 'Oficinas del club',
    sport: 'club_admin',
    facility_kind: 'club_offices',
    surface_type: 'Linóleo',
    division_mode: 'full',
    address: 'Sede social — planta 1',
    availability_days: 'mon,tue,wed,thu,fri',
    availability_start: '09:00',
    availability_end: '18:00',
    division_schedule_days: '',
    division_schedule_start: '',
    division_schedule_end: '',
    is_match_venue: false,
    supports_reservations: false,
    availability_note: 'L M X J V · 09:00 – 18:00',
    notes: 'Secretaría, administración y dirección deportiva.',
    active: true,
  },
] as const;

export const DEMO_FACILITIES: ClubFacility[] = RAW_DEMO_FACILITIES.map((facility) =>
  withReservationDefaults(facility)
);

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

export function facilityAllowsMatchVenue(kind: FacilityKind): boolean {
  return MATCH_VENUE_KINDS.has(kind);
}

export function facilityKindSupportsReservations(kind: FacilityKind): boolean {
  return RESERVATION_KINDS.has(kind);
}

export function defaultBookingConfigForKind(kind: FacilityKind): {
  reservation_capacity: number;
  slot_duration_minutes: number;
  booking_mode: FacilityBookingMode;
  max_active_reservations_per_player: number;
  advance_booking_days: number;
} {
  if (kind === 'physiotherapy_room') {
    return {
      reservation_capacity: 1,
      slot_duration_minutes: 45,
      booking_mode: 'approval',
      max_active_reservations_per_player: 2,
      advance_booking_days: 14,
    };
  }
  if (kind === 'gym') {
    return {
      reservation_capacity: 8,
      slot_duration_minutes: 60,
      booking_mode: 'instant',
      max_active_reservations_per_player: 3,
      advance_booking_days: 14,
    };
  }
  return {
    reservation_capacity: 1,
    slot_duration_minutes: 60,
    booking_mode: 'instant',
    max_active_reservations_per_player: 1,
    advance_booking_days: 7,
  };
}

export function facilityScheduleTitle(kind: FacilityKind): string {
  if (RESERVATION_KINDS.has(kind)) return 'Horario de reservas';
  if (SPLITTABLE_KINDS.has(kind) || MATCH_VENUE_KINDS.has(kind)) {
    return 'Horario habitual del campo';
  }
  return 'Horario de apertura';
}

export function facilityScheduleHint(kind: FacilityKind): string {
  if (RESERVATION_KINDS.has(kind)) {
    return 'Días y franja en los que se aceptan reservas (L · M · X · J · V · S · D).';
  }
  if (SPLITTABLE_KINDS.has(kind) || MATCH_VENUE_KINDS.has(kind)) {
    return 'Días y franja en los que la instalación está disponible en general (L · M · X · J · V · S · D).';
  }
  return 'Días y franja en los que el espacio está disponible (L · M · X · J · V · S · D).';
}

export function facilityHasSharedDivisions(facility: ClubFacility): boolean {
  return facilitySupportsDivisions(facility.facility_kind) && facility.division_mode !== 'full';
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
  const divisionScheduleDays = String(formData.get('divisionScheduleDays') ?? '').trim();
  const divisionScheduleStart = String(formData.get('divisionScheduleStart') ?? '').trim();
  const divisionScheduleEnd = String(formData.get('divisionScheduleEnd') ?? '').trim();
  const isMatchVenue = facilityAllowsMatchVenue(facilityKind)
    ? formData.get('isMatchVenue') === 'on'
    : false;
  const resolvedDivisionMode = facilitySupportsDivisions(facilityKind) ? divisionMode : 'full';
  const supportsReservations = facilityKindSupportsReservations(facilityKind);
  const bookingDefaults = defaultBookingConfigForKind(facilityKind);

  return {
    name: String(formData.get('name') ?? '').trim(),
    sport,
    facility_kind: facilityKind,
    surface_type: String(formData.get('surfaceType') ?? '').trim() || null,
    division_mode: resolvedDivisionMode,
    address: String(formData.get('address') ?? '').trim() || null,
    availability_days: availabilityDays,
    availability_start: availabilityStart,
    availability_end: availabilityEnd,
    division_schedule_days:
      resolvedDivisionMode !== 'full' ? divisionScheduleDays : '',
    division_schedule_start:
      resolvedDivisionMode !== 'full' ? divisionScheduleStart : '',
    division_schedule_end: resolvedDivisionMode !== 'full' ? divisionScheduleEnd : '',
    is_match_venue: isMatchVenue,
    supports_reservations: supportsReservations,
    reservation_capacity: supportsReservations
      ? Math.max(1, Number(formData.get('reservationCapacity') ?? bookingDefaults.reservation_capacity))
      : 1,
    slot_duration_minutes: supportsReservations
      ? Math.max(15, Number(formData.get('slotDurationMinutes') ?? bookingDefaults.slot_duration_minutes))
      : 60,
    booking_mode: supportsReservations
      ? (String(formData.get('bookingMode') ?? bookingDefaults.booking_mode) as FacilityBookingMode)
      : 'instant',
    max_active_reservations_per_player: supportsReservations
      ? Math.max(
          1,
          Number(
            formData.get('maxActiveReservationsPerPlayer') ??
              bookingDefaults.max_active_reservations_per_player
          )
        )
      : 1,
    advance_booking_days: supportsReservations
      ? Math.max(
          1,
          Number(formData.get('advanceBookingDays') ?? bookingDefaults.advance_booking_days)
        )
      : 7,
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

export function buildFacilityAvailabilityNote(data: {
  availability_days: string;
  availability_start: string;
  availability_end: string;
  division_mode: FacilityDivisionMode;
  facility_kind: FacilityKind;
  division_schedule_days: string;
  division_schedule_start: string;
  division_schedule_end: string;
}): string | null {
  const general = buildAvailabilityNote(
    data.availability_days,
    data.availability_start,
    data.availability_end
  );

  if (
    data.division_mode !== 'full' &&
    facilitySupportsDivisions(data.facility_kind) &&
    data.division_schedule_days.trim()
  ) {
    const division = buildAvailabilityNote(
      data.division_schedule_days,
      data.division_schedule_start,
      data.division_schedule_end
    );
    const parts = [general, division ? `División: ${division}` : null].filter(Boolean);
    return parts.length > 0 ? parts.join(' | ') : null;
  }

  return general;
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
    division_schedule_days: data.division_schedule_days || null,
    division_schedule_start: data.division_schedule_start || null,
    division_schedule_end: data.division_schedule_end || null,
    is_match_venue: data.is_match_venue,
    supports_reservations: data.supports_reservations,
    reservation_capacity: data.reservation_capacity,
    slot_duration_minutes: data.slot_duration_minutes,
    booking_mode: data.booking_mode,
    max_active_reservations_per_player: data.max_active_reservations_per_player,
    advance_booking_days: data.advance_booking_days,
    availability_note: buildFacilityAvailabilityNote(data),
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
  const order: string[] = WEEKDAY_BUTTONS.map((day) => day.value);
  return [...codes].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

export function formatTrainingDayLetters(codes: string): string {
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
    | 'availability_days'
    | 'availability_start'
    | 'availability_end'
    | 'division_mode'
    | 'facility_kind'
    | 'division_schedule_days'
    | 'division_schedule_start'
    | 'division_schedule_end'
    | 'availability_note'
  >
): string {
  const fromFields = buildFacilityAvailabilityNote({
    availability_days: facility.availability_days,
    availability_start: facility.availability_start,
    availability_end: facility.availability_end,
    division_mode: facility.division_mode,
    facility_kind: facility.facility_kind,
    division_schedule_days: facility.division_schedule_days,
    division_schedule_start: facility.division_schedule_start,
    division_schedule_end: facility.division_schedule_end,
  });
  return fromFields ?? facility.availability_note ?? '—';
}

export function formatDivisionSchedule(
  facility: Pick<
    ClubFacility,
    | 'division_mode'
    | 'facility_kind'
    | 'division_schedule_days'
    | 'division_schedule_start'
    | 'division_schedule_end'
  >
): string {
  if (!facilityHasSharedDivisions(facility as ClubFacility)) return '—';
  return (
    buildAvailabilityNote(
      facility.division_schedule_days,
      facility.division_schedule_start,
      facility.division_schedule_end
    ) ?? '—'
  );
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
  'id, name, sport, facility_kind, surface_type, division_mode, address, availability_days, availability_start, availability_end, division_schedule_days, division_schedule_start, division_schedule_end, is_match_venue, supports_reservations, reservation_capacity, slot_duration_minutes, booking_mode, max_active_reservations_per_player, advance_booking_days, availability_note, notes, active';

export { FACILITY_SELECT };
