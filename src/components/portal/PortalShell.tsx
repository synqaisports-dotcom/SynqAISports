'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/portal/AppSidebar';
import { PortalHeader } from '@/components/portal/PortalHeader';

type Props = {
  children: React.ReactNode;
  clubName: string;
  role: string;
  demoMode?: boolean;
  demoCanPersist?: boolean;
  defaultOpen?: boolean;
};

export function PortalShell({
  children,
  clubName,
  role,
  demoMode,
  demoCanPersist,
  defaultOpen = false,
}: Props) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className="min-h-svh">
      <AppSidebar clubName={clubName} role={role} />
      <SidebarInset className="min-h-svh">
        <PortalHeader
          clubName={clubName}
          role={role}
          demoMode={demoMode}
          demoCanPersist={demoCanPersist}
        />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
