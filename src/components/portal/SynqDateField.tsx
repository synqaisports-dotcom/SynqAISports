'use client';

import { useMemo } from 'react';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { cn } from '@/lib/utils';

const MONTH_OPTIONS = [
  { value: '01', label: 'Ene' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Abr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Ago' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dic' },
] as const;

function parseISO(value: string): { year: string; month: string; day: string } {
  const [year = '2024', month = '01', day = '01'] = value.split('-');
  return { year, month, day };
}

function composeISO(year: string, month: string, day: string): string {
  return `${year}-${month}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minYear?: number;
  maxYear?: number;
};

export function SynqDateField({
  value,
  onChange,
  className,
  minYear = 2015,
  maxYear = 2035,
}: Props) {
  const { year, month, day } = parseISO(value);
  const yearNum = Number(year);
  const monthNum = Number(month);

  const dayOptions = useMemo(() => {
    const maxDay = daysInMonth(yearNum, monthNum);
    return Array.from({ length: maxDay }, (_, index) => {
      const d = String(index + 1).padStart(2, '0');
      return { value: d, label: String(index + 1) };
    });
  }, [yearNum, monthNum]);

  const yearOptions = useMemo(
    () =>
      Array.from({ length: maxYear - minYear + 1 }, (_, index) => {
        const y = String(minYear + index);
        return { value: y, label: y };
      }),
    [minYear, maxYear]
  );

  const patch = (patchYear: string, patchMonth: string, patchDay: string) => {
    const maxDay = daysInMonth(Number(patchYear), Number(patchMonth));
    const clampedDay = String(Math.min(Number(patchDay), maxDay)).padStart(2, '0');
    onChange(composeISO(patchYear, patchMonth, clampedDay));
  };

  const safeDay = String(Math.min(Number(day), daysInMonth(yearNum, monthNum))).padStart(2, '0');

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <SynqSelect
        value={safeDay}
        onChange={(nextDay) => patch(year, month, nextDay)}
        options={dayOptions}
        className="h-8 w-[3.25rem] shrink-0 px-2 text-xs"
      />
      <SynqSelect
        value={month}
        onChange={(nextMonth) => patch(year, nextMonth, safeDay)}
        options={[...MONTH_OPTIONS]}
        className="h-8 min-w-0 flex-1 px-2 text-xs"
      />
      <SynqSelect
        value={year}
        onChange={(nextYear) => patch(nextYear, month, safeDay)}
        options={yearOptions}
        className="h-8 w-[4.5rem] shrink-0 px-2 text-xs"
      />
    </div>
  );
}
