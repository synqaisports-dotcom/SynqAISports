import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeExerciseEditor } from '@/components/coach/CoachFreeExerciseEditor';

type Props = { params: Promise<{ id: string }> };

export default async function CoachFreeEditExercisePage({ params }: Props) {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  const { id } = await params;
  return <CoachFreeExerciseEditor exerciseId={id} />;
}
