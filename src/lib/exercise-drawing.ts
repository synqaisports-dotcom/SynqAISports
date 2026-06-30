/**
 * Pizarra deportiva v3 — preparada para animación futura.
 * Coordenadas normalizadas 0..1 en el rectángulo del campo.
 */

import type { MaterialKind } from '@/lib/drawing-material-assets';

export const DRAWING_DOC_VERSION = 3 as const;

export type FieldTemplate =
  | 'football-full'
  | 'football-f7'
  | 'football-half'
  | 'football-third'
  | 'futsal'
  | 'blank';

export type SportKind = 'football' | 'futsal';

export const SPORT_OPTIONS: Record<SportKind, { label: string; fields: FieldTemplate[] }> = {
  football: {
    label: 'Fútbol',
    fields: ['football-full', 'football-f7', 'football-half', 'football-third'],
  },
  futsal: {
    label: 'Fútbol sala',
    fields: ['futsal'],
  },
};

export const FIELD_FORMAT_SHORT: Record<FieldTemplate, string> = {
  'football-full': 'F11',
  'football-f7': 'F7',
  'football-half': 'Medio',
  'football-third': 'Tercio',
  futsal: 'Sala',
  blank: 'Libre',
};

export const FIELD_TEMPLATES: Record<
  FieldTemplate,
  { label: string; aspectRatio: number; description: string; sport: SportKind }
> = {
  'football-full': {
    label: 'F11 — Campo completo',
    aspectRatio: 105 / 68,
    description: '105 × 68 m',
    sport: 'football',
  },
  'football-f7': {
    label: 'F7 — Campo reducido',
    aspectRatio: 60 / 40,
    description: '60 × 40 m',
    sport: 'football',
  },
  'football-half': {
    label: 'Medio campo',
    aspectRatio: 52.5 / 68,
    description: '52,5 × 68 m',
    sport: 'football',
  },
  'football-third': {
    label: 'Tercio de campo',
    aspectRatio: 35 / 68,
    description: '35 × 68 m',
    sport: 'football',
  },
  futsal: { label: 'Fútbol sala', aspectRatio: 40 / 20, description: '40 × 20 m', sport: 'futsal' },
  blank: { label: 'Lienzo libre', aspectRatio: 16 / 10, description: 'Libre', sport: 'football' },
};

export function sportForField(field: FieldTemplate): SportKind {
  return FIELD_TEMPLATES[field]?.sport ?? 'football';
}

export function defaultFieldForSport(sport: SportKind): FieldTemplate {
  return sport === 'futsal' ? 'futsal' : 'football-full';
}

export type StrokeStyle = {
  color: string;
  width: number;
  dash: boolean;
};

export const DEFAULT_STROKE: StrokeStyle = {
  color: '#fbbf24',
  width: 3,
  dash: false,
};

export type StudioTool =
  | 'select'
  | 'shape-line'
  | 'shape-arrow'
  | 'shape-curve'
  | 'shape-wave'
  | 'shape-rect'
  | MaterialKind;

export type LineShapeElement = {
  id: string;
  type: 'shape-line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  arrowStart: boolean;
  arrowEnd: boolean;
  style: StrokeStyle;
};

export type CurveShapeElement = {
  id: string;
  type: 'shape-curve';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx: number;
  cy: number;
  arrowEnd: boolean;
  style: StrokeStyle;
};

export type WaveShapeElement = {
  id: string;
  type: 'shape-wave';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  amplitude: number;
  style: StrokeStyle;
};

export type RectShapeElement = {
  id: string;
  type: 'shape-rect';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  fillOpacity: number;
  style: StrokeStyle;
};

export type MaterialElement = {
  id: string;
  type: 'material';
  material: MaterialKind;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  label?: string;
};

export type DrawingElement =
  | LineShapeElement
  | CurveShapeElement
  | WaveShapeElement
  | RectShapeElement
  | MaterialElement;

export type LegacyStroke = {
  points: [number, number][];
  color: string;
  width: number;
};

export type ExerciseDrawingDocument = {
  version: typeof DRAWING_DOC_VERSION;
  field: FieldTemplate;
  elements: DrawingElement[];
  legacyStrokes?: LegacyStroke[];
};

export const EMPTY_DRAWING_DOC: ExerciseDrawingDocument = {
  version: DRAWING_DOC_VERSION,
  field: 'football-full',
  elements: [],
};

export function createElementId(): string {
  return `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function isFieldTemplate(value: unknown): value is FieldTemplate {
  return typeof value === 'string' && value in FIELD_TEMPLATES;
}

function parseLegacyStrokes(raw: unknown): LegacyStroke[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is LegacyStroke =>
      typeof s === 'object' &&
      s !== null &&
      Array.isArray((s as LegacyStroke).points) &&
      typeof (s as LegacyStroke).color === 'string'
  );
}

function parseStrokeStyle(raw: unknown, fallback?: Partial<StrokeStyle>): StrokeStyle {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STROKE, ...fallback };
  }
  const o = raw as Partial<StrokeStyle> & { dashed?: boolean };
  return {
    color: typeof o.color === 'string' ? o.color : fallback?.color ?? DEFAULT_STROKE.color,
    width: typeof o.width === 'number' ? o.width : fallback?.width ?? DEFAULT_STROKE.width,
    dash: typeof o.dash === 'boolean' ? o.dash : Boolean(o.dashed ?? fallback?.dash),
  };
}

function isV3Element(value: unknown): value is DrawingElement {
  if (!value || typeof value !== 'object') return false;
  const t = (value as { type?: string }).type;
  return (
    t === 'shape-line' ||
    t === 'shape-curve' ||
    t === 'shape-wave' ||
    t === 'shape-rect' ||
    t === 'material'
  );
}

/** Migra elementos v2 al modelo v3 */
function migrateV2Element(raw: Record<string, unknown>): DrawingElement | null {
  const id = typeof raw.id === 'string' ? raw.id : createElementId();
  const style = parseStrokeStyle(null, {
    color: typeof raw.color === 'string' ? raw.color : undefined,
    dash: Boolean(raw.dashed),
  });

  switch (raw.type) {
    case 'arrow':
      return {
        id,
        type: 'shape-line',
        x1: Number(raw.x1) || 0.4,
        y1: Number(raw.y1) || 0.5,
        x2: Number(raw.x2) || 0.6,
        y2: Number(raw.y2) || 0.5,
        arrowStart: false,
        arrowEnd: true,
        style,
      };
    case 'line':
      return {
        id,
        type: 'shape-line',
        x1: Number(raw.x1) || 0.4,
        y1: Number(raw.y1) || 0.5,
        x2: Number(raw.x2) || 0.6,
        y2: Number(raw.y2) || 0.5,
        arrowStart: false,
        arrowEnd: false,
        style,
      };
    case 'zone':
      return {
        id,
        type: 'shape-rect',
        x: Number(raw.x) || 0.4,
        y: Number(raw.y) || 0.4,
        width: Number(raw.width) || 0.2,
        height: Number(raw.height) || 0.15,
        rotation: Number(raw.rotation) || 0,
        fill: typeof raw.color === 'string' ? raw.color : '#22d3ee',
        fillOpacity: typeof raw.opacity === 'number' ? raw.opacity : 0.25,
        style: { ...style, dash: true },
      };
    case 'player': {
      const team = raw.team as string;
      const material: MaterialKind =
        team === 'rival' ? 'player-rival' : team === 'neutral' ? 'player-neutral' : 'player-own';
      return {
        id,
        type: 'material',
        material,
        x: Number(raw.x) || 0.5,
        y: Number(raw.y) || 0.5,
        rotation: Number(raw.rotation) || 0,
        scale: 1,
        label: typeof raw.label === 'string' ? raw.label : undefined,
      };
    }
    case 'cone':
      return {
        id,
        type: 'material',
        material: raw.variant === 'pole' ? 'cone-pole' : 'cone',
        x: Number(raw.x) || 0.5,
        y: Number(raw.y) || 0.5,
        rotation: Number(raw.rotation) || 0,
        scale: 1,
      };
    case 'ball':
      return {
        id,
        type: 'material',
        material: 'ball',
        x: Number(raw.x) || 0.5,
        y: Number(raw.y) || 0.5,
        rotation: 0,
        scale: 1,
      };
    case 'goal':
      return {
        id,
        type: 'material',
        material: 'goal',
        x: Number(raw.x) || 0.5,
        y: Number(raw.y) || 0.5,
        rotation: Number(raw.rotation) || 0,
        scale: 1.2,
      };
    default:
      return null;
  }
}

export function parseExerciseDrawing(raw: unknown): ExerciseDrawingDocument {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_DRAWING_DOC };
  const obj = raw as Record<string, unknown>;

  if (obj.version === DRAWING_DOC_VERSION && Array.isArray(obj.elements)) {
    return {
      version: DRAWING_DOC_VERSION,
      field: isFieldTemplate(obj.field) ? obj.field : 'football-full',
      elements: obj.elements.filter(isV3Element),
      legacyStrokes: parseLegacyStrokes(obj.legacyStrokes),
    };
  }

  if (obj.version === 2 && Array.isArray(obj.elements)) {
    const elements = obj.elements
      .map((el) => migrateV2Element(el as Record<string, unknown>))
      .filter((el): el is DrawingElement => el !== null);
    return {
      version: DRAWING_DOC_VERSION,
      field: isFieldTemplate(obj.field) ? obj.field : 'football-full',
      elements,
      legacyStrokes: parseLegacyStrokes(obj.legacyStrokes),
    };
  }

  const strokes = parseLegacyStrokes(obj.strokes ?? obj.legacyStrokes);
  return {
    version: DRAWING_DOC_VERSION,
    field: 'football-full',
    elements: [],
    legacyStrokes: strokes.length > 0 ? strokes : undefined,
  };
}

export function drawingDocumentIsEmpty(doc: ExerciseDrawingDocument): boolean {
  return doc.elements.length === 0 && !(doc.legacyStrokes && doc.legacyStrokes.length > 0);
}

export function serializeExerciseDrawing(doc: ExerciseDrawingDocument): string {
  const payload: ExerciseDrawingDocument = {
    version: DRAWING_DOC_VERSION,
    field: doc.field,
    elements: doc.elements,
  };
  if (doc.legacyStrokes?.length) payload.legacyStrokes = doc.legacyStrokes;
  return JSON.stringify(payload);
}

export type FieldRect = { x: number; y: number; width: number; height: number };

export type FieldRectInsets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export function computeFieldRect(
  stageWidth: number,
  stageHeight: number,
  field: FieldTemplate,
  padding = 4,
  insets: FieldRectInsets = {}
): FieldRect {
  const top = insets.top ?? 0;
  const bottom = insets.bottom ?? 0;
  const left = insets.left ?? 0;
  const right = insets.right ?? 0;
  const aspect = FIELD_TEMPLATES[field].aspectRatio;
  const availW = Math.max(1, stageWidth - left - right);
  const availH = Math.max(1, stageHeight - top - bottom);
  const maxW = Math.max(1, availW - padding * 2);
  const maxH = Math.max(1, availH - padding * 2);
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return {
    x: left + (availW - width) / 2,
    y: top + (availH - height) / 2,
    width,
    height,
  };
}

export function normToPx(nx: number, ny: number, rect: FieldRect) {
  return { x: rect.x + nx * rect.width, y: rect.y + ny * rect.height };
}

export function pxToNorm(px: number, py: number, rect: FieldRect) {
  return {
    x: clamp01((px - rect.x) / rect.width),
    y: clamp01((py - rect.y) / rect.height),
  };
}

export function wavePathPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  amplitude: number,
  segments = 24
): number[] {
  const points: number[] = [];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const wave = Math.sin(t * Math.PI * 4) * amplitude;
    points.push(px + nx * wave, py + ny * wave);
  }
  return points;
}

export function defaultDraftForTool(
  tool: StudioTool,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  style: StrokeStyle
): DrawingElement | null {
  const id = createElementId();
  switch (tool) {
    case 'shape-line':
      return {
        id,
        type: 'shape-line',
        x1,
        y1,
        x2,
        y2,
        arrowStart: false,
        arrowEnd: false,
        style: { ...style },
      };
    case 'shape-arrow':
      return {
        id,
        type: 'shape-line',
        x1,
        y1,
        x2,
        y2,
        arrowStart: false,
        arrowEnd: true,
        style: { ...style },
      };
    case 'shape-curve':
      return {
        id,
        type: 'shape-curve',
        x1,
        y1,
        x2,
        y2,
        cx: (x1 + x2) / 2,
        cy: Math.min(y1, y2) - 0.08,
        arrowEnd: true,
        style: { ...style },
      };
    case 'shape-wave':
      return {
        id,
        type: 'shape-wave',
        x1,
        y1,
        x2,
        y2,
        amplitude: 0.02,
        style: { ...style },
      };
    case 'shape-rect': {
      const x = Math.min(x1, x2);
      const y = Math.min(y1, y2);
      return {
        id,
        type: 'shape-rect',
        x,
        y,
        width: Math.max(0.02, Math.abs(x2 - x1)),
        height: Math.max(0.02, Math.abs(y2 - y1)),
        rotation: 0,
        fill: style.color,
        fillOpacity: 0.18,
        style: { ...style, dash: true },
      };
    }
    default:
      if (typeof tool === 'string' && tool.startsWith('player')) {
        return {
          id,
          type: 'material',
          material: tool as MaterialKind,
          x: x1,
          y: y1,
          rotation: 0,
          scale: 1,
          label: tool === 'player-own' ? '1' : tool === 'player-rival' ? 'X' : 'N',
        };
      }
      if (
        tool === 'cone' ||
        tool === 'cone-pole' ||
        tool === 'ball' ||
        tool === 'goal' ||
        tool === 'hurdle' ||
        tool === 'ladder'
      ) {
        return {
          id,
          type: 'material',
          material: tool,
          x: x1,
          y: y1,
          rotation: 0,
          scale: tool === 'goal' ? 1.2 : 1,
        };
      }
      return null;
  }
}

export function isMaterialTool(tool: StudioTool): tool is MaterialKind {
  return (
    tool === 'player-own' ||
    tool === 'player-rival' ||
    tool === 'player-neutral' ||
    tool === 'cone' ||
    tool === 'cone-pole' ||
    tool === 'ball' ||
    tool === 'goal' ||
    tool === 'hurdle' ||
    tool === 'ladder'
  );
}

export function isShapeTool(tool: StudioTool): boolean {
  return (
    tool === 'shape-line' ||
    tool === 'shape-arrow' ||
    tool === 'shape-curve' ||
    tool === 'shape-wave' ||
    tool === 'shape-rect'
  );
}

export type ElementAnchor = { id: string; role: string; x: number; y: number };

export function getElementAnchors(element: DrawingElement): ElementAnchor[] {
  switch (element.type) {
    case 'shape-line':
      return [
        { id: `${element.id}-start`, role: 'start', x: element.x1, y: element.y1 },
        { id: `${element.id}-end`, role: 'end', x: element.x2, y: element.y2 },
      ];
    case 'shape-curve':
      return [
        { id: `${element.id}-start`, role: 'start', x: element.x1, y: element.y1 },
        { id: `${element.id}-end`, role: 'end', x: element.x2, y: element.y2 },
        { id: `${element.id}-ctrl`, role: 'control', x: element.cx, y: element.cy },
      ];
    case 'shape-wave':
      return [
        { id: `${element.id}-start`, role: 'start', x: element.x1, y: element.y1 },
        { id: `${element.id}-end`, role: 'end', x: element.x2, y: element.y2 },
      ];
    default:
      return [];
  }
}
