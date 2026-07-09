import {
  DRAWING_DOC_VERSION,
  type ExerciseDrawingDocument,
  type LineShapeElement,
  type MaterialElement,
  type RectShapeElement,
} from '@/lib/exercise-drawing';
import { emptyExerciseSheet, type ExerciseTaskSheet, type TaskType } from '@/lib/exercise-sheet';

export type DemoExerciseRecord = {
  id: string;
  title: string;
  duration_min: number;
  task_type: TaskType;
  objectives: string;
  notes: string;
  sheet_json: ExerciseTaskSheet;
  drawing_json: ExerciseDrawingDocument;
};

const DEFAULT_STROKE = { color: '#fbbf24', width: 3, dash: false };

function zone(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string
): RectShapeElement {
  return {
    id,
    type: 'shape-rect',
    x,
    y,
    width,
    height,
    rotation: 0,
    fill,
    fillOpacity: 0.22,
    style: { color: fill, width: 3, dash: false },
    opacity: 1,
  };
}

function arrow(
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = '#ffffff'
): LineShapeElement {
  return {
    id,
    type: 'shape-line',
    x1,
    y1,
    x2,
    y2,
    arrowStart: false,
    arrowEnd: true,
    style: { color, width: 3, dash: false },
    opacity: 1,
  };
}

function material(
  id: string,
  kind: MaterialElement['material'],
  x: number,
  y: number
): MaterialElement {
  return {
    id,
    type: 'material',
    material: kind,
    x,
    y,
    rotation: 0,
    scale: 1,
    opacity: 1,
  };
}

function buildSheet(taskType: TaskType, title: string, objectives: string): ExerciseTaskSheet {
  const sheet = emptyExerciseSheet(taskType);
  sheet.title = title;
  sheet.objectives = objectives;
  sheet.didacticStrategy = 'Rondos y situaciones reducidas';
  sheet.conditionalGrid = {
    conditionalContent: 'Superioridad numérica',
    time: taskType === 'warmup' ? '8 min' : taskType === 'cooldown' ? '6 min' : '18 min',
    space: taskType === 'warmup' ? '20 × 15 m' : '30 × 25 m',
    gameSituation: 'Salida de balón',
    coordination: 'Coordinación general',
  };
  return sheet;
}

const WARMUP_DRAWING: ExerciseDrawingDocument = {
  version: DRAWING_DOC_VERSION,
  field: 'football-f7',
  elements: [
    zone('z1', 0.18, 0.28, 0.64, 0.44, '#22c55e'),
    material('m1', 'cone', 0.25, 0.4),
    material('m2', 'cone', 0.75, 0.4),
    material('m3', 'cone', 0.5, 0.62),
    arrow('a1', 0.35, 0.5, 0.5, 0.45),
    arrow('a2', 0.65, 0.5, 0.5, 0.45),
  ],
};

const MAIN_DRAWING: ExerciseDrawingDocument = {
  version: DRAWING_DOC_VERSION,
  field: 'football-full',
  elements: [
    zone('z1', 0.32, 0.3, 0.36, 0.4, '#3b82f6'),
    material('p1', 'player-own', 0.42, 0.42),
    material('p2', 'player-own', 0.58, 0.42),
    material('p3', 'player-rival', 0.5, 0.55),
    material('b1', 'ball', 0.5, 0.48),
    arrow('a1', 0.42, 0.42, 0.5, 0.48, DEFAULT_STROKE.color),
    arrow('a2', 0.58, 0.42, 0.5, 0.48, DEFAULT_STROKE.color),
  ],
};

const COOLDOWN_DRAWING: ExerciseDrawingDocument = {
  version: DRAWING_DOC_VERSION,
  field: 'football-half',
  elements: [
    zone('z1', 0.2, 0.35, 0.6, 0.3, '#a855f7'),
    material('c1', 'cone-pole', 0.28, 0.5),
    material('c2', 'cone-pole', 0.72, 0.5),
    arrow('a1', 0.35, 0.5, 0.65, 0.5),
  ],
};

export const DEMO_EXERCISES: DemoExerciseRecord[] = [
  {
    id: 'demo-exercise-warmup-activacion',
    title: 'Activación con conos',
    duration_min: 8,
    task_type: 'warmup',
    objectives: 'Movilidad articular y primer contacto con balón en espacio reducido.',
    notes: 'Variante demo para calentamiento.',
    sheet_json: buildSheet('warmup', 'Activación con conos', 'Movilidad y primer contacto.'),
    drawing_json: WARMUP_DRAWING,
  },
  {
    id: 'demo-exercise-main-rondo-4v2',
    title: 'Rondo 4v2 en cuadrado',
    duration_min: 18,
    task_type: 'main',
    objectives: 'Conservación, apoyos y presión coordinada en superioridad numérica.',
    notes: 'Tarea principal de posesión.',
    sheet_json: buildSheet('main', 'Rondo 4v2 en cuadrado', 'Conservación y presión.'),
    drawing_json: MAIN_DRAWING,
  },
  {
    id: 'demo-exercise-main-transicion',
    title: 'Transición 3v3+2',
    duration_min: 20,
    task_type: 'main',
    objectives: 'Ataque rápido tras recuperación y cobertura defensiva.',
    notes: 'Segunda tarea principal demo.',
    sheet_json: buildSheet('main', 'Transición 3v3+2', 'Transición ofensiva y defensiva.'),
    drawing_json: {
      version: DRAWING_DOC_VERSION,
      field: 'football-f7',
      elements: [
        zone('z1', 0.15, 0.22, 0.7, 0.56, '#ef4444'),
        material('p1', 'player-own', 0.3, 0.45),
        material('p2', 'player-own', 0.5, 0.45),
        material('p3', 'player-own', 0.7, 0.45),
        material('p4', 'player-rival', 0.4, 0.58),
        material('p5', 'player-rival', 0.6, 0.58),
        arrow('a1', 0.5, 0.45, 0.7, 0.45),
      ],
    },
  },
  {
    id: 'demo-exercise-cooldown-estiramientos',
    title: 'Vuelta a la calma guiada',
    duration_min: 6,
    task_type: 'cooldown',
    objectives: 'Bajar pulsaciones y estiramiento activo en tándem.',
    notes: 'Cierre de sesión.',
    sheet_json: buildSheet('cooldown', 'Vuelta a la calma guiada', 'Recuperación activa.'),
    drawing_json: COOLDOWN_DRAWING,
  },
];

export function getDemoExercises(): DemoExerciseRecord[] {
  return DEMO_EXERCISES;
}

export function getDemoExerciseById(id: string): DemoExerciseRecord | undefined {
  return DEMO_EXERCISES.find((exercise) => exercise.id === id);
}

export function resolveDemoExerciseDrawing(exerciseId: string | null | undefined): unknown {
  if (!exerciseId) return undefined;
  return getDemoExerciseById(exerciseId)?.drawing_json;
}
