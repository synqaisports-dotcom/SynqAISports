'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitBranch, Pencil } from 'lucide-react';
import { CategoryObjectivesForm } from '@/components/methodology/CategoryObjectivesForm';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CANTERA_CATEGORIES,
  getCanteraCategory,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import {
  OBJECTIVE_DIMENSION_META,
  METHODOLOGY_STAGES,
  stageForCategory,
  type MethodologyObjectivesMap,
} from '@/lib/methodology-objectives';
import { cn } from '@/lib/utils';

type StageFilter = 'all' | (typeof METHODOLOGY_STAGES)[number]['id'];

type Props = {
  objectives: MethodologyObjectivesMap;
  canEdit: boolean;
  initialCategorySlug?: string | null;
  initialEditOpen?: boolean;
  demoMode?: boolean;
};

const actionButtonClass =
  'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary';

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

function ObjectivesDetailPanel({
  categorySlug,
  objectives,
  canEdit,
  demoMode,
  initialEditOpen,
}: {
  categorySlug: CanteraCategorySlug | null;
  objectives: MethodologyObjectivesMap;
  canEdit: boolean;
  demoMode?: boolean;
  initialEditOpen?: boolean;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(Boolean(initialEditOpen));
  const category = categorySlug ? getCanteraCategory(categorySlug) : null;
  const stage = categorySlug ? stageForCategory(categorySlug) : null;

  useEffect(() => {
    setEditOpen(Boolean(initialEditOpen));
  }, [categorySlug, initialEditOpen]);

  if (!categorySlug || !category) {
    return (
      <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
        <CardContent className="flex flex-1 items-center justify-center p-8">
          <p className="text-center text-sm text-muted-foreground">
            Selecciona una categoría para ver sus objetivos formativos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full min-h-[28rem] flex-col border border-primary/25">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg font-semibold tracking-tight">{category.name}</CardTitle>
              <Badge variant="outline" className={cn('text-[10px]', category.badgeClass)}>
                {category.ages}
              </Badge>
            </div>
            {stage ? (
              <p className="mt-1 text-sm text-primary">
                {stage.emoji} {stage.title}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground">{category.international}</p>
          </div>
          <div className="flex shrink-0 flex-nowrap items-center gap-0.5">
            {canEdit ? (
              <button
                type="button"
                className={actionButtonClass}
                aria-label="Modificar objetivos"
                title="Modificar objetivos"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" />
              </button>
            ) : null}
            <Link
              href="/portal/metodologia/ciclos"
              className={actionButtonClass}
              aria-label="Ver ciclos"
              title="Ver ciclos y microciclos"
            >
              <GitBranch className="size-4" />
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto">
        <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
        <CategoryObjectivesTable categorySlug={categorySlug} objectives={objectives} />
        {demoMode ? (
          <p className="mt-4 rounded-lg border border-primary/20 bg-muted/10 p-3 text-xs text-muted-foreground">
            Referencia de demostración. El personal autorizado puede adaptar los textos a la
            propuesta del club.
          </p>
        ) : null}
      </CardContent>

      {canEdit ? (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
          <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Modificar — {category.name}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <CategoryObjectivesForm
                key={categorySlug}
                categorySlug={categorySlug}
                objectives={objectives}
                canEdit={canEdit}
                demoMode={demoMode}
                onSaved={() => {
                  setEditOpen(false);
                  router.replace(`/portal/metodologia/objetivos?category=${categorySlug}`, {
                    scroll: false,
                  });
                  router.refresh();
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </Card>
  );
}

export function ObjectivesMasterDetail({
  objectives,
  canEdit,
  initialCategorySlug,
  initialEditOpen,
  demoMode,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [selectedSlug, setSelectedSlug] = useState<CanteraCategorySlug>(
    initialCategorySlug && CANTERA_CATEGORIES.some((item) => item.slug === initialCategorySlug)
      ? (initialCategorySlug as CanteraCategorySlug)
      : CANTERA_CATEGORIES[0]!.slug
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    let list = [...CANTERA_CATEGORIES];

    if (stageFilter !== 'all') {
      const stage = METHODOLOGY_STAGES.find((item) => item.id === stageFilter);
      if (stage) {
        list = list.filter((category) => stage.categorySlugs.includes(category.slug));
      }
    }

    if (query) {
      list = list.filter((category) => {
        const stage = stageForCategory(category.slug);
        const haystack = [
          category.name,
          category.ages,
          category.international,
          category.description,
          stage?.title,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return list;
  }, [search, stageFilter]);

  const selectedCategory =
    CANTERA_CATEGORIES.find((category) => category.slug === selectedSlug) ??
    filteredCategories[0] ??
    null;

  useEffect(() => {
    if (
      initialCategorySlug &&
      CANTERA_CATEGORIES.some((category) => category.slug === initialCategorySlug)
    ) {
      setSelectedSlug(initialCategorySlug as CanteraCategorySlug);
    }
  }, [initialCategorySlug]);

  useEffect(() => {
    if (selectedSlug && !filteredCategories.some((category) => category.slug === selectedSlug)) {
      setSelectedSlug(filteredCategories[0]?.slug ?? CANTERA_CATEGORIES[0]!.slug);
    }
  }, [filteredCategories, selectedSlug]);

  const handleSelect = (slug: CanteraCategorySlug) => {
    setSelectedSlug(slug);
    router.replace(`/portal/metodologia/objetivos?category=${slug}`, { scroll: false });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
      <Card className="flex min-h-[28rem] flex-col border border-primary/25 lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)]">
        <CardHeader className="space-y-3 pb-3">
          <div>
            <CardTitle className="text-base">Categorías</CardTitle>
            <CardDescription>
              {filteredCategories.length} de {CANTERA_CATEGORIES.length} categorías
            </CardDescription>
          </div>
          <div className="space-y-2">
            <PortalSearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar categoría o etapa…"
            />
            <SynqSelect
              value={stageFilter}
              onChange={(value) => setStageFilter(value as StageFilter)}
              options={[
                { value: 'all', label: 'Todas las etapas' },
                ...METHODOLOGY_STAGES.map((stage) => ({
                  value: stage.id,
                  label: `${stage.emoji} ${stage.title}`,
                })),
              ]}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {METHODOLOGY_STAGES.map((stage) => (
              <Badge
                key={stage.id}
                variant="outline"
                className="border-primary/20 bg-muted/10 text-[10px] text-muted-foreground"
              >
                {stage.emoji} {stage.categorySlugs.length} cat.
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
          {filteredCategories.length === 0 ? (
            <p className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No hay categorías con esos filtros.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {filteredCategories.map((category) => {
                const active = selectedCategory?.slug === category.slug;
                const stage = stageForCategory(category.slug);
                return (
                  <li key={category.slug}>
                    <button
                      type="button"
                      onClick={() => handleSelect(category.slug)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        active
                          ? 'border-primary/50 bg-primary/10 shadow-[inset_2px_0_0_0_hsl(var(--primary))]'
                          : 'border-primary/15 hover:border-primary/30 hover:bg-muted/20'
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-11 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold',
                          category.badgeClass
                        )}
                      >
                        {stage?.emoji ?? '⚽'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {category.ages}
                          {stage ? ` · ${stage.title}` : ''}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ObjectivesDetailPanel
        categorySlug={selectedCategory?.slug ?? null}
        objectives={objectives}
        canEdit={canEdit}
        demoMode={demoMode}
        initialEditOpen={initialEditOpen}
      />
    </div>
  );
}
