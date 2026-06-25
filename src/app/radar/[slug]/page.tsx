import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { CorridorBars } from '@/components/CorridorBars';
import { MentionList } from '@/components/MentionList';
import { Sparkline } from '@/components/Sparkline';
import { TopProductsList } from '@/components/TopProductsList';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { TimelineCaseCard } from '@/components/WaveTimeline';
import { buildCorridorInsight } from '@/lib/corridor-insight';
import { fetchRadarSignalBySlug } from '@/lib/radar';
import { hydrateRadarSales } from '@/lib/ingest/radar-enricher';
import { fetchCorridorDelays, fetchHistoricalDna } from '@/lib/supabase';
import { DEMO_CORRIDORS, corridorsBySlug } from '@/lib/demo-corridors';
import { WAVE_PROFILE_LABELS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function RadarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { signal: rawSignal, daily } = await fetchRadarSignalBySlug(slug);
  if (!rawSignal) notFound();
  const [signal] = await hydrateRadarSales([rawSignal]);

  const { rows: dnaRows } = await fetchHistoricalDna();
  const dna = dnaRows.find((r) => r.slug === signal.dna_match_slug);
  const { rows: corridorsFromDb } = await fetchCorridorDelays();
  const corridorMap = corridorsBySlug(
    corridorsFromDb.length > 0 ? corridorsFromDb : DEMO_CORRIDORS
  );

  const breakdown = signal.source_breakdown ?? {
    es: 0,
    us: 0,
    cn: 0,
    latam: 0,
    pod: 0,
    reddit: 0,
    weighted: 0,
  };
  const hasSales =
    (signal.top_products?.length ?? 0) > 0 ||
    Object.values(signal.top_by_marketplace ?? {}).some((arr) => (arr?.length ?? 0) > 0);
  const newsScore = breakdown.weighted;
  const salesScore = signal.sales_weighted_score ?? newsScore;

  return (
    <TrendPulseShell title={signal.canonical_name} subtitle={`Ficha radar · ${slug}`}>
      <p className="mb-4">
        <Link href="/radar" className="text-sm text-tp-cyan hover:underline">
          ← Volver al radar
        </Link>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-tp-panel p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-tp-cyan">
            Señal en vivo
          </h2>
          <p className="font-mono-data text-xs text-slate-500">{signal.signal_source}</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {buildCorridorInsight(breakdown, signal.origin_region, signal.dna_match_slug)}
          </p>
          <CorridorBars breakdown={breakdown} />
          <div className="my-3 flex flex-wrap gap-2 text-[10px] font-mono-data">
            <span className="rounded bg-violet-500/15 px-2 py-1 text-violet-300">
              Menciones {newsScore}w
            </span>
            {salesScore !== newsScore && (
              <span className="rounded bg-emerald-500/15 px-2 py-1 text-emerald-300">
                Score combinado {salesScore}w (noticias + ventas)
              </span>
            )}
            {(signal.origin_orders_total ?? 0) > 0 && (
              <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1 text-emerald-300">
                <ShoppingBag className="h-3 w-3" />
                {signal.origin_orders_total!.toLocaleString('es-ES')}+ pedidos origen
              </span>
            )}
          </div>
          <Sparkline points={daily.map((d) => d.weighted)} label="Score ponderado (histórico)" />
          <MentionList snippets={signal.mention_snippets} />
        </section>

        {hasSales && (
          <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Top ventas · {signal.marketplace_search}
            </h2>
            <p className="mb-4 text-xs text-slate-400">
              Productos más vendidos ahora en origen (AliExpress, Amazon, Temu). Compara con las
              menciones de prensa: si venden mucho y España está quieto, hay ventana de importación.
            </p>
            {signal.lead_image_url && (
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-lg ring-1 ring-white/10">
                <Image
                  src={signal.lead_image_url}
                  alt={signal.canonical_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <TopProductsList
              products={signal.top_products ?? undefined}
              topByMarketplace={signal.top_by_marketplace ?? undefined}
            />
          </section>
        )}

        {dna && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              ADN histórico · {WAVE_PROFILE_LABELS[dna.wave_profile]}
            </h2>
            <p className="mb-3 text-xs text-slate-500">
              Trayectoria pasada del patio (fechas estimadas). No son ventas reales de tienda — son
              el patrón temporal que queremos replicar estadísticamente.
            </p>
            <TimelineCaseCard row={dna} corridor={corridorMap.get(dna.slug)} />
          </section>
        )}
      </div>
    </TrendPulseShell>
  );
}
