import { ArrowLeft, Pencil } from 'lucide-react';
import { loadClubPeople, loadClubTeams, loadPersonAssignments } from '@/app/actions/club-people';
import { SportPersonForm } from '@/components/portal/SportPersonForm';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import {
  ProfileRowAction,
  ProfileRowCard,
} from '@/components/portal/ProfileRowCard';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import {
  clubPersonRowSubtitle,
  clubPersonSportFields,
  medicalStatus,
} from '@/lib/profile-row';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubStaffEditarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const people = await loadClubPeople(ctx.club.id);
  const person = people.find((row) => row.id === id);
  if (!person || person.person_kind === 'institutional') notFound();

  const [teams, initialAssignments] = await Promise.all([
    loadClubTeams(ctx.club.id),
    loadPersonAssignments(person.id),
  ]);

  const medical = medicalStatus(person);

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-0">
        <StaffHero
          people={[person]}
          actions={
            <StaffHeroLinkAction href="/portal/club/staff" variant="outline">
              <ArrowLeft className="size-3.5" />
              Cancelar
            </StaffHeroLinkAction>
          }
        />
      </Card>

      <ProfileRowCard
        className="mb-6"
        photoUrl={person.photo_url}
        title={person.full_name}
        subtitle={clubPersonRowSubtitle(person)}
        badges={
          <Badge variant={medical.ok ? 'default' : 'destructive'} className="text-[10px]">
            {medical.label}
          </Badge>
        }
        fields={clubPersonSportFields(person)}
        actions={
          <ProfileRowAction
            href={`/portal/club/staff/${person.id}`}
            label="Ver perfil"
            icon={Pencil}
          />
        }
      />

      <SportPersonForm
        clubId={ctx.club.id}
        person={person}
        teams={teams}
        initialAssignments={initialAssignments}
      />
    </PageContainer>
  );
}
