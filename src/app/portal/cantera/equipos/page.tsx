import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { TeamsMasterDetail } from '@/components/portal/TeamsMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import type { TeamViewPlayer } from '@/components/portal/TeamViewSections';
import {
  CANTERA_CATEGORIES,
  resolveTeamCategorySlug,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import {
  DEMO_CANTERA_TEAMS,
  DEMO_TEAM_PLAYERS,
} from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import type { TeamProfile } from '@/lib/team-profile';
import { compareTeamsForList } from '@/lib/team-profile';
import { parseTeamHistoryJson } from '@/lib/team-club-history';
import {
  DEMO_TEAM_SETUP,
  DEFAULT_TEAM_SETUP,
  teamSetupFromDb,
  type TeamSetupData,
} from '@/lib/team-setup';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  searchParams: Promise<{
    team?: string;
    edit?: string;
    create?: string;
    category?: string;
  }>;
};

const TEAM_SELECT =
  'id, name, category, category_slug, team_letter, sport, active, team_purpose, training_facility_id, training_division, training_days, training_start, training_end, match_venue_type, match_own_single_venue, match_home_mode, match_away_mode, external_venue_name, external_venue_address, team_history_json';

function isCategorySlug(value: string | undefined): value is CanteraCategorySlug {
  return Boolean(value && CANTERA_CATEGORIES.some((category) => category.slug === value));
}

function mapPlayersForTeam(
  teamId: string,
  playersByTeam: Map<string, TeamViewPlayer[]>
): TeamViewPlayer[] {
  return playersByTeam.get(teamId) ?? [];
}

function buildTeamProfile(input: {
  id: string;
  name: string;
  category: string;
  category_slug: string | null;
  team_letter: string | null;
  sport: string;
  active: boolean;
  team_history_json?: unknown;
  setup: TeamSetupData;
  facility_name: string | null;
  players: TeamViewPlayer[];
  is_demo: boolean;
}): TeamProfile {
  return {
    id: input.id,
    name: input.name,
    category: input.category,
    category_slug: (input.category_slug as CanteraCategorySlug | null) ?? null,
    team_letter: input.team_letter,
    sport: input.sport,
    active: input.active,
    player_count: input.players.length,
    setup: input.setup,
    facility_name: input.facility_name,
    players: input.players,
    history: parseTeamHistoryJson(input.team_history_json),
    is_demo: input.is_demo,
  };
}

export default async function PortalCanteraEquiposPage({ searchParams }: Props) {
  const {
    team: initialTeamId,
    edit: initialEdit,
    create: initialCreate,
    category: initialCategory,
  } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();

  const [{ data: teams }, { data: players }, facilities, trainingSlots] = await Promise.all([
    supabase
      .from('synq_teams')
      .select(TEAM_SELECT)
      .eq('club_id', ctx.club.id)
      .order('team_letter')
      .order('name'),
    supabase
      .from('synq_players')
      .select('id, team_id, display_name, first_name, last_name, position, photo_url, jersey_number, birth_year')
      .eq('club_id', ctx.club.id)
      .eq('active', true)
      .order('last_name')
      .order('first_name'),
    loadClubFacilities(ctx.club.id),
    getTeamTrainingSlots(ctx.club.id),
  ]);

  const playersByTeam = new Map<string, TeamViewPlayer[]>();
  for (const row of players ?? []) {
    if (!row.team_id) continue;
    const list = playersByTeam.get(row.team_id) ?? [];
    list.push({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      display_name: row.display_name,
      position: row.position,
      photo_url: row.photo_url,
      jersey_number: row.jersey_number,
      birth_year: row.birth_year,
    });
    playersByTeam.set(row.team_id, list);
  }

  let profiles: TeamProfile[] = (teams ?? []).map((team) => {
    const setup = teamSetupFromDb(team);
    const facilityName =
      facilities.find((facility) => facility.id === setup.training_facility_id)?.name ?? null;

    return buildTeamProfile({
      id: team.id,
      name: team.name,
      category: team.category,
      category_slug: team.category_slug,
      team_letter: team.team_letter,
      sport: team.sport,
      active: team.active,
      setup,
      facility_name: facilityName,
      players: mapPlayersForTeam(team.id, playersByTeam),
      team_history_json: team.team_history_json,
      is_demo: false,
    });
  });

  if (demo) {
    const existingKeys = new Set(
      profiles.map((team) => `${team.category_slug}:${team.team_letter}`)
    );

    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      const key = `${demoTeam.category_slug}:${demoTeam.team_letter}`;
      if (existingKeys.has(key)) continue;

      const setup = DEMO_TEAM_SETUP[demoTeam.id] ?? DEFAULT_TEAM_SETUP;
      const facilityName =
        facilities.find((facility) => facility.id === setup.training_facility_id)?.name ?? null;
      const demoPlayers = DEMO_TEAM_PLAYERS.filter((player) => player.team_id === demoTeam.id).map(
        (player) => ({
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          display_name: `${player.first_name} ${player.last_name}`,
          position: player.position,
          photo_url: player.photo_url,
          jersey_number: player.jersey_number,
        })
      );

      profiles.push(
        buildTeamProfile({
          id: demoTeam.id,
          name: demoTeam.name,
          category: demoTeam.category,
          category_slug: demoTeam.category_slug,
          team_letter: demoTeam.team_letter,
          sport: demoTeam.sport,
          active: demoTeam.active,
          setup,
          facility_name: facilityName,
          players: demoPlayers,
          team_history_json: [],
          is_demo: true,
        })
      );
    }
  }

  profiles.sort((a, b) => compareTeamsForList(a, b, 'category'));

  const activeCount = profiles.filter((team) => team.active).length;
  const pausedCount = profiles.length - activeCount;

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4 text-primary" />
            Equipos
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/cantera">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Vista maestro-detalle con equipos de demo. Usa + para probar el alta y selecciona un equipo
          para ver datos, plantilla y horarios.
        </p>
      ) : null}

      <p className="mb-4 text-xs text-muted-foreground">
        {CANTERA_CATEGORIES.length} categorías · {activeCount} equipos activos
        {pausedCount > 0 ? ` · ${pausedCount} pausados` : ''}
      </p>

      <TeamsMasterDetail
        teams={profiles}
        facilities={facilities}
        trainingSlots={trainingSlots}
        initialTeamId={initialTeamId}
        initialEditOpen={initialEdit === '1'}
        initialCreateOpen={initialCreate === '1'}
        initialCreateCategory={isCategorySlug(initialCategory) ? initialCategory : null}
        demoMode={demo}
      />
    </PageContainer>
  );
}
