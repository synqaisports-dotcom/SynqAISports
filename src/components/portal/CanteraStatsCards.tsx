import {
  Activity,
  Bandage,
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
    format: (stats: CanteraStats) => String(stats.totalTeams),
  },
  {
    key: 'totalPlayers',
    label: 'Total de jugadores',
    icon: UsersRound,
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
] as const;

export function CanteraStatsCards({ stats, className }: Props) {
  return (
    <section className={cn('portal-section-surface rounded-xl p-4 md:p-5', className)}>
      <div className="mb-4">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Resumen de cantera
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Indicadores del club
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, format }) => (
          <div
            key={key}
            className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3.5 transition-colors hover:border-primary/35 hover:bg-primary/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold tabular-nums text-primary">
                  {format(stats)}
                </p>
              </div>
              <Icon className="size-5 shrink-0 text-primary/80" strokeWidth={1.75} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
