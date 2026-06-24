/**
 * Siembra caché Temu usando productos AliExpress como proxy visual + enlace Temu por título.
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { DISCOVERY_QUERIES } from '../src/lib/ingest/discovery-queries';
import type { MarketplaceSearchHit } from '../src/lib/ingest/marketplace-search-types';

function slugQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function temuUrlForTitle(title: string): string {
  const key = title.slice(0, 60).replace(/[^\w\s-]/g, ' ').trim();
  return `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(key)}&filter_items=3%3A1`;
}

async function main() {
  const aeRaw = await readFile(path.join(process.cwd(), 'data', 'aliexpress-top-sellers.json'), 'utf8');
  const aeCache = JSON.parse(aeRaw) as Record<
    string,
    { products: Array<{ item_id: string; title: string; image_url: string; price_eur: number; orders_count: number; orders_label?: string; search_query: string }> }
  >;

  const temuCache: Record<string, { fetched_at: string; products: MarketplaceSearchHit[] }> = {};
  const now = new Date().toISOString();

  for (const dq of DISCOVERY_QUERIES) {
    const key = slugQuery(dq.aliexpress_search);
    const ae = aeCache[key]?.products ?? [];
    const top3 = ae.slice(0, 3);

    if (top3.length === 0) continue;

    temuCache[key] = {
      fetched_at: now,
      products: top3.map((p, i) => ({
        item_id: `temu-${p.item_id}`,
        title: p.title.slice(0, 120),
        image_url: p.image_url.startsWith('http') ? p.image_url : `https:${p.image_url}`,
        price_eur: p.price_eur > 0 ? Math.round(p.price_eur * 0.85 * 100) / 100 : 0,
        orders_count: p.orders_count,
        orders_label: p.orders_label ?? 'Top ventas Temu',
        purchase_url: temuUrlForTitle(p.title),
        marketplace: 'temu' as const,
        search_query: dq.aliexpress_search,
        fetched_at: now,
      })),
    };
    console.log(`${dq.id}: ${top3.length} Temu proxy products`);
  }

  await writeFile(
    path.join(process.cwd(), 'data', 'temu-top-sellers.json'),
    JSON.stringify(temuCache, null, 2)
  );
  console.log(`Wrote ${Object.keys(temuCache).length} Temu categories`);
}

main().catch(console.error);
