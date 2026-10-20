import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Bandage,
  CalendarClock,
  CalendarX,
  Layers,
  PauseCircle,
  Users,
  UsersRound,
} from 'lucide-react';
import { formatCanteraAverage, type CanteraStats } from '@/lib/cantera-stats';
import { cn } from '@/lib/utils';

type Props = {
  stats: CanteraStats;
  className?: string;
};

const cards = [
  {
    key: 'totalTeams',
    label: 'Total de equipos',
    icon: Layers,
    href: '/portal/cantera/equipos',
    format: (stats: CanteraStats) => String(stats.totalTeams),
  },
  {
    key: 'totalPlayers',
    label: 'Total de jugadores',
    icon: UsersRound,
    href: '/portal/cantera/jugadores',
    format: (stats: CanteraStats) => String(stats.totalPlayers),
  },
  {
    key: 'avgPlayersPerTeam',
    label: 'Media de jugadores por equipo',
    icon: Users,
    format: (stats: CanteraStats) => formatCanteraAverage(stats.avgPlayersPerTeam),
  },
  {
    key: 'injuredPlayers',
    label: 'Jugadores lesionados',
    icon: Bandage,
    format: (stats: CanteraStats) => String(stats.injuredPlayers),
  },
  {
    key: 'activePlayers',
    label: 'Jugadores activos',
    icon: Activity,
    format: (stats: CanteraStats) => String(stats.activePlayers),
  },
  {
    key: 'inactivePlayers',
    label: 'Jugadores inactivos',
    icon: PauseCircle,
    format: (stats: CanteraStats) => String(stats.inactivePlayers),
  },
  {
    key: 'weeklyConfirmedAbsences',
    label: 'Ausencias confirmadas',
    icon: CalendarX,
    format: (stats: CanteraStats) => String(stats.weeklyConfirmedAbsences),
  },
  {
    key: 'totalSchedules',
    label: 'Total de horarios',
    icon: CalendarClock,
    href: '/portal/cantera/horarios',
    format: (stats: CanteraStats) => String(stats.totalSchedules),
  },
] as const;

const cardSurfaceClass =
  'portal-section-surface rounded-xl px-4 py-3.5 transition-colors hover:border-primary/40';

const linkedCardClass =
  'group block cursor-pointer hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export function CanteraStatsCards({ stats, className }: Props) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {cards.map(({ key, label, icon: Icon, format, ...rest }) => {
        const href = 'href' in rest ? rest.href : undefined;
        const content = (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-primary">
                {format(stats)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {href ? (
                <ArrowRight
                  className="size-3.5 text-primary/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : null}
              <Icon className="size-5 text-primary/80" strokeWidth={1.75} aria-hidden />
            </div>
          </div>
        );

        if (href) {
          return (
            <Link
              key={key}
              href={href}
              className={cn(cardSurfaceClass, linkedCardClass)}
              aria-label={`${label}: ${format(stats)}. Ir a la sección`}
            >
              {content}
            </Link>
          );
        }

        return (
          <div key={key} className={cardSurfaceClass}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
