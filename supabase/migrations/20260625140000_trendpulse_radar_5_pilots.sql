-- TrendPulse: radar alineado con 5 pilotos ADN/LATAM (datos reales de seguimiento)

UPDATE public.trend_live_signals
SET is_active = false, updated_at = now()
WHERE slug IN ('dumplings-live', 'fifa-2026-live', 'zimomo-predicted');

INSERT INTO public.trend_live_signals
  (canonical_name, slug, status, origin_region, detected_at, origin_peak_date,
   predicted_es_peak_date, predicted_delay_days, dna_match_slug, dna_match_score,
   confidence, signal_source, notes)
VALUES
  ('Labubu / Pop Mart', 'radar-labubu', 'watching', 'asia',
   now(), '2024-08-01', '2025-02-15', 121,
   'labubu', 0.910, 'high',
   'ADN validado + scrape 48h',
   'Piloto 1/5. Post-pico ES; vigilar nueva ola blind box. Ref. LATAM ~46d antes de ES.'),
  ('Pop It Fidget', 'radar-pop-it', 'watching', 'usa',
   now(), '2021-03-15', null, 30,
   'pop-it', 0.750, 'medium',
   'ADN histórico + scrape 48h',
   'Piloto 2/5. Ciclo 2021 archivado; scrape detecta resurgencias. LATAM suele ir antes de ES.'),
  ('Pokémon TCG Escarlata y Púrpura', 'radar-pokemon-sv', 'emerging', 'asia',
   now(), '2023-03-01', '2023-05-15', 75,
   'pokemon-tcg-sv', 0.850, 'high',
   'ADN validado + scrape 48h',
   'Piloto 3/5. Demanda vending/cartas. LATAM retail suele ir después de EU.'),
  ('Cromos Mundial 2026 — Panini', 'radar-fifa-2026', 'emerging', 'global',
   now(), '2026-02-01', '2026-06-18', 7,
   'fifa-stickers-2022', 0.890, 'high',
   'Evento programado + scrape 48h',
   'Piloto 4/5. Torneo 11-jun-2026. Patrón FIFA 2022 (paralelo LATAM/ES).'),
  ('Squishmallows', 'radar-squishmallows', 'watching', 'usa',
   now(), '2021-07-01', null, 45,
   'squishmallows', 0.720, 'medium',
   'ADN histórico + scrape 48h',
   'Piloto 5/5. Oleada US; LATAM import ~2 sem después de EU en histórico.')
ON CONFLICT (slug) DO UPDATE SET
  canonical_name = EXCLUDED.canonical_name,
  status = EXCLUDED.status,
  origin_region = EXCLUDED.origin_region,
  predicted_es_peak_date = EXCLUDED.predicted_es_peak_date,
  predicted_delay_days = EXCLUDED.predicted_delay_days,
  dna_match_slug = EXCLUDED.dna_match_slug,
  dna_match_score = EXCLUDED.dna_match_score,
  confidence = EXCLUDED.confidence,
  signal_source = EXCLUDED.signal_source,
  notes = EXCLUDED.notes,
  is_active = true,
  updated_at = now();
