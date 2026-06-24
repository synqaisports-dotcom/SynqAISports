import { searchAliExpressTopSellers, type AliExpressSearchHit } from './aliexpress-search';
import { searchAmazonTopSellers } from './amazon-search';
import type { MarketplaceId, MarketplaceSearchHit } from './marketplace-search-types';
import { searchTemuTopSellers } from './temu-search';

export type MarketplaceTopResult = {
  marketplace: MarketplaceId;
  products: MarketplaceSearchHit[];
  fromCache: boolean;
  error?: string;
};

export type MultiMarketplaceTopResult = {
  byMarketplace: Partial<Record<MarketplaceId, MarketplaceTopResult>>;
  errors: string[];
};

function aliHitToMarketplace(hit: AliExpressSearchHit): MarketplaceSearchHit {
  return {
    item_id: hit.item_id,
    title: hit.title,
    image_url: hit.image_url,
    price_eur: hit.price_eur,
    orders_count: hit.orders_count,
    orders_label: hit.orders_label ?? null,
    purchase_url: `https://es.aliexpress.com/item/${hit.item_id}.html`,
    marketplace: 'aliexpress',
    search_query: hit.search_query,
    fetched_at: hit.fetched_at,
  };
}

/** Top 3 por marketplace en paralelo (AliExpress, Amazon ES/US, Temu). */
export async function searchAllMarketplaceTopSellers(
  query: string,
  limit = 3
): Promise<MultiMarketplaceTopResult> {
  const [ae, amzEs, amzUs, temu] = await Promise.all([
    searchAliExpressTopSellers(query, limit),
    searchAmazonTopSellers(query, 'es', limit),
    searchAmazonTopSellers(query, 'us', limit),
    searchTemuTopSellers(query, limit),
  ]);

  const byMarketplace: Partial<Record<MarketplaceId, MarketplaceTopResult>> = {};
  const errors: string[] = [];

  if (ae.products.length > 0) {
    byMarketplace.aliexpress = {
      marketplace: 'aliexpress',
      products: ae.products.map(aliHitToMarketplace),
      fromCache: ae.fromCache,
      error: ae.error,
    };
  } else if (ae.error) errors.push(`aliexpress:${ae.error}`);

  if (amzEs.products.length > 0) {
    byMarketplace.amazon_es = {
      marketplace: 'amazon_es',
      products: amzEs.products,
      fromCache: amzEs.fromCache,
      error: amzEs.error,
    };
  } else if (amzEs.error) errors.push(`amazon_es:${amzEs.error}`);

  if (amzUs.products.length > 0) {
    byMarketplace.amazon_us = {
      marketplace: 'amazon_us',
      products: amzUs.products,
      fromCache: amzUs.fromCache,
      error: amzUs.error,
    };
  } else if (amzUs.error) errors.push(`amazon_us:${amzUs.error}`);

  if (temu.products.length > 0) {
    byMarketplace.temu = {
      marketplace: 'temu',
      products: temu.products,
      fromCache: temu.fromCache,
      error: temu.error,
    };
  } else if (temu.error) errors.push(`temu:${temu.error}`);

  return { byMarketplace, errors };
}
