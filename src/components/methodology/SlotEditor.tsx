'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { updateMicrocycleSlot, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateDemoSlot } from '@/lib/demo-microcycles-store';
import { isDemoMicrocycleId, slotDisplayLabel } from '@/lib/microcycle-sessions';
import { legacyToSheet, parseExerciseSheet, sheetFromFormData, sheetToLegacyFields } from '@/lib/exercise-sheet';
import type { SlotType } from '@/lib/methodology';
import { useState, type FormEvent } from 'react';

export type SlotEditorPayload = {
  id: string;
  microcycle_id: string;
  session_index: number;
  slot_type: SlotType;
  order_index: number;
  title: string;
  notes: string;
  session_date: string | null;
  exercise_id: string | null;
  sheet_json?: unknown;
  drawing_json?: unknown;
};

type Props = {
  microcycleTitle: string;
  slot: SlotEditorPayload;
};

const initial: ActionState = { ok: false };

function resolveSlotSheet(slot: SlotEditorPayload) {
  const parsed = parseExerciseSheet(slot.sheet_json);
  if (parsed.title) {
    parsed.taskType = slot.slot_type;
    return parsed;
  }
  return legacyToSheet({
    title: slot.title,
    objectives: '',
    notes: slot.notes,
    taskType: slot.slot_type,
  });
}

export function SlotEditor({ microcycleTitle, slot }: Props) {
  const [demoPending, setDemoPending] = useState(false);
  const [demoOk, setDemoOk] = useState(false);
  const bound = updateMicrocycleSlot.bind(null, slot.id);
  const [state, action, pending] = useFormState(bound, initial);
  const sheet = resolveSlotSheet(slot);
  const label = slotDisplayLabel(slot.slot_type, slot.order_index);
  const isDemo = isDemoMicrocycleId(slot.microcycle_id);

  const handleDemoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setDemoPending(true);
    const nextSheet = sheetFromFormData(formData, slot.slot_type);
    const legacy = sheetToLegacyFields(nextSheet);
    const ok = updateDemoSlot(slot.microcycle_id, slot.id, {
      title: legacy.title,
      notes: legacy.notes,
      sheet_json: nextSheet,
      exercise_id: String(formData.get('exerciseId') ?? '').trim() || slot.exercise_id,
      session_date: String(formData.get('sessionDate') ?? '').trim() || null,
    });
    setDemoPending(false);
    setDemoOk(ok);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/portal/metodologia/microciclos/${slot.microcycle_id}`}
          className="hover:text-foreground"
        >
          {microcycleTitle}
        </Link>
        <span>/</span>
        <Link
          href={`/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${slot.session_index}`}
          className="hover:text-foreground"
        >
          Sesión {slot.session_index}
        </Link>
        <span>/</span>
        <span className="text-foreground">{label}</span>
      </div>

      <MethodologySubnav />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edita la ficha del slot y su esquema en pizarra.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/25 text-xs">
            {sheet.title || 'Sin título'}
          </Badge>
          {!isDemo ? (
            <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
              <Link href={`/print/ficha/slot/${slot.id}`}>
                <Printer className="size-4" />
                Imprimir
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <form
        action={isDemo ? undefined : action}
        onSubmit={isDemo ? (event: FormEvent<HTMLFormElement>) => handleDemoSubmit(event) : undefined}
        className="space-y-4"
      >
        <input type="hidden" name="taskType" value={slot.slot_type} />
        {slot.exercise_id ? <input type="hidden" name="exerciseId" value={slot.exercise_id} /> : null}

        <ExerciseSheetForm
          sheet={sheet}
          drawingJson={slot.drawing_json}
          showCanvas
          showTaskType={false}
          layout="split"
        />

        <Card className="border border-primary/25">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending || demoPending}>
                {pending || demoPending ? 'Guardando…' : 'Guardar ficha del slot'}
              </Button>
              <Button type="button" variant="outline" className="gap-2" asChild>
                <Link
                  href={`/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${slot.session_index}`}
                >
                  <ArrowLeft className="size-4" />
                  Volver a la sesión
                </Link>
              </Button>
            </div>
            {(state.ok || demoOk) && (
              <p className="text-sm text-emerald-400">Ficha guardada.</p>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
