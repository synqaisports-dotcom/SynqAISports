import Link from 'next/link';
import { DeleteExerciseButton } from '@/components/methodology/DeleteExerciseButton';
import { ExerciseCanvasPreview } from '@/components/methodology/ExerciseCanvas';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function EjerciciosListPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const { data: exercises } = await supabase
    .from('synq_exercises')
    .select('id, title, duration_min, objectives, drawing_json')
    .eq('club_id', ctx.club.id)
    .order('updated_at', { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-white">Ejercicios</h1>
          <p className="mt-2 text-synq-muted">Biblioteca del club con boceto en pizarra web.</p>
        </div>
        <Link
          href="/portal/metodologia/ejercicios/nuevo"
          className="rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent"
        >
          Nuevo ejercicio
        </Link>
      </div>
      <MethodologySubnav />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(exercises ?? []).map((ex) => (
          <li
            key={ex.id}
            className="rounded-2xl border border-white/5 bg-synq-slate/30 overflow-hidden"
          >
            <ExerciseCanvasPreview data={ex.drawing_json} />
            <div className="p-4">
              <Link
                href={`/portal/metodologia/ejercicios/${ex.id}`}
                className="font-semibold text-white hover:text-synq-accent"
              >
                {ex.title}
              </Link>
              <p className="mt-1 text-xs text-synq-muted">{ex.duration_min} min</p>
              {ex.objectives && (
                <p className="mt-2 line-clamp-2 text-sm text-synq-muted">{ex.objectives}</p>
              )}
              <div className="mt-3">
                <DeleteExerciseButton id={ex.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
      {(exercises ?? []).length === 0 && (
        <p className="text-synq-muted">Aún no hay ejercicios. Crea el primero.</p>
      )}
    </div>
  );
}
