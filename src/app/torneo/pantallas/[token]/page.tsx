import { loadTournamentBySignageToken } from '@/app/actions/tournaments';
import { TournamentSignageScreen } from '@/components/torneo/TournamentSignageScreen';
import { tournamentSponsorsToSignageSponsors } from '@/lib/tournament-signage';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ token: string }> };

export default async function TournamentSignagePage({ params }: Props) {
  const { token } = await params;
  const bundle = await loadTournamentBySignageToken(token);
  if (!bundle) notFound();

  const sponsors = tournamentSponsorsToSignageSponsors(bundle.sponsors);

  return (
    <TournamentSignageScreen
      sponsors={sponsors}
      tournamentName={bundle.tournament.name}
      coverImageUrl={bundle.tournament.cover_image_url}
    />
  );
}

export const metadata = {
  title: 'Pantallas · SynqAI Torneos',
  description: 'Muro de patrocinadores del torneo',
};
