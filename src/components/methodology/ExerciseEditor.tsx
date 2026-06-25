'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { createExercise, updateExercise, type ActionState } from '@/app/actions/methodology';
import { ExerciseCanvas } from '@/components/methodology/ExerciseCanvas';
import type { DrawingData } from '@/lib/methodology';

export type ExerciseRow = {
  id: string;
  title: string;
  objectives: string;
  duration_min: number;
  materials: string;
  notes: string;
  drawing_json: DrawingData;
};

const initial: ActionState = { ok: false };

type Props = {
  exercise?: ExerciseRow;
  redirectOnCreate?: string;
};

export function ExerciseEditor({ exercise }: Props) {
  const isEdit = Boolean(exercise);
  const bound = isEdit
    ? updateExercise.bind(null, exercise!.id)
    : createExercise;
  const [state, action, pending] = useFormState(bound, initial);

  if (!isEdit && state.ok && state.id) {
    return (
      <p className="text-synq-accent">
        Ejercicio creado.{' '}
        <Link href={`/portal/metodologia/ejercicios/${state.id}`} className="underline">
          Editar
        </Link>{' '}
        ·{' '}
        <Link href="/portal/metodologia/ejercicios" className="underline">
          Volver al listado
        </Link>
      </p>
    );
  }

  return (
    <form action={action} className="max-w-2xl space-y-4">
      <Field label="Título" name="title" defaultValue={exercise?.title} required />
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Objetivos</label>
        <textarea
          name="objectives"
          rows={3}
          defaultValue={exercise?.objectives}
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Duración (min)"
          name="durationMin"
          type="number"
          min={1}
          defaultValue={String(exercise?.duration_min ?? 15)}
          required
        />
        <Field label="Material" name="materials" defaultValue={exercise?.materials} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Pizarra web (boceto)</label>
        <ExerciseCanvas initialData={exercise?.drawing_json} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Notas</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={exercise?.notes}
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
        />
      </div>
      {state.ok && isEdit && <p className="text-sm text-synq-accent">Guardado.</p>}
      {state.message === 'error' && <p className="text-sm text-red-400">Error al guardar.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-synq-pitch px-6 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear ejercicio'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
