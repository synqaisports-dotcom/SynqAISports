import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import {
  parseSportPositions,
  positionsForSport,
  serializeSportPositions,
  sportHasPosition,
  sportPositionLabel,
  sportPositionSelectOptions,
  sportPositionShort,
  normalizeSportPositionCode,
  type SportPositionEntry,
} from '@/lib/sport-positions';

/** Códigos de posición de fútbol (compatibilidad con código existente). */
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

export const PLAYER_POSITIONS: SportPositionEntry[] = positionsForSport('football');

export function normalizePositionCode(value: string | null | undefined): PlayerPositionCode | null {
  const code = normalizeSportPositionCode('football', value);
  return code as PlayerPositionCode | null;
}

export function parsePlayerPositions(value: string | null | undefined): PlayerPositionCode[] {
  return parseSportPositions('football', value) as PlayerPositionCode[];
}

export function serializePlayerPositions(codes: Iterable<PlayerPositionCode>): string {
  return serializeSportPositions('football', codes);
}

export function positionLabel(value: string | null | undefined): string {
  return sportPositionLabel('football', value);
}

export function positionShort(value: string | null | undefined): string {
  return sportPositionShort('football', value);
}

export function positionSelectOptions() {
  return sportPositionSelectOptions('football');
}

export function playerHasPosition(
  value: string | null | undefined,
  code: PlayerPositionCode
): boolean {
  return sportHasPosition('football', value, code);
}

export function positionsForPlayerSport(sport: ClubPracticedSport | string = 'football') {
  return positionsForSport(sport);
}

export function parsePositionsForSport(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string[] {
  return parseSportPositions(sport, value);
}

export function serializePositionsForSport(
  sport: ClubPracticedSport | string,
  codes: Iterable<string>
): string {
  return serializeSportPositions(sport, codes);
}

export function positionShortForSport(
  sport: ClubPracticedSport | string,
  value: string | null | undefined
): string {
  return sportPositionShort(sport, value);
}
