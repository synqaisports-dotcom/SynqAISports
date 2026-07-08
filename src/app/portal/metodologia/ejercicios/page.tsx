import { ExercisesMasterDetail } from '@/components/methodology/ExercisesMasterDetail';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ exercise?: string }>;
};

export default async function EjerciciosListPage({ searchParams }: Props) {
  const { exercise: initialExerciseId } = await searchParams;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const exercises = await loadExerciseLibrary(supabase, ctx.club.id);

  return (
    <PageContainer>
      <h1 className="text-2xl font-semibold tracking-tight">Ejercicios</h1>

      <MethodologySubnav />

      <ExercisesMasterDetail exercises={exercises} initialExerciseId={initialExerciseId} />
    </PageContainer>
  );
}
