import { ArrowLeft, BarChart3, Pencil, Plus, User } from 'lucide-react';
import { loadClubPersonAssignments, loadClubTeams, loadSportPeople } from '@/app/actions/club-people';
import {
  ProfileRowAction,
  ProfileRowCard,
  ProfileRowList,
} from '@/components/portal/ProfileRowCard';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import {
  clubPersonRowSubtitle,
  clubPersonSportFields,
  medicalStatus,
} from '@/lib/profile-row';
import { formatAssignmentSummary } from '@/lib/person-assignments';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default async function PortalClubStaffLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

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

  return (
    <PageContainer>
      <Card className="overflow-hidden p-0">
        <StaffHero
          people={people}
          actions={
            <>
              <StaffHeroLinkAction href="/portal/club" variant="outline">
                <ArrowLeft className="size-3.5" />
                Volver
              </StaffHeroLinkAction>
              <StaffHeroLinkAction href="/portal/club/staff/categorias" variant="outline">
                <BarChart3 className="size-3.5" />
                Por categorías
              </StaffHeroLinkAction>
              <StaffHeroLinkAction href="/portal/club/staff/nuevo">
                <Plus className="size-3.5" />
                Crear ficha
              </StaffHeroLinkAction>
            </>
          }
        />
      </Card>

      <ProfileRowList className="mt-6">
        {people.map((person) => {
          const medical = medicalStatus(person);
          const personAssignments = assignmentsByPerson.get(person.id) ?? [];
          const teamsLabel =
            formatAssignmentSummary(personAssignments, teams) || person.sport_teams || '';
          return (
            <ProfileRowCard
              key={person.id}
              photoUrl={person.photo_url}
              title={person.full_name}
              subtitle={clubPersonRowSubtitle(person)}
              badges={
                <Badge variant={medical.ok ? 'default' : 'destructive'} className="text-[10px]">
                  {medical.label}
                </Badge>
              }
              fields={clubPersonSportFields(person, teamsLabel)}
              actions={
                <>
                  <ProfileRowAction
                    href={`/portal/club/staff/${person.id}/editar`}
                    label="Modificar ficha"
                    icon={Pencil}
                  />
                  <ProfileRowAction
                    href={`/portal/club/staff/${person.id}`}
                    label="Ver perfil"
                    icon={User}
                  />
                </>
              }
            />
          );
        })}
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay fichas de cuerpo técnico. Crea la primera para asignarla en el organigrama.
          </p>
        ) : null}
      </ProfileRowList>
    </PageContainer>
  );
}
