'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { portalNavGroups } from '@/config/portal-nav';
import { PortalNavMenu } from '@/components/portal/PortalNavMenu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

type Props = {
  clubName: string;
  role: string;
};

export function AppSidebar({ clubName }: Props) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-primary/25">
      <SidebarHeader className="border-b border-primary/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={clubName}>
              <Link href="/portal">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SynqAI Sports</span>
                  <span className="truncate text-xs text-muted-foreground">Portal del club</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          {portalNavGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <PortalNavMenu groups={group.items} />
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
