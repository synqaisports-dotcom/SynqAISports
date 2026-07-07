'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { createExercise, updateExercise, type ActionState } from '@/app/actions/methodology';
import { ExerciseSheetForm } from '@/components/methodology/ExerciseSheetForm';
import { ExerciseSheetView } from '@/components/methodology/ExerciseSheetView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

      {isEdit && exercise ? (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
            <Link href={`/print/ficha/ejercicio/${exercise.id}`}>
              <Printer className="size-4" />
              Imprimir ficha
            </Link>
          </Button>
        </div>
      ) : null}

      <ExerciseSheetForm
        sheet={sheet}
        drawingJson={exercise?.drawing_json}
        layout="split"
        showTaskType={!defaultTaskType}
      />

      <Card className="border border-primary/25">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : isEdit ? 'Guardar ficha' : 'Crear ficha de ejercicio'}
            </Button>
            <Button type="button" variant="outline" className="gap-2" asChild>
              <Link href={returnTo && returnTo.startsWith('/portal/') ? returnTo : '/portal/metodologia/ejercicios'}>
                <ArrowLeft className="size-4" />
                {returnTo ? 'Volver a la sesión' : 'Volver al catálogo'}
              </Link>
            </Button>
          </div>
          {state.ok && isEdit ? <p className="text-sm text-emerald-400">Ficha guardada.</p> : null}
          {state.message === 'error' ? (
            <p className="text-sm text-destructive">Error al guardar.</p>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}
