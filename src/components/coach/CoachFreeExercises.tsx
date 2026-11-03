'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExercisesMasterDetail, type ExerciseListRecord } from '@/components/methodology/ExercisesMasterDetail';
import { CLUB_PRACTICED_SPORT_ORDER } from '@/lib/club-practiced-sports';
import {
  COACH_FREE_MAX_EXERCISES,
  deleteExercise,
  loadExercises,
  saveExercise,
  type CoachFreeExercise,
} from '@/lib/coach-free-device';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const LIBRARY = '/coach/app/ejercicios';

function toRecord(item: CoachFreeExercise): ExerciseListRecord {
  return {
    id: item.id,
    title: item.title,
    task_type: item.task_type ?? null,
    objectives: item.objectives ?? null,
    sheet_json: item.sheet,
    drawing_json: item.drawing,
  };
}

export function CoachFreeExercises({ initialExerciseId }: { initialExerciseId?: string | null }) {
  const { sport, ready, choose } = useCoachFreeSport();
  const [items, setItems] = useState<CoachFreeExercise[]>([]);

  useEffect(() => {
    if (!ready) return;
    setItems(loadExercises(sport));
  }, [ready, sport]);

  if (!ready) return null;

  return (
    <div className="portal-dashboard dark min-h-screen">
      <div className="synq-portal-content mx-auto flex w-full max-w-7xl flex-col px-4 pb-6 pt-4 md:px-6">
        <Link href="/coach/app" className="mb-3 text-sm text-primary">
          Inicio
        </Link>
        <ExercisesMasterDetail
          exercises={items.map(toRecord)}
          initialExerciseId={initialExerciseId}
          activeSport={sport}
          practicedSports={CLUB_PRACTICED_SPORT_ORDER}
          libraryHref={LIBRARY}
          nuevoHref={`${LIBRARY}/nuevo`}
          maxExercises={COACH_FREE_MAX_EXERCISES}
          printHref={(id) => `${LIBRARY}/${id}/imprimir`}
          fichaHref={(id) => `${LIBRARY}/${id}`}
          onSportChange={(next) => {
            choose(next);
            setItems(loadExercises(next));
          }}
          onDelete={(id) => {
            deleteExercise(sport, id);
            setItems(loadExercises(sport));
          }}
          onSaveDrawing={(id, drawingJson) => {
            const current = loadExercises(sport).find((item) => item.id === id);
            if (!current) return;
            let drawing: unknown = current.drawing;
            try {
              drawing = JSON.parse(drawingJson) as unknown;
            } catch {
              return;
            }
            saveExercise(sport, {
              ...current,
              drawing,
              updatedAt: new Date().toISOString(),
            });
            setItems(loadExercises(sport));
          }}
        />
      </div>
    </div>
  );
}
