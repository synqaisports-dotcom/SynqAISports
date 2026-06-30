import { ChangeRequestsPanel, type ChangeRequestRow } from '@/components/methodology/ChangeRequestsPanel';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
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
    <div>
      <h1 className="font-serif-display text-3xl text-white">Solicitudes de cambio</h1>
      <p className="mt-2 text-synq-muted">
        Flujo de aprobación para cambios propuestos por entrenadores desde la vista Entrenador o
        registro manual.
      </p>
      <MethodologySubnav />
      <div className="mt-6">
        <ChangeRequestsPanel requests={(requests ?? []) as ChangeRequestRow[]} />
      </div>
    </div>
  );
}
