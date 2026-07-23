'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, X } from 'lucide-react';
import {
  ExerciseAnimationControls,
  ExerciseAnimationPlayer,
} from '@/components/methodology/drawing/ExerciseAnimationPlayer';
import {
  FIELD_TEMPLATES,
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

const CONTROLS_HIDE_MS = 2800;

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
    <CinemaAnimationOverlay
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

function CinemaAnimationOverlay({
  title,
  document: drawingDocument,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fieldLabel = FIELD_TEMPLATES[drawingDocument.field].label;
  const sceneCount = drawingDocument.animation?.scenes.length ?? 0;

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    if (!playing) return;
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS);
  }, [clearHideTimer, playing]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (!playing) {
      clearHideTimer();
      setControlsVisible(true);
      return;
    }
    scheduleHide();
    return clearHideTimer;
  }, [playing, scheduleHide, clearHideTimer]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(window.document.fullscreenElement));
    };
    window.document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => window.document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!window.document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await window.document.exitFullscreen();
      }
    } catch {
      /* ignorar si el navegador no permite pantalla completa */
    }
  };

  const handleStagePointer = () => {
    if (controlsVisible && playing) {
      setControlsVisible(false);
      clearHideTimer();
      return;
    }
    revealControls();
  };

  const handleTogglePlay = () => {
    if (!playing && progress >= 0.999) {
      onProgressChange(0);
    }
    onPlayingChange(!playing);
    revealControls();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#060a12] text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Animación: ${title}`}
      onMouseMove={playing ? revealControls : undefined}
    >
      <div className="absolute inset-0">
        <ExerciseAnimationPlayer
          document={drawingDocument}
          playing={playing}
          onPlayingChange={onPlayingChange}
          progress={progress}
          onProgressChange={onProgressChange}
          className="h-full w-full"
        />
      </div>

      <button
        type="button"
        className="absolute inset-0 z-10 cursor-default"
        aria-label={controlsVisible ? 'Ocultar controles' : 'Mostrar controles'}
        onClick={handleStagePointer}
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-20 transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-3 py-3 sm:px-5">
          <div className="min-w-0 pt-0.5">
            <h2 className="truncate text-sm font-semibold sm:text-base">{title}</h2>
            <p className="mt-0.5 text-[11px] text-white/55">
              {fieldLabel} · {sceneCount} escenas
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void toggleFullscreen();
              }}
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-black/50 hover:text-white"
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/80 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-black/50 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </button>
          </div>
        </header>

        {!playing ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleTogglePlay();
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/20 text-cyan-100 shadow-[0_8px_40px_rgba(34,211,238,0.25)] backdrop-blur-md transition-transform hover:scale-105 hover:bg-cyan-400/30 sm:size-[4.5rem]"
            aria-label="Reproducir animación"
          >
            <Play className="ml-1 size-7 fill-current sm:size-8" />
          </button>
        ) : null}

        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6"
          onClick={(event) => event.stopPropagation()}
        >
          <ExerciseAnimationControls
            document={drawingDocument}
            playing={playing}
            onPlayingChange={onPlayingChange}
            progress={progress}
            onProgressChange={onProgressChange}
            variant="cinema"
            onInteract={revealControls}
          />
        </div>
      </div>
    </div>
  );
}
