import type { PeriodizationPlan } from '@/lib/periodization';

export type CoachSeasonProgress = {
  currentMcc: number;
  totalMcc: number;
  completedSessions: number;
  totalSessions: number;
  completionPercent: number;
};

function flatMccIndex(plan: PeriodizationPlan, mccId: string): number {
  let index = 0;
  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      for (const micro of meso.microcycles) {
        index += 1;
        if (micro.id === mccId) return index;
      }
    }
  }
  return 0;
}

function completedSessionsBeforeMcc(plan: PeriodizationPlan, mccId: string): number {
  let sum = 0;
  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      for (const micro of meso.microcycles) {
        if (micro.id === mccId) return sum;
        sum += micro.sessionsCount;
      }
    }
  }
  return sum;
}

export function computeCoachSeasonProgress(
  plan: PeriodizationPlan,
  currentMccId: string,
  selectedSessionIndex: number
): CoachSeasonProgress {
  const totalMcc = plan.totalMicrocycles;
  const totalSessions = Math.max(plan.totalSessions, 1);
  const currentMcc = Math.max(flatMccIndex(plan, currentMccId), 1);
  const priorSessions = completedSessionsBeforeMcc(plan, currentMccId);
  const completedSessions = Math.min(
    priorSessions + Math.max(selectedSessionIndex, 1),
    totalSessions
  );
  const completionPercent = Math.round((completedSessions / totalSessions) * 100);

  return {
    currentMcc,
    totalMcc,
    completedSessions,
    totalSessions,
    completionPercent,
  };
}
