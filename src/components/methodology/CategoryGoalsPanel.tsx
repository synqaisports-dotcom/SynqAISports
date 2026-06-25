'use client';

import { useFormState } from 'react-dom';
import { upsertCategoryGoal, type ActionState } from '@/app/actions/methodology';

export type GoalRow = {
  id: string;
  category: string;
  season: string;
  goals_text: string;
};

const initial: ActionState = { ok: false };

export function CategoryGoalsPanel({ goals }: { goals: GoalRow[] }) {
  const [state, action, pending] = useFormState(upsertCategoryGoal, initial);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold text-white">Objetivos de temporada</h2>
        <form action={action} className="mt-4 grid gap-3">
          <Field label="Categoría" name="category" required placeholder="Alevín" />
          <Field label="Temporada" name="season" required placeholder="2025/26" defaultValue="2025/26" />
          <div>
            <label className="mb-1 block text-xs text-synq-muted">Objetivos</label>
            <textarea
              name="goalsText"
              rows={6}
              placeholder="Objetivos técnicos, tácticos, físicos…"
              className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
          >
            {pending ? '…' : 'Guardar objetivos'}
          </button>
          {state.ok && <p className="text-sm text-synq-accent">Guardado.</p>}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Por categoría</h2>
        <ul className="mt-4 space-y-3">
          {goals.length === 0 && (
            <li className="text-sm text-synq-muted">Sin objetivos definidos.</li>
          )}
          {goals.map((g) => (
            <li
              key={g.id}
              className="rounded-lg border border-white/5 bg-synq-slate/30 p-4"
            >
              <p className="font-medium text-white">
                {g.category} · {g.season}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-synq-muted">{g.goals_text}</p>
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
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
