'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExerciseDrawingDocument, FieldTemplate } from '@/lib/exercise-drawing';
import {
  FIELD_TEMPLATES,
  drawingPreviewAspectRatio,
  drawingPreviewUsesPortraitRotation,
} from '@/lib/exercise-drawing';
import { DrawingKonvaReadonly } from '@/components/methodology/drawing/DrawingKonvaReadonly';
import { cn } from '@/lib/utils';

type Props = {
  document: ExerciseDrawingDocument;
  className?: string;
  fieldClassName?: string;
};

function KonvaPreviewCanvas({ document }: { document: ExerciseDrawingDocument }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && size.height > 0 ? (
        <DrawingKonvaReadonly document={document} width={size.width} height={size.height} />
      ) : null}
    </div>
  );
}

/** Miniatura del dibujo con el mismo motor Konva que la pizarra. */
export function DrawingPreviewFrame({ document, className }: Props) {
  const field: FieldTemplate = document.field;
  const { aspectRatio } = FIELD_TEMPLATES[field];
  const portrait = drawingPreviewUsesPortraitRotation(field);
  const previewAspect = drawingPreviewAspectRatio(field);

  const scene = <KonvaPreviewCanvas document={document} />;

  if (!portrait) {
    return (
      <div
        className={cn('relative overflow-hidden rounded-md bg-[#060a12]', className)}
        style={{ aspectRatio: previewAspect }}
      >
        {scene}
      </div>
    );
  }

  return (
    <div
      className={cn('relative mx-auto overflow-hidden rounded-md bg-[#060a12]', className)}
      style={{ aspectRatio: previewAspect }}
    >
      <div
        className="absolute left-1/2 top-1/2 h-full w-full"
        style={{
          aspectRatio,
          transform: 'translate(-50%, -50%) rotate(90deg)',
        }}
      >
        {scene}
      </div>
    </div>
  );
}
