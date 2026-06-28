import { ArrowLeft } from 'lucide-react';
import { loadClubPeople } from '@/app/actions/club-people';
import { InstitutionalPersonForm } from '@/components/portal/InstitutionalPersonForm';
import {
  EstructuraHero,
  EstructuraHeroLinkAction,
} from '@/components/portal/EstructuraHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { notFound, redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortalClubEstructuraEditarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const people = await loadClubPeople(ctx.club.id);
  const person = people.find((row) => row.id === id);
  if (!person || person.person_kind === 'sport') notFound();

  return (
    <PageContainer>
      <Card className="mb-6 overflow-hidden p-0">
        <EstructuraHero
          people={[person]}
          actions={
            <EstructuraHeroLinkAction href="/portal/club/estructura" variant="outline">
              <ArrowLeft className="size-3.5" />
              Cancelar
            </EstructuraHeroLinkAction>
          }
        />
      </Card>
      <InstitutionalPersonForm clubId={ctx.club.id} person={person} />
    </PageContainer>
  );
}
