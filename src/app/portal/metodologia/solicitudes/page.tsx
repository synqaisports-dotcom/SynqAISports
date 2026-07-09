import { ChangeRequestsPanel, type ChangeRequestRow } from '@/components/methodology/ChangeRequestsPanel';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: requests } = await supabase
    .from('synq_change_requests')
    .select('id, reason, status, created_at, synq_exercises(title)')
    .eq('club_id', ctx.club.id)
    .order('created_at', { ascending: false });

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Solicitudes</h1>

      <MethodologySubnav />

      <ChangeRequestsPanel requests={(requests ?? []) as ChangeRequestRow[]} />
    </PageContainer>
  );
}
