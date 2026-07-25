'use client';

import {
  SPONSOR_TIER_LABELS,
  SPONSOR_TIER_META,
  type SignageSponsor,
} from '@/lib/signage';
import { cn } from '@/lib/utils';

type Props = {
  sponsors: SignageSponsor[];
  compact?: boolean;
};

export function SponsorWallSlide({ sponsors, compact = false }: Props) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col bg-gradient-to-br from-[#060a12] via-[#0a1628] to-[#060a12]',
        compact ? 'p-4' : 'p-8'
      )}
    >
      <p
        className={cn(
          'text-center font-medium uppercase tracking-[0.25em] text-cyan-400/70',
          compact ? 'mb-3 text-[10px]' : 'mb-6 text-sm'
        )}
      >
        Patrocinadores del club
      </p>
      <div
        className={cn(
          'grid flex-1 auto-rows-fr items-center justify-items-center gap-3',
          compact ? 'grid-cols-3' : 'grid-cols-4 md:grid-cols-5'
        )}
      >
        {sponsors.map((sponsor, index) => (
          <div
            key={sponsor.id}
            className={cn(
              'signage-sponsor-wall-item flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-3',
              SPONSOR_TIER_META[sponsor.tier].gridCols,
              compact && 'col-span-1 row-span-1 p-2'
            )}
            style={{ animationDelay: `${index * 110}ms` }}
          >
            {sponsor.logo_url ? (
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className={cn(
                  'max-w-full object-contain',
                  sponsor.tier === 'gold' ? 'max-h-20' : sponsor.tier === 'silver' ? 'max-h-14' : 'max-h-10',
                  compact && 'max-h-10'
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 font-bold text-cyan-100',
                  sponsor.tier === 'gold' ? 'size-16 text-2xl' : 'size-12 text-lg',
                  compact && 'size-10 text-sm'
                )}
              >
                {sponsor.name.slice(0, 1)}
              </div>
            )}
            {!compact ? (
              <div className="mt-2 text-center">
                <p className="truncate text-xs font-medium text-white/90">{sponsor.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-cyan-400/50">
                  {SPONSOR_TIER_LABELS[sponsor.tier]}
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
