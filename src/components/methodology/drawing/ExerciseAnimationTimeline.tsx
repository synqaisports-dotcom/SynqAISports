'use client';

import { useEffect, useState } from 'react';
import { Film, Plus, Trash2 } from 'lucide-react';
import {
  MAX_ANIMATION_SCENES,
  type ExerciseDrawingDocument,
} from '@/lib/exercise-drawing';
import { cn } from '@/lib/utils';

const GLASS = {
  panel:
    'border border-cyan-400/40 bg-cyan-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
  btn: 'border border-cyan-400/35 bg-cyan-400/[0.07] text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-200',
  btnActive:
    'border-cyan-400/80 bg-cyan-400/20 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_20px_rgba(34,211,238,0.28)]',
  iconBtn:
    'flex items-center justify-center rounded-full border border-cyan-400/45 bg-cyan-400/[0.1] text-cyan-300 shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all hover:border-cyan-400/65 hover:bg-cyan-400/16 hover:text-cyan-100',
  danger:
    'border-red-400/45 bg-red-500/12 text-red-300 backdrop-blur-md transition-all hover:border-red-400/60 hover:bg-red-500/22',
} as const;

type Props = {
  doc: ExerciseDrawingDocument;
  activeSceneIndex: number;
  onEnableAnimation: () => void;
  onDisableAnimation: () => void;
  onSwitchScene: (index: number) => void;
  onDuplicateFrame: () => void;
  onDeleteFrame: () => void;
};

export function ExerciseAnimationTimeline({
  doc,
  activeSceneIndex,
  onEnableAnimation,
  onDisableAnimation,
  onSwitchScene,
  onDuplicateFrame,
  onDeleteFrame,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const animationActive = Boolean(doc.animation?.scenes.length);
  const sceneCount = doc.animation?.scenes.length ?? 0;

  useEffect(() => {
    if (animationActive) setPanelOpen(true);
  }, [animationActive]);

  const handleFilmClick = (event: React.MouseEvent) => {
    if (event.shiftKey && animationActive) {
      onDisableAnimation();
      setPanelOpen(false);
      return;
    }
    if (!animationActive) {
      onEnableAnimation();
      setPanelOpen(true);
      return;
    }
    setPanelOpen((open) => !open);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleFilmClick}
        className={cn('flex size-10 items-center justify-center', GLASS.iconBtn, animationActive && GLASS.btnActive)}
        title={
          animationActive
            ? 'Fotogramas (Shift+clic para desactivar animación)'
            : 'Activar animación por fotogramas'
        }
        aria-label="Animación"
        aria-expanded={panelOpen}
      >
        <Film className="size-4" />
      </button>

      {panelOpen && animationActive ? (
        <div
          className={cn(
            'flex max-h-[7.5rem] flex-col items-center gap-1 overflow-y-auto rounded-2xl p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            GLASS.panel
          )}
        >
          {doc.animation!.scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSwitchScene(index)}
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums',
                index === activeSceneIndex ? GLASS.btnActive : GLASS.btn
              )}
              title={`Fotograma ${index + 1}`}
              aria-label={`Fotograma ${index + 1}`}
              aria-current={index === activeSceneIndex ? 'step' : undefined}
            >
              {index + 1}
            </button>
          ))}

          {sceneCount < MAX_ANIMATION_SCENES ? (
            <button
              type="button"
              onClick={onDuplicateFrame}
              className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', GLASS.iconBtn)}
              title="Duplicar escena actual y editar la siguiente"
              aria-label="Duplicar escena"
            >
              <Plus className="size-4" />
            </button>
          ) : null}

          {sceneCount > 1 ? (
            <button
              type="button"
              onClick={onDeleteFrame}
              className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', GLASS.danger)}
              title="Eliminar fotograma actual"
              aria-label="Eliminar fotograma"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
