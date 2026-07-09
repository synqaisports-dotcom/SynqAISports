'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { DrawingPreviewFrame } from '@/components/methodology/drawing/DrawingPreviewFrame';
import { Badge } from '@/components/ui/badge';
import {
  drawingDocumentIsEmpty,
  parseExerciseDrawing,
} from '@/lib/exercise-drawing';
import {
  parseExerciseSheet,
  SHEET_FIELD_LABELS,
  TASK_TYPE_LABELS,
  type TaskType,
} from '@/lib/exercise-sheet';
import { cn } from '@/lib/utils';

export type ExercisePreviewRecord = {
  id: string;
  title: string;
  task_type?: string | null;
  objectives?: string | null;
  sheet_json?: unknown;
  drawing_json?: unknown;
  duration_min?: number;
};

type Props = {
  exercise: ExercisePreviewRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 whitespace-pre-wrap text-sm', value.trim() ? 'text-foreground' : 'text-muted-foreground')}>
        {value.trim() || '—'}
      </p>
    </div>
  );
}

export function ExercisePreviewOverlay({ exercise, open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open || !exercise) return null;

  const sheet = parseExerciseSheet(exercise.sheet_json);
  const durationMin = typeof exercise.duration_min === 'number' ? exercise.duration_min : 15;
  const taskType = (exercise.task_type as TaskType | undefined) ?? sheet.taskType;
  const taskLabel = TASK_TYPE_LABELS[taskType] ?? 'Tarea principal';
  const drawingDoc = parseExerciseDrawing(exercise.drawing_json);
  const hasDrawing = !drawingDocumentIsEmpty(drawingDoc);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={`Previsualización: ${exercise.title}`}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-primary/20 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {exercise.title}
            </h2>
            <Badge variant="outline" className="border-primary/25 text-[10px]">
              {taskLabel}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {sheet.conditionalGrid.time || `${durationMin} min`}
            {sheet.didacticStrategy ? ` · ${sheet.didacticStrategy}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          aria-label="Cerrar previsualización"
          title="Cerrar"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="flex min-h-[40vh] items-center justify-center border-b border-primary/15 bg-[#060a12] p-4 lg:min-h-0 lg:border-b-0 lg:border-r">
          {hasDrawing ? (
            <DrawingPreviewFrame
              document={drawingDoc}
              orientation="horizontal"
              className="h-full max-h-full w-full max-w-full"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin esquema en pizarra</p>
          )}
        </div>

        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            <div className={sectionClass}>
              <PreviewField
                label={SHEET_FIELD_LABELS.objectives}
                value={sheet.objectives || exercise.objectives || ''}
              />
              <div className="mt-4">
                <PreviewField label={SHEET_FIELD_LABELS.didacticStrategy} value={sheet.didacticStrategy} />
              </div>
            </div>

            <div className={sectionClass}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contenido condicional
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <PreviewField label={SHEET_FIELD_LABELS.conditionalContent} value={sheet.conditionalGrid.conditionalContent} />
                <PreviewField label={SHEET_FIELD_LABELS.time} value={sheet.conditionalGrid.time} />
                <PreviewField label={SHEET_FIELD_LABELS.space} value={sheet.conditionalGrid.space} />
                <PreviewField label={SHEET_FIELD_LABELS.gameSituation} value={sheet.conditionalGrid.gameSituation} />
                <PreviewField label={SHEET_FIELD_LABELS.coordination} value={sheet.conditionalGrid.coordination} />
              </div>
            </div>

            <div className={`${sectionClass} grid gap-4 sm:grid-cols-3`}>
              <PreviewField label={SHEET_FIELD_LABELS.technicalAction} value={sheet.technicalAction} />
              <PreviewField label={SHEET_FIELD_LABELS.tacticalAction} value={sheet.tacticalAction} />
              <PreviewField label={SHEET_FIELD_LABELS.collectiveContent} value={sheet.collectiveContent} />
            </div>

            <div className={sectionClass}>
              <PreviewField label={SHEET_FIELD_LABELS.description} value={sheet.description} />
            </div>

            <div className={sectionClass}>
              <PreviewField label={SHEET_FIELD_LABELS.rules} value={sheet.rules} />
              <div className="mt-4">
                <PreviewField label={SHEET_FIELD_LABELS.coachingCues} value={sheet.coachingCues} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
