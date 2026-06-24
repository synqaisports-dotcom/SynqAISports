import type { LiveSignalRow } from './radar-types';

/** Señales radar demo (Fase 2) cuando Supabase no tiene tabla aún. */
export const DEMO_RADAR: LiveSignalRow[] = [
  {
    id: 'radar-dumplings',
    canonical_name: 'Dumpling Squishy Steamer',
    slug: 'dumplings-live',
    status: 'peak_es',
    origin_region: 'usa',
    detected_at: '2026-03-18T00:00:00Z',
    origin_peak_date: '2026-04-10',
    predicted_es_peak_date: '2026-05-02',
    predicted_delay_days: 22,
    dna_match_slug: 'dumplings-squishy',
    dna_match_score: 0.94,
    confidence: 'high',
    signal_source: 'TikTok Shop USA → ES patio',
    notes:
      'Tendencia REAL activa jun-2026. ASMR sensorial en máquinas escolares. ADN casi idéntico al histórico. Ventana vending: micro-lote YA.',
    reference_urls: ['https://www.tiktok.com'],
  },
  {
    id: 'radar-fifa26',
    canonical_name: 'Mundial 2026 — Cromos Panini',
    slug: 'fifa-2026-live',
    status: 'emerging',
    origin_region: 'uk',
    detected_at: '2026-01-10T00:00:00Z',
    origin_peak_date: '2026-02-01',
    predicted_es_peak_date: '2026-06-18',
    predicted_delay_days: 12,
    dna_match_slug: 'fifa-stickers-2022',
    dna_match_score: 0.89,
    confidence: 'high',
    signal_source: 'Retail UK agotado → ES quioscos',
    notes:
      'Tendencia REAL: torneo arranca 11-jun-2026. Patrón FIFA 2022 (delay ~7d). Pico previsto semana 1 partidos España.',
    reference_urls: [],
  },
  {
    id: 'radar-zimomo',
    canonical_name: 'Zimomo / Pop Mart ola Q3',
    slug: 'zimomo-predicted',
    status: 'watching',
    origin_region: 'asia',
    detected_at: '2026-06-01T00:00:00Z',
    origin_peak_date: '2026-06-15',
    predicted_es_peak_date: '2026-10-20',
    predicted_delay_days: 121,
    dna_match_slug: 'labubu',
    dna_match_score: 0.82,
    confidence: 'medium',
    signal_source: 'Xiaohongshu + colas Pop Mart SEA',
    notes:
      'EJEMPLO PREDICTIVO (futuro): nueva ola blind box post-Labubu. Delay estimado por ADN Labubu (~121d). Pico ES previsto oct-2026.',
    reference_urls: [],
  },
];
