'use client';

import { cn } from '@/lib/utils';
import { WEEKDAY_BUTTONS } from '@/lib/club-facilities';

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
};

export function WeekdayToggleButtons({ values, onChange, disabled, className }: Props) {
  const toggle = (code: string) => {
    if (disabled) return;
    if (values.includes(code)) {
      onChange(values.filter((value) => value !== code));
    } else {
      onChange([...values, code]);
    }
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {WEEKDAY_BUTTONS.map((day) => {
        const active = values.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            title={day.title}
            disabled={disabled}
            onClick={() => toggle(day.value)}
            className={cn(
              'inline-flex size-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
              active
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-primary/25 bg-background/80 text-muted-foreground hover:border-primary/45 hover:bg-primary/5',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {day.letter}
          </button>
        );
      })}
    </div>
  );
}
