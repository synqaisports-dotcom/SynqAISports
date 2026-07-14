'use client';

import { ThemeModeToggle } from '@/components/portal/ThemeModeToggle';
import { PortalConfigButton } from '@/components/portal/PortalConfigButton';
import { PortalUserMenu } from '@/components/portal/PortalUserMenu';
import { DemoModeBell } from '@/components/portal/DemoModeBell';
import { ChangeRequestsBell } from '@/components/portal/ChangeRequestsBell';
import { PortalSidebarMobileTrigger } from '@/components/portal/portal-sidebar';

type Props = {
  clubName: string;
  role: string;
  demoMode?: boolean;
  demoCanPersist?: boolean;
};

export function PortalHeader({ clubName, role, demoMode, demoCanPersist }: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-primary/15 bg-[hsl(205_42%_7%/_0.72)] px-4 backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(205_42%_7%/_0.55)]">
      <div className="flex items-center gap-1">
        <PortalSidebarMobileTrigger />
      </div>
      <div className="flex items-center gap-1">
        <PortalConfigButton />
        <ChangeRequestsBell role={role} demoMode={demoMode} />
        {demoMode && <DemoModeBell canPersist={demoCanPersist ?? false} clubName={clubName} />}
        <ThemeModeToggle />
        <PortalUserMenu clubName={clubName} role={role} demoMode={demoMode} />
      </div>
    </header>
  );
}
