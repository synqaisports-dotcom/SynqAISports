'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  GitBranch,
  Layers3,
  Loader2,
  RefreshCw,
  Save,
  Users,
} from 'lucide-react';
import { createMicrocycleFromMcc, loadCategoryPeriodization, saveCategoryPeriodization } from '@/app/actions/periodization';
import { PeriodizationGrid } from '@/components/portal/PeriodizationGrid';
import { MccDetailPanel } from '@/components/portal/MccDetailPanel';
import { SynqDateField } from '@/components/portal/SynqDateField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CANTERA_CATEGORIES, type CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  formatMacroDistributionSummary,
  findMccInPlan,
  macroNamesForCount,
  previewPeriodizationDistribution,
  sessionStructureSummary,
  type MacroCount,
  type MainTasksPerSession,
  type MicrocycleWeek,
} from '@/lib/periodization';
import {
  buildPlanForVariant,
  countLinkedMcc,
  defaultCategoryDocument,
  getVariant,
  getVariantState,
  loadDocumentFromStorage,
  saveDocumentToStorage,
  setMccLink,
  setMccOverride,
  variantTotals,
  type CategoryPeriodizationDocument,
  type RhythmVariant,
} from '@/lib/periodization-document';
import { cn } from '@/lib/utils';

export type TeamOption = { id: string; name: string; category_slug: CanteraCategorySlug | null };

type Props = {
  teams: TeamOption[];
  initialCategory?: CanteraCategorySlug;
};

export function CategoryCyclesHub({ teams, initialCategory = 'alevin' }: Props) {
  const [categorySlug, setCategorySlug] = useState<CanteraCategorySlug>(initialCategory);
  const category = CANTERA_CATEGORIES.find((item) => item.slug === categorySlug)!;

  const [document, setDocument] = useState<CategoryPeriodizationDocument>(() =>
    defaultCategoryDocument(categorySlug, category.name)
  );
  const [plan, setPlan] = useState(() => buildPlanForVariant(document, document.activeVariantId));
  const [activeMacroIndex, setActiveMacroIndex] = useState(0);
  const [selectedMcc, setSelectedMcc] = useState<MicrocycleWeek | null>(null);
  const [panelLabel, setPanelLabel] = useState('');
  const [panelNote, setPanelNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const activeVariant = getVariant(document, document.activeVariantId);
  const variantState = getVariantState(document, document.activeVariantId);
  const categoryTeams = teams.filter((team) => team.category_slug === categorySlug);
  const styles = useMemo(
    () =>
      ({
        debutantes: 'border-fuchsia-400/40',
        prebenjamin: 'border-primary/40',
        benjamin: 'border-emerald-400/40',
        alevin: 'border-sky-400/40',
        infantil: 'border-violet-400/40',
        cadete: 'border-amber-400/40',
        juvenil: 'border-rose-400/40',
      }) as Record<CanteraCategorySlug, string>,
    []
  );

  const hydrateCategory = useCallback(
    async (slug: CanteraCategorySlug) => {
      const cat = CANTERA_CATEGORIES.find((item) => item.slug === slug)!;
      const fromStorage = loadDocumentFromStorage(slug);
      const fromServer = await loadCategoryPeriodization(slug);
      const next = fromStorage ?? fromServer ?? defaultCategoryDocument(slug, cat.name);
      setDocument(next);
      setPlan(buildPlanForVariant(next, next.activeVariantId));
      setActiveMacroIndex(0);
      setSelectedMcc(null);
      setError(null);
      setLoaded(true);
    },
    []
  );

  useEffect(() => {
    void hydrateCategory(categorySlug);
  }, [categorySlug, hydrateCategory]);

  const updateDocument = (updater: (current: CategoryPeriodizationDocument) => CategoryPeriodizationDocument) => {
    setDocument((current) => {
      const next = updater(current);
      saveDocumentToStorage(next);
      return next;
    });
  };

  const handleCategoryChange = (slug: CanteraCategorySlug) => {
    setCategorySlug(slug);
    setLoaded(false);
  };

  const handleGenerate = () => {
    try {
      const nextPlan = buildPlanForVariant(document, document.activeVariantId);
      if (!nextPlan) throw new Error('No se pudo generar el planograma.');
      setPlan(nextPlan);
      setActiveMacroIndex(0);
      setSelectedMcc(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el planograma.');
      setPlan(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    saveDocumentToStorage(document);
    const result = await saveCategoryPeriodization(document);
    setSaving(false);
    if (!result.ok) setError('No se pudo guardar en el servidor.');
    else setError(null);
  };

  const handleVariantSelect = (variantId: string) => {
    updateDocument((current) => ({ ...current, activeVariantId: variantId }));
    setPlan(buildPlanForVariant({ ...document, activeVariantId: variantId }, variantId));
    setActiveMacroIndex(0);
    setSelectedMcc(null);
  };

  const toggleTeamOnVariant = (variantId: string, teamId: string) => {
    updateDocument((current) => ({
      ...current,
      variants: current.variants.map((variant) => {
        if (variant.id !== variantId) {
          return { ...variant, teamIds: variant.teamIds.filter((id) => id !== teamId) };
        }
        const has = variant.teamIds.includes(teamId);
        return {
          ...variant,
          teamIds: has
            ? variant.teamIds.filter((id) => id !== teamId)
            : [...variant.teamIds, teamId],
        };
      }),
    }));
  };

  const openMccPanel = (micro: MicrocycleWeek) => {
    setSelectedMcc(micro);
    const override = variantState.mccOverrides[micro.id];
    setPanelLabel(override?.label ?? '');
    setPanelNote(override?.note ?? '');
  };

  const mccContext = plan && selectedMcc ? findMccInPlan(plan, selectedMcc.id) : null;

  const handleSaveOverride = () => {
    if (!selectedMcc) return;
    updateDocument((current) =>
      setMccOverride(current, document.activeVariantId, selectedMcc.id, {
        label: panelLabel.trim() || undefined,
        note: panelNote.trim() || undefined,
      })
    );
  };

  const handleCreateMicrocycle = async () => {
    if (!selectedMcc || !activeVariant || !mccContext) return;
    setCreating(true);
    const displayLabel = panelLabel.trim() || mccContext.micro.label;
    const result = await createMicrocycleFromMcc({
      categorySlug,
      variantId: activeVariant.id,
      variantName: activeVariant.name,
      mccId: selectedMcc.id,
      mccLabel: displayLabel,
      weekStart: selectedMcc.weekStart,
      weekEnd: selectedMcc.weekEnd,
      mainTasksPerSession: activeVariant.mainTasksPerSession,
    });
    setCreating(false);

    if (!result.ok || !result.microcycleId) {
      setError('No se pudo crear el microciclo.');
      return;
    }

    updateDocument((current) =>
      setMccLink(current, activeVariant.id, selectedMcc.id, {
        microcycleId: result.microcycleId!,
        variantId: activeVariant.id,
        status: 'linked',
        createdAt: new Date().toISOString(),
      })
    );
    setError(null);
  };

  const distributionPreview = useMemo(() => {
    if (!activeVariant) return null;
    return previewPeriodizationDistribution(
      document.startDate,
      document.endDate,
      document.macroCount,
      activeVariant.sessionsPerMicro
    );
  }, [document, activeVariant]);

  const activeMacro = plan?.macrocycles[activeMacroIndex] ?? null;
  const linkedCount = countLinkedMcc(document, document.activeVariantId);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Cargando ciclos…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" />
            Ciclos por categoría
          </CardTitle>
          <CardDescription>
            Plan de temporada por categoría, variantes de ritmo (2 o 3 sesiones/microciclo) y equipos
            asignados. Cada variante comparte el calendario pero con totales distintos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1 rounded-xl border border-primary/20 bg-muted/5 p-1">
              {CANTERA_CATEGORIES.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => handleCategoryChange(item.slug)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-left transition-colors',
                    item.slug === categorySlug
                      ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.35)]'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                  )}
                >
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className="block text-[10px] text-muted-foreground">{item.ages}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {document.variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                active={variant.id === document.activeVariantId}
                plan={buildPlanForVariant(document, variant.id)}
                linkedCount={countLinkedMcc(document, variant.id)}
                teams={categoryTeams}
                borderClass={styles[categorySlug]}
                onSelect={() => handleVariantSelect(variant.id)}
                onToggleTeam={(teamId) => toggleTeamOnVariant(variant.id, teamId)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {activeVariant ? (
        <Card className="border border-primary/25">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Temporada · {activeVariant.name}</CardTitle>
            <CardDescription>
              Configura fechas y macrociclos. Genera la rejilla para la variante activa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <div className="lg:col-span-2 xl:col-span-3">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Título de la temporada
                </label>
                <Input
                  value={document.seasonTitle}
                  onChange={(event) =>
                    updateDocument((current) => ({ ...current, seasonTitle: event.target.value }))
                  }
                  className="border-primary/30 bg-background/80"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Inicio
                  </label>
                  <SynqDateField
                    value={document.startDate}
                    onChange={(startDate) => updateDocument((c) => ({ ...c, startDate }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Fin
                  </label>
                  <SynqDateField
                    value={document.endDate}
                    onChange={(endDate) => updateDocument((c) => ({ ...c, endDate }))}
                  />
                </div>
                {distributionPreview ? (
                  <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2">
                    {distributionPreview}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Macrociclos
                </label>
                <SynqSelect
                  value={String(document.macroCount)}
                  onChange={(value) =>
                    updateDocument((current) => ({
                      ...current,
                      macroCount: Number(value) as MacroCount,
                      macroNames: macroNamesForCount(Number(value) as MacroCount, current.macroNames),
                    }))
                  }
                  options={[
                    { value: '1', label: '1 macrociclo' },
                    { value: '2', label: '2 macrociclos' },
                    { value: '3', label: '3 macrociclos' },
                  ]}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estructura por sesión (variante)
                </label>
                <SynqSelect
                  value={String(activeVariant.mainTasksPerSession)}
                  onChange={(value) =>
                    updateDocument((current) => ({
                      ...current,
                      variants: current.variants.map((variant) =>
                        variant.id === activeVariant.id
                          ? {
                              ...variant,
                              mainTasksPerSession: Number(value) as MainTasksPerSession,
                            }
                          : variant
                      ),
                    }))
                  }
                  options={[
                    { value: '3', label: 'Estándar — 3 principales' },
                    { value: '2', label: 'Corta — 2 principales' },
                  ]}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {sessionStructureSummary(activeVariant.mainTasksPerSession)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={handleGenerate} className="gap-2">
                <RefreshCw className="size-4" />
                Generar planograma
              </Button>
              <Button type="button" variant="outline" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Guardar plan
              </Button>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {plan && activeVariant ? (
        <Card className="border border-primary/25">
          <CardHeader className="space-y-3 pb-3">
            <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-semibold">
              {document.seasonTitle} · {activeVariant.name}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/25">
                <CalendarRange className="mr-1 size-3.5" />
                {document.startDate} → {document.endDate}
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                <Layers3 className="mr-1 size-3.5" />
                {plan.totalMesocycles} mesociclos
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {plan.totalMicrocycles} MCC
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {plan.totalSessions} sesiones
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {plan.totalTasks} tareas
              </Badge>
              <Badge variant="outline" className="border-emerald-400/30 text-emerald-300">
                {linkedCount}/{plan.totalMicrocycles} plantillas
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{formatMacroDistributionSummary(plan)}</p>
            <p className="text-xs text-muted-foreground">
              Pulsa un MCC para ver detalle, renombrar o crear la plantilla de microciclo. Sin festivos.
            </p>

            {plan.macrocycles.length > 1 ? (
              <div className="flex flex-wrap gap-1 rounded-xl border border-primary/20 bg-muted/5 p-1">
                {plan.macrocycles.map((macro) => (
                  <button
                    key={macro.id}
                    type="button"
                    onClick={() => setActiveMacroIndex(macro.index)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      macro.index === activeMacroIndex
                        ? 'bg-primary/15 font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-primary/5'
                    )}
                  >
                    <span className="block">{macro.name}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {macro.microcycleCount} MCC · {macro.mesocycleCount} mesos
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {activeMacro ? (
              <PeriodizationGrid
                macro={activeMacro}
                categorySlug={categorySlug}
                mccLinks={variantState.mccLinks}
                mccOverrides={variantState.mccOverrides}
                selectedMccId={selectedMcc?.id ?? null}
                onSelectMcc={openMccPanel}
              />
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-dashed border-primary/20">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Genera el planograma para la variante activa y enlaza cada MCC con su microciclo plantilla.
          </CardContent>
        </Card>
      )}

      {mccContext && activeVariant ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Cerrar panel"
            onClick={() => setSelectedMcc(null)}
          />
          <MccDetailPanel
            context={mccContext}
            variant={activeVariant}
            categoryName={category.name}
            link={variantState.mccLinks[selectedMcc!.id] ?? null}
            label={panelLabel}
            note={panelNote}
            pending={creating}
            onClose={() => setSelectedMcc(null)}
            onLabelChange={setPanelLabel}
            onNoteChange={setPanelNote}
            onSaveOverride={handleSaveOverride}
            onCreateMicrocycle={handleCreateMicrocycle}
          />
        </>
      ) : null}
    </div>
  );
}

function VariantCard({
  variant,
  active,
  plan,
  linkedCount,
  teams,
  borderClass,
  onSelect,
  onToggleTeam,
}: {
  variant: RhythmVariant;
  active: boolean;
  plan: ReturnType<typeof buildPlanForVariant>;
  linkedCount: number;
  teams: TeamOption[];
  borderClass: string;
  onSelect: () => void;
  onToggleTeam: (teamId: string) => void;
}) {
  const totals = plan ? variantTotals(plan) : null;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        active ? cn('bg-primary/10', borderClass) : 'border-primary/15 bg-muted/5'
      )}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <p className="text-sm font-semibold">{variant.name}</p>
        {totals ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {totals.microcycles} MCC × {variant.sessionsPerMicro} ses. = {totals.sessions} sesiones ·{' '}
            {totals.tasks} tareas
          </p>
        ) : null}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {linkedCount} plantilla{linkedCount === 1 ? '' : 's'} enlazada{linkedCount === 1 ? '' : 's'}
        </p>
      </button>

      <div className="mt-3 border-t border-primary/10 pt-3">
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="size-3" />
          Equipos asignados
        </p>
        {teams.length === 0 ? (
          <p className="text-xs text-muted-foreground">No hay equipos en esta categoría.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {teams.map((team) => {
              const assigned = variant.teamIds.includes(team.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => onToggleTeam(team.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition-colors',
                    assigned
                      ? 'border-primary/50 bg-primary/15 text-primary'
                      : 'border-primary/15 text-muted-foreground hover:border-primary/30'
                  )}
                >
                  {team.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
