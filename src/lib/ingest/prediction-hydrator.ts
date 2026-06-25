import type { MarketplaceCandidate } from '../cycle-types';
import { buildTopProductPicksFromHits } from './aliexpress-enricher';
import { DISCOVERY_QUERIES } from './discovery-queries';
import { searchAllMarketplaceTopSellers } from './multi-marketplace-search';
import type { MarketplaceId } from './marketplace-search-types';

function queryForCandidate(c: MarketplaceCandidate): string | null {
  if (c.category_search) return c.category_search;
  const match = c.slug.match(/^trend-(.+)$/);
  if (!match) return null;
  const dq = DISCOVERY_QUERIES.find((d) => d.id === match[1]);
  return dq?.aliexpress_search ?? null;
}

/** Rellena top ventas desde caché cuando la DB no guarda productos. */
export async function hydratePredictionCandidates(
  candidates: MarketplaceCandidate[]
): Promise<MarketplaceCandidate[]> {
  return Promise.all(
    candidates.map(async (c) => {
      const hasProducts =
        (c.top_products?.length ?? 0) > 0 ||
        Object.values(c.top_by_marketplace ?? {}).some((a) => (a?.length ?? 0) > 0);
      if (hasProducts) return c;

      const query = queryForCandidate(c);
      if (!query) return c;

      const multi = await searchAllMarketplaceTopSellers(query, 3);
      const top_by_marketplace: MarketplaceCandidate['top_by_marketplace'] = {};
      const order: MarketplaceId[] = ['aliexpress', 'amazon_es', 'amazon_us', 'temu'];

      for (const mp of order) {
        const block = multi.byMarketplace[mp];
        if (block?.products.length) {
          top_by_marketplace[mp] = buildTopProductPicksFromHits(
            block.products,
            c.dna_match_slug ?? 'pop-it',
            { cn: c.signal_cn, us: c.signal_us, es: c.signal_es },
            mp
          );
        }
      }

      const top_products = top_by_marketplace.aliexpress ?? [];
      const origin_orders_total = top_products.reduce((s, p) => s + p.orders_count, 0);
      const lead = top_products[0];

      return {
        ...c,
        category_search: query,
        top_by_marketplace,
        top_products,
        origin_orders_total,
        image_url: lead?.image_url || c.image_url,
        origin_price_eur: lead?.price_eur || c.origin_price_eur,
        purchase_url: lead?.purchase_url || c.purchase_url,
      };
    })
  );
}
