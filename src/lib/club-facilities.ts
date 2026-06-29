export type FacilityDivisionMode = 'full' | 'halves_2' | 'quarters_4';

export type TrainingDivision =
  | 'full'
  | 'half_1'
  | 'half_2'
  | 'quarter_1'
  | 'quarter_2'
  | 'quarter_3'
  | 'quarter_4';

export type ClubFacility = {
  id: string;
  name: string;
  surface_type: string | null;
  division_mode: FacilityDivisionMode;
  address: string | null;
};

export const DIVISION_MODE_LABELS: Record<FacilityDivisionMode, string> = {
  full: 'Campo completo',
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

export const DEMO_FACILITIES: ClubFacility[] = [
  {
    id: 'demo-facility-main',
    name: 'Campo principal F-11',
    surface_type: 'Césped natural',
    division_mode: 'quarters_4',
    address: 'Polideportivo municipal — acceso norte',
  },
  {
    id: 'demo-facility-annex',
    name: 'Campo anexo F-7',
    surface_type: 'Césped artificial',
    division_mode: 'halves_2',
    address: 'Anexo del club',
  },
];

export function divisionOptionsForFacility(
  facility: ClubFacility | undefined
): { value: TrainingDivision; label: string }[] {
  if (!facility) return [];
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

export const WEEKDAY_OPTIONS = [
  { value: 'mon', label: 'Lunes' },
  { value: 'tue', label: 'Martes' },
  { value: 'wed', label: 'Miércoles' },
  { value: 'thu', label: 'Jueves' },
  { value: 'fri', label: 'Viernes' },
  { value: 'sat', label: 'Sábado' },
  { value: 'sun', label: 'Domingo' },
];

export function formatTrainingDays(codes: string): string {
  if (!codes.trim()) return '—';
  const map = new Map(WEEKDAY_OPTIONS.map((day) => [day.value, day.label]));
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
