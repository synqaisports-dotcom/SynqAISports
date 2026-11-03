'use client';

import { useState } from 'react';
import { CLUB_PRACTICED_SPORT_LABELS } from '@/lib/club-practiced-sports';
import { loadPlayers, savePlayers, type CoachFreePlayer } from '@/lib/coach-free-device';
import { sportPositionLabel, sportPositionSelectOptions } from '@/lib/sport-positions';
import { CoachFreeSection } from '@/components/coach/CoachFreeSection';
import { useCoachFreeSport } from '@/components/coach/use-coach-free-sport';

const fieldClass = 'rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white';

export function CoachFreeSquad() {
  const { sport, ready } = useCoachFreeSport();
  const [players, setPlayers] = useState<CoachFreePlayer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');

  if (ready && !loaded) {
    const options = sportPositionSelectOptions(sport);
    setPlayers(loadPlayers(sport));
    setPosition(options[0]?.value ?? '');
    setLoaded(true);
  }

  if (!ready) return null;
  const options = sportPositionSelectOptions(sport);

  function commit(next: CoachFreePlayer[]) {
    setPlayers(next);
    savePlayers(sport, next);
  }

  return (
    <CoachFreeSection
      title="Equipo"
      text={`${CLUB_PRACTICED_SPORT_LABELS[sport]}. Nombre, dorsal y posición. La ficha se queda en este aparato.`}
    >
      <form
        className="grid gap-3 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2 || !number.trim()) return;
          commit([
            { id: crypto.randomUUID(), name: name.trim(), number: number.trim(), position },
            ...players,
          ]);
          setName('');
          setNumber('');
        }}
      >
        <label className="grid gap-1 text-xs text-synq-muted sm:col-span-2">
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted">
          Dorsal
          <input value={number} onChange={(event) => setNumber(event.target.value)} className={fieldClass} />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted">
          Posición
          <select value={position} onChange={(event) => setPosition(event.target.value)} className={fieldClass}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="synq-btn-primary sm:col-span-4 sm:justify-self-start">
          Añadir jugador
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        {players.length === 0 ? (
          <p className="text-sm text-synq-muted">Todavía no hay jugadores.</p>
        ) : (
          players.map((player) => (
            <article key={player.id} className="synq-card flex items-center justify-between gap-3 p-4">
              <div>
                <h2 className="font-semibold text-white">
                  {player.number} · {player.name}
                </h2>
                <p className="text-sm text-synq-muted">{sportPositionLabel(sport, player.position)}</p>
              </div>
              <button
                type="button"
                className="synq-btn-ghost"
                onClick={() => commit(players.filter((item) => item.id !== player.id))}
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
