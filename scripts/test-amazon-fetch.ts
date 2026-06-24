import { writeFile } from 'fs/promises';
import { parseAmazonSearchHtml } from '../src/lib/ingest/amazon-search';

async function main() {
  const res = await fetch('https://www.amazon.es/s?k=3d+printed+dragon+toy&s=review-rank', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  const html = await res.text();
  await writeFile('/tmp/amazon-node.html', html);
  console.log('status', res.status, 'len', html.length);
  console.log('has s-search-result', html.includes('s-search-result'));
  console.log('has captcha', html.includes('captcha') || html.includes('robot'));
  const prods = parseAmazonSearchHtml(html, '3d printed dragon toy', 'es');
  console.log('parsed', prods.length);
}

main();
