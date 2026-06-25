import Link from 'next/link';
import { ExternalLink, Factory } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';
import {
  estimateFactoryPriceEur,
  PRIMARY_SUPPLIER,
  supplierSearchUrl,
} from '@/lib/suppliers/catalog';

export function SourceBuyPanel({ item }: { item: MarketplaceCandidate }) {
  const isEcoEs = item.canonical_name.startsWith('[Eco ES]');
  if (isEcoEs) return null;

  const query = item.category_search ?? item.canonical_name.slice(0, 40);
  const retailAe = item.origin_price_eur ?? item.top_products?.[0]?.price_eur ?? 0;
  const factoryEur = estimateFactoryPriceEur(retailAe);
  const supplierUrl = supplierSearchUrl(query);

  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-mono-data uppercase tracking-widest text-emerald-400">
        <Factory className="h-3 w-3" />
        Dónde comprar (fuente, no retail)
      </p>

      <div className="grid gap-2 sm:grid-cols-3 text-xs">
        <div className="rounded-md bg-emerald-600/15 p-2 ring-1 ring-emerald-500/30">
          <p className="font-semibold text-emerald-300">1 · {PRIMARY_SUPPLIER.name}</p>
          <p className="mt-0.5 font-mono-data text-lg text-white">
            {factoryEur > 0 ? `~${factoryEur.toFixed(2)} €` : 'consultar'}
          </p>
          <p className="text-[10px] text-slate-500">Est. fábrica/MOQ · antes que Amazon</p>
          <Link
            href={supplierUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-0.5 text-[11px] text-emerald-300 hover:underline"
          >
            Buscar en proveedor <ExternalLink className="h-2.5 w-2.5" />
          </Link>
        </div>

        <div className="rounded-md bg-sky-500/10 p-2 ring-1 ring-sky-500/20">
          <p className="font-semibold text-sky-300">2 · AliExpress (muestra)</p>
          <p className="mt-0.5 font-mono-data text-lg text-white">
            {retailAe > 0 ? `${retailAe.toFixed(2)} €` : '—'}
          </p>
          <p className="text-[10px] text-slate-500">1 unidad sin MOQ · más caro que fábrica</p>
          {item.purchase_url && (
            <Link
              href={item.purchase_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-0.5 text-[11px] text-sky-300 hover:underline"
            >
              Producto directo <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>

        <div className="rounded-md bg-amber-500/10 p-2 ring-1 ring-amber-500/20 opacity-90">
          <p className="font-semibold text-amber-300">3 · Amazon / Temu</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
            Solo referencia — precio ya inflado. Si está aquí, suele ser tarde para importar.
          </p>
        </div>
      </div>

      {retailAe > 0 && factoryEur > 0 && (
        <p className="text-[10px] text-slate-500">
          Margen potencial fábrica→ES: retail AE {retailAe.toFixed(2)} € vs fuente ~{factoryEur.toFixed(2)} €
          ({Math.round((1 - factoryEur / retailAe) * 100)}% menos en origen)
        </p>
      )}
    </div>
  );
}
