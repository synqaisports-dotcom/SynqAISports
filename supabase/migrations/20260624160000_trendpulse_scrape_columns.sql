-- TrendPulse Fase 2b: columnas scraping + log de ingesta

ALTER TABLE public.trend_live_signals
  ADD COLUMN IF NOT EXISTS scrape_hits integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_scraped_at timestamptz;

CREATE TABLE IF NOT EXISTS public.trend_ingest_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at          timestamptz NOT NULL DEFAULT now(),
  signals_count   integer NOT NULL DEFAULT 0,
  errors          text[] DEFAULT '{}',
  sources         text[] DEFAULT '{google_news,reddit}',
  log             jsonb NOT NULL DEFAULT '{}'
);

ALTER TABLE public.trend_ingest_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY trend_ingest_runs_public_read ON public.trend_ingest_runs
  FOR SELECT USING (true);

GRANT SELECT ON public.trend_ingest_runs TO anon, authenticated;

-- Escritura vía service_role en cron (bypass RLS)
