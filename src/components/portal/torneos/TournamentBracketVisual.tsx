'use client';

import Link from 'next/link';
import { ROUND_KEY_LABELS } from '@/lib/tournaments';
import { formatMatchScore, type TournamentBundle, type TournamentMatch, type RoundKey } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { ExternalLink, Radio } from 'lucide-react';
import { mesaUrl } from '@/lib/tournament-urls';

const MAIN_ROUNDS: RoundKey[] = ['r16', 'qf', 'sf', 'final'];
const SLOT_HEIGHT = 76;

function teamName(bundle: TournamentBundle, id: string | null) {
  if (!id) return 'Por determinar';
  return bundle.teams.find((t) => t.id === id)?.name ?? '—';
}

function MatchSlot({
  match,
  bundle,
  accentColor,
}: {
  match: TournamentMatch;
  bundle: TournamentBundle;
  accentColor?: string;
}) {
  const isLive = match.status === 'live';
  const home = teamName(bundle, match.home_team_id);
  const away = teamName(bundle, match.away_team_id);
  const homeWins =
    match.status === 'finished' &&
    (match.score_home > match.score_away ||
      (match.went_to_penalties && (match.score_penalties_home ?? 0) > (match.score_penalties_away ?? 0)));
  const awayWins =
    match.status === 'finished' &&
    (match.score_away > match.score_home ||
      (match.went_to_penalties && (match.score_penalties_away ?? 0) > (match.score_penalties_home ?? 0)));

  return (
    <div
      className={cn(
        'relative w-[11.5rem] shrink-0 overflow-hidden rounded-lg border border-border/70 bg-background/50 text-xs shadow-sm',
        isLive && 'border-cyan-400/50 shadow-[0_0_16px_hsl(183_100%_50%_/_0.12)]'
      )}
      style={{ borderTopColor: accentColor ? `${accentColor}88` : undefined, borderTopWidth: accentColor ? 2 : undefined }}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-1 border-b border-border/40 px-2 py-1.5',
          homeWins && 'bg-primary/10'
        )}
      >
        <span className="min-w-0 flex-1 truncate font-medium">{home}</span>
        <span className="shrink-0 tabular-nums font-semibold text-primary">
          {match.status === 'scheduled' ? '' : match.score_home}
        </span>
      </div>
      <div className={cn('flex items-center justify-between gap-1 px-2 py-1.5', awayWins && 'bg-primary/10')}>
        <span className="min-w-0 flex-1 truncate font-medium">{away}</span>
        <span className="shrink-0 tabular-nums font-semibold text-primary">
          {match.status === 'scheduled' ? '' : match.score_away}
        </span>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 bg-background/30 px-2 py-0.5 text-[9px] text-muted-foreground">
        <span>#{match.match_number}</span>
        <div className="flex items-center gap-1">
          {isLive ? <Radio className="size-3 animate-pulse text-cyan-300" /> : null}
          {match.status === 'finished' && match.went_to_penalties ? (
            <span className="text-[8px]">pen.</span>
          ) : null}
          {match.mesa_token ? (
            <Link href={mesaUrl(match.mesa_token)} target="_blank" className="text-cyan-300 hover:text-cyan-200">
              <ExternalLink className="size-3" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RoundColumn({
  round,
  matches,
  bundle,
  leafCount,
  accentColor,
  showConnector,
}: {
  round: RoundKey;
  matches: TournamentMatch[];
  bundle: TournamentBundle;
  leafCount: number;
  accentColor?: string;
  showConnector: boolean;
}) {
  const columnHeight = leafCount * SLOT_HEIGHT;

  return (
    <div className="relative flex shrink-0 flex-col" style={{ minHeight: columnHeight }}>
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {ROUND_KEY_LABELS[round]}
      </p>
      <div className="relative flex flex-1 flex-col justify-evenly">
        {matches.map((match) => (
          <div key={match.id} className="relative flex items-center">
            {showConnector ? (
              <>
                <div className="absolute -left-4 top-1/2 h-px w-4 bg-cyan-400/35" />
                <div className="absolute -left-4 top-1/2 h-[calc(50%+1px)] w-px -translate-y-full bg-cyan-400/25 last:hidden" />
              </>
            ) : null}
            <MatchSlot match={match} bundle={bundle} accentColor={accentColor} />
            {showConnector ? (
              <div className="absolute -right-4 top-1/2 h-px w-4 bg-cyan-400/35" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

type Props = {
  matches: TournamentMatch[];
  bundle: TournamentBundle;
  bracketName: string;
  accentColor?: string;
};

export function TournamentBracketVisual({ matches, bundle, bracketName, accentColor }: Props) {
  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin partidos en esta fase.</p>;
  }

  const mainRoundData = MAIN_ROUNDS.map((round) => ({
    round,
    matches: matches.filter((m) => m.round_key === round),
  })).filter((x) => x.matches.length > 0);

  const thirdPlace = matches.filter((m) => m.round_key === 'third_place');
  const consolationFinal = matches.filter((m) => m.round_key === 'consolation_final');
  const leafCount = Math.max(mainRoundData[0]?.matches.length ?? 1, 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch gap-8 px-2">
          {mainRoundData.map(({ round, matches: roundMatches }, idx) => (
            <RoundColumn
              key={round}
              round={round}
              matches={roundMatches}
              bundle={bundle}
              leafCount={leafCount}
              accentColor={accentColor}
              showConnector={idx > 0}
            />
          ))}
        </div>
      </div>

      {(thirdPlace.length > 0 || consolationFinal.length > 0) && (
        <div className="flex flex-wrap gap-6 border-t border-border/40 pt-4">
          {thirdPlace.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {bracketName} · 3.er puesto
              </p>
              <MatchSlot match={thirdPlace[0]!} bundle={bundle} accentColor={accentColor} />
            </div>
          ) : null}
          {consolationFinal.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Final consolación
              </p>
              <MatchSlot match={consolationFinal[0]!} bundle={bundle} accentColor={accentColor} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
