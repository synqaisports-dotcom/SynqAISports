import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { DEMO_CANTERA_TEAMS, DEMO_TEAM_PLAYERS } from '@/lib/cantera-teams';
import type { PlayerTeamMembership } from '@/lib/player-memberships';

const DEMO_CLUB_ID = 'demo-club';

function teamSport(teamId: string): ClubPracticedSport {
  const team = DEMO_CANTERA_TEAMS.find((item) => item.id === teamId);
  const sport = team?.sport;
  if (
    sport === 'football' ||
    sport === 'futsal' ||
    sport === 'basketball' ||
    sport === 'volleyball' ||
    sport === 'handball' ||
    sport === 'waterpolo'
  ) {
    return sport;
  }
  return 'football';
}

export function demoMembershipsForPlayer(playerId: string): PlayerTeamMembership[] {
  const player = DEMO_TEAM_PLAYERS.find((item) => item.id === playerId);
  if (!player?.team_id) return [];

  const team = DEMO_CANTERA_TEAMS.find((item) => item.id === player.team_id);
  if (!team) return [];

  return [
    {
      id: `demo-mem-${playerId}`,
      club_id: DEMO_CLUB_ID,
      player_id: playerId,
      team_id: player.team_id,
      sport: teamSport(player.team_id),
      team_name: team.name,
      team_category: team.category,
      jersey_number: player.jersey_number,
      position: player.position,
      is_primary: true,
      active: true,
      joined_at: '2024-09-01T10:00:00.000Z',
    },
  ];
}

export function demoMembershipsByPlayerId(): Map<string, PlayerTeamMembership[]> {
  const map = new Map<string, PlayerTeamMembership[]>();
  for (const player of DEMO_TEAM_PLAYERS) {
    map.set(player.id, demoMembershipsForPlayer(player.id));
  }
  return map;
}
