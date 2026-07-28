'use client';

import { useId } from 'react';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { SportBallLayer } from '@/components/portal/signage/SponsorWallSportIcons';
import { cn } from '@/lib/utils';

type Props = {
  compact?: boolean;
};

function TechCyanLines({ compact, uid }: { compact: boolean; uid: string }) {
  const lineGrad = `${uid}-line`;
  const glowGrad = `${uid}-glow`;
  const scanGrad = `${uid}-scan`;

  return (
    <svg
      className={cn(
        'signage-wall-tech-lines absolute inset-0 size-full',
        compact ? 'opacity-50' : 'opacity-70'
      )}
      viewBox="0 0 960 540"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={lineGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="35%" stopColor="#66f7ff" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#00e5ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={glowGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={scanGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="45%" stopColor="#00e5ff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#66f7ff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${uid}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Halo de brillo suave */}
      <rect
        className="signage-wall-tech-scan"
        x="0"
        y="0"
        width="960"
        height="540"
        fill={`url(#${scanGrad})`}
        opacity="0.35"
      />

      <g filter={`url(#${uid}-blur)`}>
        <line
          className="signage-wall-tech-dash-h"
          x1="0"
          y1="118"
          x2="420"
          y2="118"
          stroke={`url(#${lineGrad})`}
          strokeWidth="1.8"
        />
        <line
          className="signage-wall-tech-dash-h signage-wall-tech-dash-delay"
          x1="540"
          y1="422"
          x2="960"
          y2="422"
          stroke={`url(#${lineGrad})`}
          strokeWidth="1.8"
        />
        <line x1="78" y1="0" x2="78" y2="205" stroke="#00e5ff" strokeOpacity="0.38" strokeWidth="1.2" />
        <line x1="882" y1="335" x2="882" y2="540" stroke="#00e5ff" strokeOpacity="0.38" strokeWidth="1.2" />
        <path
          d="M 118 478 L 202 478 L 202 398"
          stroke="#66f7ff"
          strokeOpacity="0.65"
          strokeWidth="1.8"
          fill="none"
        />
        <path
          d="M 842 62 L 758 62 L 758 142"
          stroke="#66f7ff"
          strokeOpacity="0.65"
          strokeWidth="1.8"
          fill="none"
        />
        <circle cx="202" cy="398" r="4" fill="#00e5ff" fillOpacity="0.75" />
        <circle cx="758" cy="142" r="4" fill="#00e5ff" fillOpacity="0.75" />
        <circle cx="202" cy="398" r="8" fill="#00e5ff" fillOpacity="0.15" className="signage-wall-tech-pulse-dot" />
        <circle cx="758" cy="142" r="8" fill="#00e5ff" fillOpacity="0.15" className="signage-wall-tech-pulse-dot" />
        <line
          className="signage-wall-tech-dash-v"
          x1="298"
          y1="268"
          x2="662"
          y2="268"
          stroke={`url(#${glowGrad})`}
          strokeWidth="1"
          strokeDasharray="8 16"
        />
        <line
          className="signage-wall-tech-dash-v signage-wall-tech-dash-delay"
          x1="480"
          y1="78"
          x2="480"
          y2="462"
          stroke="#00e5ff"
          strokeOpacity="0.14"
          strokeWidth="1"
          strokeDasharray="5 20"
        />
        {/* Diagonales tecnológicas */}
        <line x1="120" y1="40" x2="280" y2="120" stroke="#00e5ff" strokeOpacity="0.2" strokeWidth="0.9" />
        <line x1="840" y1="500" x2="680" y2="420" stroke="#00e5ff" strokeOpacity="0.2" strokeWidth="0.9" />
      </g>
    </svg>
  );
}

export function SponsorWallWatermark({ compact = false }: Props) {
  const uid = useId().replace(/:/g, '');

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden [container-type:size]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(187_80%_50%/_0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,rgba(0,229,255,0.06),transparent)]" />
      <TechCyanLines compact={compact} uid={uid} />
      <SportBallLayer compact={compact} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex flex-col items-center justify-center opacity-[0.52]"
          style={{
            width: 'min(86cqw, 78cqh, 960px)',
          }}
        >
          <SynqBrandLockup
            layout="stacked"
            iconSize={compact ? 140 : 220}
            wordmarkSize="xl"
            className="w-full [&_svg]:h-auto [&_svg]:max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
