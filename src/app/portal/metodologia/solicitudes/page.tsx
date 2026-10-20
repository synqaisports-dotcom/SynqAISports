import { ChangeRequestsPanel } from '@/components/methodology/ChangeRequestsPanel';
import { PageContainer } from '@/components/portal/PageContainer';
import { fetchChangeRequestInbox } from '@/app/actions/change-requests';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const requests = await fetchChangeRequestInbox({ status: 'all', limit: 200 });

  return (
    <PageContainer>
      <ChangeRequestsPanel requests={requests} role={ctx.role} />
    </PageContainer>
  );
}
