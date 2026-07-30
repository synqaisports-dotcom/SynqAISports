'use client';

import { useState } from 'react';
import { groupStandings } from '@/lib/tournament-brackets';
import { TournamentBracketsSheet } from '@/components/portal/torneos/TournamentBracketsSheet';
import {
  placementBracketsForCategory,
  type TournamentBundle,
  type TournamentCategory,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const BRACKETS_ICON_CLASS =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-cyan-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';

type Props = {
  bundle: TournamentBundle;
  categoryId?: string;
};

function GroupStandingsTable({
  groupCode,
  bundle,
  categoryId,
}: {
  groupCode: string;
  bundle: TournamentBundle;
  categoryId: string;
}) {
  const catMatches = bundle.matches.filter((m) => m.category_id === categoryId);
  const standings = groupStandings(groupCode, bundle.teams, catMatches);

  return (
    <div className="portal-section-surface overflow-hidden rounded-xl">
      <div className="border-b border-border/50 bg-primary/5 px-3 py-2">
        <p className="text-sm font-semibold">Grupo {groupCode}</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-muted-foreground">
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">Equipo</th>
            <th className="px-3 py-2 text-center">PJ</th>
            <th className="px-3 py-2 text-center">Pts</th>
            <th className="px-3 py-2 text-center">DG</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team.id} className="border-t border-border/30">
              <td className="px-3 py-2 tabular-nums text-muted-foreground">{i + 1}</td>
              <td className="max-w-[140px] truncate px-3 py-2 font-medium">{row.team.name}</td>
              <td className="px-3 py-2 text-center tabular-nums">{row.played}</td>
              <td className="px-3 py-2 text-center tabular-nums font-semibold text-cyan-300">{row.pts}</td>
              <td className="px-3 py-2 text-center tabular-nums">{row.gf - row.ga}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryClasificacion({
  bundle,
  category,
  onOpenBrackets,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  onOpenBrackets: () => void;
}) {
  const groups = bundle.groups.filter((g) => g.category_id === category.id);
  const groupCodes = groups.map((g) => g.code).sort();
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const groupMatches = categoryMatches.filter((m) => m.round_key === 'group');
  const brackets = placementBracketsForCategory(category);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {category.groups_count} grupos · {brackets.length} bandejas de final
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{groupMatches.length} partidos de grupos</Badge>
          <button
            type="button"
            className={cn(BRACKETS_ICON_CLASS)}
            onClick={onOpenBrackets}
            aria-label="Ver cruces eliminatorios"
            title="Ver cruces"
          >
            <GitBranch className="size-[1.125rem]" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groupCodes.map((code) => (
          <GroupStandingsTable key={code} groupCode={code} bundle={bundle} categoryId={category.id} />
        ))}
      </div>
    </div>
  );
}

export function TournamentClasificacionPanel({ bundle, categoryId }: Props) {
  const categories = categoryId
    ? bundle.categories.filter((c) => c.id === categoryId)
    : bundle.categories;
  const [bracketsCategoryId, setBracketsCategoryId] = useState<string | null>(null);

  if (categories.length === 0) {
    return (
      <div className="portal-section-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
        <Trophy className="mx-auto mb-2 size-8 text-primary/50" />
        Genera la competición en Ajustes para ver la clasificación.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-10">
        {categories.map((cat) => (
          <CategoryClasificacion
            key={cat.id}
            bundle={bundle}
            category={cat}
            onOpenBrackets={() => setBracketsCategoryId(cat.id)}
          />
        ))}
      </div>

      <TournamentBracketsSheet
        bundle={bundle}
        categoryId={bracketsCategoryId}
        open={bracketsCategoryId != null}
        onOpenChange={(open) => !open && setBracketsCategoryId(null)}
      />
    </>
  );
}
