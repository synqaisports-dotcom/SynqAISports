'use client';

import Image from 'next/image';
import {
  layoutSponsorsOnWall,
  sponsorWallEntranceClass,
  SPONSOR_WALL_GRID_COLS,
  SPONSOR_WALL_GRID_ROWS,
  type SponsorWallEntrance,
} from '@/lib/sponsor-wall';
import type { SignageSponsor } from '@/lib/signage';
import { cn } from '@/lib/utils';
import { SponsorWallWatermark } from '@/components/portal/signage/SponsorWallWatermark';

type Props = {
  sponsors: SignageSponsor[];
  clubName: string;
  clubLogoUrl: string | null;
  compact?: boolean;
  entrance?: SponsorWallEntrance;
  replayKey?: number;
};

export function SponsorWallSlide({
  sponsors,
  clubName,
  clubLogoUrl,
  compact = false,
  entrance = 'stagger-fade',
  replayKey = 0,
}: Props) {
  const placements = layoutSponsorsOnWall(sponsors);

  return (
    <div
      key={replayKey}
      className={cn(
        'relative h-full w-full overflow-hidden bg-gradient-to-br from-[#060a12] via-[#0a1628] to-[#060a12]',
        compact ? 'p-3' : 'p-5'
      )}
    >
      <SponsorWallWatermark compact={compact} />

      {/* Sección de club oculta visualmente (escudo + nombre para el sistema / accesibilidad) */}
      <div className="sr-only">
        {clubLogoUrl ? <img src={clubLogoUrl} alt="" /> : null}
        <span>{clubName}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] flex items-center justify-center gap-3 opacity-0" aria-hidden>
        {clubLogoUrl ? (
          <Image src={clubLogoUrl} alt="" width={48} height={48} className="object-contain" />
        ) : null}
        <span className="text-lg font-semibold">{clubName}</span>
      </div>

      <div
        className={cn('relative z-10 grid h-full w-full gap-1.5', compact && 'gap-1')}
        style={{
          gridTemplateColumns: `repeat(${SPONSOR_WALL_GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${SPONSOR_WALL_GRID_ROWS}, minmax(0, 1fr))`,
        }}
      >
        {placements.map((placement, index) => (
          <div
            key={placement.sponsor.id}
            className={cn(
              'flex items-center justify-center rounded-lg p-1.5',
              sponsorWallEntranceClass(entrance)
            )}
            style={{
              gridColumn: `${placement.col + 1} / span ${placement.cols}`,
              gridRow: `${placement.row + 1} / span ${placement.rows}`,
              animationDelay: `${index * 120}ms`,
            }}
          >
            {placement.sponsor.logo_url ? (
              <img
                src={placement.sponsor.logo_url}
                alt={placement.sponsor.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
              />
            ) : (
              <div
                className={cn(
                  'flex size-full max-h-20 max-w-full items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/5 font-bold text-cyan-100',
                  placement.sponsor.tier === 'gold' ? 'text-2xl' : placement.sponsor.tier === 'silver' ? 'text-lg' : 'text-base'
                )}
              >
                {placement.sponsor.name.slice(0, 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
