import type { MarketplaceCandidate } from '../cycle-types';
import type { PurchaseLinks } from '../price-comparator';
import { applyPriceEstimate } from '../price-comparator';
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
