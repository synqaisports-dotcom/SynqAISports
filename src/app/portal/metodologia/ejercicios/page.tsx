import Link from 'next/link';
import { DeleteExerciseButton } from '@/components/methodology/DeleteExerciseButton';
import { ExerciseDrawingPreview } from '@/components/methodology/drawing/ExerciseDrawingTrigger';
import { ExerciseSheetPrintLink } from '@/components/methodology/ExerciseSheetPrintLink';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { parseExerciseSheet } from '@/lib/exercise-sheet';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function EjerciciosListPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const exercises = await loadExerciseLibrary(supabase, ctx.club.id);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-white">Ejercicios</h1>
          <p className="mt-2 text-synq-muted">
            Catálogo global del club. Para asignarlos a sesiones, entra por{' '}
            <Link href="/portal/metodologia/ciclos" className="text-synq-accent hover:underline">
              Ciclos
            </Link>
            .
          </p>
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
        {exercises.map((ex) => {
          const sheet = parseExerciseSheet(ex.sheet_json);
          const subtitle = sheet.didacticStrategy || ex.objectives;
          const durationMin = 'duration_min' in ex && typeof ex.duration_min === 'number' ? ex.duration_min : 15;
          return (
          <li
            key={ex.id}
            className="rounded-2xl border border-white/5 bg-synq-slate/30 overflow-hidden"
          >
            <ExerciseDrawingPreview data={ex.drawing_json} className="w-full" />
            <div className="p-4">
              <Link
                href={`/portal/metodologia/ejercicios/${ex.id}`}
                className="font-semibold text-white hover:text-synq-accent"
              >
                {ex.title}
              </Link>
              <p className="mt-1 text-xs text-synq-muted">
                {sheet.conditionalGrid.time || `${durationMin} min`}
              </p>
              {subtitle && (
                <p className="mt-2 line-clamp-2 text-sm text-synq-muted">{subtitle}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <ExerciseSheetPrintLink href={`/print/ficha/ejercicio/${ex.id}`} />
                <DeleteExerciseButton id={ex.id} />
              </div>
            </div>
          </li>
        );
        })}
      </ul>
      {exercises.length === 0 && (
        <p className="text-synq-muted">Aún no hay ejercicios. Crea el primero.</p>
      )}
    </div>
  );
}
