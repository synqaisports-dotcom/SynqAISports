/**
 * Pizarra de dibujo deportivo (v2) — estilo Camelot / OnFormación RFEF.
 * Coordenadas normalizadas 0..1 sobre el campo seleccionado.
 */

export const DRAWING_DOC_VERSION = 2 as const;

export type FieldTemplate =
  | 'football-full'
  | 'football-half'
  | 'football-third'
  | 'futsal'
  | 'blank';

export const FIELD_TEMPLATES: Record<
  FieldTemplate,
  { label: string; aspectRatio: number; description: string }
> = {
  'football-full': {
    label: 'Campo completo',
    aspectRatio: 105 / 68,
    description: '105 × 68 m',
  },
  'football-half': {
    label: 'Medio campo',
    aspectRatio: 52.5 / 68,
    description: 'Horizontal',
  },
  'football-third': {
    label: 'Tercio',
    aspectRatio: 35 / 68,
    description: 'Zona reducida',
  },
  futsal: {
    label: 'Fútbol sala',
    aspectRatio: 40 / 20,
    description: '40 × 20 m',
  },
  blank: {
    label: 'Sin campo',
    aspectRatio: 4 / 3,
    description: 'Lienzo libre',
  },
};

export type DrawingTool =
  | 'select'
  | 'arrow'
  | 'line'
  | 'dashed-arrow'
  | 'player'
  | 'player-rival'
  | 'cone'
  | 'ball'
  | 'goal'
  | 'zone'
  | 'text';

export type DrawingElement =
  | ArrowElement
  | LineElement
  | PlayerElement
  | ConeElement
  | BallElement
  | GoalElement
  | ZoneElement
  | TextElement;

type ElementBase = {
  id: string;
  color?: string;
};

export type ArrowElement = ElementBase & {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  curved?: boolean;
};

export type LineElement = ElementBase & {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
};

export type PlayerElement = ElementBase & {
  type: 'player';
  x: number;
  y: number;
  team: 'own' | 'rival' | 'neutral';
  label?: string;
  rotation?: number;
};

export type ConeElement = ElementBase & {
  type: 'cone';
  x: number;
  y: number;
  variant: 'cone' | 'pole' | 'mini';
  rotation?: number;
};

export type BallElement = ElementBase & {
  type: 'ball';
  x: number;
  y: number;
};

export type GoalElement = ElementBase & {
  type: 'goal';
  x: number;
  y: number;
  width: number;
  rotation?: number;
};

export type ZoneElement = ElementBase & {
  type: 'zone';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
};

export type TextElement = ElementBase & {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
};

export type ExerciseDrawingDocument = {
  version: typeof DRAWING_DOC_VERSION;
  field: FieldTemplate;
  elements: DrawingElement[];
  /** Trazos legacy (v1) superpuestos si existían */
  legacyStrokes?: LegacyStroke[];
};

export type LegacyStroke = {
  points: [number, number][];
  color: string;
  width: number;
};

export const EMPTY_DRAWING_DOC: ExerciseDrawingDocument = {
  version: DRAWING_DOC_VERSION,
  field: 'football-full',
  elements: [],
};

export function createElementId(): string {
  return `el-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseExerciseDrawing(raw: unknown): ExerciseDrawingDocument {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_DRAWING_DOC };

  const obj = raw as Record<string, unknown>;

  if (obj.version === DRAWING_DOC_VERSION && Array.isArray(obj.elements)) {
    return {
      version: DRAWING_DOC_VERSION,
      field: isFieldTemplate(obj.field) ? obj.field : 'football-full',
      elements: obj.elements.filter(isDrawingElement) as DrawingElement[],
      legacyStrokes: parseLegacyStrokes(obj.legacyStrokes),
    };
  }

  // Migración v1: solo trazos a mano alzada
  const strokes = parseLegacyStrokes(obj.strokes);
  return {
    version: DRAWING_DOC_VERSION,
    field: 'football-full',
    elements: [],
    legacyStrokes: strokes.length > 0 ? strokes : undefined,
  };
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

function isFieldTemplate(value: unknown): value is FieldTemplate {
  return typeof value === 'string' && value in FIELD_TEMPLATES;
}

function isDrawingElement(value: unknown): value is DrawingElement {
  if (!value || typeof value !== 'object') return false;
  const t = (value as { type?: string }).type;
  return (
    t === 'arrow' ||
    t === 'line' ||
    t === 'player' ||
    t === 'cone' ||
    t === 'ball' ||
    t === 'goal' ||
    t === 'zone' ||
    t === 'text'
  );
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

/** Punto de anclaje editable por tipo de elemento */
export type AnchorPoint = {
  id: string;
  elementId: string;
  x: number;
  y: number;
  role: string;
};

export function getElementAnchors(element: DrawingElement): AnchorPoint[] {
  switch (element.type) {
    case 'arrow':
    case 'line':
      return [
        { id: `${element.id}-a`, elementId: element.id, x: element.x1, y: element.y1, role: 'start' },
        { id: `${element.id}-b`, elementId: element.id, x: element.x2, y: element.y2, role: 'end' },
      ];
    case 'zone':
      return [
        { id: `${element.id}-tl`, elementId: element.id, x: element.x, y: element.y, role: 'tl' },
        {
          id: `${element.id}-br`,
          elementId: element.id,
          x: element.x + element.width,
          y: element.y + element.height,
          role: 'br',
        },
      ];
    case 'player':
    case 'cone':
    case 'ball':
      return [{ id: `${element.id}-c`, elementId: element.id, x: element.x, y: element.y, role: 'center' }];
    case 'goal':
      return [
        { id: `${element.id}-c`, elementId: element.id, x: element.x, y: element.y, role: 'center' },
        {
          id: `${element.id}-w`,
          elementId: element.id,
          x: element.x + element.width / 2,
          y: element.y,
          role: 'width',
        },
      ];
    case 'text':
      return [{ id: `${element.id}-c`, elementId: element.id, x: element.x, y: element.y, role: 'center' }];
    default:
      return [];
  }
}

export function updateElementAnchor(
  element: DrawingElement,
  role: string,
  x: number,
  y: number
): DrawingElement {
  const clamped = (v: number) => Math.max(0, Math.min(1, v));
  const nx = clamped(x);
  const ny = clamped(y);

  switch (element.type) {
    case 'arrow':
    case 'line':
      if (role === 'start') return { ...element, x1: nx, y1: ny };
      if (role === 'end') return { ...element, x2: nx, y2: ny };
      return element;
    case 'zone':
      if (role === 'tl') {
        const dx = element.width;
        const dy = element.height;
        return { ...element, x: nx, y: ny, width: Math.max(0.04, element.x + dx - nx), height: Math.max(0.04, element.y + dy - ny) };
      }
      if (role === 'br') {
        return {
          ...element,
          width: Math.max(0.04, nx - element.x),
          height: Math.max(0.04, ny - element.y),
        };
      }
      return element;
    case 'player':
    case 'cone':
    case 'ball':
      return { ...element, x: nx, y: ny };
    case 'goal':
      if (role === 'center') return { ...element, x: nx, y: ny };
      if (role === 'width') return { ...element, width: Math.max(0.04, (nx - element.x) * 2) };
      return element;
    case 'text':
      return { ...element, x: nx, y: ny };
    default:
      return element;
  }
}

export function defaultElementForTool(tool: DrawingTool, x: number, y: number): DrawingElement | null {
  const id = createElementId();
  const nx = Math.max(0.05, Math.min(0.95, x));
  const ny = Math.max(0.05, Math.min(0.95, y));

  switch (tool) {
    case 'arrow':
      return { id, type: 'arrow', x1: nx, y1: ny, x2: nx + 0.12, y2: ny, color: '#fbbf24' };
    case 'dashed-arrow':
      return { id, type: 'arrow', x1: nx, y1: ny, x2: nx + 0.12, y2: ny, dashed: true, color: '#38bdf8' };
    case 'line':
      return { id, type: 'line', x1: nx, y1: ny, x2: nx + 0.1, y2: ny + 0.08, color: '#ffffff' };
    case 'player':
      return { id, type: 'player', x: nx, y: ny, team: 'own', label: '1', color: '#22d3ee' };
    case 'player-rival':
      return { id, type: 'player', x: nx, y: ny, team: 'rival', label: 'X', color: '#f87171' };
    case 'cone':
      return { id, type: 'cone', x: nx, y: ny, variant: 'cone', color: '#fb923c' };
    case 'ball':
      return { id, type: 'ball', x: nx, y: ny };
    case 'goal':
      return { id, type: 'goal', x: nx, y: ny, width: 0.14, color: '#e2e8f0' };
    case 'zone':
      return { id, type: 'zone', x: nx, y: ny, width: 0.2, height: 0.15, color: '#22d3ee', opacity: 0.2 };
    case 'text':
      return { id, type: 'text', x: nx, y: ny, text: 'Texto', color: '#ffffff', fontSize: 14 };
    default:
      return null;
  }
}
