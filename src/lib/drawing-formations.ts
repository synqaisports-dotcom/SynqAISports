import {
  DEFAULT_ELEMENT_OPACITY,
  createElementId,
  sortElementsByLayer,
  type DrawingElement,
  type FieldTemplate,
  type MaterialElement,
} from '@/lib/exercise-drawing';

export type FormationFieldGroup = 'f11' | 'f7' | 'futsal' | 'half';

export type FormationSlot = {
  x: number;
  y: number;
  label: string;
};

export type FormationPreset = {
  id: string;
  label: string;
  slots: FormationSlot[];
};

export type DrawingFormations = {
  home: string | null;
  away: string | null;
};

export const FORMATION_NONE_ID = 'none';

function row(y: number, labels: string[], inset = 0.12): FormationSlot[] {
  const count = labels.length;
  const width = 1 - inset * 2;
  return labels.map((label, index) => ({
    x: inset + (width * (index + 0.5)) / count,
    y,
    label,
  }));
}

function withKeeper(slots: FormationSlot[], keeperLabel = '1'): FormationSlot[] {
  return [{ x: 0.5, y: 0.9, label: keeperLabel }, ...slots];
}

export const FORMATIONS_BY_GROUP: Record<FormationFieldGroup, FormationPreset[]> = {
  f11: [
    {
      id: '442',
      label: '4-4-2',
      slots: withKeeper([
        ...row(0.74, ['2', '3', '4', '5']),
        ...row(0.54, ['6', '7', '8', '9']),
        ...row(0.3, ['10', '11']),
      ]),
    },
    {
      id: '433',
      label: '4-3-3',
      slots: withKeeper([
        ...row(0.74, ['2', '3', '4', '5']),
        ...row(0.52, ['6', '8', '10']),
        ...row(0.28, ['7', '9', '11']),
      ]),
    },
    {
      id: '352',
      label: '3-5-2',
      slots: withKeeper([
        ...row(0.74, ['3', '4', '5'], 0.22),
        ...row(0.56, ['2', '6', '8', '10', '7'], 0.08),
        ...row(0.3, ['9', '11']),
      ]),
    },
    {
      id: '4231',
      label: '4-2-3-1',
      slots: withKeeper([
        ...row(0.74, ['2', '3', '4', '5']),
        ...row(0.58, ['6', '8']),
        ...row(0.4, ['7', '10', '11']),
        ...row(0.26, ['9']),
      ]),
    },
    {
      id: '343',
      label: '3-4-3',
      slots: withKeeper([
        ...row(0.74, ['3', '4', '5'], 0.22),
        ...row(0.52, ['2', '6', '8', '7']),
        ...row(0.28, ['9', '10', '11']),
      ]),
    },
  ],
  f7: [
    {
      id: '321',
      label: '3-2-1',
      slots: withKeeper([
        ...row(0.72, ['2', '3', '4'], 0.18),
        ...row(0.5, ['5', '6']),
        ...row(0.28, ['7']),
      ]),
    },
    {
      id: '231',
      label: '2-3-1',
      slots: withKeeper([
        ...row(0.72, ['2', '3'], 0.28),
        ...row(0.5, ['4', '5', '6']),
        ...row(0.28, ['7']),
      ]),
    },
    {
      id: '222',
      label: '2-2-2',
      slots: withKeeper([
        ...row(0.72, ['2', '3'], 0.28),
        ...row(0.5, ['4', '5']),
        ...row(0.28, ['6', '7']),
      ]),
    },
  ],
  futsal: [
    {
      id: '121',
      label: '1-2-1',
      slots: withKeeper([
        ...row(0.68, ['2', '3'], 0.28),
        ...row(0.38, ['4']),
        ...row(0.22, ['5']),
      ]),
    },
    {
      id: '211',
      label: '2-1-1',
      slots: withKeeper([
        ...row(0.68, ['2', '3'], 0.28),
        ...row(0.46, ['4']),
        ...row(0.24, ['5']),
      ]),
    },
    {
      id: '112',
      label: '1-1-2',
      slots: withKeeper([
        ...row(0.68, ['2'], 0.38),
        ...row(0.46, ['3']),
        ...row(0.24, ['4', '5'], 0.28),
      ]),
    },
    {
      id: '22',
      label: '2-2',
      slots: withKeeper([
        ...row(0.62, ['2', '3'], 0.28),
        ...row(0.3, ['4', '5'], 0.28),
      ]),
    },
  ],
  half: [
    {
      id: 'half-442',
      label: '4-1',
      slots: withKeeper([
        ...row(0.62, ['2', '3', '4', '5']),
        ...row(0.34, ['6']),
      ]),
    },
    {
      id: 'half-321',
      label: '3-2',
      slots: withKeeper([
        ...row(0.62, ['2', '3', '4'], 0.18),
        ...row(0.34, ['5', '6']),
      ]),
    },
    {
      id: 'half-41',
      label: '4',
      slots: withKeeper([...row(0.42, ['2', '3', '4', '5'])]),
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

export function formationsForField(field: FieldTemplate): FormationPreset[] {
  const group = formationGroupForField(field);
  return group ? FORMATIONS_BY_GROUP[group] : [];
}

export function findFormation(group: FormationFieldGroup, id: string): FormationPreset | undefined {
  return FORMATIONS_BY_GROUP[group].find((formation) => formation.id === id);
}

function createPlayerElement(
  material: 'player-own' | 'player-rival',
  slot: FormationSlot,
  side: 'home' | 'away'
): MaterialElement {
  const mirrored = side === 'away';
  return {
    id: createElementId(),
    type: 'material',
    material,
    x: slot.x,
    y: mirrored ? 1 - slot.y : slot.y,
    rotation: mirrored ? 180 : 0,
    scale: 1,
    label: slot.label,
    opacity: DEFAULT_ELEMENT_OPACITY,
  };
}

export function applyFormationToElements(
  elements: DrawingElement[],
  side: 'home' | 'away',
  formationId: string | null,
  group: FormationFieldGroup | null
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

  const players = formation.slots.map((slot) => createPlayerElement(material, slot, side));
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
  };
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
