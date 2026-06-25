/**
 * Siembra caché AliExpress para búsquedas del radar (pilotos ADN).
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { WATCHLIST } from '../src/lib/ingest/watchlist';
import { searchAliExpressTopSellers } from '../src/lib/ingest/aliexpress-search';

async function main() {
  for (const watch of WATCHLIST) {
    console.log(`AliExpress: ${watch.marketplace_search}`);
    const result = await searchAliExpressTopSellers(watch.marketplace_search, 5);
    console.log(`  → ${result.products.length} (${result.fromCache ? 'cache' : 'live'})`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('Done.');
}

main().catch(console.error);
