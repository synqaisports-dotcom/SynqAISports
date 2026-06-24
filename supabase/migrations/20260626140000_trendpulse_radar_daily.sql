-- TrendPulse: menciones traducidas + histórico diario (sparklines)

ALTER TABLE public.trend_live_signals
  ADD COLUMN IF NOT EXISTS mention_snippets jsonb DEFAULT '[]';

CREATE TABLE IF NOT EXISTS public.trend_radar_daily (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_slug     text NOT NULL,
  snapshot_date   date NOT NULL DEFAULT CURRENT_DATE,
  scrape_hits     integer NOT NULL DEFAULT 0,
  weighted_score  numeric(8,2) NOT NULL DEFAULT 0,
  source_breakdown jsonb NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (signal_slug, snapshot_date)
);

CREATE INDEX IF NOT EXISTS trend_radar_daily_slug_date_idx
  ON public.trend_radar_daily (signal_slug, snapshot_date DESC);

ALTER TABLE public.trend_radar_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY trend_radar_daily_public_read ON public.trend_radar_daily
  FOR SELECT USING (true);

GRANT SELECT ON public.trend_radar_daily TO anon, authenticated;
GRANT INSERT, UPDATE ON public.trend_radar_daily TO service_role;
