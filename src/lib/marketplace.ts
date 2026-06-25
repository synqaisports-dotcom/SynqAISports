import { getSupabaseServiceRole, getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import type { MarketplaceCandidate } from './cycle-types';

type IngestPayload = {
  scraped_at: string;
  candidates: MarketplaceCandidate[];
};

type CandidateRow = MarketplaceCandidate & {
  estimated_arrival_es?: string | null;
  summer_fit?: boolean;
  weighted_score?: number;
  signal_latam?: number;
  signal_reddit?: number;
};

export async function persistMarketplaceCandidates(
  result: IngestPayload
): Promise<{ ok: boolean; reason?: string }> {
  const supabase = getSupabaseServiceRole();
  if (!supabase) return { ok: false, reason: 'missing_SUPABASE_SECRET_KEY' };

  const rows = result.candidates.map((c) => {
    const ext = c as CandidateRow & { weighted?: number };
    return {
      slug: c.slug,
      canonical_name: c.canonical_name,
      world: c.world,
      image_url: c.image_url,
      origin_price_eur: c.origin_price_eur,
      origin_marketplace: c.origin_marketplace,
      purchase_url: c.purchase_url,
      units_sold_label: c.units_sold_label,
      signal_cn: c.signal_cn,
      signal_us: c.signal_us,
      signal_es: c.signal_es,
      signal_latam: ext.signal_latam ?? c.signal_latam ?? 0,
      signal_reddit: ext.signal_reddit ?? c.signal_reddit ?? 0,
      weighted_score: ext.weighted_score ?? ext.weighted ?? 0,
      dna_match_slug: c.dna_match_slug,
      estimated_window_es: c.estimated_window_es,
      estimated_arrival_es: ext.estimated_arrival_es ?? null,
      summer_fit: ext.summer_fit ?? false,
      source_type: c.source_type,
      notes: c.notes,
      scraped_at: result.scraped_at,
      is_active: true,
    };
  });

  const { error } = await supabase.from('trend_marketplace_candidates').upsert(rows, {
    onConflict: 'slug',
  });

  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function fetchMarketplaceCandidates(): Promise<{
  rows: MarketplaceCandidate[];
  fromDb: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { rows: [], fromDb: false, error: null };
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return { rows: [], fromDb: false, error: null };

  const { data, error } = await supabase
    .from('trend_marketplace_candidates')
    .select('*')
    .eq('is_active', true)
    .order('summer_fit', { ascending: false })
    .order('weighted_score', { ascending: false });

  if (error) {
    return { rows: [], fromDb: false, error: error.message };
  }

  const rows: MarketplaceCandidate[] = (data ?? []).map((r) => ({
    slug: r.slug,
    canonical_name: r.canonical_name,
    world: r.world,
    image_url: r.image_url ?? '',
    origin_price_eur: Number(r.origin_price_eur),
    origin_marketplace: r.origin_marketplace ?? '',
    purchase_url: r.purchase_url ?? '',
    units_sold_label: r.units_sold_label,
    signal_cn: r.signal_cn ?? 0,
    signal_us: r.signal_us ?? 0,
    signal_es: r.signal_es ?? 0,
    dna_match_slug: r.dna_match_slug,
    estimated_window_es: r.estimated_window_es,
    source_type: r.source_type ?? 'marketplace_2c',
    notes: r.notes,
    estimated_arrival_es: r.estimated_arrival_es,
    summer_fit: r.summer_fit ?? false,
    is_predicted: r.source_type === 'prediction',
    prediction_score: Number(r.weighted_score ?? 0),
    evidence_urls: [],
  }));

  return { rows, fromDb: rows.length > 0, error: null };
}

export async function fetchMarketplaceCandidateBySlug(
  slug: string
): Promise<{ candidate: MarketplaceCandidate | null; fromDb: boolean }> {
  if (!isSupabaseConfigured()) {
    return { candidate: null, fromDb: false };
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return { candidate: null, fromDb: false };

  const { data, error } = await supabase
    .from('trend_marketplace_candidates')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return { candidate: null, fromDb: false };

  const candidate: MarketplaceCandidate = {
    slug: data.slug,
    canonical_name: data.canonical_name,
    world: data.world,
    image_url: data.image_url ?? '',
    origin_price_eur: Number(data.origin_price_eur),
    origin_marketplace: data.origin_marketplace ?? '',
    purchase_url: data.purchase_url ?? '',
    units_sold_label: data.units_sold_label,
    signal_cn: data.signal_cn ?? 0,
    signal_us: data.signal_us ?? 0,
    signal_es: data.signal_es ?? 0,
    dna_match_slug: data.dna_match_slug,
    estimated_window_es: data.estimated_window_es,
    source_type: data.source_type ?? 'marketplace_2c',
    notes: data.notes,
    estimated_arrival_es: data.estimated_arrival_es,
    summer_fit: data.summer_fit ?? false,
    is_predicted: data.source_type === 'prediction',
    prediction_score: Number(data.weighted_score ?? 0),
    evidence_urls: [],
    signal_latam: data.signal_latam ?? 0,
    signal_reddit: data.signal_reddit ?? 0,
  };

  return { candidate, fromDb: true };
}
