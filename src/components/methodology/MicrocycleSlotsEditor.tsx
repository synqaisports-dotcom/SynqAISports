'use client';

import { useFormState } from 'react-dom';
import { updateMicrocycleSlot, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { SLOT_LABELS, type SlotType } from '@/lib/methodology';
import { legacyToSheet, parseExerciseSheet, type ExerciseTaskSheet } from '@/lib/exercise-sheet';

export type SlotRow = {
  id: string;
  slot_type: SlotType;
  order_index: number;
  title: string;
  notes: string;
  session_date: string | null;
  exercise_id: string | null;
  sheet_json?: unknown;
  synq_exercises: { id: string; title: string } | { id: string; title: string }[] | null;
};

type ExerciseOption = { id: string; title: string };

const initial: ActionState = { ok: false };

export function MicrocycleSlotsEditor({
  slots,
  exercises,
}: {
  slots: SlotRow[];
  exercises: ExerciseOption[];
}) {
  return (
    <div className="space-y-8">
      {slots.map((slot) => (
        <SlotForm key={slot.id} slot={slot} exercises={exercises} />
      ))}
    </div>
  );
}

function resolveSlotSheet(slot: SlotRow): ExerciseTaskSheet {
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

function SlotForm({ slot, exercises }: { slot: SlotRow; exercises: ExerciseOption[] }) {
  const bound = updateMicrocycleSlot.bind(null, slot.id);
  const [state, action, pending] = useFormState(bound, initial);
  const sheet = resolveSlotSheet(slot);
  const linked = Array.isArray(slot.synq_exercises)
    ? slot.synq_exercises[0]
    : slot.synq_exercises;

  const slotLabel =
    slot.slot_type === 'main'
      ? `Tarea principal ${slot.order_index}`
      : SLOT_LABELS[slot.slot_type];

  return (
    <form action={action} className="rounded-xl border border-white/10 bg-synq-slate/20 p-4">
      <p className="mb-4 text-sm font-semibold text-synq-accent">
        {slot.order_index + 1}. {slotLabel}
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-synq-muted">
            Vincular ejercicio de biblioteca (opcional)
          </label>
          <select
            name="exerciseId"
            defaultValue={slot.exercise_id ?? ''}
            className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          >
            <option value="">— Rellenar ficha manualmente —</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
          {linked && (
            <p className="mt-1 text-xs text-synq-muted">
              Vinculado: {linked.title}. Si dejas el título vacío al guardar, se importa la ficha.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs text-synq-muted">Fecha de sesión</label>
          <input
            name="sessionDate"
            type="date"
            defaultValue={slot.session_date ?? ''}
            className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <input type="hidden" name="taskType" value={slot.slot_type} />
      <ExerciseSheetForm sheet={sheet} showCanvas={false} showTaskType={false} />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-synq-pitch px-4 py-1.5 text-xs font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
        >
          {pending ? '…' : 'Guardar ficha del slot'}
        </button>
        {state.ok && <span className="text-xs text-synq-accent">Guardado</span>}
      </div>
    </form>
  );
}
