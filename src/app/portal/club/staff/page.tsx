import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import {
  loadClubPersonAssignments,
  loadClubTeams,
  loadSportPeople,
} from '@/app/actions/club-people';
import { StaffMasterDetail } from '@/components/portal/StaffMasterDetail';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { buildStaffProfile } from '@/lib/staff-profile';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

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

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Staff deportivo</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club/staff/categorias">
                <BarChart3 className="h-4 w-4" />
                Por categorías
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <StaffHero people={people} className="mb-4" />

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Vista maestro-detalle con fichas de demo. Usa + para probar el alta y selecciona una ficha
          para ver asignaciones y contacto.
        </p>
      ) : null}

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
