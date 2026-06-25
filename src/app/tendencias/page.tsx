import { AppSuccessPanel } from '@/components/AppSuccessPanel';
import { TendenciaSection } from '@/components/TendenciaSection';
import { HowToReadPanel } from '@/components/HowToReadPanel';
import { TrendPulseShell } from '@/components/TrendPulseShell';
import { fetchAppSuccessStats } from '@/lib/app-success-stats';
import { groupCandidatesByVerdict } from '@/lib/group-candidates';
import { loadPredictionData } from '@/lib/cycle-data';
import { fetchHistoricalDna } from '@/lib/supabase';
import { formatTrendDate } from '@/lib/trendpulse-data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export default async function TendenciasPage() {
  const market = await loadPredictionData();
  const { rows: dnaRows } = await fetchHistoricalDna();
  const successStats = await fetchAppSuccessStats(dnaRows, market.candidates.length);
  const all = market.candidates.filter((c) => !c.canonical_name.startsWith('[Eco ES]'));
  const { comprar, vigilar, tarde, sin_datos } = groupCandidatesByVerdict(all);

  return (
    <TrendPulseShell
      title="Tendencias"
      subtitle={`Qué comprar antes que llegue al patio · ${market.days_until_september} días hasta septiembre`}
    >
      <HowToReadPanel />

      <AppSuccessPanel stats={successStats} />

      {market.scraped_at && (
        <p className="mb-4 font-mono-data text-[10px] text-slate-500">
          Último scan: {formatTrendDate(market.scraped_at.slice(0, 10))}
          {market.fromDb ? ' · desde base de datos' : ' · en vivo'}
        </p>
      )}

      {all.length === 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-6 text-center">
          <p className="text-sm text-amber-200">No hay tendencias en este momento</p>
          <p className="mt-2 text-xs text-slate-400">
            El sistema busca noticias + productos más vendidos cada hora. Vuelve pronto o ejecuta{' '}
            <code className="text-tp-cyan">/api/cron/marketplace</code>
          </p>
        </div>
      ) : (
        <>
          <TendenciaSection
            emoji="🟢"
            title="Oportunidades — comprar muestra"
            subtitle="Origen vendiendo o con noticias, España aún quieto. Buen momento para probar en el cole."
            candidates={comprar}
            accent="text-emerald-400"
          />

          <TendenciaSection
            emoji="🟡"
            title="Vigilar — probar con cuidado"
            subtitle="Algo de movimiento en España o ventas moderadas. Compra pequeña o espera confirmación."
            candidates={vigilar}
            accent="text-amber-400"
          />

          <TendenciaSection
            emoji="🔴"
            title="Tarde para importar"
            subtitle="España ya habla de esto. Solo observa, no compres para revender."
            candidates={tarde}
            accent="text-red-400"
          />

          {sin_datos.length > 0 && (
            <TendenciaSection
              emoji="⚪"
              title="Sin datos"
              subtitle="Faltan productos o señales. Se actualizará en el próximo scan."
              candidates={sin_datos}
              accent="text-slate-400"
            />
          )}
        </>
      )}

      <div className="flex flex-wrap gap-4 border-t border-white/5 pt-6">
        <Link href="/ciclo" className="flex items-center gap-1 text-sm text-tp-cyan hover:underline">
          Ir al ciclo patio (3 actuar + 3 observar) <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/radar" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
          Ver radar de productos conocidos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </TrendPulseShell>
  );
}
