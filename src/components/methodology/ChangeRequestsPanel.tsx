'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import {
  createChangeRequest,
  resolveChangeRequest,
  type ActionState,
} from '@/app/actions/methodology';
import {
  loadCoachChangeRequests,
  updateCoachChangeRequestStatus,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';

export type ChangeRequestRow = {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  synq_exercises: { title: string } | { title: string }[] | null;
  source?: 'server' | 'coach-demo';
  teamName?: string;
  sessionLabel?: string;
};

const initial: ActionState = { ok: false };

export function ChangeRequestsPanel({ requests }: { requests: ChangeRequestRow[] }) {
  const [state, action, pending] = useFormState(createChangeRequest, initial);
  const [coachRequests, setCoachRequests] = useState<CoachChangeRequest[]>([]);

  useEffect(() => {
    setCoachRequests(loadCoachChangeRequests());
  }, [state.ok]);

  const merged: ChangeRequestRow[] = [
    ...coachRequests.map((item) => ({
      id: item.id,
      reason: item.reason,
      status: item.status,
      created_at: item.createdAt,
      synq_exercises: null,
      source: 'coach-demo' as const,
      teamName: item.teamName,
      sessionLabel: item.sessionLabel,
    })),
    ...requests,
  ];

  const handleResolve = async (requestId: string, status: 'approved' | 'rejected') => {
    if (requestId.startsWith('coach-req-')) {
      updateCoachChangeRequestStatus(requestId, status);
      setCoachRequests(loadCoachChangeRequests());
      return;
    }
    await resolveChangeRequest(requestId, status);
    window.location.reload();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h2 className="text-lg font-semibold text-white">Nueva solicitud (manual)</h2>
        <p className="mt-1 text-sm text-synq-muted">
          Los entrenadores envían solicitudes desde la vista Entrenador. Aquí puedes registrar una
          manualmente si hace falta.
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
          {merged.length === 0 && <li className="text-sm text-synq-muted">Sin solicitudes.</li>}
          {merged.map((r) => {
            const ex = Array.isArray(r.synq_exercises) ? r.synq_exercises[0] : r.synq_exercises;
            return (
              <li key={r.id} className="rounded-lg border border-white/5 bg-synq-slate/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs uppercase text-synq-muted">
                    {r.status}
                    {r.source === 'coach-demo' ? ' · entrenador' : ''}
                  </p>
                  <span className="text-xs text-synq-muted">
                    {new Date(r.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
                {r.teamName ? (
                  <p className="mt-1 text-xs text-synq-accent">
                    {r.teamName}
                    {r.sessionLabel ? ` · ${r.sessionLabel}` : ''}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-white">{r.reason}</p>
                {ex && <p className="mt-1 text-xs text-synq-muted">Ejercicio: {ex.title}</p>}
                {r.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void handleResolve(r.id, 'approved')}
                      className="text-xs text-synq-accent"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResolve(r.id, 'rejected')}
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
