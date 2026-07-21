import { getTeamTrainingSlots } from '@/app/actions/cantera';
import { loadClubFacilities } from '@/app/actions/club-facilities';
import { TrainingSchedulePrintPageClient } from '@/components/portal/TrainingSchedulePrintPageClient';
import { isDemoActive } from '@/lib/demo';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import {
  buildTrainingCalendarEvents,
  groupEventsByFacility,
  type TrainingCalendarFacility,
} from '@/lib/training-calendar';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ facility?: string }>;
};

export default async function TrainingSchedulePrintPage({ searchParams }: Props) {
  const { facility: facilityParam } = await searchParams;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login?next=/print/cantera/horarios');

  const demo = await isDemoActive();
  const [slots, facilities] = await Promise.all([
    getTeamTrainingSlots(ctx.club.id),
    loadClubFacilities(ctx.club.id),
  ]);

  const facilityList: TrainingCalendarFacility[] = facilities.map((facility) => ({
    id: facility.id,
    name: facility.name,
  }));

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

  const events = buildTrainingCalendarEvents(slots, teamMeta, facilityList);
  const grouped = groupEventsByFacility(events, facilityList);

  const sections =
    facilityParam && facilityParam !== 'all'
      ? grouped.filter((section) => section.facility.id === facilityParam)
      : grouped;

  return (
    <TrainingSchedulePrintPageClient
      clubName={ctx.club.name}
      clubLogoUrl={ctx.club.logo_url}
      sections={sections.map((section) => ({
        facilityId: section.facility.id,
        facilityName: section.facility.name,
        events: section.events,
      }))}
      generatedAt={new Date().toISOString()}
    />
  );
}
