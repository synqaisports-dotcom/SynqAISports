'use client';

import { useFormState } from 'react-dom';
import { updateClubProfile, type ClubProfileState } from '@/app/actions/club';
import type { ClubRow } from '@/lib/portal';

const initial: ClubProfileState = { ok: false };

type Props = { club: ClubRow };

export function ClubProfileForm({ club }: Props) {
  const bound = updateClubProfile.bind(null, club.id);
  const [state, action, pending] = useFormState(bound, initial);

  return (
    <form action={action} className="grid max-w-xl gap-4">
      <Field label="Nombre del club" name="name" defaultValue={club.name} required />
      <Field label="Dirección" name="address" defaultValue={club.address ?? ''} />
      <Field label="Teléfono" name="phone" defaultValue={club.phone ?? ''} />
      <Field label="Email" name="email" type="email" defaultValue={club.email ?? ''} />
      <Field
        label="Jugadores (referencia)"
        name="playersCount"
        type="number"
        defaultValue={String(club.players_count)}
        min={1}
      />
      <Field
        label="Cuota familiar anual (€)"
        name="familyFee"
        type="number"
        step="0.01"
        defaultValue={String(club.family_fee_annual_eur)}
      />
      {state.ok && <p className="text-sm text-synq-accent">Guardado correctamente.</p>}
      {state.message === 'error' && (
        <p className="text-sm text-red-400">Error al guardar. Revisa permisos RLS.</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-synq-pitch px-6 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue,
  required,
  min,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
