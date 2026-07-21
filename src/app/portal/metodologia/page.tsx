import { MethodologyStatsCards } from '@/components/methodology/MethodologyStatsCards';
import { MethodologySummaryDashboard } from '@/components/methodology/MethodologySummaryDashboard';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { loadMethodologyLandingStats } from '@/lib/methodology-landing-stats';
import { getStaffContext } from '@/lib/portal';
import { resolveActiveSport } from '@/lib/sport-context';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MetodologiaHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demoActive = await isDemoActive();
  const primarySport = resolveActiveSport(ctx.club.practiced_sports);

  const [teamsResult, playersResult, coachesResult, landingStats] = await Promise.all([
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
    loadMethodologyLandingStats(supabase, ctx.club.id, primarySport),
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
      <MethodologyStatsCards stats={landingStats} className="mb-4" />

      <MethodologySummaryDashboard
        teams={teams}
        totalPlayers={demoActive && totalPlayers === 0 ? 80 : totalPlayers}
        totalCoaches={totalCoaches}
        role={ctx.role}
      />
    </PageContainer>
  );
}
