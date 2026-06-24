-- TrendPulse Fase 2c: candidatos marketplace (patio / verano)

CREATE TABLE IF NOT EXISTS public.trend_marketplace_candidates (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text UNIQUE NOT NULL,
  canonical_name        text NOT NULL,
  world                 text NOT NULL DEFAULT 'playground'
    CHECK (world IN ('playground', 'collector', 'adult')),
  image_url             text,
  origin_price_eur      numeric(10,2),
  origin_marketplace    text,
  purchase_url          text,
  units_sold_label      text,
  signal_cn             int NOT NULL DEFAULT 0,
  signal_us             int NOT NULL DEFAULT 0,
  signal_es             int NOT NULL DEFAULT 0,
  signal_latam          int NOT NULL DEFAULT 0,
  signal_reddit         int NOT NULL DEFAULT 0,
  weighted_score        numeric(8,2) NOT NULL DEFAULT 0,
  dna_match_slug        text,
  estimated_window_es   text,
  estimated_arrival_es  date,
  summer_fit            boolean NOT NULL DEFAULT false,
  source_type           text NOT NULL DEFAULT 'marketplace_2c',
  notes                 text,
  scraped_at            timestamptz NOT NULL DEFAULT now(),
  is_active             boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_marketplace_world ON public.trend_marketplace_candidates(world);
CREATE INDEX IF NOT EXISTS idx_marketplace_summer ON public.trend_marketplace_candidates(summer_fit) WHERE summer_fit;

ALTER TABLE public.trend_marketplace_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS marketplace_read ON public.trend_marketplace_candidates;
CREATE POLICY marketplace_read ON public.trend_marketplace_candidates FOR SELECT USING (true);

GRANT SELECT ON public.trend_marketplace_candidates TO anon, authenticated;
GRANT ALL ON public.trend_marketplace_candidates TO service_role;

COMMENT ON TABLE public.trend_marketplace_candidates IS 'Candidatos patio/marketplace Fase 2c — señales News+Reddit por producto';
