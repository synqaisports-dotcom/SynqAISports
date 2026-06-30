'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { createExercise, updateExercise, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { ExerciseSheetPrintLink } from '@/components/methodology/ExerciseSheetPrintLink';
import { ExerciseSheetView } from '@/components/methodology/ExerciseSheetView';
import {
  legacyToSheet,
  parseExerciseSheet,
  type ExerciseTaskSheet,
  type TaskType,
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
  defaultTaskType?: TaskType;
  categorySlug?: string;
  returnTo?: string;
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

export function ExerciseEditor({
  exercise,
  mode = 'edit',
  defaultTaskType,
  categorySlug,
  returnTo,
}: Props) {
  const isEdit = Boolean(exercise);
  const bound = isEdit
    ? updateExercise.bind(null, exercise!.id)
    : createExercise;
  const [state, action, pending] = useFormState(bound, initial);
  const sheet = resolveSheet(exercise);
  if (defaultTaskType && !sheet.title) {
    sheet.taskType = defaultTaskType;
  }

  if (!isEdit && state.ok && state.id) {
    const redirectTo =
      returnTo && returnTo.startsWith('/portal/') ? returnTo : `/portal/metodologia/ejercicios/${state.id}`;
    return (
      <p className="text-synq-accent">
        Ejercicio creado.{' '}
        <Link href={redirectTo} className="underline">
          {returnTo ? 'Volver a la sesión' : 'Ver ficha'}
        </Link>{' '}
        ·{' '}
        <Link href={`/portal/metodologia/ejercicios/${state.id}`} className="underline">
          Abrir ejercicio
        </Link>
      </p>
    );
  }

  if (mode === 'view' && exercise) {
    return <ExerciseSheetView sheet={sheet} drawingJson={exercise.drawing_json} />;
  }

  return (
    <form action={action} className="max-w-6xl space-y-4">
      {categorySlug ? (
        <p className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
          Categoría heredada: <strong>{categorySlug}</strong>
          <input type="hidden" name="categorySlug" value={categorySlug} />
        </p>
      ) : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {isEdit && exercise && (
        <div className="flex justify-end">
          <ExerciseSheetPrintLink href={`/print/ficha/ejercicio/${exercise.id}`} />
        </div>
      )}
      <ExerciseSheetForm
        sheet={sheet}
        drawingJson={exercise?.drawing_json}
        layout="split"
        showTaskType={!defaultTaskType}
      />
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
