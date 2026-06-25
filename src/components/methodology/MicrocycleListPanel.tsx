'use client';

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { createMicrocycle, deleteMicrocycle, type ActionState } from '@/app/actions/methodology';

export type MicrocycleRow = {
  id: string;
  title: string;
  week_label: string;
  week_start: string | null;
  synq_teams: { name: string } | { name: string }[] | null;
};

const initial: ActionState = { ok: false };

type TeamOption = { id: string; name: string };

export function MicrocycleListPanel({
  microcycles,
  teams,
}: {
  microcycles: MicrocycleRow[];
  teams: TeamOption[];
}) {
  const [state, action, pending] = useFormState(createMicrocycle, initial);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold text-white">Nuevo microciclo</h2>
        <p className="mt-1 text-sm text-synq-muted">
          Plantilla: 1 calentamiento + 3 principales + 1 vuelta a la calma.
        </p>
        <form action={action} className="mt-4 grid gap-3">
          <Field label="Título" name="title" required placeholder="Microciclo 1" />
          <Field label="Etiqueta semana" name="weekLabel" placeholder="Semana 12–18 oct" />
          <Field label="Inicio semana" name="weekStart" type="date" />
          <Field label="Nº semana" name="weekNumber" type="number" min={1} />
          <div>
            <label className="mb-1 block text-xs text-synq-muted">Equipo (opcional)</label>
            <select
              name="teamId"
              className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
            >
              <option value="">Todo el club</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
          >
            {pending ? '…' : 'Crear microciclo'}
          </button>
        </form>
        {state.ok && state.id && (
          <p className="mt-2 text-sm text-synq-accent">
            Creado.{' '}
            <Link href={`/portal/metodologia/microciclos/${state.id}`} className="underline">
              Asignar ejercicios
            </Link>
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Microciclos</h2>
        <ul className="mt-4 space-y-2">
          {microcycles.length === 0 && (
            <li className="text-sm text-synq-muted">Sin microciclos.</li>
          )}
          {microcycles.map((m) => {
            const team = Array.isArray(m.synq_teams) ? m.synq_teams[0] : m.synq_teams;
            return (
              <li
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-synq-slate/30 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/portal/metodologia/microciclos/${m.id}`}
                    className="font-medium text-white hover:text-synq-accent"
                  >
                    {m.title}
                  </Link>
                  <p className="text-xs text-synq-muted">
                    {m.week_label || 'Sin etiqueta'}
                    {team ? ` · ${team.name}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteMicrocycle(m.id).then(() => window.location.reload())}
                  className="text-xs text-red-400"
                >
                  Eliminar
                </button>
              </li>
            );
          })}
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: number;
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
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white placeholder:text-synq-muted/50"
      />
    </div>
  );
}
