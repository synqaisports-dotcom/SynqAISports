/**
 * Siembra cachés Amazon ES/US y Temu para todas las categorías de discovery.
 * Ejecutar: npx tsx scripts/seed-marketplace-cache.ts
 */
import { DISCOVERY_QUERIES } from '../src/lib/ingest/discovery-queries';
import { searchAmazonTopSellers } from '../src/lib/ingest/amazon-search';
import { searchTemuTopSellers } from '../src/lib/ingest/temu-search';

async function main() {
  for (const dq of DISCOVERY_QUERIES) {
    const q = dq.aliexpress_search;
    console.log(`\n=== ${dq.id}: ${q} ===`);

    const es = await searchAmazonTopSellers(q, 'es', 3);
    console.log(`  Amazon ES: ${es.products.length} (${es.fromCache ? 'cache' : 'live'})`);

    const us = await searchAmazonTopSellers(q, 'us', 3);
    console.log(`  Amazon US: ${us.products.length} (${us.fromCache ? 'cache' : 'live'})`);

    const temu = await searchTemuTopSellers(q, 3);
    console.log(`  Temu: ${temu.products.length} (${temu.fromCache ? 'cache' : 'fallback'})`);

    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log('\nDone.');
}

main().catch(console.error);
