'use client';

import { PeriodizationGrid } from '@/components/portal/PeriodizationGrid';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import type { MacrocycleBlock, MicrocycleWeek } from '@/lib/periodization';
import type { MccLink, MccOverride } from '@/lib/periodization-document';

const COACH_SHEET_CLASS =
  'portal-dashboard dark portal-main-surface inset-0 h-screen w-screen max-w-none overflow-y-auto border-l border-primary/25 p-4 text-foreground sm:max-w-none md:p-6 [&>button]:rounded-lg [&>button]:border [&>button]:border-primary/25 [&>button]:bg-background/40 [&>button]:text-primary hover:[&>button]:bg-primary/10';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  macro: MacrocycleBlock;
  categorySlug: CanteraCategorySlug;
  mccLinks: Record<string, MccLink>;
  mccOverrides: Record<string, MccOverride>;
  excludedMccIds: Set<string>;
  currentMccId: string | null;
  onSelectMcc?: (micro: MicrocycleWeek) => void;
};

export function CoachMacrocycleOverlay({
  open,
  onOpenChange,
  macro,
  categorySlug,
  mccLinks,
  mccOverrides,
  excludedMccIds,
  currentMccId,
  onSelectMcc,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={COACH_SHEET_CLASS}>
        <SheetHeader className="portal-section-surface rounded-xl p-4 pr-12 text-left">
          <SheetTitle className="text-primary">Macrociclo</SheetTitle>
          <SheetDescription>
            {macro.name} · {macro.startDate} → {macro.endDate}
            {onSelectMcc ? ' · Pulsa un MCC para ver su microciclo' : null}
          </SheetDescription>
        </SheetHeader>

        <div className="portal-section-surface mt-4 overflow-x-auto rounded-xl p-4">
          <PeriodizationGrid
            macro={macro}
            categorySlug={categorySlug}
            mccLinks={mccLinks}
            mccOverrides={mccOverrides}
            excludedMccIds={excludedMccIds}
            selectedMccId={currentMccId}
            onSelectMcc={onSelectMcc}
            readOnly={!onSelectMcc}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
