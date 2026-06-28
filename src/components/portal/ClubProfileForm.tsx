'use client';

import { useFormState } from 'react-dom';
import { updateClubProfile, type ClubProfileState } from '@/app/actions/club';
import { ClubImageFields } from '@/components/portal/ClubImageFields';
import type { ClubRow } from '@/lib/portal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const initial: ClubProfileState = { ok: false };

type Props = { club: ClubRow };

export function ClubProfileForm({ club }: Props) {
  const bound = updateClubProfile.bind(null, club.id);
  const [state, action, pending] = useFormState(bound, initial);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imagen del club</CardTitle>
          <CardDescription>
            Banner alargado y escudo que se muestran en la portada del club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClubImageFields
            coverUrl={club.cover_url}
            logoUrl={club.logo_url}
            clubName={club.name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos generales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre del club" name="name" defaultValue={club.name} required className="sm:col-span-2" />
          <Field label="Dirección" name="address" defaultValue={club.address ?? ''} className="sm:col-span-2" />
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
        </CardContent>
      </Card>

      {state.ok ? (
        <p className="text-sm font-medium text-primary">Guardado correctamente.</p>
      ) : null}
      {state.message === 'error' ? (
        <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
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
  className,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  min?: number;
  step?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        min={min}
        step={step}
      />
    </div>
  );
}
