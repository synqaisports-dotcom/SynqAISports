import Link from 'next/link';
import { ArrowRight, Sun, Sparkles } from 'lucide-react';
import { TendenciaCard } from '@/components/TendenciaCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadPredictionData } from '@/lib/cycle-data';
import { formatTrendDate } from '@/lib/trendpulse-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export default async function TendenciasPage() {
  const market = await loadPredictionData();
  const predictions = market.candidates.filter((c) => !c.canonical_name.startsWith('[Eco ES]'));
  const summer = predictions.filter((c) => c.summer_fit);
  const ecoEs = market.candidates.filter((c) => c.canonical_name.startsWith('[Eco ES]'));

  return (
    <TrendPulseShell
      title="Predicciones patio"
      subtitle={`Verano 2026 · ${market.days_until_september} días hasta septiembre`}
    >
      <div className="mb-6 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white">Fase 3 — Productos reales AliExpress (más vendidos)</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Cada tarjeta muestra un <strong className="text-emerald-300">producto concreto</strong> de
              AliExpress (top ventas por categoría), con precio y enlace directo. La{' '}
              <strong className="text-violet-300">señal</strong> (titular de noticia) indica por qué
              vigilar la categoría — no es el nombre del producto. El precio ES es{' '}
              <strong className="text-amber-200">estimación</strong> según ADN histórico.
            </p>
            {market.scraped_at && (
              <p className="mt-2 font-mono-data text-[10px] text-slate-500">
                Scan: {formatTrendDate(market.scraped_at.slice(0, 10))}
              </p>
            )}
          </div>
        </div>
      </div>

      {summer.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-amber-300">
            <Sun className="h-4 w-4" />
            Predicción verano — comprar y probar ({summer.length})
          </h2>
          <div className="grid gap-4">
            {summer.map((c, i) => (
              <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-tp-cyan">
          Todas las predicciones ({predictions.length})
        </h2>
        {predictions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Sin predicciones en este scan — vuelve en unas horas o ejecuta el cron marketplace.
          </p>
        ) : (
          <div className="grid gap-4">
            {predictions.map((c, i) => (
              <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
            ))}
          </div>
        )}
      </section>

      {ecoEs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
            Ya hay eco en España — solo observar ({ecoEs.length})
          </h2>
          <div className="grid gap-4">
            {ecoEs.map((c, i) => (
              <TendenciaCard key={c.slug} candidate={c} rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-4 border-t border-white/5 pt-6">
        <Link href="/ciclo" className="flex items-center gap-1 text-sm text-tp-cyan hover:underline">
          Ciclo 3 actuar + 3 observar <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </TrendPulseShell>
  );
}
