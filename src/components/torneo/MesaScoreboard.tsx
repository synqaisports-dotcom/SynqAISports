'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { updateMatchScoreByMesaToken } from '@/app/actions/tournaments';
import { fieldLabel, formatMatchDateTime } from '@/lib/tournament-schedule';
import {
  createGoalEvent,
  elapsedMatchSeconds,
  formatMatchTimer,
  goalsForTeam,
  playerGoalCount,
} from '@/lib/tournament-mesa';
import {
  formatMatchScore,
  MATCH_STATUS_LABELS,
  ROUND_KEY_LABELS,
  type MatchEvent,
  type SquadPlayer,
  type TournamentBundle,
  type TournamentMatch,
  type TournamentTeam,
} from '@/lib/tournaments';
import { publicTournamentUrl } from '@/lib/tournament-urls';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarClock, MapPin, Play, Radio, Square, Trophy } from 'lucide-react';
import Link from 'next/link';

type Props = {
  match: TournamentMatch;
  bundle: TournamentBundle;
};

function teamById(bundle: TournamentBundle, id: string | null): TournamentTeam | undefined {
  if (!id) return undefined;
  return bundle.teams.find((t) => t.id === id);
}

export function MesaScoreboard({ match, bundle }: Props) {
  const homeTeam = teamById(bundle, match.home_team_id);
  const awayTeam = teamById(bundle, match.away_team_id);

  const [events, setEvents] = useState<MatchEvent[]>(match.events_json ?? []);
  const [status, setStatus] = useState(match.status);
  const [liveStartedAt, setLiveStartedAt] = useState<string | null>(match.live_started_at);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const skipAutosave = useRef(true);

  const homeGoals = goalsForTeam(events, match.home_team_id);
  const awayGoals = goalsForTeam(events, match.away_team_id);

  const category = bundle.categories.find((c) => c.id === match.category_id);
  const when = formatMatchDateTime(match.scheduled_at);
  const field = fieldLabel(bundle.fields, match.field_id);
  const roundLabel = ROUND_KEY_LABELS[match.round_key] ?? match.round_key;
  const isLive = status === 'live';
  const isFinished = status === 'finished';

  const persist = useCallback(
    (nextEvents: MatchEvent[], nextStatus: typeof status, nextLiveStartedAt: string | null) => {
      if (!match.mesa_token) return;
      const home = goalsForTeam(nextEvents, match.home_team_id);
      const away = goalsForTeam(nextEvents, match.away_team_id);
      setError(false);
      startTransition(async () => {
        const res = await updateMatchScoreByMesaToken(match.mesa_token!, {
          scoreHome: home,
          scoreAway: away,
          status: nextStatus,
          eventsJson: nextEvents,
        });
        if (res.ok) {
          setStatus(nextStatus);
          if (nextStatus === 'live' && !liveStartedAt && nextLiveStartedAt) {
            setLiveStartedAt(nextLiveStartedAt);
          }
          setMessage(res.message ?? 'Guardado');
        } else {
          setError(true);
          setMessage(res.message ?? 'No se pudo guardar');
        }
      });
    },
    [match.home_team_id, match.away_team_id, match.mesa_token, liveStartedAt]
  );

  useEffect(() => {
    if (!isLive) return;
    const tick = () => setTimerSeconds(elapsedMatchSeconds(liveStartedAt, isLive));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isLive, liveStartedAt]);

  useEffect(() => {
    if (!isLive) return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const timer = window.setTimeout(() => persist(events, 'live', liveStartedAt), 700);
    return () => window.clearTimeout(timer);
  }, [events, isLive, liveStartedAt, persist]);

  function startMatch() {
    const startedAt = new Date().toISOString();
    setLiveStartedAt(startedAt);
    skipAutosave.current = true;
    persist(events, 'live', startedAt);
  }

  function finishMatch() {
    persist(events, 'finished', liveStartedAt);
  }

  function registerGoal(teamId: string | null, player: SquadPlayer) {
    if (!teamId || !isLive || isFinished) return;
    const minute = Math.max(1, Math.floor(timerSeconds / 60) + 1);
    const next = [...events, createGoalEvent(teamId, player.name.trim(), minute)];
    setEvents(next);
  }

  const scoreDisplay = useMemo(
    () =>
      formatMatchScore({
        ...match,
        score_home: homeGoals,
        score_away: awayGoals,
        went_to_penalties: false,
        score_penalties_home: null,
        score_penalties_away: null,
      }),
    [match, homeGoals, awayGoals]
  );

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5">
        <p className="text-center text-xs uppercase tracking-widest text-cyan-300">Mesa móvil · SynqAI</p>
        <h1 className="mt-2 text-center text-lg font-semibold">{bundle.tournament.name}</h1>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Local</p>
            <p className="truncate text-sm font-semibold">{homeTeam?.name ?? '—'}</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-cyan-300">{homeGoals}</p>
          </div>
          <p className="text-lg text-muted-foreground">vs</p>
          <div>
            <p className="text-xs text-muted-foreground">Visitante</p>
            <p className="truncate text-sm font-semibold">{awayTeam?.name ?? '—'}</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-cyan-300">{awayGoals}</p>
          </div>
        </div>

        {isLive ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3">
            <Radio className="size-4 animate-pulse text-cyan-300" />
            <span className="text-3xl font-bold tabular-nums tracking-widest text-cyan-100">
              {formatMatchTimer(timerSeconds)}
            </span>
            <span className="text-xs text-cyan-200/80">{MATCH_STATUS_LABELS.live}</span>
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {category ? <span className="rounded-full border border-white/10 px-2 py-0.5">{category.name}</span> : null}
          <span className="rounded-full border border-white/10 px-2 py-0.5">{roundLabel}</span>
        </div>

        <div className="mt-3 space-y-1 text-center text-sm text-muted-foreground">
          <p className="inline-flex items-center justify-center gap-1.5">
            <CalendarClock className="size-3.5 text-cyan-300" />
            {when.full}
          </p>
          <p className="inline-flex items-center justify-center gap-1.5">
            <MapPin className="size-3.5 text-cyan-300" />
            {field}
          </p>
        </div>
      </div>

      {isLive ? (
        <div className="mt-6 space-y-4">
          <TeamGoalPanel
            title="Goles local"
            team={homeTeam}
            events={events}
            teamId={match.home_team_id}
            onGoal={registerGoal}
          />
          <TeamGoalPanel
            title="Goles visitante"
            team={awayTeam}
            events={events}
            teamId={match.away_team_id}
            onGoal={registerGoal}
          />
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-border/40 bg-white/[0.02] p-4 text-center text-sm text-muted-foreground">
          Inicia el partido para registrar goles por jugador y arrancar el cronómetro.
        </p>
      )}

      {events.length > 0 ? (
        <div className="portal-section-surface mt-6 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cronología</p>
          <ul className="mt-2 space-y-1 text-sm">
            {events
              .filter((e) => e.type === 'goal')
              .slice()
              .reverse()
              .map((event) => (
                <li key={event.id} className="flex justify-between gap-2 tabular-nums">
                  <span className="text-cyan-300">{event.minute}&apos;</span>
                  <span className="min-w-0 flex-1 truncate">{event.player_name}</span>
                  <span className="text-muted-foreground">
                    {teamById(bundle, event.team_id)?.name ?? '—'}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {isFinished ? (
        <p className="mt-6 text-center text-2xl font-bold tabular-nums text-cyan-200">{scoreDisplay}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-2">
        {!isLive && !isFinished ? (
          <Button className="w-full" onClick={startMatch} disabled={pending}>
            <Play className="mr-2 size-4" />
            Iniciar partido
          </Button>
        ) : null}
        {isLive ? (
          <>
            <p className="text-center text-xs text-muted-foreground">Los goles se guardan automáticamente</p>
            <Button className="w-full" variant="secondary" onClick={finishMatch} disabled={pending}>
              <Square className="mr-2 size-4" />
              Finalizar partido
            </Button>
          </>
        ) : null}
      </div>

      {message ? (
        <p className={cn('mt-4 text-center text-sm', error ? 'text-red-400' : 'text-muted-foreground')}>
          {message}
        </p>
      ) : null}

      <div className="mt-8 text-center">
        <Link
          href={publicTournamentUrl(bundle.tournament.slug)}
          className="inline-flex items-center gap-1.5 text-xs text-cyan-300/80 hover:text-cyan-200"
        >
          <Trophy className="size-3.5" />
          Ver web pública del torneo
        </Link>
      </div>
    </div>
  );
}

function TeamGoalPanel({
  title,
  team,
  teamId,
  events,
  onGoal,
}: {
  title: string;
  team?: TournamentTeam;
  teamId: string | null;
  events: MatchEvent[];
  onGoal: (teamId: string | null, player: SquadPlayer) => void;
}) {
  const players = (team?.squad_json ?? []).filter((p) => p.name.trim());

  return (
    <div className="portal-section-surface rounded-xl p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{team?.name ?? 'Equipo sin asignar'}</p>
      {players.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">Sin plantilla registrada en el portal delegado.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {players.map((player) => {
            const goals = playerGoalCount(events, teamId, player.name.trim());
            return (
              <li key={player.id} className="flex items-center gap-2">
                <span className="w-8 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                  {player.dorsal ?? '—'}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{player.name}</span>
                <span className="w-6 text-center text-sm font-semibold tabular-nums text-cyan-300">{goals}</span>
                <Button
                  type="button"
                  size="sm"
                  className="h-8 shrink-0 px-3"
                  onClick={() => onGoal(teamId, player)}
                >
                  Gol
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
