'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  calculateTournamentSchedules,
  updateTournamentFieldDivision,
  updateTournamentScheduling,
} from '@/app/actions/tournaments';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { SynqTimeField } from '@/components/portal/SynqTimeField';
import { SynqNumericStepper } from '@/components/portal/SynqNumericStepper';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  estimateScheduleCapacity,
  formatCapacitySummary,
  getSchedulingConfig,
  FIELD_DIVISION_MODE_LABELS,
  GROUP_STRATEGY_LABELS,
  MATCH_FORMAT_PRESET_LABELS,
  MATCH_FORMAT_PRESETS,
  GROUP_SCHEDULE_STRATEGIES,
  type MatchFormatPreset,
  type TournamentSchedulingConfig,
} from '@/lib/tournament-scheduling';
import { FIELD_DIVISION_MODES, type FieldDivisionMode, type TournamentBundle } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, Calculator, Loader2 } from 'lucide-react';

type Props = {
  bundle: TournamentBundle;
};

export function TournamentSchedulingSection({ bundle }: Props) {
  const { tournament } = bundle;
  const savedConfig = useMemo(() => getSchedulingConfig(tournament), [tournament]);
  const [config, setConfig] = useState<TournamentSchedulingConfig>(savedConfig);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setConfig(savedConfig);
  }, [savedConfig, tournament.updated_at]);

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

  const patch = (partial: Partial<TournamentSchedulingConfig>) => {
    setConfig((current) => ({ ...current, ...partial }));
  };

  const handlePresetChange = (preset: MatchFormatPreset) => {
    const next = getSchedulingConfig({ format_json: { scheduling: { ...config, match_format_preset: preset } } });
    setConfig(next);
  };

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
        <input type="hidden" name="match_format_preset" value={config.match_format_preset} readOnly />
        <input type="hidden" name="periods" value={config.periods} readOnly />
        <input type="hidden" name="period_minutes" value={config.period_minutes} readOnly />
        <input type="hidden" name="break_minutes" value={config.break_minutes} readOnly />
        <input type="hidden" name="turnover_minutes" value={config.turnover_minutes} readOnly />
        <input type="hidden" name="min_rest_same_team_minutes" value={config.min_rest_same_team_minutes} readOnly />
        <input type="hidden" name="day_start" value={config.day_start} readOnly />
        <input type="hidden" name="day_end" value={config.day_end} readOnly />
        <input type="hidden" name="lunch_start" value={config.lunch_start} readOnly />
        <input type="hidden" name="lunch_end" value={config.lunch_end} readOnly />
        <input type="hidden" name="group_strategy" value={config.group_strategy} readOnly />

        <div className="md:col-span-2">
          <label className={PORTAL_FIELD_LABEL_CLASS}>Formato de partido</label>
          <SynqSelect
            value={config.match_format_preset}
            onChange={(value) => handlePresetChange(value as MatchFormatPreset)}
            options={MATCH_FORMAT_PRESETS.map((p) => ({ value: p, label: MATCH_FORMAT_PRESET_LABELS[p] }))}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Partes</label>
          <SynqSelect
            value={String(config.periods)}
            onChange={(value) => patch({ periods: Number(value) as TournamentSchedulingConfig['periods'] })}
            options={[
              { value: '1', label: '1 parte' },
              { value: '2', label: '2 partes' },
              { value: '4', label: '4 cuartos' },
            ]}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Minutos por parte</label>
          <SynqNumericStepper
            name="period_minutes_ui"
            value={config.period_minutes}
            onChange={(value) => patch({ period_minutes: value ?? config.period_minutes, match_format_preset: 'custom' })}
            min={5}
            max={60}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Descanso entre partes (min)</label>
          <SynqNumericStepper
            name="break_minutes_ui"
            value={config.break_minutes}
            onChange={(value) => patch({ break_minutes: value ?? config.break_minutes, match_format_preset: 'custom' })}
            min={0}
            max={30}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Rotación entre partidos (min)</label>
          <SynqNumericStepper
            name="turnover_minutes_ui"
            value={config.turnover_minutes}
            onChange={(value) => patch({ turnover_minutes: value ?? config.turnover_minutes, match_format_preset: 'custom' })}
            min={0}
            max={30}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Descanso mínimo mismo equipo (min)</label>
          <SynqNumericStepper
            name="min_rest_ui"
            value={config.min_rest_same_team_minutes}
            onChange={(value) =>
              patch({ min_rest_same_team_minutes: value ?? config.min_rest_same_team_minutes })
            }
            min={0}
            max={240}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Inicio jornada</label>
          <SynqTimeField value={config.day_start} onChange={(day_start) => patch({ day_start })} />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Fin jornada</label>
          <SynqTimeField value={config.day_end} onChange={(day_end) => patch({ day_end })} />
        </div>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            name="lunch_break_enabled"
            checked={config.lunch_break_enabled}
            onChange={(e) => patch({ lunch_break_enabled: e.target.checked })}
            className="size-4 rounded border-border accent-primary"
          />
          <span className="text-sm">Pausa comida</span>
        </label>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Comida desde</label>
          <SynqTimeField
            value={config.lunch_start}
            onChange={(lunch_start) => patch({ lunch_start })}
          />
        </div>

        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Comida hasta</label>
          <SynqTimeField value={config.lunch_end} onChange={(lunch_end) => patch({ lunch_end })} />
        </div>

        <div className="md:col-span-2">
          <label className={PORTAL_FIELD_LABEL_CLASS}>Estrategia fase de grupos</label>
          <SynqSelect
            value={config.group_strategy}
            onChange={(value) => patch({ group_strategy: value as TournamentSchedulingConfig['group_strategy'] })}
            options={GROUP_SCHEDULE_STRATEGIES.map((s) => ({ value: s, label: GROUP_STRATEGY_LABELS[s] }))}
          />
        </div>

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
          <p className={PORTAL_FIELD_LABEL_CLASS}>División por campo</p>
          {bundle.fields.map((field) => (
            <div
              key={field.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2 text-sm"
            >
              <span className="font-medium">{field.label}</span>
              <div className="w-full min-w-[12rem] sm:w-56">
                <SynqSelect
                  value={field.division_mode ?? 'full'}
                  disabled={pending}
                  onChange={(value) => {
                    startTransition(async () => {
                      const res = await updateTournamentFieldDivision(
                        tournament.id,
                        field.id,
                        value as FieldDivisionMode
                      );
                      setMessage(res.message ?? (res.ok ? 'División actualizada' : 'Error'));
                    });
                  }}
                  options={FIELD_DIVISION_MODES.map((m) => ({
                    value: m,
                    label: FIELD_DIVISION_MODE_LABELS[m],
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
