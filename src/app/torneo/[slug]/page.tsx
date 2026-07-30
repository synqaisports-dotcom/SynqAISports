import { loadTournamentBySlug } from '@/app/actions/tournaments';
import { PublicTournamentView } from '@/components/torneo/PublicTournamentView';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function PublicTournamentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const bundle = await loadTournamentBySlug(slug);
  if (!bundle || !bundle.tournament.public_enabled) notFound();
  return <PublicTournamentView bundle={bundle} slug={slug} tab={tab} />;
}
