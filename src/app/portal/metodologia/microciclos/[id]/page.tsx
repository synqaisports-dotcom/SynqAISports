import Link from 'next/link';
import { MicrocycleSlotsEditor, type SlotRow } from '@/components/methodology/MicrocycleSlotsEditor';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function MicrocicloDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: micro } = await supabase
    .from('synq_microcycles')
    .select('id, title, week_label')
    .eq('id', id)
    .eq('club_id', ctx.club.id)
    .single();

  if (!micro) notFound();

  const [{ data: slots }, { data: exercises }] = await Promise.all([
    supabase
      .from('synq_microcycle_slots')
      .select(
        'id, slot_type, order_index, title, notes, session_date, exercise_id, sheet_json, synq_exercises(id, title)'
      )
      .eq('microcycle_id', id)
      .order('order_index'),
    supabase
      .from('synq_exercises')
      .select('id, title')
      .eq('club_id', ctx.club.id)
      .order('title'),
  ]);

  return (
    <div>
      <Link
        href="/portal/metodologia/microciclos"
        className="text-sm text-synq-muted hover:text-white"
      >
        ← Microciclos
      </Link>
      <h1 className="mt-2 font-serif-display text-3xl text-white">{micro.title}</h1>
      <p className="text-synq-muted">{micro.week_label}</p>
      <MethodologySubnav />
      <div className="mt-6">
        <MicrocycleSlotsEditor
          slots={(slots ?? []) as SlotRow[]}
          exercises={exercises ?? []}
        />
      </div>
    </div>
  );
}
