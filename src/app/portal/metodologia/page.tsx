import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { MethodologySummaryDashboard } from '@/components/methodology/MethodologySummaryDashboard';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MetodologiaHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demoActive = await isDemoActive();

  const [teamsResult, playersResult, coachesResult] = await Promise.all([
    supabase
      .from('synq_teams')
      .select('id, name, category_slug')
      .eq('club_id', ctx.club.id)
      .eq('active', true)
      .order('name'),
    supabase
      .from('synq_players')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id)
      .eq('active', true),
    supabase
      .from('synq_staff')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', ctx.club.id)
      .eq('role', 'coach'),
  ]);

  let teams = (teamsResult.data ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category_slug: team.category_slug,
  }));

  if (demoActive) {
    const existingIds = new Set(teams.map((team) => team.id));
    for (const demo of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demo.id)) {
        teams.push({
          id: demo.id,
          name: demo.name,
          category_slug: demo.category_slug,
        });
      }
    }
  }

  const totalPlayers = playersResult.count ?? 0;
  const totalCoaches =
    coachesResult.count && coachesResult.count > 0
      ? coachesResult.count
      : demoActive
        ? 4
        : 0;

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>

      <MethodologySubnav />

      <MethodologySummaryDashboard
        teams={teams}
        totalPlayers={demoActive && totalPlayers === 0 ? 80 : totalPlayers}
        totalCoaches={totalCoaches}
      />
    </PageContainer>
  );
}
