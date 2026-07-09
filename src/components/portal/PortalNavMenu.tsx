'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { PortalNavNode } from '@/config/portal-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href?: string, exact?: boolean): boolean {
  if (!href) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function branchOpen(pathname: string, node: PortalNavNode): boolean {
  if (isActive(pathname, node.href, node.exact)) return true;
  return (node.children ?? []).some((child) => branchOpen(pathname, child));
}

function branchChildActive(pathname: string, node: PortalNavNode): boolean {
  return (node.children ?? []).some((child) => isActive(pathname, child.href, child.exact));
}

function NavIcon({ icon: Icon, small }: { icon: PortalNavNode['icon']; small?: boolean }) {
  if (!Icon) return <span className={cn(small ? 'size-6' : 'size-8', 'shrink-0')} />;
  return (
    <span className={cn(small ? 'portal-nav-subicon' : 'portal-nav-icon')}>
      <Icon className={cn('shrink-0', small ? 'size-3.5' : 'size-4')} strokeWidth={2} />
    </span>
  );
}

function RailNavItem({ node, active }: { node: PortalNavNode; active: boolean }) {
  if (!node.href || !node.icon) return null;
  const Icon = node.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={node.href}
          className={cn('portal-sidebar-rail-btn', active && 'portal-sidebar-rail-btn-active')}
          aria-current={active ? 'page' : undefined}
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 2} />
        </Link>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="border-primary/25 bg-popover/95 font-medium shadow-lg backdrop-blur-md"
      >
        {node.title}
      </TooltipContent>
    </Tooltip>
  );
}

function ExpandedNavLeaf({
  node,
  active,
  sub = false,
}: {
  node: PortalNavNode;
  active: boolean;
  sub?: boolean;
}) {
  if (!node.href) return null;

  return (
    <Link
      href={node.href}
      className={cn(
        sub ? 'portal-nav-subitem' : 'portal-nav-item h-10',
        active && (sub ? 'portal-nav-subitem-active' : 'portal-nav-item-active')
      )}
      aria-current={active ? 'page' : undefined}
    >
      <NavIcon icon={node.icon} small={sub} />
      <span className="truncate">{node.title}</span>
    </Link>
  );
}

function ExpandedNavBranch({ node, pathname }: { node: PortalNavNode; pathname: string }) {
  const hasChildren = Boolean(node.children?.length);
  const active = isActive(pathname, node.href, node.exact);
  const childActive = branchChildActive(pathname, node);
  const defaultOpen = branchOpen(pathname, node);

  if (!node.href || !node.icon) return null;

  if (!hasChildren) {
    return <ExpandedNavLeaf node={node} active={active} />;
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/branch">
      <div className="flex min-w-0 items-center gap-0.5">
        <Link
          href={node.href}
          className={cn(
            'portal-nav-item h-10 min-w-0 flex-1',
            (active || childActive) && 'portal-nav-item-active'
          )}
          aria-current={active ? 'page' : undefined}
        >
          <NavIcon icon={node.icon} />
          <span className="truncate">{node.title}</span>
        </Link>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-white/[0.05] hover:text-sidebar-foreground"
            aria-label={`Mostrar secciones de ${node.title}`}
          >
            <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/branch:rotate-90" />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="portal-nav-subpanel">
        {(node.children ?? []).map((child) => {
          if (!child.href) return null;
          const childActive = isActive(pathname, child.href, child.exact);
          return (
            <ExpandedNavLeaf key={child.href} node={child} active={childActive} sub />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavBranch({
  node,
  pathname,
  expanded,
}: {
  node: PortalNavNode;
  pathname: string;
  expanded: boolean;
}) {
  const active = isActive(pathname, node.href, node.exact);

  if (!expanded) {
    return <RailNavItem node={node} active={active || branchChildActive(pathname, node)} />;
  }

  return <ExpandedNavBranch node={node} pathname={pathname} />;
}

export function PortalNavMenu({
  items,
  expanded,
}: {
  items: PortalNavNode[];
  expanded: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col', expanded ? 'gap-1' : 'gap-1.5')} aria-label="Menú del portal">
      {items.map((node) => (
        <NavBranch
          key={node.href ?? node.title}
          node={node}
          pathname={pathname}
          expanded={expanded}
        />
      ))}
    </nav>
  );
}
