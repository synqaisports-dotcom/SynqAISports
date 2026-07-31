'use client';

import { useMemo, useState, useTransition } from 'react';
import { confirmTeamAttendance, rejectTeamAttendance } from '@/app/actions/tournaments';
import type { SquadPlayer, TournamentBundle, TournamentTeam } from '@/lib/tournaments';
import { TEAM_STATUS_LABELS } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarClock, Check, MapPin, Pencil, Users, X } from 'lucide-react';

const MAX_SQUAD = 12;

type Props = {
  team: TournamentTeam;
  bundle: TournamentBundle;
};

export function DelegatePortal({ team, bundle }: Props) {
  const category = bundle.categories.find((c) => c.id === team.category_id);
  const [squad, setSquad] = useState<SquadPlayer[]>(() => buildSquad(team));
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'form' | 'confirmed' | 'rejected'>(
    team.status === 'confirmed' ? 'confirmed' : team.status === 'rejected' ? 'rejected' : 'form'
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const filledCount = useMemo(() => squad.filter((p) => p.name.trim()).length, [squad]);
  const dateLabel = useMemo(() => {
    if (!bundle.tournament.starts_at) return null;
    const start = new Date(bundle.tournament.starts_at);
    const end = bundle.tournament.ends_at ? new Date(bundle.tournament.ends_at) : start;
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const startStr = start.toLocaleDateString('es-ES', opts);
    if (start.toDateString() === end.toDateString()) return startStr;
    return `${startStr} – ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
  }, [bundle.tournament.starts_at, bundle.tournament.ends_at]);

  function handleConfirm() {
    if (!team.invite_token) return;
    setError(false);
    startTransition(async () => {
      const filled = squad.filter((p) => p.name.trim());
      const res = await confirmTeamAttendance(team.invite_token!, filled);
      if (res.ok) {
        setMode('confirmed');
        setMessage(res.message ?? 'Asistencia confirmada');
      } else {
        setError(true);
        setMessage(res.message ?? 'No se pudo confirmar');
      }
    });
  }

  function handleReject() {
    if (!team.invite_token) return;
    setError(false);
    startTransition(async () => {
      const res = await rejectTeamAttendance(team.invite_token!);
      if (res.ok) {
        setMode('rejected');
        setMessage(res.message ?? 'Asistencia rechazada');
      } else {
        setError(true);
        setMessage(res.message ?? 'No se pudo rechazar');
      }
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-6">
      <div className="portal-section-surface rounded-xl p-5">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Portal delegado</p>
        <h1 className="mt-2 text-xl font-semibold">{bundle.tournament.name}</h1>
        <p className="mt-1 text-sm font-medium text-foreground">{team.name}</p>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {category ? <p>{category.name}{team.group_code ? ` · Grupo ${team.group_code}` : ''}</p> : null}
          {dateLabel ? (
            <p className="inline-flex items-center gap-1">
              <CalendarClock className="size-3 text-cyan-300" />
              {dateLabel}
            </p>
          ) : null}
          {bundle.tournament.venue_name ? (
            <p className="inline-flex items-center gap-1">
              <MapPin className="size-3 text-cyan-300" />
              {bundle.tournament.venue_name}
            </p>
          ) : null}
        </div>

        {team.status !== 'invited' ? (
          <p className="mt-3 text-xs text-cyan-300/80">
            Estado: {TEAM_STATUS_LABELS[team.status]}
            {team.confirmed_at
              ? ` · ${new Date(team.confirmed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
              : ''}
          </p>
        ) : null}
      </div>

      {mode === 'confirmed' ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-8 text-center">
            <Check className="size-10 text-cyan-300" />
            <p className="font-medium">Asistencia confirmada</p>
            <p className="text-sm text-muted-foreground">
              {filledCount} jugador{filledCount === 1 ? '' : 'es'} en plantilla. Nos vemos en el torneo.
            </p>
          </div>

          <SquadSummary squad={squad.filter((p) => p.name.trim())} />

          <Button type="button" variant="outline" className="w-full" onClick={() => setMode('form')}>
            <Pencil className="mr-2 size-4" />
            Editar plantilla
          </Button>
        </div>
      ) : mode === 'rejected' ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-red-400/30 bg-red-400/5 p-8 text-center">
          <X className="size-10 text-red-300" />
          <p className="font-medium">Asistencia rechazada</p>
          <p className="text-sm text-muted-foreground">Hemos notificado al organizador.</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => setMode('form')}>
            Cambiar de opinión
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-border/50 bg-white/[0.02] p-3 text-sm text-muted-foreground">
            <Users className="mt-0.5 size-4 shrink-0 text-cyan-300" />
            <p>
              Confirma la asistencia y completa la plantilla (máx. {MAX_SQUAD} jugadores). Los dorsales deben ser
              únicos.
            </p>
          </div>

          {squad.map((player, idx) => (
            <div key={player.id} className="flex gap-2">
              <input
                type="number"
                min={1}
                max={99}
                value={player.dorsal ?? ''}
                onChange={(e) => {
                  const next = [...squad];
                  next[idx] = { ...player, dorsal: Number(e.target.value) || null };
                  setSquad(next);
                }}
                className="w-16 rounded-lg border border-border bg-background/50 px-2 py-2 text-center text-sm"
                aria-label={`Dorsal jugador ${idx + 1}`}
              />
              <input
                value={player.name}
                onChange={(e) => {
                  const next = [...squad];
                  next[idx] = { ...player, name: e.target.value };
                  setSquad(next);
                }}
                placeholder="Nombre jugador"
                className="flex-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
                aria-label={`Nombre jugador ${idx + 1}`}
              />
            </div>
          ))}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={handleConfirm} disabled={pending || filledCount === 0}>
              Confirmar asistencia
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-red-400/30 text-red-300 hover:bg-red-400/10"
              onClick={handleReject}
              disabled={pending}
            >
              No podemos asistir
            </Button>
          </div>
        </div>
      )}

      {message ? (
        <p className={cn('mt-4 text-center text-sm', error ? 'text-red-400' : 'text-muted-foreground')}>
          {message}
        </p>
      ) : null}

      {bundle.tournament.rules_text ? (
        <div className="mt-8 rounded-xl border border-border/40 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Normas del torneo</p>
          <p className="mt-2 leading-relaxed">{bundle.tournament.rules_text}</p>
        </div>
      ) : null}
    </div>
  );
}

function buildSquad(team: TournamentTeam): SquadPlayer[] {
  if (team.squad_json.length > 0) {
    const base = [...team.squad_json];
    while (base.length < MAX_SQUAD) {
      base.push({ id: `new-${base.length}`, name: '', dorsal: base.length + 1 });
    }
    return base.slice(0, MAX_SQUAD);
  }
  return Array.from({ length: MAX_SQUAD }, (_, i) => ({
    id: `new-${i}`,
    name: '',
    dorsal: i + 1,
  }));
}

function SquadSummary({ squad }: { squad: SquadPlayer[] }) {
  if (squad.length === 0) return null;
  return (
    <div className="portal-section-surface rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plantilla</p>
      <ul className="mt-2 space-y-1 text-sm">
        {squad.map((p) => (
          <li key={p.id} className="flex gap-3 tabular-nums">
            <span className="w-8 text-muted-foreground">{p.dorsal ?? '—'}</span>
            <span>{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
