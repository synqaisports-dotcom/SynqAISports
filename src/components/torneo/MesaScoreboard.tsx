'use client';

import { useState, useTransition } from 'react';
import { updateMatchScoreByMesaToken } from '@/app/actions/tournaments';
import {
  formatMatchScore,
  MATCH_STATUS_LABELS,
  type TournamentBundle,
  type TournamentMatch,
} from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Radio } from 'lucide-react';

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

  function save(newStatus: typeof status) {
    if (!match.mesa_token) return;
    startTransition(async () => {
      const res = await updateMatchScoreByMesaToken(match.mesa_token!, home, away, newStatus);
      if (res.ok) setStatus(newStatus);
      setMessage(res.message ?? (res.ok ? 'Guardado' : 'Error'));
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background p-4">
      <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-cyan-400/10 to-transparent p-5">
        <p className="text-center text-xs uppercase tracking-widest text-cyan-300">Mesa · SynqAI</p>
        <h1 className="mt-2 text-center text-lg font-semibold">{bundle.tournament.name}</h1>
        {status === 'live' ? (
          <p className="mt-1 flex items-center justify-center gap-1 text-sm text-cyan-300">
            <Radio className="size-4 animate-pulse" />
            {MATCH_STATUS_LABELS.live}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
        <ScoreTeam
          name={teamName(bundle, match.home_team_id)}
          score={home}
          onInc={() => setHome((s) => s + 1)}
          onDec={() => setHome((s) => Math.max(0, s - 1))}
        />
        <p className="text-center text-2xl font-light text-muted-foreground">vs</p>
        <ScoreTeam
          name={teamName(bundle, match.away_team_id)}
          score={away}
          onInc={() => setAway((s) => s + 1)}
          onDec={() => setAway((s) => Math.max(0, s - 1))}
        />
      </div>

      {status === 'finished' ? (
        <p className="mt-6 text-center text-xl font-semibold tabular-nums">{formatMatchScore({ ...match, score_home: home, score_away: away, went_to_penalties: false, score_penalties_home: null, score_penalties_away: null })}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-2">
        {status !== 'live' && status !== 'finished' ? (
          <Button className="w-full" onClick={() => save('live')} disabled={pending}>
            Iniciar partido
          </Button>
        ) : null}
        {status === 'live' ? (
          <Button className="w-full" variant="secondary" onClick={() => save('finished')} disabled={pending}>
            Finalizar partido
          </Button>
        ) : null}
      </div>

      {message ? <p className="mt-4 text-center text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

function ScoreTeam({
  name,
  score,
  onInc,
  onDec,
}: {
  name: string;
  score: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="portal-section-surface rounded-xl p-4 text-center">
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="my-3 text-5xl font-bold tabular-nums text-cyan-300">{score}</p>
      <div className="flex justify-center gap-3">
        <Button type="button" size="icon" variant="outline" onClick={onDec}>
          <Minus className="size-5" />
        </Button>
        <Button type="button" size="icon" onClick={onInc}>
          <Plus className="size-5" />
        </Button>
      </div>
    </div>
  );
}
