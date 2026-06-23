import Link from 'next/link';
import { Activity, Globe2, Timer } from 'lucide-react';
import { fetchHistoricalDna } from '@/lib/supabase';
import { buildCursorReport } from '@/lib/cursor-report';
import { WAVE_PROFILE_LABELS, type HistoricalDnaRow } from '@/lib/types';
import { CopyReportButton } from '@/components/CopyReportButton';

import { DEMO_SEED } from '@/lib/demo-seed';

export const dynamic = 'force-dynamic';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function TrendPulseHomePage() {
  const { rows: fromDb, configured, error } = await fetchHistoricalDna();
  const supabaseConnected = configured && fromDb.length > 0 && !error;
  const rows = supabaseConnected ? fromDb : DEMO_SEED;
  const report = buildCursorReport(rows, supabaseConnected, configured, error);

  const avgDelay =
    rows.filter((r) => r.delay_days_to_target != null).length > 0
      ? Math.round(
          rows
            .filter((r) => r.delay_days_to_target != null)
            .reduce((s, r) => s + (r.delay_days_to_target ?? 0), 0) /
            rows.filter((r) => r.delay_days_to_target != null).length
        )
      : null;

  return (
    <div className="min-h-screen bg-tp-night">
      <header className="border-b border-white/5 bg-tp-panel/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-mono-data uppercase tracking-widest text-tp-cyan">
              Nexus Labs
            </p>
            <h1 className="text-xl font-bold text-white">TrendPulse</h1>
            <p className="text-xs text-slate-400">Fase 1 · ADN histórico de tendencias</p>
          </div>
          <CopyReportButton report={report} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!supabaseConnected && (
          <div className="mb-6 rounded-xl border border-tp-amber/30 bg-tp-amber/5 px-4 py-3 text-sm text-tp-amber">
            {!configured && (
              <>
                Modo demo ({DEMO_SEED.length} casos). Faltan variables en Vercel:{' '}
                <code className="font-mono-data text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
                <code className="font-mono-data text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                . Luego <strong>Redeploy</strong>. Ver <code className="font-mono-data text-xs">SUPABASE_RAPIDO.md</code>
              </>
            )}
            {configured && error && (
              <>
                Supabase configurado pero error de lectura: <code className="font-mono-data text-xs">{error}</code>
                . ¿Ejecutaste los 2 SQL en el SQL Editor?
              </>
            )}
            {configured && !error && fromDb.length === 0 && (
              <>
                Supabase conectado pero la tabla está vacía. Ejecuta los 2 SQL en Supabase → SQL Editor
                (ver <code className="font-mono-data text-xs">SUPABASE_RAPIDO.md</code>).
              </>
            )}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Activity, label: 'Casos ADN', value: String(rows.length) },
            { icon: Timer, label: 'Delay medio → ES', value: avgDelay != null ? `${avgDelay}d` : '—' },
            { icon: Globe2, label: 'Línea activa', value: 'Coleccionables / vending' },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/5 bg-tp-panel p-5"
            >
              <Icon className="mb-2 h-5 w-5 text-tp-cyan" />
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-mono-data mt-1 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5 bg-tp-panel">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Pico origen</th>
                <th className="px-4 py-3">Pico ES</th>
                <th className="px-4 py-3 text-tp-cyan">Delay</th>
                <th className="px-4 py-3">Meseta</th>
                <th className="px-4 py-3">Caída</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-white">{r.canonical_name}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {WAVE_PROFILE_LABELS[r.wave_profile]}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-xs uppercase text-slate-400">
                    {r.origin_region}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-xs">{formatDate(r.origin_peak_date)}</td>
                  <td className="px-4 py-3 font-mono-data text-xs">{formatDate(r.target_peak_date)}</td>
                  <td className="px-4 py-3 font-mono-data font-semibold text-tp-cyan">
                    {r.delay_days_to_target != null ? `${r.delay_days_to_target}d` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-xs text-slate-400">
                    {r.plateau_days != null ? `${r.plateau_days}d` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono-data text-xs text-tp-green">
                    {r.decline_start_date ? formatDate(r.decline_start_date) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="https://nexuslabs.vercel.app" className="text-tp-cyan hover:underline">
            Nexus Labs
          </Link>
          {' · '}Objetivo: 25 casos · Fase 2: radar cada 48h
        </p>
      </main>
    </div>
  );
}
