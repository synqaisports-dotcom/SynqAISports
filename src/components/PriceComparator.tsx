import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import type { MarketplaceCandidate } from '@/lib/cycle-types';

type WithPrice = MarketplaceCandidate & {
  origin_price_us_eur?: number;
  estimated_es_retail_low_eur?: number;
  estimated_es_retail_high_eur?: number;
  estimated_es_retail_mid_eur?: number;
  margin_eur?: number;
  margin_pct?: number;
  adn_pattern_label?: string;
  adn_example_case?: string;
  adn_channel?: string;
  adn_delay_days?: number;
  purchase_links?: { aliexpress: string; amazon_us: string };
  window_note?: string;
  window_days_left?: number;
};

export function PriceComparator({ item }: { item: MarketplaceCandidate }) {
  const c = item as WithPrice;
  const isEcoEs = c.canonical_name.startsWith('[Eco ES]');

  if (isEcoEs) {
    return (
      <div className="rounded-lg border border-slate-600/40 bg-slate-800/30 p-3 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Mercado ES ya activo</p>
        <p className="mt-1">
          Sin enlace de compra en España — solo confirmación. El margen de importación suele estar
          cerrado. Usa la fuente para aprender, no para primer lote.
        </p>
      </div>
    );
  }

  const links = c.purchase_links ?? {
    aliexpress: c.purchase_url,
    amazon_us: `https://www.amazon.com/s?k=trending+toy`,
  };

  return (
    <div className="space-y-3 rounded-lg border border-tp-cyan/20 bg-black/25 p-3">
      <p className="text-[10px] font-mono-data uppercase tracking-widest text-tp-cyan">
        Comparador · comprar en origen
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-emerald-500/10 p-2 ring-1 ring-emerald-500/20">
          <p className="text-[10px] uppercase text-emerald-400/80">Origen (tu compra)</p>
          <p className="font-mono-data text-lg font-semibold text-emerald-300">
            {c.origin_price_eur?.toFixed(2) ?? '—'} €
          </p>
          <p className="text-[10px] text-slate-500">
            US ref. ~{c.origin_price_us_eur?.toFixed(2) ?? '—'} €
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <Link
              href={links.aliexpress}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline"
            >
              AliExpress (CN) <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href={links.amazon_us}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:underline"
            >
              Amazon US <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-md bg-amber-500/10 p-2 ring-1 ring-amber-500/20">
          <p className="text-[10px] uppercase text-amber-400/80">ES estimado (cuando llegue)</p>
          <p className="font-mono-data text-lg font-semibold text-amber-200">
            {c.estimated_es_retail_low_eur != null && c.estimated_es_retail_high_eur != null
              ? `${c.estimated_es_retail_low_eur}–${c.estimated_es_retail_high_eur} €`
              : '—'}
          </p>
          <p className="text-[10px] text-slate-500">{c.adn_channel ?? 'vending / patio'}</p>
          <p className="mt-1 text-[10px] text-slate-400">
            No es precio actual en España — es estimación según patrón histórico
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-white/5 pt-2 font-mono-data text-[11px]">
        {c.margin_eur != null && (
          <span className="text-tp-green">
            Margen est. ~{c.margin_eur.toFixed(2)} € ({c.margin_pct ?? 0}%)
          </span>
        )}
        {c.estimated_arrival_es && (
          <span className="text-slate-400">Llegada ES ~{c.estimated_arrival_es}</span>
        )}
        {c.window_days_left != null && (
          <span className="text-tp-cyan">Ventana ~{c.window_days_left}d</span>
        )}
      </div>

      {c.adn_pattern_label && (
        <p className="text-[10px] leading-relaxed text-slate-500">
          <span className="text-violet-300">Patrón:</span> {c.adn_pattern_label}
          {c.adn_example_case && (
            <>
              {' '}
              — ref. histórica: <em className="text-slate-400">{c.adn_example_case}</em>
            </>
          )}
        </p>
      )}
      {c.window_note && <p className="text-[10px] text-slate-400">{c.window_note}</p>}
    </div>
  );
}
