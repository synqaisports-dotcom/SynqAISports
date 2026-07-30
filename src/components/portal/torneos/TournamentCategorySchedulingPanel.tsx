'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  suggestCategoryWindowsAction,
  updateCategoryScheduling,
} from '@/app/actions/tournaments';
import { SynqDateField } from '@/components/portal/SynqDateField';
import { SynqTimeField } from '@/components/portal/SynqTimeField';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  analyzeAllCategories,
  formatCategoryWindowLabel,
  getCategoryWindow,
} from '@/lib/tournament-category-scheduling';
import { getSchedulingConfig } from '@/lib/tournament-scheduling';
import type { CategorySchedulingWindow, TournamentBundle } from '@/lib/tournaments';
import { getCategorySchedulingMap } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarRange, Loader2, Sparkles } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
};

export function TournamentCategorySchedulingPanel({ bundle }: Props) {
  const { tournament } = bundle;
  const config = useMemo(() => getSchedulingConfig(tournament), [tournament]);
  const savedMap = useMemo(() => getCategorySchedulingMap(tournament), [tournament]);

  const [windows, setWindows] = useState<Record<string, CategorySchedulingWindow>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const next: Record<string, CategorySchedulingWindow> = {};
    for (const cat of bundle.categories) {
      const w = getCategoryWindow(cat.id, tournament, config);
      if (w) next[cat.id] = w;
    }
    setWindows(next);
  }, [bundle.categories, tournament, config, savedMap, tournament.updated_at]);

  const analyses = useMemo(
    () =>
      analyzeAllCategories({
        categories: bundle.categories,
        tournament,
        fields: bundle.fields,
        teams: bundle.teams,
        config,
      }),
    [bundle.categories, bundle.fields, bundle.teams, tournament, config]
  );

  const totalFits = analyses.every((a) => a.fits_structure);
  const anyOverflow = analyses.some((a) => !a.fits_structure);

  const patchWindow = (categoryId: string, partial: Partial<CategorySchedulingWindow>) => {
    setWindows((current) => ({
      ...current,
      [categoryId]: { ...current[categoryId]!, ...partial },
    }));
  };

  if (bundle.categories.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Añade categorías para asignar ventanas horarias exclusivas.
      </p>
    );
  }

  return (
    <div className="mt-5 space-y-4 border-t border-border/50 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium">
            <CalendarRange className="size-4 text-cyan-300" />
            Ventanas por categoría
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Cada categoría juega en su franja exclusiva. Las categorías nunca comparten horario ni campos a la vez.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={totalFits ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}
          >
            {totalFits ? 'Todas las categorías caben' : 'Revisa capacidad'}
          </Badge>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || bundle.fields.length === 0}
            onClick={() => {
              startTransition(async () => {
                const res = await suggestCategoryWindowsAction(tournament.id);
                setMessage(res.message ?? (res.ok ? 'Ventanas sugeridas' : 'Error'));
              });
            }}
          >
            <Sparkles className="mr-1.5 size-4" />
            Repartir automático
          </Button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">{message}</p>
      ) : null}

      {anyOverflow ? (
        <p className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Alguna categoría necesita más huecos de los disponibles en su ventana. Reduce grupos/equipos, amplía la franja
          o divide en más campos (F11 en mitades = más pistas F7).
        </p>
      ) : null}

      <div className="space-y-3">
        {bundle.categories.map((cat) => {
          const analysis = analyses.find((a) => a.category_id === cat.id);
          const window = windows[cat.id];
          if (!window || !analysis) return null;

          return (
            <div key={cat.id} className="rounded-xl border border-border/60 bg-background/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat.groups_count} grupos × {cat.teams_per_group} equipos · {analysis.match_count} partidos estimados
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-[10px]">
                    {analysis.capacity?.total_capacity ?? 0} huecos
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      analysis.fits_structure
                        ? 'border-emerald-400/40 text-emerald-300'
                        : 'border-amber-400/40 text-amber-300'
                    }
                  >
                    {analysis.fits_structure ? 'Cabe' : `Faltan ${analysis.overflow_matches}`}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Equipos {analysis.teams_registered}/{analysis.team_slots}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={PORTAL_FIELD_LABEL_CLASS}>Día</label>
                  <SynqDateField
                    value={window.day_date}
                    onChange={(day_date) => patchWindow(cat.id, { day_date })}
                  />
                </div>
                <div>
                  <label className={PORTAL_FIELD_LABEL_CLASS}>Desde</label>
                  <SynqTimeField value={window.day_start} onChange={(day_start) => patchWindow(cat.id, { day_start })} />
                </div>
                <div>
                  <label className={PORTAL_FIELD_LABEL_CLASS}>Hasta</label>
                  <SynqTimeField value={window.day_end} onChange={(day_end) => patchWindow(cat.id, { day_end })} />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await updateCategoryScheduling(tournament.id, cat.id, window);
                        setMessage(res.message ?? (res.ok ? `${cat.name} guardada` : 'Error'));
                      });
                    }}
                  >
                    {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                    Guardar franja
                  </Button>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-muted-foreground">
                {formatCategoryWindowLabel(window)} · {analysis.invites_remaining} plazas libres
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
