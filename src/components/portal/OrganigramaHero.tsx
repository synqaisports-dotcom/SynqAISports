'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Network } from 'lucide-react';
import type { OrganigramaNodeView } from '@/lib/organigrama';
import { countOrganigramaNodes, countVacantNodes, maxOrganigramaDepth } from '@/lib/organigrama';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { OrganigramaNodeCard } from '@/components/portal/OrganigramaNodeCard';

type Props = {
  nodes: OrganigramaNodeView[];
  actions?: ReactNode;
  className?: string;
};

function MiniChart({ nodes }: { nodes: OrganigramaNodeView[] }) {
  const roots = nodes.slice(0, 1);
  const root = roots[0];
  if (!root) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <OrganigramaNodeCard node={root} variant="hero" className="min-w-[10rem]" />
      {root.children.length > 0 ? (
        <>
          <div className="org-chart-line-v h-4" />
          <div className="relative flex flex-wrap items-start justify-center gap-3 md:gap-5">
            {root.children.length > 1 ? <div className="org-chart-line-h absolute top-0" /> : null}
            {root.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="org-chart-line-v h-4" />
                <OrganigramaNodeCard node={child} variant="hero" className="min-w-[9rem]" />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function OrganigramaHero({ nodes, actions, className }: Props) {
  const total = countOrganigramaNodes(nodes);
  const vacant = countVacantNodes(nodes);
  const depth = maxOrganigramaDepth(nodes);

  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-br from-primary/20 via-background to-background px-4 py-6 md:px-6 md:py-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, hsl(183 100% 50% / 0.5) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" />

        {actions ? (
          <div className="relative z-10 mb-4 flex justify-end gap-2">{actions}</div>
        ) : null}

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Network className="size-3.5" />
              Estructura del club
            </div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Organigrama</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{total} cargos</Badge>
              <Badge variant="outline">{depth} niveles</Badge>
              {vacant > 0 ? <Badge variant="outline">{vacant} vacantes</Badge> : null}
            </div>
          </div>

          <div className="w-full overflow-x-auto lg:max-w-[55%]">
            <MiniChart nodes={nodes} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrganigramaHeroLinkAction({
  href,
  children,
  variant = 'default',
}: {
  href: string;
  children: ReactNode;
  variant?: 'default' | 'outline';
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium shadow-sm transition-colors',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border border-primary/30 bg-card/90 text-foreground hover:bg-card'
      )}
    >
      {children}
    </Link>
  );
}
