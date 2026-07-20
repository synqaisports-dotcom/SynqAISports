import { loadMethodologyObjectives } from '@/app/actions/methodology';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { ObjectivesMasterDetail } from '@/components/methodology/ObjectivesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { canEditMethodologyObjectives } from '@/lib/methodology-objectives';
import { parseSportFromSearchParams, resolveActiveSport } from '@/lib/sport-context';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    category?: string;
    edit?: string;
    sport?: string;
  }>;
};

export default async function ObjetivosPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialCategorySlug = params.category;
  const initialEdit = params.edit;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const activeSport = resolveActiveSport(
    ctx.club.practiced_sports,
    parseSportFromSearchParams(params)
  );
  const objectives = await loadMethodologyObjectives(ctx.club.id, activeSport);
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
        activeSport={activeSport}
        practicedSports={ctx.club.practiced_sports}
      />
    </PageContainer>
  );
}
