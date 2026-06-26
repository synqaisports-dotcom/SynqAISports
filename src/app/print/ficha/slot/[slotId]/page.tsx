import Link from 'next/link';
import { ExerciseSheetPrintDocument } from '@/components/methodology/ExerciseSheetPrintDocument';
import { ExerciseSheetPrintToolbar } from '@/components/methodology/ExerciseSheetPrintToolbar';
import { sheetFromSlotRow, sheetPdfFilename, TASK_TYPE_LABELS } from '@/lib/exercise-sheet';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ slotId: string }> };

type MicrocycleRef = {
  id: string;
  title: string;
  week_label: string;
  club_id: string;
};

type ExerciseDrawingRef = {
  drawing_json: unknown;
} | null;

export default async function PrintSlotPage({ params }: Props) {
  const { slotId } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect(`/login?next=/print/ficha/slot/${slotId}`);

  const { data: slot } = await supabase
    .from('synq_microcycle_slots')
    .select(
      `
      id, slot_type, order_index, title, notes, session_date, sheet_json, exercise_id,
      synq_microcycles!inner(id, title, week_label, club_id),
      synq_exercises(drawing_json)
    `
    )
    .eq('id', slotId)
    .single();

  if (!slot) notFound();

  const microRaw = slot.synq_microcycles as MicrocycleRef | MicrocycleRef[];
  const micro = Array.isArray(microRaw) ? microRaw[0] : microRaw;
  if (!micro || micro.club_id !== ctx.club.id) notFound();

  const exRaw = slot.synq_exercises as ExerciseDrawingRef | ExerciseDrawingRef[];
  const linkedExercise = Array.isArray(exRaw) ? exRaw[0] : exRaw;
  const drawingJson = linkedExercise?.drawing_json ?? null;

  const sheet = sheetFromSlotRow(slot);
  const filename = sheetPdfFilename(sheet.title || slot.title || 'slot-microciclo');

  const sessionParts = [micro.title, micro.week_label];
  if (slot.session_date) {
    sessionParts.push(
      new Date(`${slot.session_date}T12:00:00`).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }
  const slotLabel = TASK_TYPE_LABELS[sheet.taskType];
  const sessionLabel = `${sessionParts.join(' · ')} — ${slotLabel}`;

  return (
    <div className="mx-auto max-w-[210mm] px-4">
      <div className="no-print mb-4">
        <Link
          href={`/portal/metodologia/microciclos/${micro.id}`}
          className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
        >
          ← Volver al microciclo
        </Link>
      </div>
      <ExerciseSheetPrintToolbar filename={filename} />
      <ExerciseSheetPrintDocument
        sheet={sheet}
        drawingJson={drawingJson}
        clubName={ctx.club.name}
        sessionLabel={sessionLabel}
      />
    </div>
  );
}
