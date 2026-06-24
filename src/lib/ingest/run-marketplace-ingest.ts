import type { MarketplaceCandidate } from '../cycle-types';
import {
  PLAYGROUND_SUMMER_CATALOG,
  addDaysIso,
  daysUntilSeptember,
  schoolYearStart,
  type MarketplaceCatalogItem,
} from './marketplace-catalog';
import { scrapeGoogleNewsLocale } from './scrapers/google-news';
import { scrapeReddit } from './scrapers/reddit';

export type MarketplaceIngestResult = {
  phase: '2c';
  scraped_at: string;
  candidates: MarketplaceCandidate[];
  errors: string[];
  days_until_september: number;
};

function weightedScore(cn: number, us: number, es: number, lat: number, rd: number): number {
  return cn * 1.5 + us * 1.3 + lat * 1.15 + rd * 1.0 + es * 0.8;
}

async function signalsForItem(item: MarketplaceCatalogItem): Promise<{
  cn: number;
  us: number;
  es: number;
  lat: number;
  reddit: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const q = item.news_query;
  const rdQ = item.reddit_query;

  const [cnHits, usHits, esHits, latHits, rdHits] = await Promise.all([
    scrapeGoogleNewsLocale(q, 'cn', 21).catch((e) => {
      errors.push(`${item.slug}:cn:${String(e)}`);
      return [];
    }),
    scrapeGoogleNewsLocale(q, 'us', 21).catch((e) => {
      errors.push(`${item.slug}:us:${String(e)}`);
      return [];
    }),
    scrapeGoogleNewsLocale(q, 'es', 21).catch((e) => {
      errors.push(`${item.slug}:es:${String(e)}`);
      return [];
    }),
    scrapeGoogleNewsLocale(q, 'latam', 21).catch((e) => {
      errors.push(`${item.slug}:lat:${String(e)}`);
      return [];
    }),
    scrapeReddit(rdQ, 10).catch((e) => {
      errors.push(`${item.slug}:rd:${String(e)}`);
      return [];
    }),
  ]);

  return {
    cn: cnHits.length,
    us: usHits.length,
    es: esHits.length,
    lat: latHits.length,
    reddit: rdHits.length,
    errors,
  };
}

function catalogToCandidate(
  item: MarketplaceCatalogItem,
  sig: { cn: number; us: number; es: number; lat: number; reddit: number },
  now: Date
): MarketplaceCandidate & { estimated_arrival_es: string; summer_fit: boolean; weighted: number } {
  const weighted = weightedScore(sig.cn, sig.us, sig.es, sig.lat, sig.reddit);
  const originActive = sig.cn + sig.us + sig.lat + sig.reddit;
  const esQuiet = sig.es <= 1;

  const delay = item.adn_delay_days;
  const arrival = addDaysIso(now, Math.round(delay * 0.35));
  const sept = schoolYearStart(now);
  const arrivalDate = new Date(arrival);
  const summer_fit =
    item.world === 'playground' &&
    item.origin_price_eur <= 8 &&
    esQuiet &&
    originActive >= 1 &&
    arrivalDate <= sept;

  const daysLeft = daysUntilSeptember(now);
  const windowLabel = summer_fit
    ? `✓ Ventana verano: señal origen activa, llegada est. ~${arrival} (antes sept · ${daysLeft}d restantes)`
    : esQuiet && originActive >= 2
      ? `Oportunidad temprana: origen ${sig.us + sig.cn + sig.lat} menciones, ES=${sig.es}. Est. ${arrival}`
      : sig.es >= 2
        ? `Ya hay eco en ES (${sig.es} menciones) — puede ser tarde para primer lote`
        : `Vigilar · est. llegada ${arrival} (ADN ~${delay}d)`;

  const soldLabel =
    weighted > 0
      ? `News+Reddit 21d: ${weighted.toFixed(1)}w (CN${sig.cn} US${sig.us} ES${sig.es})`
      : 'Sin menciones recientes — vigilar marketplace';

  return {
    slug: item.slug,
    canonical_name: item.canonical_name,
    world: item.world,
    image_url: item.image_url,
    origin_price_eur: item.origin_price_eur,
    origin_marketplace: item.origin_marketplace,
    purchase_url: item.purchase_url,
    units_sold_label: soldLabel,
    signal_cn: sig.cn,
    signal_us: sig.us,
    signal_es: sig.es,
    signal_latam: sig.lat,
    signal_reddit: sig.reddit,
    dna_match_slug: item.dna_match_slug,
    estimated_window_es: windowLabel,
    source_type: 'marketplace_2c',
    notes: item.notes,
    estimated_arrival_es: arrival,
    summer_fit,
    weighted,
  };
}

export async function runMarketplaceIngest(): Promise<MarketplaceIngestResult> {
  const now = new Date();
  const errors: string[] = [];
  const candidates: (MarketplaceCandidate & {
    estimated_arrival_es: string;
    summer_fit: boolean;
    weighted: number;
  })[] = [];

  const batch = await Promise.all(
    PLAYGROUND_SUMMER_CATALOG.map(async (item) => {
      const sig = await signalsForItem(item);
      return { item, sig };
    })
  );
  for (const { item, sig } of batch) {
    errors.push(...sig.errors);
    candidates.push(catalogToCandidate(item, sig, now));
  }

  candidates.sort((a, b) => {
    if (a.summer_fit !== b.summer_fit) return a.summer_fit ? -1 : 1;
    return b.weighted - a.weighted;
  });

  return {
    phase: '2c',
    scraped_at: now.toISOString(),
    candidates,
    errors,
    days_until_september: daysUntilSeptember(now),
  };
}
