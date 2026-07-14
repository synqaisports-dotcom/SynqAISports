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
import type { MacrocycleBlock } from '@/lib/periodization';
import type { MccLink, MccOverride } from '@/lib/periodization-document';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  macro: MacrocycleBlock;
  categorySlug: CanteraCategorySlug;
  mccLinks: Record<string, MccLink>;
  mccOverrides: Record<string, MccOverride>;
  excludedMccIds: Set<string>;
  currentMccId: string | null;
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
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="inset-0 h-screen w-screen max-w-none overflow-y-auto border-primary/20 p-4 sm:max-w-none md:p-6"
      >
        <SheetHeader className="pr-10 text-left">
          <SheetTitle>Macrociclo</SheetTitle>
          <SheetDescription>
            {macro.name} · {macro.startDate} → {macro.endDate}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <PeriodizationGrid
            macro={macro}
            categorySlug={categorySlug}
            mccLinks={mccLinks}
            mccOverrides={mccOverrides}
            excludedMccIds={excludedMccIds}
            selectedMccId={currentMccId}
            readOnly
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
