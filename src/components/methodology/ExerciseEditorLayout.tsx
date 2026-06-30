'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  canvas: ReactNode;
  form: ReactNode;
  className?: string;
};

/** Layout 40 % pizarra (izq) · 60 % formulario (der) en desktop. */
export function ExerciseEditorLayout({ canvas, form, className }: Props) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-start', className)}>
      <div className="rounded-xl border border-primary/20 bg-muted/10 p-3 lg:sticky lg:top-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Esquema / pizarra
        </p>
        {canvas}
      </div>
      <div className="min-w-0 space-y-4">{form}</div>
    </div>
  );
}
