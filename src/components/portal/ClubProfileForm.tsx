'use client';

import { useFormState } from 'react-dom';
import { updateClubProfile, type ClubProfileState } from '@/app/actions/club';
import { ClubImageFields } from '@/components/portal/ClubImageFields';
import { CLUB_SOCIAL_FIELDS, CLUB_SOCIAL_FORM_NAMES } from '@/lib/club-social';
import type { ClubRow } from '@/lib/portal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        </CardHeader>
        <CardContent>
          <ClubImageFields
            clubId={club.id}
            coverUrl={club.cover_url}
            logoUrl={club.logo_url}
            clubName={club.name}
            countryCode={club.country_code}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redes y web pública</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {CLUB_SOCIAL_FIELDS.map(({ key, label, field, placeholder, Icon }) => (
            <div key={key} className="space-y-1.5">
              <label htmlFor={field} className="flex items-center gap-2 text-sm font-medium">
                <span className="inline-flex size-8 items-center justify-center rounded-md border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                {label}
              </label>
              <Input
                id={field}
                name={CLUB_SOCIAL_FORM_NAMES[key]}
                type="url"
                placeholder={placeholder}
                defaultValue={(club[field] as string | null) ?? ''}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {state.ok ? (
        <p className="text-sm font-medium text-primary">Guardado correctamente.</p>
      ) : null}
      {state.message === 'error' ? (
        <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar ficha'}
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
