import {
  EMPTY_DRAWING_DOC,
  parseExerciseDrawing,
  type ExerciseDrawingDocument,
} from '@/lib/exercise-drawing';

export type DrawingStroke = {
  points: [number, number][];
  color: string;
  width: number;
};

/** @deprecated Usar ExerciseDrawingDocument (v2) */
export type DrawingData = ExerciseDrawingDocument;

export const EMPTY_DRAWING: DrawingData = EMPTY_DRAWING_DOC;

export function parseDrawingJson(raw: unknown): DrawingData {
  return parseExerciseDrawing(raw);
}

export const SLOT_TYPES = ['warmup', 'main', 'cooldown'] as const;
export type SlotType = (typeof SLOT_TYPES)[number];

export const SLOT_LABELS: Record<SlotType, string> = {
  warmup: 'Calentamiento',
  main: 'Principal',
  cooldown: 'Vuelta a la calma',
};

export function defaultSlotsTemplate(): { slot_type: SlotType; order_index: number }[] {
  return [
    { slot_type: 'warmup', order_index: 0 },
    { slot_type: 'main', order_index: 1 },
    { slot_type: 'main', order_index: 2 },
    { slot_type: 'main', order_index: 3 },
    { slot_type: 'cooldown', order_index: 4 },
  ];
}
