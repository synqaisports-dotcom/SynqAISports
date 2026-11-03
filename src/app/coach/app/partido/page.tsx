import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeMatch } from '@/components/coach/CoachFreeMatch';

export default async function CoachFreeMatchPage() {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  return <CoachFreeMatch />;
}
