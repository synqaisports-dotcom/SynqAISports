'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { createExercise, updateExercise, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { ExerciseSheetView } from '@/components/methodology/ExerciseSheetView';
import {
  legacyToSheet,
  parseExerciseSheet,
  type ExerciseTaskSheet,
} from '@/lib/exercise-sheet';
import type { DrawingData } from '@/lib/methodology';

export type ExerciseRow = {
  id: string;
  title: string;
  objectives: string;
  duration_min: number;
  materials: string;
  notes: string;
  drawing_json: DrawingData;
  sheet_json?: unknown;
  task_type?: string;
};

const initial: ActionState = { ok: false };

type Props = {
  exercise?: ExerciseRow;
  mode?: 'edit' | 'view';
};

function resolveSheet(exercise?: ExerciseRow): ExerciseTaskSheet {
  if (!exercise) return legacyToSheet({});
  const parsed = parseExerciseSheet(exercise.sheet_json);
  if (parsed.title) return parsed;
  return legacyToSheet({
    title: exercise.title,
    objectives: exercise.objectives,
    notes: exercise.notes,
    materials: exercise.materials,
    taskType:
      exercise.task_type === 'warmup' || exercise.task_type === 'cooldown'
        ? exercise.task_type
        : 'main',
  });
}

export function ExerciseEditor({ exercise, mode = 'edit' }: Props) {
  const isEdit = Boolean(exercise);
  const bound = isEdit
    ? updateExercise.bind(null, exercise!.id)
    : createExercise;
  const [state, action, pending] = useFormState(bound, initial);
  const sheet = resolveSheet(exercise);

  if (!isEdit && state.ok && state.id) {
    return (
      <p className="text-synq-accent">
        Ejercicio creado.{' '}
        <Link href={`/portal/metodologia/ejercicios/${state.id}`} className="underline">
          Ver ficha
        </Link>{' '}
        ·{' '}
        <Link href="/portal/metodologia/ejercicios" className="underline">
          Listado
        </Link>
      </p>
    );
  }

  if (mode === 'view' && exercise) {
    return <ExerciseSheetView sheet={sheet} drawingJson={exercise.drawing_json} />;
  }

  return (
    <form action={action} className="max-w-4xl space-y-4">
      <ExerciseSheetForm sheet={sheet} drawingJson={exercise?.drawing_json} />
      {state.ok && isEdit && <p className="text-sm text-synq-accent">Ficha guardada.</p>}
      {state.message === 'error' && <p className="text-sm text-red-400">Error al guardar.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-synq-pitch px-6 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {pending ? 'Guardando…' : isEdit ? 'Guardar ficha' : 'Crear ficha de ejercicio'}
      </button>
    </form>
  );
}
