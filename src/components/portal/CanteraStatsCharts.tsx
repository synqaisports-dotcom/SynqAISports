'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CanteraRecentMovements } from '@/components/portal/CanteraRecentMovements';
import type { CanteraMovement } from '@/lib/cantera-movements';
import type { CanteraStats } from '@/lib/cantera-stats';
import { cn } from '@/lib/utils';

const COLOR_ACTIVE = 'hsl(183, 100%, 50%)';
const COLOR_INACTIVE = 'hsl(205, 20%, 42%)';
const COLOR_INJURED = 'hsl(38, 92%, 55%)';
const COLOR_ABSENCE = 'hsl(38, 92%, 55%)';

type Props = {
  stats: CanteraStats;
  movements: CanteraMovement[];
  className?: string;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-primary/25 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p style={{ color: entry.payload.fill }}>
        {entry.name}: <span className="font-semibold">{entry.value}</span>
      </p>
    </div>
  );
}

function ChartPanel({
  title,
  chartHeightClass,
  children,
  legend,
  className,
}: {
  title: string;
  chartHeightClass: string;
  children: ReactNode;
  legend?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('portal-section-surface rounded-xl p-4', className)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{title}</p>
      <div className={cn('mt-3 w-full', chartHeightClass)}>{children}</div>
      {legend ? <div className="mt-2">{legend}</div> : null}
    </div>
  );
}

function EmptyChartMessage({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full items-center justify-center text-sm text-muted-foreground',
        className
      )}
    >
      Sin datos para mostrar
    </div>
  );
}

function ChartLegend({ items }: { items: { name: string; value: number; fill: string }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.name} className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
          {item.name}: {item.value}
        </span>
      ))}
    </div>
  );
}

export function CanteraStatsCharts({ stats, movements, className }: Props) {
  const playerAvailability = [
    { name: 'Activos', value: stats.activePlayers, fill: COLOR_ACTIVE },
    { name: 'Inactivos', value: stats.inactivePlayers, fill: COLOR_INACTIVE },
  ].filter((item) => item.value > 0);

  const teamStatus = [
    { name: 'Activos', value: stats.activeTeams, fill: COLOR_ACTIVE },
    { name: 'Inactivos', value: stats.inactiveTeams, fill: COLOR_INACTIVE },
  ].filter((item) => item.value > 0);

  const playerStatusChart = [
    { name: 'Disponibles', value: Math.max(0, stats.activePlayers - stats.injuredPlayers), fill: COLOR_ACTIVE },
    { name: 'Inactivos', value: stats.inactivePlayers, fill: COLOR_INACTIVE },
    { name: 'Lesionados', value: stats.injuredPlayers, fill: COLOR_INJURED },
  ].filter((item) => item.value > 0);

  const weeklyAbsences = stats.weeklyAbsences.map((day) => ({
    name: day.label,
    value: day.confirmed,
    fill: COLOR_ABSENCE,
  }));

  return (
    <section className={cn('grid gap-4 lg:grid-cols-3', className)}>
      <div className="flex flex-col gap-4">
        <ChartPanel
          title="Total de jugadores · activos vs inactivos"
          chartHeightClass="h-48"
          legend={<ChartLegend items={playerAvailability} />}
        >
          {playerAvailability.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={playerAvailability}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {playerAvailability.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartPanel>

        <ChartPanel
          title="Ausencias confirmadas · semana"
          chartHeightClass="h-40"
          legend={
            <p className="text-center text-xs text-muted-foreground">
              Total confirmadas:{' '}
              <span className="font-semibold text-foreground">{stats.weeklyConfirmedAbsences}</span>
            </p>
          }
        >
          {weeklyAbsences.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAbsences} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={14}>
                  {weeklyAbsences.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartPanel>
      </div>

      <div className="flex flex-col gap-4">
        <ChartPanel
          title="Equipos · activos vs inactivos"
          chartHeightClass="h-40"
          legend={<ChartLegend items={teamStatus} />}
        >
          {teamStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={58}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {teamStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartPanel>

        <ChartPanel title="Jugadores · activos, inactivos y lesionados" chartHeightClass="h-40">
          {playerStatusChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={playerStatusChart} layout="vertical" margin={{ left: 4, right: 12 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                  {playerStatusChart.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartMessage />
          )}
        </ChartPanel>
      </div>

      <CanteraRecentMovements movements={movements} variant="panel" limit={5} className="h-full" />
    </section>
  );
}
