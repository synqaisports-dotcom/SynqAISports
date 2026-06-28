'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/portal/AppSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';

type Props = {
  children: React.ReactNode;
  clubName: string;
  role: string;
  demoMode?: boolean;
  defaultOpen?: boolean;
};

export function PortalShell({
  children,
  clubName,
  role,
  demoMode,
  defaultOpen = true,
}: Props) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar clubName={clubName} role={role} demoMode={demoMode} />
      <SidebarInset>
        <PortalHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
