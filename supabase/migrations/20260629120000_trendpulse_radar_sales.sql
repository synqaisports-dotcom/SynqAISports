-- TrendPulse Radar: top ventas multi-marketplace en señales piloto

ALTER TABLE public.trend_live_signals
  ADD COLUMN IF NOT EXISTS top_by_marketplace jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS origin_orders_total integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS marketplace_search text,
  ADD COLUMN IF NOT EXISTS lead_image_url text,
  ADD COLUMN IF NOT EXISTS lead_price_eur numeric(10,2),
  ADD COLUMN IF NOT EXISTS lead_purchase_url text,
  ADD COLUMN IF NOT EXISTS sales_weighted_score numeric(6,2);

COMMENT ON COLUMN public.trend_live_signals.top_by_marketplace IS
  'Top 3 por marketplace: { aliexpress, amazon_es, amazon_us, temu }';
