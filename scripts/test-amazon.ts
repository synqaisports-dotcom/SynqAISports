import { parseAmazonSearchHtml, searchAmazonTopSellers } from '../src/lib/ingest/amazon-search';
import { readFile } from 'fs/promises';

async function main() {
  const html = await readFile('/tmp/amazon-es-test.html', 'utf8');
  const prods = parseAmazonSearchHtml(html, '3d printed dragon toy', 'es');
  console.log('parsed from file:', prods.length, prods[0]?.title);

  const live = await searchAmazonTopSellers('3d printed dragon toy', 'es', 3);
  console.log('live search:', live.products.length, live.error);
}

main();
