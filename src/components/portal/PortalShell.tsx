'use client';

import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalSidebarProvider } from '@/components/portal/portal-sidebar';

type Props = {
  children: React.ReactNode;
  clubName: string;
  clubLogoUrl?: string | null;
  role: string;
  demoMode?: boolean;
  demoCanPersist?: boolean;
};

export function PortalShell({
  children,
  clubName,
  clubLogoUrl,
  role,
  demoMode,
  demoCanPersist,
}: Props) {
  return (
    <PortalSidebarProvider clubName={clubName}>
      <PortalHeader
        clubName={clubName}
        clubLogoUrl={clubLogoUrl}
        role={role}
        demoMode={demoMode}
        demoCanPersist={demoCanPersist}
      />
      <div className="synq-portal-content flex min-h-0 flex-1 flex-col">{children}</div>
    </PortalSidebarProvider>
  );
}
