import { getSupabaseAdmin } from './supabase';
import { PILOT_DNA_SLUGS } from './ingest/watchlist';
import type { HistoricalDnaRow } from './types';

export type AppSuccessStats = {
  /** Acierto medio casos ADN históricos validados (patrones pasados) */
  adn_historical_hit_pct: number | null;
  adn_pilot_count: number;
  /** Feedback real del ciclo patio */
  feedback_total: number;
  feedback_viral: number;
  feedback_arrived_es: number;
  feedback_no_show: number;
  feedback_false_positive: number;
  /** % predicciones que acertaron (viral o llegó ES) */
  live_hit_pct: number | null;
  predictions_tracked: number;
  has_live_data: boolean;
};

export function computeAdnHistoricalHit(dnaRows: HistoricalDnaRow[]): {
  pct: number | null;
  pilotCount: number;
} {
  const pilots = PILOT_DNA_SLUGS.map((slug) => dnaRows.find((r) => r.slug === slug)).filter(
    (r): r is HistoricalDnaRow => r != null && r.success_rate != null
  );
  if (!pilots.length) return { pct: null, pilotCount: 0 };
  const avg = pilots.reduce((s, r) => s + (r.success_rate ?? 0), 0) / pilots.length;
  return { pct: Math.round(avg * 100), pilotCount: pilots.length };
}

export async function fetchAppSuccessStats(
  dnaRows: HistoricalDnaRow[],
  predictionsCount: number
): Promise<AppSuccessStats> {
  const { pct: adn_historical_hit_pct, pilotCount: adn_pilot_count } =
    computeAdnHistoricalHit(dnaRows);

  let feedback_total = 0;
  let feedback_viral = 0;
  let feedback_arrived_es = 0;
  let feedback_no_show = 0;
  let feedback_false_positive = 0;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data } = await supabase.from('trend_cycle_feedback').select('feedback_type');
    for (const row of data ?? []) {
      feedback_total += 1;
      switch (row.feedback_type) {
        case 'playground_viral':
          feedback_viral += 1;
          break;
        case 'arrived_es':
          feedback_arrived_es += 1;
          break;
        case 'no_show':
          feedback_no_show += 1;
          break;
        case 'false_positive':
          feedback_false_positive += 1;
          break;
      }
    }
  }

  const hits = feedback_viral + feedback_arrived_es;
  const live_hit_pct =
    feedback_total > 0 ? Math.round((hits / feedback_total) * 100) : null;

  return {
    adn_historical_hit_pct,
    adn_pilot_count,
    feedback_total,
    feedback_viral,
    feedback_arrived_es,
    feedback_no_show,
    feedback_false_positive,
    live_hit_pct,
    predictions_tracked: predictionsCount,
    has_live_data: feedback_total > 0,
  };
}
