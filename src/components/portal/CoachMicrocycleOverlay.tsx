'use client';

import { findMccInPlan, getMccDisplayLabel, type MicrocycleWeek } from '@/lib/periodization';
import { CoachMicrocycleReadonlyView } from '@/components/portal/CoachMicrocycleReadonlyView';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

const COACH_SHEET_CLASS =
  'portal-dashboard dark portal-main-surface inset-0 h-screen w-screen max-w-none overflow-y-auto border-l border-primary/25 p-4 text-foreground sm:max-w-none md:p-6 [&>button]:rounded-lg [&>button]:border [&>button]:border-primary/25 [&>button]:bg-background/40 [&>button]:text-primary hover:[&>button]:bg-primary/10';

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
      <SheetContent side="right" className={COACH_SHEET_CLASS}>
        <SheetHeader className="portal-section-surface rounded-xl p-4 pr-12 text-left">
          <SheetTitle className="text-primary">Microciclo</SheetTitle>
          <SheetDescription>Consulta el plan de la semana sin modificarlo.</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
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
      </SheetContent>
    </Sheet>
  );
}
