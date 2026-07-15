import { CategoryCyclesHub } from '@/components/portal/CategoryCyclesHub';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { isDemoActive } from '@/lib/demo';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PortalMetodologiaCiclosPage() {
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

  let templateMicrocycles: {
    id: string;
    title: string;
    week_label: string;
    week_start: string | null;
  }[] = [];

  const { data: templateRows, error: templateError } = await supabase
    .from('synq_microcycles')
    .select('id, title, week_label, week_start, is_template, team_id')
    .eq('club_id', ctx.club.id)
    .order('week_start', { ascending: false });

  if (!templateError && templateRows) {
    templateMicrocycles = templateRows
      .filter((row) => (row.is_template ?? true) && !row.team_id)
      .map((row) => ({
        id: row.id,
        title: row.title,
        week_label: row.week_label,
        week_start: row.week_start,
      }));
  }

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Ciclos</h1>

      <MethodologySubnav />

      <CategoryCyclesHub teams={teamOptions} templateMicrocycles={templateMicrocycles} />
    </PageContainer>
  );
}
