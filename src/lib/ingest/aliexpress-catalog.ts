/**
 * Catálogo curado de productos AliExpress con ID, imagen CDN y precio real.
 * Enlaces directos: es.aliexpress.com/item/{id}.html — no búsquedas wholesale.
 */
export type AliExpressProduct = {
  item_id: string;
  title: string;
  image_url: string;
  price_eur: number;
  price_usd: number;
  /** Palabras para emparejar titulares / predicciones */
  keywords: string[];
  /** Slugs del catálogo patio (marketplace-catalog) */
  catalog_slugs?: string[];
  orders_label?: string;
};

const USD_TO_EUR = 0.92;

export function usdToEur(usd: number): number {
  return Math.round(usd * USD_TO_EUR * 100) / 100;
}

/** URL directa al producto (ES por defecto). */
export function buildAliExpressProductUrl(itemId: string, locale: 'es' | 'www' = 'es'): string {
  const host = locale === 'es' ? 'es.aliexpress.com' : 'www.aliexpress.com';
  return `https://${host}/item/${itemId}.html`;
}

/** Quita sufijos de tamaño AliExpress para imagen HQ. */
export function normalizeAliExpressImage(url: string): string {
  return url
    .replace(/^\/\//, 'https://')
    .replace(/^https:(?!\/\/)/, 'https://')
    .replace(/^http:(?!\/\/)/, 'http://')
    .replace(/_\d+x\d+q\d+\.jpg[^/]*$/i, '.jpg')
    .replace(/\.jpg_\.webp$/i, '.jpg')
    .replace(/\.png_\.webp$/i, '.png');
}

/** Extrae item ID de URLs AliExpress en noticias/Reddit. */
export function parseAliExpressItemId(text: string): string | null {
  const m = text.match(/aliexpress\.(?:com|us|es)[^"'\s]*?\/item\/(\d{10,20})\.html/i);
  return m?.[1] ?? null;
}

/**
 * Productos verificados — IDs reales de listados AliExpress.
 * Imágenes en ae-pic-a1.aliexpress-media.com (CDN público).
 */
export const ALIEXPRESS_PRODUCT_CATALOG: AliExpressProduct[] = [
  {
    item_id: '1005011600355936',
    title: 'Toalla microfibra niños Lilo Stitch — secado rápido playa/piscina',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/Sa533069f8483492883313378a8460ec4i.jpg',
    price_usd: 0.99,
    price_eur: 0.99,
    keywords: ['stitch', 'lilo', 'towel', 'toalla', 'microfiber', 'beach', 'kids', 'verano', 'playa'],
    catalog_slugs: ['summer-playground-towel', 'summer-playground'],
    orders_label: '159 pedidos',
  },
  {
    item_id: '3256808122729718',
    title: 'Dragón articulado 3D fidget — juego de piezas rotativas',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S4b566dec2d02402d87f8bc2165144fb0a.jpg',
    price_usd: 2.15,
    price_eur: usdToEur(2.15),
    keywords: ['dragon', '3d printed', 'fidget', 'articulated', 'dinosaur', 'dragón'],
    catalog_slugs: ['dragon-3d-articulated', 'viral-toy-tiktok', 'new-fidget'],
    orders_label: '2100+ vendidos',
  },
  {
    item_id: '3256804232475089',
    title: 'Mini mochi squishy kawaii — bolsa antistress niños',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/Sd77eff7564fc4a599c76c80653657874t.jpg',
    price_usd: 3.12,
    price_eur: usdToEur(3.12),
    keywords: ['mochi', 'squishy', 'squeeze', 'kawaii', 'antistress', 'mini'],
    catalog_slugs: ['squishy-mochi-mini', 'squish-collectible'],
    orders_label: '1653 pedidos',
  },
  {
    item_id: '1005005069761577',
    title: 'Charm llavero squishy edamame — peluche mochila',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/H867d729e0bc047b291ee41f78414e64aN.jpg',
    price_usd: 2.59,
    price_eur: usdToEur(2.59),
    keywords: ['keychain', 'charm', 'plush', 'backpack', 'llavero', 'mochila', 'peluche'],
    catalog_slugs: ['plush-keychain-charm', 'backpack-charm-trend'],
    orders_label: '2000+ vendidos',
  },
  {
    item_id: '1005005441683793',
    title: 'Squishy fidget mesh ball — bola sensorial antistress',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S8f4386c4cc4e41cb9cb1a54340cfb273U.jpg',
    price_usd: 2.59,
    price_eur: usdToEur(2.59),
    keywords: ['mesh', 'ball', 'fidget', 'squishy', 'squeeze', 'sensory', 'bola'],
    catalog_slugs: ['mesh-ball-fidget'],
    orders_label: '2000+ vendidos',
  },
  {
    item_id: '3256805868758144',
    title: 'Finger skate maple wood — mini patinete dedo patio',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S7b7ae8b57f9f454c9b33f410a2b67a0aG.jpg',
    price_usd: 2.9,
    price_eur: usdToEur(2.9),
    keywords: ['finger', 'skateboard', 'fingerboard', 'skate', 'patinete', 'dedo'],
    catalog_slugs: ['finger-skateboard-mini'],
    orders_label: '1090 pedidos',
  },
  {
    item_id: '1005007295311675',
    title: 'Globos de agua reutilizables magnéticos — verano niños',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S63d245164f7347b5930ea504c975c03fb.jpg',
    price_usd: 4.5,
    price_eur: usdToEur(4.5),
    keywords: ['water balloon', 'reusable', 'globos', 'agua', 'summer', 'verano', 'pool'],
    catalog_slugs: ['reusable-water-balloon'],
    orders_label: '5000+ vendidos',
  },
  {
    item_id: '1005010524616487',
    title: 'Charms sandalias / crocs jibbitz — PVC decorativo niños',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S1f7f6880558f4c1a8bc950ec8e8fc8f8B.jpg',
    price_usd: 1.17,
    price_eur: usdToEur(1.17),
    keywords: ['shoe charm', 'jibbitz', 'croc', 'charms', 'sandalias', 'decoración'],
    catalog_slugs: ['croc-charms-jibbitz'],
    orders_label: '304 pedidos',
  },
  {
    item_id: '1005005576049811',
    title: 'Anillos magnéticos fidget spinner — pack 3 uds',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S78521968c97e4997ab20df57d7c4d3f6l.jpg',
    price_usd: 2.75,
    price_eur: usdToEur(2.75),
    keywords: ['magnetic', 'ring', 'fidget', 'spinner', 'anillo', 'magnético'],
    catalog_slugs: ['magnetic-rings-fidget'],
    orders_label: '5000+ vendidos',
  },
  {
    item_id: '3256808421504328',
    title: 'Huevo dragón 3D articulado — sorpresa fidget colección',
    image_url:
      'https://ae-pic-a1.aliexpress-media.com/kf/S4aea653389874438af47b58af0b863d6F.jpg',
    price_usd: 2.67,
    price_eur: usdToEur(2.67),
    keywords: ['dragon egg', 'blind', 'surprise', 'articulated', 'huevo', 'sorpresa'],
    catalog_slugs: ['mystery-blind-kids'],
    orders_label: '800+ vendidos',
  },
];

const byItemId = new Map(ALIEXPRESS_PRODUCT_CATALOG.map((p) => [p.item_id, p]));

export function getAliExpressProductById(itemId: string): AliExpressProduct | undefined {
  return byItemId.get(itemId);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scoreMatch(product: AliExpressProduct, tokens: string[]): number {
  let score = 0;
  for (const kw of product.keywords) {
    const k = kw.toLowerCase();
    if (tokens.some((t) => t.includes(k) || k.includes(t))) score += 2;
    if (tokens.join(' ').includes(k)) score += 1;
  }
  return score;
}

export function matchAliExpressProduct(input: {
  title?: string;
  keywords?: string;
  catalogSlug?: string;
  evidenceUrls?: string[];
}): AliExpressProduct | null {
  for (const url of input.evidenceUrls ?? []) {
    const id = parseAliExpressItemId(url);
    if (id) {
      const hit = getAliExpressProductById(id);
      if (hit) return hit;
      return {
        item_id: id,
        title: input.title ?? `Producto AliExpress ${id}`,
        image_url: '',
        price_eur: 0,
        price_usd: 0,
        keywords: [],
      };
    }
  }

  if (input.catalogSlug) {
    const bySlug = ALIEXPRESS_PRODUCT_CATALOG.find((p) =>
      p.catalog_slugs?.includes(input.catalogSlug!)
    );
    if (bySlug) return bySlug;
  }

  const haystack = `${input.title ?? ''} ${input.keywords ?? ''}`;
  const tokens = tokenize(haystack);
  if (tokens.length === 0) return null;

  let best: AliExpressProduct | null = null;
  let bestScore = 0;
  for (const product of ALIEXPRESS_PRODUCT_CATALOG) {
    const s = scoreMatch(product, tokens);
    if (s > bestScore) {
      bestScore = s;
      best = product;
    }
  }
  return bestScore >= 2 ? best : null;
}
