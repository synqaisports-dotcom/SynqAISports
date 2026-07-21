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
import type { CanteraStats } from '@/lib/cantera-stats';
import { cn } from '@/lib/utils';

const COLOR_ACTIVE = 'hsl(183, 100%, 50%)';
const COLOR_INACTIVE = 'hsl(205, 20%, 42%)';
const COLOR_INJURED = 'hsl(38, 92%, 55%)';

type Props = {
  stats: CanteraStats;
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

export function CanteraStatsCharts({ stats, className }: Props) {
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

  return (
    <section className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <ChartPanel
        title="Total de jugadores · activos vs inactivos"
        chartHeightClass="h-56"
        legend={
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            {playerAvailability.map((item) => (
              <span key={item.name} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                {item.name}: {item.value}
              </span>
            ))}
          </div>
        }
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
                innerRadius={58}
                outerRadius={88}
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

      <div className="grid gap-4">
        <ChartPanel
          title="Equipos · activos vs inactivos"
          chartHeightClass="h-40"
          legend={
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {teamStatus.map((item) => (
                <span key={item.name} className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}: {item.value}
                </span>
              ))}
            </div>
          }
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
                  innerRadius={42}
                  outerRadius={68}
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
                  width={88}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
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
    </section>
  );
}
