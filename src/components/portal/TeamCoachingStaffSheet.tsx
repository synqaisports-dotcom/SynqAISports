'use client';

import Link from 'next/link';
import { UserCog } from 'lucide-react';
import {
  PortalSheetBody,
  PortalSheetContent,
  PortalSheetHeader,
} from '@/components/portal/PortalSheet';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { buildTeamCoachingStaffCards } from '@/lib/team-coaching-staff';
import type { StaffProfile } from '@/lib/staff-profile';
import { cn } from '@/lib/utils';

type Props = {
  team: { id: string; name: string; category: string } | null;
  staff: StaffProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TeamCoachingStaffSheet({ team, staff, open, onOpenChange }: Props) {
  const cards = team ? buildTeamCoachingStaffCards(team, staff) : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="lg">
        <PortalSheetHeader>
          <SheetHeader className="space-y-2 text-left">
            <SheetTitle className="text-xl tracking-tight">
              Cuerpo técnico · {team?.name ?? 'Equipo'}
            </SheetTitle>
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map(({ key, label, person }) => (
              <div key={key} className="portal-section-surface rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      {label}
                    </p>
                    {person ? (
                      <Link
                        href={`/portal/club/staff?person=${person.id}&team=${team?.id ?? ''}`}
                        className="mt-2 block text-sm font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {person.full_name}
                      </Link>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">Sin asignar</p>
                    )}
                    {person?.sport_role ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{person.sport_role}</p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                      person
                        ? 'border-primary/25 bg-primary/10 text-primary'
                        : 'border-primary/10 bg-muted/10 text-muted-foreground'
                    )}
                  >
                    <UserCog className="size-4" strokeWidth={1.75} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
