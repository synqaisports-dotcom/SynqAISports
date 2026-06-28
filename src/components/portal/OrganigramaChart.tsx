'use client';

import type { OrganigramaNode } from '@/lib/organigrama';
import { OrganigramaNodeCard } from '@/components/portal/OrganigramaNodeCard';

function OrgChartBranch({ node }: { node: OrganigramaNode }) {
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <OrganigramaNodeCard node={node} />
      {hasChildren ? (
        <>
          <div className="org-chart-line-v h-6" />
          <div className="relative flex flex-wrap items-start justify-center gap-6 md:gap-10">
            {node.children.length > 1 ? (
              <div
                className="org-chart-line-h absolute top-0"
                style={{
                  left: '12%',
                  right: '12%',
                }}
              />
            ) : null}
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="org-chart-line-v h-6" />
                <OrgChartBranch node={child} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

type Props = {
  nodes: OrganigramaNode[];
};

export function OrganigramaChart({ nodes }: Props) {
  return (
    <div className="org-chart-board w-full overflow-x-auto rounded-xl border border-primary/25 bg-card/40 p-6 md:p-10">
      <div className="flex min-w-max flex-col items-center gap-2">
        {nodes.map((node) => (
          <OrgChartBranch key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
}
