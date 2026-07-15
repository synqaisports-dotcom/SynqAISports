import { ChangeRequestsPanel } from '@/components/methodology/ChangeRequestsPanel';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
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
      <h1 className="text-2xl font-semibold tracking-tight">Solicitudes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Peticiones de cambio desde entrenadores (web y futura app Android). El director de
        metodología y cantera reciben aviso en la campana del header.
      </p>

      <MethodologySubnav />

      <ChangeRequestsPanel requests={requests} role={ctx.role} />
    </PageContainer>
  );
}
