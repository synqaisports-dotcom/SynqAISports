-- TrendPulse: corredor LATAM en casos piloto (referencia orientativa)
-- relation_to_es: before | after | parallel (respecto al pico ES)

ALTER TABLE public.trend_corridor_delays
  ADD COLUMN IF NOT EXISTS reference_date date,
  ADD COLUMN IF NOT EXISTS relation_to_es text
    CHECK (relation_to_es IS NULL OR relation_to_es IN ('before', 'after', 'parallel'));

COMMENT ON COLUMN public.trend_corridor_delays.reference_date IS
  'Fecha visible o pico estimado en el corredor (p. ej. LATAM)';
COMMENT ON COLUMN public.trend_corridor_delays.relation_to_es IS
  'before = LATAM antes del pico ES; after = después; parallel = misma ventana';

-- Labubu: coleccionables Asia → LATAM social antes del pop-up Barcelona
INSERT INTO public.trend_corridor_delays
  (dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes)
SELECT id, 'asia', 'LATAM', '2024-10-15', 46, 'before',
  'Estimado: México/BR TikTok coleccionistas e importaciones ~6 sem antes del pico ES (pop-up Barcelona).'
FROM public.trend_historical_dna WHERE slug = 'labubu'
ON CONFLICT (dna_id, origin_region, target_market) DO UPDATE SET
  reference_date = EXCLUDED.reference_date,
  delay_days = EXCLUDED.delay_days,
  relation_to_es = EXCLUDED.relation_to_es,
  notes = EXCLUDED.notes;

-- Pop It: viral TikTok US → LATAM hispanohablante antes que patios ES
INSERT INTO public.trend_corridor_delays
  (dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes)
SELECT id, 'usa', 'LATAM', '2021-04-10', 30, 'before',
  'Estimado: viral TikTok en LATAM español ~4 sem antes del pico en colegios ES.'
FROM public.trend_historical_dna WHERE slug = 'pop-it'
ON CONFLICT (dna_id, origin_region, target_market) DO UPDATE SET
  reference_date = EXCLUDED.reference_date,
  delay_days = EXCLUDED.delay_days,
  relation_to_es = EXCLUDED.relation_to_es,
  notes = EXCLUDED.notes;

-- Pokémon SV: retail oficial LATAM suele ir detrás de EU en muchos canales
INSERT INTO public.trend_corridor_delays
  (dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes)
SELECT id, 'asia', 'LATAM', '2023-04-25', 25, 'after',
  'Estimado: lanzamiento EU 31-mar-2023; pico demanda MX/retail LATAM ~3-4 sem después.'
FROM public.trend_historical_dna WHERE slug = 'pokemon-tcg-sv'
ON CONFLICT (dna_id, origin_region, target_market) DO UPDATE SET
  reference_date = EXCLUDED.reference_date,
  delay_days = EXCLUDED.delay_days,
  relation_to_es = EXCLUDED.relation_to_es,
  notes = EXCLUDED.notes;

-- FIFA 2022: evento global — LATAM en la misma ventana que ES
INSERT INTO public.trend_corridor_delays
  (dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes)
SELECT id, 'global', 'LATAM', '2022-11-20', 0, 'parallel',
  'Mundial Qatar: pico álbum Panini simultáneo en ES y mercados LATAM (sem 1 torneo).'
FROM public.trend_historical_dna WHERE slug = 'fifa-stickers-2022'
ON CONFLICT (dna_id, origin_region, target_market) DO UPDATE SET
  reference_date = EXCLUDED.reference_date,
  delay_days = EXCLUDED.delay_days,
  relation_to_es = EXCLUDED.relation_to_es,
  notes = EXCLUDED.notes;

-- Squishmallows: distribución US → LATAM importaciones paralelas o ligeramente después de EU
INSERT INTO public.trend_corridor_delays
  (dna_id, origin_region, target_market, reference_date, delay_days, relation_to_es, notes)
SELECT id, 'usa', 'LATAM', '2021-08-15', 14, 'after',
  'Estimado: oleada US 2021; LATAM retail/import ~2 sem después del primer pico EU/ES.'
FROM public.trend_historical_dna WHERE slug = 'squishmallows'
ON CONFLICT (dna_id, origin_region, target_market) DO UPDATE SET
  reference_date = EXCLUDED.reference_date,
  delay_days = EXCLUDED.delay_days,
  relation_to_es = EXCLUDED.relation_to_es,
  notes = EXCLUDED.notes;
