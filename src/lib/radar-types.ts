export type SignalStatus = 'watching' | 'emerging' | 'peak_es' | 'decline';
export type SignalConfidence = 'low' | 'medium' | 'high';

export type SourceBreakdown = {
  es: number;
  us: number;
  cn: number;
  latam: number;
  pod: number;
  reddit: number;
  weighted: number;
};

export type MentionSnippet = {
  title: string;
  title_es: string;
  link: string;
  channel: string;
};

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
  scrape_hits?: number;
  last_scraped_at?: string | null;
  source_breakdown?: SourceBreakdown | null;
  mention_snippets?: MentionSnippet[] | null;
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
