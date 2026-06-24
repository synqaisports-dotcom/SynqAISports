/**
 * Búsquedas por CATEGORÍA — señales News/Reddit + productos reales AliExpress (más vendidos).
 */
export type DiscoveryQuery = {
  id: string;
  /** Consulta News — titulares de tendencia */
  news_query: string;
  reddit_query: string;
  /** Búsqueda AliExpress — top sellers por categoría (no titular de noticia) */
  aliexpress_search: string;
  wave_pattern_slug: string;
  adn_delay_days: number;
};

export const DISCOVERY_QUERIES: DiscoveryQuery[] = [
  {
    id: 'viral-toy-tiktok',
    news_query: 'viral toy trend kids TikTok school playground -pokemon -labubu',
    reddit_query: 'viral toy kids school trending',
    aliexpress_search: '3d printed dragon toy',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 45,
  },
  {
    id: 'new-fidget',
    news_query: 'new fidget toy kids trending 2025 2026 -pop it',
    reddit_query: 'new fidget toy kids trend',
    aliexpress_search: 'fidget toy kids antistress',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 40,
  },
  {
    id: 'squish-collectible',
    news_query: 'squishy collectible toy kids viral -squishmallow',
    reddit_query: 'squishy toy viral kids collectible',
    aliexpress_search: 'mochi squishy toy kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 38,
  },
  {
    id: 'mystery-blind-kids',
    news_query: 'mystery blind box toy kids trend -pop mart',
    reddit_query: 'mystery blind box kids toy',
    aliexpress_search: 'mystery blind box kids toy',
    wave_pattern_slug: 'labubu',
    adn_delay_days: 90,
  },
  {
    id: 'summer-playground',
    news_query: 'summer toy trend kids playground outdoor viral',
    reddit_query: 'summer toy kids playground viral',
    aliexpress_search: 'reusable water balloon kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 30,
  },
  {
    id: 'aliexpress-trend-kids',
    news_query: 'AliExpress trending toy kids viral',
    reddit_query: 'aliexpress viral toy kids',
    aliexpress_search: 'trending toy kids aliexpress',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 42,
  },
  {
    id: 'cn-toy-export',
    news_query: 'China toy export viral kids trend',
    reddit_query: 'china toy trend kids',
    aliexpress_search: 'china viral toy kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 50,
  },
  {
    id: 'backpack-charm-trend',
    news_query: 'backpack charm keychain kids trend school',
    reddit_query: 'backpack charm kids school trend',
    aliexpress_search: 'plush keychain charm backpack kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 44,
  },
];

/** Términos que indican producto ya conocido (ADN/radar) — excluir titulares */
export const EXCLUDED_HEADLINE_TERMS = [
  'labubu',
  'pop mart',
  'pop it',
  'pop-it',
  'pokemon',
  'pokémon',
  'squishmallow',
  'panini',
  'fifa',
  'cromos',
  'mystery dumpling',
  'rms usa',
  'five below',
  'sonny angel',
  'beyblade',
];

export function schoolYearStart(d = new Date()): Date {
  return new Date(d.getFullYear(), 8, 1);
}

export function daysUntilSeptember(d = new Date()): number {
  const sept = schoolYearStart(d);
  if (d >= sept) {
    const next = new Date(d.getFullYear() + 1, 8, 1);
    return Math.ceil((next.getTime() - d.getTime()) / 86_400_000);
  }
  return Math.ceil((sept.getTime() - d.getTime()) / 86_400_000);
}

export function addDaysIso(from: Date, days: number): string {
  const x = new Date(from);
  x.setDate(x.getDate() + days);
  return x.toISOString().slice(0, 10);
}
