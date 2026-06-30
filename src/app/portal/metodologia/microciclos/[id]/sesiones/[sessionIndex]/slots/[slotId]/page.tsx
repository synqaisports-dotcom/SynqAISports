import { DemoSlotEditorPage } from '@/components/methodology/DemoSlotEditorPage';
import { SlotEditor, type SlotEditorPayload } from '@/components/methodology/SlotEditor';
import { PageContainer } from '@/components/portal/PageContainer';
import { getStaffContext } from '@/lib/portal';
import { isDemoMicrocycleId, loadMicrocycleBundle } from '@/lib/microcycle-page-data';
import type { SlotType } from '@/lib/methodology';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string; sessionIndex: string; slotId: string }>;
};

export default async function MicrocicloSlotPage({ params }: Props) {
  const { id, slotId } = await params;

  if (isDemoMicrocycleId(id)) {
    return (
      <PageContainer>
        <DemoSlotEditorPage microcycleId={id} slotId={slotId} />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const bundle = await loadMicrocycleBundle(supabase, ctx.club.id, id);
  if (!bundle) notFound();

  const slot = bundle.slots.find((item) => item.id === slotId);
  if (!slot) notFound();

  let drawing_json: unknown = undefined;
  if (slot.exercise_id) {
    const { data: exercise } = await supabase
      .from('synq_exercises')
      .select('drawing_json')
      .eq('id', slot.exercise_id)
      .maybeSingle();
    drawing_json = exercise?.drawing_json;
  }

  const payload: SlotEditorPayload = {
    id: slot.id,
    microcycle_id: id,
    session_index: slot.session_index ?? 1,
    slot_type: slot.slot_type as SlotType,
    order_index: slot.order_index,
    title: slot.title,
    notes: slot.notes,
    session_date: slot.session_date,
    exercise_id: slot.exercise_id,
    sheet_json: slot.sheet_json,
    drawing_json,
  };

  return (
    <PageContainer>
      <SlotEditor microcycleTitle={bundle.micro.title} slot={payload} />
    </PageContainer>
  );
}
