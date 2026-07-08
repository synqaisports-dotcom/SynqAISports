'use client';

import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  canvas: ReactNode;
  form: ReactNode;
  className?: string;
  formTitle?: string;
  formDescription?: string;
};

/** Layout 40 % pizarra (izq) · 60 % formulario (der) en desktop. */
export function ExerciseEditorLayout({
  canvas,
  form,
  className,
  formTitle = 'Ficha de la tarea',
  formDescription = 'Plantilla UEFA / proyecto ABR',
}: Props) {
  return (
    <div className={cn('grid gap-4 lg:grid-cols-[2fr_3fr] lg:items-start', className)}>
      <Card className="overflow-hidden border border-primary/25">
        <CardHeader className="space-y-1 border-b border-primary/10 pb-3">
          <CardTitle className="text-base">Esquema / pizarra</CardTitle>
          <CardDescription>Toca el icono inferior para editar el dibujo</CardDescription>
        </CardHeader>
        <CardContent className="p-0">{canvas}</CardContent>
      </Card>

      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{formTitle}</CardTitle>
          <CardDescription>{formDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{form}</CardContent>
      </Card>
    </div>
  );
}
