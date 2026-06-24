import Link from 'next/link';
import { ArrowRight, Eye, Sun, Zap } from 'lucide-react';
import { CycleSlotCard } from '@/components/CycleSlotCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadCycleData, loadMarketplaceData } from '@/lib/cycle-data';
import { loadTrendPulseData, formatTrendDate } from '@/lib/trendpulse-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export default async function CicloPage() {
  const [data, market] = await Promise.all([
    loadTrendPulseData({ refreshScrape: false }),
    loadMarketplaceData(),
  ]);
  const cycleData = await loadCycleData(data.radarSignals, market.candidates);

  const act = cycleData.slots.filter((s) => s.mode === 'act');
  const observe = cycleData.slots.filter((s) => s.mode === 'observe');
  const summerCount = market.candidates.filter((c) => c.summer_fit).length;

  return (
    <TrendPulseShell
      title="Ciclo patio"
      subtitle={`3 actuar + 3 observar · ${market.days_until_september}d hasta septiembre`}
      report={data.report}
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Link
          href="/tendencias"
          className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200 hover:bg-amber-400/20"
        >
          <Sun className="h-4 w-4" />
          Ver todas las tendencias verano ({summerCount} con ventana sept)
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-tp-cyan/20 bg-tp-cyan/5 px-4 py-3 text-sm text-slate-300">
        <p className="font-medium text-white">Fase 2d + 2c — Ciclo patio (Jaris)</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          <strong className="text-tp-green">Actuar:</strong> compra ≤8 €, hijos al cole, feedback.{' '}
          <strong className="text-violet-300">Observar:</strong> sin comprar. Productos con señales
          News+Reddit reales (Fase 2c).
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{cycleData.cycle.title}</h2>
          <p className="text-xs text-slate-500">
            {formatTrendDate(cycleData.cycle.starts_at)}
            {cycleData.cycle.ends_at && ` → ${formatTrendDate(cycleData.cycle.ends_at)}`}
            {market.isLive ? ' · señales en vivo' : ' · demo'}
          </p>
        </div>
        <Link href="/tendencias" className="flex items-center gap-1 text-xs text-tp-cyan hover:underline">
          Tendencias patio <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-tp-green" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-tp-green">
            Actuar ({act.length})
          </h3>
        </div>
        <div className="grid gap-4">
          {act.map((slot) => (
            <CycleSlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-300">
            Observar ({observe.length})
          </h3>
        </div>
        <div className="grid gap-4">
          {observe.map((slot) => (
            <CycleSlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </section>
    </TrendPulseShell>
  );
}
