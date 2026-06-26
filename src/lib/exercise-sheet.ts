/**
 * Plantilla de tarea — estructura UEFA / proyecto ABR.
 * Compartida entre portal web (metodología) y Synq Coach Free (slots locales).
 */

export const EXERCISE_SHEET_VERSION = 1 as const;

export type TaskType = 'warmup' | 'main' | 'cooldown';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  warmup: 'Calentamiento',
  main: 'Tarea principal',
  cooldown: 'Vuelta a la calma',
};

export type ExerciseConditionalGrid = {
  conditionalContent: string;
  time: string;
  space: string;
  gameSituation: string;
  coordination: string;
};

export type ExerciseTaskSheet = {
  templateVersion: typeof EXERCISE_SHEET_VERSION;
  taskType: TaskType;
  title: string;
  didacticStrategy: string;
  objectives: string;
  conditionalGrid: ExerciseConditionalGrid;
  technicalAction: string;
  tacticalAction: string;
  collectiveContent: string;
  description: string;
  rules: string;
  coachingCues: string;
};

export const EMPTY_CONDITIONAL_GRID: ExerciseConditionalGrid = {
  conditionalContent: '',
  time: '',
  space: '',
  gameSituation: '',
  coordination: '',
};

export function emptyExerciseSheet(taskType: TaskType = 'main'): ExerciseTaskSheet {
  return {
    templateVersion: EXERCISE_SHEET_VERSION,
    taskType,
    title: '',
    didacticStrategy: '',
    objectives: '',
    conditionalGrid: { ...EMPTY_CONDITIONAL_GRID },
    technicalAction: '',
    tacticalAction: '',
    collectiveContent: '',
    description: '',
    rules: '',
    coachingCues: '',
  };
}

export function parseExerciseSheet(raw: unknown): ExerciseTaskSheet {
  if (!raw || typeof raw !== 'object') return emptyExerciseSheet();
  const o = raw as Partial<ExerciseTaskSheet>;
  const taskType =
    o.taskType === 'warmup' || o.taskType === 'cooldown' ? o.taskType : 'main';
  const grid = o.conditionalGrid;
  return {
    templateVersion: EXERCISE_SHEET_VERSION,
    taskType,
    title: String(o.title ?? ''),
    didacticStrategy: String(o.didacticStrategy ?? ''),
    objectives: String(o.objectives ?? ''),
    conditionalGrid: {
      conditionalContent: String(grid?.conditionalContent ?? ''),
      time: String(grid?.time ?? ''),
      space: String(grid?.space ?? ''),
      gameSituation: String(grid?.gameSituation ?? ''),
      coordination: String(grid?.coordination ?? ''),
    },
    technicalAction: String(o.technicalAction ?? ''),
    tacticalAction: String(o.tacticalAction ?? ''),
    collectiveContent: String(o.collectiveContent ?? ''),
    description: String(o.description ?? ''),
    rules: String(o.rules ?? ''),
    coachingCues: String(o.coachingCues ?? ''),
  };
}

/** Migra registros antiguos (solo title/objectives/notes) al formato plantilla. */
export function legacyToSheet(data: {
  title?: string;
  objectives?: string;
  notes?: string;
  materials?: string;
  taskType?: TaskType;
}): ExerciseTaskSheet {
  const sheet = emptyExerciseSheet(data.taskType ?? 'main');
  sheet.title = data.title ?? '';
  sheet.objectives = data.objectives ?? '';
  sheet.description = data.notes ?? '';
  if (data.materials) {
    sheet.rules = `Material: ${data.materials}`;
  }
  return sheet;
}

export function parseDurationMinutes(time: string): number | null {
  const t = time.trim().toLowerCase();
  if (!t) return null;
  const direct = parseInt(t, 10);
  if (!Number.isNaN(direct) && t === String(direct)) return direct;
  const match = t.match(/(\d+)\s*(?:min|minutos|m\b|')/);
  if (match) return parseInt(match[1], 10);
  const firstNum = t.match(/\d+/);
  if (firstNum) return parseInt(firstNum[0], 10);
  return null;
}

export function sheetToLegacyFields(sheet: ExerciseTaskSheet): {
  title: string;
  objectives: string;
  notes: string;
  materials: string;
  duration_min: number;
} {
  const duration = parseDurationMinutes(sheet.conditionalGrid.time);
  return {
    title: sheet.title,
    objectives: sheet.objectives,
    notes: sheet.description,
    materials: sheet.rules,
    duration_min: duration ?? 15,
  };
}

export function sheetFromFormData(
  formData: FormData,
  fallbackTaskType: TaskType = 'main'
): ExerciseTaskSheet {
  const rawType = String(formData.get('taskType') ?? fallbackTaskType);
  const taskType: TaskType =
    rawType === 'warmup' || rawType === 'cooldown' ? rawType : 'main';
  return {
    templateVersion: EXERCISE_SHEET_VERSION,
    taskType,
    title: String(formData.get('title') ?? '').trim(),
    didacticStrategy: String(formData.get('didacticStrategy') ?? '').trim(),
    objectives: String(formData.get('objectives') ?? '').trim(),
    conditionalGrid: {
      conditionalContent: String(formData.get('conditionalContent') ?? '').trim(),
      time: String(formData.get('time') ?? '').trim(),
      space: String(formData.get('space') ?? '').trim(),
      gameSituation: String(formData.get('gameSituation') ?? '').trim(),
      coordination: String(formData.get('coordination') ?? '').trim(),
    },
    technicalAction: String(formData.get('technicalAction') ?? '').trim(),
    tacticalAction: String(formData.get('tacticalAction') ?? '').trim(),
    collectiveContent: String(formData.get('collectiveContent') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    rules: String(formData.get('rules') ?? '').trim(),
    coachingCues: String(formData.get('coachingCues') ?? '').trim(),
  };
}

export function sheetFromExerciseRow(row: {
  title: string;
  objectives: string;
  notes: string;
  materials: string;
  sheet_json?: unknown;
  task_type?: string;
}): ExerciseTaskSheet {
  const parsed = parseExerciseSheet(row.sheet_json);
  if (parsed.title) return parsed;
  return legacyToSheet({
    title: row.title,
    objectives: row.objectives,
    notes: row.notes,
    materials: row.materials,
    taskType:
      row.task_type === 'warmup' || row.task_type === 'cooldown'
        ? row.task_type
        : 'main',
  });
}

export function sheetFromSlotRow(slot: {
  slot_type: string;
  title: string;
  notes: string;
  sheet_json?: unknown;
}): ExerciseTaskSheet {
  const taskType: TaskType =
    slot.slot_type === 'warmup' || slot.slot_type === 'cooldown'
      ? slot.slot_type
      : 'main';
  const parsed = parseExerciseSheet(slot.sheet_json);
  if (parsed.title) {
    parsed.taskType = taskType;
    return parsed;
  }
  return legacyToSheet({
    title: slot.title,
    objectives: '',
    notes: slot.notes,
    taskType,
  });
}

export function sheetPdfFilename(title: string): string {
  const base = (title || 'ficha')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'ficha';
}

export const SHEET_FIELD_LABELS = {
  title: 'Título',
  didacticStrategy: 'Estrategia didáctica',
  objectives: 'Objetivos',
  conditionalContent: 'Contenido condicional',
  time: 'Tiempo',
  space: 'Espacio',
  gameSituation: 'Situación de juego',
  coordination: 'Coordinación',
  technicalAction: 'Acción técnica / habilidad coordinativa',
  tacticalAction: 'Acción táctica / intención',
  collectiveContent: 'Contenido de juego colectivo',
  description: 'Descripción',
  rules: 'Normas de provocación / normativa',
  coachingCues: 'Consignas',
} as const;
