import type { TopByMarketplace, TrendProductPick } from '../cycle-types';
import type { LiveSignalRow } from '../radar-types';
import { buildTopProductPicksFromHits } from './aliexpress-enricher';
import { searchAllMarketplaceTopSellers } from './multi-marketplace-search';
import type { WatchItem } from './watchlist';

export type RadarSalesEnrichment = {
  top_by_marketplace: TopByMarketplace;
  top_products: TrendProductPick[];
  origin_orders_total: number;
  marketplace_search: string;
  lead_image_url: string;
  lead_price_eur: number;
  lead_purchase_url: string;
  sales_notes: string;
  errors: string[];
};

function buildTopByMarketplace(
  multi: Awaited<ReturnType<typeof searchAllMarketplaceTopSellers>>,
  wavePatternSlug: string,
  signals: { cn: number; us: number; es: number }
): TopByMarketplace {
  const out: TopByMarketplace = {};
  const order = ['aliexpress', 'amazon_es', 'amazon_us', 'temu'] as const;
  for (const mp of order) {
    const block = multi.byMarketplace[mp];
    if (block?.products.length) {
      out[mp] = buildTopProductPicksFromHits(block.products, wavePatternSlug, signals, mp);
    }
  }
  return out;
}

/** Top 3 por marketplace para un piloto radar — mantiene nombre del piloto. */
export async function enrichRadarWithSales(
  watch: WatchItem,
  corridorSignals: { cn: number; us: number; es: number }
): Promise<RadarSalesEnrichment> {
  const multi = await searchAllMarketplaceTopSellers(watch.marketplace_search, 3);
  const top_by_marketplace = buildTopByMarketplace(multi, watch.dna_match_slug, corridorSignals);
  const top_products = top_by_marketplace.aliexpress ?? [];
  const origin_orders_total = top_products.reduce((s, p) => s + p.orders_count, 0);
  const lead = top_products[0];

  const mpLabels: string[] = [];
  if (top_by_marketplace.aliexpress?.length) mpLabels.push('AliExpress');
  if (top_by_marketplace.amazon_es?.length) mpLabels.push('Amazon ES');
  if (top_by_marketplace.amazon_us?.length) mpLabels.push('Amazon US');
  if (top_by_marketplace.temu?.length) mpLabels.push('Temu');

  const amazonReviews =
    top_by_marketplace.amazon_es?.reduce((s, p) => s + p.orders_count, 0) ?? 0;

  const sales_notes = [
    origin_orders_total > 0
      ? `Origen: ${origin_orders_total.toLocaleString('es-ES')}+ pedidos (top 3 AE)`
      : null,
    amazonReviews > 0
      ? `Amazon ES: ${amazonReviews.toLocaleString('es-ES')}+ reseñas`
      : null,
    mpLabels.length ? `Marketplaces: ${mpLabels.join(' · ')}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    top_by_marketplace,
    top_products,
    origin_orders_total,
    marketplace_search: watch.marketplace_search,
    lead_image_url: lead?.image_url ?? '',
    lead_price_eur: lead?.price_eur ?? 0,
    lead_purchase_url: lead?.purchase_url ?? '',
    sales_notes,
    errors: multi.errors,
  };
}

/** Rellena ventas desde caché si la señal no las tiene (DB antigua o demo). */
export async function hydrateRadarSales(signals: LiveSignalRow[]): Promise<LiveSignalRow[]> {
  const { WATCHLIST } = await import('./watchlist');
  return Promise.all(
    signals.map(async (signal) => {
      if (signal.top_by_marketplace && Object.keys(signal.top_by_marketplace).length > 0) {
        return signal;
      }
      const watch = WATCHLIST.find((w) => w.slug === signal.slug);
      if (!watch) return signal;

      const b = signal.source_breakdown;
      const sales = await enrichRadarWithSales(watch, {
        cn: b?.cn ?? 0,
        us: b?.us ?? 0,
        es: b?.es ?? 0,
      });

      return {
        ...signal,
        top_by_marketplace: sales.top_by_marketplace,
        top_products: sales.top_products,
        origin_orders_total: sales.origin_orders_total,
        marketplace_search: sales.marketplace_search,
        lead_image_url: sales.lead_image_url || signal.lead_image_url,
        lead_price_eur: sales.lead_price_eur || signal.lead_price_eur,
        lead_purchase_url: sales.lead_purchase_url || signal.lead_purchase_url,
      };
    })
  );
}

export function salesBoostFromOrders(orders: number): number {
  if (orders <= 0) return 0;
  return Math.min(6, Math.round(Math.log10(orders + 1) * 2.5 * 10) / 10);
}
