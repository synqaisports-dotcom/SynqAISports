import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoricalDnaRow } from './types';

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, { auth: { persistSession: false } });
  }
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
