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
import { cn } from '@/lib/utils';

const COLOR_CONFIRMED = 'hsl(174, 72%, 46%)';
const COLOR_PENDING = 'hsl(38, 92%, 50%)';
const AXIS_TICK = { fill: 'hsl(var(--muted-foreground))', fontSize: 10 };
const GRID_STROKE = 'hsl(var(--primary) / 0.12)';

const sectionTitleClass =
  'text-[10px] font-semibold uppercase tracking-wider text-primary';

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-primary/25 bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label ? <p className="mb-1 font-semibold text-foreground">{label}</p> : null}
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

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
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="confirmados" stackId="macro" fill={COLOR_CONFIRMED} name="Confirmados" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendientes" stackId="macro" fill={COLOR_PENDING} name="Pendientes" radius={[0, 4, 4, 0]} />
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
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="confirmados" stackId="meso" fill={COLOR_CONFIRMED} name="Confirmados" />
            <Bar dataKey="pendientes" stackId="meso" fill={COLOR_PENDING} name="Pendientes" radius={[4, 4, 0, 0]} />
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
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as MicroWeekRow;
                return (
                  <div className="rounded-lg border border-primary/25 bg-background/95 px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold">{row.name}</p>
                    <p className={row.confirmados ? 'text-emerald-300' : 'text-amber-200'}>
                      {row.confirmados ? 'Confirmado' : 'Pendiente'}
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="stepAfter"
              dataKey="confirmados"
              stroke={COLOR_CONFIRMED}
              fill="url(#microConfirmed)"
              strokeWidth={2}
              name="Estado"
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
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.key}
                  fill={entry.key === 'confirmados' ? colors[0] : colors[1]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
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
