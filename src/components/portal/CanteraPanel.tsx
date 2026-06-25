'use client';

import { useFormState } from 'react-dom';
import {
  createPlayer,
  createTeam,
  deleteTeam,
  togglePlayerActive,
  type ActionState,
} from '@/app/actions/cantera';

export type TeamRow = {
  id: string;
  name: string;
  category: string;
  sport: string;
  active: boolean;
};

export type PlayerRow = {
  id: string;
  display_name: string;
  team_id: string | null;
  jersey_number: number | null;
  position: string | null;
  birth_year: number | null;
  active: boolean;
  synq_teams: { name: string; category: string } | null;
};

const initial: ActionState = { ok: false };

type Props = {
  teams: TeamRow[];
  players: PlayerRow[];
};

export function CanteraPanel({ teams, players }: Props) {
  const [teamState, teamAction, teamPending] = useFormState(createTeam, initial);
  const [playerState, playerAction, playerPending] = useFormState(createPlayer, initial);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold text-white">Equipos</h2>
        <form action={teamAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nombre del equipo" name="name" placeholder="Alevín A" required />
          <Field label="Categoría" name="category" placeholder="Alevín" required />
          <div>
            <label className="mb-1 block text-xs text-synq-muted">Deporte</label>
            <select
              name="sport"
              className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
            >
              <option value="football">Fútbol</option>
              <option value="futsal">Fútbol sala</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={teamPending}
              className="rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
            >
              {teamPending ? '…' : 'Añadir equipo'}
            </button>
          </div>
        </form>
        {teamState.ok && <p className="mt-2 text-sm text-synq-accent">Equipo creado.</p>}

        <ul className="mt-6 space-y-2">
          {teams.length === 0 && (
            <li className="text-sm text-synq-muted">Sin equipos todavía.</li>
          )}
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-synq-slate/30 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{team.name}</p>
                <p className="text-xs text-synq-muted">
                  {team.category} · {team.sport === 'futsal' ? 'Fútbol sala' : 'Fútbol'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void deleteTeam(team.id).then(() => window.location.reload())}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Jugadores</h2>
        <form action={playerAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nombre" name="displayName" required />
          <div>
            <label className="mb-1 block text-xs text-synq-muted">Equipo</label>
            <select
              name="teamId"
              className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
            >
              <option value="">Sin equipo</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="Dorsal" name="jerseyNumber" type="number" min={0} max={99} />
          <Field label="Posición" name="position" placeholder="Delantero" />
          <Field label="Año nac." name="birthYear" type="number" min={2000} max={2020} />
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={playerPending}
              className="rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
            >
              {playerPending ? '…' : 'Añadir jugador'}
            </button>
          </div>
        </form>
        {playerState.ok && <p className="mt-2 text-sm text-synq-accent">Jugador añadido.</p>}

        <ul className="mt-6 space-y-2">
          {players.length === 0 && (
            <li className="text-sm text-synq-muted">Sin jugadores todavía.</li>
          )}
          {players.map((player) => (
            <li
              key={player.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                player.active
                  ? 'border-white/5 bg-synq-slate/30'
                  : 'border-white/5 bg-synq-navy/40 opacity-60'
              }`}
            >
              <div>
                <p className="font-medium text-white">
                  {player.jersey_number != null ? `#${player.jersey_number} ` : ''}
                  {player.display_name}
                </p>
                <p className="text-xs text-synq-muted">
                  {player.synq_teams?.name ?? 'Sin equipo'}
                  {player.position ? ` · ${player.position}` : ''}
                  {player.birth_year ? ` · ${player.birth_year}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void togglePlayerActive(player.id, !player.active).then(() =>
                    window.location.reload()
                  )
                }
                className="text-xs text-synq-muted hover:text-white"
              >
                {player.active ? 'Desactivar' : 'Activar'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  placeholder,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white placeholder:text-synq-muted/60"
      />
    </div>
  );
}
