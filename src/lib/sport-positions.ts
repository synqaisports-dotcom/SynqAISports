import type { ClubPracticedSport } from '@/lib/club-practiced-sports';

export type SportPositionEntry = {
  code: string;
  label: string;
  short: string;
};

const FOOTBALL_POSITIONS: SportPositionEntry[] = [
  { code: 'POR', label: 'Portero', short: 'POR' },
  { code: 'LTD', label: 'Lateral derecho', short: 'LTD' },
  { code: 'CEN', label: 'Central', short: 'CEN' },
  { code: 'LTI', label: 'Lateral izquierdo', short: 'LTI' },
  { code: 'MD', label: 'Medio defensivo', short: 'MD' },
  { code: 'MC', label: 'Mediocentro', short: 'MC' },
  { code: 'MI', label: 'Medio izquierdo', short: 'MI' },
  { code: 'EXD', label: 'Extremo derecho', short: 'EXD' },
  { code: 'DL', label: 'Delantero', short: 'DL' },
  { code: 'EXI', label: 'Extremo izquierdo', short: 'EXI' },
];

const BASKETBALL_POSITIONS: SportPositionEntry[] = [
  { code: 'BASE', label: 'Base', short: 'BASE' },
  { code: 'ESC', label: 'Escolta', short: 'ESC' },
  { code: 'ALA', label: 'Alero', short: 'ALA' },
  { code: 'AP', label: 'Ala-pívot', short: 'AP' },
  { code: 'PIV', label: 'Pívot', short: 'PIV' },
];

const VOLLEYBALL_POSITIONS: SportPositionEntry[] = [
  { code: 'COL', label: 'Colocador', short: 'COL' },
  { code: 'OP', label: 'Opuesto', short: 'OP' },
  { code: 'CEN', label: 'Central', short: 'CEN' },
  { code: 'REC', label: 'Receptor', short: 'REC' },
  { code: 'LIB', label: 'Líbero', short: 'LIB' },
];

const HANDBALL_POSITIONS: SportPositionEntry[] = [
  { code: 'POR', label: 'Portero', short: 'POR' },
  { code: 'LAT', label: 'Lateral', short: 'LAT' },
  { code: 'CEN', label: 'Central', short: 'CEN' },
  { code: 'EXT', label: 'Extremo', short: 'EXT' },
  { code: 'PIV', label: 'Pívot', short: 'PIV' },
];

const WATERPOLO_POSITIONS: SportPositionEntry[] = [
  { code: 'POR', label: 'Portero', short: 'POR' },
  { code: 'DEF', label: 'Defensa', short: 'DEF' },
  { code: 'DRV', label: 'Driver', short: 'DRV' },
  { code: 'CEN', label: 'Centro', short: 'CEN' },
  { code: 'ALA', label: 'Ala', short: 'ALA' },
];

const POSITIONS_BY_SPORT: Record<ClubPracticedSport, SportPositionEntry[]> = {
  football: FOOTBALL_POSITIONS,
  futsal: FOOTBALL_POSITIONS,
  basketball: BASKETBALL_POSITIONS,
  volleyball: VOLLEYBALL_POSITIONS,
  handball: HANDBALL_POSITIONS,
  waterpolo: WATERPOLO_POSITIONS,
};

const LEGACY_FOOTBALL_MAP: Record<string, string> = {
  portero: 'POR',
  por: 'POR',
  defensa: 'CEN',
  df: 'CEN',
  central: 'CEN',
  lateral: 'LTI',
  lt: 'LTI',
  'lateral derecho': 'LTD',
  ltd: 'LTD',
  'lateral izquierdo': 'LTI',
  lti: 'LTI',
  'medio defensivo': 'MD',
  md: 'MD',
  mediocentro: 'MC',
  centrocampista: 'MC',
  mc: 'MC',
  'medio izquierdo': 'MI',
  mi: 'MI',
  extremo: 'EXD',
  ext: 'EXD',
  'extremo derecho': 'EXD',
  exd: 'EXD',
  'extremo izquierdo': 'EXI',
  exi: 'EXI',
  delantero: 'DL',
  dl: 'DL',
};

export function positionsForSport(sport: ClubPracticedSport | string): SportPositionEntry[] {
  const key = sport as ClubPracticedSport;
  return POSITIONS_BY_SPORT[key] ?? FOOTBALL_POSITIONS;
}

export function normalizeSportPositionCode(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const catalog = positionsForSport(sport);
  const upper = trimmed.toUpperCase();
  if (catalog.some((item) => item.code === upper)) return upper;

  if (sport === 'football' || sport === 'futsal') {
    const legacy = LEGACY_FOOTBALL_MAP[trimmed.toLowerCase()];
    if (legacy) return legacy;
  }

  return null;
}

export function parseSportPositions(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string[] {
  if (!value?.trim()) return [];

  const selected = new Set<string>();
  for (const part of value.split(/[,;/|]+/)) {
    const code = normalizeSportPositionCode(sport, part.trim());
    if (code) selected.add(code);
  }

  return positionsForSport(sport)
    .filter((item) => selected.has(item.code))
    .map((item) => item.code);
}

export function serializeSportPositions(
  sport: ClubPracticedSport | string,
  codes: Iterable<string>
): string {
  const selected = new Set(codes);
  return positionsForSport(sport)
    .filter((item) => selected.has(item.code))
    .map((item) => item.code)
    .join(',');
}

export function sportPositionLabel(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string {
  const codes = parseSportPositions(sport, value);
  if (codes.length === 0) return value?.trim() || '—';
  const catalog = positionsForSport(sport);
  return codes
    .map((code) => catalog.find((item) => item.code === code)?.label ?? code)
    .join(', ');
}

export function sportPositionShort(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string {
  const codes = parseSportPositions(sport, value);
  if (codes.length === 0) return value?.trim() || '—';
  return codes.join(' · ');
}

export function sportPositionSelectOptions(sport: ClubPracticedSport | string) {
  return positionsForSport(sport).map((item) => ({
    value: item.code,
    label: `${item.short} · ${item.label}`,
  }));
}

export function sportHasPosition(
  sport: ClubPracticedSport | string,
  value: string | null | undefined,
  code: string
): boolean {
  return parseSportPositions(sport, value).includes(code);
}
