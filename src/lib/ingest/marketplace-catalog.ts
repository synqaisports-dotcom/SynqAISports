/** Catálogo patio verano — URLs y keywords reales para scrape de señales (Fase 2c). */
export type MarketplaceCatalogItem = {
  slug: string;
  canonical_name: string;
  world: 'playground' | 'collector' | 'adult';
  image_url: string;
  origin_price_eur: number;
  origin_marketplace: string;
  purchase_url: string;
  news_query: string;
  reddit_query: string;
  /**
   * Slug ADN solo como PATRÓN de delay (ej. pop-it = reloj corto).
   * No significa que el producto sea ese caso histórico.
   */
  wave_pattern_slug: string;
  adn_delay_days: number;
  notes: string;
  /** true = descubrimiento nuevo; false = no mostrar en /tendencias */
  is_discovery: boolean;
};

/**
 * Productos que NO deben salir en descubrimiento:
 * ya están en radar piloto o el patio ES ya vivió el pico.
 */
export const ADN_CASES_EXCLUDED_FROM_DISCOVERY = [
  'labubu',
  'dumplings-squishy',
  'pop-it',
  'pokemon-tcg-sv',
  'squishmallows',
  'fifa-stickers-2022',
  'sonny-angel',
] as const;

/** Solo productos NUEVOS — no son los 25 casos ADN ni los 5 pilotos radar. */
export const DISCOVERY_SUMMER_CATALOG: MarketplaceCatalogItem[] = [
  {
    slug: 'dragon-3d-articulated',
    canonical_name: 'Dragón articulado 3D (fidget flexible)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/f472b6?text=Drag%C3%B3n+3D',
    origin_price_eur: 2.2,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-3d-printed-dragon-toy.html',
    news_query: '3d printed dragon fidget toy viral kids school',
    reddit_query: '3d printed dragon toy fidget',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 44,
    notes: 'Nuevo en radar. Patrón patio barato + TikTok/AliExpress.',
    is_discovery: true,
  },
  {
    slug: 'squishy-mochi-mini',
    canonical_name: 'Mini mochi squishy (bolsa sorpresa)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/a78bfa?text=Mochi',
    origin_price_eur: 3.0,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-mochi-squishy.html',
    news_query: 'mochi squishy toy trending kids',
    reddit_query: 'mochi squishy toy',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 35,
    notes: 'Nuevo. Sensorial + mini colección.',
    is_discovery: true,
  },
  {
    slug: 'plush-keychain-charm',
    canonical_name: 'Charm peluche mochila (tipo blind box barato)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/e879f9?text=Charm',
    origin_price_eur: 1.9,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-plush-keychain.html',
    news_query: 'plush keychain charm backpack trend kids school',
    reddit_query: 'plush keychain charm backpack kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 45,
    notes: 'Nuevo. Derivado económico de modas adultas — puente al patio.',
    is_discovery: true,
  },
  {
    slug: 'mesh-ball-fidget',
    canonical_name: 'Bola malla fidget (squeeze ball)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/34d399?text=Fidget',
    origin_price_eur: 2.5,
    origin_marketplace: 'Amazon US · AliExpress',
    purchase_url: 'https://www.amazon.com/s?k=mesh+squishy+ball+fidget',
    news_query: 'mesh fidget ball squishy viral playground',
    reddit_query: 'mesh ball fidget toy',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 40,
    notes: 'Nuevo. Recurrente post-fidget; bueno para verano.',
    is_discovery: true,
  },
  {
    slug: 'finger-skateboard-mini',
    canonical_name: 'Finger skate / mini patinete dedo',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/60a5fa?text=Finger+skate',
    origin_price_eur: 4.5,
    origin_marketplace: 'Amazon · AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-finger-skateboard.html',
    news_query: 'finger skateboard trend kids school',
    reddit_query: 'finger skateboard trend',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 50,
    notes: 'Nuevo ciclo posible en patios.',
    is_discovery: true,
  },
  {
    slug: 'reusable-water-balloon',
    canonical_name: 'Globos de agua reutilizables (verano)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/38bdf8?text=Agua',
    origin_price_eur: 5.5,
    origin_marketplace: 'Amazon US',
    purchase_url: 'https://www.amazon.com/s?k=reusable+water+balloons+kids',
    news_query: 'reusable water balloons viral summer kids',
    reddit_query: 'reusable water balloons kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 30,
    notes: 'Nuevo pico estacional verano — ventana corta antes de sept.',
    is_discovery: true,
  },
  {
    slug: 'diablo-yoyo-resurge',
    canonical_name: 'Diablo / peonza (resurgir patio)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/fbbf24?text=Diablo',
    origin_price_eur: 6.0,
    origin_marketplace: 'Amazon ES · juguetería',
    purchase_url: 'https://www.amazon.es/s?k=diablo+yoyo+ni%C3%B1os',
    news_query: 'diabolo yoyo trend kids playground Spain',
    reddit_query: 'diabolo yoyo kids trend',
    wave_pattern_slug: 'beyblade-burst',
    adn_delay_days: 60,
    notes: 'Ciclo recurrente — vigilar si ES empieza a moverse.',
    is_discovery: true,
  },
  {
    slug: 'loom-bands-bracelet-kit',
    canonical_name: 'Pulseras loom bands / tejido gomas (resurgir)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/f9a8d4?text=Loom',
    origin_price_eur: 3.5,
    origin_marketplace: 'AliExpress · Amazon',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-loom-bands.html',
    news_query: 'loom bands bracelet trend kids comeback',
    reddit_query: 'loom bands kids trend',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 55,
    notes: 'Nuevo resurgir posible — patrón cíclico patio.',
    is_discovery: true,
  },
  {
    slug: 'croc-charms-jibbitz',
    canonical_name: 'Charms para crocs / sandalias (jibbitz dupes)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/4ade80?text=Charm',
    origin_price_eur: 2.0,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-shoe-charms.html',
    news_query: 'shoe charms jibbitz trend kids summer',
    reddit_query: 'shoe charms croc kids',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 40,
    notes: 'Nuevo. Verano + personalización en cole.',
    is_discovery: true,
  },
  {
    slug: 'magnetic-rings-fidget',
    canonical_name: 'Anillos magnéticos fidget (spinner rings)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/c084fc?text=Rings',
    origin_price_eur: 2.8,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-magnetic-fidget-rings.html',
    news_query: 'magnetic fidget rings kids trend tiktok',
    reddit_query: 'magnetic fidget rings',
    wave_pattern_slug: 'pop-it',
    adn_delay_days: 42,
    notes: 'Nuevo. Sucesor espiritual del spinner en algunos mercados.',
    is_discovery: true,
  },
];

/** @deprecated Usar DISCOVERY_SUMMER_CATALOG — mantenido para ingest interno */
export const PLAYGROUND_SUMMER_CATALOG = DISCOVERY_SUMMER_CATALOG;

export function isExcludedAdnCase(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return (ADN_CASES_EXCLUDED_FROM_DISCOVERY as readonly string[]).includes(slug);
}

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
