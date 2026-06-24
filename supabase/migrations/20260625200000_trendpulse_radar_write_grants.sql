-- TrendPulse: permisos ESCRITURA radar (scrape con SUPABASE_SECRET_KEY)
-- Corrige: permission denied for table trend_live_signals

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trend_live_signals TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trend_live_signals TO postgres;

GRANT SELECT, INSERT ON public.trend_ingest_runs TO service_role;
GRANT SELECT, INSERT ON public.trend_ingest_runs TO postgres;

-- Política explícita por si el rol no bypassa RLS
DROP POLICY IF EXISTS trend_live_service_write ON public.trend_live_signals;
CREATE POLICY trend_live_service_write ON public.trend_live_signals
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS trend_ingest_service_write ON public.trend_ingest_runs;
CREATE POLICY trend_ingest_service_write ON public.trend_ingest_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
