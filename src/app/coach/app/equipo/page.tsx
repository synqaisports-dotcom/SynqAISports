import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeSquad } from '@/components/coach/CoachFreeSquad';

export default async function CoachFreeSquadPage() {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  return <CoachFreeSquad />;
}
