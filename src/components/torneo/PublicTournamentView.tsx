import { Suspense } from 'react';
import { PublicTournamentHub, parsePublicTournamentTab } from '@/components/torneo/public/PublicTournamentHub';
import type { TournamentBundle } from '@/lib/tournaments';
import { Loader2 } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
  slug: string;
  tab?: string;
};

function HubFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-cyan-400" />
    </div>
  );
}

export function PublicTournamentView({ bundle, slug, tab }: Props) {
  const initialTab = parsePublicTournamentTab(tab);

  return (
    <Suspense fallback={<HubFallback />}>
      <PublicTournamentHub bundle={bundle} slug={slug} initialTab={initialTab} />
    </Suspense>
  );
}
