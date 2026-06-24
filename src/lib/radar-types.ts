export type SignalStatus = 'watching' | 'emerging' | 'peak_es' | 'decline';
export type SignalConfidence = 'low' | 'medium' | 'high';

export interface LiveSignalRow {
  id: string;
  canonical_name: string;
  slug: string;
  status: SignalStatus;
  origin_region: string;
  detected_at: string;
  origin_peak_date: string | null;
  predicted_es_peak_date: string | null;
  predicted_delay_days: number | null;
  dna_match_slug: string | null;
  dna_match_score: number | null;
  confidence: SignalConfidence;
  signal_source: string;
  notes: string | null;
  reference_urls: string[];
}

export const SIGNAL_STATUS_LABELS: Record<SignalStatus, string> = {
  watching: 'En vigilancia',
  emerging: 'Emergiendo',
  peak_es: 'Pico ES',
  decline: 'En caída',
};

export const CONFIDENCE_LABELS: Record<SignalConfidence, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};
