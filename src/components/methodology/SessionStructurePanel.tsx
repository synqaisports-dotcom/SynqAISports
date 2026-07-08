'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Flame, Pencil, Target, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sessionStructureSummary } from '@/lib/periodization';
import {
  countFilledSlots,
  resolveMainTasksPerSession,
  slotDisplayLabel,
  type SlotRowBase,
} from '@/lib/microcycle-sessions';
import type { SlotType } from '@/lib/methodology';
import { cn } from '@/lib/utils';

export type SessionSlotView = SlotRowBase & {
  linkedTitle?: string | null;
};

type Props = {
  microcycleId: string;
  sessionIndex: number;
  slots: SessionSlotView[];
  mainTasksPerSession: 2 | 3;
  activeSlotId: string | null;
  onSelectSlot: (slotId: string) => void;
};

const listItemClass = (active: boolean) =>
  cn(
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
    active
      ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
      : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
  );

function SlotListIcon({ slotType, assigned }: { slotType: SlotType; assigned: boolean }) {
  const Icon = slotType === 'warmup' ? Flame : slotType === 'cooldown' ? Wind : Target;

  return (
    <div
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5',
        assigned && 'border-emerald-500/30 bg-emerald-500/10'
      )}
    >
      <Icon className={cn('size-4', assigned ? 'text-emerald-400' : 'text-primary/80')} strokeWidth={1.5} />
    </div>
  );
}

export function SessionStructurePanel({
  microcycleId,
  sessionIndex,
  slots,
  mainTasksPerSession,
  activeSlotId,
  onSelectSlot,
}: Props) {
  const filled = countFilledSlots(slots);

  return (
    <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">Estructura · Sesión {sessionIndex}</CardTitle>
        <CardDescription>
          {sessionStructureSummary(mainTasksPerSession)} · {filled}/{slots.length} asignadas
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
        <ul className="space-y-1.5">
          {slots.map((slot) => {
            const label = slotDisplayLabel(slot.slot_type as SlotType, slot.order_index);
            const assigned = Boolean(slot.exercise_id || slot.title?.trim());
            const active = activeSlotId === slot.id;
            const exerciseTitle = slot.linkedTitle || slot.title;

            return (
              <li key={slot.id}>
                <button
                  type="button"
                  onClick={() => onSelectSlot(slot.id)}
                  className={listItemClass(active)}
                >
                  <SlotListIcon slotType={slot.slot_type as SlotType} assigned={assigned} />
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
                      {assigned ? (
                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                      ) : (
                        <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      {exerciseTitle ? (
                        <>
                          <span aria-hidden className="text-muted-foreground/40">
                            ·
                          </span>
                          <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
                            {exerciseTitle}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin asignar</span>
                      )}
                    </span>
                  </span>
                  <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-70" />
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>

      {activeSlotId ? (
        <div className="border-t border-primary/15 p-4">
          <Button type="button" variant="outline" size="sm" className="w-full" asChild>
            <Link
              href={`/portal/metodologia/microciclos/${microcycleId}/sesiones/${sessionIndex}/slots/${activeSlotId}`}
            >
              Editar ficha del slot
            </Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function resolveMainTasksForMicro(meta: {
  main_tasks_per_session?: number | null;
  plan_variant_id?: string | null;
}): 2 | 3 {
  return resolveMainTasksPerSession(meta);
}
