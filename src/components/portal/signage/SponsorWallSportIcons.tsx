'use client';

import { SYNQ_BRAND } from '@/components/brand/brand-constants';
import { cn } from '@/lib/utils';
import { useId, type ComponentType, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

export function FootballBallIcon({ className, ...props }: IconProps) {
  const uid = useId().replace(/:/g, '');
  const shineId = `${uid}-fb-shine`;
  const glowId = `${uid}-fb-glow`;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={shineId} x1="20%" y1="30%" x2="55%" y2="70%">
          <stop offset="0%" stopColor={SYNQ_BRAND.cyanSoft} stopOpacity="0.55" />
          <stop offset="100%" stopColor={SYNQ_BRAND.cyanSoft} stopOpacity="0" />
        </linearGradient>
        <GlowFilter id={glowId} />
      </defs>
      <circle cx="50" cy="50" r="46" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" filter={`url(#${glowId})`} />
      <path d="M50 7 58.8 19.5 54.2 34.5 45.8 34.5 41.2 19.5Z" fill={SYNQ_BRAND.cyan} />
      <path
        d="M41.2 19.5 28 27.5 24.5 42 32.5 52.5 45.8 34.5Z"
        fill={SYNQ_BRAND.navyLight}
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M58.8 19.5 72 27.5 75.5 42 67.5 52.5 54.2 34.5Z"
        fill={SYNQ_BRAND.navyLight}
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24.5 42 18 55 24 68 38 72 32.5 52.5Z" fill={SYNQ_BRAND.cyan} />
      <path d="M75.5 42 82 55 76 68 62 72 67.5 52.5Z" fill={SYNQ_BRAND.cyan} />
      <path
        d="M32.5 52.5 38 72 50 78 62 72 67.5 52.5 54.2 34.5 45.8 34.5Z"
        fill={SYNQ_BRAND.navyLight}
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M28 27.5 41.2 19.5 50 7 58.8 19.5 72 27.5"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M28 27.5 24.5 42 18 55" stroke={SYNQ_BRAND.cyan} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M72 27.5 75.5 42 82 55" stroke={SYNQ_BRAND.cyan} strokeWidth="1.4" strokeLinejoin="round" />
      <path
        d="M18 55 24 68 38 72 50 78 62 72 76 68 82 55"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <ellipse cx="34" cy="42" rx="10" ry="14" fill={`url(#${shineId})`} transform="rotate(-18 34 42)" />
    </svg>
  );
}

export function BasketballBallIcon({ className, ...props }: IconProps) {
  const glowId = `${useId().replace(/:/g, '')}-bb-glow`;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <defs>
        <GlowFilter id={glowId} />
      </defs>
      <circle cx="50" cy="50" r="46" stroke={SYNQ_BRAND.cyan} strokeWidth="2.4" filter={`url(#${glowId})`} />
      <path d="M50 4 C28 4 12 22 8 44" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 4 C72 4 88 22 92 44" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 96 C28 96 12 78 8 56" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 96 C72 96 88 78 92 56" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M4 50 C4 28 22 12 44 8"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M96 50 C96 72 78 88 56 92"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path d="M4 50 L96 50" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M50 4 L50 96" stroke={SYNQ_BRAND.cyan} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function VolleyballBallIcon({ className, ...props }: IconProps) {
  const glowId = `${useId().replace(/:/g, '')}-vb-glow`;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <defs>
        <GlowFilter id={glowId} />
      </defs>
      <circle cx="50" cy="50" r="46" stroke={SYNQ_BRAND.cyan} strokeWidth="2.4" filter={`url(#${glowId})`} />
      <path
        d="M8 50 C18 38 32 32 50 32 C68 32 82 38 92 50"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 44 C22 36 36 32 50 32 C64 32 78 36 90 44"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M10 56 C22 64 36 68 50 68 C64 68 78 64 90 56"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8 50 C18 62 32 68 50 68 C68 68 82 62 92 50"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 22 C26 34 38 42 50 50 C62 58 74 66 86 78"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 18 C30 30 40 40 50 50 C60 60 70 70 82 82"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M86 22 C74 34 62 42 50 50 C38 58 26 66 14 78"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M82 18 C70 30 60 40 50 50 C40 60 30 70 18 82"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

export function WaterPoloBallIcon({ className, ...props }: IconProps) {
  const uid = useId().replace(/:/g, '');
  const shineId = `${uid}-wp-shine`;
  const glowId = `${uid}-wp-glow`;

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <defs>
        <linearGradient id={shineId} x1="25%" y1="25%" x2="60%" y2="65%">
          <stop offset="0%" stopColor={SYNQ_BRAND.cyanSoft} stopOpacity="0.45" />
          <stop offset="100%" stopColor={SYNQ_BRAND.cyanSoft} stopOpacity="0" />
        </linearGradient>
        <GlowFilter id={glowId} />
      </defs>
      <circle cx="50" cy="46" r="38" stroke={SYNQ_BRAND.cyan} strokeWidth="2.4" filter={`url(#${glowId})`} />
      <path
        d="M14 46 C14 28 30 14 50 14 C70 14 86 28 86 46"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 46 C14 64 30 78 50 78 C70 78 86 64 86 46"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M14 38 H86" stroke={SYNQ_BRAND.cyanSoft} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 54 H86" stroke={SYNQ_BRAND.cyanSoft} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M22 30 C34 36 42 40 50 40 C58 40 66 36 78 30"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M22 62 C34 56 42 52 50 52 C58 52 66 56 78 62"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.8"
      />
      <ellipse cx="36" cy="40" rx="9" ry="12" fill={`url(#${shineId})`} transform="rotate(-12 36 40)" />
      <path
        d="M8 88 C20 82 32 80 50 80 C68 80 80 82 92 88"
        stroke={SYNQ_BRAND.cyan}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M4 92 C18 86 34 84 50 84 C66 84 82 86 96 92"
        stroke={SYNQ_BRAND.cyanSoft}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export const SPONSOR_WALL_SPORT_ASSETS = {
  football: '/signage/watermark/football.svg',
  basketball: '/signage/watermark/basketball.svg',
  volleyball: '/signage/watermark/volleyball.svg',
  waterpolo: '/signage/watermark/waterpolo.svg',
} as const;

type SportWatermark = {
  id: string;
  Icon: ComponentType<IconProps>;
  className: string;
  opacity?: string;
};

export const SPONSOR_WALL_SPORT_WATERMARKS: SportWatermark[] = [
  {
    id: 'football-tl',
    Icon: FootballBallIcon,
    className: 'left-[3%] top-[8%] size-[88px] -rotate-[16deg]',
    opacity: 'opacity-[0.38]',
  },
  {
    id: 'volleyball-tr',
    Icon: VolleyballBallIcon,
    className: 'right-[4%] top-[10%] size-[84px] rotate-[12deg]',
    opacity: 'opacity-[0.40]',
  },
  {
    id: 'basketball-bl',
    Icon: BasketballBallIcon,
    className: 'left-[5%] bottom-[10%] size-[90px] rotate-[10deg]',
    opacity: 'opacity-[0.39]',
  },
  {
    id: 'waterpolo-br',
    Icon: WaterPoloBallIcon,
    className: 'right-[3%] bottom-[8%] size-[86px] -rotate-[8deg]',
    opacity: 'opacity-[0.41]',
  },
];

/** Capa de marca de agua deportiva — SVG inline (no depende de rutas estáticas). */
export function SportBallLayer({ compact }: { compact?: boolean }) {
  const scale = compact ? 'scale-[0.82]' : 'scale-100';

  return (
    <>
      {SPONSOR_WALL_SPORT_WATERMARKS.map(({ id, Icon, className, opacity }) => (
        <Icon
          key={id}
          className={cn(
            'absolute drop-shadow-[0_0_22px_rgba(0,229,255,0.45)]',
            scale,
            opacity ?? 'opacity-[0.38]',
            className
          )}
        />
      ))}
    </>
  );
}
