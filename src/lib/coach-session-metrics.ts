'use client';

import { loadOrHydrateDemoMicrocycle } from '@/lib/demo-microcycle-hydrate';
import { parseExerciseSheet, parseDurationMinutes } from '@/lib/exercise-sheet';
import { groupSlotsBySession } from '@/lib/microcycle-sessions';

export function exerciseDurationsForSession(
  microcycleId: string | null,
  sessionIndex: number
): number[] {
  if (!microcycleId) return [];

  const micro = loadOrHydrateDemoMicrocycle(microcycleId);
  if (!micro) return [];

  const slots = groupSlotsBySession(micro.slots).get(sessionIndex) ?? [];
  return slots
    .map((slot) => parseDurationMinutes(parseExerciseSheet(slot.sheet_json).conditionalGrid.time))
    .filter((value): value is number => value != null && value > 0);
}
