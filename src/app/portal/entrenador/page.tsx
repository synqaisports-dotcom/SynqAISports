import { CoachPortalView } from '@/components/portal/CoachPortalView';
import { PageContainer } from '@/components/portal/PageContainer';
import { DEMO_CANTERA_TEAMS } from '@/lib/cantera-teams';
import { resolveCoachPortalViewer } from '@/lib/coach-portal-teams';
import { isDemoActive } from '@/lib/demo';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PortalEntrenadorPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demoMode = await isDemoActive();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: staff } = await supabase
    .from('synq_staff')
    .select('person_id')
    .eq('club_id', ctx.club.id)
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  let displayName = ctx.club.name;
  let assignments: { team_id: string | null; category: string | null; assignment_role: string }[] = [];

  if (staff?.person_id) {
    const { data: person } = await supabase
      .from('synq_club_people')
      .select('full_name')
      .eq('id', staff.person_id)
      .maybeSingle();
    if (person?.full_name) displayName = person.full_name;

    const { data: rows } = await supabase
      .from('synq_person_assignments')
      .select('team_id, category, assignment_role')
      .eq('person_id', staff.person_id);
    assignments = rows ?? [];
  }

  const { data: teams } = await supabase
    .from('synq_teams')
    .select('id, name, category_slug')
    .eq('club_id', ctx.club.id)
    .eq('active', true)
    .order('name');

  let teamRows = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    category_slug: team.category_slug,
  }));

  if (demoMode) {
    const existingIds = new Set(teamRows.map((team) => team.id));
    for (const demo of DEMO_CANTERA_TEAMS) {
      if (!existingIds.has(demo.id)) {
        teamRows.push({
          id: demo.id,
          name: demo.name,
          category_slug: demo.category_slug,
        });
      }
    }
    if (displayName === ctx.club.name) displayName = 'Usuario demo';
  }

  const viewer = await resolveCoachPortalViewer({
    role: ctx.role,
    displayName,
    teams: teamRows,
    assignments: assignments as {
      team_id: string | null;
      category: string | null;
      assignment_role: import('@/lib/person-assignments').AssignmentRole;
    }[],
    demoMode,
  });

  return (
    <PageContainer>
      <CoachPortalView viewer={viewer} />
    </PageContainer>
  );
}
