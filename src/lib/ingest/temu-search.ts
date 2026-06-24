import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { MarketplaceSearchHit } from './marketplace-search-types';

type SearchCache = Record<string, { fetched_at: string; products: MarketplaceSearchHit[] }>;

const CACHE_PATH = path.join(process.cwd(), 'data', 'temu-top-sellers.json');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function slugQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildTemuSearchUrl(query: string): string {
  return `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(query)}&filter_items=3%3A1`;
}

/**
 * Temu carga productos vía CSR — sin parser fiable en servidor.
 * Usa caché semilla; si no hay datos, genera enlaces de búsqueda top ventas.
 */
function fallbackFromSearch(query: string, limit: number): MarketplaceSearchHit[] {
  const now = new Date().toISOString();
  const url = buildTemuSearchUrl(query);
  return Array.from({ length: limit }, (_, i) => ({
    item_id: `temu-search-${slugQuery(query)}-${i + 1}`,
    title: `Top ${i + 1} más vendidos en Temu · ${query}`,
    image_url: '',
    price_eur: 0,
    orders_count: 0,
    orders_label: 'Ver en Temu',
    purchase_url: url,
    marketplace: 'temu' as const,
    search_query: query,
    fetched_at: now,
  }));
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

export async function searchTemuTopSellers(
  query: string,
  limit = 3
): Promise<{ products: MarketplaceSearchHit[]; fromCache: boolean; error?: string }> {
  const key = slugQuery(query);
  const cache = await readCache();
  const cached = cache[key];
  const cacheFresh =
    cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

  if (cacheFresh && cached.products.length > 0) {
    return { products: cached.products.slice(0, limit), fromCache: true };
  }

  if (cached?.products.length) {
    return {
      products: cached.products.slice(0, limit),
      fromCache: true,
      error: 'temu_csr_using_cache',
    };
  }

  const fallback = fallbackFromSearch(query, limit);
  cache[key] = { fetched_at: new Date().toISOString(), products: fallback };
  await writeCache(cache).catch(() => {});

  return {
    products: fallback,
    fromCache: false,
    error: 'temu_search_link_fallback',
  };
}
