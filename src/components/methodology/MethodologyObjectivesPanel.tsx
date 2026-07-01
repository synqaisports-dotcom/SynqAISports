'use client';

import { useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import { Pencil, Target } from 'lucide-react';
import { updateCategoryObjectives, type ActionState } from '@/app/actions/methodology';
import { CANTERA_CATEGORIES, getCanteraCategory, type CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  OBJECTIVE_DIMENSION_META,
  METHODOLOGY_STAGES,
  stageForCategory,
  type MethodologyObjectivesMap,
} from '@/lib/methodology-objectives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const initial: ActionState = { ok: false };

type Props = {
  objectives: MethodologyObjectivesMap;
  canEdit: boolean;
  demoMode?: boolean;
};

function CategoryObjectivesTable({
  categorySlug,
  objectives,
}: {
  categorySlug: CanteraCategorySlug;
  objectives: MethodologyObjectivesMap;
}) {
  const category = getCanteraCategory(categorySlug);
  const stage = stageForCategory(categorySlug);
  const rows = objectives[categorySlug];

  return (
    <div className="space-y-4">
      {stage ? (
        <div className="rounded-xl border border-primary/20 bg-muted/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            {stage.emoji} {stage.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{stage.subtitle}</p>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-primary/20">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-primary/15 bg-muted/10">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Concepto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category?.name ?? categorySlug}
                {category ? ` (${category.ages})` : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {OBJECTIVE_DIMENSION_META.map((dimension) => {
              const cell = rows[dimension.key];
              return (
                <tr key={dimension.key} className="border-b border-primary/10 last:border-0">
                  <td className="align-top px-4 py-3 font-medium text-foreground">
                    {dimension.label}
                  </td>
                  <td className="align-top px-4 py-3 text-muted-foreground">
                    <p className="font-medium text-primary/90">{cell.itemLabel}</p>
                    <p className="mt-1 leading-relaxed text-foreground">{cell.content}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryObjectivesEditForm({
  categorySlug,
  objectives,
  canEdit,
  demoMode,
}: {
  categorySlug: CanteraCategorySlug;
  objectives: MethodologyObjectivesMap;
  canEdit: boolean;
  demoMode?: boolean;
}) {
  const bound = updateCategoryObjectives.bind(null, categorySlug);
  const [state, action, pending] = useFormState(bound, initial);
  const rows = objectives[categorySlug];

  if (!canEdit) return null;

  return (
    <Card className="border border-primary/25">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Pencil className="size-4 text-primary" />
          Modificar objetivos — {getCanteraCategory(categorySlug)?.name ?? categorySlug}
        </CardTitle>
        <CardDescription>
          Solo el personal con permisos de metodología puede actualizar estos contenidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {OBJECTIVE_DIMENSION_META.map((dimension) => {
            const cell = rows[dimension.key];
            return (
              <div
                key={dimension.key}
                className="rounded-xl border border-primary/15 bg-muted/5 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                  {dimension.label}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Enfoque / subtítulo
                    </label>
                    <Input
                      name={`${dimension.key}Label`}
                      defaultValue={cell.itemLabel}
                      className="border-primary/30 bg-background/80"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs text-muted-foreground">Contenido</label>
                    <textarea
                      name={`${dimension.key}Content`}
                      rows={3}
                      defaultValue={cell.content}
                      className="w-full rounded-md border border-primary/30 bg-background/80 px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar categoría'}
            </Button>
            {state.ok ? (
              <p className="text-sm font-medium text-primary">Objetivos guardados.</p>
            ) : null}
            {state.message === 'error' ? (
              <p className="text-sm text-destructive">No se pudo guardar.</p>
            ) : null}
            {demoMode ? (
              <p className="text-xs text-muted-foreground">
                En demo los cambios se confirman al guardar si Supabase está conectado.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function MethodologyObjectivesPanel({ objectives, canEdit, demoMode }: Props) {
  const [activeSlug, setActiveSlug] = useState<CanteraCategorySlug>('debutantes');

  const tabs = useMemo(
    () =>
      CANTERA_CATEGORIES.map((category) => ({
        slug: category.slug,
        label: category.name,
        ages: category.ages,
        stage: stageForCategory(category.slug),
        badgeClass: category.badgeClass,
      })),
    []
  );

  const activeTab = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0];

  return (
    <div className="space-y-4">
      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" />
            Objetivos formativos por categoría
          </CardTitle>
          <CardDescription>
            Matriz de referencia por etapa y categoría. Usa las pestañas para comparar el desarrollo
            técnico, táctico, físico, psicológico y reglamentario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {METHODOLOGY_STAGES.map((stage) => (
              <Badge
                key={stage.id}
                variant="outline"
                className="border-primary/25 bg-muted/10 text-muted-foreground"
              >
                {stage.emoji} {stage.title}
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1 rounded-xl border border-primary/20 bg-muted/5 p-1">
              {tabs.map((tab) => {
                const active = tab.slug === activeSlug;
                return (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => setActiveSlug(tab.slug)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-left transition-colors',
                      active
                        ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.35)]'
                        : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                    )}
                  >
                    <span className="block text-sm font-semibold">{tab.label}</span>
                    <span className="block text-[10px] text-muted-foreground">{tab.ages}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab?.stage ? (
            <p className="text-xs text-muted-foreground">
              {activeTab.stage.emoji} {activeTab.stage.title}
            </p>
          ) : null}

          <CategoryObjectivesTable categorySlug={activeSlug} objectives={objectives} />
        </CardContent>
      </Card>

      <CategoryObjectivesEditForm
        key={activeSlug}
        categorySlug={activeSlug}
        objectives={objectives}
        canEdit={canEdit}
        demoMode={demoMode}
      />
    </div>
  );
}
