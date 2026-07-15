import type { ExercisePreviewRecord } from '@/components/methodology/ExercisePreviewOverlay';
import { getDemoExerciseById, resolveDemoExerciseDrawing } from '@/lib/demo-exercises';
import { mergeDemoExercisesWithOverrides } from '@/lib/demo-exercises-store';
import { legacyToSheet, parseExerciseSheet, parseDurationMinutes } from '@/lib/exercise-sheet';
import type { SlotType } from '@/lib/methodology';
import type { SlotRowBase } from '@/lib/microcycle-sessions';

function sheetFromSlot(slot: SlotRowBase): ReturnType<typeof parseExerciseSheet> {
  const parsed = parseExerciseSheet(slot.sheet_json);
  const taskType = (slot.slot_type as SlotType) || parsed.taskType;

  if (parsed.title?.trim()) {
    return { ...parsed, taskType };
  }

  return legacyToSheet({
    title: slot.title,
    objectives: '',
    notes: slot.notes,
    taskType,
  });
}

export function resolveSlotExercisePreview(slot: SlotRowBase): ExercisePreviewRecord | null {
  if (slot.exercise_id) {
    const demo = getDemoExerciseById(slot.exercise_id);
    if (demo) {
      const [merged] = mergeDemoExercisesWithOverrides([demo]);
      return {
        id: merged.id,
        title: merged.title,
        task_type: merged.task_type,
        objectives: merged.objectives,
        sheet_json: merged.sheet_json,
        drawing_json: merged.drawing_json,
        duration_min: merged.duration_min,
      };
    }
  }

  const sheet = sheetFromSlot(slot);
  const title = sheet.title?.trim() || slot.title?.trim();
  if (!title) return null;

  const duration = parseDurationMinutes(sheet.conditionalGrid.time);

  return {
    id: slot.exercise_id ?? slot.id,
    title,
    task_type: slot.slot_type,
    objectives: sheet.objectives,
    sheet_json: sheet,
    drawing_json: slot.drawing_json ?? resolveDemoExerciseDrawing(slot.exercise_id),
    duration_min: duration ?? undefined,
  };
}
