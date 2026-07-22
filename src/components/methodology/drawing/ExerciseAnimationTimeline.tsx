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

/** Timeline vertical en lateral izquierdo — no interfiere con dock central ni selectores superiores. */
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
    <div className="pointer-events-none absolute left-4 top-[4.75rem] z-40 flex max-h-[calc(100vh-12rem)] flex-col gap-2">
      <button
        type="button"
        onClick={onToggleAnimation}
        className={cn(
          'pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium',
          GLASS.panel,
          animationEnabled ? GLASS.btnActive : GLASS.btn
        )}
        title={animationEnabled ? 'Desactivar animación' : 'Activar animación por fotogramas'}
      >
        <Film className="size-3.5 shrink-0" />
        <span>Animación</span>
      </button>

      {animationEnabled ? (
        <div
          className={cn(
            'pointer-events-auto flex min-h-0 flex-col gap-1.5 overflow-y-auto rounded-2xl p-2',
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
                'flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-semibold tabular-nums transition-all',
                index === activeSceneIndex ? GLASS.btnActive : GLASS.btn
              )}
              title={`Fotograma ${animationSceneLabel(scene, index)}`}
            >
              {animationSceneLabel(scene, index)}
            </button>
          ))}
          <div className="mt-1 flex flex-col gap-1.5 border-t border-cyan-400/20 pt-2">
            {sceneCount < MAX_ANIMATION_SCENES ? (
              <button
                type="button"
                onClick={onAddFrame}
                className={cn('flex size-9 items-center justify-center rounded-xl', GLASS.iconBtn)}
                title="Añadir fotograma"
                aria-label="Añadir fotograma"
              >
                <Plus className="size-4" />
              </button>
            ) : null}
            {sceneCount > 2 ? (
              <button
                type="button"
                onClick={onDeleteFrame}
                className={cn('flex size-9 items-center justify-center rounded-xl', GLASS.danger)}
                title="Eliminar fotograma actual"
                aria-label="Eliminar fotograma"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="pointer-events-none max-w-[7.5rem] text-[10px] leading-snug text-cyan-300/55">
          Fotogramas del movimiento del ejercicio
        </p>
      )}
    </div>
  );
}
