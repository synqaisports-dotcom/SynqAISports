'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SynqSelectOption = {
  value: string;
  label: string;
};

export type SynqSelectOptionGroup = {
  label: string;
  options: SynqSelectOption[];
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options?: SynqSelectOption[];
  groups?: SynqSelectOptionGroup[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function flattenOptions(
  options: SynqSelectOption[] = [],
  groups: SynqSelectOptionGroup[] = []
): SynqSelectOption[] {
  if (groups.length > 0) return groups.flatMap((group) => group.options);
  return options;
}

export function SynqSelect({
  value,
  onChange,
  options = [],
  groups = [],
  placeholder = 'Seleccionar',
  disabled,
  className,
}: Props) {
  const allOptions = flattenOptions(options, groups);
  const selected = allOptions.find((option) => option.value === value);

  if (disabled) {
    return (
      <div
        className={cn(
          'flex h-9 w-full items-center rounded-md border border-primary/20 bg-muted/20 px-3 text-sm text-muted-foreground',
          className
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex h-9 w-full items-center justify-between gap-2 rounded-md border border-primary/30 bg-background/80 px-3 text-sm shadow-[0_0_0_1px_hsl(183_100%_50%_/_0.04)]',
            'transition-colors hover:border-primary/50 hover:bg-primary/5',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
            'data-[state=open]:border-primary/55 data-[state=open]:bg-primary/5',
            className
          )}
        >
          <span className={cn('truncate text-left', !selected && 'text-muted-foreground')}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-primary/80 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto border-primary/30 bg-popover/95 p-1 shadow-[0_8px_32px_hsl(183_100%_50%_/_0.12)] backdrop-blur-md"
      >
        {groups.length > 0
          ? groups.map((group) => (
              <div key={group.label}>
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                {group.options.map((option) => (
                  <DropdownMenuItem
                    key={`${group.label}-${option.value || '__vacant__'}`}
                    onSelect={() => onChange(option.value)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm',
                      'focus:bg-primary/10 focus:text-foreground',
                      value === option.value && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value ? (
                      <Check className="size-4 shrink-0 text-primary" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </div>
            ))
          : options.map((option) => (
              <DropdownMenuItem
                key={option.value || '__root__'}
                onSelect={() => onChange(option.value)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm',
                  'focus:bg-primary/10 focus:text-foreground',
                  value === option.value && 'bg-primary/10 text-primary'
                )}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value ? <Check className="size-4 shrink-0 text-primary" /> : null}
              </DropdownMenuItem>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
