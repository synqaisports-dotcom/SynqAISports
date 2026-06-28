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
        const hasChildren = Boolean(node.children?.length);
        const active = isActive(pathname, node.href, node.exact);
        const open = branchOpen(pathname, node);

        if (!hasChildren && node.href) {
          return (
            <SidebarMenuSubItem key={key}>
              <SidebarMenuSubButton asChild isActive={active}>
                <Link href={node.href}>{node.title}</Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        }

        if (hasChildren) {
          return (
            <Collapsible key={key} asChild defaultOpen={open} className="group/subcollapsible">
              <SidebarMenuSubItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuSubButton isActive={open}>
                    <span>{node.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/subcollapsible:rotate-90" />
                  </SidebarMenuSubButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mr-0 border-l-0">
                    {node.href && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={active}>
                          <Link href={node.href}>Resumen</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                    <SubNavItems nodes={node.children!} pathname={pathname} />
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuSubItem>
            </Collapsible>
          );
        }

        return null;
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

        if (hasChildren && node.icon) {
          return (
            <Collapsible key={key} asChild defaultOpen={open} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={node.title} isActive={open}>
                    <node.icon />
                    <span>{node.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {node.href && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={active}>
                          <Link href={node.href}>Resumen</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
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
