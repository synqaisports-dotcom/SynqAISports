import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeExerciseEditor } from '@/components/coach/CoachFreeExerciseEditor';

export default async function CoachFreeNewExercisePage() {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  return <CoachFreeExerciseEditor />;
}
