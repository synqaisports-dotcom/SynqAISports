'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExerciseSheetPrintDocument } from '@/components/methodology/ExerciseSheetPrintDocument';
import { ExerciseSheetPrintToolbar } from '@/components/methodology/ExerciseSheetPrintToolbar';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';
import { loadExercises, type CoachFreeExercise } from '@/lib/coach-free-device';
import { parseExerciseSheet, sheetPdfFilename } from '@/lib/exercise-sheet';
import '@/app/print/print.css';

export function CoachFreeExercisePrint({ exerciseId }: { exerciseId: string }) {
  const { sport, ready } = useCoachFreeSport();
  const [item, setItem] = useState<CoachFreeExercise | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    setItem(loadExercises(sport).find((exercise) => exercise.id === exerciseId) ?? null);
  }, [ready, sport, exerciseId]);

  if (!ready || item === undefined) return null;

  if (!item) {
    return (
      <div className="print-page-root min-h-screen bg-gray-200 px-4 py-8 text-black">
        <p className="text-sm">Ese ejercicio no está en este aparato.</p>
        <Link href="/coach/app/ejercicios" className="mt-3 inline-block text-sm text-synq-pitch">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const sheet = parseExerciseSheet(item.sheet);
  if (!sheet.title) sheet.title = item.title;
  const filename = sheetPdfFilename(sheet.title || item.title);

  return (
    <div className="print-page-root min-h-screen bg-gray-200 px-4 py-8 text-black print:bg-white print:py-0">
      <div className="mx-auto max-w-[210mm]">
        <div className="no-print mb-4">
          <Link
            href={`/coach/app/ejercicios?exercise=${exerciseId}`}
            className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
          >
            ← Volver al catálogo
          </Link>
        </div>
        <ExerciseSheetPrintToolbar filename={filename} />
        <ExerciseSheetPrintDocument
          sheet={sheet}
          drawingJson={item.drawing}
          clubName="SynqAI Coach Touch Free"
        />
      </div>
    </div>
  );
}
