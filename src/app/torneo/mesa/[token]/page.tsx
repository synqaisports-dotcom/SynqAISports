import { loadMatchByMesaToken } from '@/app/actions/tournaments';
import { MesaScoreboard } from '@/components/torneo/MesaScoreboard';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ token: string }> };

export default async function MesaPage({ params }: Props) {
  const { token } = await params;
  const data = await loadMatchByMesaToken(token);
  if (!data) notFound();
  return <MesaScoreboard match={data.match} bundle={data.bundle} />;
}

export const metadata = {
  title: 'Mesa · SynqAI Torneos',
  description: 'Anotación de partido',
};
