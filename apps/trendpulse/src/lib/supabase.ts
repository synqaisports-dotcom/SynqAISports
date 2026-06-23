import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { HistoricalDnaRow } from '@/lib/types';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!adminClient) {
    adminClient = createClient(url, key, { auth: { persistSession: false } });
  }
  return adminClient;
}

export async function fetchHistoricalDna(): Promise<HistoricalDnaRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('trend_historical_dna')
    .select('*')
    .eq('is_active', true)
    .order('origin_peak_date', { ascending: false });

  if (error) {
    console.error('[TrendPulse] fetchHistoricalDna', error.message);
    return [];
  }
  return (data ?? []) as HistoricalDnaRow[];
}
