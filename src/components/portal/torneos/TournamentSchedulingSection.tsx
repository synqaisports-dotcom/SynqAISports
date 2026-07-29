'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  calculateTournamentSchedules,
  updateTournamentFieldDivision,
  updateTournamentScheduling,
} from '@/app/actions/tournaments';
import {
  estimateScheduleCapacity,
  formatCapacitySummary,
  getSchedulingConfig,
  FIELD_DIVISION_MODE_LABELS,
  GROUP_STRATEGY_LABELS,
  MATCH_FORMAT_PRESET_LABELS,
  MATCH_FORMAT_PRESETS,
  GROUP_SCHEDULE_STRATEGIES,
  type TournamentSchedulingConfig,
} from '@/lib/tournament-scheduling';
import { FIELD_DIVISION_MODES, type FieldDivisionMode, type TournamentBundle } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, Calculator, Loader2 } from 'lucide-react';

const inputClass = 'w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm';

type Props = {
  bundle: TournamentBundle;
};

export function TournamentSchedulingSection({ bundle }: Props) {
  const { tournament } = bundle;
  const config = useMemo(() => getSchedulingConfig(tournament), [tournament]);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const schedulableCount = bundle.matches.filter((m) => m.status === 'scheduled').length;
  const capacity = useMemo(
    () =>
      estimateScheduleCapacity({
        tournament,
        fields: bundle.fields,
        matchCount: schedulableCount,
        config,
      }),
    [tournament, bundle.fields, schedulableCount, config]
  );

  return (
    <section className="portal-section-surface rounded-xl p-4 md:p-5">
      <h3 className="flex items-center gap-2 font-medium">
        <CalendarClock className="size-4 text-cyan-300" />
        Planificación y horarios
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Define duración de partidos, ventana horaria y estrategia de asignación. Luego calcula los horarios automáticamente.
      </p>

      {message ? (
        <p className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">{message}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {formatCapacitySummary(capacity)}
        </Badge>
        <Badge
          variant="outline"
          className={capacity.fits ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}
        >
          {capacity.fits ? 'Capacidad suficiente' : `Faltan ~${capacity.overflow} huecos`}
        </Badge>
      </div>

      <form
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await updateTournamentScheduling(tournament.id, fd);
            setMessage(res.message ?? (res.ok ? 'Guardado' : 'Error'));
          });
        }}
      >
        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Formato de partido</span>
          <select name="match_format_preset" defaultValue={config.match_format_preset} className={inputClass}>
            {MATCH_FORMAT_PRESETS.map((p) => (
              <option key={p} value={p}>
                {MATCH_FORMAT_PRESET_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Partes</span>
          <select name="periods" defaultValue={config.periods} className={inputClass}>
            <option value={1}>1 parte</option>
            <option value={2}>2 partes</option>
            <option value={4}>4 cuartos</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Minutos por parte</span>
          <input name="period_minutes" type="number" min={5} max={60} defaultValue={config.period_minutes} className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Descanso entre partes (min)</span>
          <input name="break_minutes" type="number" min={0} max={30} defaultValue={config.break_minutes} className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Rotación entre partidos (min)</span>
          <input name="turnover_minutes" type="number" min={0} max={30} defaultValue={config.turnover_minutes} className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Descanso mínimo mismo equipo (min)</span>
          <input
            name="min_rest_same_team_minutes"
            type="number"
            min={0}
            max={240}
            defaultValue={config.min_rest_same_team_minutes}
            className={inputClass}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Inicio jornada</span>
          <input name="day_start" type="time" defaultValue={config.day_start} className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Fin jornada</span>
          <input name="day_end" type="time" defaultValue={config.day_end} className={inputClass} />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            name="lunch_break_enabled"
            defaultChecked={config.lunch_break_enabled}
            className="size-4 rounded border-border"
          />
          <span className="text-sm">Pausa comida</span>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Comida desde</span>
          <input name="lunch_start" type="time" defaultValue={config.lunch_start} className={inputClass} />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Comida hasta</span>
          <input name="lunch_end" type="time" defaultValue={config.lunch_end} className={inputClass} />
        </label>

        <label className="space-y-1.5 md:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Estrategia fase de grupos</span>
          <select name="group_strategy" defaultValue={config.group_strategy} className={inputClass}>
            {GROUP_SCHEDULE_STRATEGIES.map((s) => (
              <option key={s} value={s}>
                {GROUP_STRATEGY_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar planificación
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || bundle.fields.length === 0 || schedulableCount === 0}
            onClick={() => {
              startTransition(async () => {
                const res = await calculateTournamentSchedules(tournament.id);
                setMessage(res.message ?? (res.ok ? 'Horarios calculados' : 'Error'));
              });
            }}
          >
            <Calculator className="mr-1.5 size-4" />
            Calcular horarios
          </Button>
        </div>
      </form>

      {bundle.fields.length > 0 ? (
        <div className="mt-5 space-y-2 border-t border-border/50 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">División por campo</p>
          {bundle.fields.map((field) => (
            <div key={field.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
              <span className="font-medium">{field.label}</span>
              <select
                defaultValue={field.division_mode ?? 'full'}
                className="rounded-lg border border-border bg-background/50 px-2 py-1 text-xs"
                disabled={pending}
                onChange={(e) => {
                  const mode = e.target.value as FieldDivisionMode;
                  startTransition(async () => {
                    const res = await updateTournamentFieldDivision(tournament.id, field.id, mode);
                    setMessage(res.message ?? (res.ok ? 'División actualizada' : 'Error'));
                  });
                }}
              >
                {FIELD_DIVISION_MODES.map((m) => (
                  <option key={m} value={m}>
                    {FIELD_DIVISION_MODE_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
