import Link from 'next/link';
import { DemoExercisePrintView } from '@/components/methodology/DemoExercisePrintView';
import { ExerciseSheetPrintDocument } from '@/components/methodology/ExerciseSheetPrintDocument';
import { ExerciseSheetPrintToolbar } from '@/components/methodology/ExerciseSheetPrintToolbar';
import { isDemoActive } from '@/lib/demo';
import { getDemoExerciseById } from '@/lib/demo-exercises';
import { parseExerciseSheet, sheetFromExerciseRow, sheetPdfFilename } from '@/lib/exercise-sheet';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function PrintEjercicioPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect(`/login?next=/print/ficha/ejercicio/${id}`);

  if (await isDemoActive()) {
    const demo = getDemoExerciseById(id);
    if (!demo) notFound();

    const sheet = parseExerciseSheet(demo.sheet_json);
    const filename = sheetPdfFilename(sheet.title || demo.title);

    return (
      <div className="mx-auto max-w-[210mm] px-4">
        <div className="no-print mb-4">
          <Link
            href={`/portal/metodologia/ejercicios?exercise=${id}`}
            className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
          >
            ← Volver al catálogo
          </Link>
        </div>
        <DemoExercisePrintView
          exerciseId={id}
          sheet={sheet}
          drawingJson={demo.drawing_json}
          clubName={ctx.club.name}
          filename={filename}
        />
      </div>
    );
  }

  const { data: exercise } = await supabase
    .from('synq_exercises')
    .select(
      'id, title, objectives, duration_min, materials, notes, drawing_json, sheet_json, task_type'
    )
    .eq('id', id)
    .eq('club_id', ctx.club.id)
    .single();

  if (!exercise) notFound();

  const sheet = sheetFromExerciseRow(exercise);
  const filename = sheetPdfFilename(sheet.title || exercise.title);

  return (
    <div className="mx-auto max-w-[210mm] px-4">
      <div className="no-print mb-4">
        <Link
          href={`/portal/metodologia/ejercicios/${id}`}
          className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
        >
          ← Volver al ejercicio
        </Link>
      </div>
      <ExerciseSheetPrintToolbar filename={filename} />
      <ExerciseSheetPrintDocument
        sheet={sheet}
        drawingJson={exercise.drawing_json}
        clubName={ctx.club.name}
      />
    </div>
  );
}
