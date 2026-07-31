import { loadMesaFieldByToken } from '@/app/actions/tournaments';
import { MesaFieldBoard } from '@/components/torneo/MesaFieldBoard';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ token: string }> };

export default async function MesaPage({ params }: Props) {
  const { token } = await params;
  const data = await loadMesaFieldByToken(token);
  if (!data) notFound();
  return <MesaFieldBoard bundle={data.bundle} slot={data.slot} matches={data.matches} />;
}

export const metadata = {
  title: 'Mesa · SynqAI Torneos',
  description: 'Anotación de partido por campo',
};
