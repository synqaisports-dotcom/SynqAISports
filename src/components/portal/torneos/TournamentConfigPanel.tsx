'use client';

import { useState, useTransition } from 'react';
import {
  addTournamentCategory,
  addTournamentField,
  generateCompetitionStructure,
  updateTournamentSettings,
} from '@/app/actions/tournaments';
import {
  DEFAULT_PLACEMENT_BRACKETS,
  FORMAT_TYPE_LABELS,
  TOURNAMENT_SPORTS,
  TOURNAMENT_SPORT_LABELS,
  TOURNAMENT_STATUSES,
  TOURNAMENT_STATUS_LABELS,
  type TournamentBundle,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Settings, Sparkles, Trophy } from 'lucide-react';

const sectionClass = 'portal-section-surface rounded-xl p-4 md:p-5';

export function TournamentConfigPanel({ bundle }: { bundle: TournamentBundle }) {
  const { tournament } = bundle;
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Nombre</span>
            <input
              name="name"
              defaultValue={tournament.name}
              required
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Deporte</span>
            <select name="sport_key" defaultValue={tournament.sport_key} className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
              {TOURNAMENT_SPORTS.map((s) => (
                <option key={s} value={s}>{TOURNAMENT_SPORT_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Estado</span>
            <select name="status" defaultValue={tournament.status} className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
              {TOURNAMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{TOURNAMENT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Inicio</span>
            <input
              name="starts_at"
              type="datetime-local"
              defaultValue={tournament.starts_at?.slice(0, 16) ?? ''}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Fin</span>
            <input
              name="ends_at"
              type="datetime-local"
              defaultValue={tournament.ends_at?.slice(0, 16) ?? ''}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Sede</span>
            <input
              name="venue_name"
              defaultValue={tournament.venue_name ?? ''}
              placeholder="Polideportivo Municipal"
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Descripción</span>
            <textarea
              name="description"
              rows={2}
              defaultValue={tournament.description ?? ''}
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Reglas</span>
            <textarea
              name="rules_text"
              rows={3}
              defaultValue={tournament.rules_text ?? ''}
              placeholder="Duración partidos, penaltis, plantilla máxima…"
              className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </label>
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
          {bundle.categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-border/60 bg-background/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{cat.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cat.groups_count} grupos × {cat.teams_per_group} equipos · {FORMAT_TYPE_LABELS[cat.format_type]}
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
          ))}
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
          <input name="name" placeholder="Sub-10" required className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
          <input name="groups_count" type="number" min={1} max={16} defaultValue={6} placeholder="Grupos" className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
          <input name="teams_per_group" type="number" min={2} max={8} defaultValue={4} placeholder="Equipos/grupo" className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
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
                {f.notes ? <span className="text-xs text-muted-foreground">{f.notes}</span> : null}
              </li>
            ))
          )}
        </ul>
        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await addTournamentField(tournament.id, fd);
              setMessage(res.message ?? (res.ok ? 'Campo añadido' : 'Error'));
              e.currentTarget.reset();
            });
          }}
        >
          <input name="label" placeholder="Campo 1" required className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
          <input name="notes" placeholder="Notas (césped, pista…)" className="min-w-[160px] flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>Añadir campo</Button>
        </form>
      </section>
    </div>
  );
}
