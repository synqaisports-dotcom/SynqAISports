'use client';

import {
  PLAYER_POSITIONS,
  parsePlayerPositions,
  serializePlayerPositions,
  type PlayerPositionCode,
} from '@/lib/player-positions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Props = {
  value: string | null | undefined;
  onChange?: (serialized: string) => void;
  readOnly?: boolean;
};

export function PlayerPositionsPicker({ value, onChange, readOnly = false }: Props) {
  const selected = new Set(parsePlayerPositions(value));

  const toggle = (code: PlayerPositionCode) => {
    if (readOnly || !onChange) return;

    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);

    onChange(serializePlayerPositions(next));
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {PLAYER_POSITIONS.map((item) => {
        const active = selected.has(item.code);

        return (
          <Tooltip key={item.code}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => toggle(item.code)}
                className={cn(
                  'inline-flex min-w-[2.35rem] items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.22)]'
                    : readOnly
                      ? 'cursor-default border-primary/10 bg-muted/5 text-muted-foreground/35'
                      : 'border-primary/20 bg-muted/5 text-muted-foreground hover:border-primary/35 hover:bg-primary/8 hover:text-foreground',
                  readOnly && 'disabled:opacity-100'
                )}
              >
                {item.short}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
