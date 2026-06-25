import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, TrendingUp } from 'lucide-react';
import type { MarketplaceId, TopByMarketplace, TrendProductPick } from '@/lib/cycle-types';
import { MARKETPLACE_LABELS } from '@/lib/ingest/marketplace-search-types';

const MP_STYLES: Record<MarketplaceId, { ring: string; badge: string; label: string; price: string; link: string }> = {
  aliexpress: {
    ring: 'ring-emerald-500/10',
    badge: 'bg-emerald-600/90',
    label: 'text-emerald-400',
    price: 'text-emerald-300',
    link: 'text-emerald-400',
  },
  amazon_es: {
    ring: 'ring-amber-500/10',
    badge: 'bg-amber-600/90',
    label: 'text-amber-400',
    price: 'text-amber-300',
    link: 'text-amber-400',
  },
  amazon_us: {
    ring: 'ring-orange-500/10',
    badge: 'bg-orange-600/90',
    label: 'text-orange-400',
    price: 'text-orange-300',
    link: 'text-orange-400',
  },
  temu: {
    ring: 'ring-fuchsia-500/10',
    badge: 'bg-fuchsia-600/90',
    label: 'text-fuchsia-400',
    price: 'text-fuchsia-300',
    link: 'text-fuchsia-400',
  },
};

const MP_ORDER: MarketplaceId[] = ['aliexpress', 'amazon_es', 'amazon_us', 'temu'];

const MP_SHORT: Record<MarketplaceId, string> = {
  aliexpress: 'AE',
  amazon_es: 'AMZ',
  amazon_us: 'US',
  temu: 'TM',
};

function ProductRow({ p, compact }: { p: TrendProductPick; compact?: boolean }) {
  const mp = p.marketplace ?? 'aliexpress';
  const styles = MP_STYLES[mp];

  return (
    <li
      className={`flex gap-2 rounded-lg border border-white/5 bg-black/20 p-2 ring-1 ${styles.ring}`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-black/40">
        <span className={`absolute left-0.5 top-0.5 z-10 rounded px-1 font-mono-data text-[9px] text-white ${styles.badge}`}>
          #{p.rank}
        </span>
        {p.image_url ? (
          <Image
            src={p.image_url}
            alt={p.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            {MP_SHORT[mp]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`line-clamp-2 text-[11px] leading-snug ${compact ? 'text-slate-300' : 'text-slate-200'}`}>
          {p.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
          {p.price_eur > 0 && (
            <span className={`font-semibold ${styles.price}`}>{p.price_eur.toFixed(2)} €</span>
          )}
          {p.orders_label && <span className="text-slate-500">{p.orders_label}</span>}
          {p.margin_eur != null && p.margin_eur > 0 && mp === 'aliexpress' && (
            <span className="text-tp-green">margen est. {p.margin_eur.toFixed(2)} €</span>
          )}
        </div>
        <Link
          href={p.purchase_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-1 inline-flex items-center gap-0.5 text-[10px] hover:underline ${styles.link}`}
        >
          Ver producto <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>
    </li>
  );
}

function MarketplaceSection({
  marketplace,
  products,
  compact,
}: {
  marketplace: MarketplaceId;
  products: TrendProductPick[];
  compact?: boolean;
}) {
  if (!products.length) return null;
  const styles = MP_STYLES[marketplace];
  const isRetailRef = marketplace === 'amazon_es' || marketplace === 'amazon_us' || marketplace === 'temu';

  return (
    <div className="space-y-2">
      <p className={`flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-widest ${styles.label}`}>
        <TrendingUp className="h-3 w-3" />
        {isRetailRef ? 'Referencia retail · ' : 'Top ventas · '}
        {MARKETPLACE_LABELS[marketplace]}
      </p>
      {isRetailRef && (
        <p className="text-[10px] text-slate-500">
          Precio ya inflado — no compres aquí para importar. Solo para ver qué paga el consumidor.
        </p>
      )}
      <ul className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-1'}`}>
        {products.map((p) => (
          <ProductRow key={`${marketplace}-${p.item_id}`} p={p} compact={compact} />
        ))}
      </ul>
    </div>
  );
}

export function TopProductsList({
  products,
  topByMarketplace,
  compact = false,
}: {
  products?: TrendProductPick[];
  topByMarketplace?: TopByMarketplace;
  compact?: boolean;
}) {
  const hasMulti = topByMarketplace && Object.keys(topByMarketplace).length > 0;

  if (hasMulti) {
    const sections = MP_ORDER.filter((mp) => (topByMarketplace![mp]?.length ?? 0) > 0);
    if (!sections.length) return null;

    return (
      <div className="space-y-4">
        {sections.map((mp) => (
          <MarketplaceSection
            key={mp}
            marketplace={mp}
            products={topByMarketplace![mp]!}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  if (!products?.length) return null;

  return (
    <MarketplaceSection
      marketplace={products[0].marketplace ?? 'aliexpress'}
      products={products}
      compact={compact}
    />
  );
}
