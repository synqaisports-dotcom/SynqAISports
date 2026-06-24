import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CorridorBars } from '@/components/CorridorBars';
import { MentionList } from '@/components/MentionList';
import { Sparkline } from '@/components/Sparkline';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { TimelineCaseCard } from '@/components/WaveTimeline';
import { buildCorridorInsight } from '@/lib/corridor-insight';
import { fetchRadarSignalBySlug } from '@/lib/radar';
import { fetchCorridorDelays, fetchHistoricalDna } from '@/lib/supabase';
import { DEMO_CORRIDORS, corridorsBySlug } from '@/lib/demo-corridors';
import { WAVE_PROFILE_LABELS } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function RadarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { signal, daily } = await fetchRadarSignalBySlug(slug);
  if (!signal) notFound();

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
          <Sparkline points={daily.map((d) => d.weighted)} label="Score ponderado (histórico)" />
          <MentionList snippets={signal.mention_snippets} />
        </section>

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
