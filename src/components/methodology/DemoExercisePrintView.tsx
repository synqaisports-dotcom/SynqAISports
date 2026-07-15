'use client';

import { useEffect, useState } from 'react';
import { ExerciseSheetPrintDocument } from '@/components/methodology/ExerciseSheetPrintDocument';
import { ExerciseSheetPrintToolbar } from '@/components/methodology/ExerciseSheetPrintToolbar';
import type { ExerciseTaskSheet } from '@/lib/exercise-sheet';

type Props = {
  exerciseId: string;
  sheet: ExerciseTaskSheet;
  drawingJson: unknown;
  clubName: string;
  filename: string;
};

export function DemoExercisePrintView({
  exerciseId,
  sheet,
  drawingJson,
  clubName,
  filename,
}: Props) {
  const [resolvedDrawing, setResolvedDrawing] = useState(drawingJson);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`synq-print-drawing-${exerciseId}`);
      if (stored) {
        setResolvedDrawing(JSON.parse(stored) as unknown);
      }
    } catch {
      setResolvedDrawing(drawingJson);
    }
  }, [exerciseId, drawingJson]);

  return (
    <>
      <ExerciseSheetPrintToolbar filename={filename} />
      <ExerciseSheetPrintDocument sheet={sheet} drawingJson={resolvedDrawing} clubName={clubName} />
    </>
  );
}
