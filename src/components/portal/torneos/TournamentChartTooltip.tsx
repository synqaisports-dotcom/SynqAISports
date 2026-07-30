'use client';

import type { TooltipProps } from 'recharts';
import { ChartTooltipWrapper } from '@/components/portal/SynqChartPrimitives';

type Entry = {
  name?: string;
  value?: number;
  color?: string;
  payload?: {
    name?: string;
    key?: string;
    fill?: string;
    value?: number;
  };
};

function formatTooltipValue(key: string | undefined, value: number): string {
  if (key === 'spectatorRevenue' || key === 'revenue' || key === 'spectators' || key === 'bonos' || key === 'sponsorship' || key === 'signage') {
    return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  }
  return value.toLocaleString('es-ES');
}

export function TournamentChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const entries = payload as Entry[];

  return (
    <ChartTooltipWrapper>
      {label ? (
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary/90">{label}</p>
      ) : null}
      <div className="space-y-1">
        {entries.map((entry) => {
          const key = entry.payload?.key;
          const name = entry.payload?.name ?? entry.name ?? 'Valor';
          const value = Number(entry.value ?? entry.payload?.value ?? 0);
          const color = entry.payload?.fill ?? entry.color ?? 'hsl(183, 100%, 50%)';
          return (
            <p key={`${name}-${value}`} className="flex items-center gap-2 text-foreground">
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{name}</span>
              <span className="ml-auto font-semibold tabular-nums" style={{ color }}>
                {formatTooltipValue(key, value)}
              </span>
            </p>
          );
        })}
      </div>
    </ChartTooltipWrapper>
  );
}
