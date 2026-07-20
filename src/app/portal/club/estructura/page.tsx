import { loadInstitutionalPeople } from '@/app/actions/club-people';
import { EstructuraHero } from '@/components/portal/EstructuraHero';
import { EstructuraMasterDetail } from '@/components/portal/EstructuraMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    person?: string;
    create?: string;
    edit?: string;
  }>;
};

export default async function PortalClubEstructuraPage({ searchParams }: Props) {
  const {
    person: initialPersonId,
    create: initialCreate,
    edit: initialEdit,
  } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const people = await loadInstitutionalPeople(ctx.club.id);

  return (
    <PageContainer>
      <EstructuraHero people={people} className="mb-4" />

      <EstructuraMasterDetail
        clubId={ctx.club.id}
        people={people}
        initialPersonId={initialPersonId}
        initialCreateOpen={initialCreate === '1'}
        initialEditOpen={initialEdit === '1'}
        demoMode={demo}
      />
    </PageContainer>
  );
}
