import type { SupplierSource } from './types';

/**
 * Proveedores en orden de compra recomendado.
 * Best Sink Store = fuente principal (Shantou / mayorista — antes que Amazon).
 */
const BEST_SINK_STORE_URL =
  process.env.NEXT_PUBLIC_BEST_SINK_STORE_URL ??
  'https://www.aliexpress.com/w/wholesale-kitchen-sink-toy.html';

export const SUPPLIER_SOURCES: SupplierSource[] = [
  {
    id: 'best-sink-store',
    name: 'Best Sink Store',
    tier: 'factory',
    catalog_url: BEST_SINK_STORE_URL,
    price_factor: 0.42,
    note: 'Proveedor mayorista Shantou. ~40% del precio retail AE. Pide MOQ por WhatsApp/catálogo.',
  },
  {
    id: 'aliexpress-item',
    name: 'AliExpress (unidad)',
    tier: 'wholesale',
    catalog_url: '',
    price_factor: 1,
    note: 'Compra de muestra rápida. Más caro que fábrica pero sin MOQ.',
  },
];

export const PRIMARY_SUPPLIER = SUPPLIER_SOURCES[0];

export function estimateFactoryPriceEur(retailEur: number, supplier = PRIMARY_SUPPLIER): number {
  if (retailEur <= 0) return 0;
  return Math.round(retailEur * supplier.price_factor * 100) / 100;
}

export function supplierSearchUrl(query: string, supplier = PRIMARY_SUPPLIER): string {
  const q = encodeURIComponent(query);
  if (supplier.catalog_url.includes('/store/')) {
    return `${supplier.catalog_url.replace(/\/$/, '')}/search?SearchText=${q}`;
  }
  const slug = query.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  return `https://www.aliexpress.com/w/wholesale-${slug}.html`;
}
