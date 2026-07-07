import { ExerciseEditor } from '@/components/methodology/ExerciseEditor';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import type { TaskType } from '@/lib/exercise-sheet';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    categorySlug?: string;
    taskType?: string;
    returnTo?: string;
  }>;
};

export default async function NuevoEjercicioPage({ searchParams }: Props) {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const params = await searchParams;
  const categorySlug = params.categorySlug?.trim() || undefined;
  const taskType = (params.taskType as TaskType | undefined) ?? undefined;
  const returnTo = params.returnTo?.trim() || undefined;

  return (
    <PageContainer>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo ejercicio</h1>
        <p className="text-sm text-muted-foreground">
          Crea la ficha y el esquema en pizarra. Se guardará en el catálogo del club.
        </p>
      </div>
      <MethodologySubnav />
      <div className="mt-6">
        <ExerciseEditor
          defaultTaskType={taskType}
          categorySlug={categorySlug}
          returnTo={returnTo}
        />
      </div>
    </PageContainer>
  );
}
