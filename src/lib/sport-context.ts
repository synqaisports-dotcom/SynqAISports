import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { DEFAULT_PRACTICED_SPORTS } from '@/lib/club-practiced-sports';

/** Deporte activo en la sesión del portal (query ?sport= o default del club). */
export function resolveActiveSport(
  practicedSports: ClubPracticedSport[],
  requested?: string | null
): ClubPracticedSport {
  const allowed = new Set(practicedSports);
  const normalized = String(requested ?? '').trim() as ClubPracticedSport;
  if (normalized && allowed.has(normalized)) return normalized;
  return practicedSports[0] ?? DEFAULT_PRACTICED_SPORTS[0];
}

export function sportSearchParam(sport: ClubPracticedSport): string {
  return `sport=${encodeURIComponent(sport)}`;
}

export function appendSportParam(path: string, sport: ClubPracticedSport): string {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${sportSearchParam(sport)}`;
}

export function parseSportFromSearchParams(
  params: Record<string, string | string[] | undefined> | undefined
): string | null {
  const raw = params?.sport;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

export function clubIsMultisport(practicedSports: ClubPracticedSport[]): boolean {
  return practicedSports.length > 1;
}

export function methodologySportsForClub(
  practicedSports: ClubPracticedSport[]
): ClubPracticedSport[] {
  return practicedSports;
}
