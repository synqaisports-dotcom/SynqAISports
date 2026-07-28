'use client';

import {
  VolleyballBallArt,
  WaterPoloBallArt,
} from '@/components/portal/signage/sponsor-wall-sport-art';
import { cn } from '@/lib/utils';
import { useId, type ComponentType, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** Balón de fútbol — asset vectorial real del usuario (Google Drive). */
export function FootballBallIcon({ className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPONSOR_WALL_SPORT_ASSETS.football}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}

export function BasketballBallIcon({ className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SPONSOR_WALL_SPORT_ASSETS.basketball}
      alt=""
      aria-hidden
      draggable={false}
      className={className}
    />
  );
}

export function VolleyballBallIcon({ className, ...props }: IconProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <VolleyballBallArt uid={uid} />
    </svg>
  );
}

export function WaterPoloBallIcon({ className, ...props }: IconProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden {...props}>
      <WaterPoloBallArt uid={uid} />
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
    className: 'left-[2%] top-[6%] size-[110px] -rotate-[14deg]',
    opacity: 'opacity-[0.48]',
  },
  {
    id: 'volleyball-tr',
    Icon: VolleyballBallIcon,
    className: 'right-[3%] top-[8%] size-[100px] rotate-[10deg]',
    opacity: 'opacity-[0.44]',
  },
  {
    id: 'basketball-bl',
    Icon: BasketballBallIcon,
    className: 'left-[4%] bottom-[8%] size-[110px] rotate-[8deg]',
    opacity: 'opacity-[0.48]',
  },
  {
    id: 'waterpolo-br',
    Icon: WaterPoloBallIcon,
    className: 'right-[2%] bottom-[6%] size-[102px] -rotate-[6deg]',
    opacity: 'opacity-[0.45]',
  },
];

/** Capa de marca de agua deportiva. */
export function SportBallLayer({ compact }: { compact?: boolean }) {
  const scale = compact ? 'scale-[0.84]' : 'scale-100';

  return (
    <>
      {SPONSOR_WALL_SPORT_WATERMARKS.map(({ id, Icon, className, opacity }) => (
        <Icon
          key={id}
          className={cn(
            'absolute select-none drop-shadow-[0_0_28px_rgba(0,229,255,0.5)]',
            scale,
            opacity ?? 'opacity-[0.42]',
            className
          )}
        />
      ))}
    </>
  );
}
