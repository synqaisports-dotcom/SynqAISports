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
    fields: ['football-full', 'football-f7', 'football-half'],
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
    aspectRatio: 68 / 52.5,
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

/** Opacidad global del objeto (0..1). El relleno del rectángulo usa fillOpacity aparte. */
export const DEFAULT_ELEMENT_OPACITY = 1;

/** Longitud de onda fija (fracción del ancho del campo) — las ondas se añaden al alargar el trazo. */
export const DEFAULT_WAVE_WAVELENGTH_NORM = 0.03;

/** Relleno suave del rectángulo; el borde se dibuja más intenso encima. */
export const DEFAULT_RECT_FILL_OPACITY = 0.18;

/** El borde del rectángulo es más grueso que el grosor base de trazo. */
export const RECT_STROKE_WIDTH_FACTOR = 1.45;

export const RECT_STROKE_OPACITY = 1;

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
  opacity: number;
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
  opacity: number;
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
  opacity: number;
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
  opacity: number;
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
  opacity: number;
  /** Escalera: ancho independiente del alto */
  scaleX?: number;
  scaleY?: number;
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

function normalizeElementOpacity(el: DrawingElement): DrawingElement {
  const raw = el as DrawingElement & { opacity?: number };
  const opacity =
    typeof raw.opacity === 'number' && Number.isFinite(raw.opacity)
      ? clamp01(raw.opacity)
      : DEFAULT_ELEMENT_OPACITY;
  if (el.type === 'material' && el.material === 'ladder') {
    return {
      ...el,
      opacity,
      scaleX: el.scaleX ?? el.scale,
      scaleY: el.scaleY ?? el.scale,
    };
  }
  return { ...el, opacity };
}

/** Materiales siempre encima de trazos y zonas. */
export function sortElementsByLayer(elements: DrawingElement[]): DrawingElement[] {
  const shapes = elements.filter((el) => el.type !== 'material');
  const materials = elements.filter((el) => el.type === 'material');
  return [...shapes, ...materials];
}

export function isMaterialElement(el: DrawingElement): el is MaterialElement {
  return el.type === 'material';
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        fillOpacity: typeof raw.opacity === 'number' ? raw.opacity : DEFAULT_RECT_FILL_OPACITY,
        style: { ...style, dash: true },
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
      elements: sortElementsByLayer(obj.elements.filter(isV3Element).map(normalizeElementOpacity)),
      legacyStrokes: parseLegacyStrokes(obj.legacyStrokes),
    };
  }

  if (obj.version === 2 && Array.isArray(obj.elements)) {
    const elements = sortElementsByLayer(
      obj.elements
        .map((el) => migrateV2Element(el as Record<string, unknown>))
        .filter((el): el is DrawingElement => el !== null)
        .map(normalizeElementOpacity)
    );
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
    elements: sortElementsByLayer(doc.elements.map(normalizeElementOpacity)),
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

export type FieldFitMode = 'contain' | 'fill-width' | 'fill-width-top';

export function computeFieldRect(
  stageWidth: number,
  stageHeight: number,
  field: FieldTemplate,
  padding = 4,
  insets: FieldRectInsets = {},
  fit: FieldFitMode = 'fill-width'
): FieldRect {
  const top = insets.top ?? 0;
  const bottom = insets.bottom ?? 0;
  const left = insets.left ?? 0;
  const right = insets.right ?? 0;
  const aspect = FIELD_TEMPLATES[field].aspectRatio;
  const availW = Math.max(1, stageWidth - left - right);
  const availH = Math.max(1, stageHeight - top - bottom);

  if (fit === 'fill-width') {
    const width = availW;
    const height = width / aspect;
    const yPos = top + (availH - height) / 2;
    return { x: left, y: Math.max(top, yPos), width, height };
  }

  if (fit === 'fill-width-top') {
    // Máximo ancho posible; si la altura reglamentaria no cabe, escala por alto
    let width = availW;
    let height = width / aspect;
    if (height > availH) {
      height = availH;
      width = height * aspect;
    }
    return {
      x: left + (availW - width) / 2,
      y: top,
      width,
      height,
    };
  }

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
  wavelength: number
): number[] {
  const points: number[] = [];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) {
    points.push(x1, y1);
    return points;
  }
  const nx = -dy / len;
  const ny = dx / len;
  const safeWl = Math.max(wavelength, 8);
  const waveCycles = len / safeWl;
  const samplesPerWave = 10;
  const segmentCount = Math.max(2, Math.ceil(waveCycles * samplesPerWave));
  for (let i = 0; i <= segmentCount; i++) {
    const t = i / segmentCount;
    const dist = len * t;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const wave = Math.sin((dist / safeWl) * Math.PI * 2) * amplitude;
    points.push(px + nx * wave, py + ny * wave);
  }
  return points;
}

/** Punto en curva cuadrática Bézier (p0 → p1 control → p2). */
export function quadBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  t: number
) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/** Ángulo de la tangente al final de la curva (para orientar la punta de flecha). */
export function quadBezierEndAngle(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  sampleT = 0.92
) {
  const near = quadBezierPoint(p0, p1, p2, sampleT);
  return Math.atan2(p2.y - near.y, p2.x - near.x);
}

/** Triángulo de punta de flecha en coordenadas planas [tip, left, right]. */
export function arrowHeadPoints(tipX: number, tipY: number, angle: number, length = 10): number[] {
  const x1 = tipX - length * Math.cos(angle - 0.4);
  const y1 = tipY - length * Math.sin(angle - 0.4);
  const x2 = tipX - length * Math.cos(angle + 0.4);
  const y2 = tipY - length * Math.sin(angle + 0.4);
  return [tipX, tipY, x1, y1, x2, y2];
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        opacity: DEFAULT_ELEMENT_OPACITY,
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
        fillOpacity: DEFAULT_RECT_FILL_OPACITY,
        style: { ...style, dash: true },
        opacity: DEFAULT_ELEMENT_OPACITY,
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
          opacity: DEFAULT_ELEMENT_OPACITY,
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
          scaleX: tool === 'ladder' ? 1 : undefined,
          scaleY: tool === 'ladder' ? 1 : undefined,
          opacity: DEFAULT_ELEMENT_OPACITY,
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

export function translateElementBy(
  element: DrawingElement,
  dx: number,
  dy: number
): Partial<DrawingElement> {
  const tx = (v: number) => clamp01(v + dx);
  const ty = (v: number) => clamp01(v + dy);
  switch (element.type) {
    case 'shape-line':
      return {
        x1: tx(element.x1),
        y1: ty(element.y1),
        x2: tx(element.x2),
        y2: ty(element.y2),
      };
    case 'shape-curve':
      return {
        x1: tx(element.x1),
        y1: ty(element.y1),
        x2: tx(element.x2),
        y2: ty(element.y2),
        cx: tx(element.cx),
        cy: ty(element.cy),
      };
    case 'shape-wave':
      return {
        x1: tx(element.x1),
        y1: ty(element.y1),
        x2: tx(element.x2),
        y2: ty(element.y2),
      };
    case 'shape-rect':
      return { x: tx(element.x), y: ty(element.y) };
    case 'material':
      return { x: tx(element.x), y: ty(element.y) };
    default:
      return {};
  }
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

const DUPLICATE_OFFSET_NORM = 0.025;

/** Clona un elemento con nuevo id y ligero desplazamiento para distinguirlo. */
export function duplicateDrawingElement(element: DrawingElement): DrawingElement {
  const id = createElementId();
  const ox = DUPLICATE_OFFSET_NORM;
  const oy = DUPLICATE_OFFSET_NORM;
  const bump = (v: number) => clamp01(v + ox);

  switch (element.type) {
    case 'shape-line':
      return {
        ...element,
        id,
        x1: bump(element.x1),
        y1: clamp01(element.y1 + oy),
        x2: bump(element.x2),
        y2: clamp01(element.y2 + oy),
      };
    case 'shape-curve':
      return {
        ...element,
        id,
        x1: bump(element.x1),
        y1: clamp01(element.y1 + oy),
        x2: bump(element.x2),
        y2: clamp01(element.y2 + oy),
        cx: bump(element.cx),
        cy: clamp01(element.cy + oy),
      };
    case 'shape-wave':
      return {
        ...element,
        id,
        x1: bump(element.x1),
        y1: clamp01(element.y1 + oy),
        x2: bump(element.x2),
        y2: clamp01(element.y2 + oy),
      };
    case 'shape-rect':
      return {
        ...element,
        id,
        x: bump(element.x),
        y: clamp01(element.y + oy),
      };
    case 'material':
      return {
        ...element,
        id,
        x: bump(element.x),
        y: clamp01(element.y + oy),
      };
  }
}
