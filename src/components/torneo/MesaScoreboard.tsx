'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { updateMatchScoreByMesaToken } from '@/app/actions/tournaments';
import { fieldLabel, formatMatchDateTime } from '@/lib/tournament-schedule';
import {
  formatMatchScore,
  MATCH_STATUS_LABELS,
  ROUND_KEY_LABELS,
  type TournamentBundle,
  type TournamentMatch,
} from '@/lib/tournaments';
import { publicTournamentUrl } from '@/lib/tournament-urls';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarClock, MapPin, Minus, Plus, Radio, Trophy } from 'lucide-react';
import Link from 'next/link';

type Props = {
  match: TournamentMatch;
  bundle: TournamentBundle;
};

function teamName(bundle: TournamentBundle, id: string | null) {
  if (!id) return '—';
  return bundle.teams.find((t) => t.id === id)?.name ?? 'Equipo';
}

export function MesaScoreboard({ match, bundle }: Props) {
  const [home, setHome] = useState(match.score_home);
  const [away, setAway] = useState(match.score_away);
  const [status, setStatus] = useState(match.status);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const skipAutosave = useRef(true);

  const category = bundle.categories.find((c) => c.id === match.category_id);
  const when = formatMatchDateTime(match.scheduled_at);
  const field = fieldLabel(bundle.fields, match.field_id);
  const roundLabel = ROUND_KEY_LABELS[match.round_key] ?? match.round_key;

  const persist = useCallback(
    (nextHome: number, nextAway: number, nextStatus: typeof status) => {
      if (!match.mesa_token) return;
      setError(false);
      startTransition(async () => {
        const res = await updateMatchScoreByMesaToken(match.mesa_token!, nextHome, nextAway, nextStatus);
        if (res.ok) {
          setStatus(nextStatus);
          setMessage(res.message ?? 'Guardado');
        } else {
          setError(true);
          setMessage(res.message ?? 'No se pudo guardar');
        }
      });
    },
    [match.mesa_token]
  );

  useEffect(() => {
    if (status !== 'live') return;
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    const timer = window.setTimeout(() => persist(home, away, 'live'), 700);
    return () => window.clearTimeout(timer);
  }, [home, away, status, persist]);

  function startMatch() {
    persist(home, away, 'live');
  }

  function finishMatch() {
    persist(home, away, 'finished');
  }

  const scoreDisplay = useMemo(
    () => formatMatchScore({ ...match, score_home: home, score_away: away, went_to_penalties: false, score_penalties_home: null, score_penalties_away: null }),
    [match, home, away]
  );

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Mesa móvil · SynqAI</p>
        <h1 className="mt-2 text-lg font-semibold">{bundle.tournament.name}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {category ? (
            <span className="rounded-full border border-white/10 px-2 py-0.5">{category.name}</span>
          ) : null}
          <span className="rounded-full border border-white/10 px-2 py-0.5">{roundLabel}</span>
          {status === 'live' ? (
            <span className="inline-flex items-center gap-1 text-cyan-300">
              <Radio className="size-3 animate-pulse" />
              {MATCH_STATUS_LABELS.live}
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
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

      <div className="mt-6 space-y-5">
        <ScoreTeam
          name={teamName(bundle, match.home_team_id)}
          score={home}
          disabled={status === 'finished' || pending}
          onInc={() => setHome((s) => s + 1)}
          onDec={() => setHome((s) => Math.max(0, s - 1))}
        />
        <p className="text-center text-2xl font-light text-muted-foreground">vs</p>
        <ScoreTeam
          name={teamName(bundle, match.away_team_id)}
          score={away}
          disabled={status === 'finished' || pending}
          onInc={() => setAway((s) => s + 1)}
          onDec={() => setAway((s) => Math.max(0, s - 1))}
        />
      </div>

      {status === 'finished' ? (
        <p className="mt-6 text-center text-2xl font-bold tabular-nums text-cyan-200">{scoreDisplay}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-2">
        {status !== 'live' && status !== 'finished' ? (
          <Button className="w-full" onClick={startMatch} disabled={pending}>
            Iniciar partido
          </Button>
        ) : null}
        {status === 'live' ? (
          <>
            <p className="text-center text-xs text-muted-foreground">El marcador se guarda automáticamente</p>
            <Button className="w-full" variant="secondary" onClick={finishMatch} disabled={pending}>
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

function ScoreTeam({
  name,
  score,
  onInc,
  onDec,
  disabled,
}: {
  name: string;
  score: number;
  onInc: () => void;
  onDec: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="portal-section-surface rounded-xl p-4 text-center">
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="my-3 text-5xl font-bold tabular-nums text-cyan-300">{score}</p>
      <div className="flex justify-center gap-3">
        <Button type="button" size="icon" variant="outline" onClick={onDec} disabled={disabled}>
          <Minus className="size-5" />
        </Button>
        <Button type="button" size="icon" onClick={onInc} disabled={disabled}>
          <Plus className="size-5" />
        </Button>
      </div>
    </div>
  );
}
