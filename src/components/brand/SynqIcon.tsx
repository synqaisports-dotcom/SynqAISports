'use client';

import { useId } from 'react';
import { SYNQ_BRAND } from '@/components/brand/brand-constants';
import { cn } from '@/lib/utils';

type Props = {
  size?: number;
  className?: string;
};

/** Icono corporativo SynqAI — hexágono táctico (SVG inline). */
export function SynqIcon({ size = 32, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const strokeId = `synq-stroke-${uid}`;
  const fillId = `synq-fill-${uid}`;
  const glowId = `synq-glow-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-hidden
      className={cn('block shrink-0', className)}
    >
      <defs>
        <linearGradient id={strokeId} x1="18" y1="12" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor={SYNQ_BRAND.cyanSoft} />
          <stop offset="1" stopColor={SYNQ_BRAND.cyan} />
        </linearGradient>
        <linearGradient id={fillId} x1="50" y1="18" x2="50" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor={SYNQ_BRAND.navyLight} />
          <stop offset="1" stopColor={SYNQ_BRAND.navy} />
        </linearGradient>
        <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M50 8 84.64 28V72L50 92 15.36 72V28L50 8Z"
        stroke={`url(#${strokeId})`}
        strokeWidth="3"
        filter={`url(#${glowId})`}
      />
      <path
        d="M50 16 76.16 31.1V68.9L50 84 23.84 68.9V31.1L50 16Z"
        fill={`url(#${fillId})`}
        stroke={SYNQ_BRAND.cyan}
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />

      <circle cx="50" cy="54" r="3.2" stroke={SYNQ_BRAND.cyan} strokeWidth="1.4" fill="none" />
      <circle cx="32" cy="38" r="3.4" fill={SYNQ_BRAND.cyan} />
      <circle cx="28" cy="58" r="3.4" fill={SYNQ_BRAND.cyan} />
      <circle cx="38" cy="72" r="3.4" fill={SYNQ_BRAND.cyan} />
      <circle cx="66" cy="42" r="3.4" fill={SYNQ_BRAND.cyan} />
      <circle cx="70" cy="64" r="3.4" fill={SYNQ_BRAND.cyan} />

      <path d="M50 54 32 38" stroke={SYNQ_BRAND.cyan} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M50 54 28 58" stroke={SYNQ_BRAND.cyan} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M50 54 66 42" stroke={SYNQ_BRAND.cyan} strokeWidth="1.6" strokeLinecap="round" />

      <path
        d="M32 38 28 58"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.2"
        strokeDasharray="3 2.5"
        strokeOpacity="0.9"
      />
      <path
        d="M28 58 38 72"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.2"
        strokeDasharray="3 2.5"
        strokeOpacity="0.9"
      />

      <path
        d="M38 72 Q52 58 70 64"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      <g stroke={SYNQ_BRAND.cyan} strokeWidth="1.3" strokeLinecap="round">
        <path d="M72 34 l3.5 3.5M75.5 34 l-3.5 3.5" />
        <path d="M24 74 l3 3M27 74 l-3 3" />
      </g>
      <circle cx="74" cy="70" r="2.6" stroke={SYNQ_BRAND.cyan} strokeWidth="1.3" fill="none" />
    </svg>
  );
}
