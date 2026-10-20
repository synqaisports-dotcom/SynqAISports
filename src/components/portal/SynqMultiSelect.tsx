'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PORTAL_DROPDOWN_SURFACE_CLASS, PORTAL_FIELD_CLASS } from '@/lib/portal-field-styles';
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
          'flex min-h-9 w-full items-center rounded-md border px-3 py-2 text-sm text-muted-foreground opacity-70',
          PORTAL_FIELD_CLASS,
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
            'group flex min-h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm',
            PORTAL_FIELD_CLASS,
            'transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
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
        className={cn(
          'max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto p-1',
          PORTAL_DROPDOWN_SURFACE_CLASS
        )}
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
