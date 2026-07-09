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
  /** Vista compacta en formulario split: solo campo + icono de acción arriba a la derecha */
  compact?: boolean;
};

const canvasActionClass =
  'inline-flex size-10 items-center justify-center rounded-full border border-primary/40 bg-background/90 text-primary shadow-lg backdrop-blur-sm transition-colors hover:border-primary hover:bg-primary/15';

export function ExerciseDrawingTrigger({
  name = 'drawingJson',
  initialData,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState(() => serializeExerciseDrawing(parseExerciseDrawing(initialData)));

  const doc = useMemo(() => parseExerciseDrawing(JSON.parse(json)), [json]);
  const isEmpty = drawingDocumentIsEmpty(doc);
  const previewAspect = drawingPreviewAspectRatio(doc.field);

  if (compact) {
    return (
      <div className="relative w-full">
        {!isEmpty ? (
          <DrawingPreviewFrame document={doc} className="w-full" />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-center rounded-md border border-dashed border-primary/30 bg-[#060a12] text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
            style={{ aspectRatio: previewAspect }}
            aria-label="Crear dibujo en la pizarra"
          >
            Sin esquema — pulsa el icono superior
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(canvasActionClass, 'absolute right-3 top-3 z-10')}
          aria-label={isEmpty ? 'Crear dibujo' : 'Modificar dibujo'}
          title={isEmpty ? 'Crear dibujo' : 'Modificar dibujo'}
        >
          {isEmpty ? <PenLine className="size-4" /> : <Pencil className="size-4" />}
        </button>

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

  return (
    <div className="space-y-3">
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

      {!isEmpty ? <DrawingPreviewFrame document={doc} className="w-full opacity-95" /> : null}

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
