-- TrendPulse: validación fechas Labubu, Pokémon SV, FIFA 2022 (jun 2026)
-- Fuentes documentadas en docs/VALIDACION_FECHAS.md

UPDATE public.trend_historical_dna SET
  origin_signal_start = '2024-04-01',
  origin_peak_date    = '2024-08-01',
  target_signal_start = '2024-11-20',
  target_peak_date    = '2024-11-30',
  plateau_days        = 45,
  decline_start_date  = '2025-03-01',
  peak_search_volume  = 85000,
  success_rate        = 0.91,
  notes               = 'Validado 2026-06: pico global ~ago-2024 (Lisa/Blackpink, TikTok). Pico ES: apertura pop-up Pop Mart Barcelona 30-nov-2024 (colas 6h). Delay ~121d.',
  reference_urls      = ARRAY[
    'https://www.bbc.com/news/articles/cy4ydxlm9n9o',
    'https://www.timeout.es/barcelona/es/noticias/abre-en-barcelona-la-tienda-de-sonny-angels-y-se-forman-colas-de-mas-de-dos-horas-120224',
    'https://www.idealista.com/news/inmobiliario/retail/2024/11/20/821376-los-sonny-angels-y-los-labubu-aterrizan-en-barcelona-popmart-abre-una-tienda-en-plaza'
  ],
  dna_features        = '{"virality":"tiktok","audience":"teens_adults","validated":"2026-06"}'::jsonb
WHERE slug = 'labubu';

UPDATE public.trend_historical_dna SET
  origin_signal_start = '2023-01-20',
  origin_peak_date    = '2023-03-01',
  target_signal_start = '2023-03-31',
  target_peak_date    = '2023-05-15',
  plateau_days        = 55,
  decline_start_date  = '2024-02-01',
  peak_search_volume  = 95000,
  success_rate        = 0.85,
  notes               = 'Validado 2026-06: lanzamiento JP 20-ene, ES/EU 31-mar-2023 (oficial). Pico demanda vending ~6 sem post-lanzamiento ES. Delay pico JP→ES ~75d; lanzamiento oficial 70d.',
  reference_urls      = ARRAY[
    'https://www.wikidex.net/wiki/Escarlata_y_P%C3%BArpura_(TCG):_Escarlata_y_P%C3%BArpura',
    'https://www.pokemon.com/es/noticias-pokemon/maushold-koraidon-ex-y-mas-de-escarlata-y-purpura-de-jcc-pokemon'
  ],
  dna_features        = '{"channel":"vending","validated":"2026-06"}'::jsonb
WHERE slug = 'pokemon-tcg-sv';

UPDATE public.trend_historical_dna SET
  origin_signal_start = '2022-08-15',
  origin_peak_date    = '2022-11-20',
  target_signal_start = '2022-09-01',
  target_peak_date    = '2022-11-27',
  plateau_days        = 30,
  decline_start_date  = '2023-01-15',
  peak_search_volume  = 250000,
  success_rate        = 0.92,
  notes               = 'Validado 2026-06: álbum Panini Qatar 2022. Pico ventas semana 1 Mundial (arranque 20-nov). ES casi simultáneo (delay ~7d). Agotamientos quioscos.',
  reference_urls      = ARRAY[
    'https://www.eldiario.es/economia/mundial-futbol-dispara-ventas-panini-agota-cromos-fabricamos-24-horas-dia-no-esperabamos_1_13261227.html'
  ],
  dna_features        = '{"event":"world_cup","validated":"2026-06"}'::jsonb
WHERE slug = 'fifa-stickers-2022';
