import { loadMesaHubByToken } from '@/app/actions/tournaments';
import { MesaTournamentHub } from '@/components/torneo/MesaTournamentHub';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ token: string }> };

export default async function MesaHubPage({ params }: Props) {
  const { token } = await params;
  const data = await loadMesaHubByToken(token);
  if (!data) notFound();
  return <MesaTournamentHub bundle={data.bundle} matches={data.matches} />;
}

export const metadata = {
  title: 'Mesa · SynqAI Torneos',
  description: 'Panel de mesa móvil del torneo',
};
