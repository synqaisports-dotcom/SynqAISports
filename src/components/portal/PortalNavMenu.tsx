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

const railLinkClass =
  'mx-auto flex size-10 items-center justify-center rounded-lg text-sidebar-foreground/75 transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground';

const railLinkActiveClass =
  'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.4),0_0_12px_hsl(183_100%_50%_/_0.12)]';

const expandedLinkClass =
  'flex h-9 min-w-0 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground';

const expandedLinkActiveClass =
  'bg-primary/12 font-medium text-primary shadow-[inset_2px_0_0_0_hsl(183_100%_50%)]';

function RailNavItem({
  node,
  active,
}: {
  node: PortalNavNode;
  active: boolean;
}) {
  if (!node.href || !node.icon) return null;
  const Icon = node.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={node.href}
          className={cn(railLinkClass, active && railLinkActiveClass)}
          aria-current={active ? 'page' : undefined}
        >
          <Icon className="size-[18px] shrink-0" strokeWidth={active ? 2.25 : 2} />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="border-primary/30 bg-popover font-medium">
        {node.title}
      </TooltipContent>
    </Tooltip>
  );
}

function ExpandedNavLeaf({
  node,
  active,
  indent = false,
}: {
  node: PortalNavNode;
  active: boolean;
  indent?: boolean;
}) {
  if (!node.href) return null;
  const Icon = node.icon;

  return (
    <Link
      href={node.href}
      className={cn(
        expandedLinkClass,
        indent && 'h-8 pl-9 text-xs',
        active && expandedLinkActiveClass
      )}
      aria-current={active ? 'page' : undefined}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
      <span className="truncate">{node.title}</span>
    </Link>
  );
}

function ExpandedNavBranch({
  node,
  pathname,
}: {
  node: PortalNavNode;
  pathname: string;
}) {
  const hasChildren = Boolean(node.children?.length);
  const active = isActive(pathname, node.href, node.exact);
  const defaultOpen = branchOpen(pathname, node);

  if (!node.href || !node.icon) return null;
  const Icon = node.icon;

  if (!hasChildren) {
    return <ExpandedNavLeaf node={node} active={active} />;
  }

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/branch">
      <div className="flex min-w-0 items-center gap-0.5">
        <Link
          href={node.href}
          className={cn('min-w-0 flex-1', expandedLinkClass, active && expandedLinkActiveClass)}
          aria-current={active ? 'page' : undefined}
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{node.title}</span>
        </Link>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            aria-label={`Mostrar secciones de ${node.title}`}
          >
            <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/branch:rotate-90" />
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-0.5 space-y-0.5 border-l border-primary/15 pl-2 ml-5">
        {(node.children ?? []).map((child) => {
          if (!child.href) return null;
          const childActive = isActive(pathname, child.href, child.exact);
          return (
            <ExpandedNavLeaf
              key={child.href}
              node={child}
              active={childActive}
              indent
            />
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
    return <RailNavItem node={node} active={active} />;
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
    <nav className={cn('flex flex-col', expanded ? 'gap-0.5' : 'gap-1')} aria-label="Menú del portal">
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
