import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeExercisePrint } from '@/components/coach/CoachFreeExercisePrint';

type Props = { params: Promise<{ id: string }> };

export default async function CoachFreeExercisePrintPage({ params }: Props) {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  const { id } = await params;
  return <CoachFreeExercisePrint exerciseId={id} />;
}
