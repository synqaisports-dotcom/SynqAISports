'use client';

import {
  layoutSponsorsOnWall,
  sponsorWallEntranceClass,
  sponsorWallEntranceDelays,
  sponsorWallGridTemplateRows,
  SPONSOR_WALL_GRID_COLS,
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
  const entranceDelays = sponsorWallEntranceDelays(placements);

  return (
    <div
      key={replayKey}
      className={cn(
        'relative h-full w-full overflow-hidden bg-gradient-to-br from-[#060a12] via-[#0a1628] to-[#060a12]',
        compact ? 'p-1.5' : 'p-3 md:p-4'
      )}
    >
      <SponsorWallWatermark compact={compact} />

      <div className="sr-only">
        {clubLogoUrl ? <img src={clubLogoUrl} alt="" /> : null}
        <span>{clubName}</span>
      </div>

      <div
        className={cn('relative z-10 grid h-full w-full min-h-0', compact ? 'gap-0.5' : 'gap-1 md:gap-1.5')}
        style={{
          gridTemplateColumns: `repeat(${SPONSOR_WALL_GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: sponsorWallGridTemplateRows(),
        }}
      >
        {placements.map((placement) => (
          <div
            key={placement.sponsor.id}
            className={cn(
              'flex items-center justify-center rounded-md',
              compact ? 'p-0.5' : 'p-1 md:p-1.5',
              sponsorWallEntranceClass(entrance)
            )}
            style={{
              gridColumn: `${placement.col + 1} / span ${placement.cols}`,
              gridRow: `${placement.row + 1} / span ${placement.rows}`,
              animationDelay: `${entranceDelays.get(placement.sponsor.id) ?? 0}ms`,
            }}
          >
            {placement.sponsor.logo_url ? (
              <img
                src={placement.sponsor.logo_url}
                alt={placement.sponsor.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
              />
            ) : (
              <div
                className={cn(
                  'flex size-full items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/5 font-bold text-cyan-100',
                  placement.sponsor.tier === 'gold'
                    ? compact
                      ? 'text-sm'
                      : 'text-lg md:text-xl'
                    : placement.sponsor.tier === 'silver'
                      ? compact
                        ? 'text-xs'
                        : 'text-base md:text-lg'
                      : compact
                        ? 'text-[10px]'
                        : 'text-sm md:text-base'
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
