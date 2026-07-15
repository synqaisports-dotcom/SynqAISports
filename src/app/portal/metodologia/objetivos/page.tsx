import { loadMethodologyObjectives } from '@/app/actions/methodology';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { ObjectivesMasterDetail } from '@/components/methodology/ObjectivesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { canEditMethodologyObjectives } from '@/lib/methodology-objectives';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    category?: string;
    edit?: string;
  }>;
};

export default async function ObjetivosPage({ searchParams }: Props) {
  const { category: initialCategorySlug, edit: initialEdit } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const objectives = await loadMethodologyObjectives(ctx.club.id);
  const canEdit = canEditMethodologyObjectives(ctx.role);

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Objetivos</h1>

      <MethodologySubnav />

      <ObjectivesMasterDetail
        objectives={objectives}
        canEdit={canEdit}
        initialCategorySlug={initialCategorySlug}
        initialEditOpen={initialEdit === '1'}
        demoMode={demo}
      />
    </PageContainer>
  );
}
