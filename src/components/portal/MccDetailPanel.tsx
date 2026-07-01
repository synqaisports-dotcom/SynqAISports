'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, ExternalLink, Link2, Loader2, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { sessionStructureSummary } from '@/lib/periodization';
import type { MccContext } from '@/lib/periodization';
import type { MccLink, RhythmVariant, TeamMccInstance } from '@/lib/periodization-document';
import { cn } from '@/lib/utils';

type TeamOption = { id: string; name: string };

export type TemplateMicrocycleOption = {
  id: string;
  title: string;
  week_label: string;
  week_start: string | null;
};

type Props = {
  context: MccContext;
  variant: RhythmVariant;
  categoryName: string;
  link: MccLink | null;
  label: string;
  note: string;
  excluded: boolean;
  pending: boolean;
  forkingTeamId: string | null;
  assignedTeams: TeamOption[];
  teamInstances: Record<string, TeamMccInstance>;
  templateMicrocycles: TemplateMicrocycleOption[];
  panelError: string | null;
  panelSuccess: string | null;
  onClose: () => void;
  onLabelChange: (label: string) => void;
  onNoteChange: (note: string) => void;
  onSaveOverride: () => void;
  onToggleExcluded: () => void;
  onCreateMicrocycle: () => void;
  onLinkExistingTemplate: (microcycleId: string) => void;
  onForkTeam: (teamId: string) => void;
  onForkAllTeams: () => void;
};

export function MccDetailPanel({
  context,
  variant,
  categoryName,
  link,
  label,
  note,
  excluded,
  pending,
  forkingTeamId,
  assignedTeams,
  teamInstances,
  templateMicrocycles,
  panelError,
  panelSuccess,
  onClose,
  onLabelChange,
  onNoteChange,
  onSaveOverride,
  onToggleExcluded,
  onCreateMicrocycle,
  onLinkExistingTemplate,
  onForkTeam,
  onForkAllTeams,
}: Props) {
  const { micro, meso, macro } = context;
  const isDemoLink = link?.microcycleId.startsWith('demo-micro-');
  const forkedCount = assignedTeams.filter((team) => teamInstances[team.id]).length;
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

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
            <span className="text-muted-foreground">Semana:</span> {micro.weekStart} → {micro.weekEnd}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Mesociclo:</span> {meso.label}
          </p>
          <p className="mt-1">
            <span className="text-muted-foreground">Macrociclo:</span> {macro.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          <div className={cn('rounded-lg border p-3', excluded && 'opacity-50')}>
            <p className="text-2xl font-bold text-primary">{micro.sessionsCount}</p>
            <p className="text-xs text-muted-foreground">sesiones</p>
          </div>
          <div className={cn('rounded-lg border p-3', excluded && 'opacity-50')}>
            <p className="text-2xl font-bold text-primary">{micro.tasksCount}</p>
            <p className="text-xs text-muted-foreground">tareas</p>
          </div>
        </div>

        <Button
          type="button"
          variant={excluded ? 'default' : 'outline'}
          size="sm"
          className="w-full"
          onClick={onToggleExcluded}
        >
          {excluded ? 'Reactivar semana' : 'Marcar festivo / sin entreno'}
        </Button>

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
            {link ? 'Plantilla de variante' : 'Sin plantilla'}
          </div>
          {link ? (
            <p className="mt-1 text-xs text-muted-foreground">Lista para fork a equipos asignados.</p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Crea la plantilla antes de generar instancias por equipo.
            </p>
          )}
        </div>

        {link && assignedTeams.length > 0 ? (
          <div className="rounded-lg border border-primary/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="size-4" />
                Instancias equipo ({forkedCount}/{assignedTeams.length})
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={forkingTeamId !== null}
                onClick={onForkAllTeams}
              >
                <Copy className="mr-1 size-3" />
                Todas
              </Button>
            </div>
            <ul className="space-y-1.5">
              {assignedTeams.map((team) => {
                const instance = teamInstances[team.id];
                const isForking = forkingTeamId === team.id;
                return (
                  <li
                    key={team.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-primary/10 px-2 py-1.5 text-xs"
                  >
                    <span>{team.name}</span>
                    {instance ? (
                      instance.microcycleId.startsWith('demo-') ? (
                        <span className="text-emerald-400">Instancia demo</span>
                      ) : (
                        <Link
                          href={`/portal/metodologia/microciclos/${instance.microcycleId}/sesiones/1`}
                          className="text-primary hover:underline"
                        >
                          Abrir
                        </Link>
                      )
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        disabled={isForking}
                        onClick={() => onForkTeam(team.id)}
                      >
                        {isForking ? <Loader2 className="size-3 animate-spin" /> : 'Fork'}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-primary/20 p-4">
        {panelError ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {panelError}
          </p>
        ) : null}
        {panelSuccess ? (
          <p className="rounded-md border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
            {panelSuccess}
          </p>
        ) : null}
        {!link ? (
          <>
            <Button type="button" className="w-full gap-2" disabled={pending} onClick={onCreateMicrocycle}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
              Crear microciclo plantilla
            </Button>
            {templateMicrocycles.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-dashed border-primary/25 p-3">
                <p className="text-xs font-medium text-muted-foreground">O enlazar plantilla existente</p>
                <SynqSelect
                  value={selectedTemplateId}
                  onChange={setSelectedTemplateId}
                  placeholder="Elegir microciclo…"
                  options={templateMicrocycles.map((item) => ({
                    value: item.id,
                    label: `${item.title} (${item.week_label || item.week_start || 'sin fecha'})`,
                  }))}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={!selectedTemplateId || pending}
                  onClick={() => onLinkExistingTemplate(selectedTemplateId)}
                >
                  Asignar plantilla seleccionada
                </Button>
              </div>
            ) : null}
          </>
        ) : isDemoLink ? (
          <Button type="button" variant="outline" className="w-full gap-2" asChild>
            <Link href={`/portal/metodologia/microciclos/${link.microcycleId}/sesiones/1`}>
              <ExternalLink className="size-4" />
              Abrir plantilla (demo)
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" className="w-full gap-2" asChild>
            <Link href={`/portal/metodologia/microciclos/${link.microcycleId}/sesiones/1`}>
              <ExternalLink className="size-4" />
              Abrir plantilla
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
