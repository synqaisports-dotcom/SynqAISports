'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { ArrowLeft, Loader2, Printer, Save } from 'lucide-react';
import { createExercise, updateExercise, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { ExerciseSheetView } from '@/components/methodology/ExerciseSheetView';
import { Card, CardContent } from '@/components/ui/card';
import {
  legacyToSheet,
  parseExerciseSheet,
  TASK_TYPE_LABELS,
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

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary disabled:opacity-50';

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
      <Card className="border border-primary/25">
        <CardContent className="p-6">
          <p className="text-sm text-primary">
            Ejercicio creado.{' '}
            <Link href={redirectTo} className="font-medium underline">
              {returnTo ? 'Volver a la sesión' : 'Ver ficha'}
            </Link>{' '}
            ·{' '}
            <Link href={`/portal/metodologia/ejercicios/${state.id}`} className="font-medium underline">
              Abrir ejercicio
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (mode === 'view' && exercise) {
    return <ExerciseSheetView sheet={sheet} drawingJson={exercise.drawing_json} />;
  }

  const backHref =
    returnTo && returnTo.startsWith('/portal/') ? returnTo : '/portal/metodologia/ejercicios';
  const headerLabel = isEdit
    ? TASK_TYPE_LABELS[sheet.taskType]
    : defaultTaskType
      ? TASK_TYPE_LABELS[defaultTaskType]
      : 'Nuevo ejercicio';
  const exerciseTitle = sheet.title?.trim();

  return (
    <form action={action} className="space-y-4">
      {categorySlug ? (
        <Card className="border border-primary/25 bg-primary/5">
          <CardContent className="p-4 text-sm text-primary">
            Categoría heredada: <strong>{categorySlug}</strong>
            <input type="hidden" name="categorySlug" value={categorySlug} />
          </CardContent>
        </Card>
      ) : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl font-semibold tracking-tight">
            <span>{headerLabel}</span>
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
          {state.ok && isEdit ? <p className="mt-1 text-sm text-emerald-400">Ficha guardada.</p> : null}
          {state.message === 'error' ? (
            <p className="mt-1 text-sm text-destructive">Error al guardar.</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
          <button
            type="submit"
            disabled={pending}
            className={actionButtonClass}
            aria-label={isEdit ? 'Guardar ficha del ejercicio' : 'Crear ficha de ejercicio'}
            title={isEdit ? 'Guardar ficha del ejercicio' : 'Crear ficha de ejercicio'}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          </button>
          <Link
            href={backHref}
            className={actionButtonClass}
            aria-label={returnTo ? 'Volver a la sesión' : 'Volver al catálogo'}
            title={returnTo ? 'Volver a la sesión' : 'Volver al catálogo'}
          >
            <ArrowLeft className="size-4" />
          </Link>
          {isEdit && exercise ? (
            <Link
              href={`/print/ficha/ejercicio/${exercise.id}`}
              className={actionButtonClass}
              aria-label="Imprimir ficha"
              title="Imprimir ficha"
              target="_blank"
            >
              <Printer className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>

      <ExerciseSheetForm
        sheet={sheet}
        drawingJson={exercise?.drawing_json}
        layout="split"
        showTaskType={!defaultTaskType}
        showCanvasHeader={false}
      />
    </form>
  );
}
