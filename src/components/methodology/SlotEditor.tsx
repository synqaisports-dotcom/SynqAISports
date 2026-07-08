'use client';

import { useFormState } from 'react-dom';
import Link from 'next/link';
import { ArrowLeft, Loader2, Printer, Save } from 'lucide-react';
import { updateMicrocycleSlot, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
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
  slot: SlotEditorPayload;
};

const initial: ActionState = { ok: false };

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:opacity-50';

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

export function SlotEditor({ slot }: Props) {
  const [demoPending, setDemoPending] = useState(false);
  const [demoOk, setDemoOk] = useState(false);
  const bound = updateMicrocycleSlot.bind(null, slot.id);
  const [state, action, pending] = useFormState(bound, initial);
  const sheet = resolveSlotSheet(slot);
  const label = slotDisplayLabel(slot.slot_type, slot.order_index);
  const exerciseTitle = sheet.title?.trim();
  const isDemo = isDemoMicrocycleId(slot.microcycle_id);
  const isSaving = pending || demoPending;
  const saved = state.ok || demoOk;

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

  const backHref = `/portal/metodologia/microciclos/${slot.microcycle_id}/sesiones/${slot.session_index}`;

  return (
    <div className="space-y-4">
      <MethodologySubnav />

      <form
        action={isDemo ? undefined : action}
        onSubmit={isDemo ? (event: FormEvent<HTMLFormElement>) => handleDemoSubmit(event) : undefined}
        className="space-y-4"
      >
        <input type="hidden" name="taskType" value={slot.slot_type} />
        {slot.exercise_id ? <input type="hidden" name="exerciseId" value={slot.exercise_id} /> : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl font-semibold tracking-tight">
              <span>{label}</span>
              {exerciseTitle ? (
                <>
                  <span aria-hidden className="text-muted-foreground/40">
                    ·
                  </span>
                  <span className="text-base font-semibold uppercase tracking-wide text-primary sm:text-lg">
                    {exerciseTitle}
                  </span>
                </>
              ) : null}
            </h1>
            {saved ? <p className="mt-1 text-sm text-emerald-400">Ficha guardada.</p> : null}
          </div>

          <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
            <button
              type="submit"
              disabled={isSaving}
              className={actionButtonClass}
              aria-label="Guardar ficha del slot"
              title="Guardar ficha del slot"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            </button>
            <Link
              href={backHref}
              className={actionButtonClass}
              aria-label="Volver a la sesión"
              title="Volver a la sesión"
            >
              <ArrowLeft className="size-4" />
            </Link>
            {!isDemo ? (
              <Link
                href={`/print/ficha/slot/${slot.id}`}
                className={actionButtonClass}
                aria-label="Imprimir ficha"
                title="Imprimir ficha"
              >
                <Printer className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>

        <ExerciseSheetForm
          sheet={sheet}
          drawingJson={slot.drawing_json}
          showCanvas
          showTaskType={false}
          layout="split"
          showCanvasHeader={false}
        />
      </form>
    </div>
  );
}
