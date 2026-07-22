'use client';

import { Film, Plus, Trash2 } from 'lucide-react';
import {
  MAX_ANIMATION_SCENES,
  animationSceneLabel,
  type DrawingAnimationScene,
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
  onToggleAnimation: () => void;
  onSwitchScene: (index: number) => void;
  onAddFrame: () => void;
  onDeleteFrame: () => void;
};

export function ExerciseAnimationTimeline({
  doc,
  activeSceneIndex,
  onToggleAnimation,
  onSwitchScene,
  onAddFrame,
  onDeleteFrame,
}: Props) {
  const animationEnabled = Boolean(doc.animation && doc.animation.scenes.length >= 2);
  const scenes: DrawingAnimationScene[] = doc.animation?.scenes ?? [];
  const sceneCount = scenes.length;

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-3 bottom-[6.25rem] z-35 sm:inset-x-6',
        'flex max-w-full items-center gap-2'
      )}
    >
      <button
        type="button"
        onClick={onToggleAnimation}
        className={cn(
          'pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium',
          GLASS.panel,
          animationEnabled ? GLASS.btnActive : GLASS.btn
        )}
        title={animationEnabled ? 'Desactivar animación' : 'Activar animación por fotogramas'}
      >
        <Film className="size-3.5" />
        <span className="hidden sm:inline">Animación</span>
      </button>

      {animationEnabled ? (
        <div
          className={cn(
            'pointer-events-auto flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto rounded-2xl px-2 py-1.5',
            GLASS.panel,
            '[scrollbar-width:thin]'
          )}
        >
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSwitchScene(index)}
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-all',
                index === activeSceneIndex ? GLASS.btnActive : GLASS.btn
              )}
              title={`Fotograma ${animationSceneLabel(scene, index)}`}
            >
              {animationSceneLabel(scene, index)}
            </button>
          ))}
          {sceneCount < MAX_ANIMATION_SCENES ? (
            <button
              type="button"
              onClick={onAddFrame}
              className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', GLASS.iconBtn)}
              title="Añadir fotograma desde el estado actual"
              aria-label="Añadir fotograma"
            >
              <Plus className="size-3.5" />
            </button>
          ) : null}
          {sceneCount > 2 ? (
            <button
              type="button"
              onClick={onDeleteFrame}
              className={cn('flex size-8 shrink-0 items-center justify-center rounded-full', GLASS.danger)}
              title="Eliminar fotograma actual"
              aria-label="Eliminar fotograma"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : (
        <p className="pointer-events-none hidden text-[11px] text-cyan-300/60 sm:block">
          Activa animación para definir fotogramas del ejercicio
        </p>
      )}
    </div>
  );
}
