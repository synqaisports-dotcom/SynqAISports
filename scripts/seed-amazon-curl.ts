import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { DISCOVERY_QUERIES } from '../src/lib/ingest/discovery-queries';
import { WATCHLIST } from '../src/lib/ingest/watchlist';
import { parseAmazonSearchHtml } from '../src/lib/ingest/amazon-search';
import type { MarketplaceSearchHit } from '../src/lib/ingest/marketplace-search-types';

function slugQuery(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function fetchHtmlCurl(url: string): string {
  return execSync(
    `curl -sL -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" -H "Accept-Language: es-ES,es;q=0.9" "${url}"`,
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
}

async function main() {
  const esCache: Record<string, { fetched_at: string; products: MarketplaceSearchHit[] }> = {};
  const usCache: Record<string, { fetched_at: string; products: MarketplaceSearchHit[] }> = {};
  const now = new Date().toISOString();

  const queries = [
    ...DISCOVERY_QUERIES.map((dq) => dq.aliexpress_search),
    ...WATCHLIST.map((w) => w.marketplace_search),
  ];
  const unique = [...new Set(queries)];

  for (const q of unique) {
    const key = slugQuery(q);
    console.log(`Fetching Amazon ES: ${q}`);

    const url = `https://www.amazon.es/s?k=${encodeURIComponent(q)}&s=review-rank`;
    const html = fetchHtmlCurl(url);
    const esProducts = parseAmazonSearchHtml(html, q, 'es').slice(0, 10);

    if (esProducts.length > 0) {
      esCache[key] = { fetched_at: now, products: esProducts };
      console.log(`  ES: ${esProducts.length} products`);

      const usProducts: MarketplaceSearchHit[] = esProducts.map((p) => ({
        ...p,
        marketplace: 'amazon_us' as const,
        purchase_url: `https://www.amazon.com/dp/${p.item_id}`,
        orders_label: p.orders_label,
      }));
      usCache[key] = { fetched_at: now, products: usProducts };
    } else {
      console.log(`  ES: 0 products (html ${html.length} bytes)`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  const dataDir = path.join(process.cwd(), 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, 'amazon-es-top-sellers.json'), JSON.stringify(esCache, null, 2));
  await writeFile(path.join(dataDir, 'amazon-us-top-sellers.json'), JSON.stringify(usCache, null, 2));
  console.log(`\nWrote ${Object.keys(esCache).length} ES categories, ${Object.keys(usCache).length} US categories`);
}

main().catch(console.error);
