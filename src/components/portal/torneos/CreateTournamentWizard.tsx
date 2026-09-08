'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournamentFull } from '@/app/actions/tournaments';
import { SynqDateTimeField } from '@/components/portal/SynqDateTimeField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { SynqNumericStepper } from '@/components/portal/SynqNumericStepper';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  analyzeAllCategories,
  formatCategoryWindowLabel,
  suggestCategoryWindows,
} from '@/lib/tournament-category-scheduling';
import {
  newCategoryDraft,
  newFieldDraft,
  type CreateTournamentWizardPayload,
  type WizardCategoryDraft,
  type WizardFieldDraft,
} from '@/lib/tournament-create-wizard';
import {
  DEFAULT_SCHEDULING_CONFIG,
  FIELD_DIVISION_MODE_LABELS,
  MATCH_FORMAT_PRESET_LABELS,
  MATCH_FORMAT_PRESETS,
  type MatchFormatPreset,
  type TournamentSchedulingConfig,
} from '@/lib/tournament-scheduling';
import {
  FIELD_DIVISION_MODES,
  TOURNAMENT_SPORTS,
  TOURNAMENT_SPORT_LABELS,
  type FieldDivisionMode,
  type Tournament,
  type TournamentCategory,
  type TournamentField,
  type TournamentSport,
} from '@/lib/tournaments';
import { DEFAULT_PLACEMENT_BRACKETS } from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react';

const fieldClass = 'portal-field-surface';
const STEPS = ['Datos', 'Categorías', 'Campos', 'Planificación', 'Revisión'] as const;

export function CreateTournamentWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    return d;
  }, []);
  const defaultEnd = useMemo(() => {
    const d = new Date(defaultStart);
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    return d;
  }, [defaultStart]);

  const [name, setName] = useState('');
  const [sportKey, setSportKey] = useState<TournamentSport>('football');
  const [venueName, setVenueName] = useState('');
  const [startsAt, setStartsAt] = useState(defaultStart.toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(defaultEnd.toISOString().slice(0, 16));
  const [description, setDescription] = useState('');
  const [rulesText, setRulesText] = useState('');

  const [categories, setCategories] = useState<WizardCategoryDraft[]>([
    newCategoryDraft('Sub-10'),
    newCategoryDraft('Sub-12'),
  ]);
  const [fields, setFields] = useState<WizardFieldDraft[]>([
    { ...newFieldDraft(), label: 'Campo 1 (F11)', division_mode: 'halves_2' },
    { ...newFieldDraft(), label: 'Campo 2', division_mode: 'full' },
  ]);
  const [scheduling, setScheduling] = useState<TournamentSchedulingConfig>(DEFAULT_SCHEDULING_CONFIG);

  const preview = useMemo(() => {
    const mockTournament: Pick<Tournament, 'starts_at' | 'ends_at' | 'format_json'> = {
      starts_at: startsAt,
      ends_at: endsAt,
      format_json: { scheduling },
    };

    const mockCategories: TournamentCategory[] = categories.map((c, i) => ({
      id: c.tempId,
      tournament_id: 'wizard-preview',
      name: c.name,
      sport_key: sportKey,
      groups_count: c.groups_count,
      teams_per_group: c.teams_per_group,
      format_type: c.format_type,
      placement_brackets_json: DEFAULT_PLACEMENT_BRACKETS.filter((b) => b.position <= c.teams_per_group),
      sort_order: i,
    }));

    const mockFields: TournamentField[] = fields.map((f, i) => ({
      id: f.tempId,
      tournament_id: 'wizard-preview',
      facility_id: null,
      label: f.label,
      map_url: null,
      notes: f.notes || null,
      sort_order: i,
      division_mode: f.division_mode,
    }));

    const windows = suggestCategoryWindows({
      categories: mockCategories,
      tournament: mockTournament,
      fields: mockFields,
      config: scheduling,
    });

    const analyses = analyzeAllCategories({
      categories: mockCategories,
      tournament: { ...mockTournament, format_json: { scheduling, category_scheduling: windows } } as unknown as Tournament,
      fields: mockFields,
      teams: [],
      config: scheduling,
    });

    return { windows, analyses, mockCategories };
  }, [categories, fields, startsAt, endsAt, scheduling, sportKey]);

  const allFit = preview.analyses.every((a) => a.fits_structure);

  function patchScheduling(partial: Partial<TournamentSchedulingConfig>) {
    setScheduling((c) => ({ ...c, ...partial }));
  }

  function handlePresetChange(preset: MatchFormatPreset) {
    patchScheduling({
      match_format_preset: preset,
      ...(preset === 'football_7'
        ? { periods: 2, period_minutes: 20, break_minutes: 5, turnover_minutes: 8 }
        : preset === 'football_11'
          ? { periods: 2, period_minutes: 25, break_minutes: 5, turnover_minutes: 10 }
          : {}),
    });
  }

  async function submit() {
    setPending(true);
    setError(null);
    const payload: CreateTournamentWizardPayload = {
      name,
      sport_key: sportKey,
      venue_name: venueName.trim() || null,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      description: description.trim() || null,
      rules_text: rulesText.trim() || null,
      categories,
      fields,
      scheduling,
    };
    const result = await createTournamentFull(payload);
    setPending(false);
    if (!result.ok) {
      setError(result.message ?? 'Error al crear');
      return;
    }
    if (result.id) router.push(`/portal/torneos/${result.id}?tab=equipos`);
  }

  function canNext(): boolean {
    if (step === 0) return name.trim().length > 0 && !!startsAt && !!endsAt;
    if (step === 1) return categories.length > 0 && categories.every((c) => c.name.trim());
    if (step === 2) return fields.length > 0 && fields.every((f) => f.label.trim());
    return true;
  }

  return (
    <div className="portal-section-surface mx-auto max-w-3xl rounded-xl p-5 md:p-6">
      <h2 className="text-lg font-medium">Nuevo torneo</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Configura el torneo completo antes de crearlo: categorías, campos y planificación horaria.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <Badge
            key={label}
            variant="outline"
            className={cn(
              'text-[10px]',
              i === step && 'border-cyan-400/50 bg-cyan-400/10 text-cyan-200',
              i < step && 'border-emerald-400/40 text-emerald-300'
            )}
          >
            {i < step ? <Check className="mr-1 inline size-3" /> : null}
            {i + 1}. {label}
          </Badge>
        ))}
      </div>

      <div className="mt-6 min-h-[20rem]">
        {step === 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={PORTAL_FIELD_LABEL_CLASS}>Nombre del torneo</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Torneo Ciudad de Madrid" className={fieldClass} />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Deporte</label>
              <SynqSelect
                value={sportKey}
                onChange={(v) => setSportKey(v as TournamentSport)}
                options={TOURNAMENT_SPORTS.map((s) => ({ value: s, label: TOURNAMENT_SPORT_LABELS[s] }))}
              />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Sede</label>
              <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Polideportivo Municipal" className={fieldClass} />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Inicio</label>
              <SynqDateTimeField value={startsAt} onChange={setStartsAt} />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Fin</label>
              <SynqDateTimeField value={endsAt} onChange={setEndsAt} />
            </div>
            <div className="md:col-span-2">
              <label className={PORTAL_FIELD_LABEL_CLASS}>Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`} />
            </div>
            <div className="md:col-span-2">
              <label className={PORTAL_FIELD_LABEL_CLASS}>Reglas</label>
              <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)} rows={2} placeholder="Duración, penaltis, plantilla máxima…" className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`} />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Cada categoría tendrá su franja horaria exclusiva (se asigna en el paso de planificación).</p>
            {categories.map((cat, idx) => (
              <div key={cat.tempId} className="grid gap-3 rounded-xl border border-border/50 p-3 md:grid-cols-[1fr_5rem_5rem_auto]">
                <Input
                  value={cat.name}
                  onChange={(e) => {
                    const next = [...categories];
                    next[idx] = { ...cat, name: e.target.value };
                    setCategories(next);
                  }}
                  placeholder="Prebenjamín 1º año"
                  className={fieldClass}
                />
                <SynqNumericStepper
                  name={`groups_${cat.tempId}`}
                  value={cat.groups_count}
                  onChange={(v) => {
                    const next = [...categories];
                    next[idx] = { ...cat, groups_count: v ?? cat.groups_count };
                    setCategories(next);
                  }}
                  min={1}
                  max={16}
                />
                <SynqNumericStepper
                  name={`teams_${cat.tempId}`}
                  value={cat.teams_per_group}
                  onChange={(v) => {
                    const next = [...categories];
                    next[idx] = { ...cat, teams_per_group: v ?? cat.teams_per_group };
                    setCategories(next);
                  }}
                  min={2}
                  max={8}
                />
                <Button type="button" size="icon" variant="ghost" disabled={categories.length <= 1} onClick={() => setCategories(categories.filter((c) => c.tempId !== cat.tempId))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setCategories([...categories, newCategoryDraft()])}>
              <Plus className="mr-1.5 size-4" />
              Añadir categoría
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Divide campos F11 en mitades para más pistas F7.</p>
            {fields.map((f, idx) => (
              <div key={f.tempId} className="grid gap-3 rounded-xl border border-border/50 p-3 md:grid-cols-[1fr_10rem_auto]">
                <Input
                  value={f.label}
                  onChange={(e) => {
                    const next = [...fields];
                    next[idx] = { ...f, label: e.target.value };
                    setFields(next);
                  }}
                  placeholder="Campo 1"
                  className={fieldClass}
                />
                <SynqSelect
                  value={f.division_mode}
                  onChange={(v) => {
                    const next = [...fields];
                    next[idx] = { ...f, division_mode: v as FieldDivisionMode };
                    setFields(next);
                  }}
                  options={FIELD_DIVISION_MODES.map((m) => ({ value: m, label: FIELD_DIVISION_MODE_LABELS[m] }))}
                />
                <Button type="button" size="icon" variant="ghost" disabled={fields.length <= 1} onClick={() => setFields(fields.filter((x) => x.tempId !== f.tempId))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => setFields([...fields, newFieldDraft()])}>
              <Plus className="mr-1.5 size-4" />
              Añadir campo
            </Button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Formato de partido</label>
              <SynqSelect
                value={scheduling.match_format_preset}
                onChange={(v) => handlePresetChange(v as MatchFormatPreset)}
                options={MATCH_FORMAT_PRESETS.map((p) => ({ value: p, label: MATCH_FORMAT_PRESET_LABELS[p] }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={PORTAL_FIELD_LABEL_CLASS}>Inicio jornada (referencia)</label>
                <Input value={scheduling.day_start} onChange={(e) => patchScheduling({ day_start: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className={PORTAL_FIELD_LABEL_CLASS}>Fin jornada (referencia)</label>
                <Input value={scheduling.day_end} onChange={(e) => patchScheduling({ day_end: e.target.value })} className={fieldClass} />
              </div>
            </div>
            <div className="space-y-2 border-t border-border/50 pt-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <CalendarRange className="size-4 text-cyan-300" />
                Ventanas sugeridas por categoría
              </p>
              {preview.analyses.map((a) => {
                const w = preview.windows[a.category_id];
                return (
                  <div key={a.category_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2 text-sm">
                    <span className="font-medium">{a.category_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {w ? formatCategoryWindowLabel(w) : '—'} · {a.match_count} partidos
                    </span>
                    <Badge variant="outline" className={a.fits_structure ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}>
                      {a.fits_structure ? 'Cabe' : `Faltan ${a.overflow_matches}`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="font-medium">{name}</p>
              <p className="mt-1 text-muted-foreground">
                {TOURNAMENT_SPORT_LABELS[sportKey]}
                {venueName ? ` · ${venueName}` : ''}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 p-3">
                <p className="flex items-center gap-2 font-medium">
                  <Trophy className="size-4 text-cyan-300" />
                  {categories.length} categorías
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {preview.analyses.map((a) => (
                    <li key={a.category_id}>
                      {a.category_name}: {a.match_count} partidos · {a.fits_structure ? 'OK' : `faltan ${a.overflow_matches} huecos`}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border/50 p-3">
                <p className="flex items-center gap-2 font-medium">
                  <MapPin className="size-4 text-primary" />
                  {fields.length} campos
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {fields.map((f) => (
                    <li key={f.tempId}>
                      {f.label} · {FIELD_DIVISION_MODE_LABELS[f.division_mode]}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {!allFit ? (
              <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-amber-200">
                Alguna categoría no cabe en la franja sugerida. Puedes crear el torneo igualmente y ajustar ventanas después en Ajustes.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-border/50 pt-4">
        <Button type="button" variant="outline" size="sm" disabled={step === 0 || pending} onClick={() => setStep((s) => s - 1)}>
          <ChevronLeft className="mr-1 size-4" />
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" size="sm" disabled={!canNext() || pending} onClick={() => setStep((s) => s + 1)}>
            Siguiente
            <ChevronRight className="ml-1 size-4" />
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={pending || !canNext()} onClick={submit}>
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Crear torneo
          </Button>
        )}
      </div>
    </div>
  );
}
