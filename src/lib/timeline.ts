import type { HistoricalDnaRow } from './types';

export type TimelineSegment = {
  id: string;
  label: string;
  colorClass: string;
  widthPct: number;
};

export type TimelineModel = {
  segments: TimelineSegment[];
  markers: { label: string; date: string; pct: number }[];
  delayDays: number | null;
  totalDays: number;
};

function parseDate(value: string | null, fallback: string): Date {
  return new Date(value ?? fallback);
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export function buildTimelineModel(row: HistoricalDnaRow): TimelineModel | null {
  const signal = parseDate(row.origin_signal_start, row.origin_peak_date);
  const originPeak = parseDate(row.origin_peak_date, row.origin_signal_start ?? row.origin_peak_date);
  const esPeak = row.target_peak_date
    ? new Date(row.target_peak_date)
    : null;

  if (!esPeak || esPeak <= signal) return null;

  const plateauEnd = row.decline_start_date
    ? new Date(row.decline_start_date)
    : new Date(esPeak.getTime() + (row.plateau_days ?? 21) * 86_400_000);

  const end = row.decline_start_date
    ? new Date(
        plateauEnd.getTime() +
          (row.decline_days != null ? row.decline_days : 30) * 86_400_000
      )
    : plateauEnd;

  const totalMs = Math.max(end.getTime() - signal.getTime(), 1);
  const span = (from: Date, to: Date) =>
    Math.max(0, ((to.getTime() - from.getTime()) / totalMs) * 100);

  const risePct = span(signal, originPeak);
  const delayPct = span(originPeak, esPeak);
  const plateauPct = span(esPeak, plateauEnd);
  const declinePct = row.decline_start_date ? span(plateauEnd, end) : 0;

  const segments: TimelineSegment[] = [
    {
      id: 'rise',
      label: 'Subida origen',
      colorClass: 'bg-cyan-500/80',
      widthPct: risePct,
    },
    {
      id: 'delay',
      label: 'Delay → ES',
      colorClass: 'bg-amber-400/90',
      widthPct: delayPct,
    },
    {
      id: 'plateau',
      label: 'Meseta ES',
      colorClass: 'bg-emerald-400/80',
      widthPct: plateauPct,
    },
  ];

  if (declinePct > 0) {
    segments.push({
      id: 'decline',
      label: 'Caída',
      colorClass: 'bg-slate-500/70',
      widthPct: declinePct,
    });
  }

  const markers = [
    { label: 'Señal', date: row.origin_signal_start ?? row.origin_peak_date, pct: 0 },
    { label: 'Pico origen', date: row.origin_peak_date, pct: risePct },
    { label: 'Pico ES', date: row.target_peak_date!, pct: risePct + delayPct },
  ];

  if (row.decline_start_date) {
    markers.push({
      label: 'Caída',
      date: row.decline_start_date,
      pct: risePct + delayPct + plateauPct,
    });
  }

  return {
    segments: segments.filter((s) => s.widthPct > 0.5),
    markers,
    delayDays: row.delay_days_to_target,
    totalDays: daysBetween(signal, end),
  };
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    month: 'short',
    year: '2-digit',
  });
}
