'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Film, Plus, Trash2 } from 'lucide-react';
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
    <>
      {/* Icono animación — alineado a la izquierda, debajo de cerrar */}
      <button
        type="button"
        onClick={handleFilmClick}
        className={cn(
          'pointer-events-auto absolute left-4 top-[4.5rem] z-40 flex size-10 items-center justify-center',
          GLASS.iconBtn,
          animationActive && GLASS.btnActive
        )}
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

      {/* Barra compacta abajo: solo escena actual + duplicar */}
      {panelOpen && animationActive ? (
        <div
          className={cn(
            'pointer-events-auto absolute bottom-[6.25rem] left-4 z-40',
            'flex items-center gap-1.5 rounded-2xl px-2 py-1.5',
            GLASS.panel
          )}
        >
          {sceneCount > 1 ? (
            <button
              type="button"
              disabled={activeSceneIndex <= 0}
              onClick={() => onSwitchScene(activeSceneIndex - 1)}
              className={cn('flex size-8 items-center justify-center rounded-full', GLASS.btn)}
              aria-label="Fotograma anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
          ) : null}

          <div
            className={cn(
              'flex size-9 items-center justify-center rounded-xl text-xs font-semibold tabular-nums',
              GLASS.btnActive
            )}
            title={`Fotograma ${activeSceneIndex + 1} de ${sceneCount}`}
          >
            {activeSceneIndex + 1}
          </div>

          {sceneCount > 1 ? (
            <button
              type="button"
              disabled={activeSceneIndex >= sceneCount - 1}
              onClick={() => onSwitchScene(activeSceneIndex + 1)}
              className={cn('flex size-8 items-center justify-center rounded-full', GLASS.btn)}
              aria-label="Fotograma siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          ) : null}

          {sceneCount < MAX_ANIMATION_SCENES ? (
            <button
              type="button"
              onClick={onDuplicateFrame}
              className={cn('flex size-9 items-center justify-center rounded-xl', GLASS.iconBtn)}
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
              className={cn('flex size-9 items-center justify-center rounded-xl', GLASS.danger)}
              title="Eliminar fotograma actual"
              aria-label="Eliminar fotograma"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
