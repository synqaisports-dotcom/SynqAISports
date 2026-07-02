'use client';

import { useMemo, useState } from 'react';
import { Pencil, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExerciseDrawingStudio } from '@/components/methodology/drawing/ExerciseDrawingStudio';
import { DrawingPreviewFrame } from '@/components/methodology/drawing/DrawingPreviewFrame';
import {
  drawingDocumentIsEmpty,
  drawingPreviewAspectRatio,
  parseExerciseDrawing,
  serializeExerciseDrawing,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  name?: string;
  initialData?: unknown;
  /** Vista compacta en formulario split (solo botón + miniatura) */
  compact?: boolean;
};

export function ExerciseDrawingTrigger({
  name = 'drawingJson',
  initialData,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState(() => serializeExerciseDrawing(parseExerciseDrawing(initialData)));

  const doc = useMemo(() => parseExerciseDrawing(JSON.parse(json)), [json]);
  const isEmpty = drawingDocumentIsEmpty(doc);

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isEmpty ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
          onClick={() => setOpen(true)}
        >
          {isEmpty ? (
            <>
              <PenLine className="size-4" />
              Crear dibujo
            </>
          ) : (
            <>
              <Pencil className="size-4" />
              Modificar dibujo
            </>
          )}
        </Button>
        {!isEmpty ? (
          <span className="text-xs text-muted-foreground">
            {doc.elements.length} elemento{doc.elements.length === 1 ? '' : 's'} ·{' '}
            {doc.field.replace('football-', 'campo ')}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sin esquema en la ficha</span>
        )}
      </div>

      {!isEmpty ? (
        <DrawingPreviewFrame document={doc} className="w-full max-w-xs opacity-95" />
      ) : compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-[105/68] w-full max-w-xs items-center justify-center rounded-lg border border-dashed border-primary/30 bg-muted/10 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
        >
          Pulsa para abrir la pizarra
        </button>
      ) : null}

      <input type="hidden" name={name} value={json} readOnly />

      <ExerciseDrawingStudio
        open={open}
        initialData={JSON.parse(json)}
        onClose={() => setOpen(false)}
        onSave={(next) => setJson(next)}
      />
    </div>
  );
}

/** Miniatura para listados e impresión */
export function ExerciseDrawingPreview({
  data,
  className,
}: {
  data: unknown;
  className?: string;
}) {
  const doc = parseExerciseDrawing(data);
  if (drawingDocumentIsEmpty(doc)) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-slate-900/50 text-[10px] text-muted-foreground ${className ?? ''}`}
        style={{ aspectRatio: drawingPreviewAspectRatio('football-full'), minHeight: 80 }}
      >
        Sin dibujo
      </div>
    );
  }

  return (
    <DrawingPreviewFrame
      document={doc}
      className={cn('rounded-lg border border-white/10', className)}
    />
  );
}
