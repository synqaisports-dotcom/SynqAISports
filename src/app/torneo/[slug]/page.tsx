import { loadTournamentBySlug } from '@/app/actions/tournaments';
import { PublicTournamentView } from '@/components/torneo/PublicTournamentView';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function PublicTournamentPage({ params }: Props) {
  const { slug } = await params;
  const bundle = await loadTournamentBySlug(slug);
  if (!bundle || !bundle.tournament.public_enabled) notFound();
  return <PublicTournamentView bundle={bundle} />;
}
