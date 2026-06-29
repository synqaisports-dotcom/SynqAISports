'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type SynqMultiSelectOption = {
  value: string;
  label: string;
};

type Props = {
  values: string[];
  onChange: (values: string[]) => void;
  options: SynqMultiSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function SynqMultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Seleccionar',
  disabled,
  className,
}: Props) {
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  };

  if (disabled) {
    return (
      <div
        className={cn(
          'flex min-h-9 w-full items-center rounded-md border border-primary/20 bg-muted/20 px-3 py-2 text-sm text-muted-foreground',
          className
        )}
      >
        <span className="truncate">
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm shadow-[0_0_0_1px_hsl(183_100%_50%_/_0.04)]',
            'transition-colors hover:border-primary/50 hover:bg-primary/5',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
            'data-[state=open]:border-primary/55 data-[state=open]:bg-primary/5',
            className
          )}
        >
          <span
            className={cn(
              'line-clamp-2 text-left',
              selectedLabels.length === 0 && 'text-muted-foreground'
            )}
          >
            {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 text-primary/80 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto border-primary/30 bg-popover/95 p-1 shadow-[0_8px_32px_hsl(183_100%_50%_/_0.12)] backdrop-blur-md"
      >
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={(event) => {
                event.preventDefault();
                toggle(option.value);
              }}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-sm',
                'focus:bg-primary/10 focus:text-foreground',
                checked && 'bg-primary/10 text-primary'
              )}
            >
              <span className="truncate">{option.label}</span>
              {checked ? <Check className="size-4 shrink-0 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
