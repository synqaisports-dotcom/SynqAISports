import { cn } from '@/lib/utils';
import type { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function FootballBallIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.4" />
      <path
        strokeWidth="1.2"
        d="M12 3.5 14.8 8.2 12 12.5 9.2 8.2Z M12 12.5 15.8 14.5 14.8 19.2 12 16.8 9.2 19.2 8.2 14.5Z M12 3.5 8.5 6.2 5.8 9.5 M12 3.5 15.5 6.2 18.2 9.5"
      />
      <path strokeWidth="1" d="M5.8 9.5 8.2 14.5 9.2 19.2 M18.2 9.5 15.8 14.5 14.8 19.2" />
    </svg>
  );
}

export function BasketballBallIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.4" />
      <path strokeWidth="1.2" d="M12 2.5v19 M2.5 12h19" />
      <path strokeWidth="1.1" d="M4.8 5.2c3.2 2.8 11.2 2.8 14.4 0 M4.8 18.8c3.2-2.8 11.2-2.8 14.4 0" />
    </svg>
  );
}

export function VolleyballBallIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="12" r="9.5" strokeWidth="1.4" />
      <path strokeWidth="1.2" d="M12 2.5c0 6.4-4 10.4-9.5 9.5M12 2.5c0 6.4 4 10.4 9.5 9.5" />
      <path strokeWidth="1.1" d="M2.5 12h19M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

export function WaterPoloBallIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="11" r="8" strokeWidth="1.4" />
      <path strokeWidth="1.1" d="M6 11c2-2.5 10-2.5 12 0M8 14.5c1.5 1.5 6.5 1.5 8 0" />
      <path strokeWidth="1.2" strokeLinecap="round" d="M3 19.5c2-1 4-1.5 6-1.5s4 .5 6 1.5 4 1.5 6 1.5" />
      <path strokeWidth="1" strokeLinecap="round" opacity="0.7" d="M2 21.5c2.5-.8 5-1.2 7.5-1.2s5 .4 7.5 1.2" />
    </svg>
  );
}

export type SportBallDecoration = {
  id: string;
  Icon: ComponentType<IconProps>;
  className: string;
  opacity?: string;
};

export const SPONSOR_WALL_SPORT_DECORATIONS: SportBallDecoration[] = [
  {
    id: 'football-tl',
    Icon: FootballBallIcon,
    className: 'left-[4%] top-[10%] size-[58px] -rotate-[18deg]',
    opacity: 'opacity-35',
  },
  {
    id: 'volleyball-tr',
    Icon: VolleyballBallIcon,
    className: 'right-[5%] top-[12%] size-[54px] rotate-[14deg]',
    opacity: 'opacity-40',
  },
  {
    id: 'basketball-bl',
    Icon: BasketballBallIcon,
    className: 'left-[6%] bottom-[12%] size-[62px] rotate-[8deg]',
    opacity: 'opacity-38',
  },
  {
    id: 'waterpolo-br',
    Icon: WaterPoloBallIcon,
    className: 'right-[4%] bottom-[10%] size-[60px] -rotate-[10deg]',
    opacity: 'opacity-42',
  },
  {
    id: 'football-mr',
    Icon: FootballBallIcon,
    className: 'right-[3%] top-[44%] size-[44px] rotate-[22deg]',
    opacity: 'opacity-25',
  },
  {
    id: 'basketball-ml',
    Icon: BasketballBallIcon,
    className: 'left-[2%] top-[48%] size-[42px] -rotate-[12deg]',
    opacity: 'opacity-22',
  },
];

export function SportBallLayer({ compact }: { compact?: boolean }) {
  const scale = compact ? 'scale-90' : 'scale-100';
  return (
    <>
      {SPONSOR_WALL_SPORT_DECORATIONS.map(({ id, Icon, className, opacity }) => (
        <Icon
          key={id}
          className={cn(
            'absolute text-cyan-400 drop-shadow-[0_0_14px_rgba(0,229,255,0.35)]',
            scale,
            opacity ?? 'opacity-35',
            className
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </>
  );
}
