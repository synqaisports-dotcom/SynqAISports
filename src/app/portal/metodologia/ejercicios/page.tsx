import { ExercisesMasterDetail } from '@/components/methodology/ExercisesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import { isDemoActive } from '@/lib/demo';
import { resolveActiveSport } from '@/lib/sport-context';
import { parseSportFromSearchParams } from '@/lib/sport-context';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ exercise?: string; sport?: string }>;
};

export default async function EjerciciosListPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialExerciseId = params.exercise;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const activeSport = resolveActiveSport(
    ctx.club.practiced_sports,
    parseSportFromSearchParams(params)
  );

  const [exercises, demoMode] = await Promise.all([
    loadExerciseLibrary(supabase, ctx.club.id, activeSport),
    isDemoActive(),
  ]);

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Ejercicios</h1>

      <ExercisesMasterDetail
        exercises={exercises}
        initialExerciseId={initialExerciseId}
        demoMode={demoMode}
        activeSport={activeSport}
        practicedSports={ctx.club.practiced_sports}
      />
    </PageContainer>
  );
}
