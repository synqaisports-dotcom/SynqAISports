import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { TrainingCalendarView } from '@/components/portal/TrainingCalendarView';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { buildTrainingCalendarEvents } from '@/lib/training-calendar';
import { redirect } from 'next/navigation';

export default async function PortalCanteraHorariosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const [slots, facilities] = await Promise.all([
    getTeamTrainingSlots(ctx.club.id),
    loadClubFacilities(ctx.club.id),
  ]);

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category_slug')
    .eq('club_id', ctx.club.id);

  let teamMeta = (teams ?? []).map((team) => ({
    teamId: team.id,
    teamName: team.name,
    categorySlug: team.category_slug,
  }));

  if (demo) {
    const existingIds = new Set(teamMeta.map((team) => team.teamId));
    for (const demoTeam of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demoTeam.id)) {
        teamMeta.push({
          teamId: demoTeam.id,
          teamName: demoTeam.name,
          categorySlug: demoTeam.category_slug,
        });
      }
    }
  }

  const events = buildTrainingCalendarEvents(
    slots,
    teamMeta,
    facilities.map((facility) => ({ id: facility.id, name: facility.name }))
  );

  return (
    <PageContainer>
      <TrainingCalendarView
        events={events}
        facilities={facilities.map((facility) => ({ id: facility.id, name: facility.name }))}
      />
    </PageContainer>
  );
}
