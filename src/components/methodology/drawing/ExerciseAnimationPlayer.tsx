'use client';

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
  const speed = animation.playbackSpeed ?? 1;
  const elapsedMs = elapsedMsFromGlobalProgress(progress, animation) * speed;
  const playback = getAnimationPlaybackState(animation, elapsedMs, animation.loop);
  const sceneCount = animation.scenes.length;
  const cycleMs = getAnimationCycleDuration(animation);

  const handleToggle = () => {
    if (!playing) {
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
    </div>
  );
}

export function getInitialAnimationProgress(document: ExerciseDrawingDocument): number {
  if (!document.animation) return 0;
  return 0;
}
