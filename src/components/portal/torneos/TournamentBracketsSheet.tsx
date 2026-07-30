'use client';

import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { TournamentCategoryBrackets } from '@/components/portal/torneos/TournamentCategoryBrackets';
import type { TournamentBundle } from '@/lib/tournaments';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GitBranch } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
  categoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TournamentBracketsSheet({ bundle, categoryId, open, onOpenChange }: Props) {
  const category = bundle.categories.find((c) => c.id === categoryId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="full" side="right">
        <PortalSheetHeader>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="size-5 text-cyan-300" />
              Cruces eliminatorios — {category?.name ?? 'Torneo'}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Cada bandeja (Platinum, Gold, Silver…) con su cuadro de eliminatorias completo.
            </p>
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody className="max-w-[1400px]">
          {category ? <TournamentCategoryBrackets bundle={bundle} category={category} /> : null}
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
