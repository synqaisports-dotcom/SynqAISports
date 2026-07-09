export type PlayerPositionCode =
  | 'POR'
  | 'LTD'
  | 'CEN'
  | 'LTI'
  | 'MD'
  | 'MC'
  | 'MI'
  | 'EXD'
  | 'DL'
  | 'EXI';

export const PLAYER_POSITIONS: {
  code: PlayerPositionCode;
  label: string;
  short: string;
}[] = [
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

const LEGACY_POSITION_MAP: Record<string, PlayerPositionCode> = {
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

export function normalizePositionCode(value: string | null | undefined): PlayerPositionCode | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase() as PlayerPositionCode;
  if (PLAYER_POSITIONS.some((item) => item.code === upper)) return upper;
  const legacy = LEGACY_POSITION_MAP[trimmed.toLowerCase()];
  return legacy ?? null;
}

export function parsePlayerPositions(value: string | null | undefined): PlayerPositionCode[] {
  if (!value?.trim()) return [];

  const selected = new Set<PlayerPositionCode>();
  for (const part of value.split(/[,;/|]+/)) {
    const code = normalizePositionCode(part.trim());
    if (code) selected.add(code);
  }

  return PLAYER_POSITIONS.filter((item) => selected.has(item.code)).map((item) => item.code);
}

export function serializePlayerPositions(codes: Iterable<PlayerPositionCode>): string {
  const selected = new Set(codes);
  return PLAYER_POSITIONS.filter((item) => selected.has(item.code))
    .map((item) => item.code)
    .join(',');
}

export function positionLabel(value: string | null | undefined): string {
  const codes = parsePlayerPositions(value);
  if (codes.length === 0) return value?.trim() || '—';
  return codes
    .map((code) => PLAYER_POSITIONS.find((item) => item.code === code)?.label ?? code)
    .join(', ');
}

export function positionShort(value: string | null | undefined): string {
  const codes = parsePlayerPositions(value);
  if (codes.length === 0) return value?.trim() || '—';
  return codes.join(' · ');
}

export function positionSelectOptions() {
  return PLAYER_POSITIONS.map((item) => ({
    value: item.code,
    label: `${item.short} · ${item.label}`,
  }));
}

export function playerHasPosition(
  value: string | null | undefined,
  code: PlayerPositionCode
): boolean {
  return parsePlayerPositions(value).includes(code);
}
