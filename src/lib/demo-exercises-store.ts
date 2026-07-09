'use client';

import { type DemoExerciseRecord } from '@/lib/demo-exercises';
import { isDemoExerciseId } from '@/lib/demo-exercises';

const STORAGE_KEY = 'synq-demo-exercises';

type DemoExerciseOverrides = Record<
  string,
  {
    drawing_json?: unknown;
  }
>;

function readOverrides(): DemoExerciseOverrides {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DemoExerciseOverrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: DemoExerciseOverrides): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export { isDemoExerciseId };

export function readDemoDrawingOverrides(): Record<string, unknown> {
  const overrides = readOverrides();
  const drawings: Record<string, unknown> = {};
  for (const [id, value] of Object.entries(overrides)) {
    if (value.drawing_json !== undefined) {
      drawings[id] = value.drawing_json;
    }
  }
  return drawings;
}

export function updateDemoExerciseDrawing(exerciseId: string, drawingJson: unknown): void {
  const overrides = readOverrides();
  overrides[exerciseId] = {
    ...overrides[exerciseId],
    drawing_json: drawingJson,
  };
  writeOverrides(overrides);
}

export function mergeDemoExercisesWithOverrides(
  exercises: DemoExerciseRecord[]
): DemoExerciseRecord[] {
  const overrides = readOverrides();
  return exercises.map((exercise) => {
    const override = overrides[exercise.id];
    if (!override?.drawing_json) return exercise;
    return { ...exercise, drawing_json: override.drawing_json as DemoExerciseRecord['drawing_json'] };
  });
}
