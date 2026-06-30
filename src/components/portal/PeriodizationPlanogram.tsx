'use client';

import { useMemo, useState } from 'react';
import { CalendarRange, GitBranch, Layers3, RefreshCw } from 'lucide-react';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { SynqDateField } from '@/components/portal/SynqDateField';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CANTERA_CATEGORIES, type CanteraCategorySlug } from '@/lib/cantera-categories';
import {
  CATEGORY_PLAN_STYLES,
  buildPeriodizationPlan,
  defaultPeriodizationConfig,
  formatMacroDistributionSummary,
  macroNamesForCount,
  previewPeriodizationDistribution,
  sessionStructureSummary,
  type MacrocycleBlock,
  type MacroCount,
  type MainTasksPerSession,
  type PeriodizationConfig,
  type PeriodizationPlan,
  type SessionsPerMicro,
} from '@/lib/periodization';
import { cn } from '@/lib/utils';

function PeriodizationGrid({
  macro,
  styles,
}: {
  macro: MacrocycleBlock;
  styles: (typeof CATEGORY_PLAN_STYLES)[CanteraCategorySlug];
}) {
  if (macro.mesocycles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-primary/20 p-6 text-center text-sm text-muted-foreground">
        No hay semanas en este macrociclo para el rango de fechas seleccionado.
      </p>
    );
  }

  const maxMicros = Math.max(...macro.mesocycles.map((meso) => meso.microcycles.length));

  const labelCell =
    'w-[5.5rem] min-w-[5.5rem] border border-primary/15 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground align-middle';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
        <span className={cn('rounded-md border px-2.5 py-1', styles.macro)}>Macrociclos</span>
        <span className={cn('rounded-md border px-2.5 py-1', styles.meso)}>Mesociclos</span>
        <span className={cn('rounded-md border px-2.5 py-1', styles.micro)}>Microciclos</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-primary/20">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead>
          <tr>
            <th className={labelCell}>Macrociclo</th>
            <th
              colSpan={macro.mesocycles.length}
              className={cn('border-b px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide', styles.macro)}
            >
              {macro.name}
              <span className="mt-0.5 block text-[10px] font-normal normal-case text-muted-foreground">
                {macro.startDate} → {macro.endDate}
              </span>
            </th>
          </tr>
          <tr>
            <th className={labelCell}>Mesociclos</th>
            {macro.mesocycles.map((meso) => (
              <th
                key={meso.id}
                className={cn('border border-primary/15 px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide', styles.meso)}
              >
                {meso.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxMicros }).map((_, rowIndex) => (
            <tr key={`micro-row-${rowIndex}`}>
              {rowIndex === 0 ? (
                <td
                  rowSpan={maxMicros}
                  className={cn(labelCell, 'align-middle text-center')}
                >
                  Microciclos
                </td>
              ) : null}
              {macro.mesocycles.map((meso) => {
                const micro = meso.microcycles[rowIndex];
                return (
                  <td key={`${meso.id}-${rowIndex}`} className="border border-primary/10 p-1 align-top">
                    {micro ? (
                      <div
                        className={cn(
                          'rounded-md border px-1.5 py-1.5 text-center transition-colors hover:brightness-110',
                          styles.micro
                        )}
                        title={`${micro.weekStart} → ${micro.weekEnd}`}
                      >
                        <p className="text-[11px] font-bold tracking-wide">{micro.label}</p>
                        <p className="mt-0.5 text-[10px] opacity-90">{micro.sessionsCount} ses.</p>
                        <p className="mt-0.5 text-[9px] text-muted-foreground">
                          {micro.weekStart.slice(5).replace('-', '/')} –{' '}
                          {micro.weekEnd.slice(5).replace('-', '/')}
                        </p>
                      </div>
                    ) : (
                      <div className="h-[3.25rem] rounded-md border border-transparent" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className={cn(labelCell, 'text-center')}>Sesiones</td>
            {macro.mesocycles.map((meso) => (
              <td
                key={`${meso.id}-sessions`}
                className="border border-primary/10 bg-muted/10 px-2 py-1.5 text-center text-[11px] font-semibold text-foreground"
              >
                {meso.totalSessions}
              </td>
            ))}
          </tr>
          <tr>
            <td className={cn(labelCell, 'text-center')}>Tareas</td>
            {macro.mesocycles.map((meso) => (
              <td
                key={`${meso.id}-tasks`}
                className="border border-primary/10 bg-muted/5 px-2 py-1.5 text-center text-[11px] text-muted-foreground"
              >
                {meso.totalTasks}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function PeriodizationPlanogram() {
  const [categorySlug, setCategorySlug] = useState<CanteraCategorySlug>('alevin');
  const category = CANTERA_CATEGORIES.find((item) => item.slug === categorySlug)!;

  const [config, setConfig] = useState<PeriodizationConfig>(() =>
    defaultPeriodizationConfig(categorySlug, category.name)
  );
  const [plan, setPlan] = useState<PeriodizationPlan | null>(null);
  const [activeMacroIndex, setActiveMacroIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const styles = CATEGORY_PLAN_STYLES[categorySlug];

  const handleCategoryChange = (slug: string) => {
    const nextSlug = slug as CanteraCategorySlug;
    const nextCategory = CANTERA_CATEGORIES.find((item) => item.slug === nextSlug)!;
    setCategorySlug(nextSlug);
    setConfig(defaultPeriodizationConfig(nextSlug, nextCategory.name));
    setPlan(null);
    setActiveMacroIndex(0);
    setError(null);
  };

  const updateConfig = (patch: Partial<PeriodizationConfig>) => {
    setConfig((current) => {
      const next = { ...current, ...patch };
      if (patch.macroCount) {
        next.macroNames = macroNamesForCount(patch.macroCount, current.macroNames);
      }
      if (patch.categorySlug === undefined) {
        next.categorySlug = categorySlug;
      }
      return next;
    });
  };

  const handleGenerate = () => {
    try {
      const nextPlan = buildPeriodizationPlan({
        ...config,
        categorySlug,
        seasonTitle: config.seasonTitle.trim() || `${category.name} · Temporada`,
      });
      setPlan(nextPlan);
      setActiveMacroIndex(0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar el planograma.');
      setPlan(null);
    }
  };

  const distributionPreview = useMemo(() => {
    return previewPeriodizationDistribution(
      config.startDate,
      config.endDate,
      config.macroCount,
      config.sessionsPerMicro
    );
  }, [config.startDate, config.endDate, config.macroCount, config.sessionsPerMicro]);

  const activeMacro = plan?.macrocycles[activeMacroIndex] ?? null;

  const summary = useMemo(() => {
    if (!plan) return null;
    return {
      mesocycles: plan.totalMesocycles,
      microcycles: plan.totalMicrocycles,
      sessions: plan.totalSessions,
      tasks: plan.totalTasks,
      distribution: formatMacroDistributionSummary(plan),
    };
  }, [plan]);

  return (
    <div className="space-y-4">
      <Card className="border border-primary/25">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" />
            Planograma de periodización
          </CardTitle>
          <CardDescription>
            Temporada por categoría, macrociclos en pestañas, mesociclos por mes natural y
            microciclos por semana (calculados desde inicio y fin de temporada).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1 rounded-xl border border-primary/20 bg-muted/5 p-1">
              {CANTERA_CATEGORIES.map((item) => {
                const active = item.slug === categorySlug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleCategoryChange(item.slug)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-left transition-colors',
                      active
                        ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.35)]'
                        : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                    )}
                  >
                    <span className="block text-sm font-semibold">{item.name}</span>
                    <span className="block text-[10px] text-muted-foreground">{item.ages}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="lg:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Título de la temporada
              </label>
              <Input
                value={config.seasonTitle}
                onChange={(event) => updateConfig({ seasonTitle: event.target.value })}
                placeholder={`${category.name} · Temporada 25/26`}
                className="border-primary/30 bg-background/80"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Inicio temporada
                </label>
                <SynqDateField
                  value={config.startDate}
                  onChange={(startDate) => updateConfig({ startDate })}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Fin temporada
                </label>
                <SynqDateField
                  value={config.endDate}
                  onChange={(endDate) => updateConfig({ endDate })}
                />
              </div>
              {distributionPreview ? (
                <p className="text-[11px] leading-relaxed text-muted-foreground sm:col-span-2">
                  {distributionPreview}
                </p>
              ) : (
                <p className="text-[11px] text-destructive sm:col-span-2">
                  Revisa las fechas: el fin debe ser posterior al inicio.
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Macrociclos anuales
              </label>
              <SynqSelect
                value={String(config.macroCount)}
                onChange={(value) => updateConfig({ macroCount: Number(value) as MacroCount })}
                options={[
                  { value: '1', label: '1 macrociclo' },
                  { value: '2', label: '2 macrociclos' },
                  { value: '3', label: '3 macrociclos' },
                ]}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Los mesociclos y microciclos se reparten de forma proporcional entre macrociclos (mismo
                nº de MCC por macro, salvo diferencia de 1).
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sesiones por microciclo
              </label>
              <SynqSelect
                value={String(config.sessionsPerMicro)}
                onChange={(value) =>
                  updateConfig({ sessionsPerMicro: Number(value) as SessionsPerMicro })
                }
                options={[
                  { value: '2', label: '2 sesiones / microciclo' },
                  { value: '3', label: '3 sesiones / microciclo' },
                ]}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Independiente del día de la semana de cada equipo (L-X, M-J, etc.). Cada MCC suma este
                número fijo de sesiones.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estructura por sesión
              </label>
              <SynqSelect
                value={String(config.mainTasksPerSession)}
                onChange={(value) =>
                  updateConfig({ mainTasksPerSession: Number(value) as MainTasksPerSession })
                }
                options={[
                  { value: '3', label: 'Estándar — 3 tareas principales' },
                  { value: '2', label: 'Corta — 2 tareas principales' },
                ]}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {sessionStructureSummary(config.mainTasksPerSession)}. Si eliges sesión corta, la tercera
                principal no aparece en la sesión.
              </p>
            </div>
          </div>

          {config.macroCount > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {macroNamesForCount(config.macroCount, config.macroNames).map((name, index) => (
                <div key={`macro-name-${index}`}>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nombre macrociclo {index + 1}
                  </label>
                  <Input
                    value={config.macroNames[index] ?? name}
                    onChange={(event) => {
                      const macroNames = [...config.macroNames];
                      macroNames[index] = event.target.value;
                      updateConfig({ macroNames });
                    }}
                    className="border-primary/30 bg-background/80"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nombre macrociclo
              </label>
              <Input
                value={config.macroNames[0] ?? 'Macrociclo 1'}
                onChange={(event) => updateConfig({ macroNames: [event.target.value] })}
                className="max-w-md border-primary/30 bg-background/80"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={handleGenerate} className="gap-2">
              <RefreshCw className="size-4" />
              Generar planograma
            </Button>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </CardContent>
      </Card>

      {plan && summary ? (
        <Card className="border border-primary/25">
          <CardHeader className="space-y-3 pb-3">
            <div
              className={cn(
                'rounded-xl border px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide',
                styles.header
              )}
            >
              {plan.config.seasonTitle}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/25">
                <CalendarRange className="mr-1 size-3.5" />
                {plan.config.startDate} → {plan.config.endDate}
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                <Layers3 className="mr-1 size-3.5" />
                {summary.mesocycles} mesociclos
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {summary.microcycles} microciclos (MCC)
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {summary.sessions} sesiones
              </Badge>
              <Badge variant="outline" className="border-primary/25">
                {summary.tasks} tareas
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{summary.distribution}</p>

            {plan.macrocycles.length > 1 ? (
              <div className="flex flex-wrap gap-1 rounded-xl border border-primary/20 bg-muted/5 p-1">
                {plan.macrocycles.map((macro) => {
                  const active = macro.index === activeMacroIndex;
                  return (
                    <button
                      key={macro.id}
                      type="button"
                      onClick={() => setActiveMacroIndex(macro.index)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        active
                          ? 'bg-primary/15 font-semibold text-primary shadow-[inset_0_0_0_1px_hsl(183_100%_50%_/_0.35)]'
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                      )}
                    >
                      <span className="block">{macro.name}</span>
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {macro.microcycleCount} MCC · {macro.mesocycleCount} mesos ·{' '}
                        {macro.startDate} → {macro.endDate}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </CardHeader>
          <CardContent>
            {activeMacro ? (
              <PeriodizationGrid macro={activeMacro} styles={styles} />
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground">
              Fase A: estructura automática por mes y semana. Plantilla de sesión alineada con microciclos
              (calentamiento + principales + vuelta a la calma). En la siguiente fase enlazaremos cada MCC
              con microciclos reales y ejercicios.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-dashed border-primary/20">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Configura la temporada y pulsa <strong className="text-foreground">Generar planograma</strong>{' '}
            para ver la rejilla como en tu ejemplo (mesociclos en columnas, MCC por semana).
          </CardContent>
        </Card>
      )}
    </div>
  );
}
