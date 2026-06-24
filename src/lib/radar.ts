import { getSupabaseAdmin, getSupabaseServiceRole } from './supabase';
import type { LiveSignalRow } from './radar-types';
import { PHASE_2B_SOURCES } from './ingest/watchlist';
import { runIngest, type IngestSignal } from './ingest/run-ingest';

export async function fetchLiveSignals(): Promise<{
  rows: LiveSignalRow[];
  error: string | null;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { rows: [], error: null };

  const { data, error } = await supabase
    .from('trend_live_signals')
    .select('*')
    .eq('is_active', true)
    .order('detected_at', { ascending: false });

  if (error) {
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as LiveSignalRow[], error: null };
}

async function getLastIngestAgeHours(): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from('trend_ingest_runs')
    .select('ran_at')
    .order('ran_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data?.ran_at) return null;
  return (Date.now() - new Date(data.ran_at).getTime()) / 3_600_000;
}

function toRow(signal: IngestSignal) {
  return {
    ...signal,
    is_active: true,
    last_scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function isRealScrapeSource(source: string | null | undefined): boolean {
  return source?.startsWith('scrape:') ?? false;
}

export async function persistIngestSignals(signals: IngestSignal[], errors: string[]) {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return { ok: false, reason: 'missing_service_role_key' as const, errors };
  }

  let saved = 0;
  for (const signal of signals) {
    const { error } = await supabase
      .from('trend_live_signals')
      .upsert(toRow(signal), { onConflict: 'slug' });
    if (error) {
      errors.push(`upsert:${signal.slug}:${error.message}`);
    } else {
      saved += 1;
      const today = new Date().toISOString().slice(0, 10);
      const { error: dailyErr } = await supabase.from('trend_radar_daily').upsert(
        {
          signal_slug: signal.slug,
          snapshot_date: today,
          scrape_hits: signal.scrape_hits,
          weighted_score: signal.source_breakdown.weighted,
          source_breakdown: signal.source_breakdown,
        },
        { onConflict: 'signal_slug,snapshot_date' }
      );
      if (dailyErr) errors.push(`daily:${signal.slug}:${dailyErr.message}`);
    }
  }

  if (saved === 0) {
    return { ok: false, reason: 'upsert_failed' as const, errors };
  }

  const { error: logError } = await supabase.from('trend_ingest_runs').insert({
    signals_count: saved,
    errors,
    sources: [...PHASE_2B_SOURCES],
    log: {
      phase: '2b',
      signals: signals.map((s) => ({
        slug: s.slug,
        hits: s.scrape_hits,
        breakdown: s.source_breakdown,
      })),
    },
  });

  if (logError) {
    errors.push(`ingest_log:${logError.message}`);
  }

  return { ok: true, count: saved, errors };
}

/** Ejecuta scraping y guarda si hay service role; si no, solo devuelve preview. */
export async function refreshRadarFromScrape(): Promise<{
  ran: boolean;
  preview?: Awaited<ReturnType<typeof runIngest>>;
  persisted?: boolean;
  persistReason?: string;
  persistErrors?: string[];
}> {
  const age = await getLastIngestAgeHours();
  const live = await fetchLiveSignals();
  const hasRealScrape = live.rows.some((r) => isRealScrapeSource(r.signal_source));

  if (age != null && age < 48 && hasRealScrape) {
    return { ran: false, persisted: true };
  }

  const result = await runIngest();
  const persist = await persistIngestSignals(result.signals, result.errors);

  return {
    ran: true,
    preview: result,
    persisted: persist.ok,
    persistReason: persist.ok ? undefined : persist.reason,
    persistErrors: persist.errors ?? result.errors,
  };
}

export function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}

export type DailyPoint = { date: string; weighted: number };

export async function fetchRadarDailyMap(
  slugs: string[]
): Promise<Map<string, number[]>> {
  const map = new Map<string, number[]>();
  if (slugs.length === 0) return map;

  const supabase = getSupabaseAdmin();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from('trend_radar_daily')
    .select('signal_slug, snapshot_date, weighted_score')
    .in('signal_slug', slugs)
    .order('snapshot_date', { ascending: true });

  if (error || !data) return map;

  for (const slug of slugs) {
    map.set(
      slug,
      data.filter((r) => r.signal_slug === slug).map((r) => Number(r.weighted_score))
    );
  }
  return map;
}

export async function fetchRadarSignalBySlug(
  slug: string
): Promise<{ signal: LiveSignalRow | null; daily: DailyPoint[] }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { signal: null, daily: [] };

  const { data: signal } = await supabase
    .from('trend_live_signals')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  const { data: daily } = await supabase
    .from('trend_radar_daily')
    .select('snapshot_date, weighted_score, scrape_hits, source_breakdown')
    .eq('signal_slug', slug)
    .order('snapshot_date', { ascending: true });

  return {
    signal: (signal as LiveSignalRow) ?? null,
    daily: (daily ?? []).map((d) => ({
      date: d.snapshot_date,
      weighted: Number(d.weighted_score),
    })),
  };
}
