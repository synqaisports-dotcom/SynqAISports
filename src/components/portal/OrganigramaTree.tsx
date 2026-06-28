'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

type OrgNodeData = {
  id: string;
  role: string;
  name: string;
  children: OrgNodeData[];
};

const orgTree: OrgNodeData[] = [
  {
    id: 'dir',
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

type Node = OrgNodeData;

function OrgNode({ node, depth = 0 }: { node: OrgNodeData; depth?: number }) {
  const hasChildren = node.children.length > 0;

  if (!hasChildren) {
    return (
      <div
        className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm"
        style={{ marginLeft: depth * 12 }}
      >
        <div>
          <p className="font-medium">{node.role}</p>
          <p className="text-xs text-muted-foreground">{node.name}</p>
        </div>
        <Badge variant="outline">Vacante</Badge>
      </div>
    );
  }

  return (
    <AccordionItem value={node.id} className="border-0">
      <AccordionTrigger
        className="rounded-md border bg-card px-3 py-2 hover:no-underline"
        style={{ marginLeft: depth * 12 }}
      >
        <div className="flex flex-1 items-center justify-between gap-2 text-left">
          <div>
            <p className="text-sm font-medium">{node.role}</p>
            <p className="text-xs text-muted-foreground">{node.name}</p>
          </div>
          <Badge variant="secondary">{node.children.length} dependencias</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-2 pt-2">
        <Accordion type="multiple" className="space-y-2">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

export function OrganigramaTree() {
  return (
    <Accordion type="multiple" defaultValue={['dir']} className="space-y-2">
      {orgTree.map((node) => (
        <OrgNode key={node.id} node={node} />
      ))}
    </Accordion>
  );
}
