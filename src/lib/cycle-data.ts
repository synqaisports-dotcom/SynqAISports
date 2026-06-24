import { unstable_cache } from 'next/cache';
import { buildDemoCycle } from './cycle/build-cycle';
import type { CycleSlotRow, TrendCycleRow, MarketplaceCandidate } from './cycle-types';
import type { LiveSignalRow } from './radar-types';
import { runPredictionIngest } from './ingest/run-prediction-ingest';
import { daysUntilSeptember } from './ingest/discovery-queries';
import { fetchMarketplaceCandidates, persistMarketplaceCandidates } from './marketplace';
import { hasSupabaseServiceRole } from './supabase';

export type CycleData = {
  cycle: TrendCycleRow;
  slots: CycleSlotRow[];
  isDemo: boolean;
};

export type PredictionData = {
  candidates: MarketplaceCandidate[];
  scraped_at: string | null;
  days_until_september: number;
  fromDb: boolean;
  isLive: boolean;
};

const cachedPredictions = unstable_cache(
  async () => runPredictionIngest(),
  ['trendpulse-predictions-v2'],
  { revalidate: 3600 }
);

/** Predicciones desde señales (titulares News+Reddit) — sin catálogo fijo. */
export async function loadPredictionData(options?: {
  refresh?: boolean;
}): Promise<PredictionData> {
  const days_until_september = daysUntilSeptember();

  if (!options?.refresh) {
    const { rows, fromDb } = await fetchMarketplaceCandidates();
    const predicted = rows.filter((r) => r.source_type === 'prediction' || r.is_predicted);
    if (fromDb && predicted.length > 0) {
      return {
        candidates: predicted,
        scraped_at: null,
        days_until_september,
        fromDb: true,
        isLive: true,
      };
    }
  }

  const result = await cachedPredictions();

  if (hasSupabaseServiceRole()) {
    await persistMarketplaceCandidates({
      scraped_at: result.scraped_at,
      candidates: result.predictions,
    });
  }

  return {
    candidates: result.predictions,
    scraped_at: result.scraped_at,
    days_until_september: result.days_until_september,
    fromDb: false,
    isLive: true,
  };
}

/** @deprecated usar loadPredictionData */
export const loadMarketplaceData = loadPredictionData;

export async function loadCycleData(
  radarSignals: LiveSignalRow[],
  predictions?: MarketplaceCandidate[]
): Promise<CycleData> {
  const pool = (predictions ?? []).filter((p) => p.is_predicted !== false && p.source_type === 'prediction');
  const { cycle, slots } = buildDemoCycle([], pool);
  return {
    cycle,
    slots,
    isDemo: pool.length === 0,
  };
}
