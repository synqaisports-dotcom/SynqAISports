import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeExercises } from '@/components/coach/CoachFreeExercises';

export default async function CoachFreeExercisesPage() {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  return <CoachFreeExercises />;
}
