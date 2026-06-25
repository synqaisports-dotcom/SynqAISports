'use client';

import { useFormState } from 'react-dom';
import { updateMicrocycleSlot, type ActionState } from '@/app/actions/methodology';
import { SLOT_LABELS, type SlotType } from '@/lib/methodology';

export type SlotRow = {
  id: string;
  slot_type: SlotType;
  order_index: number;
  title: string;
  notes: string;
  session_date: string | null;
  exercise_id: string | null;
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
    <div className="space-y-6">
      {slots.map((slot) => (
        <SlotForm key={slot.id} slot={slot} exercises={exercises} />
      ))}
    </div>
  );
}

function SlotForm({ slot, exercises }: { slot: SlotRow; exercises: ExerciseOption[] }) {
  const bound = updateMicrocycleSlot.bind(null, slot.id);
  const [state, action, pending] = useFormState(bound, initial);
  const linked = Array.isArray(slot.synq_exercises)
    ? slot.synq_exercises[0]
    : slot.synq_exercises;

  return (
    <form
      action={action}
      className="rounded-xl border border-white/5 bg-synq-slate/30 p-4"
    >
      <p className="text-sm font-medium text-synq-accent">
        {slot.order_index + 1}. {SLOT_LABELS[slot.slot_type]}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-synq-muted">Ejercicio de biblioteca</label>
          <select
            name="exerciseId"
            defaultValue={slot.exercise_id ?? ''}
            className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          >
            <option value="">— Sin vincular —</option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
          {linked && (
            <p className="mt-1 text-xs text-synq-muted">Actual: {linked.title}</p>
          )}
        </div>
        <Field label="Título sesión (opcional)" name="title" defaultValue={slot.title} />
        <Field
          label="Fecha sesión"
          name="sessionDate"
          type="date"
          defaultValue={slot.session_date ?? ''}
        />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-synq-muted">Notas</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={slot.notes}
            className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-synq-pitch px-4 py-1.5 text-xs font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
        >
          {pending ? '…' : 'Guardar slot'}
        </button>
        {state.ok && <span className="text-xs text-synq-accent">Guardado</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
