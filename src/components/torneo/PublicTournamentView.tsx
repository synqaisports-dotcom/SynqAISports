import { PublicTournamentHub, parsePublicTournamentTab } from '@/components/torneo/public/PublicTournamentHub';
import type { TournamentBundle } from '@/lib/tournaments';

type Props = {
  bundle: TournamentBundle;
  slug: string;
  tab?: string;
};

export function PublicTournamentView({ bundle, slug, tab }: Props) {
  const initialTab = parsePublicTournamentTab(tab);

  return <PublicTournamentHub bundle={bundle} slug={slug} initialTab={initialTab} />;
}
