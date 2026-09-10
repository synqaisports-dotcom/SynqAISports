'use client';

import {
  CLUB_PRACTICED_SPORT_LABELS,
  CLUB_PRACTICED_SPORT_SHORT,
  clubPracticedSportOptions,
  sortPracticedSports,
  type ClubPracticedSport,
} from '@/lib/club-practiced-sports';
import { cn } from '@/lib/utils';

type Props = {
  values: ClubPracticedSport[];
  onChange: (values: ClubPracticedSport[]) => void;
  disabled?: boolean;
  className?: string;
  fieldName?: string;
};

export function ClubSportsSelector({
  values,
  onChange,
  disabled,
  className,
  fieldName = 'practicedSports',
}: Props) {
  const toggle = (sport: ClubPracticedSport) => {
    if (disabled) return;
    if (values.includes(sport)) {
      if (values.length === 1) return;
      onChange(values.filter((value) => value !== sport));
      return;
    }
    onChange(sortPracticedSports([...values, sport]));
  };

  return (
    <div className={className}>
      <input
        type="hidden"
        name={fieldName}
        value={sortPracticedSports(values).join(',')}
        readOnly
      />
      <div className="flex flex-wrap gap-2">
        {clubPracticedSportOptions().map((option) => {
          const active = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              title={CLUB_PRACTICED_SPORT_LABELS[option.value]}
              disabled={disabled}
              onClick={() => toggle(option.value)}
              className={cn(
                'inline-flex min-h-10 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
                active
                  ? 'border-primary bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]'
                  : 'border-primary/25 portal-field-surface text-muted-foreground hover:border-primary/45 hover:bg-primary/5',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {CLUB_PRACTICED_SPORT_SHORT[option.value]}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Selecciona todos los deportes que el club practica. Debe quedar al menos uno activo.
      </p>
    </div>
  );
}
