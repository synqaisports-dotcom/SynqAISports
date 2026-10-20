import { PlayersMasterDetail } from '@/components/portal/PlayersMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS, DEMO_TEAM_PLAYERS } from '@/lib/cantera-teams';
import { demoMembershipsForPlayer } from '@/lib/demo-memberships';
import { isDemoActive } from '@/lib/demo';
import { getDemoPausedPlayerIds } from '@/lib/demo-cantera-pause';
import {
  mapMembershipRow,
  primaryMembership,
  MEMBERSHIP_SELECT,
} from '@/lib/player-memberships';
import { comparePlayersForList, type PlayerProfile } from '@/lib/player-profile';
import type { PlayerTeamOption } from '@/lib/player-teams';
import { sortPlayerTeamsByCategory } from '@/lib/player-teams';
import { parseGuardiansJson } from '@/lib/player-guardians';
import { parsePlayerHistoryJson } from '@/lib/player-club-history';
import type { ClubPracticedSport } from '@/lib/club-practiced-sports';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ player?: string; team?: string }>;
};

function teamMetaForId(teamId: string | null) {
  if (!teamId) {
    return { team_name: 'Sin equipo', team_category: '', team_category_slug: null, sport: 'football' as ClubPracticedSport };
  }
  const demoTeam = DEMO_CANTERA_TEAMS.find((team) => team.id === teamId);
  if (demoTeam) {
    return {
      team_name: demoTeam.name,
      team_category: demoTeam.category,
      team_category_slug: demoTeam.category_slug,
      sport: (demoTeam.sport as ClubPracticedSport) ?? 'football',
    };
  }
  return {
    team_name: 'Sin equipo',
    team_category: '',
    team_category_slug: null,
    sport: 'football' as ClubPracticedSport,
  };
}

export default async function PortalCanteraJugadoresPage({ searchParams }: Props) {
  const { player: initialPlayerId, team: initialTeamFilter } = await searchParams;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();

  const [{ data: players }, { data: teams }, { data: membershipRows }] = await Promise.all([
    supabase
      .from('synq_players')
      .select(
        'id, display_name, first_name, last_name, jersey_number, position, active, photo_url, birth_year, is_minor, guardians_json, medical_until, medical_document_url, federation_until, federation_document_url, player_history_json, created_at, team_id, synq_teams(name, category, category_slug, sport)'
      )
      .eq('club_id', ctx.club.id)
      .order('last_name')
      .order('first_name'),
    supabase
      .from('synq_teams')
      .select('id, name, category, category_slug, sport')
      .eq('club_id', ctx.club.id)
      .eq('active', true),
    supabase
      .from('synq_player_team_memberships')
      .select(MEMBERSHIP_SELECT)
      .eq('club_id', ctx.club.id)
      .eq('active', true),
  ]);

  const membershipsByPlayer = new Map<string, ReturnType<typeof mapMembershipRow>[]>();
  for (const row of membershipRows ?? []) {
    const membership = mapMembershipRow(row as Record<string, unknown>);
    const list = membershipsByPlayer.get(membership.player_id) ?? [];
    list.push(membership);
    membershipsByPlayer.set(membership.player_id, list);
  }

  let teamOptions: PlayerTeamOption[] = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category: team.category,
    category_slug: team.category_slug,
    sport: (team.sport as ClubPracticedSport) ?? 'football',
  }));

  if (demo) {
    const existingTeamIds = new Set(teamOptions.map((team) => team.id));
    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      if (existingTeamIds.has(demoTeam.id)) continue;
      teamOptions.push({
        id: demoTeam.id,
        name: demoTeam.name,
        category: demoTeam.category,
        category_slug: demoTeam.category_slug,
        sport: (demoTeam.sport as ClubPracticedSport) ?? 'football',
      });
    }
  }

  teamOptions = sortPlayerTeamsByCategory(teamOptions);

  let profiles: PlayerProfile[] = (players ?? []).map((row) => {
    const team = Array.isArray(row.synq_teams) ? row.synq_teams[0] : row.synq_teams;
    const memberships = membershipsByPlayer.get(row.id) ?? [];
    const primary = primaryMembership(memberships);
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      jersey_number: row.jersey_number,
      position: row.position,
      photo_url: row.photo_url ?? null,
      birth_year: row.birth_year,
      team_id: row.team_id,
      team_name: team?.name ?? 'Sin equipo',
      team_category: team?.category ?? '',
      team_category_slug: team?.category_slug ?? null,
      primary_sport: (primary?.sport ?? team?.sport ?? 'football') as ClubPracticedSport,
      memberships,
      active: row.active,
      is_minor: row.is_minor ?? false,
      guardians: parseGuardiansJson(row.guardians_json),
      medical_until: row.medical_until ?? null,
      medical_document_url: row.medical_document_url ?? null,
      federation_until: row.federation_until ?? null,
      federation_document_url: row.federation_document_url ?? null,
      created_at: row.created_at ?? null,
      history: parsePlayerHistoryJson(row.player_history_json),
    };
  });

  if (demo) {
    const pausedDemoPlayers = await getDemoPausedPlayerIds();
    const existingIds = new Set(profiles.map((player) => player.id));
    for (const demoPlayer of DEMO_TEAM_PLAYERS) {
      if (existingIds.has(demoPlayer.id)) continue;
      const team = teamMetaForId(demoPlayer.team_id);
      const memberships = demoMembershipsForPlayer(demoPlayer.id);
      profiles.push({
        id: demoPlayer.id,
        first_name: demoPlayer.first_name,
        last_name: demoPlayer.last_name,
        display_name: `${demoPlayer.first_name} ${demoPlayer.last_name}`,
        jersey_number: demoPlayer.jersey_number,
        position: demoPlayer.position,
        photo_url: demoPlayer.photo_url,
        birth_year: demoPlayer.id === 'demo-pl-ale-1' ? 2014 : null,
        team_id: demoPlayer.team_id,
        team_name: team.team_name,
        team_category: team.team_category,
        team_category_slug: team.team_category_slug,
        primary_sport: team.sport,
        memberships,
        active: !pausedDemoPlayers.has(demoPlayer.id),
        is_minor: demoPlayer.id === 'demo-pl-ale-1',
        guardians:
          demoPlayer.id === 'demo-pl-ale-1'
            ? [{ first_name: 'Ana', last_name: 'Castro', email: 'ana.castro@email.com', phone: '600 123 456' }]
            : [],
        medical_until: demoPlayer.id === 'demo-pl-ale-1' ? '2026-12-31' : null,
        medical_document_url: null,
        federation_until: demoPlayer.id === 'demo-pl-ale-1' ? '2026-06-30' : null,
        federation_document_url: null,
        created_at:
          demoPlayer.id === 'demo-pl-ale-1'
            ? '2024-09-01T10:00:00.000Z'
            : new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        history:
          demoPlayer.id === 'demo-pl-ale-1'
            ? [
                {
                  id: 'demo-hist-1',
                  kind: 'category_change',
                  title: 'Ascenso de categoría',
                  detail: 'Benjamín A → Alevín A',
                  occurredAt: '2025-07-01T09:00:00.000Z',
                },
                {
                  id: 'demo-hist-2',
                  kind: 'joined',
                  title: 'Alta en el club',
                  detail: `Plantilla · ${team.team_name}`,
                  occurredAt: '2024-09-01T10:00:00.000Z',
                },
              ]
            : [],
      });
    }
  }

  profiles.sort((a, b) => comparePlayersForList(a, b, 'category'));

  return (
    <PageContainer>
      <PlayersMasterDetail
        clubId={ctx.club.id}
        players={profiles}
        teams={teamOptions}
        initialPlayerId={initialPlayerId}
        initialTeamFilter={initialTeamFilter}
        demoMode={demo}
      />
    </PageContainer>
  );
}
