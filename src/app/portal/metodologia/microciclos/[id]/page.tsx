import Link from 'next/link';
import { DemoMicrocycleOverview } from '@/components/methodology/DemoMicrocycleOverview';
import { MicrocycleOverview } from '@/components/methodology/MicrocycleOverview';
import { PageContainer } from '@/components/portal/PageContainer';
import { getStaffContext } from '@/lib/portal';
import { loadMicrocycleBundle, isDemoMicrocycleId } from '@/lib/microcycle-page-data';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function MicrocicloDetailPage({ params }: Props) {
  const { id } = await params;

  if (isDemoMicrocycleId(id)) {
    return (
      <PageContainer>
        <DemoMicrocycleOverview microcycleId={id} />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const bundle = await loadMicrocycleBundle(supabase, ctx.club.id, id);
  if (!bundle) notFound();

  return (
    <PageContainer>
      <MicrocycleOverview
        micro={bundle.micro}
        slots={bundle.slots}
        backHref="/portal/metodologia/ciclos"
      />
    </PageContainer>
  );
}
