import Link from 'next/link';
import { ArrowRight, Sun } from 'lucide-react';
import { TendenciaCard } from '@/components/TendenciaCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadMarketplaceData } from '@/lib/cycle-data';
import { formatTrendDate } from '@/lib/trendpulse-data';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function TendenciasPage() {
  const market = await loadMarketplaceData();
  const patio = market.candidates.filter((c) => c.world === 'playground');
  const summer = patio.filter((c) => c.summer_fit);
  const watch = patio.filter((c) => !c.summer_fit && c.signal_es <= 1);

  return (
    <TrendPulseShell
      title="Tendencias patio"
      subtitle={`Verano 2026 · ${market.days_until_september} días hasta septiembre`}
    >
      <div className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-4">
        <div className="flex items-start gap-3">
          <Sun className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white">Descubrimiento — productos nuevos</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              <strong className="text-white">No son</strong> los casos del ADN histórico (Labubu,
              Pop It, Pokémon SV…). Son candidatos nuevos detectados por señales News+Reddit. El
              «patrón ola» solo indica un reloj parecido (ej. reloj corto tipo Pop It), no que el
              producto ya haya pasado por España.
            </p>
            {market.scraped_at && (
              <p className="mt-2 font-mono-data text-[10px] text-slate-500">
                Último scan: {formatTrendDate(market.scraped_at.slice(0, 10))}
                {market.isLive ? ' · en vivo' : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {summer.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-amber-300">
            Comprar este verano ({summer.length})
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Oportunidad de llegar antes de septiembre según ADN y señales actuales.
          </p>
          <div className="grid gap-4">
            {summer.map((c, i) => (
              <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-tp-cyan">
          Todas las tendencias patio ({patio.length})
        </h2>
        <div className="grid gap-4">
          {patio.map((c, i) => (
            <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
          ))}
        </div>
      </section>

      {watch.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-violet-300">
            Solo observar ({watch.length})
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Señal interesante pero sin ventana verano clara — aprender sin comprar.
          </p>
          <div className="grid gap-4">
            {watch.slice(0, 5).map((c, i) => (
              <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-4 border-t border-white/5 pt-6">
        <Link
          href="/ciclo"
          className="flex items-center gap-1 text-sm text-tp-cyan hover:underline"
        >
          Ciclo 3 actuar + 3 observar <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/radar" className="text-sm text-slate-400 hover:text-white">
          Radar pilotos
        </Link>
      </div>
    </TrendPulseShell>
  );
}
