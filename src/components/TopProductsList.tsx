import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, TrendingUp } from 'lucide-react';
import type { TrendProductPick } from '@/lib/cycle-types';

export function TopProductsList({
  products,
  compact = false,
}: {
  products: TrendProductPick[];
  compact?: boolean;
}) {
  if (!products.length) return null;

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-widest text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        Top {products.length} más vendidos · AliExpress
      </p>
      <ul className={`grid gap-2 ${compact ? '' : 'sm:grid-cols-1'}`}>
        {products.map((p) => (
          <li
            key={p.item_id}
            className="flex gap-2 rounded-lg border border-white/5 bg-black/20 p-2 ring-1 ring-emerald-500/10"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-black/40">
              <span className="absolute left-0.5 top-0.5 z-10 rounded bg-emerald-600/90 px-1 font-mono-data text-[9px] text-white">
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
                  AE
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[11px] leading-snug text-slate-200">{p.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 font-mono-data text-[10px]">
                <span className="font-semibold text-emerald-300">{p.price_eur.toFixed(2)} €</span>
                {p.orders_label && (
                  <span className="text-slate-500">{p.orders_label}</span>
                )}
                {p.margin_eur != null && p.margin_eur > 0 && (
                  <span className="text-tp-green">margen est. {p.margin_eur.toFixed(2)} €</span>
                )}
              </div>
              <Link
                href={p.purchase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-400 hover:underline"
              >
                Ver producto <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
