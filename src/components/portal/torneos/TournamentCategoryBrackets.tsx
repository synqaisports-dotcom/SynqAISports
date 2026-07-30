'use client';

import { matchesByBracket } from '@/lib/tournament-brackets';
import { fieldLabel, formatMatchDateTime, roundLabelWithBracket } from '@/lib/tournament-schedule';
import { TournamentBracketVisual } from '@/components/portal/torneos/TournamentBracketVisual';
import { TournamentMatchTeams } from '@/components/portal/torneos/TournamentMatchTeams';
import {
  CONSOLATION_BRACKET,
  formatMatchScore,
  placementBracketsForCategory,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { CalendarClock, MapPin, Radio } from 'lucide-react';

function BracketScheduleTable({
  matches,
  bundle,
  bracketName,
}: {
  matches: TournamentMatch[];
  bundle: TournamentBundle;
  bracketName: string;
}) {
  const sorted = [...matches].sort((a, b) => {
    if (!a.scheduled_at) return 1;
    if (!b.scheduled_at) return -1;
    return a.scheduled_at.localeCompare(b.scheduled_at);
  });

  if (sorted.length === 0) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border/40">
      <div className="flex items-center gap-2 border-b border-border/40 bg-background/30 px-3 py-2 text-xs text-muted-foreground">
        <CalendarClock className="size-3.5 text-cyan-300" />
        Horarios de {bracketName}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 w-16">Hora</th>
            <th className="px-3 py-2">Partido</th>
            <th className="px-3 py-2 hidden sm:table-cell">Pista</th>
            <th className="px-3 py-2 w-14 text-center">Res</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((match) => {
            const when = formatMatchDateTime(match.scheduled_at);
            const isLive = match.status === 'live';
            return (
              <tr key={match.id} className={cn('border-t border-border/25', isLive && 'bg-cyan-400/5')}>
                <td className="px-3 py-2 font-semibold tabular-nums text-cyan-300">
                  {match.scheduled_at ? when.time : '—'}
                </td>
                <td className="px-3 py-2">
                  <TournamentMatchTeams
                    bundle={bundle}
                    homeTeamId={match.home_team_id}
                    awayTeamId={match.away_team_id}
                    compact
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground sm:hidden">
                    {fieldLabel(
                      bundle.fields,
                      match.field_id,
                      (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key
                    )}
                  </p>
                </td>
                <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" />
                    {fieldLabel(
                      bundle.fields,
                      match.field_id,
                      (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key
                    )}
                  </span>
                </td>
                <td className="px-3 py-2 text-center tabular-nums font-semibold">
                  {isLive ? (
                    <Radio className="mx-auto size-3.5 animate-pulse text-cyan-300" />
                  ) : match.status === 'scheduled' ? (
                    '—'
                  ) : (
                    formatMatchScore(match)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlacementBracketPhase({
  bundle,
  category,
  bracketKey,
  bracketName,
  color,
  positionLabel,
  showSchedule,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  bracketKey: string;
  bracketName: string;
  color?: string;
  positionLabel: string;
  showSchedule?: boolean;
}) {
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const bracketMatches = matchesByBracket(categoryMatches, bracketKey);

  return (
    <section className="portal-section-surface rounded-xl p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className="size-4 shrink-0 rounded-full ring-2 ring-white/10"
          style={{ backgroundColor: color ?? '#94a3b8' }}
        />
        <div>
          <h4 className="text-base font-semibold" style={{ color: color ?? undefined }}>
            {bracketName}
          </h4>
          <p className="text-xs text-muted-foreground">
            {positionLabel} · {bracketMatches.length} partidos ·{' '}
            {roundLabelWithBracket(bracketMatches[0]?.round_key ?? 'qf', bracketName)}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TournamentBracketVisual
          matches={bracketMatches}
          bundle={bundle}
          bracketName={bracketName}
          accentColor={color}
        />
      </div>
      {showSchedule ? (
        <BracketScheduleTable matches={bracketMatches} bundle={bundle} bracketName={bracketName} />
      ) : null}
    </section>
  );
}

export function TournamentCategoryBrackets({
  bundle,
  category,
  showSchedule = false,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  showSchedule?: boolean;
}) {
  const brackets = placementBracketsForCategory(category);
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const hasConsolation = categoryMatches.some((m) => m.bracket_key === 'consolation');

  return (
    <div className="space-y-6">
      {brackets.map((bracket) => (
        <PlacementBracketPhase
          key={bracket.bracket_key}
          bundle={bundle}
          category={category}
          bracketKey={bracket.bracket_key}
          bracketName={bracket.name}
          color={bracket.color}
          positionLabel={`${bracket.position}º en cada grupo`}
          showSchedule={showSchedule}
        />
      ))}

      {hasConsolation ? (
        <PlacementBracketPhase
          bundle={bundle}
          category={category}
          bracketKey={CONSOLATION_BRACKET.bracket_key}
          bracketName={CONSOLATION_BRACKET.name}
          color={CONSOLATION_BRACKET.color}
          positionLabel="Últimos puestos / bandeja inferior"
          showSchedule={showSchedule}
        />
      ) : null}
    </div>
  );
}
