-- TrendPulse: permisos lectura radar (si la app no ve las 5 filas)

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.trend_live_signals TO anon, authenticated;
GRANT SELECT ON public.trend_ingest_runs TO anon, authenticated;
