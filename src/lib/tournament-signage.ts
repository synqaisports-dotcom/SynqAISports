import { generateAccessToken } from '@/lib/tournament-tokens';
import type { SignageSponsor } from '@/lib/signage';
import type { Tournament, TournamentSponsor } from '@/lib/tournaments';

export type TournamentSignageConfig = {
  screen_token?: string;
};

export function getTournamentSignageConfig(
  tournament: Pick<Tournament, 'format_json'>
): TournamentSignageConfig {
  const raw = tournament.format_json?.signage;
  if (!raw || typeof raw !== 'object') return {};
  return raw as TournamentSignageConfig;
}

export function getTournamentSignageScreenToken(
  tournament: Pick<Tournament, 'format_json'>
): string | null {
  const token = getTournamentSignageConfig(tournament).screen_token;
  return typeof token === 'string' && token.trim() ? token.trim() : null;
}

export function buildTournamentSignageFormatPatch(
  tournament: Pick<Tournament, 'format_json'>,
  screenToken: string
): Record<string, unknown> {
  const signage = getTournamentSignageConfig(tournament);
  return {
    ...tournament.format_json,
    signage: { ...signage, screen_token: screenToken },
  };
}

export function createTournamentSignageScreenToken(): string {
  return generateAccessToken();
}

export function tournamentSignageScreenPath(token: string): string {
  return `/torneo/pantallas/${token}`;
}

export function tournamentSponsorsToSignageSponsors(sponsors: TournamentSponsor[]): SignageSponsor[] {
  return sponsors
    .filter((s) => s.active)
    .map((s) => ({
      id: s.id,
      name: s.name,
      logo_url: s.logo_url,
      tier: s.tier,
      url: s.url,
      default_duration_sec: s.tier === 'gold' ? 45 : s.tier === 'silver' ? 30 : 20,
      active_from: null,
      active_until: null,
      notes: s.notes,
      active: true,
    }));
}

export function isTournamentClubSignageEligible(tournament: Pick<Tournament, 'club_id' | 'tenant_type'>): boolean {
  return tournament.tenant_type === 'club' && !!tournament.club_id;
}
