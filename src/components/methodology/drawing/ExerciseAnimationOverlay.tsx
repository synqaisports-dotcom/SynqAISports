'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  ExerciseAnimationControls,
  ExerciseAnimationPlayer,
} from '@/components/methodology/drawing/ExerciseAnimationPlayer';
import { Badge } from '@/components/ui/badge';
import {
  FIELD_TEMPLATES,
  drawingPreviewAspectRatio,
  hasDrawableAnimation,
  parseExerciseDrawing,
  type ExerciseDrawingDocument,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  drawingJson: unknown;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExerciseAnimationOverlay({ title, drawingJson, open, onOpenChange }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const drawingDoc = parseExerciseDrawing(drawingJson);
  const canPlay = hasDrawableAnimation(drawingDoc);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setProgress(0);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
      if (event.key === ' ' && canPlay) {
        event.preventDefault();
        setPlaying((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange, canPlay]);

  if (!open || !canPlay || !drawingDoc.animation) return null;

  return (
    <AnimationOverlayContent
      title={title}
      document={drawingDoc}
      playing={playing}
      onPlayingChange={setPlaying}
      progress={progress}
      onProgressChange={setProgress}
      onClose={() => onOpenChange(false)}
    />
  );
}

function AnimationOverlayContent({
  title,
  document,
  playing,
  onPlayingChange,
  progress,
  onProgressChange,
  onClose,
}: {
  title: string;
  document: ExerciseDrawingDocument;
  playing: boolean;
  onPlayingChange: (value: boolean) => void;
  progress: number;
  onProgressChange: (value: number) => void;
  onClose: () => void;
}) {
  const previewAspect = drawingPreviewAspectRatio(document.field);
  const fieldLabel = FIELD_TEMPLATES[document.field].label;

  return (
    <div
      className="portal-dashboard fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Animación: ${title}`}
    >
      <header className="shrink-0 px-4 py-3 sm:px-6">
        <div className="portal-section-surface flex items-start justify-between gap-3 rounded-xl px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h2>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] text-primary">
                Animación
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {fieldLabel} · {document.animation?.scenes.length ?? 0} escenas · Espacio para pausar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6 sm:px-6">
        <div
          className={cn(
            'portal-section-surface mx-auto w-full max-w-5xl overflow-hidden rounded-xl',
            'bg-[#060a12]'
          )}
          style={{ aspectRatio: previewAspect, maxHeight: 'min(70vh, 52rem)' }}
        >
          <ExerciseAnimationPlayer
            document={document}
            playing={playing}
            onPlayingChange={onPlayingChange}
            progress={progress}
            onProgressChange={onProgressChange}
            className="h-full"
          />
        </div>

        <div className="portal-section-surface mx-auto w-full max-w-5xl rounded-xl p-4">
          <ExerciseAnimationControls
            document={document}
            playing={playing}
            onPlayingChange={onPlayingChange}
            progress={progress}
            onProgressChange={onProgressChange}
          />
        </div>
      </div>
    </div>
  );
}
