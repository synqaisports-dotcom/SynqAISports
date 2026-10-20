'use client';

import { Minus, Plus } from 'lucide-react';
import { PORTAL_FIELD_CLASS } from '@/lib/portal-field-styles';
import { cn } from '@/lib/utils';

type Props = {
  name: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
};

const stepButtonClass =
  'inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35';

export function SynqNumericStepper({
  name,
  value,
  onChange,
  min = 0,
  max = 99,
  placeholder = '—',
  className,
}: Props) {
  const display = value != null ? String(value) : '';

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const step = (delta: number) => {
    const base = value ?? (delta > 0 ? min - 1 : max + 1);
    onChange(clamp(base + delta));
  };

  const handleInput = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      onChange(null);
      return;
    }
    onChange(clamp(parseInt(digits, 10)));
  };

  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-md border',
        PORTAL_FIELD_CLASS,
        className
      )}
    >
      <button
        type="button"
        aria-label="Disminuir"
        className={stepButtonClass}
        disabled={value != null && value <= min}
        onClick={() => step(-1)}
      >
        <Minus className="size-4" strokeWidth={2} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        onChange={(event) => handleInput(event.target.value)}
        className="h-9 min-w-0 flex-1 border-x border-primary/20 bg-transparent px-2 text-center text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label={name}
      />

      <button
        type="button"
        aria-label="Aumentar"
        className={stepButtonClass}
        disabled={value != null && value >= max}
        onClick={() => step(1)}
      >
        <Plus className="size-4" strokeWidth={2} />
      </button>

      <input type="hidden" name={name} value={display} readOnly />
    </div>
  );
}
