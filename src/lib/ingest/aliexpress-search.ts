import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import {
  buildAliExpressProductUrl,
  normalizeAliExpressImage,
  type AliExpressProduct,
  usdToEur,
} from './aliexpress-catalog';

export type AliExpressSearchHit = AliExpressProduct & {
  orders_count: number;
  search_query: string;
  fetched_at: string;
};

type SearchCache = Record<string, { fetched_at: string; products: AliExpressSearchHit[] }>;

const CACHE_PATH = path.join(process.cwd(), 'data', 'aliexpress-top-sellers.json');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 h

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function slugQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseOrdersCount(tradeDesc?: string, orderField?: string): number {
  const raw = tradeDesc ?? orderField ?? '';
  const plus = raw.match(/(\d[\d,.\s]*)\s*\+/i);
  if (plus) return parseInt(plus[1].replace(/[^\d]/g, ''), 10) || 0;
  const num = raw.match(/(\d[\d,.\s]*)/);
  return num ? parseInt(num[1].replace(/[^\d]/g, ''), 10) || 0 : 0;
}

function parsePriceEur(formatted: string): { eur: number; usd: number } {
  const t = formatted.replace(/\\u0026/g, '&').trim();
  const eurM = t.match(/(?:€|EUR)\s*([\d,.]+)/i) ?? t.match(/([\d,.]+)\s*€/);
  if (eurM) {
    const eur = parseFloat(eurM[1].replace(/\./g, '').replace(',', '.'));
    if (!Number.isNaN(eur)) return { eur, usd: Math.round((eur / 0.92) * 100) / 100 };
  }
  const usdM = t.match(/(?:US\s*\$|USD\s*\$?|\$)\s*([\d,.]+)/i);
  if (usdM) {
    const usd = parseFloat(usdM[1].replace(/,/g, ''));
    if (!Number.isNaN(usd)) return { eur: usdToEur(usd), usd };
  }
  return { eur: 0, usd: 0 };
}

function decodeTitle(raw: string): string {
  return raw
    .replace(/\\u0026/g, '&')
    .replace(/\\u0022/g, '"')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .trim();
}

/** Parsea listado wholesale / búsqueda AliExpress embebido en HTML. */
export function parseAliExpressSearchHtml(html: string, query: string): AliExpressSearchHit[] {
  const now = new Date().toISOString();
  const products: AliExpressSearchHit[] = [];
  const seen = new Set<string>();

  const blockRe =
    /\{"redirectedId":"(\d+)"[\s\S]*?"image":\{"imgUrl":"([^"]+)"[\s\S]*?"displayTitle":"([^"]+)"[\s\S]*?"formattedPrice":"([^"]+)"(?:[\s\S]*?"tradeDesc":"([^"]*)")?/g;

  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const item_id = m[1];
    if (seen.has(item_id)) continue;
    seen.add(item_id);

    const imgRaw = m[2].replace(/\\\//g, '/');
    const title = decodeTitle(m[3]);
    const { eur, usd } = parsePriceEur(m[4]);
    const orders_count = parseOrdersCount(m[5]);

    products.push({
      item_id,
      title,
      image_url: normalizeAliExpressImage(
        imgRaw.startsWith('http') ? imgRaw : `https:${imgRaw.replace(/^\/\//, '')}`
      ),
      price_eur: eur,
      price_usd: usd,
      keywords: [],
      orders_count,
      orders_label: orders_count > 0 ? `${orders_count.toLocaleString('es-ES')}+ vendidos` : undefined,
      search_query: query,
      fetched_at: now,
    });
  }

  return products.sort((a, b) => b.orders_count - a.orders_count);
}

async function readCache(): Promise<SearchCache> {
  try {
    const raw = await readFile(CACHE_PATH, 'utf8');
    return JSON.parse(raw) as SearchCache;
  } catch {
    return {};
  }
}

async function writeCache(cache: SearchCache): Promise<void> {
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

async function fetchWholesaleHtml(query: string): Promise<string | null> {
  const slug = slugQuery(query);
  const urls = [
    `https://es.aliexpress.com/w/wholesale-${slug}.html`,
    `https://www.aliexpress.com/w/wholesale-${slug}.html`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          Accept: 'text/html,application/xhtml+xml',
          Referer: 'https://www.aliexpress.com/',
        },
        signal: AbortSignal.timeout(15_000),
      });
      const html = await res.text();
      if (html.includes('redirectedId') && html.length > 50_000) return html;
    } catch {
      /* siguiente URL */
    }
  }
  return null;
}

/**
 * Top sellers por keyword — caché 6 h, reintenta scrape en vivo.
 * Orden: más vendidos primero.
 */
export async function searchAliExpressTopSellers(
  query: string,
  limit = 5
): Promise<{ products: AliExpressSearchHit[]; fromCache: boolean; error?: string }> {
  const key = slugQuery(query);
  const cache = await readCache();
  const cached = cache[key];
  const cacheFresh =
    cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

  if (cacheFresh && cached.products.length > 0) {
    return { products: cached.products.slice(0, limit), fromCache: true };
  }

  const html = await fetchWholesaleHtml(query);
  if (html) {
    const products = parseAliExpressSearchHtml(html, query).slice(0, Math.max(limit, 10));
    if (products.length > 0) {
      cache[key] = { fetched_at: new Date().toISOString(), products };
      await writeCache(cache).catch(() => {});
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

  return { products: [], fromCache: false, error: 'aliexpress_search_unavailable' };
}

export function searchHitToProduct(hit: AliExpressSearchHit): AliExpressProduct {
  return {
    item_id: hit.item_id,
    title: hit.title,
    image_url: hit.image_url,
    price_eur: hit.price_eur,
    price_usd: hit.price_usd,
    keywords: hit.keywords,
    orders_label: hit.orders_label,
  };
}

export function directPurchaseUrl(itemId: string): string {
  return buildAliExpressProductUrl(itemId, 'es');
}
