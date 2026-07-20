import type { FieldTemplate } from '@/lib/exercise-drawing';
import type { ClubSport } from '@/lib/club-facilities';
import { SPORT_LABELS } from '@/lib/club-facilities';

/** Deportes competitivos que un club puede declarar al darse de alta. */
export type ClubPracticedSport =
  | 'football'
  | 'futsal'
  | 'basketball'
  | 'volleyball'
  | 'handball'
  | 'waterpolo';

export const CLUB_PRACTICED_SPORT_ORDER: ClubPracticedSport[] = [
  'football',
  'futsal',
  'basketball',
  'volleyball',
  'handball',
  'waterpolo',
];

export const CLUB_PRACTICED_SPORT_LABELS: Record<ClubPracticedSport, string> = {
  football: 'Fútbol',
  futsal: 'Fútbol sala',
  basketball: 'Baloncesto',
  volleyball: 'Voleibol',
  handball: 'Balonmano',
  waterpolo: 'Waterpolo',
};

export const CLUB_PRACTICED_SPORT_SHORT: Record<ClubPracticedSport, string> = {
  football: 'Fútbol',
  futsal: 'Sala',
  basketball: 'Básquet',
  volleyball: 'Vóley',
  handball: 'Balonmano',
  waterpolo: 'Waterpolo',
};

/** Estado de pizarras/campos por deporte (ampliar al añadir nuevos fondos). */
export const PRACTICED_SPORT_DRAWING: Record<
  ClubPracticedSport,
  { boardReady: boolean; defaultField?: FieldTemplate; note?: string }
> = {
  football: { boardReady: true, defaultField: 'football-full' },
  futsal: { boardReady: true, defaultField: 'futsal' },
  basketball: { boardReady: false, note: 'Pista de baloncesto — próximamente' },
  volleyball: { boardReady: false, note: 'Pista de voleibol — próximamente' },
  handball: { boardReady: false, note: 'Pista de balonmano — próximamente' },
  waterpolo: { boardReady: false, note: 'Campo acuático — próximamente' },
};

export const DEFAULT_PRACTICED_SPORTS: ClubPracticedSport[] = ['football'];

export function clubPracticedSportOptions() {
  return CLUB_PRACTICED_SPORT_ORDER.map((sport) => ({
    value: sport,
    label: CLUB_PRACTICED_SPORT_LABELS[sport],
    shortLabel: CLUB_PRACTICED_SPORT_SHORT[sport],
  }));
}

export function parsePracticedSports(value: unknown): ClubPracticedSport[] {
  if (!Array.isArray(value)) return [...DEFAULT_PRACTICED_SPORTS];
  const allowed = new Set(CLUB_PRACTICED_SPORT_ORDER);
  const parsed = value
    .map((item) => String(item).trim())
    .filter((item): item is ClubPracticedSport => allowed.has(item as ClubPracticedSport));
  return parsed.length > 0 ? sortPracticedSports(parsed) : [...DEFAULT_PRACTICED_SPORTS];
}

export function parsePracticedSportsFromForm(formData: FormData): ClubPracticedSport[] {
  const raw = String(formData.get('practicedSports') ?? '').trim();
  if (!raw) return [...DEFAULT_PRACTICED_SPORTS];
  return parsePracticedSports(raw.split(',').map((item) => item.trim()).filter(Boolean));
}

export function sortPracticedSports(sports: ClubPracticedSport[]): ClubPracticedSport[] {
  const order = new Map(CLUB_PRACTICED_SPORT_ORDER.map((sport, index) => [sport, index]));
  return [...sports].sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
}

export function practicedSportsSummary(sports: ClubPracticedSport[]): string {
  return sortPracticedSports(sports)
    .map((sport) => CLUB_PRACTICED_SPORT_LABELS[sport])
    .join(' · ');
}

export function fieldTemplatesForPracticedSports(
  sports: ClubPracticedSport[]
): FieldTemplate[] {
  const templates = new Set<FieldTemplate>();
  for (const sport of sports) {
    const drawing = PRACTICED_SPORT_DRAWING[sport];
    if (drawing.boardReady && drawing.defaultField) {
      templates.add(drawing.defaultField);
    }
  }
  if (sports.includes('football')) {
    templates.add('football-f7');
    templates.add('football-half');
    templates.add('football-third');
  }
  templates.add('blank');
  return [...templates];
}

const FACILITY_SPACE_SPORTS: ClubSport[] = [
  'fitness',
  'physiotherapy',
  'training',
  'club_admin',
  'multisport',
  'other',
];

export function facilitySportOptionsForClub(practicedSports: ClubPracticedSport[]) {
  const practiced = sortPracticedSports(practicedSports).map((sport) => ({
    value: sport as ClubSport,
    label: CLUB_PRACTICED_SPORT_LABELS[sport],
  }));
  const spaces = FACILITY_SPACE_SPORTS.map((sport) => ({
    value: sport,
    label: SPORT_LABELS[sport],
  }));
  return [...practiced, ...spaces];
}
