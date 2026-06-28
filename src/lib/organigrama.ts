export type OrganigramaNode = {
  id: string;
  role: string;
  name: string;
  children: OrganigramaNode[];
};

export type OrganigramaNodeFlat = {
  id: string;
  role: string;
  name: string;
  parentId: string | null;
};

export const DEFAULT_ORGANIGRAMA: OrganigramaNode[] = [
  {
    id: 'root',
    role: 'Dirección deportiva',
    name: 'Por asignar',
    children: [
      {
        id: 'met',
        role: 'Director de metodología',
        name: 'Por asignar',
        children: [
          { id: 'coord-u16', role: 'Coordinador Sub-16', name: 'Por asignar', children: [] },
          { id: 'coord-u14', role: 'Coordinador Sub-14', name: 'Por asignar', children: [] },
        ],
      },
      {
        id: 'can',
        role: 'Director de cantera',
        name: 'Por asignar',
        children: [
          { id: 'deleg', role: 'Delegados por equipo', name: 'Varios', children: [] },
        ],
      },
    ],
  },
];

export function parseOrganigramaJson(value: unknown): OrganigramaNode[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_ORGANIGRAMA;
  return value as OrganigramaNode[];
}

export function countOrganigramaNodes(nodes: OrganigramaNode[]): number {
  return nodes.reduce((acc, node) => acc + 1 + countOrganigramaNodes(node.children), 0);
}

export function countVacantNodes(nodes: OrganigramaNode[]): number {
  return nodes.reduce((acc, node) => {
    const vacant = !node.name.trim() || node.name.toLowerCase() === 'por asignar' ? 1 : 0;
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
    { id: node.id, role: node.role, name: node.name, parentId },
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
      name: row.name,
      children: build(row.id),
    }));

  return build(null);
}

export function newOrganigramaNodeId(): string {
  return `node-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
