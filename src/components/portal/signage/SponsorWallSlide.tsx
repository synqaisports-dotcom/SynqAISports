'use client';

import {
  layoutSponsorsOnWall,
  sponsorWallEntranceClass,
  sponsorWallEntranceDelays,
  SPONSOR_WALL_GRID_COLS,
  SPONSOR_WALL_TIER_ZONES,
  zoneFlexWeight,
  zoneRowCount,
  type SponsorWallEntrance,
  type SponsorWallPlacement,
} from '@/lib/sponsor-wall';
import type { SignageSponsor, SponsorTier } from '@/lib/signage';
import { SPONSOR_TIER_LABELS } from '@/lib/signage';
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

function TierZone({
  tier,
  placements,
  flexWeight,
  entrance,
  entranceDelays,
  compact,
}: {
  tier: SponsorTier;
  placements: SponsorWallPlacement[];
  flexWeight: number;
  entrance: SponsorWallEntrance;
  entranceDelays: Map<string, number>;
  compact: boolean;
}) {
  if (placements.length === 0) return null;

  const rows = zoneRowCount(placements, tier);

  return (
    <section
      className="flex min-h-0 w-full items-center justify-center [container-type:size]"
      style={{ flex: flexWeight }}
      aria-label={SPONSOR_TIER_LABELS[tier]}
    >
      <div
        className={cn('grid', compact ? 'gap-1' : 'gap-2 md:gap-3')}
        style={{
          aspectRatio: `${SPONSOR_WALL_GRID_COLS} / ${rows}`,
          width: `min(100cqw, calc(100cqh * ${SPONSOR_WALL_GRID_COLS} / ${rows}))`,
          height: `min(100cqh, calc(100cqw * ${rows} / ${SPONSOR_WALL_GRID_COLS}))`,
          gridTemplateColumns: `repeat(${SPONSOR_WALL_GRID_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {placements.map((placement) => (
          <div
            key={placement.sponsor.id}
            className={cn(
              'flex items-center justify-center rounded-lg',
              compact ? 'p-1' : 'p-2 md:p-3',
              placement.sponsor.tier === 'gold' && !compact && 'p-3',
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
                className="max-h-full max-w-full object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
              />
            ) : (
              <div
                className={cn(
                  'flex size-full items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/5 font-bold text-cyan-100',
                  placement.sponsor.tier === 'gold'
                    ? 'text-xl md:text-3xl'
                    : placement.sponsor.tier === 'silver'
                      ? 'text-lg md:text-2xl'
                      : 'text-base md:text-xl'
                )}
              >
                {placement.sponsor.name.slice(0, 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

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
        compact ? 'p-2' : 'p-3 md:p-5 lg:p-6'
      )}
    >
      <SponsorWallWatermark compact={compact} />

      <div className="sr-only">
        {clubLogoUrl ? <img src={clubLogoUrl} alt="" /> : null}
        <span>{clubName}</span>
      </div>

      <div className="relative z-10 flex h-full w-full min-h-0 flex-col gap-1 md:gap-2">
        {SPONSOR_WALL_TIER_ZONES.map((tier) => (
          <TierZone
            key={tier}
            tier={tier}
            placements={placements.filter((p) => p.zone === tier)}
            flexWeight={zoneFlexWeight(placements, tier)}
            entrance={entrance}
            entranceDelays={entranceDelays}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}
