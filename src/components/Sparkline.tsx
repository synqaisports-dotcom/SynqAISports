export function Sparkline({
  points,
  label = 'Actividad 14d',
}: {
  points: number[];
  label?: string;
}) {
  if (points.length < 2) {
    return (
      <p className="text-[10px] text-slate-500">
        {label}: acumulando histórico (necesita 2+ días de scrape)
      </p>
    );
  }

  const w = 120;
  const h = 28;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const coords = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-2">
      <p className="mb-1 text-[10px] font-mono-data uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <svg width={w} height={h} className="text-tp-cyan" aria-hidden>
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords}
        />
      </svg>
    </div>
  );
}
