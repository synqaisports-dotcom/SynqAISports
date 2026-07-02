import { ArrowLeft, Network, Pencil, Plus } from 'lucide-react';
import { loadInstitutionalPeople } from '@/app/actions/club-people';
import {
  EstructuraHero,
  EstructuraHeroLinkAction,
} from '@/components/portal/EstructuraHero';
import {
  ProfileRowAction,
  ProfileRowCard,
  ProfileRowList,
} from '@/components/portal/ProfileRowCard';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { clubPersonInstitutionalFields, clubPersonRowSubtitle } from '@/lib/profile-row';
import { ACCESS_PROFILE_LABELS } from '@/lib/club-people';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default async function PortalClubEstructuraPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const people = await loadInstitutionalPeople(ctx.club.id);

  return (
    <PageContainer>
      <EstructuraHero
        people={people}
        actions={
          <>
            <EstructuraHeroLinkAction href="/portal/club" variant="outline">
              <ArrowLeft className="size-3.5" />
              Volver
            </EstructuraHeroLinkAction>
            <EstructuraHeroLinkAction href="/portal/club/estructura/nuevo">
              <Plus className="size-3.5" />
              Crear ficha
            </EstructuraHeroLinkAction>
          </>
        }
      />

      <ProfileRowList className="mt-6">
        {people.map((person) => {
          const accessLabel =
            person.access_profile && person.access_profile !== 'none'
              ? ACCESS_PROFILE_LABELS[person.access_profile]
              : null;
          return (
            <ProfileRowCard
              key={person.id}
              photoUrl={person.photo_url}
              title={person.full_name}
              subtitle={clubPersonRowSubtitle(person)}
              badges={
                accessLabel ? (
                  <Badge variant="outline" className="text-[10px]">
                    {accessLabel}
                  </Badge>
                ) : null
              }
              fields={clubPersonInstitutionalFields(person)}
              actions={
                <>
                  <ProfileRowAction
                    href={`/portal/club/estructura/${person.id}/editar`}
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
          );
        })}
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay personas en la estructura no deportiva. Crea la primera ficha para asignarla
            después en el organigrama.
          </p>
        ) : null}
      </ProfileRowList>
    </PageContainer>
  );
}
