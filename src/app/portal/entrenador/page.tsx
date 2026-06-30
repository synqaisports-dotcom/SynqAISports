import { CoachPortalView } from '@/components/portal/CoachPortalView';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PortalEntrenadorPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category_slug')
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('name');

  let teamOptions = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category_slug: team.category_slug,
  }));

  if (await isDemoActive()) {
    const existingIds = new Set(teamOptions.map((team) => team.id));
    for (const demo of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demo.id)) {
        teamOptions.push({
          id: demo.id,
          name: demo.name,
          category_slug: demo.category_slug,
        });
      }
    }
  }

  return (
    <PageContainer>
      <CoachPortalView teams={teamOptions} />
    </PageContainer>
  );
}
