import type { SourceBreakdown } from '@/lib/ingest/scraper-types';

const CORRIDORS: { key: keyof Omit<SourceBreakdown, 'weighted'>; label: string; color: string }[] = [
  { key: 'cn', label: 'CN', color: 'bg-rose-400' },
  { key: 'us', label: 'US', color: 'bg-sky-400' },
  { key: 'latam', label: 'LAT', color: 'bg-orange-400' },
  { key: 'pod', label: 'POD', color: 'bg-violet-400' },
  { key: 'es', label: 'ES', color: 'bg-emerald-400' },
  { key: 'reddit', label: 'RD', color: 'bg-amber-400' },
];

export function CorridorBars({ breakdown }: { breakdown: SourceBreakdown | null | undefined }) {
  if (!breakdown) return null;
  const max = Math.max(...CORRIDORS.map((c) => breakdown[c.key]), 1);

  return (
    <div className="mb-3 space-y-1.5">
      <p className="text-[10px] font-mono-data uppercase tracking-wide text-slate-500">
        Corredores (14d)
      </p>
      {CORRIDORS.map(({ key, label, color }) => {
        const n = breakdown[key];
        const pct = n > 0 ? Math.max(8, (n / max) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-2 text-[11px]">
            <span className="w-7 font-mono-data text-slate-500">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className={`h-full rounded-full ${color} ${n > 0 ? 'opacity-90' : 'opacity-0'}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-4 text-right font-mono-data text-slate-400">{n}</span>
          </div>
        );
      })}
    </div>
  );
}
