import { cn } from '@/lib/utils';

export const SPONSOR_WALL_SPORT_ASSETS = {
  football: '/signage/watermark/football.svg',
  basketball: '/signage/watermark/basketball.svg',
  volleyball: '/signage/watermark/volleyball.svg',
  waterpolo: '/signage/watermark/waterpolo.svg',
} as const;

type SportWatermark = {
  id: string;
  src: (typeof SPONSOR_WALL_SPORT_ASSETS)[keyof typeof SPONSOR_WALL_SPORT_ASSETS];
  className: string;
  opacity?: string;
};

/** Cuatro balones decorativos — uno por deporte, distribuidos en las esquinas del muro. */
export const SPONSOR_WALL_SPORT_WATERMARKS: SportWatermark[] = [
  {
    id: 'football-tl',
    src: SPONSOR_WALL_SPORT_ASSETS.football,
    className: 'left-[3%] top-[8%] size-[88px] -rotate-[16deg]',
    opacity: 'opacity-[0.32]',
  },
  {
    id: 'volleyball-tr',
    src: SPONSOR_WALL_SPORT_ASSETS.volleyball,
    className: 'right-[4%] top-[10%] size-[84px] rotate-[12deg]',
    opacity: 'opacity-[0.34]',
  },
  {
    id: 'basketball-bl',
    src: SPONSOR_WALL_SPORT_ASSETS.basketball,
    className: 'left-[5%] bottom-[10%] size-[90px] rotate-[10deg]',
    opacity: 'opacity-[0.33]',
  },
  {
    id: 'waterpolo-br',
    src: SPONSOR_WALL_SPORT_ASSETS.waterpolo,
    className: 'right-[3%] bottom-[8%] size-[86px] -rotate-[8deg]',
    opacity: 'opacity-[0.35]',
  },
];

/** Capa de marca de agua deportiva — balones SVG en colores SynqAI (#00E5FF / #66F7FF). */
export function SportBallLayer({ compact }: { compact?: boolean }) {
  const scale = compact ? 'scale-[0.82]' : 'scale-100';

  return (
    <>
      {SPONSOR_WALL_SPORT_WATERMARKS.map(({ id, src, className, opacity }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={id}
          src={src}
          alt=""
          aria-hidden
          className={cn(
            'absolute select-none drop-shadow-[0_0_22px_rgba(0,229,255,0.4)]',
            scale,
            opacity ?? 'opacity-[0.32]',
            className
          )}
          draggable={false}
        />
      ))}
    </>
  );
}
