-- TrendPulse Fase 2: radar de señales vivas + predicción por ADN histórico

CREATE TABLE IF NOT EXISTS public.trend_live_signals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name        text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  status                text NOT NULL CHECK (status IN ('watching', 'emerging', 'peak_es', 'decline')),
  origin_region         text NOT NULL,
  detected_at           timestamptz NOT NULL DEFAULT now(),
  origin_peak_date      date,
  predicted_es_peak_date date,
  predicted_delay_days  integer,
  dna_match_slug        text REFERENCES public.trend_historical_dna (slug),
  dna_match_score       numeric(4,3) CHECK (dna_match_score IS NULL OR dna_match_score BETWEEN 0 AND 1),
  confidence            text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('low', 'medium', 'high')),
  signal_source         text NOT NULL DEFAULT 'manual',
  notes                 text,
  reference_urls        text[] DEFAULT '{}',
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_live_signals_status_idx ON public.trend_live_signals (status);
CREATE INDEX IF NOT EXISTS trend_live_signals_detected_idx ON public.trend_live_signals (detected_at DESC);

ALTER TABLE public.trend_live_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY trend_live_public_read ON public.trend_live_signals
  FOR SELECT USING (is_active = true);

GRANT SELECT ON public.trend_live_signals TO anon, authenticated;

-- Señales ejemplo: 2 tendencias REALES activas + 1 predicción futura
INSERT INTO public.trend_live_signals
  (canonical_name, slug, status, origin_region, detected_at, origin_peak_date,
   predicted_es_peak_date, predicted_delay_days, dna_match_slug, dna_match_score,
   confidence, signal_source, notes)
VALUES
  ('Dumpling Squishy Steamer', 'dumplings-live', 'peak_es', 'usa',
   '2026-03-18', '2026-04-10', '2026-05-02', 22,
   'dumplings-squishy', 0.940, 'high',
   'TikTok Shop USA → ES patio',
   'Tendencia REAL jun-2026. ASMR sensorial. Micro-lote vending recomendado.'),
  ('Mundial 2026 — Cromos Panini', 'fifa-2026-live', 'emerging', 'uk',
   '2026-01-10', '2026-02-01', '2026-06-18', 12,
   'fifa-stickers-2022', 0.890, 'high',
   'Retail UK agotado → ES quioscos',
   'REAL: torneo 11-jun-2026. Patrón FIFA 2022. Pico previsto semana 1.'),
  ('Zimomo / Pop Mart ola Q3', 'zimomo-predicted', 'watching', 'asia',
   '2026-06-01', '2026-06-15', '2026-10-20', 121,
   'labubu', 0.820, 'medium',
   'Xiaohongshu + colas Pop Mart SEA',
   'PREDICTIVO: nueva ola blind box. Delay por ADN Labubu. Pico ES oct-2026.')
ON CONFLICT (slug) DO NOTHING;
