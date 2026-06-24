export type WaveProfile =
  | 'micro_viral_playground'
  | 'collectible_cards'
  | 'media_spike'
  | 'seasonal_mass'
  | 'kidult_nostalgia';

export type CorridorRelation = 'before' | 'after' | 'parallel';

export interface CorridorDelayRow {
  id: string;
  dna_id: string;
  slug?: string;
  origin_region: string;
  target_market: string;
  reference_date: string | null;
  delay_days: number | null;
  relation_to_es: CorridorRelation | null;
  notes: string | null;
}

export interface HistoricalDnaRow {
  id: string;
  canonical_name: string;
  slug: string;
  product_line: string;
  wave_profile: WaveProfile;
  origin_region: string;
  origin_signal_start: string | null;
  origin_peak_date: string;
  target_market: string;
  target_signal_start: string | null;
  target_peak_date: string | null;
  delay_days_to_target: number | null;
  plateau_days: number | null;
  decline_start_date: string | null;
  decline_days: number | null;
  peak_search_volume: number | null;
  success_rate: number | null;
  reference_urls: string[];
  notes: string | null;
  dna_features: Record<string, unknown>;
}

export const WAVE_PROFILE_LABELS: Record<WaveProfile, string> = {
  micro_viral_playground: 'Micro-viral patio',
  collectible_cards: 'Cartas coleccionables',
  media_spike: 'Media spike',
  seasonal_mass: 'Estacional masiva',
  kidult_nostalgia: 'Kidult / nostalgia',
};
