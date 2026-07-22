'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DrawingKonvaReadonly } from '@/components/methodology/drawing/DrawingKonvaReadonly';
import {
  elapsedMsFromGlobalProgress,
  getAnimationCycleDuration,
  getAnimationPlaybackState,
  getGlobalAnimationProgress,
} from '@/lib/exercise-animation';
import type { ExerciseDrawingDocument } from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  document: ExerciseDrawingDocument;
  className?: string;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
};

export function ExerciseAnimationPlayer({
  document,
  className,
  playing,
  onPlayingChange,
  progress,
  onProgressChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const animation = document.animation!;
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);

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

  useEffect(() => {
    baseElapsedRef.current = elapsedMsFromGlobalProgress(progress, animation);
  }, [progress, animation]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = baseElapsedRef.current + (now - startRef.current);
      const cycleMs = getAnimationCycleDuration(animation);
      const nextProgress = cycleMs > 0 ? (elapsed % cycleMs) / cycleMs : 0;
      onProgressChange(nextProgress);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, animation, onProgressChange]);

  const elapsedMs = elapsedMsFromGlobalProgress(progress, animation);
  const playback = useMemo(
    () => getAnimationPlaybackState(animation, elapsedMs, animation.loop),
    [animation, elapsedMs]
  );

  const frameDocument = useMemo(
    () => ({
      ...document,
      elements: playback.elements,
    }),
    [document, playback.elements]
  );

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      {size.width > 0 && size.height > 0 ? (
        <DrawingKonvaReadonly
          document={frameDocument}
          width={size.width}
          height={size.height}
          fit="fill-width-top"
        />
      ) : null}
    </div>
  );
}

type ControlsProps = {
  document: ExerciseDrawingDocument;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
  className?: string;
};

export function ExerciseAnimationControls({
  document,
  playing,
  onPlayingChange,
  progress,
  onProgressChange,
  className,
}: ControlsProps) {
  const animation = document.animation!;
  const elapsedMs = elapsedMsFromGlobalProgress(progress, animation);
  const playback = getAnimationPlaybackState(animation, elapsedMs, animation.loop);
  const sceneCount = animation.scenes.length;

  const handleToggle = () => {
    if (!playing) {
      const cycleMs = getAnimationCycleDuration(animation);
      const atEnd = progress >= 0.999;
      if (atEnd && cycleMs > 0) onProgressChange(0);
    }
    onPlayingChange(!playing);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          aria-label={playing ? 'Pausar animación' : 'Reproducir animación'}
        >
          {playing ? (
            <span className="text-xs font-semibold tracking-wider">II</span>
          ) : (
            <span className="ml-0.5 text-sm">▶</span>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(progress * 1000)}
          onChange={(event) => {
            onPlayingChange(false);
            onProgressChange(Number(event.target.value) / 1000);
          }}
          className="min-w-0 flex-1 accent-primary"
          aria-label="Progreso de la animación"
        />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {playback.sceneIndex + 1}/{sceneCount}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {animation.scenes.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            onClick={() => {
              onPlayingChange(false);
              const cycleMs = getAnimationCycleDuration(animation);
              const segmentMs =
                index === 0
                  ? 0
                  : index * animation.holdMs + (index - 1) * animation.transitionMs;
              onProgressChange(cycleMs > 0 ? segmentMs / cycleMs : 0);
            }}
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
              playback.sceneIndex === index
                ? 'border-primary/50 bg-primary/15 text-primary'
                : 'border-primary/20 text-muted-foreground hover:border-primary/35 hover:text-foreground'
            )}
          >
            {scene.label?.trim() || `Escena ${index + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getInitialAnimationProgress(document: ExerciseDrawingDocument): number {
  if (!document.animation) return 0;
  return getGlobalAnimationProgress(0, document.animation, document.animation.loop);
}
