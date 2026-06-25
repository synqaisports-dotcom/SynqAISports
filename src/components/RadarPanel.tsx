import { Radar } from 'lucide-react';
import type { LiveSignalRow } from '@/lib/radar-types';
import { RadarCardCompact } from '@/components/RadarCardCompact';

export function RadarPanel({
  signals,
  isDemo,
  hasScrape,
  secretConfigured,
}: {
  signals: LiveSignalRow[];
  isDemo?: boolean;
  hasScrape?: boolean;
  secretConfigured?: boolean;
  dailyHistory?: Map<string, number[]>;
}) {
  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-tp-cyan" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-tp-cyan">
              Radar · productos en seguimiento
            </h2>
            <p className="text-xs text-slate-500">
              Pulsa una tarjeta para ver señales, ventas y ADN completos
              {hasScrape && <span className="ml-2 text-tp-green">· scraping activo</span>}
            </p>
          </div>
        </div>
        {isDemo && (
          <span className="rounded border border-tp-amber/30 bg-tp-amber/5 px-2 py-1 text-[10px] font-mono-data uppercase text-tp-amber">
            Sin datos radar
          </span>
        )}
        {!isDemo && !hasScrape && !secretConfigured && (
          <span className="rounded border border-tp-amber/30 bg-tp-amber/5 px-2 py-1 text-[10px] font-mono-data uppercase text-tp-amber">
            Añade SUPABASE_SECRET_KEY para guardar scrape
          </span>
        )}
        {!isDemo && !hasScrape && secretConfigured && (
          <span className="rounded border border-tp-amber/30 bg-tp-amber/5 px-2 py-1 text-[10px] font-mono-data uppercase text-tp-amber">
            Scrape en curso o pendiente de columnas SQL
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {signals.map((s) => (
          <RadarCardCompact key={s.id} signal={s} />
        ))}
      </div>
    </section>
  );
}
