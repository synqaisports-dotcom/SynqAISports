'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  size?: number;
  className?: string;
};

/** Icono hexagonal SynqAI — SVG inline para nitidez en sidebar y cabecera. */
export function SynqIcon({ size = 32, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const strokeId = `synq-stroke-${uid}`;
  const fillId = `synq-fill-${uid}`;
  const glowId = `synq-glow-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-hidden
      className={cn('block shrink-0', className)}
    >
      <defs>
        <linearGradient id={strokeId} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#66F7FF" />
          <stop offset="1" stopColor="#00F2FF" />
        </linearGradient>
        <linearGradient id={fillId} x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0C1824" />
          <stop offset="1" stopColor="#050D14" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M24 5.5 39.9 14.75V33.25L24 42.5 8.1 33.25V14.75L24 5.5Z"
        stroke={`url(#${strokeId})`}
        strokeWidth="1.5"
        filter={`url(#${glowId})`}
      />
      <path
        d="M24 9 36.2 16.05V29.95L24 37 11.8 29.95V16.05L24 9Z"
        fill={`url(#${fillId})`}
        stroke="#00F2FF"
        strokeOpacity="0.35"
        strokeWidth="0.75"
      />
      <path
        d="M15.5 17.5 15.5 30.5 31.5 24Z"
        stroke="#FFFFFF"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 17.5 31.5 24"
        stroke="#00F2FF"
        strokeWidth="1"
        strokeDasharray="2.5 2"
        strokeOpacity="0.85"
      />
      <path
        d="M15.5 30.5 31.5 24"
        stroke="#00F2FF"
        strokeWidth="1"
        strokeDasharray="2.5 2"
        strokeOpacity="0.85"
      />
      <circle cx="15.5" cy="17.5" r="2.1" fill="#FFFFFF" />
      <circle cx="15.5" cy="30.5" r="2.1" fill="#FFFFFF" />
      <circle cx="31.5" cy="24" r="2.35" fill="#00F2FF" />
      <path d="M14.2 17.5 14.2 19.3 16.1 18.4Z" fill="#00F2FF" />
    </svg>
  );
}
