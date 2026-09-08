import {
  DEFAULT_ELEMENT_OPACITY,
  createElementId,
  sortElementsByLayer,
  type DrawingElement,
  type FieldTemplate,
  type MaterialElement,
} from '@/lib/exercise-drawing';

export type FormationFieldGroup = 'f11' | 'f7' | 'futsal' | 'half';

/** Rol táctico de la línea (referencia: franjas 0–20 del campo). */
type TacticalLineRole = 'gk' | 'def' | 'defWide' | 'mid' | 'midHigh' | 'fwd';

/** Coordenadas locales del equipo: profundidad 0 = portería propia, 1 = línea de medio campo. */
type TeamLocalSlot = {
  depth: number;
  lane: number;
  label: string;
  line: TacticalLineRole;
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

function depthLine(
  line: TacticalLineRole,
  depth: number,
  labels: string[],
  inset = 0.12,
  wideEnds = false
): TeamLocalSlot[] {
  const count = labels.length;
  const span = 1 - inset * 2;
  return labels.map((label, index) => {
    const isWide = wideEnds && count >= 3 && (index === 0 || index === count - 1);
    const role: TacticalLineRole = isWide && line === 'def' ? 'defWide' : line;
    return {
      depth,
      lane: inset + (span * (index + 0.5)) / count,
      label,
      line: role,
    };
  });
}

function withKeeper(slots: TeamLocalSlot[]): TeamLocalSlot[] {
  return [{ depth: 0.04, lane: 0.5, label: '1', line: 'gk' }, ...slots];
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
        ...depthLine('def', LINE.def, ['2', '3', '4', '5'], 0.12, true),
        ...depthLine('mid', LINE.mid, ['6', '7', '8', '9']),
        ...depthLine('fwd', LINE.fwd, ['10', '11']),
      ]),
    },
    {
      id: '433',
      label: '4-3-3',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['2', '3', '4', '5'], 0.12, true),
        ...depthLine('mid', LINE.mid2, ['6', '8', '10']),
        ...depthLine('fwd', LINE.fwd, ['7', '9', '11']),
      ]),
    },
    {
      id: '352',
      label: '3-5-2',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['3', '4', '5'], 0.22, true),
        ...depthLine('mid', LINE.mid, ['2', '6', '8', '10', '7'], 0.08),
        ...depthLine('fwd', LINE.fwd, ['9', '11']),
      ]),
    },
    {
      id: '4231',
      label: '4-2-3-1',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['2', '3', '4', '5'], 0.12, true),
        ...depthLine('mid', LINE.mid2, ['6', '8']),
        ...depthLine('midHigh', LINE.mid3, ['7', '10', '11']),
        ...depthLine('fwd', LINE.fwdSt, ['9']),
      ]),
    },
    {
      id: '343',
      label: '3-4-3',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['3', '4', '5'], 0.22, true),
        ...depthLine('mid', LINE.mid2, ['2', '6', '8', '7']),
        ...depthLine('fwd', LINE.fwd, ['9', '10', '11']),
      ]),
    },
  ],
  f7: [
    {
      id: '321',
      label: '3-2-1',
      slots: [
        { depth: LINE.def, lane: 0.5, label: '1', line: 'gk' },
        { depth: LINE.def, lane: 0.1, label: '2', line: 'defWide' },
        { depth: LINE.def, lane: 0.5, label: '3', line: 'def' },
        { depth: LINE.def, lane: 0.9, label: '4', line: 'defWide' },
        { depth: LINE.mid, lane: 0.34, label: '5', line: 'mid' },
        { depth: LINE.mid, lane: 0.66, label: '6', line: 'mid' },
        { depth: LINE.fwd, lane: 0.5, label: '7', line: 'fwd' },
      ],
    },
    {
      id: '231',
      label: '2-3-1',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['2', '3'], 0.28, true),
        ...depthLine('mid', LINE.mid, ['4', '5', '6']),
        ...depthLine('fwd', LINE.fwd, ['7']),
      ]),
    },
    {
      id: '222',
      label: '2-2-2',
      slots: withKeeper([
        ...depthLine('def', LINE.def, ['2', '3'], 0.28, true),
        ...depthLine('mid', LINE.mid, ['4', '5']),
        ...depthLine('fwd', LINE.fwd, ['6', '7']),
      ]),
    },
  ],
  futsal: [
    {
      id: '121',
      label: '1-2-1',
      slots: withKeeper([
        ...depthLine('def', 0.2, ['2', '3'], 0.28, true),
        ...depthLine('mid', LINE.mid, ['4']),
        ...depthLine('fwd', LINE.fwd, ['5']),
      ]),
    },
    {
      id: '211',
      label: '2-1-1',
      slots: withKeeper([
        ...depthLine('def', 0.2, ['2', '3'], 0.28, true),
        ...depthLine('mid', LINE.mid2, ['4']),
        ...depthLine('fwd', LINE.fwd, ['5']),
      ]),
    },
    {
      id: '112',
      label: '1-1-2',
      slots: withKeeper([
        ...depthLine('def', 0.2, ['2'], 0.38),
        ...depthLine('mid', LINE.mid2, ['3']),
        ...depthLine('fwd', LINE.fwd, ['4', '5'], 0.28),
      ]),
    },
    {
      id: '22',
      label: '2-2',
      slots: withKeeper([
        ...depthLine('def', 0.22, ['2', '3'], 0.28, true),
        ...depthLine('fwd', LINE.fwd, ['4', '5'], 0.28),
      ]),
    },
  ],
  half: [
    {
      id: 'half-442',
      label: '4-1',
      slots: withKeeper([
        ...depthLine('def', 0.26, ['2', '3', '4', '5']),
        ...depthLine('fwd', 0.78, ['6']),
      ]),
    },
    {
      id: 'half-321',
      label: '3-2',
      slots: withKeeper([
        ...depthLine('def', 0.26, ['2', '3', '4'], 0.18, true),
        ...depthLine('mid', 0.78, ['5', '6']),
      ]),
    },
    {
      id: 'half-41',
      label: '4',
      slots: withKeeper([...depthLine('mid', 0.62, ['2', '3', '4', '5'])]),
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

/** Campo dividido en 20 franjas verticales (referencia visual del usuario). */
const FIELD_STRIPE_COUNT = 20;

/**
 * Posición longitudinal por rol y fase (franja / 20 = x en campo completo).
 * Calibrado con F7 3-2-1: Salida, Def→Ataq, Atq→Def y Ataque.
 */
const HORIZONTAL_TACTICAL_STRIPE: Record<
  TacticalPhaseIndex,
  Record<TacticalLineRole, number>
> = {
  /** Salida: bloque en tercio propio, líneas separadas, sin llegar al centro. */
  0: { gk: 1, def: 3, defWide: 4, mid: 6, midHigh: 6.5, fwd: 8 },
  1: { gk: 1.6, def: 3.6, defWide: 8.2, mid: 6.4, midHigh: 7.5, fwd: 10.6 },
  2: { gk: 0.6, def: 5, defWide: 5, mid: 10, midHigh: 10, fwd: 12 },
  3: { gk: 3, def: 9, defWide: 11, mid: 14, midHigh: 15, fwd: 17 },
};

/** Medio campo: franjas 0–10 cubren el semicampo propio (10 = línea media). */
const VERTICAL_TACTICAL_STRIPE: Record<
  TacticalPhaseIndex,
  Record<TacticalLineRole, number>
> = {
  0: { gk: 0.5, def: 1.5, defWide: 2, mid: 3, midHigh: 3.25, fwd: 4 },
  1: { gk: 0.8, def: 1.8, defWide: 4.1, mid: 3.2, midHigh: 3.75, fwd: 5.3 },
  2: { gk: 0.3, def: 2.5, defWide: 2.5, mid: 5, midHigh: 5, fwd: 6 },
  3: { gk: 1.5, def: 4.5, defWide: 5.5, mid: 7, midHigh: 7.5, fwd: 8.5 },
};

function stripeForPhase(line: TacticalLineRole, phase: TacticalPhaseIndex, field: FieldTemplate): number {
  const table =
    field === 'football-half' ? VERTICAL_TACTICAL_STRIPE : HORIZONTAL_TACTICAL_STRIPE;
  return table[phase][line];
}

function stripeToFieldX(stripe: number, side: 'home' | 'away', field: FieldTemplate): number {
  if (field === 'football-half') {
    return stripe / 10;
  }
  const x = stripe / FIELD_STRIPE_COUNT;
  return side === 'home' ? clamp01(x) : clamp01(1 - x);
}

function resolveTacticalLane(slot: TeamLocalSlot): number {
  if (slot.line === 'defWide') {
    return slot.lane < 0.5 ? 0.1 : 0.9;
  }
  return clamp01(slot.lane);
}

/** Posición táctica absoluta en campo (mantiene proporción entre líneas por fase). */
function tacticalSlotToField(
  slot: TeamLocalSlot,
  phase: TacticalPhaseIndex,
  side: 'home' | 'away',
  field: FieldTemplate
): { x: number; y: number; rotation: number } {
  const layout = formationLayoutForField(field);
  if (!layout) {
    return { x: 0.5, y: 0.5, rotation: 0 };
  }

  const lane = resolveTacticalLane(slot);
  const stripe = stripeForPhase(slot.line, phase, field);

  if (layout.kind === 'horizontal') {
    const team = side === 'home' ? layout.home : layout.away;
    return { x: stripeToFieldX(stripe, side, field), y: lane, rotation: team.rotation };
  }

  const team = side === 'home' ? layout.home : layout.away;
  const x = team.xMin + lane * (team.xMax - team.xMin);
  const ySpan = team.yMax - team.yMin;
  const y = team.yMin + stripeToFieldX(stripe, side, field) * ySpan;
  return { x: clamp01(x), y: clamp01(y), rotation: team.rotation };
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

  const depth = slot.depth;
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

  const players = formation.slots.map((slot) => {
    const pos = tacticalSlotToField(slot, 0, side, field);
    return {
      ...createPlayerElement(material, slot, side, field),
      x: pos.x,
      y: pos.y,
      rotation: pos.rotation,
    };
  });
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

/** Reaplica formaciones guardadas respetando la fase táctica activa de cada equipo. */
export function reapplyStoredFormations(
  elements: DrawingElement[],
  formations: DrawingFormations | undefined,
  field: FieldTemplate
): DrawingElement[] {
  if (!formations) return elements;
  let next = elements;
  if (formations.home) {
    const phase = (formations.homePhase ?? 0) as TacticalPhaseIndex;
    next = applyTeamTacticalPhase(next, formations, field, 'home', phase);
  }
  if (formations.away) {
    const phase = (formations.awayPhase ?? 0) as TacticalPhaseIndex;
    next = applyTeamTacticalPhase(next, formations, field, 'away', phase);
  }
  return next;
}

export const TACTICAL_ANIMATION_PHASE_COUNT = 4 as const;

export const TACTICAL_SCENE_LABELS = ['Salida', 'Def→Ataq', 'Ataq→Def', 'Ataque'] as const;

export const TACTICAL_TRANSITION_MS = 1200;

export type TacticalPhaseIndex = 0 | 1 | 2 | 3;

function manualPhaseDeltaX(
  fromPhase: TacticalPhaseIndex,
  toPhase: TacticalPhaseIndex,
  field: FieldTemplate
): number {
  const table =
    field === 'football-half' ? VERTICAL_TACTICAL_STRIPE : HORIZONTAL_TACTICAL_STRIPE;
  const stripeDelta = table[toPhase].def - table[fromPhase].def;
  const scale = field === 'football-half' ? 10 : FIELD_STRIPE_COUNT;
  return stripeDelta / scale;
}

function shiftManualPlayersForPhase(
  players: DrawingElement[],
  field: FieldTemplate,
  phase: TacticalPhaseIndex,
  fromPhase: TacticalPhaseIndex = 0
): DrawingElement[] {
  if (phase === fromPhase) return players;
  const layout = formationLayoutForField(field);
  const deltaX = manualPhaseDeltaX(fromPhase, phase, field);

  return players.map((el) => {
    if (!isTeamPlayer(el)) return el;
    const isKeeper = el.label === '1';
    const amount = deltaX * (isKeeper ? 0.3 : 1);

    if (layout?.kind === 'horizontal') {
      const dx = el.material === 'player-own' ? amount : -amount;
      return { ...el, x: clamp01(el.x + dx) };
    }

    if (layout?.kind === 'vertical-half') {
      return { ...el, y: clamp01(el.y + amount) };
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
    const pos = tacticalSlotToField(slot, phase, side, field);
    const existing = existingByLabel.get(slot.label);
    if (existing) {
      return { ...existing, x: pos.x, y: pos.y, rotation: pos.rotation };
    }
    const { x, y, rotation } = pos;
    return {
      id: createElementId(),
      type: 'material' as const,
      material,
      x,
      y,
      rotation,
      scale: 1,
      label: slot.label,
      opacity: DEFAULT_ELEMENT_OPACITY,
    };
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
          const pos = tacticalSlotToField(slot, phase, side, field);
          players.push({
            ...createPlayerElement(material, slot, side, field),
            x: pos.x,
            y: pos.y,
            rotation: pos.rotation,
          });
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
