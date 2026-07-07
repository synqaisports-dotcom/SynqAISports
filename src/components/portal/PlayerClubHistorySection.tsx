import { History, Pause, RefreshCw, Shield, UserPlus, Users } from 'lucide-react';
import {
  buildPlayerClubHistory,
  formatPlayerHistoryWhen,
  type PlayerClubHistoryEvent,
  type PlayerClubHistoryKind,
} from '@/lib/player-club-history';
import type { PlayerProfile } from '@/lib/player-profile';
import { cn } from '@/lib/utils';

const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

const KIND_ICON: Record<PlayerClubHistoryKind, typeof History> = {
  joined: UserPlus,
  team_change: Users,
  category_change: RefreshCw,
  paused: Pause,
  reactivated: RefreshCw,
  medical: Shield,
};

type Props = {
  player: PlayerProfile;
};

export function PlayerClubHistorySection({ player }: Props) {
  const events = buildPlayerClubHistory(player);

  return (
    <section className={`${sectionClass} space-y-3`}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Histórico en el club
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Trayectoria y movimientos del jugador en la cantera.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay eventos registrados.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <HistoryRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}

function HistoryRow({ event }: { event: PlayerClubHistoryEvent }) {
  const Icon = KIND_ICON[event.kind] ?? History;

  return (
    <li className="flex items-start gap-3 rounded-lg border border-primary/10 bg-background/40 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{event.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{event.detail}</p>
      </div>
      <time
        dateTime={event.occurredAt}
        className={cn('shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground')}
      >
        {formatPlayerHistoryWhen(event.occurredAt)}
      </time>
    </li>
  );
}
