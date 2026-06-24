import Link from 'next/link';
import { ArrowRight, Eye, Sun, Zap } from 'lucide-react';
import { CycleSlotCard } from '@/components/CycleSlotCard';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { loadCycleData, loadPredictionData } from '@/lib/cycle-data';
import { formatTrendDate } from '@/lib/trendpulse-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export default async function CicloPage() {
  const market = await loadPredictionData();
  const cycleData = await loadCycleData([], market.candidates);

  const act = cycleData.slots.filter((s) => s.mode === 'act');
  const observe = cycleData.slots.filter((s) => s.mode === 'observe');

  return (
    <TrendPulseShell
      title="Ciclo patio"
      subtitle={`Predicciones · ${market.days_until_september}d hasta septiembre`}
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <Link
          href="/tendencias"
          className="inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200 hover:bg-violet-500/20"
        >
          <Sun className="h-4 w-4" />
          Ver predicciones
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-tp-cyan/20 bg-tp-cyan/5 px-4 py-3 text-sm text-slate-300">
        <p className="font-medium text-white">Ciclo desde predicciones en vivo</p>
        <p className="mt-1 text-xs text-slate-400">
          El feedback es <strong className="text-tp-cyan">editable</strong> — pulsa «Editar resultado»
          para cambiarlo. Se guarda en tu navegador y en Supabase si está configurado.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{cycleData.cycle.title}</h2>
          <p className="text-xs text-slate-500">
            {formatTrendDate(cycleData.cycle.starts_at)}
            {cycleData.cycle.ends_at && ` → ${formatTrendDate(cycleData.cycle.ends_at)}`}
            {market.isLive ? ' · predicciones en vivo' : ''}
          </p>
        </div>
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
