'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  TACTICAL_SCENE_LABELS,
  type FormationPreset,
  type TacticalPhaseIndex,
} from '@/lib/drawing-formations';
import { cn } from '@/lib/utils';

const GLASS = {
  panel:
    'border border-cyan-400/40 bg-cyan-950/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
  btn: 'border border-cyan-400/35 bg-cyan-400/[0.07] text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-200',
  btnActive:
    'border-cyan-400/80 bg-cyan-400/20 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_20px_rgba(34,211,238,0.28)]',
  btnDisabled: 'cursor-not-allowed border-cyan-400/15 bg-cyan-950/10 text-cyan-500/40',
  label: 'text-[10px] font-medium uppercase tracking-wide text-cyan-400/55',
} as const;

type Props = {
  side: 'home' | 'away';
  teamLabel: string;
  selectedFormationId: string | null;
  activePhase: TacticalPhaseIndex;
  formations: FormationPreset[];
  playerImageSrc?: string;
  onFormationSelect: (formationId: string | null) => void;
  onPhaseSelect: (phase: TacticalPhaseIndex) => void;
};

export function FormationTeamPanel({
  side,
  teamLabel,
  selectedFormationId,
  activePhase,
  formations,
  playerImageSrc,
  onFormationSelect,
  onPhaseSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    selectedFormationId === null
      ? 'Sin formación'
      : formations.find((f) => f.id === selectedFormationId)?.label ?? 'Sin formación';

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  const hasFormation = Boolean(selectedFormationId);

  return (
    <div ref={rootRef} className="flex w-[5.75rem] flex-col items-stretch gap-1.5">
      <span className={cn(GLASS.label, 'text-center')}>{teamLabel}</span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-left',
            GLASS.panel,
            open && GLASS.btnActive
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          {playerImageSrc ? (
            <img
              src={playerImageSrc}
              alt=""
              className="size-7 shrink-0 object-contain"
            />
          ) : (
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                side === 'home' ? 'bg-sky-500/30 text-sky-200' : 'bg-rose-500/30 text-rose-200'
              )}
            >
              {side === 'home' ? 'L' : 'V'}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium leading-tight text-cyan-100">
            {selectedLabel}
          </span>
          <ChevronDown className={cn('size-3 shrink-0 text-cyan-400/70 transition-transform', open && 'rotate-180')} />
        </button>

        {open ? (
          <div
            role="listbox"
            className={cn(
              'absolute top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl p-1',
              GLASS.panel,
              side === 'home' ? 'left-0' : 'right-0'
            )}
          >
            <button
              type="button"
              role="option"
              aria-selected={selectedFormationId === null}
              onClick={() => {
                onFormationSelect(null);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium',
                selectedFormationId === null ? GLASS.btnActive : GLASS.btn
              )}
            >
              {playerImageSrc ? (
                <img src={playerImageSrc} alt="" className="size-6 object-contain opacity-60" />
              ) : null}
              Sin formación
            </button>
            {formations.map((formation) => (
              <button
                key={formation.id}
                type="button"
                role="option"
                aria-selected={selectedFormationId === formation.id}
                onClick={() => {
                  onFormationSelect(formation.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium',
                  selectedFormationId === formation.id ? GLASS.btnActive : GLASS.btn
                )}
              >
                {playerImageSrc ? (
                  <img src={playerImageSrc} alt="" className="size-6 object-contain" />
                ) : null}
                {formation.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        {TACTICAL_SCENE_LABELS.map((label, index) => {
          const phase = index as TacticalPhaseIndex;
          const isActive = hasFormation && activePhase === phase;
          return (
            <button
              key={label}
              type="button"
              disabled={!hasFormation}
              title={hasFormation ? label : 'Selecciona una formación primero'}
              onClick={() => onPhaseSelect(phase)}
              className={cn(
                'rounded-lg px-1.5 py-1.5 text-center text-[9px] font-medium leading-tight',
                !hasFormation ? GLASS.btnDisabled : isActive ? GLASS.btnActive : GLASS.btn
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
