'use client';

import { UserPlus, X } from 'lucide-react';
import { PORTAL_ACTION_ICON_CLASS } from '@/components/portal/PortalActionIcon';
import type { PlayerGuardian } from '@/lib/player-guardians';
import { Input } from '@/components/ui/input';

type Props = {
  tutor1: PlayerGuardian;
  tutor2: PlayerGuardian;
  showSecond: boolean;
  onAddSecond: () => void;
  onRemoveSecond: () => void;
};

const inputClass = 'portal-field-surface';

function GuardianFields({
  index,
  guardian,
}: {
  index: 1 | 2;
  guardian: PlayerGuardian;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nombre tutor {index}
        </label>
        <Input
          name={`tutor${index}FirstName`}
          defaultValue={guardian.first_name}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Apellidos tutor {index}
        </label>
        <Input
          name={`tutor${index}LastName`}
          defaultValue={guardian.last_name}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Email tutor {index}
        </label>
        <Input
          name={`tutor${index}Email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={guardian.email}
          placeholder="acceso@app · datos del hijo/a"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Acceso a la app y consulta de los datos de su hijo o hija.
        </p>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Teléfono tutor {index}
        </label>
        <Input
          name={`tutor${index}Phone`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={guardian.phone}
          placeholder="Ej. 600 123 456"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function PlayerGuardiansForm({
  tutor1,
  tutor2,
  showSecond,
  onAddSecond,
  onRemoveSecond,
}: Props) {
  return (
    <div className="space-y-4 border-t border-primary/15 pt-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">Tutores</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Datos de contacto para menores de edad.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-primary/15 bg-muted/5 p-4">
        <GuardianFields index={1} guardian={tutor1} />

        {!showSecond ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onAddSecond}
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Añadir tutor 2"
              title="Añadir tutor 2"
            >
              <UserPlus className="size-4" />
            </button>
          </div>
        ) : null}
      </div>

      {showSecond ? (
        <div className="space-y-3 rounded-xl border border-primary/15 bg-muted/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tutor 2
            </p>
            <button
              type="button"
              onClick={onRemoveSecond}
              className={PORTAL_ACTION_ICON_CLASS}
              aria-label="Quitar tutor 2"
              title="Quitar tutor 2"
            >
              <X className="size-4" />
            </button>
          </div>
          <GuardianFields index={2} guardian={tutor2} />
        </div>
      ) : null}

      <input type="hidden" name="includeTutor2" value={showSecond ? 'true' : 'false'} readOnly />
    </div>
  );
}
