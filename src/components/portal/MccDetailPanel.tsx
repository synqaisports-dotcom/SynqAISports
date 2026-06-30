'use client';

import Link from 'next/link';
import { ExternalLink, Link2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sessionStructureSummary } from '@/lib/periodization';
import type { MccContext } from '@/lib/periodization';
import type { MccLink, RhythmVariant } from '@/lib/periodization-document';
import { cn } from '@/lib/utils';

type Props = {
  context: MccContext;
  variant: RhythmVariant;
  categoryName: string;
  link: MccLink | null;
  label: string;
  note: string;
  pending: boolean;
  onClose: () => void;
  onLabelChange: (label: string) => void;
  onNoteChange: (note: string) => void;
  onSaveOverride: () => void;
  onCreateMicrocycle: () => void;
};

export function MccDetailPanel({
  context,
  variant,
  categoryName,
  link,
  label,
  note,
  pending,
  onClose,
  onLabelChange,
  onNoteChange,
  onSaveOverride,
  onCreateMicrocycle,
}: Props) {
  const { micro, meso, macro } = context;
  const isDemoLink = link?.microcycleId.startsWith('demo-micro-');

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-primary/25 bg-background/95 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {categoryName} · {variant.name}
          </p>
          <h3 className="text-base font-semibold">{label || micro.label}</h3>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar panel">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="rounded-lg border border-primary/20 bg-muted/10 p-3 text-sm">
          <p>
            <span className="text-muted-foreground">Semana:</span>{' '}
            {micro.weekStart} → {micro.weekEnd}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Mesociclo:</span> {meso.label}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Macrociclo:</span> {macro.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className="rounded-lg border border-primary/20 p-3">
            <p className="text-2xl font-bold text-primary">{micro.sessionsCount}</p>
            <p className="text-xs text-muted-foreground">sesiones</p>
          </div>
          <div className="rounded-lg border border-primary/20 p-3">
            <p className="text-2xl font-bold text-primary">{micro.tasksCount}</p>
            <p className="text-xs text-muted-foreground">tareas</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Estructura: {sessionStructureSummary(variant.mainTasksPerSession)} por sesión.
        </p>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Etiqueta MCC
          </label>
          <Input
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            placeholder={micro.label}
            className="border-primary/30 bg-background/80"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Nota interna
          </label>
          <Input
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Opcional"
            className="border-primary/30 bg-background/80"
          />
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onSaveOverride}>
          Guardar etiqueta y nota
        </Button>

        <div
          className={cn(
            'rounded-lg border p-3',
            link ? 'border-emerald-400/40 bg-emerald-500/10' : 'border-dashed border-primary/25'
          )}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <Link2 className="size-4" />
            {link ? 'Microciclo plantilla enlazado' : 'Sin microciclo plantilla'}
          </div>
          {link ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Estado: {link.status === 'linked' ? 'enlazado' : link.status}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Crea la plantilla de esta semana para la variante. Los equipos heredarán esta base.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 border-t border-primary/20 p-4">
        {!link ? (
          <Button type="button" className="w-full gap-2" disabled={pending} onClick={onCreateMicrocycle}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
            Crear microciclo plantilla
          </Button>
        ) : isDemoLink ? (
          <Button type="button" variant="outline" className="w-full gap-2" disabled>
            <ExternalLink className="size-4" />
            Demo: plantilla registrada
          </Button>
        ) : (
          <Button type="button" variant="outline" className="w-full gap-2" asChild>
            <Link href={`/portal/metodologia/microciclos/${link.microcycleId}`}>
              <ExternalLink className="size-4" />
              Abrir microciclo
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
