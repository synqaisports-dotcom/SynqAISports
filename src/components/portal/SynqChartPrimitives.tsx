'use client';

import type { ReactNode } from 'react';
import { Sector } from 'recharts';
import { cn } from '@/lib/utils';

export const SYNQ_CHART_CURSOR = {
  fill: 'hsl(183 100% 50% / 0.1)',
  radius: 6,
} as const;

export const SYNQ_CHART_CURSOR_LINE = {
  stroke: 'hsl(183 100% 50% / 0.45)',
  strokeWidth: 1,
  strokeDasharray: '4 4',
} as const;

export const SYNQ_CHART_ACTIVE_BAR = {
  opacity: 1,
  style: { filter: 'drop-shadow(0 0 10px hsl(183 100% 50% / 0.55))' },
} as const;

type TooltipEntry = {
  name: string;
  value: number;
  color?: string;
  payload?: { fill?: string; name?: string };
};

type SynqChartTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  title?: string;
};

export function SynqChartTooltip({ active, payload, label, title }: SynqChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const heading = title ?? (label != null && label !== '' ? String(label) : null);

  return (
    <div className="pointer-events-none rounded-xl border border-primary/35 bg-popover/95 px-3 py-2.5 text-xs shadow-[0_0_24px_hsl(183_100%_50%_/_0.18)] backdrop-blur-md">
      {heading ? (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary/90">
          {heading}
        </p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry) => {
          const color = entry.color ?? entry.payload?.fill ?? 'hsl(183, 100%, 50%)';
          const name = entry.payload?.name ?? entry.name;
          return (
            <p key={`${name}-${entry.value}`} className="flex items-center gap-2 text-foreground">
              <span
                className="size-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ color, backgroundColor: color }}
              />
              <span className="text-muted-foreground">{name}</span>
              <span className="ml-auto font-semibold tabular-nums" style={{ color }}>
                {entry.value}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

type PieSectorProps = {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
};

export function renderSynqPieActiveShape(props: PieSectorProps) {
  const {
    cx = 0,
    cy = 0,
    innerRadius = 0,
    outerRadius = 0,
    startAngle = 0,
    endAngle = 0,
    fill = 'hsl(183, 100%, 50%)',
  } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 5}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="hsl(183, 100%, 65%)"
      strokeWidth={2}
      style={{ filter: 'drop-shadow(0 0 8px hsl(183 100% 50% / 0.6))' }}
    />
  );
}

export function ChartTooltipWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none rounded-xl border border-primary/35 bg-popover/95 px-3 py-2.5 text-xs shadow-[0_0_24px_hsl(183_100%_50%_/_0.18)] backdrop-blur-md',
        className
      )}
    >
      {children}
    </div>
  );
}
