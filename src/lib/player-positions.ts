export type PlayerPositionCode = 'POR' | 'DF' | 'LT' | 'MC' | 'DL' | 'EXT';

export const PLAYER_POSITIONS: {
  code: PlayerPositionCode;
  label: string;
  short: string;
}[] = [
  { code: 'POR', label: 'Portero', short: 'POR' },
  { code: 'DF', label: 'Defensa', short: 'DF' },
  { code: 'LT', label: 'Lateral', short: 'LT' },
  { code: 'MC', label: 'Mediocentro', short: 'MC' },
  { code: 'DL', label: 'Delantero', short: 'DL' },
  { code: 'EXT', label: 'Extremo', short: 'EXT' },
];

const LEGACY_POSITION_MAP: Record<string, PlayerPositionCode> = {
  portero: 'POR',
  defensa: 'DF',
  lateral: 'LT',
  mediocentro: 'MC',
  centrocampista: 'MC',
  delantero: 'DL',
  extremo: 'EXT',
  por: 'POR',
  df: 'DF',
  lt: 'LT',
  mc: 'MC',
  dl: 'DL',
  ext: 'EXT',
};

export function normalizePositionCode(value: string | null | undefined): PlayerPositionCode | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase() as PlayerPositionCode;
  if (PLAYER_POSITIONS.some((item) => item.code === upper)) return upper;
  const legacy = LEGACY_POSITION_MAP[trimmed.toLowerCase()];
  return legacy ?? null;
}

export function positionLabel(value: string | null | undefined): string {
  const code = normalizePositionCode(value);
  if (!code) return value?.trim() || '—';
  return PLAYER_POSITIONS.find((item) => item.code === code)?.label ?? value?.trim() ?? '—';
}

export function positionShort(value: string | null | undefined): string {
  const code = normalizePositionCode(value);
  if (!code) return value?.trim() || '—';
  return code;
}

export function positionSelectOptions() {
  return PLAYER_POSITIONS.map((item) => ({
    value: item.code,
    label: `${item.short} · ${item.label}`,
  }));
}
