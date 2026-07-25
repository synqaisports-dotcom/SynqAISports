'use client';

import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { cn } from '@/lib/utils';
import { Circle, Dumbbell, Goal, Trophy, Volleyball } from 'lucide-react';

type Props = {
  compact?: boolean;
};

const SPORT_ICONS = [
  { Icon: Circle, className: 'left-[12%] top-[18%] size-10 -rotate-12' },
  { Icon: Volleyball, className: 'right-[14%] top-[22%] size-9 rotate-12' },
  { Icon: Goal, className: 'left-[18%] bottom-[20%] size-11 rotate-6' },
  { Icon: Dumbbell, className: 'right-[16%] bottom-[24%] size-10 -rotate-6' },
  { Icon: Trophy, className: 'left-[42%] bottom-[12%] size-8 opacity-40' },
  { Icon: Circle, className: 'right-[38%] top-[14%] size-7 opacity-35' },
];

export function SponsorWallWatermark({ compact = false }: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_80%_45%/_0.06),transparent_68%)]" />
      <div className={cn('relative flex flex-col items-center opacity-[0.11]', compact && 'scale-75')}>
        <SynqBrandLockup layout="stacked" iconSize={compact ? 48 : 72} wordmarkSize="md" />
      </div>
      {SPORT_ICONS.map(({ Icon, className }, index) => (
        <Icon
          key={index}
          className={cn('absolute text-cyan-400/25', className)}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
