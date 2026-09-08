'use client';

import { SynqDateField } from '@/components/portal/SynqDateField';
import { SynqTimeField } from '@/components/portal/SynqTimeField';
import { cn } from '@/lib/utils';

function splitDateTime(value: string): { date: string; time: string } {
  if (!value) {
    const now = new Date();
    return {
      date: now.toISOString().slice(0, 10),
      time: '09:00',
    };
  }
  const [date = '2024-01-01', time = '09:00'] = value.split('T');
  return { date, time: time.slice(0, 5) };
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SynqDateTimeField({ value, onChange, className }: Props) {
  const { date, time } = splitDateTime(value);

  return (
    <div className={cn('grid gap-2 sm:grid-cols-[1fr_auto]', className)}>
      <SynqDateField value={date} onChange={(nextDate) => onChange(`${nextDate}T${time}`)} />
      <SynqTimeField
        value={time}
        onChange={(nextTime) => onChange(`${date}T${nextTime}`)}
        className="sm:w-[9.5rem]"
      />
    </div>
  );
}
