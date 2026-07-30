'use client';

import { TournamentCategoryBrackets } from '@/components/portal/torneos/TournamentCategoryBrackets';
import type { TournamentBundle } from '@/lib/tournaments';
import { GitBranch, Trophy } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
};

export function PublicBracketsPanel({ bundle }: Props) {
  if (bundle.categories.length === 0 || bundle.matches.length === 0) {
    return (
      <div className="portal-section-surface rounded-2xl p-10 text-center text-sm text-muted-foreground">
        <GitBranch className="mx-auto mb-2 size-8 text-primary/50" />
        Los cuadros eliminatorios se publicarán cuando se genere la competición.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {bundle.categories.map((category) => {
        const knockoutMatches = bundle.matches.filter(
          (m) => m.category_id === category.id && m.round_key !== 'group'
        );
        if (knockoutMatches.length === 0) return null;

        return (
          <section key={category.id} className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/40 pb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
                  Eliminatorias
                </p>
                <h2 className="mt-1 flex items-center gap-2 text-xl font-bold md:text-2xl">
                  <Trophy className="size-5 text-cyan-300" />
                  {category.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuadros por clasificación (Platinum, Gold, Silver…) con horarios de cada cruce.
                </p>
              </div>
              <p className="text-sm tabular-nums text-muted-foreground">{knockoutMatches.length} partidos</p>
            </div>
            <TournamentCategoryBrackets bundle={bundle} category={category} showSchedule />
          </section>
        );
      })}
    </div>
  );
}
