'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, FileText, Flame, Target, Wind } from 'lucide-react';
import {
  ExercisePreviewOverlay,
  type ExercisePreviewRecord,
} from '@/components/methodology/ExercisePreviewOverlay';
import { loadOrHydrateDemoMicrocycle } from '@/lib/demo-microcycle-hydrate';
import type { SlotType } from '@/lib/methodology';
import {
  groupSlotsBySession,
  resolveMicrocycleSessions,
  slotDisplayLabel,
  type SlotRowBase,
} from '@/lib/microcycle-sessions';
import { resolveSlotExercisePreview } from '@/lib/resolve-slot-exercise-preview';
import { cn } from '@/lib/utils';

type Props = {
  microcycleId: string;
  mccLabel: string;
  weekStart: string;
  weekEnd: string;
  initialSessionIndex?: number;
};

const sessionButtonClass = (active: boolean) =>
  cn(
    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10'
      : 'border-primary/15 bg-background/30 hover:border-primary/35 hover:bg-primary/5'
  );

const viewFichaButtonClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-background/40 text-muted-foreground transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35';

function SlotIcon({ slotType, assigned }: { slotType: SlotType; assigned: boolean }) {
  const Icon = slotType === 'warmup' ? Flame : slotType === 'cooldown' ? Wind : Target;

  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/5',
        assigned && 'border-emerald-500/30 bg-emerald-500/10'
      )}
    >
      <Icon className={cn('size-4', assigned ? 'text-emerald-400' : 'text-primary/80')} strokeWidth={1.5} />
    </div>
  );
}

export function CoachMicrocycleReadonlyView({
  microcycleId,
  mccLabel,
  weekStart,
  weekEnd,
  initialSessionIndex = 1,
}: Props) {
  const [sessionIndex, setSessionIndex] = useState(initialSessionIndex);
  const [micro, setMicro] = useState(() => loadOrHydrateDemoMicrocycle(microcycleId));
  const [previewExercise, setPreviewExercise] = useState<ExercisePreviewRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setMicro(loadOrHydrateDemoMicrocycle(microcycleId));
  }, [microcycleId]);

  useEffect(() => {
    setSessionIndex(initialSessionIndex);
    setPreviewOpen(false);
    setPreviewExercise(null);
  }, [microcycleId, initialSessionIndex]);

  if (!micro) {
    return (
      <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
        Este microciclo aún no tiene contenido planificado.
      </p>
    );
  }

  const sessionsCount = resolveMicrocycleSessions(micro);
  const grouped = groupSlotsBySession(micro.slots);
  const slots = grouped.get(sessionIndex) ?? [];

  const openExercisePreview = (slot: SlotRowBase) => {
    const record = resolveSlotExercisePreview(slot);
    if (!record) return;
    setPreviewExercise(record);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-foreground">
          {mccLabel} · {micro.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {weekStart} → {weekEnd}
        </p>
        <p className="mt-1 text-xs text-primary">Vista de entrenador · solo lectura</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: sessionsCount }, (_, index) => index + 1).map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setSessionIndex(index);
              setPreviewOpen(false);
              setPreviewExercise(null);
            }}
            className={sessionButtonClass(sessionIndex === index)}
          >
            Sesión {index}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {slots.length === 0 ? (
          <li className="rounded-lg border border-dashed border-primary/20 px-3 py-4 text-sm text-muted-foreground">
            Sin tareas planificadas en esta sesión.
          </li>
        ) : (
          slots.map((slot) => {
            const assigned = Boolean(slot.exercise_id || slot.title?.trim());
            const preview = resolveSlotExercisePreview(slot);
            return (
              <li
                key={slot.id}
                className="flex items-center gap-3 rounded-lg border border-primary/15 bg-background/20 px-3 py-2.5"
              >
                <SlotIcon slotType={slot.slot_type as SlotType} assigned={assigned} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {assigned ? (
                      <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                    )}
                    {slotDisplayLabel(slot.slot_type as SlotType, slot.order_index)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {slot.title?.trim() || 'Sin asignar'}
                  </p>
                </div>
                <button
                  type="button"
                  className={viewFichaButtonClass}
                  title={preview ? 'Ver ficha del ejercicio' : 'Sin ficha disponible'}
                  aria-label="Ver ficha del ejercicio"
                  disabled={!preview}
                  onClick={() => openExercisePreview(slot)}
                >
                  <FileText className="size-3.5" />
                </button>
              </li>
            );
          })
        )}
      </ul>

      <ExercisePreviewOverlay
        exercise={previewExercise}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
