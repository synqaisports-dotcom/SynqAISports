-- TrendPulse: columnas scrape (seguro si ya ejecutaste antes)
-- Si sale error "policy already exists" en la otra migración, usa ESTE archivo.

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'trend_ingest_runs' AND policyname = 'trend_ingest_runs_public_read'
  ) THEN
    CREATE POLICY trend_ingest_runs_public_read ON public.trend_ingest_runs
      FOR SELECT USING (true);
  END IF;
END $$;

GRANT SELECT ON public.trend_ingest_runs TO anon, authenticated;
