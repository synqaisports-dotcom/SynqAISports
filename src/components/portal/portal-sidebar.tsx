'use client';

import * as React from 'react';
import Link from 'next/link';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { portalNavGroups } from '@/config/portal-nav';
import { PortalNavMenu } from '@/components/portal/PortalNavMenu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const RAIL_PX = 56;
const EXPANDED_PX = 272;
const HOVER_COLLAPSE_MS = 220;

type PortalSidebarContextValue = {
  expanded: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
};

const PortalSidebarContext = React.createContext<PortalSidebarContextValue | null>(null);

export function usePortalSidebar() {
  const ctx = React.useContext(PortalSidebarContext);
  if (!ctx) {
    throw new Error('usePortalSidebar must be used within PortalSidebarProvider');
  }
  return ctx;
}

function SidebarBrand({ expanded }: { expanded: boolean }) {
  return (
    <div
      className={cn(
        'portal-sidebar-brand flex shrink-0 items-center',
        expanded ? 'h-[4.5rem] px-3' : 'h-14 justify-center px-0'
      )}
    >
      <Link
        href="/portal"
        className={cn(
          'rounded-xl text-sidebar-foreground transition-colors hover:bg-white/[0.04]',
          expanded ? 'flex w-full min-w-0 items-center gap-2.5 px-2 py-2' : 'flex size-10 items-center justify-center'
        )}
        title="SynqAI Sports"
      >
        {expanded ? (
          <SynqBrandLockup layout="horizontal" iconSize={34} wordmarkSize="sm" />
        ) : (
          <SynqBrandLockup layout="icon-only" iconSize={30} />
        )}
      </Link>
    </div>
  );
}

function SidebarNav({ expanded }: { expanded: boolean }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className={cn('py-4', expanded ? 'px-2.5' : 'px-1.5')}>
        {portalNavGroups.map((group, index) => (
          <div key={group.label} className={cn(index > 0 && 'mt-3')}>
            {!expanded && index > 0 ? (
              <div className="mx-auto mb-3 h-px w-5 bg-gradient-to-r from-transparent via-primary/25 to-transparent" aria-hidden />
            ) : null}
            <PortalNavMenu items={group.items} expanded={expanded} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function SidebarFooter({ expanded }: { expanded: boolean }) {
  if (!expanded) return null;
  return (
    <div className="shrink-0 border-t border-white/[0.06] px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/35">
        Plataforma club
      </p>
      <p className="mt-0.5 text-[11px] text-sidebar-foreground/50">Metodología · Cantera · Club</p>
    </div>
  );
}

function SidebarPanel({ expanded }: { expanded: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarBrand expanded={expanded} />
      <SidebarNav expanded={expanded} />
      <SidebarFooter expanded={expanded} />
    </div>
  );
}

type ProviderProps = {
  children: React.ReactNode;
  clubName: string;
};

export function PortalSidebarProvider({ children, clubName }: ProviderProps) {
  const isMobile = useIsMobile();
  const [hovered, setHovered] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const expanded = isMobile ? mobileOpen : hovered;

  const handlePointerEnter = () => {
    if (isMobile) return;
    if (collapseTimer.current) {
      clearTimeout(collapseTimer.current);
      collapseTimer.current = null;
    }
    setHovered(true);
  };

  const handlePointerLeave = () => {
    if (isMobile) return;
    collapseTimer.current = setTimeout(() => {
      setHovered(false);
      collapseTimer.current = null;
    }, HOVER_COLLAPSE_MS);
  };

  React.useEffect(() => {
    return () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    };
  }, []);

  const toggleMobile = React.useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const contextValue = React.useMemo<PortalSidebarContextValue>(
    () => ({
      expanded,
      isMobile,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    }),
    [expanded, isMobile, mobileOpen, toggleMobile]
  );

  return (
    <PortalSidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={120}>
        <div className="flex min-h-svh w-full">
          {!isMobile ? (
            <>
              <div className="hidden shrink-0 md:block" style={{ width: RAIL_PX }} aria-hidden />
              <aside
                className={cn(
                  'portal-sidebar-rail portal-sidebar-surface relative fixed inset-y-0 left-0 z-50 hidden flex-col',
                  'border-r border-primary/20 text-sidebar-foreground',
                  'transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:flex',
                  expanded
                    ? 'shadow-[12px_0_48px_hsl(0_0%_0%_/_0.45)]'
                    : 'overflow-hidden shadow-[4px_0_24px_hsl(0_0%_0%_/_0.35)]'
                )}
                style={{ width: expanded ? EXPANDED_PX : RAIL_PX }}
                onMouseEnter={handlePointerEnter}
                onMouseLeave={handlePointerLeave}
                data-expanded={expanded ? 'true' : 'false'}
                aria-label="Navegación del portal"
              >
                <SidebarPanel expanded={expanded} />
              </aside>
            </>
          ) : (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetContent
                side="left"
                className="portal-sidebar-surface w-[min(19rem,88vw)] border-primary/20 bg-transparent p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
              >
                <SidebarPanel expanded />
              </SheetContent>
            </Sheet>
          )}

          <div className="portal-main-surface flex min-h-svh min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </TooltipProvider>
    </PortalSidebarContext.Provider>
  );
}

export function PortalSidebarMobileTrigger() {
  const { isMobile, toggleMobile } = usePortalSidebar();

  if (!isMobile) return null;

  return (
    <button
      type="button"
      onClick={toggleMobile}
      className="inline-flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
      aria-label="Abrir menú de navegación"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 3v18" />
      </svg>
    </button>
  );
}
