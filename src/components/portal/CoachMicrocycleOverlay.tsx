'use client';

import { findMccInPlan, getMccDisplayLabel } from '@/lib/periodization';
import { CoachMicrocycleReadonlyView } from '@/components/portal/CoachMicrocycleReadonlyView';
import {
  PortalSheetBody,
  PortalSheetContent,
} from '@/components/portal/PortalSheet';
import { Sheet } from '@/components/ui/sheet';
import type { CoachWeekContext } from '@/lib/coach-periodization-context';
import { getVariantState } from '@/lib/periodization-document';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekContext: CoachWeekContext;
  mccId: string;
  microcycleId: string | null;
  initialSessionIndex?: number;
};

export function CoachMicrocycleOverlay({
  open,
  onOpenChange,
  weekContext,
  mccId,
  microcycleId,
  initialSessionIndex = 1,
}: Props) {
  const mccContext = findMccInPlan(weekContext.plan, mccId);
  const variantState = getVariantState(weekContext.document, weekContext.variant.id);
  const mccLabel = mccContext
    ? getMccDisplayLabel(mccContext.micro, variantState.mccOverrides[mccId])
    : 'Microciclo';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="full">
        <PortalSheetBody className="p-4 md:p-6">
          <div className="pr-10 pt-1">
            {microcycleId && mccContext ? (
              <CoachMicrocycleReadonlyView
                microcycleId={microcycleId}
                mccLabel={mccLabel}
                weekStart={mccContext.micro.weekStart}
                weekEnd={mccContext.micro.weekEnd}
                initialSessionIndex={initialSessionIndex}
              />
            ) : (
              <p className="portal-section-surface rounded-xl border border-dashed border-primary/25 p-6 text-center text-sm text-muted-foreground">
                Este microciclo aún no está vinculado al plan.
              </p>
            )}
          </div>
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
