import Link from 'next/link';
import {
  fieldLabel,
  formatMatchDateTime,
  groupMatchesByDay,
  roundLabelWithBracket,
} from '@/lib/tournament-schedule';
import {
  formatMatchScore,
  MATCH_STATUS_LABELS,
  type TournamentBundle,
  type TournamentCategory,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, ExternalLink, MapPin, Radio } from 'lucide-react';
import { mesaUrl } from '@/lib/tournament-urls';

type Props = {
  bundle: TournamentBundle;
  categoryId?: string;
};

function teamName(bundle: TournamentBundle, id: string | null) {
  if (!id) return 'Por determinar';
  return bundle.teams.find((t) => t.id === id)?.name ?? '—';
}

function bracketNameForMatch(bundle: TournamentBundle, match: TournamentMatch): string | undefined {
  if (!match.bracket_key || match.bracket_key === 'groups') return undefined;
  for (const cat of bundle.categories) {
    const b = cat.placement_brackets_json.find((x) => x.bracket_key === match.bracket_key);
    if (b) return b.name;
  }
  if (match.bracket_key === 'consolation') return 'Consolación';
  return undefined;
}

function ScheduleMatchCard({ match, bundle, category }: { match: TournamentMatch; bundle: TournamentBundle; category?: TournamentCategory }) {
  const when = formatMatchDateTime(match.scheduled_at);
  const isLive = match.status === 'live';
  const bracket = bracketNameForMatch(bundle, match);

  return (
    <div
      className={cn(
        'grid gap-3 rounded-xl border border-border/60 p-3 transition-colors sm:grid-cols-[auto_1fr_auto]',
        isLive && 'border-cyan-400/40 bg-cyan-400/5 shadow-[0_0_24px_hsl(183_100%_50%_/_0.08)]'
      )}
    >
      <div className="flex min-w-[4.5rem] flex-col items-center justify-center rounded-lg bg-background/40 px-2 py-1.5 text-center">
        <span className="text-lg font-bold tabular-nums text-cyan-300">{when.time}</span>
        {category ? (
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{category.name}</span>
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            {roundLabelWithBracket(match.round_key, bracket)}
          </Badge>
          {isLive ? (
            <Badge className="gap-1 border-cyan-400/30 bg-cyan-400/10 text-[10px] text-cyan-300">
              <Radio className="size-3 animate-pulse" />
              EN VIVO
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">{MATCH_STATUS_LABELS[match.status]}</span>
          )}
        </div>
        <p className="mt-1.5 font-medium leading-snug">
          {teamName(bundle, match.home_team_id)}{' '}
          <span className="font-normal text-muted-foreground">vs</span> {teamName(bundle, match.away_team_id)}
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          {fieldLabel(
            bundle.fields,
            match.field_id,
            (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-center">
        <span className="text-xl font-bold tabular-nums text-primary">
          {match.status === 'scheduled' ? '—' : formatMatchScore(match)}
        </span>
        {match.mesa_token ? (
          <Link
            href={mesaUrl(match.mesa_token)}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline"
          >
            Mesa <ExternalLink className="size-3" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function TournamentSchedulePanel({ bundle, categoryId }: Props) {
  const categories = categoryId
    ? bundle.categories.filter((c) => c.id === categoryId)
    : bundle.categories;

  const categoryIds = new Set(categories.map((c) => c.id));
  const matches = bundle.matches.filter((m) => categoryIds.has(m.category_id));
  const days = groupMatchesByDay(matches);

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const scheduledCount = matches.filter((m) => m.scheduled_at).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="portal-section-surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Partidos</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{matches.length}</p>
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

      {days.length === 0 ? (
        <div className="portal-section-surface rounded-xl p-8 text-center text-sm text-muted-foreground">
          <CalendarClock className="mx-auto mb-2 size-8 text-primary/50" />
          Genera la competición en Configuración para ver el calendario.
        </div>
      ) : (
        days.map((day) => (
          <section key={day.dateKey} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium capitalize">
              <CalendarClock className="size-4 text-cyan-300" />
              {day.label}
              <span className="text-muted-foreground">({day.matches.length})</span>
            </h3>
            <div className="space-y-2">
              {day.matches.map((match) => {
                const cat = bundle.categories.find((c) => c.id === match.category_id);
                return (
                  <ScheduleMatchCard key={match.id} match={match} bundle={bundle} category={cat} />
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
