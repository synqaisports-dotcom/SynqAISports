'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, FileText, Flame, Target, Wind } from 'lucide-react';
import {
  ExercisePreviewOverlay,
  type ExercisePreviewRecord,
} from '@/components/methodology/ExercisePreviewOverlay';
import { DrawingPreviewFrame } from '@/components/methodology/drawing/DrawingPreviewFrame';
import { loadOrHydrateDemoMicrocycle } from '@/lib/demo-microcycle-hydrate';
import { drawingDocumentIsEmpty, parseExerciseDrawing } from '@/lib/exercise-drawing';
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

const sectionTitleClass =
  'text-[10px] font-semibold uppercase tracking-wider text-primary';

const sessionButtonClass = (active: boolean) =>
  cn(
    'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
    active
      ? 'border-primary/55 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
      : 'border-primary/15 bg-background/30 hover:border-primary/35 hover:bg-primary/5'
  );

const viewFichaButtonClass =
  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-background/40 text-muted-foreground transition-colors hover:border-primary/45 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35';

function pickDefaultSlotId(slots: SlotRowBase[]): string | null {
  if (slots.length === 0) return null;
  const withPreview = slots.find((slot) => resolveSlotExercisePreview(slot));
  return (withPreview ?? slots[0]).id;
}

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
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<ExercisePreviewRecord | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setMicro(loadOrHydrateDemoMicrocycle(microcycleId));
  }, [microcycleId]);

  useEffect(() => {
    setSessionIndex(initialSessionIndex);
    setPreviewOpen(false);
    setPreviewExercise(null);
    setSelectedSlotId(null);
  }, [microcycleId, initialSessionIndex]);

  const sessionsCount = micro ? resolveMicrocycleSessions(micro) : 0;
  const slots = useMemo(() => {
    if (!micro) return [];
    const grouped = groupSlotsBySession(micro.slots);
    return grouped.get(sessionIndex) ?? [];
  }, [micro, sessionIndex]);

  useEffect(() => {
    setSelectedSlotId((current) => {
      if (current && slots.some((slot) => slot.id === current)) return current;
      return pickDefaultSlotId(slots);
    });
  }, [sessionIndex, slots]);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [slots, selectedSlotId]
  );

  const selectedPreview = useMemo(
    () => (selectedSlot ? resolveSlotExercisePreview(selectedSlot) : null),
    [selectedSlot]
  );

  const drawingDoc = useMemo(
    () => parseExerciseDrawing(selectedPreview?.drawing_json),
    [selectedPreview]
  );
  const hasDrawing = !drawingDocumentIsEmpty(drawingDoc);

  const openExercisePreview = (slot: SlotRowBase) => {
    const record = resolveSlotExercisePreview(slot);
    if (!record) return;
    setPreviewExercise(record);
    setPreviewOpen(true);
  };

  if (!micro) {
    return (
      <p className="portal-section-surface rounded-xl border border-dashed border-primary/25 p-6 text-center text-sm text-muted-foreground">
        Este microciclo aún no tiene contenido planificado.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="portal-section-surface rounded-xl p-4">
        <p className={sectionTitleClass}>Semana planificada</p>
        <p className="mt-2 text-lg font-semibold text-foreground">
          {mccLabel} · {micro.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {weekStart} → {weekEnd}
        </p>
        <p className="mt-2 text-xs text-primary/90">Vista de entrenador · solo lectura</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: sessionsCount }, (_, index) => index + 1).map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setSessionIndex(index);
                setPreviewOpen(false);
                setPreviewExercise(null);
                setSelectedSlotId(null);
              }}
              className={sessionButtonClass(sessionIndex === index)}
            >
              Sesión {index}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-h-[min(70vh,560px)] grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="portal-section-surface flex min-h-0 flex-col rounded-xl p-4">
          <p className={sectionTitleClass}>Sesión {sessionIndex}</p>
          <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
            {slots.length === 0 ? (
              <li className="rounded-lg border border-dashed border-primary/25 bg-background/20 px-3 py-4 text-sm text-muted-foreground">
                Sin tareas planificadas en esta sesión.
              </li>
            ) : (
              slots.map((slot) => {
                const assigned = Boolean(slot.exercise_id || slot.title?.trim());
                const preview = resolveSlotExercisePreview(slot);
                const isSelected = slot.id === selectedSlotId;

                return (
                  <li key={slot.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35)]'
                          : 'border-primary/20 bg-background/25 hover:border-primary/35 hover:bg-primary/5'
                      )}
                    >
                      <SlotIcon slotType={slot.slot_type as SlotType} assigned={assigned} />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide text-primary">
                          {assigned ? (
                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="size-3.5 shrink-0 text-muted-foreground/50" />
                          )}
                          {slotDisplayLabel(slot.slot_type as SlotType, slot.order_index)}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-white">
                          {slot.title?.trim() || 'Sin asignar'}
                        </p>
                      </div>
                      <span
                        role="button"
                        tabIndex={preview ? 0 : -1}
                        className={viewFichaButtonClass}
                        title={preview ? 'Ver ficha del ejercicio' : 'Sin ficha disponible'}
                        aria-label="Ver ficha del ejercicio"
                        aria-disabled={!preview}
                        onClick={(event) => {
                          event.stopPropagation();
                          openExercisePreview(slot);
                        }}
                        onKeyDown={(event) => {
                          if (!preview) return;
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            openExercisePreview(slot);
                          }
                        }}
                      >
                        <FileText className="size-3.5" />
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="portal-section-surface flex min-h-0 flex-col rounded-xl p-4">
          <p className={sectionTitleClass}>Plano del ejercicio</p>
          <div className="mt-3 flex min-h-0 flex-1 flex-col">
            {selectedPreview ? (
              <>
                <p className="truncate text-sm font-medium text-white">{selectedPreview.title}</p>
                <div className="exercise-field-pitch mt-3 min-h-0 flex-1">
                  {hasDrawing ? (
                    <DrawingPreviewFrame
                      document={drawingDoc}
                      orientation="horizontal"
                      className="h-full w-full"
                    />
                  ) : (
                    <p className="flex h-full min-h-[200px] items-center justify-center rounded-lg border border-dashed border-primary/25 bg-background/20 px-4 text-center text-sm text-muted-foreground">
                      Sin esquema en pizarra para este ejercicio.
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-primary/25 bg-background/20 px-4 py-10 text-center text-sm text-muted-foreground">
                Selecciona una parte de la sesión para ver el plano.
              </p>
            )}
          </div>
        </div>
      </div>

      <ExercisePreviewOverlay
        exercise={previewExercise}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
