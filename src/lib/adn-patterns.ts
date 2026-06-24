/**
 * Patrones ADN — solo para estimar delay y margen.
 * No son los productos predichos; son experiencias históricas de referencia.
 */
export type AdnWavePattern = {
  slug: string;
  label: string;
  /** Caso histórico validado (ejemplo, no el producto actual) */
  example_case: string;
  delay_days: number;
  origin_price_typical_eur: number;
  es_retail_low_eur: number;
  es_retail_high_eur: number;
  channel: string;
};

export const ADN_WAVE_PATTERNS: Record<string, AdnWavePattern> = {
  'pop-it': {
    slug: 'pop-it',
    label: 'Reloj corto · micro-viral patio',
    example_case: 'Pop It (2021) — ~44d origen→ES',
    delay_days: 44,
    origin_price_typical_eur: 2.5,
    es_retail_low_eur: 5,
    es_retail_high_eur: 9,
    channel: 'vending / patio',
  },
  labubu: {
    slug: 'labubu',
    label: 'Reloj largo · Asia → ES',
    example_case: 'Labubu (2024) — ~121d',
    delay_days: 121,
    origin_price_typical_eur: 12,
    es_retail_low_eur: 18,
    es_retail_high_eur: 35,
    channel: 'retail / import',
  },
  'dumplings-squishy': {
    slug: 'dumplings-squishy',
    label: 'Reloj largo · viral US',
    example_case: 'Dumplings US (2025) — patio ES pendiente',
    delay_days: 120,
    origin_price_typical_eur: 4.5,
    es_retail_low_eur: 8,
    es_retail_high_eur: 14,
    channel: 'retail / TikTok',
  },
  'beyblade-burst': {
    slug: 'beyblade-burst',
    label: 'Ciclo recurrente · patio',
    example_case: 'Peonzas / Beyblade — vuelve cada X años',
    delay_days: 60,
    origin_price_typical_eur: 6,
    es_retail_low_eur: 10,
    es_retail_high_eur: 16,
    channel: 'juguetería / patio',
  },
  'pokemon-tcg-sv': {
    slug: 'pokemon-tcg-sv',
    label: 'Coleccionable · calendario',
    example_case: 'Pokémon SV — ~75d JP→ES vending',
    delay_days: 75,
    origin_price_typical_eur: 4,
    es_retail_low_eur: 6,
    es_retail_high_eur: 12,
    channel: 'vending / hobby',
  },
};

export function getAdnPattern(slug: string | null | undefined): AdnWavePattern {
  if (slug && ADN_WAVE_PATTERNS[slug]) return ADN_WAVE_PATTERNS[slug];
  return ADN_WAVE_PATTERNS['pop-it'];
}
