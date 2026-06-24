-- TrendPulse: validación ADN con fuentes reales — Pop It, Squishmallows, Dumplings (jun 2026)
-- Fuentes documentadas en docs/VALIDACION_FECHAS.md

-- Pop It: viral TikTok US (mono Gaitlyn Rae, primavera 2021) → patios ES mayo 2021
UPDATE public.trend_historical_dna SET
  origin_signal_start = '2020-11-15',
  origin_peak_date    = '2021-04-01',
  target_signal_start = '2021-02-01',
  target_peak_date    = '2021-05-15',
  plateau_days        = 45,
  decline_start_date  = '2021-09-01',
  peak_search_volume  = 200000,
  success_rate        = 0.75,
  notes               = 'Validado 2026-06: viral TikTok US fin-2020/primavera 2021 (mono Gaitlyn Rae, 500M+ views). ES: +500% ventas mayo 2021 (Popit.Toys), invasión aulas/colegios. Delay pico US→ES ~44d.',
  reference_urls      = ARRAY[
    'https://www.bbc.com/news/business-58408570',
    'https://www.huffingtonpost.es/entry/pop-it-que-son-como-jugar_es_609cf92de4b069dc48f76689.html',
    'https://www.theguardian.com/lifeandstyle/2021/may/28/pop-hit-how-rainbow-reusable-bubblewrap-became-a-playground-must-have',
    'https://yosoytuprofe.20minutos.es/2021/05/10/el-popit-un-nuevo-fenomeno-que-invade-las-aulas/'
  ],
  dna_features        = '{"virality":"tiktok","audience":"kids","validated":"2026-06"}'::jsonb
WHERE slug = 'pop-it';

-- Squishmallows: pico US Navidad 2021 → pico retail Iberia abr-2023 (reloj largo)
UPDATE public.trend_historical_dna SET
  origin_signal_start = '2020-03-01',
  origin_peak_date    = '2021-12-01',
  target_signal_start = '2021-09-01',
  target_peak_date    = '2023-04-15',
  plateau_days        = 90,
  decline_start_date  = '2024-06-01',
  peak_search_volume  = 130000,
  success_rate        = 0.80,
  notes               = 'Validado 2026-06: US pico Navidad 2021 (TOTY 2022, NPD #1 plush). Iberia: peluche más vendido abr-2023 (NPD/GfK, Toy Partner). Delay pico US→ES ~500d — reloj largo importación.',
  reference_urls      = ARRAY[
    'https://www.theguardian.com/business/2022/dec/09/squishmallows-go-from-tiktok-sensation-to-top-christmas-toy',
    'https://www.interempresas.net/Juguetes/482719-Squishmallows-revoluciona-el-mundo-del-peluche-desde-las-redes-sociales.html',
    'https://www.galaxus.ch/en/page/from-tiktok-trend-to-bestseller-squishmallows-dominate-the-cuddly-toy-market-33834'
  ],
  dna_features        = '{"virality":"tiktok","audience":"kids_teen","validated":"2026-06","long_clock":true}'::jsonb
WHERE slug = 'squishmallows';

-- Dumplings: tendencia activa US 2025-2026; patio ES aún sin señal documentada
UPDATE public.trend_historical_dna SET
  origin_signal_start = '2025-08-01',
  origin_peak_date    = '2025-11-15',
  target_signal_start = NULL,
  target_peak_date    = NULL,
  plateau_days        = NULL,
  decline_start_date  = NULL,
  peak_search_volume  = 120000,
  success_rate        = 0.88,
  notes               = 'Validado 2026-06 (origen US): RMS Crazy Fun Mystery Dumpling. Fase viral 2025 (500M+ views TikTok, The Toy Book). Sell-outs Five Below 2025-2026. Patio ES sin señal — reloj largo tipo Labubu. Golden Ticket drop 16-may-2026.',
  reference_urls      = ARRAY[
    'https://toybook.com/rms-usa-five-below-dumpling-giveaway-news/',
    'https://www.businesswire.com/news/home/20260319125442/en/A-Viral-Sensation-Turned-Retail-Juggernaut-RMS-USAs-Mystery-Dumpling-Continues-Its-Sell-Out-Streak',
    'https://www.rms-usa.com/press/golden-ticket-mystery-dumpling'
  ],
  dna_features        = '{"virality":"tiktok_kids","validated":"2026-06","status":"active_us_only","es_pending":true}'::jsonb
WHERE slug = 'dumplings-squishy';

-- Corredor LATAM Squishmallows: México fenómeno 2021 junto a US, antes del pico ES 2023
UPDATE public.trend_corridor_delays SET
  reference_date = '2021-11-15',
  delay_days     = 520,
  relation_to_es = 'before',
  notes          = 'Validado orientativo: MX/BR fenómeno ventas 2021 (NPD global). Pico retail ES/Iberia abr-2023 — LATAM ~18 meses antes.'
WHERE dna_id = (SELECT id FROM public.trend_historical_dna WHERE slug = 'squishmallows')
  AND origin_region = 'usa' AND target_market = 'LATAM';

-- Corredor LATAM Pop It: viral TikTok LATAM español antes de patios ES
UPDATE public.trend_corridor_delays SET
  reference_date = '2021-04-10',
  delay_days     = 35,
  relation_to_es = 'before',
  notes          = 'Validado orientativo: viral TikTok US/LATAM ~4 sem antes del pico en colegios ES (mayo 2021).'
WHERE dna_id = (SELECT id FROM public.trend_historical_dna WHERE slug = 'pop-it')
  AND origin_region = 'usa' AND target_market = 'LATAM';
