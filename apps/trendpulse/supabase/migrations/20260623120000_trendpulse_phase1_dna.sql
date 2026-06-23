-- TrendPulse Fase 1: ADN histórico de casos de éxito (multi-corredor)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.trend_wave_profile AS ENUM (
    'micro_viral_playground',
    'collectible_cards',
    'media_spike',
    'seasonal_mass',
    'kidult_nostalgia'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.trend_historical_dna (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name        text NOT NULL,
  slug                  text NOT NULL UNIQUE,
  product_line          text NOT NULL DEFAULT 'kids_collectibles_vending',
  wave_profile          public.trend_wave_profile NOT NULL,
  origin_region         text NOT NULL,
  -- Timeline origen
  origin_signal_start   date,
  origin_peak_date      date NOT NULL,
  -- Timeline destino (España como mercado referencia v1)
  target_market         text NOT NULL DEFAULT 'ES',
  target_signal_start   date,
  target_peak_date      date,
  delay_days_to_target  integer GENERATED ALWAYS AS (
    CASE
      WHEN target_peak_date IS NOT NULL AND origin_peak_date IS NOT NULL
      THEN (target_peak_date - origin_peak_date)
      ELSE NULL
    END
  ) STORED,
  plateau_days          integer,
  decline_start_date    date,
  decline_days          integer GENERATED ALWAYS AS (
    CASE
      WHEN decline_start_date IS NOT NULL AND target_peak_date IS NOT NULL
      THEN (decline_start_date - target_peak_date)
      ELSE NULL
    END
  ) STORED,
  peak_search_volume    bigint,
  success_rate          numeric(5,4) CHECK (success_rate IS NULL OR success_rate BETWEEN 0 AND 1),
  reference_urls        text[] DEFAULT '{}',
  notes                 text,
  dna_features          jsonb NOT NULL DEFAULT '{}',
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trend_historical_dna_line_idx
  ON public.trend_historical_dna (product_line);
CREATE INDEX IF NOT EXISTS trend_historical_dna_profile_idx
  ON public.trend_historical_dna (wave_profile);

-- Corredores futuros (LATAM, etc.)
CREATE TABLE IF NOT EXISTS public.trend_corridor_delays (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_id          uuid NOT NULL REFERENCES public.trend_historical_dna (id) ON DELETE CASCADE,
  origin_region   text NOT NULL,
  target_market   text NOT NULL,
  delay_days      integer,
  notes           text,
  UNIQUE (dna_id, origin_region, target_market)
);

CREATE OR REPLACE FUNCTION public.set_trendpulse_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trend_historical_dna_updated ON public.trend_historical_dna;
CREATE TRIGGER trg_trend_historical_dna_updated
  BEFORE UPDATE ON public.trend_historical_dna
  FOR EACH ROW EXECUTE FUNCTION public.set_trendpulse_updated_at();

ALTER TABLE public.trend_historical_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_corridor_delays ENABLE ROW LEVEL SECURITY;

CREATE POLICY trend_dna_public_read ON public.trend_historical_dna
  FOR SELECT USING (is_active = true);
CREATE POLICY trend_corridor_public_read ON public.trend_corridor_delays
  FOR SELECT USING (true);

-- Seed: 12 casos iniciales (ampliar a 25 con validación conjunta)
INSERT INTO public.trend_historical_dna
  (canonical_name, slug, product_line, wave_profile, origin_region,
   origin_signal_start, origin_peak_date, target_signal_start, target_peak_date,
   plateau_days, decline_start_date, peak_search_volume, success_rate, notes, dna_features)
VALUES
  ('Labubu Blind Box', 'labubu', 'kids_collectibles_vending', 'micro_viral_playground', 'asia',
   '2024-07-01', '2024-09-10', '2024-10-01', '2024-10-25', 21, '2024-12-15', 85000, 0.91,
   'Blind box diseño. Pico Asia previo a mochilas en ES.',
   '{"virality":"tiktok","audience":"teens_adults"}'),
  ('Dumpling Squishy Steamer', 'dumplings-squishy', 'kids_collectibles_vending', 'micro_viral_playground', 'usa',
   '2026-03-15', '2026-04-10', '2026-04-20', '2026-05-02', 14, '2026-06-01', 120000, 0.88,
   'ASMR sensorial. Delay corto por TikTok Shop.',
   '{"virality":"tiktok_kids","cycle_days":25}'),
  ('Pop It Fidget', 'pop-it', 'kids_collectibles_vending', 'micro_viral_playground', 'usa',
   '2021-02-01', '2021-03-15', '2021-04-01', '2021-05-10', 45, '2021-09-01', 200000, 0.75,
   'Ola clásica patio post-TikTok inicial.',
   '{}'),
  ('Pokémon TCG Scarlet Violet', 'pokemon-tcg-sv', 'kids_collectibles_vending', 'collectible_cards', 'japan',
   '2023-03-01', '2023-04-15', '2023-05-01', '2023-07-20', 60, '2024-02-01', 95000, 0.85,
   'Cartas licenciadas. Canal vending en crecimiento.',
   '{"channel":"vending"}'),
  ('One Piece Card Game OP-01', 'one-piece-op01', 'kids_collectibles_vending', 'media_spike', 'japan',
   '2022-06-01', '2022-08-01', '2022-10-01', '2023-06-01', 90, '2024-01-01', 110000, 0.90,
   'Media spike tras anime/Netflix. Demanda x5.',
   '{"media_trigger":true}'),
  ('FIFA World Cup Stickers 2022', 'fifa-stickers-2022', 'kids_collectibles_vending', 'seasonal_mass', 'global',
   '2022-08-01', '2022-11-01', '2022-09-01', '2022-11-20', 30, '2023-01-15', 250000, 0.92,
   'Estacional. Colapso quioscos físicos.',
   '{"event":"world_cup"}'),
  ('FIFA World Cup 2026 Cards', 'fifa-cards-2026', 'kids_collectibles_vending', 'seasonal_mass', 'uk',
   '2025-11-01', '2026-02-01', '2026-01-15', '2026-03-01', 45, NULL, 180000, 0.87,
   'Preventa activa. Retail físico agotado en formatos premium.',
   '{"event":"world_cup_2026"}'),
  ('He-Man Origins', 'he-man-origins', 'kids_collectibles_vending', 'kidult_nostalgia', 'usa',
   '2020-09-01', '2021-01-15', '2021-03-01', '2021-06-01', 120, '2022-06-01', 45000, 0.78,
   'Kidult. Waves exclusivas US no traídas a tiempo en ES.',
   '{"audience":"kidult"}'),
  ('SuperZings', 'superzings', 'kids_collectibles_vending', 'micro_viral_playground', 'europe',
   '2019-09-01', '2019-11-01', '2020-01-01', '2020-03-15', 50, '2020-09-01', 70000, 0.72,
   'Coleccionables deporte kids.',
   '{}'),
  ('Squishmallows Wave', 'squishmallows', 'kids_collectibles_vending', 'micro_viral_playground', 'usa',
   '2021-08-01', '2021-11-01', '2022-01-01', '2022-04-01', 40, '2022-10-01', 130000, 0.80,
   'Peluche coleccionable. Retail tardío.',
   '{}'),
  ('Sonny Angel', 'sonny-angel', 'kids_collectibles_vending', 'micro_viral_playground', 'japan',
   '2023-01-01', '2023-04-01', '2023-06-01', '2023-09-01', 35, '2024-03-01', 65000, 0.83,
   'Mini figuras. Similar pipeline a Labubu.',
   '{}'),
  ('Match Attax UEFA', 'match-attax', 'kids_collectibles_vending', 'collectible_cards', 'uk',
   '2024-08-01', '2024-10-01', '2024-09-15', '2024-11-01', 25, '2025-02-01', 55000, 0.79,
   'Cartas fútbol. Delay UK→ES corto.',
   '{"sport":"football"}')
ON CONFLICT (slug) DO NOTHING;
