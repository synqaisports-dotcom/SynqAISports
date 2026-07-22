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
import {
  SYNQ_CHART_ACTIVE_BAR,
  SYNQ_CHART_CURSOR,
  SynqChartTooltip,
  renderSynqPieActiveShape,
} from '@/components/portal/SynqChartPrimitives';
import type { CanteraMovement } from '@/lib/cantera-movements';
import type { CanteraStats } from '@/lib/cantera-stats';
import { cn } from '@/lib/utils';

const COLOR_ACTIVE = 'hsl(183, 100%, 50%)';
const COLOR_INACTIVE = 'hsl(205, 20%, 42%)';
const COLOR_INJURED = 'hsl(38, 92%, 55%)';
const COLOR_ABSENCE = 'hsl(38, 92%, 55%)';

const DONUT_INNER = '52%';
const DONUT_OUTER = '78%';

type Props = {
  stats: CanteraStats;
  movements: CanteraMovement[];
  className?: string;
};

function ChartPanel({
  title,
  children,
  legend,
  className,
}: {
  title: string;
  children: ReactNode;
  legend?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('portal-section-surface flex h-full min-h-0 flex-col rounded-xl p-4', className)}>
      <p className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-primary">{title}</p>
      <div className="mt-3 min-h-[10.5rem] flex-1">{children}</div>
      <div className="mt-2 min-h-[1.375rem] shrink-0">{legend}</div>
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

function DonutChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  if (data.length === 0) return <EmptyChartMessage />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={DONUT_INNER}
          outerRadius={DONUT_OUTER}
          paddingAngle={3}
          stroke="transparent"
          activeShape={renderSynqPieActiveShape}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          cursor={false}
          content={<SynqChartTooltip />}
          wrapperStyle={{ outline: 'none' }}
        />
      </PieChart>
    </ResponsiveContainer>
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

  const absenceMax = Math.max(1, ...weeklyAbsences.map((day) => day.value));

  return (
    <section
      className={cn(
        'grid gap-4 lg:grid-cols-3 lg:grid-rows-2 lg:items-stretch',
        className
      )}
    >
      <ChartPanel
        className="min-h-0 lg:col-start-1 lg:row-start-1"
        title="Total de jugadores · activos vs inactivos"
        legend={<ChartLegend items={playerAvailability} />}
      >
        <DonutChart data={playerAvailability} />
      </ChartPanel>

      <ChartPanel
        className="min-h-0 lg:col-start-2 lg:row-start-1"
        title="Equipos · activos vs inactivos"
        legend={<ChartLegend items={teamStatus} />}
      >
        <DonutChart data={teamStatus} />
      </ChartPanel>

      <CanteraRecentMovements
        movements={movements}
        variant="panel"
        limit={5}
        className="min-h-0 lg:col-start-3 lg:row-span-2 lg:row-start-1"
      />

      <ChartPanel
        className="min-h-0 lg:col-start-1 lg:row-start-2"
        title="Ausencias confirmadas · semana"
        legend={
          <p className="text-center text-xs text-muted-foreground">
            Total confirmadas:{' '}
            <span className="font-semibold text-foreground">{stats.weeklyConfirmedAbsences}</span>
          </p>
        }
      >
        {weeklyAbsences.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAbsences} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide allowDecimals={false} domain={[0, absenceMax]} />
              <Tooltip
                cursor={SYNQ_CHART_CURSOR}
                content={<SynqChartTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                barSize={16}
                activeBar={SYNQ_CHART_ACTIVE_BAR}
              >
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

      <ChartPanel
        className="min-h-0 lg:col-start-2 lg:row-start-2"
        title="Jugadores · activos, inactivos y lesionados"
        legend={<span aria-hidden className="block" />}
      >
        {playerStatusChart.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={playerStatusChart}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={SYNQ_CHART_CURSOR}
                content={<SynqChartTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar
                dataKey="value"
                radius={[0, 6, 6, 0]}
                barSize={20}
                activeBar={SYNQ_CHART_ACTIVE_BAR}
              >
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
    </section>
  );
}
