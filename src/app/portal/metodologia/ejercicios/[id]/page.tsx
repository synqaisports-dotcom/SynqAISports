import { ExerciseEditor, type ExerciseRow } from '@/components/methodology/ExerciseEditor';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function EditarEjercicioPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: exercise } = await supabase
    .from('synq_exercises')
    .select('id, title, objectives, duration_min, materials, notes, drawing_json, sheet_json, task_type')
    .eq('id', id)
    .eq('club_id', ctx.club.id)
    .single();

  if (!exercise) notFound();

  return (
    <div className="space-y-4">
      <ExerciseEditor exercise={exercise as ExerciseRow} />
    </div>
  );
}
