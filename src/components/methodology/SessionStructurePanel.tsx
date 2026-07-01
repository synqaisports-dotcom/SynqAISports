'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex h-full flex-col rounded-xl border border-primary/25 bg-muted/5">
      <div className="border-b border-primary/20 px-4 py-3">
        <h2 className="text-sm font-semibold">Estructura · Sesión {sessionIndex}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {sessionStructureSummary(mainTasksPerSession)} · {filled}/{slots.length} asignadas
        </p>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {slots.map((slot) => {
          const label = slotDisplayLabel(slot.slot_type as SlotType, slot.order_index);
          const assigned = Boolean(slot.exercise_id || slot.title?.trim());
          const active = activeSlotId === slot.id;

          return (
            <li key={slot.id}>
              <button
                type="button"
                onClick={() => onSelectSlot(slot.id)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors',
                  active
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-primary/15 hover:border-primary/35 hover:bg-primary/5'
                )}
              >
                <span className="flex items-center gap-2">
                  {assigned ? (
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                  )}
                  <span>
                    <span className="font-medium">{label}</span>
                    {slot.linkedTitle || slot.title ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {slot.linkedTitle || slot.title}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-xs text-muted-foreground">Sin asignar</span>
                    )}
                  </span>
                </span>
                <Pencil className="size-3.5 shrink-0 opacity-60" />
              </button>
            </li>
          );
        })}
      </ul>

      {activeSlotId ? (
        <div className="border-t border-primary/20 p-3">
          <Button type="button" variant="outline" size="sm" className="w-full" asChild>
            <Link
              href={`/portal/metodologia/microciclos/${microcycleId}/sesiones/${sessionIndex}/slots/${activeSlotId}`}
            >
              Editar ficha del slot
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function resolveMainTasksForMicro(meta: {
  main_tasks_per_session?: number | null;
  plan_variant_id?: string | null;
}): 2 | 3 {
  return resolveMainTasksPerSession(meta);
}
