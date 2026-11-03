'use client';

import { useState } from 'react';
import { CLUB_PRACTICED_SPORT_LABELS } from '@/lib/club-practiced-sports';
import { loadResults, saveResults, type CoachFreeMatchResult } from '@/lib/coach-free-device';
import { CoachFreeSection } from '@/components/coach/CoachFreeSection';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const fieldClass = 'rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white';

function outcome(match: CoachFreeMatchResult) {
  if (match.goalsFor > match.goalsAgainst) return 'Victoria';
  if (match.goalsFor < match.goalsAgainst) return 'Derrota';
  return 'Empate';
}

export function CoachFreeSeason() {
  const { sport, ready } = useCoachFreeSport();
  const [results, setResults] = useState<CoachFreeMatchResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [date, setDate] = useState('');
  const [opponent, setOpponent] = useState('');
  const [goalsFor, setGoalsFor] = useState('0');
  const [goalsAgainst, setGoalsAgainst] = useState('0');

  if (ready && !loaded) {
    setResults(loadResults(sport));
    setLoaded(true);
  }

  if (!ready) return null;

  const wins = results.filter((item) => item.goalsFor > item.goalsAgainst).length;
  const draws = results.filter((item) => item.goalsFor === item.goalsAgainst).length;
  const losses = results.length - wins - draws;

  function commit(next: CoachFreeMatchResult[]) {
    setResults(next);
    saveResults(sport, next);
  }

  return (
    <CoachFreeSection
      title="Temporada"
      text={`${CLUB_PRACTICED_SPORT_LABELS[sport]}. ${wins} victorias · ${draws} empates · ${losses} derrotas.`}
    >
      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (!date || opponent.trim().length < 2) return;
          commit([
            {
              id: crypto.randomUUID(),
              date,
              opponent: opponent.trim(),
              goalsFor: Number(goalsFor) || 0,
              goalsAgainst: Number(goalsAgainst) || 0,
            },
            ...results,
          ]);
          setOpponent('');
        }}
      >
        <label className="grid gap-1 text-xs text-synq-muted">
          Fecha
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted sm:col-span-3">
          Rival
          <input value={opponent} onChange={(event) => setOpponent(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted">
          Goles a favor
          <input type="number" min={0} value={goalsFor} onChange={(event) => setGoalsFor(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted">
          Goles en contra
          <input
            type="number"
            min={0}
            value={goalsAgainst}
            onChange={(event) => setGoalsAgainst(event.target.value)}
            className={fieldClass}
          />
        </label>
        <button type="submit" className="synq-btn-primary sm:col-span-4 sm:justify-self-start">
          Anotar partido
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {results.length === 0 ? (
          <p className="text-sm text-synq-muted">Todavía no hay partidos anotados.</p>
        ) : (
          results.map((match) => (
            <article key={match.id} className="synq-card flex items-center justify-between gap-3 p-4">
              <div>
                <h2 className="font-semibold text-white">
                  {match.goalsFor}–{match.goalsAgainst} · {match.opponent}
                </h2>
                <p className="text-sm text-synq-muted">
                  {outcome(match)} ·{' '}
                  {new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeZone: 'Europe/Madrid' }).format(
                    new Date(`${match.date}T12:00:00`)
                  )}
                </p>
              </div>
              <button
                type="button"
                className="synq-btn-ghost"
                onClick={() => commit(results.filter((item) => item.id !== match.id))}
              >
                Quitar
              </button>
            </article>
          ))
        )}
      </div>
    </CoachFreeSection>
  );
}
