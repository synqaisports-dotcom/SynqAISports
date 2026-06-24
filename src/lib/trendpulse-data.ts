import { buildCursorReport } from './cursor-report';
import { fetchCorridorDelays, fetchHistoricalDna, hasSupabaseServiceRole } from './supabase';
import { fetchLiveSignals, refreshRadarFromScrape, fetchRadarDailyMap } from './radar';
import { DEMO_SEED } from './demo-seed';
import { DEMO_CORRIDORS, corridorsBySlug } from './demo-corridors';
import { DEMO_RADAR } from './demo-radar';
import { PILOT_DNA_SLUGS, WATCHLIST } from './ingest/watchlist';
import type { CorridorDelayRow, HistoricalDnaRow } from './types';
import type { LiveSignalRow } from './radar-types';

function sortPilotRadarSignals(signals: LiveSignalRow[]): LiveSignalRow[] {
  const order = WATCHLIST.map((w) => w.slug);
  const pilot = order
    .map((slug) => signals.find((s) => s.slug === slug))
    .filter((s): s is LiveSignalRow => s != null);
  return pilot.length > 0 ? pilot : signals.slice(0, 5);
}

export type TrendPulseData = {
  rows: HistoricalDnaRow[];
  pilotRows: HistoricalDnaRow[];
  corridors: CorridorDelayRow[];
  corridorMap: Map<string, CorridorDelayRow>;
  radarSignals: LiveSignalRow[];
  radarIsDemo: boolean;
  hasScrapeData: boolean;
  secretKeyConfigured: boolean;
  radarError: string | null;
  scrapePersistReason: string | null;
  scrapeErrors: string[];
  radarDaily: Map<string, number[]>;
  supabaseConnected: boolean;
  configured: boolean;
  error: string | null;
  avgDelay: number | null;
  report: string;
};

export async function loadTrendPulseData(options?: {
  refreshScrape?: boolean;
}): Promise<TrendPulseData> {
  const { rows: fromDb, configured, error } = await fetchHistoricalDna();
  const { rows: corridorsFromDb } = await fetchCorridorDelays();
  const supabaseConnected = configured && fromDb.length > 0 && !error;
  const rows = supabaseConnected ? fromDb : DEMO_SEED;
  const corridors =
    supabaseConnected && corridorsFromDb.length > 0 ? corridorsFromDb : DEMO_CORRIDORS;
  const corridorMap = corridorsBySlug(corridors);
  const report = buildCursorReport(rows, supabaseConnected, configured, error);

  let scrapePersistReason: string | null = null;
  let scrapeErrors: string[] = [];

  if (supabaseConnected && options?.refreshScrape !== false) {
    const scrape = await refreshRadarFromScrape();
    if (!scrape.persisted && scrape.persistReason) {
      scrapePersistReason = scrape.persistReason;
    }
    scrapeErrors = scrape.persistErrors ?? scrape.preview?.errors ?? [];
  }

  const secretKeyConfigured = hasSupabaseServiceRole();
  const { rows: radarFromDb, error: radarError } = await fetchLiveSignals();
  const rawRadar = radarFromDb.length > 0 ? radarFromDb : DEMO_RADAR;
  const radarSignals = sortPilotRadarSignals(rawRadar);
  const radarIsDemo = radarFromDb.length === 0;
  const radarDaily = await fetchRadarDailyMap(radarSignals.map((s) => s.slug));
  const hasScrapeData = radarFromDb.some(
    (r) => r.signal_source?.startsWith('scrape:') || r.last_scraped_at != null
  );

  const pilotRows = PILOT_DNA_SLUGS.map((slug) => rows.find((r) => r.slug === slug)).filter(
    (r): r is HistoricalDnaRow => r != null
  );

  const withDelay = rows.filter((r) => r.delay_days_to_target != null);
  const avgDelay =
    withDelay.length > 0
      ? Math.round(
          withDelay.reduce((s, r) => s + (r.delay_days_to_target ?? 0), 0) / withDelay.length
        )
      : null;

  return {
    rows,
    pilotRows,
    corridors,
    corridorMap,
    radarSignals,
    radarIsDemo,
    hasScrapeData,
    secretKeyConfigured,
    radarError,
    scrapePersistReason,
    scrapeErrors,
    radarDaily,
    supabaseConnected,
    configured,
    error,
    avgDelay,
    report,
  };
}

export function formatTrendDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
