'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { upsertInstitutionalPerson, type ClubPeopleState } from '@/app/actions/club-people';
import { accessProfileOptions, type AccessProfile, type ClubPerson } from '@/lib/club-people';
import { PersonPhotoField } from '@/components/portal/PersonPhotoField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SynqSelect } from '@/components/portal/SynqSelect';

const initial: ClubPeopleState = { ok: false };

type Props = {
  clubId: string;
  person?: ClubPerson | null;
  onSaved?: (personId: string) => void;
};

export function InstitutionalPersonForm({ clubId, person, onSaved }: Props) {
  const bound = upsertInstitutionalPerson.bind(null, clubId);
  const [state, action, pending] = useFormState(bound, initial);
  const [accessProfile, setAccessProfile] = useState<AccessProfile>(person?.access_profile ?? 'none');
  const profileOptions = accessProfileOptions();

  useEffect(() => {
    if (state.ok && state.personId) onSaved?.(state.personId);
  }, [state.ok, state.personId, onSaved]);

  return (
    <form action={action} className="w-full space-y-6">
      {person ? <input type="hidden" name="personId" value={person.id} readOnly /> : null}

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">
            {person ? 'Modificar persona' : 'Nueva persona institucional'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <PersonPhotoField
              clubId={clubId}
              personId={person?.id}
              initialPhotoUrl={person?.photo_url}
              personName={person?.full_name ?? 'Nueva ficha'}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre completo
            </label>
            <Input
              name="fullName"
              defaultValue={person?.full_name ?? ''}
              required
              placeholder="Ana García"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Cargo institucional
            </label>
            <Input
              name="institutionalRole"
              defaultValue={person?.institutional_role ?? ''}
              required
              placeholder="Presidenta"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Perfil de acceso (futuro)
            </label>
            <SynqSelect
              value={accessProfile ?? 'none'}
              onChange={(value) => setAccessProfile(value as AccessProfile)}
              options={profileOptions}
              placeholder="Seleccionar"
            />
            <input type="hidden" name="accessProfile" value={accessProfile ?? 'none'} readOnly />
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Define qué verá en portal web o app Android según su rol (presidente, tesorero…).
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <Input
              name="email"
              type="email"
              defaultValue={person?.email ?? ''}
              placeholder="contacto@club.es"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Teléfono
            </label>
            <Input
              name="phone"
              defaultValue={person?.phone ?? ''}
              placeholder="+34 600 000 000"
              className="border-primary/30 bg-background/80"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notas
            </label>
            <Input
              name="notes"
              defaultValue={person?.notes ?? ''}
              placeholder="Observaciones internas"
              className="border-primary/30 bg-background/80"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 border-t border-primary/15 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar ficha'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Ficha guardada.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
