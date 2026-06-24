import type { MarketplaceCandidate, TrendProductPick } from '../cycle-types';
import type { PurchaseLinks } from '../price-comparator';
import { applyPriceEstimate, buildPriceEstimate } from '../price-comparator';
import {
  type AliExpressProduct,
  buildAliExpressProductUrl,
  normalizeAliExpressImage,
} from './aliexpress-catalog';
import { type AliExpressSearchHit, searchHitToProduct } from './aliexpress-search';

export type EnrichedProductFields = {
  aliexpress_item_id?: string;
  aliexpress_product_title?: string;
  signal_headline?: string;
  image_url: string;
  origin_price_eur: number;
  purchase_url: string;
  purchase_links: PurchaseLinks;
  origin_marketplace: string;
  units_sold_label?: string | null;
};

function productToFields(product: AliExpressProduct): EnrichedProductFields {
  const url = buildAliExpressProductUrl(product.item_id, 'es');
  const image =
    product.image_url && product.image_url.length > 10
      ? normalizeAliExpressImage(product.image_url)
      : product.image_url;

  return {
    aliexpress_item_id: product.item_id,
    aliexpress_product_title: product.title,
    image_url: image,
    origin_price_eur: product.price_eur > 0 ? product.price_eur : 0,
    purchase_url: url,
    purchase_links: {
      aliexpress: url,
      amazon_us: `https://www.amazon.com/s?k=${encodeURIComponent(product.title.slice(0, 40))}`,
    },
    origin_marketplace: 'AliExpress · más vendidos · enlace directo',
    units_sold_label: product.orders_label ?? null,
  };
}

/** Construye top 3 con margen estimado por producto. */
export function buildTopProductPicks(
  hits: AliExpressSearchHit[],
  wavePatternSlug: string,
  signals: { cn: number; us: number; es: number }
): TrendProductPick[] {
  return hits.slice(0, 3).map((hit, i) => {
    const product = searchHitToProduct(hit);
    const est = buildPriceEstimate({
      keywords: product.title.slice(0, 40),
      title: product.title,
      wave_pattern_slug: wavePatternSlug,
      signal_cn: signals.cn,
      signal_us: signals.us,
      signal_es: signals.es,
    });
    const margin =
      product.price_eur > 0
        ? Math.round((est.estimated_es_retail_mid_eur - product.price_eur) * 100) / 100
        : est.margin_eur;

    return {
      rank: i + 1,
      item_id: product.item_id,
      title: product.title.slice(0, 100),
      image_url: normalizeAliExpressImage(product.image_url),
      price_eur: product.price_eur,
      orders_count: hit.orders_count,
      orders_label: product.orders_label ?? null,
      purchase_url: buildAliExpressProductUrl(product.item_id, 'es'),
      margin_eur: margin,
      margin_pct:
        product.price_eur > 0
          ? Math.round((margin / product.price_eur) * 100)
          : est.margin_pct,
    };
  });
}

/** Una ficha de tendencia = categoría + top 3 productos; #1 es el principal. */
export function candidateFromTrendCategory<T extends MarketplaceCandidate>(
  base: T,
  hits: AliExpressSearchHit[],
  options: {
    signalHeadline?: string;
    esHeadline?: string;
    keywords: string;
    wavePatternSlug: string;
    signals: { cn: number; us: number; es: number };
  }
): T & Partial<EnrichedProductFields> {
  if (hits.length === 0) return base;

  const topProducts = buildTopProductPicks(hits, options.wavePatternSlug, options.signals);
  const lead = hits[0];
  const enriched = candidateFromAliExpressProduct(base, lead, {
    signalHeadline: options.signalHeadline,
    keywords: options.keywords,
  });

  const ordersTotal = hits.slice(0, 3).reduce((s, h) => s + h.orders_count, 0);

  return {
    ...enriched,
    top_products: topProducts,
    origin_orders_total: ordersTotal,
    es_headline: options.esHeadline,
    units_sold_label: `Top ventas origen: ${ordersTotal.toLocaleString('es-ES')}+ pedidos (top 3)`,
    notes: [
      base.notes,
      options.esHeadline
        ? `Eco ES: «${options.esHeadline}» (${options.signals.es} menciones)`
        : options.signals.es === 0
          ? 'Sin referencias en España — ventana importación abierta'
          : `ES: ${options.signals.es} mención(es) — vigilar saturación`,
    ]
      .filter(Boolean)
      .join(' · '),
  };
}

/** Crea candidato desde producto AliExpress real + señal de titular opcional. */
export function candidateFromAliExpressProduct<T extends MarketplaceCandidate>(
  base: T,
  hit: AliExpressSearchHit,
  options?: { signalHeadline?: string; keywords?: string }
): T & Partial<EnrichedProductFields> {
  const product = searchHitToProduct(hit);
  const fields = productToFields(product);

  const titled: T = {
    ...base,
    canonical_name: product.title.slice(0, 120),
    signal_headline: options?.signalHeadline,
    image_url: fields.image_url || base.image_url,
  };

  const withEstimate = applyPriceEstimate(
    titled,
    options?.keywords ?? product.title.slice(0, 40),
    undefined
  ) as T & Partial<EnrichedProductFields>;

  return {
    ...withEstimate,
    ...fields,
    canonical_name: product.title.slice(0, 120),
    signal_headline: options?.signalHeadline,
    origin_price_eur: product.price_eur > 0 ? product.price_eur : withEstimate.origin_price_eur,
    origin_price_us_eur:
      product.price_eur > 0
        ? Math.round(product.price_eur * 1.15 * 100) / 100
        : withEstimate.origin_price_us_eur,
    purchase_url: fields.purchase_url,
    purchase_links: fields.purchase_links,
    units_sold_label: fields.units_sold_label ?? withEstimate.units_sold_label,
    margin_eur:
      product.price_eur > 0 && withEstimate.estimated_es_retail_mid_eur != null
        ? Math.round((withEstimate.estimated_es_retail_mid_eur - product.price_eur) * 100) / 100
        : withEstimate.margin_eur,
    margin_pct:
      product.price_eur > 0 && withEstimate.estimated_es_retail_mid_eur != null
        ? Math.round(
            ((withEstimate.estimated_es_retail_mid_eur - product.price_eur) / product.price_eur) *
              100
          )
        : withEstimate.margin_pct,
    notes: [
      base.notes,
      product.price_eur > 0 ? 'Precio origen desde listado AliExpress (puede incluir IVA en ES).' : null,
    ]
      .filter(Boolean)
      .join(' · '),
  };
}
