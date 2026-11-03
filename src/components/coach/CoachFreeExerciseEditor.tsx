'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ActionState } from '@/app/actions/methodology';
import { ExerciseEditor, type ExerciseRow } from '@/components/methodology/ExerciseEditor';
import { CLUB_PRACTICED_SPORT_LABELS } from '@/lib/club-practiced-sports';
import {
  loadExercises,
  saveExercise,
  type CoachFreeExercise,
} from '@/lib/coach-free-device';
import { sheetFromFormData } from '@/lib/exercise-sheet';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const CATALOG = '/coach/app/ejercicios';

function toRow(item: CoachFreeExercise): ExerciseRow {
  return {
    id: item.id,
    title: item.title,
    objectives: item.objectives ?? '',
    duration_min: 15,
    materials: '',
    notes: '',
    drawing_json: item.drawing as ExerciseRow['drawing_json'],
    sheet_json: item.sheet,
    task_type: item.task_type,
  };
}

export function CoachFreeExerciseEditor({ exerciseId }: { exerciseId?: string }) {
  const { sport, ready } = useCoachFreeSport();
  const [exercise, setExercise] = useState<ExerciseRow | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    if (!exerciseId) {
      setExercise(null);
      return;
    }
    const found = loadExercises(sport).find((item) => item.id === exerciseId);
    setExercise(found ? toRow(found) : null);
  }, [ready, sport, exerciseId]);

  const submit = useCallback(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const sheet = sheetFromFormData(formData);
      if (!sheet.title) return { ok: false, message: 'validation' };
      let drawing: unknown = itemDrawing(formData);
      const id = exerciseId ?? crypto.randomUUID();
      const error = saveExercise(sport, {
        id,
        title: sheet.title,
        objectives: sheet.objectives,
        task_type: sheet.taskType,
        sheet,
        drawing,
        updatedAt: new Date().toISOString(),
      });
      if (error) return { ok: false, message: error };
      return { ok: true, id };
    },
    [sport, exerciseId]
  );

  if (!ready || exercise === undefined) return null;
  if (exerciseId && !exercise) {
    return (
      <p className="px-6 py-10 text-sm text-synq-muted">
        Ese ejercicio no está en este aparato para {CLUB_PRACTICED_SPORT_LABELS[sport]}.
      </p>
    );
  }

  return (
    <div className="dark bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ExerciseEditor
          exercise={exercise ?? undefined}
          sport={sport}
          submit={submit}
          catalogHref={CATALOG}
        />
      </div>
    </div>
  );
}

function itemDrawing(formData: FormData): unknown {
  const raw = String(formData.get('drawingJson') ?? '');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
