import type { MethodologyLibraryTaskInsert, MethodologyLibraryTaskRow } from '@/lib/supabase';

/** Contrato UI alineado con `exercise-library/page.tsx` (borrador local). */
export type MethodologyLibraryEntryInput = {
  id?: string;
  /** Solo para POST como superadmin si el perfil no tiene club_id */
  club_id?: string;
  status?: 'Draft' | 'Official';
  stage: string;
  dimension: string;
  title: string;
  authorName: string;
  didacticStrategy?: string;
  objectives?: string;
  conditionalContent?: string;
  time?: string;
  space?: string;
  gameSituation?: string;
  technicalAction?: string;
  tacticalAction?: string;
  collectiveContent?: string;
  description?: string;
  provocationRules?: string;
  instructions?: string;
  equipment?: string;
  photoUrl?: string;
  elements?: unknown[];
  board?: { fieldType?: string; showLanes?: boolean; isHalfField?: boolean };
  boardCoordSpace?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

export function methodologyTaskRowToEntry(row: MethodologyLibraryTaskRow) {
  return {
    id: row.id,
    savedAt: row.created_at,
    status: row.status as 'Draft' | 'Official',
    stage: row.stage,
    dimension: row.dimension,
    title: row.title,
    authorName: row.author_name ?? '',
    didacticStrategy: row.didactic_strategy ?? undefined,
    objectives: row.objectives ?? undefined,
    conditionalContent: row.conditional_content ?? undefined,
    time: row.time ?? undefined,
    space: row.space ?? undefined,
    gameSituation: row.game_situation ?? undefined,
    technicalAction: row.technical_action ?? undefined,
    tacticalAction: row.tactical_action ?? undefined,
    collectiveContent: row.collective_content ?? undefined,
    description: row.description ?? undefined,
    provocationRules: row.provocation_rules ?? undefined,
    instructions: row.instructions ?? undefined,
    equipment: row.equipment ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    elements: Array.isArray(row.elements) ? row.elements : undefined,
    board:
      row.board && typeof row.board === 'object'
        ? {
            fieldType: typeof row.board.fieldType === 'string' ? row.board.fieldType : undefined,
            showLanes: typeof row.board.showLanes === 'boolean' ? row.board.showLanes : undefined,
            isHalfField: typeof row.board.isHalfField === 'boolean' ? row.board.isHalfField : undefined,
          }
        : undefined,
    boardCoordSpace: row.board_coord_space,
    updatedAt: row.updated_at,
  };
}

export function methodologyEntryToInsert(
  clubId: string,
  authorId: string,
  input: MethodologyLibraryEntryInput,
): MethodologyLibraryTaskInsert {
  const insert: MethodologyLibraryTaskInsert = {
    club_id: clubId,
    author_id: authorId,
    status: input.status ?? 'Draft',
    stage: input.stage,
    dimension: input.dimension,
    title: input.title,
    author_name: input.authorName,
    didactic_strategy: input.didacticStrategy ?? null,
    objectives: input.objectives ?? null,
    conditional_content: input.conditionalContent ?? null,
    time: input.time ?? null,
    space: input.space ?? null,
    game_situation: input.gameSituation ?? null,
    technical_action: input.technicalAction ?? null,
    tactical_action: input.tacticalAction ?? null,
    collective_content: input.collectiveContent ?? null,
    description: input.description ?? null,
    provocation_rules: input.provocationRules ?? null,
    instructions: input.instructions ?? null,
    equipment: input.equipment ?? null,
    photo_url: input.photoUrl ?? null,
    elements: input.elements ?? [],
    board: {
      fieldType: input.board?.fieldType,
      showLanes: input.board?.showLanes,
      isHalfField: input.board?.isHalfField,
    },
    board_coord_space: input.boardCoordSpace ?? 'canvas_normalized_v1',
  };
  if (input.id && isUuid(input.id)) {
    insert.id = input.id;
  }
  return insert;
}

export function methodologyEntryToUpdate(
  input: Partial<MethodologyLibraryEntryInput>,
): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (input.status !== undefined) u.status = input.status;
  if (input.stage !== undefined) u.stage = input.stage;
  if (input.dimension !== undefined) u.dimension = input.dimension;
  if (input.title !== undefined) u.title = input.title;
  if (input.authorName !== undefined) u.author_name = input.authorName;
  if (input.didacticStrategy !== undefined) u.didactic_strategy = input.didacticStrategy;
  if (input.objectives !== undefined) u.objectives = input.objectives;
  if (input.conditionalContent !== undefined) u.conditional_content = input.conditionalContent;
  if (input.time !== undefined) u.time = input.time;
  if (input.space !== undefined) u.space = input.space;
  if (input.gameSituation !== undefined) u.game_situation = input.gameSituation;
  if (input.technicalAction !== undefined) u.technical_action = input.technicalAction;
  if (input.tacticalAction !== undefined) u.tactical_action = input.tacticalAction;
  if (input.collectiveContent !== undefined) u.collective_content = input.collectiveContent;
  if (input.description !== undefined) u.description = input.description;
  if (input.provocationRules !== undefined) u.provocation_rules = input.provocationRules;
  if (input.instructions !== undefined) u.instructions = input.instructions;
  if (input.equipment !== undefined) u.equipment = input.equipment;
  if (input.photoUrl !== undefined) u.photo_url = input.photoUrl;
  if (input.elements !== undefined) u.elements = input.elements;
  if (input.board !== undefined) {
    u.board = {
      fieldType: input.board.fieldType,
      showLanes: input.board.showLanes,
      isHalfField: input.board.isHalfField,
    };
  }
  if (input.boardCoordSpace !== undefined) u.board_coord_space = input.boardCoordSpace;
  return u;
}
