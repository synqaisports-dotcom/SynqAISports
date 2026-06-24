import type { CorridorDelayRow, HistoricalDnaRow } from './types';

export type TimelineSegment = {
  id: string;
  label: string;
  colorClass: string;
  widthPct: number;
};

export type TimelineMarker = {
  label: string;
  date: string;
  pct: number;
  kind?: 'default' | 'corridor';
  relationToEs?: CorridorDelayRow['relation_to_es'];
};

export type TimelineModel = {
  segments: TimelineSegment[];
  markers: TimelineMarker[];
  corridor: CorridorDelayRow | null;
  delayDays: number | null;
  totalDays: number;
};

function parseDate(value: string | null, fallback: string): Date {
  return new Date(value ?? fallback);
}

function daysBetween(a: Date, b: Date): number {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000));
}

export function buildTimelineModel(
  row: HistoricalDnaRow,
  corridor?: CorridorDelayRow | null
): TimelineModel | null {
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

  const markers: TimelineMarker[] = [
    { label: 'Señal', date: row.origin_signal_start ?? row.origin_peak_date, pct: 0 },
    { label: 'Pico origen', date: row.origin_peak_date, pct: risePct },
    { label: 'Pico ES', date: row.target_peak_date!, pct: risePct + delayPct },
  ];

  if (corridor?.reference_date) {
    const corridorDate = new Date(corridor.reference_date);
    const corridorPct = Math.min(
      100,
      Math.max(0, ((corridorDate.getTime() - signal.getTime()) / totalMs) * 100)
    );
    markers.push({
      label: corridor.target_market,
      date: corridor.reference_date,
      pct: corridorPct,
      kind: 'corridor',
      relationToEs: corridor.relation_to_es,
    });
    markers.sort((a, b) => a.pct - b.pct);
  }

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
    corridor: corridor ?? null,
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

const RELATION_LABELS: Record<string, string> = {
  before: 'antes de ES',
  after: 'después de ES',
  parallel: 'paralelo a ES',
};

export function corridorRelationLabel(
  relation: CorridorDelayRow['relation_to_es']
): string | null {
  if (!relation) return null;
  return RELATION_LABELS[relation] ?? null;
}

export function daysBetweenCorridorAndEs(
  corridor: CorridorDelayRow,
  esPeakDate: string
): number | null {
  if (!corridor.reference_date) return null;
  const a = new Date(corridor.reference_date);
  const b = new Date(esPeakDate);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
