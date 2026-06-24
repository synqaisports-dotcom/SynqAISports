import Link from 'next/link';
import { CopyReportButton } from '@/components/CopyReportButton';
import { AppNav } from '@/components/AppNav';

export function TrendPulseShell({
  title,
  subtitle,
  report,
  children,
}: {
  title: string;
  subtitle: string;
  report?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-tp-night">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-tp-panel/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-mono-data uppercase tracking-widest text-tp-cyan">
              Nexus Labs
            </p>
            <h1 className="text-xl font-bold text-white">TrendPulse</h1>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <AppNav />
            {report && <CopyReportButton report={report} />}
          </div>
        </div>
        {title !== 'Dashboard' && (
          <div className="border-t border-white/5 px-4 py-2 sm:px-6">
            <p className="mx-auto max-w-7xl text-sm font-medium text-white">{title}</p>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        <Link href="https://nexuslabs.vercel.app" className="text-tp-cyan hover:underline">
          Nexus Labs
        </Link>
        {' · '}5 pilotos activos · Radar cada 48h
      </footer>
    </div>
  );
}

export function SetupBanner({
  supabaseConnected,
  configured,
  error,
  fromDbEmpty,
  demoCount,
}: {
  supabaseConnected: boolean;
  configured: boolean;
  error: string | null;
  fromDbEmpty?: boolean;
  demoCount: number;
}) {
  if (supabaseConnected) return null;

  return (
    <div className="mb-6 rounded-xl border border-tp-amber/30 bg-tp-amber/5 px-4 py-3 text-sm text-tp-amber">
      {!configured && (
        <>
          Modo demo ({demoCount} casos). Faltan variables en Vercel:{' '}
          <code className="font-mono-data text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{' '}
          <code className="font-mono-data text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. Ver{' '}
          <code className="font-mono-data text-xs">SUPABASE_RAPIDO.md</code>
        </>
      )}
      {configured && error && (
        <>
          Error de lectura Supabase: <code className="font-mono-data text-xs">{error}</code>
        </>
      )}
      {configured && !error && fromDbEmpty && (
        <>Supabase conectado pero tablas vacías. Ejecuta los SQL en Supabase → SQL Editor.</>
      )}
    </div>
  );
}
