import Link from 'next/link';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import type { AppSuccessStats } from '@/lib/app-success-stats';

export function AppSuccessPanel({ stats }: { stats: AppSuccessStats }) {
  return (
    <section className="mb-8 rounded-xl border border-white/10 bg-tp-panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Target className="h-5 w-5 text-tp-cyan" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
          ¿Funciona TrendPulse?
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
          <p className="text-[10px] font-mono-data uppercase tracking-widest text-violet-300">
            Patrones ADN (histórico)
          </p>
          <p className="mt-1 font-mono-data text-3xl font-bold text-white">
            {stats.adn_historical_hit_pct != null ? `${stats.adn_historical_hit_pct}%` : '—'}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Acierto en casos pasados reales (Labubu, Pop It, Pokémon…). Es el{' '}
            <strong className="text-slate-300">reloj</strong>, no una predicción de hoy.
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            {stats.adn_pilot_count} pilotos con datos
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            stats.has_live_data
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-amber-500/20 bg-amber-500/5'
          }`}
        >
          <p className="text-[10px] font-mono-data uppercase tracking-widest text-emerald-300">
            Tus pruebas en el cole (vivo)
          </p>
          <p className="mt-1 font-mono-data text-3xl font-bold text-white">
            {stats.live_hit_pct != null ? `${stats.live_hit_pct}%` : 'Sin datos'}
          </p>
          {stats.has_live_data ? (
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {stats.feedback_viral} viral en cole · {stats.feedback_arrived_es} llegó a ES ·{' '}
              {stats.feedback_no_show} no apareció · {stats.feedback_false_positive} falso positivo
            </p>
          ) : (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-amber-200/90">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Aún no hay feedback guardado. Compra una muestra en{' '}
              <Link href="/ciclo" className="text-tp-cyan hover:underline">
                Ciclo patio
              </Link>{' '}
              y marca el resultado — sin eso la app no puede medir su acierto.
            </p>
          )}
          <p className="mt-1 text-[10px] text-slate-500">
            {stats.predictions_tracked} tendencias activas
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-400">
        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-tp-cyan" />
        <p>
          <strong className="text-slate-300">Honestidad:</strong> el valor real está en llegar{' '}
          <strong className="text-emerald-300">antes que Amazon</strong> comprando en fuente
          (Best Sink Store, fábrica Shantou). Amazon/Temu en las fichas = solo para ver cuánto
          sube el precio cuando ya llegó al retail.
        </p>
      </div>
    </section>
  );
}
