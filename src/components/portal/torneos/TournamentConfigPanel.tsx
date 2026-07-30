'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  addTournamentCategory,
  addTournamentField,
  generateCompetitionStructure,
  updateTournamentSettings,
} from '@/app/actions/tournaments';
import { SynqDateTimeField } from '@/components/portal/SynqDateTimeField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { TournamentSchedulingSection } from '@/components/portal/torneos/TournamentSchedulingSection';
import { TournamentPresentationMedia } from '@/components/portal/torneos/TournamentPresentationMedia';
import { analyzeCategoryCapacity } from '@/lib/tournament-category-scheduling';
import { FIELD_DIVISION_MODE_LABELS } from '@/lib/tournament-scheduling';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  DEFAULT_PLACEMENT_BRACKETS,
  FIELD_DIVISION_MODES,
  FORMAT_TYPE_LABELS,
  TOURNAMENT_SPORTS,
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
  type FieldDivisionMode,
  type TournamentBundle,
  type TournamentSport,
  type TournamentStatus,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Settings, Sparkles, Trophy } from 'lucide-react';

const sectionClass = 'portal-section-surface rounded-xl p-4 md:p-5';
const fieldClass = 'portal-field-surface';

export function TournamentConfigPanel({ bundle }: { bundle: TournamentBundle }) {
  const { tournament } = bundle;
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [sportKey, setSportKey] = useState<TournamentSport>(tournament.sport_key);
  const [status, setStatus] = useState<TournamentStatus>(tournament.status);
  const [startsAt, setStartsAt] = useState(tournament.starts_at?.slice(0, 16) ?? '');
  const [endsAt, setEndsAt] = useState(tournament.ends_at?.slice(0, 16) ?? '');
  const [fieldDivisionMode, setFieldDivisionMode] = useState<FieldDivisionMode>('full');

  useEffect(() => {
    setSportKey(tournament.sport_key);
    setStatus(tournament.status);
    setStartsAt(tournament.starts_at?.slice(0, 16) ?? '');
    setEndsAt(tournament.ends_at?.slice(0, 16) ?? '');
  }, [tournament.id, tournament.updated_at, tournament.sport_key, tournament.status, tournament.starts_at, tournament.ends_at]);

  return (
    <div className="space-y-5">
      {message ? (
        <p className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-200">{message}</p>
      ) : null}

      <section className={sectionClass}>
        <h3 className="flex items-center gap-2 font-medium">
          <Settings className="size-4 text-primary" />
          Datos del torneo
        </h3>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await updateTournamentSettings(tournament.id, fd);
              setMessage(res.message ?? (res.ok ? 'Guardado' : 'Error'));
            });
          }}
        >
          <input type="hidden" name="sport_key" value={sportKey} readOnly />
          <input type="hidden" name="status" value={status} readOnly />
          <input type="hidden" name="starts_at" value={startsAt} readOnly />
          <input type="hidden" name="ends_at" value={endsAt} readOnly />

          <div className="md:col-span-2">
            <label className={PORTAL_FIELD_LABEL_CLASS}>Nombre</label>
            <Input name="name" defaultValue={tournament.name} required className={fieldClass} />
          </div>

          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Deporte</label>
            <SynqSelect
              value={sportKey}
              onChange={(value) => setSportKey(value as TournamentSport)}
              options={TOURNAMENT_SPORTS.map((s) => ({ value: s, label: TOURNAMENT_SPORT_LABELS[s] }))}
            />
          </div>

          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Estado</label>
            <SynqSelect
              value={status}
              onChange={(value) => setStatus(value as TournamentStatus)}
              options={TOURNAMENT_STATUSES.map((s) => ({ value: s, label: TOURNAMENT_STATUS_LABELS[s] }))}
            />
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
            <label className={PORTAL_FIELD_LABEL_CLASS}>Sede</label>
            <Input
              name="venue_name"
              defaultValue={tournament.venue_name ?? ''}
              placeholder="Polideportivo Municipal"
              className={fieldClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={PORTAL_FIELD_LABEL_CLASS}>Descripción</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={tournament.description ?? ''}
              className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={PORTAL_FIELD_LABEL_CLASS}>Reglas</label>
            <textarea
              name="rules_text"
              rows={3}
              defaultValue={tournament.rules_text ?? ''}
              placeholder="Duración partidos, penaltis, plantilla máxima…"
              className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Guardar datos
            </Button>
          </div>
        </form>
      </section>

      <section className={sectionClass}>
        <h3 className="flex items-center gap-2 font-medium">
          <Trophy className="size-4 text-cyan-300" />
          Categorías y formato
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Grupos + finales paralelas: cada puesto del grupo va a su bandeja (Platinum, Gold, Silver…).
        </p>

        <div className="mt-4 space-y-3">
          {bundle.categories.map((cat) => {
            const analysis = analyzeCategoryCapacity({
              category: cat,
              tournament: bundle.tournament,
              fields: bundle.fields,
              teamsRegistered: bundle.teams.filter((t) => t.category_id === cat.id).length,
            });

            return (
            <div key={cat.id} className="rounded-xl border border-border/60 bg-background/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cat.groups_count} grupos × {cat.teams_per_group} equipos · {FORMAT_TYPE_LABELS[cat.format_type]}
                  </p>
                  <p className="mt-1 text-xs text-cyan-300/80">
                    {analysis.window_label} · {analysis.match_count} partidos ·{' '}
                    {analysis.fits_structure ? (
                      <span className="text-emerald-300">{analysis.capacity?.total_capacity} huecos</span>
                    ) : (
                      <span className="text-amber-300">faltan {analysis.overflow_matches} huecos</span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(cat.placement_brackets_json.length ? cat.placement_brackets_json : DEFAULT_PLACEMENT_BRACKETS)
                      .filter((b) => b.position <= cat.teams_per_group)
                      .map((b) => (
                        <Badge key={b.bracket_key} variant="outline" className="text-[10px]">
                          {b.position}º → {b.name}
                        </Badge>
                      ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = await generateCompetitionStructure(tournament.id, cat.id);
                      setMessage(res.message ?? (res.ok ? 'Competición generada' : 'Error'));
                    });
                  }}
                >
                  <Sparkles className="mr-1.5 size-4" />
                  Generar competición
                </Button>
              </div>
            </div>
            );
          })}
        </div>

        <form
          className="mt-4 grid gap-3 rounded-xl border border-dashed border-primary/30 p-4 md:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addTournamentCategory(tournament.id, fd);
              setMessage(res.message ?? (res.ok ? 'Categoría añadida' : 'Error'));
              e.currentTarget.reset();
            });
          }}
        >
          <Input name="name" placeholder="Sub-10" required className={fieldClass} />
          <Input name="groups_count" type="number" min={1} max={16} defaultValue={6} placeholder="Grupos" className={fieldClass} />
          <Input name="teams_per_group" type="number" min={2} max={8} defaultValue={4} placeholder="Equipos/grupo" className={fieldClass} />
          <input type="hidden" name="format_type" value="groups_multifinal" />
          <Button type="submit" size="sm" disabled={pending} className="md:col-span-2">
            Añadir categoría
          </Button>
        </form>
      </section>

      <section className={sectionClass}>
        <h3 className="flex items-center gap-2 font-medium">
          <MapPin className="size-4 text-primary" />
          Campos y pistas
        </h3>
        <ul className="mt-3 space-y-2">
          {bundle.fields.length === 0 ? (
            <li className="text-sm text-muted-foreground">Sin campos — añade al menos uno para programar horarios.</li>
          ) : (
            bundle.fields.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="text-xs text-muted-foreground">
                  {f.notes ?? ''}
                  {f.division_mode && f.division_mode !== 'full' ? ` · ${f.division_mode === 'halves_2' ? '2 mitades' : '4 cuartos'}` : ''}
                </span>
              </li>
            ))
          )}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addTournamentField(tournament.id, fd);
              setMessage(res.message ?? (res.ok ? 'Campo añadido' : 'Error'));
              e.currentTarget.reset();
              setFieldDivisionMode('full');
            });
          }}
        >
          <input type="hidden" name="division_mode" value={fieldDivisionMode} readOnly />
          <Input name="label" placeholder="Campo 1" required className={fieldClass} />
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>División</label>
            <SynqSelect
              value={fieldDivisionMode}
              onChange={(value) => setFieldDivisionMode(value as FieldDivisionMode)}
              options={FIELD_DIVISION_MODES.map((m) => ({ value: m, label: FIELD_DIVISION_MODE_LABELS[m] }))}
            />
          </div>
          <Input name="notes" placeholder="Notas (césped, pista…)" className={fieldClass} />
          <div className="flex items-end">
            <Button type="submit" size="sm" variant="outline" disabled={pending}>
              Añadir campo
            </Button>
          </div>
        </form>
      </section>

      <TournamentPresentationMedia bundle={bundle} />

      <TournamentSchedulingSection bundle={bundle} />
    </div>
  );
}
