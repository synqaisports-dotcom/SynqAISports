import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { defaultSlotsTemplate, type SlotType } from '@/lib/methodology';

export type MacroCount = 1 | 2 | 3;
export type SessionsPerMicro = 2 | 3;
export type MainTasksPerSession = 2 | 3;

export type SessionSlotTemplate = {
  slot_type: SlotType;
  order_index: number;
};

export type PeriodizationConfig = {
  categorySlug: CanteraCategorySlug;
  seasonTitle: string;
  startDate: string;
  endDate: string;
  macroCount: MacroCount;
  sessionsPerMicro: SessionsPerMicro;
  mainTasksPerSession: MainTasksPerSession;
  macroNames: string[];
};

export function sessionSlotsForMainCount(mainCount: MainTasksPerSession): SessionSlotTemplate[] {
  if (mainCount === 3) return defaultSlotsTemplate();

  return [
    { slot_type: 'warmup', order_index: 0 },
    { slot_type: 'main', order_index: 1 },
    { slot_type: 'main', order_index: 2 },
    { slot_type: 'cooldown', order_index: 3 },
  ];
}

export function tasksPerSessionFromMainCount(mainCount: MainTasksPerSession): number {
  return sessionSlotsForMainCount(mainCount).length;
}

export function sessionStructureSummary(mainCount: MainTasksPerSession): string {
  return `1 calent. + ${mainCount} princ. + vuelta calma`;
}

export type MicrocycleWeek = {
  id: string;
  mccIndex: number;
  label: string;
  weekStart: string;
  weekEnd: string;
  sessionsCount: number;
  tasksCount: number;
};

export type MesocycleMonth = {
  id: string;
  monthKey: string;
  label: string;
  mesoIndex: number;
  monthName: string;
  microcycles: MicrocycleWeek[];
  totalSessions: number;
  totalTasks: number;
};

export type MacrocycleBlock = {
  id: string;
  index: number;
  name: string;
  startDate: string;
  endDate: string;
  mesocycleCount: number;
  microcycleCount: number;
  mesocycles: MesocycleMonth[];
  totalSessions: number;
  totalTasks: number;
};

export type PeriodizationPlan = {
  config: PeriodizationConfig;
  macrocycles: MacrocycleBlock[];
  totalMicrocycles: number;
  totalMesocycles: number;
  totalSessions: number;
  totalTasks: number;
};

const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const DEFAULT_MACRO_NAMES: Record<MacroCount, string[]> = {
  1: ['Macrociclo 1'],
  2: ['Macrociclo 1 — Fase A', 'Macrociclo 2 — Fase B'],
  3: ['Macrociclo 1 — Adaptación', 'Macrociclo 2 — Desarrollo', 'Macrociclo 3 — Rendimiento'],
};

export const CATEGORY_PLAN_STYLES: Record<
  CanteraCategorySlug,
  { header: string; macro: string; meso: string; micro: string; accent: string }
> = {
  debutantes: {
    header: 'bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-100',
    macro: 'bg-fuchsia-500/15 border-fuchsia-400/40 text-fuchsia-50',
    meso: 'bg-fuchsia-400/10 border-fuchsia-400/35 text-fuchsia-100',
    micro: 'bg-fuchsia-500/20 border-fuchsia-400/45 text-fuchsia-50',
    accent: 'text-fuchsia-300',
  },
  prebenjamin: {
    header: 'bg-primary/20 border-primary/50 text-primary-foreground',
    macro: 'bg-primary/15 border-primary/40',
    meso: 'bg-primary/10 border-primary/35',
    micro: 'bg-primary/20 border-primary/45',
    accent: 'text-primary',
  },
  benjamin: {
    header: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100',
    macro: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-50',
    meso: 'bg-emerald-400/10 border-emerald-400/35 text-emerald-100',
    micro: 'bg-emerald-500/20 border-emerald-400/45 text-emerald-50',
    accent: 'text-emerald-300',
  },
  alevin: {
    header: 'bg-sky-500/20 border-sky-400/50 text-sky-100',
    macro: 'bg-sky-500/15 border-sky-400/40 text-sky-50',
    meso: 'bg-sky-400/10 border-sky-400/35 text-sky-100',
    micro: 'bg-sky-500/20 border-sky-400/45 text-sky-50',
    accent: 'text-sky-300',
  },
  infantil: {
    header: 'bg-violet-500/20 border-violet-400/50 text-violet-100',
    macro: 'bg-violet-500/15 border-violet-400/40 text-violet-50',
    meso: 'bg-violet-400/10 border-violet-400/35 text-violet-100',
    micro: 'bg-violet-500/20 border-violet-400/45 text-violet-50',
    accent: 'text-violet-300',
  },
  cadete: {
    header: 'bg-amber-500/20 border-amber-400/50 text-amber-100',
    macro: 'bg-amber-500/15 border-amber-400/40 text-amber-50',
    meso: 'bg-amber-400/10 border-amber-400/35 text-amber-100',
    micro: 'bg-amber-500/20 border-amber-400/45 text-amber-50',
    accent: 'text-amber-300',
  },
  juvenil: {
    header: 'bg-rose-500/20 border-rose-400/50 text-rose-100',
    macro: 'bg-rose-500/15 border-rose-400/40 text-rose-50',
    meso: 'bg-rose-400/10 border-rose-400/35 text-rose-100',
    micro: 'bg-rose-500/20 border-rose-400/45 text-rose-50',
    accent: 'text-rose-300',
  },
};

function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const weekday = copy.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function endOfWeekSunday(date: Date): Date {
  const monday = startOfWeekMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return sunday;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthBounds(dateInMonth: Date): { start: Date; end: Date } {
  const year = dateInMonth.getFullYear();
  const month = dateInMonth.getMonth();
  return {
    start: new Date(year, month, 1, 12, 0, 0, 0),
    end: new Date(year, month + 1, 0, 12, 0, 0, 0),
  };
}

/** Meses naturales (inclusive) entre inicio y fin de temporada. */
export function naturalMonthsInRange(rangeStart: Date, rangeEnd: Date): string[] {
  const months: string[] = [];
  let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1, 12, 0, 0, 0);
  const endCursor = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1, 12, 0, 0, 0);

  while (cursor <= endCursor) {
    months.push(monthKey(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12, 0, 0, 0);
  }

  return months;
}

export function countNaturalMonthsBetween(startDate: string, endDate: string): number {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  if (end < start) return 0;
  return naturalMonthsInRange(start, end).length;
}

function intersectRange(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): { start: Date; end: Date } | null {
  const start = clampDate(aStart, bStart, bEnd);
  const end = clampDate(aEnd, bStart, bEnd);
  if (start > end) return null;
  return { start, end };
}

/** Reparte un total en partes lo más iguales posible (diferencia máx. 1). */
export function splitEvenly(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  return Array.from({ length: parts }, (_, index) => base + (index < remainder ? 1 : 0));
}

function monthLabelFromKey(key: string): string {
  const month = Number(key.split('-')[1]);
  return MONTH_NAMES[month - 1] ?? key;
}

function clampDate(date: Date, min: Date, max: Date): Date {
  if (date < min) return new Date(min);
  if (date > max) return new Date(max);
  return date;
}

function weeksInRange(rangeStart: Date, rangeEnd: Date): { weekStart: Date; weekEnd: Date }[] {
  const weeks: { weekStart: Date; weekEnd: Date }[] = [];
  let cursor = startOfWeekMonday(rangeStart);

  while (cursor <= rangeEnd) {
    const weekStart = clampDate(cursor, rangeStart, rangeEnd);
    const weekEnd = clampDate(endOfWeekSunday(cursor), rangeStart, rangeEnd);
    if (weekStart <= weekEnd) {
      weeks.push({ weekStart, weekEnd });
    }
    cursor = addDays(cursor, 7);
  }

  return weeks;
}

function chunkArray<T>(items: T[], sizes: number[]): T[][] {
  const chunks: T[][] = [];
  let offset = 0;
  for (const size of sizes) {
    chunks.push(items.slice(offset, offset + size));
    offset += size;
  }
  return chunks;
}

function weekOverlapsMonth(
  week: { weekStart: Date; weekEnd: Date },
  monthKeyValue: string,
  seasonStart: Date,
  seasonEnd: Date
): boolean {
  const [year, month] = monthKeyValue.split('-').map(Number);
  const calendarBounds = monthBounds(new Date(year, month - 1, 1, 12, 0, 0, 0));
  const monthInSeason = intersectRange(
    calendarBounds.start,
    calendarBounds.end,
    seasonStart,
    seasonEnd
  );
  if (!monthInSeason) return false;
  return week.weekStart <= monthInSeason.end && week.weekEnd >= monthInSeason.start;
}

function countOverlapDays(
  week: { weekStart: Date; weekEnd: Date },
  monthKeyValue: string,
  seasonStart: Date,
  seasonEnd: Date
): number {
  const [year, month] = monthKeyValue.split('-').map(Number);
  const calendarBounds = monthBounds(new Date(year, month - 1, 1, 12, 0, 0, 0));
  const monthInSeason = intersectRange(
    calendarBounds.start,
    calendarBounds.end,
    seasonStart,
    seasonEnd
  );
  if (!monthInSeason) return 0;

  const start = clampDate(week.weekStart, monthInSeason.start, monthInSeason.end);
  const end = clampDate(week.weekEnd, monthInSeason.start, monthInSeason.end);
  if (start > end) return 0;

  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function assignWeekToMacroMonth(
  week: { weekStart: Date; weekEnd: Date },
  macroMonthKeys: string[],
  seasonStart: Date,
  seasonEnd: Date
): string {
  const weekMonth = monthKey(week.weekStart);
  if (macroMonthKeys.includes(weekMonth)) return weekMonth;

  const [firstYear, firstMonth] = macroMonthKeys[0].split('-').map(Number);
  const [lastYear, lastMonth] = macroMonthKeys[macroMonthKeys.length - 1].split('-').map(Number);
  const firstDay = new Date(firstYear, firstMonth - 1, 1, 12, 0, 0, 0);
  const lastDay = new Date(lastYear, lastMonth, 0, 12, 0, 0, 0);

  if (week.weekStart < firstDay) return macroMonthKeys[0];
  if (week.weekStart > lastDay) return macroMonthKeys[macroMonthKeys.length - 1];

  let bestKey = macroMonthKeys[0];
  let bestOverlap = 0;
  for (const key of macroMonthKeys) {
    const overlap = countOverlapDays(week, key, seasonStart, seasonEnd);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      bestKey = key;
    }
  }
  return bestKey;
}

function buildMesocyclesForMacro(
  macroWeeks: { weekStart: Date; weekEnd: Date }[],
  macroMonthKeys: string[],
  macroIndex: number,
  seasonStart: Date,
  seasonEnd: Date,
  sessionsPerMicro: SessionsPerMicro,
  tasksPerSession: number,
  mccCounterRef: { value: number }
): MesocycleMonth[] {
  const weeksByMonth = new Map<string, { weekStart: Date; weekEnd: Date }[]>();
  for (const key of macroMonthKeys) weeksByMonth.set(key, []);

  for (const week of macroWeeks) {
    const targetMonth = assignWeekToMacroMonth(week, macroMonthKeys, seasonStart, seasonEnd);
    weeksByMonth.get(targetMonth)?.push(week);
  }

  let mesoCounter = 0;
  return macroMonthKeys
    .map((key) => {
      const monthWeeks = weeksByMonth.get(key) ?? [];
      if (monthWeeks.length === 0) return null;

      const microcycles: MicrocycleWeek[] = monthWeeks.map((week) => {
        mccCounterRef.value += 1;
        return {
          id: `mcc-${macroIndex}-${key}-${mccCounterRef.value}`,
          mccIndex: mccCounterRef.value,
          label: `MCC${mccCounterRef.value}`,
          weekStart: formatISO(week.weekStart),
          weekEnd: formatISO(week.weekEnd),
          sessionsCount: sessionsPerMicro,
          tasksCount: sessionsPerMicro * tasksPerSession,
        };
      });

      mesoCounter += 1;
      const monthName = monthLabelFromKey(key);
      const totalSessions = microcycles.reduce((sum, micro) => sum + micro.sessionsCount, 0);
      const totalTasks = microcycles.reduce((sum, micro) => sum + micro.tasksCount, 0);

      return {
        id: `meso-${macroIndex}-${key}`,
        monthKey: key,
        monthName,
        mesoIndex: mesoCounter,
        label: `Mesociclo ${mesoCounter} — ${monthName}`,
        microcycles,
        totalSessions,
        totalTasks,
      };
    })
    .filter((meso): meso is MesocycleMonth => meso !== null);
}

function defaultSeasonTitle(categoryName: string, startDate: string, endDate: string): string {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  const season =
    startYear === endYear ? startYear : `${startYear.slice(2)}/${endYear.slice(2)}`;
  return `${categoryName} · Temporada ${season}`;
}

export function defaultPeriodizationConfig(
  categorySlug: CanteraCategorySlug,
  categoryName: string
): PeriodizationConfig {
  return {
    categorySlug,
    seasonTitle: defaultSeasonTitle(categoryName, '2018-09-01', '2019-01-31'),
    startDate: '2018-09-01',
    endDate: '2019-01-31',
    macroCount: 1,
    sessionsPerMicro: 3,
    mainTasksPerSession: 3,
    macroNames: [...DEFAULT_MACRO_NAMES[1]],
  };
}

export function buildPeriodizationPlan(config: PeriodizationConfig): PeriodizationPlan {
  const seasonStart = parseISODate(config.startDate);
  const seasonEnd = parseISODate(config.endDate);

  if (seasonEnd < seasonStart) {
    throw new Error('La fecha final debe ser posterior a la de inicio.');
  }

  const seasonMonths = naturalMonthsInRange(seasonStart, seasonEnd);
  const seasonWeeks = weeksInRange(seasonStart, seasonEnd);
  const tasksPerSession = tasksPerSessionFromMainCount(config.mainTasksPerSession);
  const sessionsPerMicro = config.sessionsPerMicro;

  const monthChunks = chunkArray(seasonMonths, splitEvenly(seasonMonths.length, config.macroCount));
  const weekChunks = chunkArray(seasonWeeks, splitEvenly(seasonWeeks.length, config.macroCount));

  const mccCounterRef = { value: 0 };

  const macrocycles: MacrocycleBlock[] = weekChunks.map((macroWeeks, macroIndex) => {
    const macroMonthKeys = monthChunks[macroIndex] ?? [];
    const mesocycles = buildMesocyclesForMacro(
      macroWeeks,
      macroMonthKeys,
      macroIndex,
      seasonStart,
      seasonEnd,
      sessionsPerMicro,
      tasksPerSession,
      mccCounterRef
    );

    const macroStart = macroWeeks[0]?.weekStart ?? seasonStart;
    const macroEnd = macroWeeks[macroWeeks.length - 1]?.weekEnd ?? seasonEnd;
    const microcycleCount = macroWeeks.length;
    const totalSessions = microcycleCount * sessionsPerMicro;
    const totalTasks = totalSessions * tasksPerSession;
    const macroName =
      config.macroNames[macroIndex]?.trim() || DEFAULT_MACRO_NAMES[config.macroCount][macroIndex];

    return {
      id: `macro-${macroIndex}`,
      index: macroIndex,
      name: macroName,
      startDate: formatISO(macroStart),
      endDate: formatISO(macroEnd),
      mesocycleCount: mesocycles.length,
      microcycleCount,
      mesocycles,
      totalSessions,
      totalTasks,
    };
  });

  const totalMicrocycles = seasonWeeks.length;
  const totalMesocycles = seasonMonths.length;
  const totalSessions = totalMicrocycles * sessionsPerMicro;
  const totalTasks = totalSessions * tasksPerSession;

  return {
    config,
    macrocycles,
    totalMicrocycles,
    totalMesocycles,
    totalSessions,
    totalTasks,
  };
}

export function formatMacroDistributionSummary(plan: PeriodizationPlan): string {
  const { sessionsPerMicro, macroCount } = plan.config;
  const macroParts = plan.macrocycles
    .map(
      (macro) =>
        `${macro.name}: ${macro.microcycleCount} MCC · ${macro.mesocycleCount} meso${macro.mesocycleCount === 1 ? '' : 's'}`
    )
    .join(' · ');

  return `${plan.totalMicrocycles} microciclos × ${sessionsPerMicro} sesiones = ${plan.totalSessions} sesiones (${macroCount} macrociclo${macroCount === 1 ? '' : 's'}: ${macroParts}). Sin festivos.`;
}

export function previewPeriodizationDistribution(
  startDate: string,
  endDate: string,
  macroCount: MacroCount,
  sessionsPerMicro: SessionsPerMicro
): string | null {
  const seasonStart = parseISODate(startDate);
  const seasonEnd = parseISODate(endDate);
  if (seasonEnd < seasonStart) return null;

  const mesoTotal = naturalMonthsInRange(seasonStart, seasonEnd).length;
  const microTotal = weeksInRange(seasonStart, seasonEnd).length;
  const mesoSplit = splitEvenly(mesoTotal, macroCount).join(' + ');
  const microSplit = splitEvenly(microTotal, macroCount).join(' + ');
  const sessionsTotal = microTotal * sessionsPerMicro;

  return `${microTotal} microciclos × ${sessionsPerMicro} sesiones = ${sessionsTotal} sesiones · ${mesoTotal} mesociclos repartidos ${mesoSplit} · MCC por macro: ${microSplit}`;
}

export function macroNamesForCount(count: MacroCount, current: string[] = []): string[] {
  return DEFAULT_MACRO_NAMES[count].map((fallback, index) => current[index]?.trim() || fallback);
}

export type MccContext = {
  micro: MicrocycleWeek;
  meso: MesocycleMonth;
  macro: MacrocycleBlock;
};

export function findMccInPlan(plan: PeriodizationPlan, mccId: string): MccContext | null {
  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      const micro = meso.microcycles.find((item) => item.id === mccId);
      if (micro) return { micro, meso, macro };
    }
  }
  return null;
}

export function getMccDisplayLabel(
  micro: MicrocycleWeek,
  override?: { label?: string }
): string {
  return override?.label?.trim() || micro.label;
}

