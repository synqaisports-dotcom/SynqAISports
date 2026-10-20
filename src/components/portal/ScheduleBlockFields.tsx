'use client';

import { WeekdayToggleButtons } from '@/components/portal/WeekdayToggleButtons';
import { Input } from '@/components/ui/input';
import { sortWeekdayCodes } from '@/lib/club-facilities';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  hint?: string;
  days: string[];
  onDaysChange: (days: string[]) => void;
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  daysFieldName: string;
  startFieldName: string;
  endFieldName: string;
  disabled?: boolean;
  className?: string;
};

export function ScheduleBlockFields({
  title,
  hint,
  days,
  onDaysChange,
  start,
  end,
  onStartChange,
  onEndChange,
  daysFieldName,
  startFieldName,
  endFieldName,
  disabled,
  className,
}: Props) {
  const sortedDays = sortWeekdayCodes(days);

  return (
    <div
      className={cn(
        'rounded-xl border border-primary/20 bg-muted/5 p-4',
        className
      )}
    >
      <input type="hidden" name={daysFieldName} value={sortedDays.join(',')} readOnly />
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}

      <div className="mt-3">
        <WeekdayToggleButtons values={days} onChange={onDaysChange} disabled={disabled} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Hora inicio
          </label>
          <Input
            type="time"
            name={startFieldName}
            value={start}
            onChange={(event) => onStartChange(event.target.value)}
            disabled={disabled}
            className="portal-field-surface"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Hora fin
          </label>
          <Input
            type="time"
            name={endFieldName}
            value={end}
            onChange={(event) => onEndChange(event.target.value)}
            disabled={disabled}
            className="portal-field-surface"
          />
        </div>
      </div>
    </div>
  );
}
