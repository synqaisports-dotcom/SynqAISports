export type TrendWorld = 'playground' | 'collector' | 'adult';
export type CycleSlotMode = 'act' | 'observe';
export type CycleFeedbackType =
  | 'playground_viral'
  | 'arrived_es'
  | 'no_show'
  | 'false_positive';

export interface MarketplaceCandidate {
  slug: string;
  canonical_name: string;
  world: TrendWorld;
  image_url: string;
  origin_price_eur: number;
  origin_marketplace: string;
  purchase_url: string;
  units_sold_label: string | null;
  signal_cn: number;
  signal_us: number;
  signal_es: number;
  signal_latam?: number;
  signal_reddit?: number;
  dna_match_slug: string | null;
  estimated_window_es: string | null;
  source_type: string;
  notes: string | null;
  /** Fase 2c — estimación llegada ES */
  estimated_arrival_es?: string | null;
  summer_fit?: boolean;
  weighted_score?: number;
}

export interface TrendCycleRow {
  id: string;
  slug: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  status: 'draft' | 'active' | 'closed';
  notes: string | null;
}

export interface CycleSlotRow extends MarketplaceCandidate {
  id: string;
  cycle_id: string;
  mode: CycleSlotMode;
  sort_order: number;
  feedback: CycleFeedbackRow | null;
}

export interface CycleFeedbackRow {
  id: string;
  slot_id: string;
  feedback_type: CycleFeedbackType;
  rating: number | null;
  notes: string | null;
  recorded_at: string;
}

export const WORLD_LABELS: Record<TrendWorld, string> = {
  playground: 'Patio',
  collector: 'Coleccionista',
  adult: 'Adulto / gadget',
};

export const MODE_LABELS: Record<CycleSlotMode, string> = {
  act: 'Actuar',
  observe: 'Observar',
};

export const FEEDBACK_TYPE_LABELS: Record<CycleFeedbackType, string> = {
  playground_viral: 'Viral en el cole',
  arrived_es: 'Llegó a España',
  no_show: 'No apareció',
  false_positive: 'Falso positivo',
};
