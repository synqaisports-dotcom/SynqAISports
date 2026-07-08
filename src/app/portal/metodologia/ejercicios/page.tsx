import Link from 'next/link';
import { ExercisesMasterDetail } from '@/components/methodology/ExercisesMasterDetail';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { loadExerciseLibrary } from '@/lib/microcycle-page-data';
import { isDemoActive } from '@/lib/demo';
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

  const [exercises, demo] = await Promise.all([
    loadExerciseLibrary(supabase, ctx.club.id),
    isDemoActive(),
  ]);

  return (
    <PageContainer>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Ejercicios</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo global del club. Para asignarlos a sesiones, entra por{' '}
          <Link href="/portal/metodologia/ciclos" className="text-primary hover:underline">
            Ciclos
          </Link>
          .
        </p>
      </div>

      <MethodologySubnav />

      {demo ? (
        <p className="rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Vista maestro-detalle con ejercicios de demostración. Selecciona uno para ver la ficha y la
          pizarra.
        </p>
      ) : null}

      <ExercisesMasterDetail exercises={exercises} initialExerciseId={initialExerciseId} />
    </PageContainer>
  );
}
