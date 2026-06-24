import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { MarketplaceId, MarketplaceSearchHit } from './marketplace-search-types';

export type AmazonLocale = 'es' | 'us';

type SearchCache = Record<string, { fetched_at: string; products: MarketplaceSearchHit[] }>;

const CACHE_PATHS: Record<AmazonLocale, string> = {
  es: path.join(process.cwd(), 'data', 'amazon-es-top-sellers.json'),
  us: path.join(process.cwd(), 'data', 'amazon-us-top-sellers.json'),
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const DOMAINS: Record<AmazonLocale, { host: string; marketplace: MarketplaceId }> = {
  es: { host: 'www.amazon.es', marketplace: 'amazon_es' },
  us: { host: 'www.amazon.com', marketplace: 'amazon_us' },
};

function slugQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildAmazonSearchUrl(query: string, locale: AmazonLocale): string {
  const host = DOMAINS[locale].host;
  return `https://${host}/s?k=${encodeURIComponent(query)}&s=review-rank`;
}

function fallbackFromSearch(query: string, locale: AmazonLocale, limit: number): MarketplaceSearchHit[] {
  const now = new Date().toISOString();
  const { marketplace } = DOMAINS[locale];
  const url = buildAmazonSearchUrl(query, locale);
  const label = locale === 'es' ? 'Amazon ES' : 'Amazon US';
  return Array.from({ length: limit }, (_, i) => ({
    item_id: `amazon-${locale}-search-${slugQuery(query)}-${i + 1}`,
    title: `Top ${i + 1} más vendidos en ${label} · ${query}`,
    image_url: '',
    price_eur: 0,
    orders_count: 0,
    orders_label: `Ver en ${label}`,
    purchase_url: url,
    marketplace,
    search_query: query,
    fetched_at: now,
  }));
}

function parsePriceEur(raw: string, locale: AmazonLocale): number {
  const t = raw.replace(/\u00a0/g, ' ').trim();
  const eurM = t.match(/([\d.,]+)\s*€/) ?? t.match(/€\s*([\d.,]+)/);
  if (eurM) {
    const n = parseFloat(eurM[1].replace(/\./g, '').replace(',', '.'));
    if (!Number.isNaN(n)) return n;
  }
  const usdM = t.match(/\$\s*([\d.,]+)/) ?? t.match(/([\d.,]+)\s*USD/i);
  if (usdM) {
    const usd = parseFloat(usdM[1].replace(/,/g, ''));
    if (!Number.isNaN(usd)) return Math.round(usd * 0.92 * 100) / 100;
  }
  return locale === 'us' ? 0 : 0;
}

function parseReviews(block: string): number {
  const patterns = [
    /([\d.,]+)\s*reseñas/i,
    /([\d.,]+)\s*valoraciones/i,
    /([\d.,]+)\s*ratings/i,
    /([\d.,]+)\s*reviews/i,
  ];
  for (const re of patterns) {
    const m = block.match(re);
    if (m) return parseInt(m[1].replace(/[.,]/g, ''), 10) || 0;
  }
  return 0;
}

/** Parsea listado de búsqueda Amazon (ES/US). */
export function parseAmazonSearchHtml(
  html: string,
  query: string,
  locale: AmazonLocale
): MarketplaceSearchHit[] {
  const now = new Date().toISOString();
  const { host, marketplace } = DOMAINS[locale];
  const products: MarketplaceSearchHit[] = [];
  const seen = new Set<string>();

  function pushProduct(asin: string, block: string) {
    if (!asin || seen.has(asin)) return;
    seen.add(asin);

    let title = '';
    const h2 = block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([^<]+)/);
    if (h2) title = h2[1].replace(/\s+/g, ' ').trim();
    if (!title) {
      const alt = block.match(/class="s-image"[^>]*alt="([^"]+)"/);
      if (alt) title = alt[1].replace(/\s+/g, ' ').trim();
    }
    if (!title || title.length < 8) return;

    let price_eur = 0;
    const priceM = block.match(/class="a-offscreen">([^<]+)</);
    if (priceM) price_eur = parsePriceEur(priceM[1], locale);

    const reviews = parseReviews(block);

    let image_url = '';
    const imgM = block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    if (imgM) image_url = imgM[1];

    products.push({
      item_id: asin,
      title: title.slice(0, 120),
      image_url,
      price_eur,
      orders_count: reviews,
      orders_label: reviews > 0 ? `${reviews.toLocaleString('es-ES')} reseñas` : null,
      purchase_url: `https://${host}/dp/${asin}`,
      marketplace,
      search_query: query,
      fetched_at: now,
    });
  }

  const blocks = html.split('data-component-type="s-search-result"');
  if (blocks.length > 1) {
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const asinM = block.match(/data-asin="([A-Z0-9]{10})"/);
      if (asinM) pushProduct(asinM[1], block);
    }
  } else {
    const asinRe = /data-asin="([A-Z0-9]{10})"/g;
    let m: RegExpExecArray | null;
    while ((m = asinRe.exec(html)) !== null) {
      const start = Math.max(0, m.index - 200);
      const end = Math.min(html.length, m.index + 4000);
      pushProduct(m[1], html.slice(start, end));
      if (products.length >= 15) break;
    }
  }

  return products.sort((a, b) => b.orders_count - a.orders_count);
}

async function readCache(locale: AmazonLocale): Promise<SearchCache> {
  try {
    const raw = await readFile(CACHE_PATHS[locale], 'utf8');
    return JSON.parse(raw) as SearchCache;
  } catch {
    return {};
  }
}

async function writeCache(locale: AmazonLocale, cache: SearchCache): Promise<void> {
  const p = CACHE_PATHS[locale];
  await mkdir(path.dirname(p), { recursive: true });
  await writeFile(p, JSON.stringify(cache, null, 2), 'utf8');
}

async function fetchAmazonHtml(query: string, locale: AmazonLocale): Promise<string | null> {
  const { host } = DOMAINS[locale];
  const url = `https://${host}/s?k=${encodeURIComponent(query)}&s=review-rank`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept-Language': locale === 'es' ? 'es-ES,es;q=0.9' : 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    });
    const html = await res.text();
    if (html.includes('s-search-result') && html.length > 50_000) return html;
  } catch {
    /* fallthrough */
  }
  return null;
}

export async function searchAmazonTopSellers(
  query: string,
  locale: AmazonLocale,
  limit = 3
): Promise<{ products: MarketplaceSearchHit[]; fromCache: boolean; error?: string }> {
  const key = slugQuery(query);
  const cache = await readCache(locale);
  const cached = cache[key];
  const cacheFresh =
    cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

  if (cacheFresh && cached.products.length > 0) {
    return { products: cached.products.slice(0, limit), fromCache: true };
  }

  const html = await fetchAmazonHtml(query, locale);
  if (html) {
    const products = parseAmazonSearchHtml(html, query, locale).slice(0, Math.max(limit, 10));
    if (products.length > 0) {
      cache[key] = { fetched_at: new Date().toISOString(), products };
      await writeCache(locale, cache).catch(() => {});
      return { products: products.slice(0, limit), fromCache: false };
    }
  }

  if (cached?.products.length) {
    return {
      products: cached.products.slice(0, limit),
      fromCache: true,
      error: 'live_search_blocked_using_cache',
    };
  }

  const fallback = fallbackFromSearch(query, locale, limit);
  cache[key] = { fetched_at: new Date().toISOString(), products: fallback };
  await writeCache(locale, cache).catch(() => {});

  return {
    products: fallback,
    fromCache: false,
    error: `amazon_${locale}_search_link_fallback`,
  };
}
