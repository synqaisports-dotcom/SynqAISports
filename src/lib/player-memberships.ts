import type { ClubPracticedSport } from '@/lib/club-practiced-sports';

export type PlayerTeamMembership = {
  id: string;
  club_id: string;
  player_id: string;
  team_id: string;
  sport: ClubPracticedSport;
  team_name: string;
  team_category: string;
  jersey_number: number | null;
  position: string | null;
  is_primary: boolean;
  active: boolean;
  joined_at: string;
};

export const MEMBERSHIP_SELECT = `
  id,
  club_id,
  player_id,
  team_id,
  sport,
  jersey_number,
  position,
  is_primary,
  active,
  joined_at,
  synq_teams(name, category)
`;

export function mapMembershipRow(row: Record<string, unknown>): PlayerTeamMembership {
  const team = Array.isArray(row.synq_teams) ? row.synq_teams[0] : row.synq_teams;
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    player_id: String(row.player_id),
    team_id: String(row.team_id),
    sport: row.sport as ClubPracticedSport,
    team_name: String(team?.name ?? 'Sin equipo'),
    team_category: String(team?.category ?? ''),
    jersey_number: row.jersey_number != null ? Number(row.jersey_number) : null,
    position: row.position ? String(row.position) : null,
    is_primary: row.is_primary === true,
    active: row.active !== false,
    joined_at: String(row.joined_at),
  };
}

export function primaryMembership(
  memberships: PlayerTeamMembership[]
): PlayerTeamMembership | null {
  return (
    memberships.find((membership) => membership.is_primary && membership.active) ??
    memberships.find((membership) => membership.active) ??
    memberships[0] ??
    null
  );
}

export function secondaryMemberships(
  memberships: PlayerTeamMembership[]
): PlayerTeamMembership[] {
  const primary = primaryMembership(memberships);
  return memberships.filter(
    (membership) => membership.active && membership.id !== primary?.id
  );
}

export function membershipSummary(membership: PlayerTeamMembership): string {
  const parts = [
    membership.team_name,
    membership.team_category,
    membership.jersey_number != null ? `#${membership.jersey_number}` : null,
  ].filter(Boolean);
  return parts.join(' · ');
}

export type MembershipDbPayload = {
  club_id: string;
  player_id: string;
  team_id: string;
  sport: ClubPracticedSport;
  jersey_number: number | null;
  position: string | null;
  is_primary: boolean;
  active: boolean;
};

export function membershipPayloadFromPlayer(input: {
  clubId: string;
  playerId: string;
  teamId: string;
  sport: ClubPracticedSport;
  jerseyNumber: number | null;
  position: string | null;
  active?: boolean;
  isPrimary?: boolean;
}): MembershipDbPayload {
  return {
    club_id: input.clubId,
    player_id: input.playerId,
    team_id: input.teamId,
    sport: input.sport,
    jersey_number: input.jerseyNumber,
    position: input.position,
    is_primary: input.isPrimary ?? true,
    active: input.active ?? true,
  };
}
