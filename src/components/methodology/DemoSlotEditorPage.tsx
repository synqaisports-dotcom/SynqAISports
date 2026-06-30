'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlotEditor, type SlotEditorPayload } from '@/components/methodology/SlotEditor';
import { loadDemoMicrocycle } from '@/lib/demo-microcycles-store';
import type { SlotType } from '@/lib/methodology';

type Props = {
  microcycleId: string;
  slotId: string;
};

export function DemoSlotEditorPage({ microcycleId, slotId }: Props) {
  const [slot, setSlot] = useState<SlotEditorPayload | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const micro = loadDemoMicrocycle(microcycleId);
    if (!micro) {
      setSlot(null);
      return;
    }
    setTitle(micro.title);
    const found = micro.slots.find((item) => item.id === slotId);
    if (!found) {
      setSlot(null);
      return;
    }
    setSlot({
      id: found.id,
      microcycle_id: microcycleId,
      session_index: found.session_index,
      slot_type: found.slot_type as SlotType,
      order_index: found.order_index,
      title: found.title,
      notes: found.notes,
      session_date: found.session_date,
      exercise_id: found.exercise_id,
      sheet_json: found.sheet_json,
    });
  }, [microcycleId, slotId]);

  if (!slot) {
    return (
      <p className="text-sm text-muted-foreground">
        Slot no encontrado.{' '}
        <Link href={`/portal/metodologia/microciclos/${microcycleId}`} className="text-primary underline">
          Volver al microciclo
        </Link>
      </p>
    );
  }

  return <SlotEditor microcycleTitle={title} slot={slot} />;
}
