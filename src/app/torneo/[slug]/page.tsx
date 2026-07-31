import { loadPublicTournamentBySlug, serializeTournamentBundle } from '@/lib/tournament-loader';
import { PublicTournamentView } from '@/components/torneo/PublicTournamentView';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const bundle = await loadPublicTournamentBySlug(slug);
    if (!bundle?.tournament.public_enabled) {
      return { title: 'Torneo no encontrado · SynqAI' };
    }
    return {
      title: `${bundle.tournament.name} · SynqAI Torneos`,
      description:
        bundle.tournament.description ?? `Horarios, clasificación y resultados de ${bundle.tournament.name}`,
    };
  } catch {
    return { title: 'Torneo · SynqAI' };
  }
}

export default async function PublicTournamentPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tab } = await searchParams;

  let bundle;
  try {
    bundle = await loadPublicTournamentBySlug(slug);
  } catch (error) {
    console.error('[torneo] PublicTournamentPage:', error);
    bundle = null;
  }

  if (!bundle || !bundle.tournament.public_enabled) notFound();

  return (
    <PublicTournamentView
      bundle={serializeTournamentBundle(bundle)}
      slug={slug}
      tab={tab}
    />
  );
}
