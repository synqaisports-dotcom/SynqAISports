'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import {
  createChangeRequest,
  type ActionState,
} from '@/app/actions/methodology';
import { resolveChangeRequestWithNote } from '@/app/actions/change-requests';
import {
  canApproveChangeRequest,
  type ChangeRequestInboxRow,
} from '@/lib/change-requests';
import {
  loadCoachChangeRequests,
  updateCoachChangeRequestStatus,
  type CoachChangeRequest,
} from '@/lib/coach-change-requests-store';
import { ChangeRequestCard } from '@/components/methodology/ChangeRequestCard';
import { PortalSearchField } from '@/components/portal/PortalSearchField';
import { cn } from '@/lib/utils';

export type ChangeRequestRow = ChangeRequestInboxRow;

type Props = {
  requests: ChangeRequestInboxRow[];
  role: string;
};

const initial: ActionState = { ok: false };

const filterButtonClass = (active: boolean) =>
  cn(
    'rounded-lg border px-3 py-2 text-xs transition-colors',
    active
      ? 'border-primary/50 bg-primary/10 font-medium text-primary'
      : 'border-primary/25 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground'
  );

function coachToInboxRow(item: CoachChangeRequest): ChangeRequestInboxRow {
  return {
    id: item.id,
    reason: item.reason,
    status: item.status,
    request_type: 'methodology',
    created_at: item.createdAt,
    resolved_at: item.resolvedAt ?? null,
    resolution_note: item.resolutionNote ?? null,
    session_label: item.sessionLabel ?? null,
    team_id: item.teamId,
    microcycle_id: item.microcycleId ?? null,
    requested_by: null,
    requester_name: 'Entrenador (demo)',
    team_name: item.teamName,
    microcycle_title: item.mccLabel ?? null,
    exercise_title: null,
    source: 'coach-demo',
  };
}

export function ChangeRequestsPanel({ requests, role }: Props) {
  const [state, action, pending] = useFormState(createChangeRequest, initial);
  const [coachRequests, setCoachRequests] = useState<CoachChangeRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );

  useEffect(() => {
    setCoachRequests(loadCoachChangeRequests());
  }, [state.ok]);

  const merged = useMemo(() => {
    const list: ChangeRequestInboxRow[] = [
      ...coachRequests.map(coachToInboxRow),
      ...requests,
    ];
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [coachRequests, requests]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return merged.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;
      const haystack = [
        item.reason,
        item.team_name,
        item.session_label,
        item.requester_name,
        item.exercise_title,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [merged, search, statusFilter]);

  const handleResolve = async (
    requestId: string,
    status: 'approved' | 'rejected',
    resolutionNote?: string
  ) => {
    if (requestId.startsWith('coach-req-')) {
      updateCoachChangeRequestStatus(requestId, status, resolutionNote);
      setCoachRequests(loadCoachChangeRequests());
      return;
    }
    await resolveChangeRequestWithNote(requestId, status, resolutionNote);
    window.location.reload();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section className="portal-section-surface rounded-xl p-4 sm:p-5">
        <h2 className="text-base font-semibold text-foreground">Nueva solicitud (manual)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Los entrenadores envían solicitudes desde la vista Entrenador o la futura app Android.
          Registra aquí una manual si hace falta.
        </p>
        <form action={action} className="mt-4 grid gap-3">
          <Field label="Tipo" name="requestType" as="select" options={[
            { value: 'methodology', label: 'Metodología (planificación)' },
            { value: 'cantera', label: 'Cantera (equipo / categoría)' },
            { value: 'mixed', label: 'Mixta' },
          ]} />
          <Field label="ID ejercicio (opcional)" name="exerciseId" placeholder="uuid" />
          <Field label="ID slot microciclo (opcional)" name="slotId" placeholder="uuid" />
          <div>
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Motivo
            </label>
            <textarea
              name="reason"
              rows={4}
              required
              className="w-full rounded-lg border border-primary/25 portal-field-surface px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-fit rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Enviar solicitud
          </button>
          {state.ok ? <p className="text-sm text-primary">Registrada.</p> : null}
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Bandeja</h2>
            <p className="text-sm text-muted-foreground">
              {filtered.length} solicitud{filtered.length === 1 ? '' : 'es'}
            </p>
          </div>
          <Link
            href="/portal/entrenador"
            className="text-xs text-primary hover:underline"
          >
            Vista entrenador
          </Link>
        </div>

        <PortalSearchField
          value={search}
          onChange={setSearch}
          placeholder="Buscar por equipo, sesión o motivo…"
        />

        <div className="flex flex-wrap gap-1.5">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={filterButtonClass(statusFilter === value)}
              onClick={() => setStatusFilter(value)}
            >
              {value === 'all'
                ? 'Todas'
                : value === 'pending'
                  ? 'Pendientes'
                  : value === 'approved'
                    ? 'Aprobadas'
                    : 'Rechazadas'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Sin solicitudes con esos filtros.
            </p>
          ) : (
            filtered.map((item) => (
              <ChangeRequestCard
                key={item.id}
                item={item}
                canApprove={canApproveChangeRequest(role, item.request_type)}
                onResolve={(status, note) => void handleResolve(item.id, status, note)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  as,
  options,
}: {
  label: string;
  name: string;
  placeholder?: string;
  as?: 'select';
  options?: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {as === 'select' ? (
        <select
          name={name}
          className="w-full rounded-lg border border-primary/25 portal-field-surface px-3 py-2 text-sm"
          defaultValue={options?.[0]?.value}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          placeholder={placeholder}
          className="w-full rounded-lg border border-primary/25 portal-field-surface px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}
