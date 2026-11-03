import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeExercises } from '@/components/coach/CoachFreeExercises';

type Props = { searchParams: Promise<{ exercise?: string }> };

export default async function CoachFreeExercisesPage({ searchParams }: Props) {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  const { exercise } = await searchParams;
  return <CoachFreeExercises initialExerciseId={exercise} />;
}
