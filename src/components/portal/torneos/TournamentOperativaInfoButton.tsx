'use client';

import { useState } from 'react';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { TournamentOperativaGuideContent } from '@/components/portal/torneos/TournamentOperativaGuide';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

const INFO_ICON_CLASS =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-cyan-400 transition-colors hover:bg-cyan-400/10 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50';

type Props = {
  className?: string;
  /** Tamaño del icono (sm junto a títulos, md en toolbar) */
  size?: 'sm' | 'md';
};

export function TournamentOperativaInfoButton({ className, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const iconSize = size === 'md' ? 'size-5' : 'size-[1.125rem]';

  return (
    <>
      <button
        type="button"
        className={cn(INFO_ICON_CLASS, className)}
        onClick={() => setOpen(true)}
        aria-label="¿Dónde configuro cada cosa?"
        title="Guía del módulo torneos"
      >
        <Info className={iconSize} strokeWidth={1.75} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <PortalSheetContent maxWidth="lg">
          <PortalSheetHeader>
            <SheetHeader>
              <SheetTitle>¿Dónde configuro cada cosa?</SheetTitle>
            </SheetHeader>
          </PortalSheetHeader>
          <PortalSheetBody>
            <TournamentOperativaGuideContent />
          </PortalSheetBody>
        </PortalSheetContent>
      </Sheet>
    </>
  );
}
