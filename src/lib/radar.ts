import { getSupabaseAdmin, getSupabaseServiceRole } from './supabase';
import type { LiveSignalRow } from './radar-types';
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
    .order('last_scraped_at', { ascending: false, nullsFirst: false })
    .order('detected_at', { ascending: false });

  if (error) {
    if (error.message.includes('does not exist')) {
      return { rows: [], error: 'tabla_pendiente' };
    }
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

export async function persistIngestSignals(signals: IngestSignal[], errors: string[]) {
  const supabase = getSupabaseServiceRole();
  if (!supabase) {
    return { ok: false, reason: 'missing_service_role_key' };
  }

  for (const signal of signals) {
    await supabase.from('trend_live_signals').upsert(toRow(signal), { onConflict: 'slug' });
  }

  await supabase.from('trend_ingest_runs').insert({
    signals_count: signals.length,
    errors,
    log: { signals: signals.map((s) => ({ slug: s.slug, hits: s.scrape_hits })) },
  });

  return { ok: true, count: signals.length };
}

/** Ejecuta scraping y guarda si hay service role; si no, solo devuelve preview. */
export async function refreshRadarFromScrape(): Promise<{
  ran: boolean;
  preview?: Awaited<ReturnType<typeof runIngest>>;
  persisted?: boolean;
}> {
  const age = await getLastIngestAgeHours();
  const hasScrapeRows = (await fetchLiveSignals()).rows.some((r) =>
    r.signal_source?.includes('scrape')
  );

  if (age != null && age < 48 && hasScrapeRows) {
    return { ran: false };
  }

  const result = await runIngest();
  const persist = await persistIngestSignals(result.signals, result.errors);

  return { ran: true, preview: result, persisted: persist.ok };
}

export function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
