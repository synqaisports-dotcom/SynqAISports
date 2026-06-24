/** Catálogo patio verano — URLs y keywords reales para scrape de señales (Fase 2c). */
export type MarketplaceCatalogItem = {
  slug: string;
  canonical_name: string;
  world: 'playground' | 'collector' | 'adult';
  image_url: string;
  origin_price_eur: number;
  origin_marketplace: string;
  purchase_url: string;
  /** Búsquedas Google News + Reddit */
  news_query: string;
  reddit_query: string;
  dna_match_slug: string;
  /** Delay histórico ADN (días origen → pico ES) */
  adn_delay_days: number;
  notes: string;
};

export const PLAYGROUND_SUMMER_CATALOG: MarketplaceCatalogItem[] = [
  {
    slug: 'mystery-dumpling-rms',
    canonical_name: 'Mystery Squishy Dumpling (RMS / Five Below)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/22d3ee?text=Dumpling',
    origin_price_eur: 4.6,
    origin_marketplace: 'Five Below · USA',
    purchase_url: 'https://www.fivebelow.com/search?q=mystery+dumpling',
    news_query: 'mystery squishy dumpling RMS Five Below viral toy',
    reddit_query: 'mystery dumpling squishy RMS',
    dna_match_slug: 'dumplings-squishy',
    adn_delay_days: 120,
    notes: 'Viral US 2025. Patio ES sin señal — reloj largo tipo Labubu.',
  },
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
    dna_match_slug: 'pop-it',
    adn_delay_days: 44,
    notes: 'Patrón patio clásico: barato, compartible, TikTok/AliExpress.',
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
    dna_match_slug: 'dumplings-squishy',
    adn_delay_days: 35,
    notes: 'Sensorial + colección mini. Mismo impulso que dumplings.',
  },
  {
    slug: 'plush-keychain-charm',
    canonical_name: 'Charm peluche mochila (estilo Labubu)',
    world: 'playground',
    image_url: 'https://placehold.co/400x400/1a1f2e/e879f9?text=Charm',
    origin_price_eur: 1.9,
    origin_marketplace: 'AliExpress',
    purchase_url: 'https://www.aliexpress.com/w/wholesale-plush-keychain-labubu.html',
    news_query: 'plush keychain charm backpack trend kids',
    reddit_query: 'plush keychain charm trend',
    dna_match_slug: 'labubu',
    adn_delay_days: 90,
    notes: 'Derivado barato de moda adulta → puente al patio.',
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
    dna_match_slug: 'pop-it',
    adn_delay_days: 40,
    notes: 'Recurrente post-Pop It. Verano = recreo outdoor.',
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
    dna_match_slug: 'pop-it',
    adn_delay_days: 50,
    notes: 'Resurgir cíclico en patios. Precio vending-friendly.',
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
    dna_match_slug: 'pop-it',
    adn_delay_days: 30,
    notes: 'Estacional verano — ventana corta antes de septiembre.',
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
    dna_match_slug: 'beyblade-burst',
    adn_delay_days: 60,
    notes: 'Ciclo recurrente años. Observar mejor que actuar si ES ya tiene señal.',
  },
  {
    slug: 'pokemon-sv-booster-vending',
    canonical_name: 'Pokémon sobre SV / nueva expansión (vending)',
    world: 'collector',
    image_url: 'https://placehold.co/400x400/1a1f2e/fbbf24?text=Pok%C3%A9mon',
    origin_price_eur: 4.5,
    origin_marketplace: 'Retail · máquinas',
    purchase_url: 'https://www.pokemon.com/es',
    news_query: 'pokemon TCG cards sold out Spain vending',
    reddit_query: 'pokemon tcg scarlet violet restock',
    dna_match_slug: 'pokemon-tcg-sv',
    adn_delay_days: 75,
    notes: 'Coleccionista + intercambio patio. CN sin eco ES ahora.',
  },
  {
    slug: 'labubu-blind-box',
    canonical_name: 'Labubu blind box (Pop Mart)',
    world: 'adult',
    image_url: 'https://placehold.co/400x400/1a1f2e/34d399?text=Labubu',
    origin_price_eur: 12.9,
    origin_marketplace: 'Pop Mart',
    purchase_url: 'https://www.popmart.com/',
    news_query: 'Labubu Pop Mart blind box trending',
    reddit_query: 'labubu pop mart blind box',
    dna_match_slug: 'labubu',
    adn_delay_days: 121,
    notes: 'Adulto/teen. Precio alto — observar para patio derivado (charms).',
  },
];

/** 1 septiembre del año en curso (umbral vuelta al cole). */
export function schoolYearStart(d = new Date()): Date {
  return new Date(d.getFullYear(), 8, 1); // mes 8 = septiembre
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
