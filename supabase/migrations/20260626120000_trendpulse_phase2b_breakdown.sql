-- TrendPulse Fase 2b: desglose por corredor (ES / US / CN / POD / Reddit)

ALTER TABLE public.trend_live_signals
  ADD COLUMN IF NOT EXISTS source_breakdown jsonb DEFAULT '{}';

COMMENT ON COLUMN public.trend_live_signals.source_breakdown IS
  'Fase 2b: { es, us, cn, pod, reddit, weighted } por corredor';
