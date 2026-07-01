import type { PeriodizationPlan } from '@/lib/periodization';

export function applyPlanExclusions(
  plan: PeriodizationPlan,
  excludedMccIds: Set<string>
): PeriodizationPlan {
  if (excludedMccIds.size === 0) return plan;

  const sessionsPerMicro = plan.config.sessionsPerMicro;
  const tasksPerSession =
    plan.totalTasks / Math.max(plan.totalSessions, 1) || plan.config.mainTasksPerSession + 2;

  let totalMicrocycles = 0;
  let totalSessions = 0;
  let totalTasks = 0;
  let totalMesocycles = 0;

  const macrocycles = plan.macrocycles.map((macro) => {
    const mesocycles = macro.mesocycles
      .map((meso) => {
        const microcycles = meso.microcycles.filter((micro) => !excludedMccIds.has(micro.id));
        if (microcycles.length === 0) return null;

        const mesoSessions = microcycles.reduce((sum, micro) => sum + micro.sessionsCount, 0);
        const mesoTasks = microcycles.reduce((sum, micro) => sum + micro.tasksCount, 0);
        totalMesocycles += 1;
        totalMicrocycles += microcycles.length;
        totalSessions += mesoSessions;
        totalTasks += mesoTasks;

        return {
          ...meso,
          microcycles,
          totalSessions: mesoSessions,
          totalTasks: mesoTasks,
        };
      })
      .filter((meso): meso is NonNullable<typeof meso> => meso !== null);

    const macroSessions = mesocycles.reduce((sum, meso) => sum + meso.totalSessions, 0);
    const macroTasks = mesocycles.reduce((sum, meso) => sum + meso.totalTasks, 0);

    return {
      ...macro,
      mesocycles,
      mesocycleCount: mesocycles.length,
      microcycleCount: mesocycles.reduce((sum, meso) => sum + meso.microcycles.length, 0),
      totalSessions: macroSessions,
      totalTasks: macroTasks,
    };
  });

  return {
    ...plan,
    macrocycles,
    totalMicrocycles,
    totalMesocycles,
    totalSessions,
    totalTasks,
  };
}

export function findCurrentMccId(plan: PeriodizationPlan, today = new Date()): string | null {
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);

  for (const macro of plan.macrocycles) {
    for (const meso of macro.mesocycles) {
      for (const micro of meso.microcycles) {
        const [sy, sm, sd] = micro.weekStart.split('-').map(Number);
        const [ey, em, ed] = micro.weekEnd.split('-').map(Number);
        const start = new Date(sy, sm - 1, sd, 12, 0, 0, 0);
        const end = new Date(ey, em - 1, ed, 12, 0, 0, 0);
        if (todayMid >= start && todayMid <= end) return micro.id;
      }
    }
  }

  return null;
}
