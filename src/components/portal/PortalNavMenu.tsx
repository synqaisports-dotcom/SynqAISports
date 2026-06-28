'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { PortalNavNode } from '@/config/portal-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

function isActive(pathname: string, href?: string, exact?: boolean): boolean {
  if (!href) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function branchOpen(pathname: string, node: PortalNavNode): boolean {
  if (isActive(pathname, node.href, node.exact)) return true;
  return (node.children ?? []).some((child) => branchOpen(pathname, child));
}

function SubNavItems({ nodes, pathname }: { nodes: PortalNavNode[]; pathname: string }) {
  return (
    <>
      {nodes.map((node) => {
        const key = node.href ?? node.title;
        if (!node.href) return null;
        const active = isActive(pathname, node.href, node.exact);
        return (
          <SidebarMenuSubItem key={key}>
            <SidebarMenuSubButton asChild isActive={active}>
              <Link href={node.href}>{node.title}</Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </>
  );
}

export function PortalNavMenu({ groups }: { groups: PortalNavNode[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {groups.map((node) => {
        const key = node.href ?? node.title;
        const hasChildren = Boolean(node.children?.length);
        const active = isActive(pathname, node.href, node.exact);
        const open = branchOpen(pathname, node);

        if (!hasChildren && node.href && node.icon) {
          return (
            <SidebarMenuItem key={key}>
              <SidebarMenuButton asChild tooltip={node.title} isActive={active}>
                <Link href={node.href}>
                  <node.icon />
                  <span>{node.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }

        if (hasChildren && node.icon && node.href) {
          return (
            <Collapsible key={key} asChild defaultOpen={open} className="group/collapsible">
              <SidebarMenuItem>
                <div className="flex w-full items-center">
                  <SidebarMenuButton
                    asChild
                    tooltip={node.title}
                    isActive={active}
                    className="flex-1"
                  >
                    <Link href={node.href}>
                      <node.icon />
                      <span>{node.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
                      aria-label={`Expandir ${node.title}`}
                    >
                      <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SubNavItems nodes={node.children!} pathname={pathname} />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return null;
      })}
    </SidebarMenu>
  );
}
