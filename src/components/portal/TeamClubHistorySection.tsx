import { History, Pause, Play, RefreshCw, TrendingUp, Users } from 'lucide-react';
import {
  formatTeamHistoryWhen,
  type TeamClubHistoryEvent,
  type TeamClubHistoryKind,
} from '@/lib/team-club-history';
import { cn } from '@/lib/utils';

const KIND_ICON: Record<TeamClubHistoryKind, typeof History> = {
  season_promotion: TrendingUp,
  letter_change: RefreshCw,
  category_bulk: TrendingUp,
  roster_merge: Users,
  paused: Pause,
  reactivated: Play,
};

type Props = {
  events: TeamClubHistoryEvent[];
};

export function TeamClubHistorySection({ events }: Props) {
  return (
    <section className="rounded-xl border border-primary/15 bg-muted/5 p-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Histórico del equipo
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cierres de temporada, ascensos y fusiones registrados en el club.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Aún no hay eventos registrados.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {events.map((event) => (
            <HistoryRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryRow({ event }: { event: TeamClubHistoryEvent }) {
  const Icon = KIND_ICON[event.kind] ?? History;

  return (
    <li className="flex items-start gap-3 rounded-lg border border-primary/10 bg-background/40 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{event.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
        {event.seasonLabel ? (
          <p className="mt-1 text-[10px] uppercase tracking-wide text-primary/80">
            Temporada {event.seasonLabel}
          </p>
        ) : null}
      </div>
      <time
        dateTime={event.occurredAt}
        className={cn('shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground')}
      >
        {formatTeamHistoryWhen(event.occurredAt)}
      </time>
    </li>
  );
}
