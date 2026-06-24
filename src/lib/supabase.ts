import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoricalDnaRow } from './types';

let adminClient: SupabaseClient | null = null;
let clientKey: string | null = null;

function resolveSupabaseKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
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

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseKey();
  return Boolean(url && key);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = resolveSupabaseKey();
  if (!url || !key) return null;

  if (adminClient && clientKey === key) return adminClient;

  const options = isNewFormatKey(key)
    ? { auth: { persistSession: false }, global: { fetch: createPublishableFetch(key) } }
    : { auth: { persistSession: false } };

  adminClient = createClient(url, key, options);
  clientKey = key;
  return adminClient;
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
