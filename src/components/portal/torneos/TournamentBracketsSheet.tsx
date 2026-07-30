'use client';

import Link from 'next/link';
import { matchesByBracket } from '@/lib/tournament-brackets';
import { formatMatchDateTime, roundLabelWithBracket } from '@/lib/tournament-schedule';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import {
  formatMatchScore,
  placementBracketsForCategory,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ExternalLink, GitBranch, Radio } from 'lucide-react';
import { mesaUrl } from '@/lib/tournament-urls';

function BracketMatchNode({
  match,
  bundle,
  bracketName,
}: {
  match: TournamentMatch;
  bundle: TournamentBundle;
  bracketName: string;
}) {
  const home = bundle.teams.find((t) => t.id === match.home_team_id)?.name ?? 'Por determinar';
  const away = bundle.teams.find((t) => t.id === match.away_team_id)?.name ?? 'Por determinar';
  const when = formatMatchDateTime(match.scheduled_at);
  const isLive = match.status === 'live';

  return (
    <div
      className={cn(
        'relative min-w-[200px] rounded-xl border border-border/70 bg-background/40 p-3 text-sm',
        isLive && 'border-cyan-400/50 bg-cyan-400/5'
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {roundLabelWithBracket(match.round_key, bracketName)}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{when.full}</p>
      <div className="mt-2 space-y-1">
        <p className="truncate font-medium">{home}</p>
        <p className="truncate font-medium">{away}</p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-lg font-bold tabular-nums text-primary">
          {match.status === 'scheduled' ? '—' : formatMatchScore(match)}
        </span>
        {isLive ? <Radio className="size-4 animate-pulse text-cyan-300" /> : null}
        {match.mesa_token ? (
          <Link href={mesaUrl(match.mesa_token)} target="_blank" className="text-cyan-300">
            <ExternalLink className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function BracketTree({
  bracketName,
  matches,
  bundle,
}: {
  bracketName: string;
  matches: TournamentMatch[];
  bundle: TournamentBundle;
}) {
  const rounds = ['qf', 'r16', 'sf', 'final', 'third_place', 'consolation_final'] as const;
  const byRound = rounds
    .map((r) => ({ round: r, matches: matches.filter((m) => m.round_key === r) }))
    .filter((x) => x.matches.length > 0);

  if (byRound.length === 0) {
    return (
      <div className="space-y-2">
        {matches.map((m) => (
          <BracketMatchNode key={m.id} match={m} bundle={bundle} bracketName={bracketName} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-stretch gap-4">
        {byRound.map(({ round, matches: roundMatches }) => (
          <div key={round} className="flex w-52 flex-col gap-3">
            <p className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {roundLabelWithBracket(round, bracketName)}
            </p>
            {roundMatches.map((m) => (
              <BracketMatchNode key={m.id} match={m} bundle={bundle} bracketName={bracketName} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBrackets({ bundle, category }: { bundle: TournamentBundle; category: TournamentCategory }) {
  const brackets = placementBracketsForCategory(category);
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);

  return (
    <div className="space-y-4">
      {brackets.map((bracket) => (
        <div key={bracket.bracket_key} className="portal-section-surface rounded-xl p-4">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="size-3 rounded-full ring-2 ring-white/10"
              style={{ backgroundColor: bracket.color ?? '#94a3b8' }}
            />
            <div>
              <p className="font-semibold" style={{ color: bracket.color ?? undefined }}>
                {bracket.name}
              </p>
              <p className="text-xs text-muted-foreground">Puesto {bracket.position} en grupo</p>
            </div>
          </div>
          <BracketTree
            bracketName={bracket.name}
            matches={matchesByBracket(categoryMatches, bracket.bracket_key)}
            bundle={bundle}
          />
        </div>
      ))}
    </div>
  );
}

type Props = {
  bundle: TournamentBundle;
  categoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TournamentBracketsSheet({ bundle, categoryId, open, onOpenChange }: Props) {
  const category = bundle.categories.find((c) => c.id === categoryId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="xl">
        <PortalSheetHeader>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="size-5 text-cyan-300" />
              Cruces — {category?.name ?? 'Torneo'}
            </SheetTitle>
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody>
          {category ? <CategoryBrackets bundle={bundle} category={category} /> : null}
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
