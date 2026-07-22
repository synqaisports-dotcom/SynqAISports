import {
  DEFAULT_ELEMENT_OPACITY,
  createElementId,
  sortElementsByLayer,
  type DrawingElement,
  type FieldTemplate,
  type MaterialElement,
} from '@/lib/exercise-drawing';

export type FormationFieldGroup = 'f11' | 'f7' | 'futsal' | 'half';

/** Coordenadas locales del equipo: profundidad 0 = portería propia, 1 = línea de medio campo. */
type TeamLocalSlot = {
  depth: number;
  lane: number;
  label: string;
};

export type FormationPreset = {
  id: string;
  label: string;
  slots: TeamLocalSlot[];
};

export type DrawingFormations = {
  home: string | null;
  away: string | null;
  homePhase?: TacticalPhaseIndex;
  awayPhase?: TacticalPhaseIndex;
};

export const FORMATION_NONE_ID = 'none';

/** Porterías a izquierda/derecha (F11, F7, sala). */
type HorizontalLayout = {
  kind: 'horizontal';
  home: { xMin: number; xMax: number; rotation: number };
  away: { xMin: number; xMax: number; rotation: number };
};

/** Medio campo: portería arriba, línea media abajo. */
type VerticalHalfLayout = {
  kind: 'vertical-half';
  home: { xMin: number; xMax: number; yMin: number; yMax: number; rotation: number };
  away: { xMin: number; xMax: number; yMin: number; yMax: number; rotation: number };
};

const HORIZONTAL_LAYOUT: HorizontalLayout = {
  kind: 'horizontal',
  home: { xMin: 0.05, xMax: 0.47, rotation: 90 },
  away: { xMin: 0.53, xMax: 0.95, rotation: -90 },
};

const VERTICAL_HALF_LAYOUT: VerticalHalfLayout = {
  kind: 'vertical-half',
  home: { xMin: 0.06, xMax: 0.44, yMin: 0.1, yMax: 0.88, rotation: 180 },
  away: { xMin: 0.56, xMax: 0.94, yMin: 0.1, yMax: 0.88, rotation: 180 },
};

function depthLine(depth: number, labels: string[], inset = 0.12): TeamLocalSlot[] {
  const count = labels.length;
  const span = 1 - inset * 2;
  return labels.map((label, index) => ({
    depth,
    lane: inset + (span * (index + 0.5)) / count,
    label,
  }));
}

function withKeeper(slots: TeamLocalSlot[], keeperDepth = 0.04): TeamLocalSlot[] {
  return [{ depth: keeperDepth, lane: 0.5, label: '1' }, ...slots];
}

/** Profundidades de línea con más separación entre defensa, medio y delantera. */
const LINE = {
  def: 0.18,
  mid2: 0.42,
  mid: 0.54,
  mid3: 0.62,
  fwd: 0.84,
  fwdSt: 0.88,
} as const;

export const FORMATIONS_BY_GROUP: Record<FormationFieldGroup, FormationPreset[]> = {
  f11: [
    {
      id: '442',
      label: '4-4-2',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3', '4', '5']),
        ...depthLine(LINE.mid, ['6', '7', '8', '9']),
        ...depthLine(LINE.fwd, ['10', '11']),
      ]),
    },
    {
      id: '433',
      label: '4-3-3',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3', '4', '5']),
        ...depthLine(LINE.mid2, ['6', '8', '10']),
        ...depthLine(LINE.fwd, ['7', '9', '11']),
      ]),
    },
    {
      id: '352',
      label: '3-5-2',
      slots: withKeeper([
        ...depthLine(LINE.def, ['3', '4', '5'], 0.22),
        ...depthLine(LINE.mid, ['2', '6', '8', '10', '7'], 0.08),
        ...depthLine(LINE.fwd, ['9', '11']),
      ]),
    },
    {
      id: '4231',
      label: '4-2-3-1',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3', '4', '5']),
        ...depthLine(LINE.mid2, ['6', '8']),
        ...depthLine(LINE.mid3, ['7', '10', '11']),
        ...depthLine(LINE.fwdSt, ['9']),
      ]),
    },
    {
      id: '343',
      label: '3-4-3',
      slots: withKeeper([
        ...depthLine(LINE.def, ['3', '4', '5'], 0.22),
        ...depthLine(LINE.mid2, ['2', '6', '8', '7']),
        ...depthLine(LINE.fwd, ['9', '10', '11']),
      ]),
    },
  ],
  f7: [
    {
      id: '321',
      label: '3-2-1',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3', '4'], 0.18),
        ...depthLine(LINE.mid, ['5', '6']),
        ...depthLine(LINE.fwd, ['7']),
      ]),
    },
    {
      id: '231',
      label: '2-3-1',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3'], 0.28),
        ...depthLine(LINE.mid, ['4', '5', '6']),
        ...depthLine(LINE.fwd, ['7']),
      ]),
    },
    {
      id: '222',
      label: '2-2-2',
      slots: withKeeper([
        ...depthLine(LINE.def, ['2', '3'], 0.28),
        ...depthLine(LINE.mid, ['4', '5']),
        ...depthLine(LINE.fwd, ['6', '7']),
      ]),
    },
  ],
  futsal: [
    {
      id: '121',
      label: '1-2-1',
      slots: withKeeper([
        ...depthLine(0.2, ['2', '3'], 0.28),
        ...depthLine(LINE.mid, ['4']),
        ...depthLine(LINE.fwd, ['5']),
      ]),
    },
    {
      id: '211',
      label: '2-1-1',
      slots: withKeeper([
        ...depthLine(0.2, ['2', '3'], 0.28),
        ...depthLine(LINE.mid2, ['4']),
        ...depthLine(LINE.fwd, ['5']),
      ]),
    },
    {
      id: '112',
      label: '1-1-2',
      slots: withKeeper([
        ...depthLine(0.2, ['2'], 0.38),
        ...depthLine(LINE.mid2, ['3']),
        ...depthLine(LINE.fwd, ['4', '5'], 0.28),
      ]),
    },
    {
      id: '22',
      label: '2-2',
      slots: withKeeper([
        ...depthLine(0.22, ['2', '3'], 0.28),
        ...depthLine(LINE.fwd, ['4', '5'], 0.28),
      ]),
    },
  ],
  half: [
    {
      id: 'half-442',
      label: '4-1',
      slots: withKeeper([
        ...depthLine(0.26, ['2', '3', '4', '5']),
        ...depthLine(0.78, ['6']),
      ]),
    },
    {
      id: 'half-321',
      label: '3-2',
      slots: withKeeper([
        ...depthLine(0.26, ['2', '3', '4'], 0.18),
        ...depthLine(0.78, ['5', '6']),
      ]),
    },
    {
      id: 'half-41',
      label: '4',
      slots: withKeeper([...depthLine(0.62, ['2', '3', '4', '5'])]),
    },
  ],
};

export function formationGroupForField(field: FieldTemplate): FormationFieldGroup | null {
  switch (field) {
    case 'football-full':
      return 'f11';
    case 'football-f7':
      return 'f7';
    case 'futsal':
      return 'futsal';
    case 'football-half':
      return 'half';
    default:
      return null;
  }
}

export function formationLayoutForField(
  field: FieldTemplate
): HorizontalLayout | VerticalHalfLayout | null {
  const group = formationGroupForField(field);
  if (!group) return null;
  return field === 'football-half' ? VERTICAL_HALF_LAYOUT : HORIZONTAL_LAYOUT;
}

export function formationsForField(field: FieldTemplate): FormationPreset[] {
  const group = formationGroupForField(field);
  return group ? FORMATIONS_BY_GROUP[group] : [];
}

export function findFormation(group: FormationFieldGroup, id: string): FormationPreset | undefined {
  return FORMATIONS_BY_GROUP[group].find((formation) => formation.id === id);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Convierte slot local → coordenadas de campo + rotación hacia la portería rival. */
export function teamSlotToField(
  slot: TeamLocalSlot,
  side: 'home' | 'away',
  field: FieldTemplate
): { x: number; y: number; rotation: number } {
  const layout = formationLayoutForField(field);
  if (!layout) {
    return { x: 0.5, y: 0.5, rotation: 0 };
  }

  const depth = clamp01(slot.depth);
  const lane = clamp01(slot.lane);

  if (layout.kind === 'horizontal') {
    const team = side === 'home' ? layout.home : layout.away;
    const xSpan = team.xMax - team.xMin;
    const x =
      side === 'home'
        ? team.xMin + depth * xSpan
        : team.xMax - depth * xSpan;
    return { x: clamp01(x), y: lane, rotation: team.rotation };
  }

  const team = side === 'home' ? layout.home : layout.away;
  const x = team.xMin + lane * (team.xMax - team.xMin);
  const y = team.yMin + depth * (team.yMax - team.yMin);
  return { x: clamp01(x), y: clamp01(y), rotation: team.rotation };
}

function createPlayerElement(
  material: 'player-own' | 'player-rival',
  slot: TeamLocalSlot,
  side: 'home' | 'away',
  field: FieldTemplate
): MaterialElement {
  const { x, y, rotation } = teamSlotToField(slot, side, field);
  return {
    id: createElementId(),
    type: 'material',
    material,
    x,
    y,
    rotation,
    scale: 1,
    label: slot.label,
    opacity: DEFAULT_ELEMENT_OPACITY,
  };
}

export function applyFormationToElements(
  elements: DrawingElement[],
  side: 'home' | 'away',
  formationId: string | null,
  group: FormationFieldGroup | null,
  field: FieldTemplate
): DrawingElement[] {
  const material = side === 'home' ? 'player-own' : 'player-rival';
  const withoutTeam = elements.filter(
    (el) => !(el.type === 'material' && el.material === material)
  );

  if (!formationId || formationId === FORMATION_NONE_ID || !group) {
    return withoutTeam;
  }

  const formation = findFormation(group, formationId);
  if (!formation) return withoutTeam;

  const players = formation.slots.map((slot) =>
    createPlayerElement(material, slot, side, field)
  );
  return sortElementsByLayer([...withoutTeam, ...players]);
}

export function normalizeDrawingFormations(
  raw: unknown,
  field: FieldTemplate
): DrawingFormations | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const group = formationGroupForField(field);
  if (!group) return undefined;

  const validIds = new Set(FORMATIONS_BY_GROUP[group].map((formation) => formation.id));
  const parseSide = (value: unknown): string | null => {
    if (value === null) return null;
    if (typeof value !== 'string') return null;
    if (value === FORMATION_NONE_ID) return null;
    return validIds.has(value) ? value : null;
  };

  return {
    home: parseSide(obj.home),
    away: parseSide(obj.away),
    homePhase: parsePhase(obj.homePhase),
    awayPhase: parsePhase(obj.awayPhase),
  };
}

function parsePhase(value: unknown): TacticalPhaseIndex | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) return undefined;
  if (value < 0 || value >= TACTICAL_ANIMATION_PHASE_COUNT) return undefined;
  return value as TacticalPhaseIndex;
}

export function sanitizeFormationsForField(
  formations: DrawingFormations | undefined,
  field: FieldTemplate
): DrawingFormations | undefined {
  if (!formations) return undefined;
  const group = formationGroupForField(field);
  if (!group) return undefined;
  const validIds = new Set(FORMATIONS_BY_GROUP[group].map((formation) => formation.id));
  const keep = (id: string | null) => (id && validIds.has(id) ? id : null);
  const next = { home: keep(formations.home), away: keep(formations.away) };
  if (!next.home && !next.away) return undefined;
  return next;
}

/** Reaplica formaciones guardadas (p. ej. tras cambiar de campo). */
export function reapplyStoredFormations(
  elements: DrawingElement[],
  formations: DrawingFormations | undefined,
  field: FieldTemplate
): DrawingElement[] {
  const group = formationGroupForField(field);
  if (!group || !formations) return elements;
  let next = elements;
  if (formations.home) {
    next = applyFormationToElements(next, 'home', formations.home, group, field);
  }
  if (formations.away) {
    next = applyFormationToElements(next, 'away', formations.away, group, field);
  }
  return next;
}

export const TACTICAL_ANIMATION_PHASE_COUNT = 4 as const;

export const TACTICAL_SCENE_LABELS = ['Salida', 'Def→Ataq', 'Ataq→Def', 'Ataque'] as const;

export const TACTICAL_TRANSITION_MS = 1200;

export type TacticalPhaseIndex = 0 | 1 | 2 | 3;

/**
 * Progresión táctica en el medio campo del equipo:
 * 0 = línea roja (salida, cerca de portería propia)
 * 1 = línea azul (ataque, cerca del medio campo)
 */
const PHASE_PROGRESS: Record<TacticalPhaseIndex, number> = {
  0: 0,
  1: 0.58,
  2: 0.32,
  3: 1,
};

function lerpNum(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function phaseDepth(baseDepth: number, phase: TacticalPhaseIndex, isKeeper: boolean): number {
  const progress = PHASE_PROGRESS[phase];
  if (isKeeper) {
    return lerpNum(0.04, 0.14, progress);
  }
  const salidaDepth = baseDepth * 0.28 + 0.03;
  const ataqueDepth = baseDepth * 0.38 + 0.55;
  return clamp01(lerpNum(salidaDepth, ataqueDepth, progress));
}

function shiftManualPlayersForPhase(
  players: DrawingElement[],
  field: FieldTemplate,
  phase: TacticalPhaseIndex,
  fromPhase: TacticalPhaseIndex = 0
): DrawingElement[] {
  if (phase === fromPhase) return players;
  const layout = formationLayoutForField(field);
  const fromProgress = PHASE_PROGRESS[fromPhase];
  const toProgress = PHASE_PROGRESS[phase];
  const delta = toProgress - fromProgress;

  return players.map((el) => {
    if (!isTeamPlayer(el)) return el;
    const isKeeper = el.label === '1';
    const amount = delta * (isKeeper ? 0.3 : 1);

    if (layout?.kind === 'horizontal') {
      const span =
        el.material === 'player-own'
          ? layout.home.xMax - layout.home.xMin
          : layout.away.xMax - layout.away.xMin;
      const dx = el.material === 'player-own' ? amount * span : -amount * span;
      return { ...el, x: clamp01(el.x + dx) };
    }

    if (layout?.kind === 'vertical-half') {
      const span = layout.home.yMax - layout.home.yMin;
      return { ...el, y: clamp01(el.y + amount * span) };
    }

    return el;
  });
}

export function hasTacticalFormationSetup(formations: DrawingFormations | undefined): boolean {
  return Boolean(formations?.home || formations?.away);
}

function isTeamPlayer(el: DrawingElement): el is MaterialElement {
  return (
    el.type === 'material' &&
    (el.material === 'player-own' || el.material === 'player-rival')
  );
}

function buildTeamPlayersForPhase(
  elements: DrawingElement[],
  formation: FormationPreset,
  material: 'player-own' | 'player-rival',
  side: 'home' | 'away',
  field: FieldTemplate,
  phase: TacticalPhaseIndex
): MaterialElement[] {
  const existingByLabel = new Map(
    elements
      .filter((el): el is MaterialElement => el.type === 'material' && el.material === material)
      .map((el) => [el.label ?? el.id, el] as const)
  );

  return formation.slots.map((slot) => {
    const isKeeper = slot.label === '1';
    const adjusted: TeamLocalSlot = {
      ...slot,
      depth: phaseDepth(slot.depth, phase, isKeeper),
    };
    const pos = teamSlotToField(adjusted, side, field);
    const existing = existingByLabel.get(slot.label);
    if (existing) {
      return { ...existing, x: pos.x, y: pos.y, rotation: pos.rotation };
    }
    return createPlayerElement(material, adjusted, side, field);
  });
}

/** Genera elementos de una fase táctica (salida, transiciones, ataque). */
export function buildTacticalPhaseElements(
  elements: DrawingElement[],
  formations: DrawingFormations | undefined,
  field: FieldTemplate,
  phase: TacticalPhaseIndex
): DrawingElement[] {
  const group = formationGroupForField(field);
  const staticElements = elements.filter((el) => !isTeamPlayer(el));

  if (!formations || !group) {
    const players = shiftManualPlayersForPhase(
      elements.filter(isTeamPlayer),
      field,
      phase
    );
    return sortElementsByLayer([...staticElements, ...players]);
  }

  const players: DrawingElement[] = [];

  for (const side of ['home', 'away'] as const) {
    const formationId = formations[side];
    const material = side === 'home' ? 'player-own' : 'player-rival';

    if (formationId) {
      const formation = findFormation(group, formationId);
      if (formation) {
        for (const slot of formation.slots) {
          const isKeeper = slot.label === '1';
          const adjusted: TeamLocalSlot = {
            ...slot,
            depth: phaseDepth(slot.depth, phase, isKeeper),
          };
          players.push(createPlayerElement(material, adjusted, side, field));
        }
        continue;
      }
    }

    const manual = elements.filter(
      (el) => el.type === 'material' && el.material === material
    );
    players.push(...shiftManualPlayersForPhase(manual, field, phase));
  }

  return sortElementsByLayer([...staticElements, ...players]);
}

/** Aplica una fase táctica solo a un equipo (local o visitante). */
export function applyTeamTacticalPhase(
  elements: DrawingElement[],
  formations: DrawingFormations | undefined,
  field: FieldTemplate,
  side: 'home' | 'away',
  phase: TacticalPhaseIndex
): DrawingElement[] {
  const group = formationGroupForField(field);
  const material = side === 'home' ? 'player-own' : 'player-rival';
  const otherMaterial = side === 'home' ? 'player-rival' : 'player-own';

  const staticElements = elements.filter(
    (el) =>
      !(
        el.type === 'material' &&
        (el.material === material || el.material === otherMaterial)
      )
  );
  const otherPlayers = elements.filter(
    (el) => el.type === 'material' && el.material === otherMaterial
  );

  const formationId = formations?.[side] ?? null;

  if (formationId && group) {
    const formation = findFormation(group, formationId);
    if (formation) {
      const players = buildTeamPlayersForPhase(
        elements,
        formation,
        material,
        side,
        field,
        phase
      );
      return sortElementsByLayer([...staticElements, ...otherPlayers, ...players]);
    }
  }

  const manual = elements.filter((el) => el.type === 'material' && el.material === material);
  const fromPhase = (formations?.[side === 'home' ? 'homePhase' : 'awayPhase'] ?? 0) as TacticalPhaseIndex;
  const shifted = shiftManualPlayersForPhase(manual, field, phase, fromPhase);
  return sortElementsByLayer([...staticElements, ...otherPlayers, ...shifted]);
}
