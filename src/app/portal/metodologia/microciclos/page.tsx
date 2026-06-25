import { MicrocycleListPanel, type MicrocycleRow } from '@/components/methodology/MicrocycleListPanel';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function MicrociclosListPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const [{ data: microcycles }, { data: teams }] = await Promise.all([
    supabase
      .from('synq_microcycles')
      .select('id, title, week_label, week_start, synq_teams(name)')
      .eq('club_id', ctx.club.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('synq_teams')
      .select('id, name')
      .eq('club_id', ctx.club.id)
      .eq('active', true)
      .order('name'),
  ]);

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Microciclos</h1>
      <p className="mt-2 text-synq-muted">
        Planificación semanal. Cada microciclo incluye 5 sesiones tipo plantilla.
      </p>
      <MethodologySubnav />
      <div className="mt-6">
        <MicrocycleListPanel
          microcycles={(microcycles ?? []) as MicrocycleRow[]}
          teams={teams ?? []}
        />
      </div>
    </div>
  );
}
