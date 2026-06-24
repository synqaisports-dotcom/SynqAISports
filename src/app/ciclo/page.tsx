import Link from 'next/link';
import { ArrowRight, Eye, Zap } from 'lucide-react';
import { CycleSlotCard } from '@/components/CycleSlotCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadCycleData } from '@/lib/cycle-data';
import { loadTrendPulseData } from '@/lib/trendpulse-data';
import { formatTrendDate } from '@/lib/trendpulse-data';

export const dynamic = 'force-dynamic';

export default async function CicloPage() {
  const data = await loadTrendPulseData({ refreshScrape: false });
  const cycleData = loadCycleData(data.radarSignals);

  const act = cycleData.slots.filter((s) => s.mode === 'act');
  const observe = cycleData.slots.filter((s) => s.mode === 'observe');

  return (
    <TrendPulseShell
      title="Ciclo patio"
      subtitle="3 actuar + 3 observar · aprendizaje real"
      report={data.report}
    >
      <div className="mb-6 rounded-xl border border-tp-cyan/20 bg-tp-cyan/5 px-4 py-3 text-sm text-slate-300">
        <p className="font-medium text-white">Fase 2d — Ciclo patio (Jaris)</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          <strong className="text-tp-green">Actuar:</strong> compra barata (≤8 €), hijos al cole,
          feedback si se viraliza.{' '}
          <strong className="text-violet-300">Observar:</strong> sin comprar — comprobar si la
          predicción acierta. Los productos mezclan radar + referencias marketplace reales (demo
          hasta scrape AliExpress/Amazon).
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{cycleData.cycle.title}</h2>
          <p className="text-xs text-slate-500">
            {formatTrendDate(cycleData.cycle.starts_at)}
            {cycleData.cycle.ends_at && ` → ${formatTrendDate(cycleData.cycle.ends_at)}`}
            {cycleData.isDemo && ' · modo demo'}
          </p>
        </div>
        <Link href="/radar" className="flex items-center gap-1 text-xs text-tp-cyan hover:underline">
          Ver radar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-tp-green" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-tp-green">
            Actuar ({act.length})
          </h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-1">
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
        <div className="grid gap-4 lg:grid-cols-1">
          {observe.map((slot) => (
            <CycleSlotCard key={slot.id} slot={slot} />
          ))}
        </div>
      </section>
    </TrendPulseShell>
  );
}
