'use client';

import { cn } from '@/lib/utils';

const GLASS = {
  panel:
    'border border-cyan-400/40 bg-cyan-950/90 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-2xl',
  btn: 'border border-cyan-400/35 bg-cyan-400/[0.07] text-cyan-300 backdrop-blur-md transition-all hover:border-cyan-400/55 hover:bg-cyan-400/12 hover:text-cyan-200',
  danger:
    'border-red-400/45 bg-red-500/12 text-red-300 backdrop-blur-md transition-all hover:border-red-400/60 hover:bg-red-500/22 hover:text-red-200',
  label: 'text-sm text-cyan-300/90',
} as const;

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DrawingStudioConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="drawing-studio-confirm-title"
        aria-describedby="drawing-studio-confirm-desc"
        className={cn('w-full max-w-sm rounded-2xl p-6', GLASS.panel)}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="drawing-studio-confirm-title" className="text-base font-semibold text-cyan-100">
          {title}
        </h2>
        <p id="drawing-studio-confirm-desc" className={cn('mt-2 leading-relaxed', GLASS.label)}>
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className={cn('rounded-xl px-4 py-2 text-sm font-medium', GLASS.btn)}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn('rounded-xl px-4 py-2 text-sm font-medium', GLASS.danger)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
