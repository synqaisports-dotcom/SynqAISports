'use client';

import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { cn } from '@/lib/utils';
import { Circle, Dumbbell, Goal, Trophy, Volleyball } from 'lucide-react';

type Props = {
  compact?: boolean;
};

const SPORT_ICONS = [
  { Icon: Circle, className: 'left-[5%] top-[12%] size-[45px] -rotate-12' },
  { Icon: Volleyball, className: 'right-[6%] top-[16%] size-[41px] rotate-12' },
  { Icon: Goal, className: 'left-[8%] bottom-[14%] size-[49px] rotate-6' },
  { Icon: Dumbbell, className: 'right-[6%] bottom-[18%] size-[45px] -rotate-6' },
  { Icon: Trophy, className: 'left-[3%] top-[46%] size-[37px] opacity-45' },
  { Icon: Circle, className: 'right-[4%] top-[42%] size-[33px] opacity-40' },
];

function TechCyanLines({ compact }: { compact: boolean }) {
  return (
    <svg
      className={cn('absolute inset-0 size-full', compact ? 'opacity-30' : 'opacity-45')}
      viewBox="0 0 960 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="synq-cyan-line" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="40%" stopColor="#00e5ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1="120" x2="420" y2="120" stroke="url(#synq-cyan-line)" strokeWidth="1.2" />
      <line x1="540" y1="420" x2="960" y2="420" stroke="url(#synq-cyan-line)" strokeWidth="1.2" />
      <line x1="80" y1="0" x2="80" y2="200" stroke="#00e5ff" strokeOpacity="0.22" strokeWidth="1" />
      <line x1="880" y1="340" x2="880" y2="540" stroke="#00e5ff" strokeOpacity="0.22" strokeWidth="1" />
      <path d="M 120 480 L 200 480 L 200 400" stroke="#00e5ff" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />
      <path d="M 840 60 L 760 60 L 760 140" stroke="#00e5ff" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />
      <circle cx="200" cy="400" r="3" fill="#00e5ff" fillOpacity="0.55" />
      <circle cx="760" cy="140" r="3" fill="#00e5ff" fillOpacity="0.55" />
      <line x1="300" y1="270" x2="660" y2="270" stroke="#00e5ff" strokeOpacity="0.1" strokeWidth="0.8" strokeDasharray="6 14" />
      <line x1="480" y1="80" x2="480" y2="460" stroke="#00e5ff" strokeOpacity="0.08" strokeWidth="0.8" strokeDasharray="4 18" />
    </svg>
  );
}

export function SponsorWallWatermark({ compact = false }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_80%_45%/_0.12),transparent_55%)]" />
      <TechCyanLines compact={compact} />

      <div
        className={cn(
          'absolute left-1/2 top-[58%] flex flex-col items-center justify-center opacity-[0.44]',
          compact ? 'w-[78%]' : 'w-[min(76vw,74%)]'
        )}
        style={{
          transform: compact
            ? 'translate(-50%, -50%) scale(0.85)'
            : 'translate(-50%, -50%) scale(clamp(1.4, 4.8vmin, 2.6))',
        }}
      >
        <SynqBrandLockup
          layout="stacked"
          iconSize={compact ? 64 : 200}
          wordmarkSize="xl"
          className="w-full [&_svg]:max-w-full"
        />
      </div>

      {SPORT_ICONS.map(({ Icon, className }, index) => (
        <Icon key={index} className={cn('absolute text-cyan-400/30', className)} strokeWidth={1.5} />
      ))}
    </div>
  );
}
