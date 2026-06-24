import { getSupabaseAdmin } from './supabase';
import type { LiveSignalRow } from './radar-types';

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
    if (error.message.includes('does not exist')) {
      return { rows: [], error: 'tabla_pendiente' };
    }
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as LiveSignalRow[], error: null };
}

export function daysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  return Math.round((target.getTime() - now.getTime()) / 86_400_000);
}
