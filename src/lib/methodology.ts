export type DrawingStroke = {
  points: [number, number][];
  color: string;
  width: number;
};

export type DrawingData = {
  strokes: DrawingStroke[];
};

export const EMPTY_DRAWING: DrawingData = { strokes: [] };

export function parseDrawingJson(raw: unknown): DrawingData {
  if (!raw || typeof raw !== 'object') return EMPTY_DRAWING;
  const obj = raw as { strokes?: unknown };
  if (!Array.isArray(obj.strokes)) return EMPTY_DRAWING;
  return {
    strokes: obj.strokes.filter(
      (s): s is DrawingStroke =>
        typeof s === 'object' &&
        s !== null &&
        Array.isArray((s as DrawingStroke).points) &&
        typeof (s as DrawingStroke).color === 'string'
    ),
  };
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
