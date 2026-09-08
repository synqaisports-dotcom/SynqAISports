'use client';

import { Pause, Play } from 'lucide-react';
import { DrawingKonvaAnimator } from '@/components/methodology/drawing/DrawingKonvaAnimator';
import {
  elapsedMsFromGlobalProgress,
  getAnimationCycleDuration,
  getAnimationPlaybackState,
} from '@/lib/exercise-animation';
import {
  animationSceneLabel,
  type ExerciseDrawingDocument,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

type Props = {
  document: ExerciseDrawingDocument;
  className?: string;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
};

export function ExerciseAnimationPlayer(props: Props) {
  return <DrawingKonvaAnimator {...props} />;
}

type ControlsProps = {
  document: ExerciseDrawingDocument;
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
  progress: number;
  onProgressChange: (progress: number) => void;
  className?: string;
  variant?: 'default' | 'cinema';
  onInteract?: () => void;
};

export function ExerciseAnimationControls({
  document,
  playing,
  onPlayingChange,
  progress,
  onProgressChange,
  className,
  variant = 'default',
  onInteract,
}: ControlsProps) {
  const animation = document.animation!;
  const speed = animation.playbackSpeed ?? 1;
  const elapsedMs = elapsedMsFromGlobalProgress(progress, animation) * speed;
  const playback = getAnimationPlaybackState(animation, elapsedMs, animation.loop);
  const sceneCount = animation.scenes.length;
  const cycleMs = getAnimationCycleDuration(animation);
  const isCinema = variant === 'cinema';

  const handleToggle = () => {
    if (!playing) {
      const atEnd = progress >= 0.999;
      if (atEnd && cycleMs > 0) onProgressChange(0);
    }
    onPlayingChange(!playing);
    onInteract?.();
  };

  return (
    <div className={cn(isCinema ? 'space-y-2' : 'space-y-3', className)}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'flex shrink-0 items-center justify-center rounded-full transition-colors',
            isCinema
              ? 'size-9 border border-white/20 bg-white/10 text-white hover:bg-white/20'
              : 'size-10 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
          )}
          aria-label={playing ? 'Pausar animación' : 'Reproducir animación'}
        >
          {playing ? (
            <Pause className={cn(isCinema ? 'size-4' : 'size-3.5')} />
          ) : (
            <Play className={cn('fill-current', isCinema ? 'ml-0.5 size-4' : 'ml-0.5 size-3.5')} />
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
            onInteract?.();
          }}
          className={cn(
            'min-w-0 flex-1',
            isCinema ? 'h-1 accent-cyan-300' : 'accent-primary'
          )}
          aria-label="Progreso de la animación"
        />
        <span
          className={cn(
            'shrink-0 tabular-nums',
            isCinema ? 'text-[11px] text-white/60' : 'text-xs text-muted-foreground'
          )}
        >
          {playback.sceneIndex + 1}/{sceneCount}
        </span>
      </div>
      {!isCinema ? (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {animation.scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => {
                onPlayingChange(false);
                const segmentMs =
                  index === 0
                    ? 0
                    : index * animation.holdMs + (index - 1) * animation.transitionMs;
                onProgressChange(cycleMs > 0 ? segmentMs / cycleMs : 0);
              }}
              className={cn(
                'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
                playback.sceneIndex === index
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-primary/20 text-muted-foreground hover:border-primary/35 hover:text-foreground'
              )}
            >
              {animationSceneLabel(scene, index)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function getInitialAnimationProgress(document: ExerciseDrawingDocument): number {
  if (!document.animation) return 0;
  return 0;
}
