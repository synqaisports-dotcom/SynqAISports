import { unstable_cache } from 'next/cache';
import { buildDemoCycle } from './cycle/build-cycle';
import type { CycleSlotRow, TrendCycleRow } from './cycle-types';
import type { LiveSignalRow } from './radar-types';
import { isExcludedAdnCase } from './ingest/marketplace-catalog';
import { runMarketplaceIngest } from './ingest/run-marketplace-ingest';
import { fetchMarketplaceCandidates, persistMarketplaceCandidates } from './marketplace';
import { hasSupabaseServiceRole } from './supabase';
import { daysUntilSeptember } from './ingest/marketplace-catalog';
import type { MarketplaceCandidate } from './cycle-types';

export type CycleData = {
  cycle: TrendCycleRow;
  slots: CycleSlotRow[];
  isDemo: boolean;
};

export type MarketplaceData = {
  candidates: MarketplaceCandidate[];
  scraped_at: string | null;
  days_until_september: number;
  fromDb: boolean;
  isLive: boolean;
};

const cachedIngest = unstable_cache(
  async () => runMarketplaceIngest(),
  ['trendpulse-marketplace-2c'],
  { revalidate: 3600 }
);

export async function loadMarketplaceData(options?: {
  refresh?: boolean;
}): Promise<MarketplaceData> {
  const days_until_september = daysUntilSeptember();

  if (!options?.refresh) {
    const { rows, fromDb } = await fetchMarketplaceCandidates();
    if (fromDb && rows.length > 0) {
      return {
        candidates: filterDiscoveryCandidates(rows),
        scraped_at: null,
        days_until_september,
        fromDb: true,
        isLive: true,
      };
    }
  }

  const result = await cachedIngest();

  if (hasSupabaseServiceRole()) {
    await persistMarketplaceCandidates(result);
  }

  return {
    candidates: filterDiscoveryCandidates(result.candidates),
    scraped_at: result.scraped_at,
    days_until_september: result.days_until_september,
    fromDb: false,
    isLive: true,
  };
}

/** Solo candidatos de descubrimiento — sin pilotos radar ni casos ADN cerrados. */
export function filterDiscoveryCandidates(
  candidates: import('./cycle-types').MarketplaceCandidate[]
): import('./cycle-types').MarketplaceCandidate[] {
  return candidates.filter(
    (c) =>
      c.source_type === 'marketplace_2c' &&
      !c.slug.startsWith('radar-') &&
      !isExcludedAdnCase(c.dna_match_slug)
  );
}

/** Ciclo patio con candidatos marketplace 2c (prioridad sobre demo estático). */
export async function loadCycleData(
  radarSignals: LiveSignalRow[],
  marketplace?: MarketplaceCandidate[]
): Promise<CycleData> {
  const { cycle, slots } = buildDemoCycle(radarSignals, marketplace);
  return {
    cycle,
    slots,
    isDemo: !marketplace?.length,
  };
}
