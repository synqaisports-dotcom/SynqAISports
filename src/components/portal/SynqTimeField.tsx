'use client';

import { useMemo } from 'react';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { cn } from '@/lib/utils';

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => {
  const value = String(index).padStart(2, '0');
  return { value, label: value };
});

function parseTime(value: string): { hour: string; minute: string } {
  const [hour = '09', minute = '00'] = value.split(':');
  return { hour: hour.padStart(2, '0'), minute: minute.padStart(2, '0') };
}

function snapMinute(minute: string, step: number): string {
  const numeric = Number(minute);
  if (Number.isNaN(numeric)) return '00';
  const snapped = Math.round(numeric / step) * step;
  return String(Math.min(55, Math.max(0, snapped))).padStart(2, '0');
}

function buildMinuteOptions(step: number) {
  const options: { value: string; label: string }[] = [];
  for (let minute = 0; minute < 60; minute += step) {
    const value = String(minute).padStart(2, '0');
    options.push({ value, label: value });
  }
  return options;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minuteStep?: number;
};

export function SynqTimeField({ value, onChange, className, minuteStep = 5 }: Props) {
  const { hour, minute } = parseTime(value);
  const safeMinute = snapMinute(minute, minuteStep);
  const minuteOptions = useMemo(() => buildMinuteOptions(minuteStep), [minuteStep]);

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <SynqSelect
        value={hour}
        onChange={(nextHour) => onChange(`${nextHour}:${safeMinute}`)}
        options={HOUR_OPTIONS}
        className="h-9 min-w-0 flex-1"
      />
      <span className="text-sm font-medium text-muted-foreground">:</span>
      <SynqSelect
        value={safeMinute}
        onChange={(nextMinute) => onChange(`${hour}:${nextMinute}`)}
        options={minuteOptions}
        className="h-9 min-w-0 flex-1"
      />
    </div>
  );
}
