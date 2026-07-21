import { ExerciseEditor } from '@/components/methodology/ExerciseEditor';
import { PageContainer } from '@/components/portal/PageContainer';
import type { TaskType } from '@/lib/exercise-sheet';
import { parseSportFromSearchParams, resolveActiveSport } from '@/lib/sport-context';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{
    categorySlug?: string;
    taskType?: string;
    returnTo?: string;
    sport?: string;
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
  const sport = resolveActiveSport(ctx.club.practiced_sports, parseSportFromSearchParams(params));

  return (
    <PageContainer>
      <div className="space-y-4">
        <ExerciseEditor
          defaultTaskType={taskType}
          categorySlug={categorySlug}
          returnTo={returnTo}
          sport={sport}
        />
      </div>
    </PageContainer>
  );
}
