import { redirect } from 'next/navigation';
import { currentCoachFree } from '@/app/actions/coach-free';
import { CoachFreeSeason } from '@/components/coach/CoachFreeSeason';

export default async function CoachFreeSeasonPage() {
  if (!(await currentCoachFree())) redirect('/coach/acceso');
  return <CoachFreeSeason />;
}
