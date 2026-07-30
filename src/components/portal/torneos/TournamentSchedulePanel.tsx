'use client';

import { useMemo, useState } from 'react';
import { formatMatchDateTime } from '@/lib/tournament-schedule';
import { groupMatchesByField, groupMatchesByGroupCode } from '@/lib/tournament-schedule-views';
import {
  TournamentScheduleSheet,
  type BucketMeta,
} from '@/components/portal/torneos/TournamentScheduleSheet';
import { TournamentMatchTeams } from '@/components/portal/torneos/TournamentMatchTeams';
import {
  formatMatchScore,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, List, MapPin, Radio } from 'lucide-react';

const PREVIEW_ROWS = 5;

type ViewMode = 'field' | 'group';

type Props = {
  bundle: TournamentBundle;
  categoryId?: string;
};

function MatchTeamsCell({
  bundle,
  match,
}: {
  bundle: TournamentBundle;
  match: TournamentMatch;
}) {
  return (
    <td className="min-w-[10rem] px-2 py-1.5">
      <TournamentMatchTeams
        bundle={bundle}
        homeTeamId={match.home_team_id}
        awayTeamId={match.away_team_id}
        compact
      />
    </td>
  );
}

function ScheduleBucketCard({
  title,
  matches,
  bundle,
  onOpenAll,
}: {
  title: string;
  matches: TournamentMatch[];
  bundle: TournamentBundle;
  onOpenAll: () => void;
}) {
  const preview = matches.slice(0, PREVIEW_ROWS);
  const hidden = matches.length - preview.length;

  return (
    <div className="portal-section-surface flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-border/50 bg-primary/5 px-3 py-2">
        <p className="text-sm font-semibold">{title}</p>
        <Badge variant="outline" className="text-[10px] tabular-nums">
          {matches.length}
        </Badge>
      </div>
      {matches.length === 0 ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">Sin partidos</p>
      ) : (
        <>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-2 py-1.5 w-12">Hora</th>
                <th className="px-2 py-1.5">Partido</th>
                <th className="px-2 py-1.5 w-10 text-center">Res</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((match) => {
                const when = formatMatchDateTime(match.scheduled_at);
                const isLive = match.status === 'live';
                return (
                  <tr
                    key={match.id}
                    className={cn('border-t border-border/25', isLive && 'bg-cyan-400/5')}
                  >
                    <td className="px-2 py-1.5 font-semibold tabular-nums text-cyan-300">{when.time}</td>
                    <MatchTeamsCell bundle={bundle} match={match} />
                    <td className="px-2 py-1.5 text-center tabular-nums">
                      {isLive ? (
                        <Radio className="mx-auto size-3 animate-pulse text-cyan-300" />
                      ) : match.status === 'scheduled' ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="font-semibold">{formatMatchScore(match)}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {hidden > 0 || matches.length > PREVIEW_ROWS ? (
            <div className="border-t border-border/30 p-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-full text-xs text-cyan-300 hover:text-cyan-200"
                onClick={onOpenAll}
              >
                <List className="mr-1.5 size-3.5" />
                {hidden > 0 ? `Ver los ${matches.length} partidos` : 'Ver detalle'}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function CategorySchedule({
  bundle,
  category,
  view,
  onOpenBucket,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  view: ViewMode;
  onOpenBucket: (bucket: BucketMeta) => void;
}) {
  const catMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const fieldGroups = groupMatchesByField(catMatches, bundle.fields);
  const groupBuckets = groupMatchesByGroupCode(catMatches, bundle.groups, bundle);

  const buckets: BucketMeta[] =
    view === 'field'
      ? fieldGroups.map((fg) => ({
          id: `field-${fg.fieldId}-${fg.label}`,
          title: fg.label,
          matches: fg.matches,
        }))
      : groupBuckets.map((gb) => ({
          id: `group-${gb.groupCode}`,
          title: gb.groupName,
          subtitle: `${gb.matches.length} partidos de grupos`,
          matches: gb.matches,
        }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{category.name}</h3>
          <p className="text-sm text-muted-foreground">
            {catMatches.length} partidos · {view === 'field' ? 'Por pista' : 'Por grupo'}
          </p>
        </div>
        <Badge variant="outline">{catMatches.filter((m) => m.scheduled_at).length} programados</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {buckets.map((bucket) => (
          <ScheduleBucketCard
            key={bucket.id}
            title={bucket.title}
            matches={bucket.matches}
            bundle={bundle}
            onOpenAll={() => onOpenBucket(bucket)}
          />
        ))}
      </div>
    </div>
  );
}

const viewTabs: { id: ViewMode; label: string; icon: typeof MapPin }[] = [
  { id: 'field', label: 'Por campo', icon: MapPin },
  { id: 'group', label: 'Por grupo', icon: CalendarClock },
];

export function TournamentSchedulePanel({ bundle, categoryId }: Props) {
  const [view, setView] = useState<ViewMode>('field');
  const [sheetBucket, setSheetBucket] = useState<BucketMeta | null>(null);

  const categories = categoryId
    ? bundle.categories.filter((c) => c.id === categoryId)
    : bundle.categories;

  const allMatches = useMemo(() => {
    const ids = new Set(categories.map((c) => c.id));
    return bundle.matches.filter((m) => ids.has(m.category_id));
  }, [bundle.matches, categories]);

  const liveCount = allMatches.filter((m) => m.status === 'live').length;
  const scheduledCount = allMatches.filter((m) => m.scheduled_at).length;

  if (categories.length === 0 || allMatches.length === 0) {
    return (
      <div className="portal-section-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
        <CalendarClock className="mx-auto mb-2 size-8 text-primary/50" />
        Genera la competición en Ajustes y calcula horarios para ver el calendario.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="portal-section-surface rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partidos</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{allMatches.length}</p>
          </div>
          <div className="portal-section-surface rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Programados</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-primary">{scheduledCount}</p>
          </div>
          <div className="portal-section-surface rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">En vivo</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-cyan-300">{liveCount}</p>
          </div>
        </div>

        <div className="flex gap-1 rounded-lg border border-border/50 p-1 sm:max-w-xs">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                view === tab.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {categories.map((cat) => (
            <CategorySchedule
              key={cat.id}
              bundle={bundle}
              category={cat}
              view={view}
              onOpenBucket={setSheetBucket}
            />
          ))}
        </div>
      </div>

      <TournamentScheduleSheet
        bundle={bundle}
        bucket={sheetBucket}
        open={sheetBucket != null}
        onOpenChange={(open) => !open && setSheetBucket(null)}
      />
    </>
  );
}
