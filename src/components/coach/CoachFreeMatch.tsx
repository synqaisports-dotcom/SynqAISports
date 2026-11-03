'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  blankCoachFreeDrawing,
  coachFreeBoardReady,
  loadMatchDrawing,
  saveMatchDrawing,
} from '@/lib/coach-free-device';
import { CoachFreeSoon } from '@/components/coach/CoachFreeSoon';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const ExerciseDrawingStudio = dynamic(
  () =>
    import('@/components/methodology/drawing/ExerciseDrawingStudio').then(
      (mod) => mod.ExerciseDrawingStudio
    ),
  { ssr: false }
);

export function CoachFreeMatch() {
  const router = useRouter();
  const { sport, ready } = useCoachFreeSport();
  const initialData = useMemo(() => {
    if (!ready || !coachFreeBoardReady(sport)) return null;
    return loadMatchDrawing(sport) ?? blankCoachFreeDrawing(sport);
  }, [ready, sport]);

  if (!ready) return null;
  if (!coachFreeBoardReady(sport) || !initialData) return <CoachFreeSoon sport={sport} title="Pizarra de partido" />;

  return (
    <ExerciseDrawingStudio
      open
      initialData={initialData}
      onClose={() => router.push('/coach/app')}
      onSave={(json) => {
        try {
          saveMatchDrawing(sport, JSON.parse(json));
        } catch {
          saveMatchDrawing(sport, json);
        }
      }}
    />
  );
}
