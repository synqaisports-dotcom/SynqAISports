import { displayPersonName, peopleById, type ClubPerson } from '@/lib/club-people';

export type OrganigramaNode = {
  id: string;
  role: string;
  personId: string | null;
  children: OrganigramaNode[];
};

export type OrganigramaNodeFlat = {
  id: string;
  role: string;
  personId: string | null;
  parentId: string | null;
};

export type OrganigramaNodeView = {
  id: string;
  role: string;
  personId: string | null;
  displayName: string;
  vacant: boolean;
  children: OrganigramaNodeView[];
};

type LegacyOrganigramaNode = {
  id: string;
  role: string;
  name?: string;
  personId?: string | null;
  children: LegacyOrganigramaNode[];
};

export const DEFAULT_ORGANIGRAMA: OrganigramaNode[] = [
  {
    id: 'root',
    role: 'Dirección deportiva',
    personId: null,
    children: [
      {
        id: 'met',
        role: 'Director de metodología',
        personId: null,
        children: [
          { id: 'coord-u16', role: 'Coordinador Sub-16', personId: null, children: [] },
          { id: 'coord-u14', role: 'Coordinador Sub-14', personId: null, children: [] },
        ],
      },
      {
        id: 'can',
        role: 'Director de cantera',
        personId: null,
        children: [{ id: 'deleg', role: 'Delegados por equipo', personId: null, children: [] }],
      },
    ],
  },
];

function normalizeNode(raw: LegacyOrganigramaNode): OrganigramaNode {
  const personId =
    raw.personId != null && String(raw.personId).trim()
      ? String(raw.personId).trim()
      : null;

  return {
    id: String(raw.id),
    role: String(raw.role ?? '').trim() || 'Cargo',
    personId,
    children: Array.isArray(raw.children) ? raw.children.map(normalizeNode) : [],
  };
}

export function parseOrganigramaJson(value: unknown): OrganigramaNode[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_ORGANIGRAMA;
  return (value as LegacyOrganigramaNode[]).map(normalizeNode);
}

export function enrichOrganigramaNodes(
  nodes: OrganigramaNode[],
  people: ClubPerson[]
): OrganigramaNodeView[] {
  const map = peopleById(people);
  const enrich = (node: OrganigramaNode): OrganigramaNodeView => {
    const vacant = !node.personId;
    const displayName = vacant ? 'Por asignar' : displayPersonName(map.get(node.personId!));
    return {
      ...node,
      displayName,
      vacant,
      children: node.children.map(enrich),
    };
  };
  return nodes.map(enrich);
}

export function countOrganigramaNodes(nodes: OrganigramaNode[]): number {
  return nodes.reduce((acc, node) => acc + 1 + countOrganigramaNodes(node.children), 0);
}

export function countVacantNodes(nodes: OrganigramaNode[]): number {
  return nodes.reduce((acc, node) => {
    const vacant = !node.personId ? 1 : 0;
    return acc + vacant + countVacantNodes(node.children);
  }, 0);
}

export function maxOrganigramaDepth(nodes: OrganigramaNode[], depth = 1): number {
  if (nodes.length === 0) return 0;
  return Math.max(
    ...nodes.map((node) =>
      node.children.length ? maxOrganigramaDepth(node.children, depth + 1) : depth
    )
  );
}

export function flattenOrganigrama(
  nodes: OrganigramaNode[],
  parentId: string | null = null
): OrganigramaNodeFlat[] {
  return nodes.flatMap((node) => [
    { id: node.id, role: node.role, personId: node.personId, parentId },
    ...flattenOrganigrama(node.children, node.id),
  ]);
}

export function buildOrganigramaTree(flat: OrganigramaNodeFlat[]): OrganigramaNode[] {
  const byParent = new Map<string | null, OrganigramaNodeFlat[]>();
  for (const row of flat) {
    const key = row.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(row);
  }

  const build = (parentId: string | null): OrganigramaNode[] =>
    (byParent.get(parentId) ?? []).map((row) => ({
      id: row.id,
      role: row.role,
      personId: row.personId,
      children: build(row.id),
    }));

  return build(null);
}

export function newOrganigramaNodeId(): string {
  return `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
