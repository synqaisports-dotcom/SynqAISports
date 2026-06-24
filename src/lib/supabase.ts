import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CorridorDelayRow, HistoricalDnaRow } from './types';

let adminClient: SupabaseClient | null = null;
let clientKey: string | null = null;

function resolveSupabaseReadKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function isNewFormatKey(key: string): boolean {
  return key.startsWith('sb_publishable_') || key.startsWith('sb_secret_');
}

/** Claves sb_publishable_ no van en Authorization: Bearer (solo apikey). */
function createPublishableFetch(key: string): typeof fetch {
  return async (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set('apikey', key);
    headers.delete('Authorization');
    return fetch(input, { ...init, headers });
  };
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseReadKey();
  if (!url || !key) return null;

  if (adminClient && clientKey === key) return adminClient;

  const options = isNewFormatKey(key)
    ? { auth: { persistSession: false }, global: { fetch: createPublishableFetch(key) } }
    : { auth: { persistSession: false } };

  adminClient = createClient(url, key, options);
  clientKey = key;
  return adminClient;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseReadKey();
  return Boolean(url && key);
}

export function hasSupabaseServiceRole(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  return Boolean(url && key);
}

/** Cliente con permisos de escritura para cron / ingesta. */
export function getSupabaseServiceRole(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;

  // sb_secret_ y legacy eyJ necesitan Authorization estándar para escribir
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type FetchDnaResult = {
  rows: HistoricalDnaRow[];
  configured: boolean;
  error: string | null;
};

export async function fetchHistoricalDna(): Promise<FetchDnaResult> {
  const configured = isSupabaseConfigured();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { rows: [], configured: false, error: null };
  }

  const { data, error } = await supabase
    .from('trend_historical_dna')
    .select('*')
    .eq('is_active', true)
    .order('origin_peak_date', { ascending: false });

  if (error) {
    console.error('[TrendPulse] fetchHistoricalDna', error.message);
    return { rows: [], configured: true, error: error.message };
  }

  return { rows: (data ?? []) as HistoricalDnaRow[], configured: true, error: null };
}

export type FetchCorridorsResult = {
  rows: CorridorDelayRow[];
  configured: boolean;
  error: string | null;
};

export async function fetchCorridorDelays(): Promise<FetchCorridorsResult> {
  const configured = isSupabaseConfigured();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { rows: [], configured: false, error: null };
  }

  const { data, error } = await supabase
    .from('trend_corridor_delays')
    .select(
      'id, dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes, trend_historical_dna!inner(slug)'
    )
    .eq('target_market', 'LATAM');

  if (error) {
    console.error('[TrendPulse] fetchCorridorDelays', error.message);
    return { rows: [], configured: true, error: error.message };
  }

  const rows: CorridorDelayRow[] = (data ?? []).map((row) => {
    const joined = row.trend_historical_dna as { slug: string } | { slug: string }[];
    const slug = Array.isArray(joined) ? joined[0]?.slug : joined?.slug;
    return {
      id: row.id,
      dna_id: row.dna_id,
      slug,
      origin_region: row.origin_region,
      target_market: row.target_market,
      reference_date: row.reference_date,
      delay_days: row.delay_days,
      relation_to_es: row.relation_to_es,
      notes: row.notes,
    };
  });

  return { rows, configured: true, error: null };
}
