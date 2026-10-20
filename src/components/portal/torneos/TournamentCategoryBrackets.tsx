'use client';

import { useMemo, useState } from 'react';
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

type BracketTab = {
  bracketKey: string;
  name: string;
  color?: string;
  positionLabel: string;
  matchCount: number;
  liveCount: number;
};

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
  showMesaLinks = true,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  bracketKey: string;
  bracketName: string;
  color?: string;
  positionLabel: string;
  showSchedule?: boolean;
  showMesaLinks?: boolean;
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
          showMesaLinks={showMesaLinks}
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
  showMesaLinks = true,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  showSchedule?: boolean;
  showMesaLinks?: boolean;
}) {
  const brackets = placementBracketsForCategory(category);
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const hasConsolation = categoryMatches.some((m) => m.bracket_key === 'consolation');

  const bracketTabs = useMemo<BracketTab[]>(() => {
    const tabs: BracketTab[] = brackets.map((bracket) => {
      const matches = matchesByBracket(categoryMatches, bracket.bracket_key);
      return {
        bracketKey: bracket.bracket_key,
        name: bracket.name,
        color: bracket.color,
        positionLabel: `${bracket.position}º en cada grupo`,
        matchCount: matches.length,
        liveCount: matches.filter((m) => m.status === 'live').length,
      };
    });

    if (hasConsolation) {
      const matches = matchesByBracket(categoryMatches, CONSOLATION_BRACKET.bracket_key);
      tabs.push({
        bracketKey: CONSOLATION_BRACKET.bracket_key,
        name: CONSOLATION_BRACKET.name,
        color: CONSOLATION_BRACKET.color,
        positionLabel: 'Últimos puestos / bandeja inferior',
        matchCount: matches.length,
        liveCount: matches.filter((m) => m.status === 'live').length,
      });
    }

    return tabs;
  }, [brackets, categoryMatches, hasConsolation]);

  const [activeBracketKey, setActiveBracketKey] = useState(() => bracketTabs[0]?.bracketKey ?? '');

  const activeTab =
    bracketTabs.find((tab) => tab.bracketKey === activeBracketKey) ?? bracketTabs[0] ?? null;

  if (bracketTabs.length === 0) {
    return (
      <div className="portal-section-surface rounded-xl p-6 text-center text-sm text-muted-foreground">
        Aún no hay cuadros eliminatorios para esta categoría.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 rounded-lg border border-border/50 p-1">
          {bracketTabs.map((tab) => {
            const active = tab.bracketKey === activeTab?.bracketKey;
            return (
              <button
                key={tab.bracketKey}
                type="button"
                onClick={() => setActiveBracketKey(tab.bracketKey)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
                aria-pressed={active}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full ring-1 ring-white/10"
                  style={{ backgroundColor: tab.color ?? '#94a3b8' }}
                />
                <span className="font-medium">{tab.name}</span>
                {tab.liveCount > 0 ? (
                  <Radio className="size-3 animate-pulse text-cyan-300" />
                ) : (
                  <span className="text-[10px] tabular-nums text-muted-foreground">{tab.matchCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab ? (
        <PlacementBracketPhase
          bundle={bundle}
          category={category}
          bracketKey={activeTab.bracketKey}
          bracketName={activeTab.name}
          color={activeTab.color}
          positionLabel={activeTab.positionLabel}
          showSchedule={showSchedule}
          showMesaLinks={showMesaLinks}
        />
      ) : null}
    </div>
  );
}
