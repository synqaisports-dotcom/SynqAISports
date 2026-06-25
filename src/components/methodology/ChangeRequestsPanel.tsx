'use client';

import { useFormState } from 'react-dom';
import {
  createChangeRequest,
  resolveChangeRequest,
  type ActionState,
} from '@/app/actions/methodology';

export type ChangeRequestRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  synq_exercises: { title: string } | { title: string }[] | null;
};

const initial: ActionState = { ok: false };

export function ChangeRequestsPanel({ requests }: { requests: ChangeRequestRow[] }) {
  const [state, action, pending] = useFormState(createChangeRequest, initial);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold text-white">Nueva solicitud</h2>
        <p className="mt-1 text-sm text-synq-muted">
          Los entrenadores podrán solicitar cambios desde la app (fase posterior). Por ahora, registro manual.
        </p>
        <form action={action} className="mt-4 grid gap-3">
          <Field label="ID ejercicio (opcional)" name="exerciseId" placeholder="uuid" />
          <Field label="ID slot microciclo (opcional)" name="slotId" placeholder="uuid" />
          <div>
            <label className="mb-1 block text-xs text-synq-muted">Motivo</label>
            <textarea
              name="reason"
              rows={4}
              required
              className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white"
          >
            Enviar solicitud
          </button>
          {state.ok && <p className="text-sm text-synq-accent">Registrada.</p>}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-white">Pendientes y historial</h2>
        <ul className="mt-4 space-y-3">
          {requests.length === 0 && (
            <li className="text-sm text-synq-muted">Sin solicitudes.</li>
          )}
          {requests.map((r) => {
            const ex = Array.isArray(r.synq_exercises) ? r.synq_exercises[0] : r.synq_exercises;
            return (
              <li
                key={r.id}
                className="rounded-lg border border-white/5 bg-synq-slate/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs uppercase text-synq-muted">{r.status}</p>
                  <span className="text-xs text-synq-muted">
                    {new Date(r.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white">{r.reason}</p>
                {ex && <p className="mt-1 text-xs text-synq-muted">Ejercicio: {ex.title}</p>}
                {r.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void resolveChangeRequest(r.id, 'approved').then(() =>
                          window.location.reload()
                        )
                      }
                      className="text-xs text-synq-accent"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void resolveChangeRequest(r.id, 'rejected').then(() =>
                          window.location.reload()
                        )
                      }
                      className="text-xs text-red-400"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
