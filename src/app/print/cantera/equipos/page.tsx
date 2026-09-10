import { TeamsListPrintPageClient } from '@/components/portal/TeamsListPrintPageClient';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { getDemoPausedTeamIds } from '@/lib/demo-cantera-pause';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import {
  filterTeamsForPrint,
  groupTeamsForPrint,
  type TeamsListPrintTeam,
  type TeamsListStatusFilter,
} from '@/lib/teams-list-print';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ status?: string }>;
};

function parseStatusFilter(value: string | undefined): TeamsListStatusFilter {
  if (value === 'active' || value === 'paused') return value;
  return 'all';
}

export default async function TeamsListPrintPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const statusFilter = parseStatusFilter(statusParam);

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login?next=/print/cantera/equipos');

  const demo = await isDemoActive();

  const [teamsRes, playersRes, pausedDemoTeams] = await Promise.all([
    supabase
      .from('synq_teams')
      .select(
        'id, name, category_slug, team_letter, sport, active, created_at'
      )
      .eq('club_id', ctx.club.id)
      .order('team_letter')
      .order('name'),
    supabase
      .from('synq_players')
      .select('team_id')
      .eq('club_id', ctx.club.id)
      .eq('active', true),
    demo ? getDemoPausedTeamIds() : Promise.resolve(new Set<string>()),
  ]);

  const playerCountByTeam = new Map<string, number>();
  for (const row of playersRes.data ?? []) {
    if (!row.team_id) continue;
    playerCountByTeam.set(row.team_id, (playerCountByTeam.get(row.team_id) ?? 0) + 1);
  }

  let teams: TeamsListPrintTeam[] = (teamsRes.data ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category_slug: (team.category_slug as CanteraCategorySlug | null) ?? null,
    team_letter: team.team_letter,
    sport: team.sport,
    active: team.active,
    player_count: playerCountByTeam.get(team.id) ?? 0,
    created_at: team.created_at ?? null,
  }));

  if (demo) {
    const existingKeys = new Set(
      teams.map((team) => `${team.category_slug}:${team.team_letter}`)
    );

    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      const key = `${demoTeam.category_slug}:${demoTeam.team_letter}`;
      if (existingKeys.has(key)) continue;

      teams.push({
        id: demoTeam.id,
        name: demoTeam.name,
        category_slug: demoTeam.category_slug,
        team_letter: demoTeam.team_letter,
        sport: demoTeam.sport,
        active: !pausedDemoTeams.has(demoTeam.id),
        player_count: demoTeam.player_count ?? 0,
        created_at: null,
      });
    }
  }

  const filtered = filterTeamsForPrint(teams, statusFilter);
  const sections = groupTeamsForPrint(filtered);

  return (
    <TeamsListPrintPageClient
      clubName={ctx.club.name}
      clubLogoUrl={ctx.club.logo_url}
      sections={sections}
      statusFilter={statusFilter}
      generatedAt={new Date().toISOString()}
    />
  );
}
