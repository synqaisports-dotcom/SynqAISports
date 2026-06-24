-- TrendPulse: permisos lectura pública (anon / publishable key)

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.trend_historical_dna TO anon, authenticated;
GRANT SELECT ON public.trend_corridor_delays TO anon, authenticated;

-- Corrige aviso Security Advisor (search_path)
ALTER FUNCTION public.set_trendpulse_updated_at() SET search_path = public;
