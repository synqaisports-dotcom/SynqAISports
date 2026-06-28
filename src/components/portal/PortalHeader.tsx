'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeModeToggle } from '@/components/portal/ThemeModeToggle';
import { PortalUserMenu } from '@/components/portal/PortalUserMenu';
import { SidebarCollapseButton } from '@/components/portal/SidebarCollapseButton';
import { DemoModeBell } from '@/components/portal/DemoModeBell';

type Props = {
  clubName: string;
  role: string;
  demoMode?: boolean;
  demoCanPersist?: boolean;
};

export function PortalHeader({ clubName, role, demoMode, demoCanPersist }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-primary/20 bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-1">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <SidebarCollapseButton />
      </div>
      <div className="flex items-center gap-1">
        {demoMode && <DemoModeBell canPersist={demoCanPersist ?? false} clubName={clubName} />}
        <ThemeModeToggle />
        <PortalUserMenu clubName={clubName} role={role} demoMode={demoMode} />
      </div>
    </header>
  );
}
