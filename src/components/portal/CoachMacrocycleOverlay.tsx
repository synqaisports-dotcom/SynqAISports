'use client';

import { PeriodizationGrid } from '@/components/portal/PeriodizationGrid';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import type { MacrocycleBlock, MicrocycleWeek } from '@/lib/periodization';
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
      <PortalSheetContent maxWidth="full">
        <PortalSheetHeader>
          <SheetHeader className="space-y-2 text-left">
            <SheetTitle className="text-xl tracking-tight text-primary">Macrociclo</SheetTitle>
            <SheetDescription>
              {macro.name} · {macro.startDate} → {macro.endDate}
              {onSelectMcc ? ' · Pulsa un MCC para ver su microciclo' : null}
            </SheetDescription>
          </SheetHeader>
        </PortalSheetHeader>

        <PortalSheetBody className="p-4 md:p-6">
          <div className="portal-section-surface overflow-x-auto rounded-xl p-4">
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
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
