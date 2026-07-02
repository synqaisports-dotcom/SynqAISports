import { ArrowLeft, Network, Pencil } from 'lucide-react';
import { loadClubPeople } from '@/app/actions/club-people';
import { StaffHero, StaffHeroLinkAction } from '@/components/portal/StaffHero';
import {
  ProfileRowAction,
  ProfileRowCard,
} from '@/components/portal/ProfileRowCard';
import { PageContainer } from '@/components/portal/PageContainer';
import { ACCESS_PROFILE_LABELS } from '@/lib/club-people';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import {
  clubPersonRowSubtitle,
  clubPersonSportFields,
  medicalStatus,
} from '@/lib/profile-row';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubStaffPerfilPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const people = await loadClubPeople(ctx.club.id);
  const person = people.find((row) => row.id === id);
  if (!person || person.person_kind === 'institutional') notFound();

  const medical = medicalStatus(person);
  const accessLabel =
    person.access_profile && person.access_profile !== 'none'
      ? ACCESS_PROFILE_LABELS[person.access_profile]
      : null;

  return (
    <PageContainer>
      <StaffHero
        className="mb-6"
        people={[person]}
        actions={
          <>
            <StaffHeroLinkAction href="/portal/club/staff" variant="outline">
              <ArrowLeft className="size-3.5" />
              Volver
            </StaffHeroLinkAction>
            <StaffHeroLinkAction href={`/portal/club/staff/${person.id}/editar`}>
              <Pencil className="size-3.5" />
              Modificar
            </StaffHeroLinkAction>
          </>
        }
      />

      <ProfileRowCard
        photoUrl={person.photo_url}
        title={person.full_name}
        subtitle={clubPersonRowSubtitle(person)}
        badges={
          <>
            <Badge variant={medical.ok ? 'default' : 'destructive'} className="text-[10px]">
              {medical.label}
            </Badge>
            {accessLabel ? (
              <Badge variant="outline" className="text-[10px]">
                {accessLabel}
              </Badge>
            ) : null}
          </>
        }
        fields={clubPersonSportFields(person)}
        actions={
          <>
            <ProfileRowAction
              href={`/portal/club/staff/${person.id}/editar`}
              label="Modificar ficha"
              icon={Pencil}
            />
            <ProfileRowAction
              href="/portal/club/organigrama"
              label="Ver organigrama"
              icon={Network}
            />
          </>
        }
      />

      <p className="mt-4 text-sm text-muted-foreground">
        Más adelante definiremos aquí la vista de perfil según el tipo de staff y el canal de acceso
        (portal web o app Android).
      </p>
    </PageContainer>
  );
}
