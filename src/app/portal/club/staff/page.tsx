import {
  loadClubPersonAssignments,
  loadClubTeams,
  loadSportPeople,
} from '@/app/actions/club-people';
import { StaffCategoryOverview } from '@/components/portal/StaffCategoryOverview';
import { StaffMasterDetail } from '@/components/portal/StaffMasterDetail';
import { StaffHero } from '@/components/portal/StaffHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { buildStaffCategoryStats } from '@/lib/staff-category-stats';
import { buildStaffProfile } from '@/lib/staff-profile';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    person?: string;
    team?: string;
    create?: string;
    edit?: string;
  }>;
};

export default async function PortalClubStaffLandingPage({ searchParams }: Props) {
  const {
    person: initialPersonId,
    team: initialTeamFilter,
    create: initialCreate,
    edit: initialEdit,
  } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const people = await loadSportPeople(ctx.club.id);
  const [teams, assignments] = await Promise.all([
    loadClubTeams(ctx.club.id),
    loadClubPersonAssignments(ctx.club.id),
  ]);

  const assignmentsByPerson = new Map<string, typeof assignments>();
  for (const row of assignments) {
    const list = assignmentsByPerson.get(row.person_id) ?? [];
    list.push(row);
    assignmentsByPerson.set(row.person_id, list);
  }

  const profiles = people.map((person) =>
    buildStaffProfile(person, assignmentsByPerson.get(person.id) ?? [], teams)
  );
  const categoryStats = buildStaffCategoryStats(profiles, teams);

  return (
    <PageContainer>
      <StaffHero people={people} className="mb-4" />

      <StaffCategoryOverview categories={categoryStats} />

      <StaffMasterDetail
        clubId={ctx.club.id}
        people={profiles}
        teams={teams}
        initialPersonId={initialPersonId}
        initialTeamFilter={initialTeamFilter}
        initialCreateOpen={initialCreate === '1'}
        initialEditOpen={initialEdit === '1'}
        demoMode={demo}
      />
    </PageContainer>
  );
}
