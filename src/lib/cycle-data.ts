import { buildDemoCycle } from './cycle/build-cycle';
import type { CycleSlotRow, TrendCycleRow } from './cycle-types';
import type { LiveSignalRow } from './radar-types';

export type CycleData = {
  cycle: TrendCycleRow;
  slots: CycleSlotRow[];
  isDemo: boolean;
};

/** Carga ciclo patio — demo local hasta tablas Supabase + scrape marketplace. */
export function loadCycleData(radarSignals: LiveSignalRow[]): CycleData {
  const { cycle, slots } = buildDemoCycle(radarSignals);
  return { cycle, slots, isDemo: true };
}
