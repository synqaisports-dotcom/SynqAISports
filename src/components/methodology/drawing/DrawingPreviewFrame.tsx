import type { ExerciseDrawingDocument, FieldTemplate } from '@/lib/exercise-drawing';
import {
  FIELD_TEMPLATES,
  drawingPreviewUsesPortraitRotation,
} from '@/lib/exercise-drawing';
import { DrawingScene } from '@/components/methodology/drawing/DrawingScene';
import { FieldBackground } from '@/components/methodology/drawing/FieldBackground';
import { cn } from '@/lib/utils';

type Props = {
  document: ExerciseDrawingDocument;
  className?: string;
  fieldClassName?: string;
};

/** Miniatura del dibujo: rota 90° campos completos (F11, F7, sala) como captura. */
export function DrawingPreviewFrame({ document, className, fieldClassName }: Props) {
  const field: FieldTemplate = document.field;
  const { aspectRatio } = FIELD_TEMPLATES[field];
  const portrait = drawingPreviewUsesPortraitRotation(field);

  const scene = (
    <>
      <FieldBackground
        template={field}
        fill={portrait}
        className={cn(portrait ? 'h-full w-full' : 'w-full', fieldClassName)}
      />
      <div className="pointer-events-none absolute inset-0">
        <DrawingScene document={document} selectedId={null} />
      </div>
    </>
  );

  if (!portrait) {
    return (
      <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
        {scene}
      </div>
    );
  }

  return (
    <div
      className={cn('relative mx-auto overflow-hidden', className)}
      style={{ aspectRatio: 1 / aspectRatio }}
    >
      <div
        className="absolute left-1/2 top-1/2 w-full"
        style={{
          aspectRatio,
          transform: 'translate(-50%, -50%) rotate(90deg)',
        }}
      >
        <div className="relative h-full w-full">{scene}</div>
      </div>
    </div>
  );
}
