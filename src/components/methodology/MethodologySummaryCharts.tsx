'use client';

import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartBarRow, MicroWeekRow, SummaryPanelStats } from '@/lib/methodology-summary-stats';
import {
  SYNQ_CHART_ACTIVE_BAR,
  SYNQ_CHART_CURSOR,
  SYNQ_CHART_CURSOR_LINE,
  ChartTooltipWrapper,
  SynqChartTooltip,
  renderSynqPieActiveShape,
} from '@/components/portal/SynqChartPrimitives';
import { cn } from '@/lib/utils';

const COLOR_CONFIRMED = 'hsl(174, 72%, 46%)';
const COLOR_PENDING = 'hsl(38, 92%, 50%)';
const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 10 };
const GRID_STROKE = 'hsl(var(--primary) / 0.12)';

const sectionTitleClass =
  'text-[10px] font-semibold uppercase tracking-wider text-primary';

function StatColumn({
  confirmLabel,
  pendingLabel,
  totalLabel,
  stats,
}: {
  confirmLabel: string;
  pendingLabel: string;
  totalLabel: string;
  stats: SummaryPanelStats;
}) {
  return (
    <div className="flex flex-col justify-center gap-2">
      <div className="portal-section-surface rounded-lg px-3 py-2">
        <p className={sectionTitleClass}>{confirmLabel}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{stats.confirmados}</p>
      </div>
      <div className="portal-section-surface rounded-lg px-3 py-2">
        <p className={sectionTitleClass}>{pendingLabel}</p>
        <p className="mt-1 text-2xl font-semibold text-amber-200">{stats.pendientes}</p>
      </div>
      <div className="portal-section-surface rounded-lg px-3 py-2">
        <p className={sectionTitleClass}>{totalLabel}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{stats.total}</p>
      </div>
    </div>
  );
}

function SummaryPanel({
  title,
  chart,
  confirmLabel,
  pendingLabel,
  totalLabel,
  stats,
}: {
  title: string;
  chart: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  totalLabel: string;
  stats: SummaryPanelStats;
}) {
  return (
    <div className="portal-section-surface grid gap-3 rounded-xl p-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.75fr)] lg:items-stretch">
      <div className="min-h-[11rem]">
        <p className={sectionTitleClass}>{title}</p>
        <div className="mt-2 h-44 w-full">{chart}</div>
      </div>
      <StatColumn
        confirmLabel={confirmLabel}
        pendingLabel={pendingLabel}
        totalLabel={totalLabel}
        stats={stats}
      />
    </div>
  );
}

export function MacroHistoryChart({
  data,
  stats,
}: {
  data: ChartBarRow[];
  stats: SummaryPanelStats;
}) {
  return (
    <SummaryPanel
      title="Historial de macrociclos"
      confirmLabel="MCC confirmados"
      pendingLabel="MCC pendientes"
      totalLabel="Total MCC"
      stats={stats}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={SYNQ_CHART_CURSOR}
              content={<SynqChartTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar
              dataKey="confirmados"
              stackId="macro"
              fill={COLOR_CONFIRMED}
              name="Confirmados"
              radius={[0, 0, 0, 0]}
              activeBar={SYNQ_CHART_ACTIVE_BAR}
            />
            <Bar
              dataKey="pendientes"
              stackId="macro"
              fill={COLOR_PENDING}
              name="Pendientes"
              radius={[0, 4, 4, 0]}
              activeBar={SYNQ_CHART_ACTIVE_BAR}
            />
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}

export function MesoHistoryChart({ data, stats }: { data: ChartBarRow[]; stats: SummaryPanelStats }) {
  return (
    <SummaryPanel
      title="Historial de mesociclos"
      confirmLabel="MCC confirmados"
      pendingLabel="MCC pendientes"
      totalLabel="Total MCC"
      stats={stats}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={48} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              cursor={SYNQ_CHART_CURSOR}
              content={<SynqChartTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Bar
              dataKey="confirmados"
              stackId="meso"
              fill={COLOR_CONFIRMED}
              name="Confirmados"
              activeBar={SYNQ_CHART_ACTIVE_BAR}
            />
            <Bar
              dataKey="pendientes"
              stackId="meso"
              fill={COLOR_PENDING}
              name="Pendientes"
              radius={[4, 4, 0, 0]}
              activeBar={SYNQ_CHART_ACTIVE_BAR}
            />
          </BarChart>
        </ResponsiveContainer>
      }
    />
  );
}

export function MicroHistoryChart({ data, stats }: { data: MicroWeekRow[]; stats: SummaryPanelStats }) {
  const dense = data.length > 16;
  return (
    <SummaryPanel
      title="Historial de microciclos"
      confirmLabel="MCC confirmados"
      pendingLabel="MCC pendientes"
      totalLabel="Total MCC"
      stats={stats}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="microConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR_CONFIRMED} stopOpacity={0.55} />
                <stop offset="100%" stopColor={COLOR_CONFIRMED} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="index"
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              interval={dense ? Math.ceil(data.length / 8) : 0}
            />
            <YAxis hide domain={[0, 1]} />
            <Tooltip
              cursor={SYNQ_CHART_CURSOR_LINE}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as MicroWeekRow;
                return (
                  <ChartTooltipWrapper>
                    <p className="font-semibold text-foreground">{row.name}</p>
                    <p className={row.confirmados ? 'text-emerald-300' : 'text-amber-200'}>
                      {row.confirmados ? 'Confirmado' : 'Pendiente'}
                    </p>
                  </ChartTooltipWrapper>
                );
              }}
              wrapperStyle={{ outline: 'none' }}
            />
            <Area
              type="stepAfter"
              dataKey="confirmados"
              stroke={COLOR_CONFIRMED}
              fill="url(#microConfirmed)"
              strokeWidth={2}
              name="Estado"
              activeDot={{
                r: 5,
                stroke: 'hsl(183, 100%, 65%)',
                strokeWidth: 2,
                fill: COLOR_CONFIRMED,
                style: { filter: 'drop-shadow(0 0 8px hsl(183 100% 50% / 0.65))' },
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      }
    />
  );
}

export function SessionHistoryChart({
  data,
  stats,
}: {
  data: { name: string; value: number; key: 'confirmados' | 'pendientes' }[];
  stats: SummaryPanelStats;
}) {
  const colors = [COLOR_CONFIRMED, COLOR_PENDING];
  return (
    <SummaryPanel
      title="Historial de sesiones"
      confirmLabel="Sesiones confirmadas"
      pendingLabel="Sesiones pendientes"
      totalLabel="Total sesiones"
      stats={stats}
      chart={
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={3}
              stroke="transparent"
              activeShape={renderSynqPieActiveShape}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={entry.key === 'confirmados' ? colors[0] : colors[1]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              cursor={false}
              content={<SynqChartTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>
      }
    />
  );
}

export function SidebarMetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  tone?: 'default' | 'warning';
}) {
  return (
    <div className="portal-section-surface rounded-xl px-3 py-3">
      <p className={sectionTitleClass}>{label}</p>
      <p
        className={cn(
          'mt-2 text-2xl font-semibold tracking-tight',
          tone === 'warning' ? 'text-amber-200' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  );
}
