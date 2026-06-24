export type MarketplaceId = 'aliexpress' | 'amazon_es' | 'amazon_us' | 'temu';

export type MarketplaceSearchHit = {
  item_id: string;
  title: string;
  image_url: string;
  price_eur: number;
  orders_count: number;
  orders_label: string | null;
  purchase_url: string;
  marketplace: MarketplaceId;
  search_query: string;
  fetched_at: string;
};

export const MARKETPLACE_LABELS: Record<MarketplaceId, string> = {
  aliexpress: 'AliExpress',
  amazon_es: 'Amazon ES',
  amazon_us: 'Amazon US',
  temu: 'Temu',
};

export const MARKETPLACE_COLORS: Record<MarketplaceId, string> = {
  aliexpress: 'emerald',
  amazon_es: 'amber',
  amazon_us: 'orange',
  temu: 'fuchsia',
};
