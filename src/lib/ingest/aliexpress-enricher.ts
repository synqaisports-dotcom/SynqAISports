import type { MarketplaceCandidate } from '../cycle-types';
import type { PurchaseLinks } from '../price-comparator';
import { applyPriceEstimate } from '../price-comparator';
import {
  type AliExpressProduct,
  buildAliExpressProductUrl,
  getAliExpressProductById,
  matchAliExpressProduct,
  normalizeAliExpressImage,
  parseAliExpressItemId,
} from './aliexpress-catalog';

export type EnrichedProductFields = {
  aliexpress_item_id?: string;
  aliexpress_product_title?: string;
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
    origin_marketplace: 'AliExpress · enlace directo al producto',
    units_sold_label: product.orders_label ?? null,
  };
}

/** Aplica producto AliExpress real a un candidato (imagen, precio, URL directa). */
export function enrichWithAliExpressProduct<T extends MarketplaceCandidate>(
  candidate: T,
  options?: {
    keywords?: string;
    catalogSlug?: string;
    evidenceUrls?: string[];
  }
): T & Partial<EnrichedProductFields> {
  const evidence = [
    ...(options?.evidenceUrls ?? []),
    ...(candidate.evidence_urls ?? []),
    candidate.purchase_url,
  ].filter(Boolean) as string[];

  let product = matchAliExpressProduct({
    title: candidate.canonical_name,
    keywords: options?.keywords,
    catalogSlug: options?.catalogSlug,
    evidenceUrls: evidence,
  });

  if (!product) return candidate;

  const fields = productToFields(product);

  if (!fields.image_url && product.item_id) {
    fields.image_url = candidate.image_url;
  }

  const withEstimate = applyPriceEstimate(
    candidate,
    options?.keywords ?? candidate.canonical_name.slice(0, 30),
    undefined
  ) as T & Partial<EnrichedProductFields>;

  return {
    ...withEstimate,
    ...fields,
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
  };
}

/** Resuelve producto solo por URLs en titulares (sin catálogo). */
export function resolveProductFromUrls(urls: string[]): AliExpressProduct | null {
  for (const url of urls) {
    const id = parseAliExpressItemId(url);
    if (!id) continue;
    const known = getAliExpressProductById(id);
    if (known) return known;
    return {
      item_id: id,
      title: `AliExpress #${id}`,
      image_url: '',
      price_eur: 0,
      price_usd: 0,
      keywords: [],
    };
  }
  return null;
}
