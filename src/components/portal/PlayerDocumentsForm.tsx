'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { updatePlayerDocuments, type ActionState } from '@/app/actions/cantera';
import { PlayerDocumentField } from '@/components/portal/PlayerDocumentField';
import { SynqDateField } from '@/components/portal/SynqDateField';
import { Button } from '@/components/ui/button';
import {
  defaultFederationUntilValue,
  playerFederationStatus,
} from '@/lib/player-federation';
import {
  defaultMedicalUntilValue,
  formatMedicalDate,
  playerMedicalStatus,
} from '@/lib/player-medical';
import type { PlayerProfile } from '@/lib/player-profile';

const initial: ActionState = { ok: false };

type Props = {
  clubId: string;
  player: PlayerProfile;
  demoMode?: boolean;
  onSaved?: () => void;
};

export function PlayerDocumentsForm({ clubId, player, demoMode, onSaved }: Props) {
  const bound = updatePlayerDocuments.bind(null, player.id);
  const [state, action, pending] = useFormState(bound, initial);
  const [medicalUntil, setMedicalUntil] = useState(
    player.medical_until ?? defaultMedicalUntilValue()
  );
  const [federationUntil, setFederationUntil] = useState(
    player.federation_until ?? defaultFederationUntilValue()
  );

  useEffect(() => {
    setMedicalUntil(player.medical_until ?? defaultMedicalUntilValue());
    setFederationUntil(player.federation_until ?? defaultFederationUntilValue());
  }, [player.id, player.medical_until, player.federation_until]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  const medical = playerMedicalStatus({ ...player, medical_until: medicalUntil });
  const federation = playerFederationStatus({ ...player, federation_until: federationUntil });

  return (
    <form action={action} className="space-y-5">
      <section className="space-y-4 rounded-xl border border-primary/15 bg-muted/5 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
            Reconocimiento médico
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Indica la fecha de fin de validez y sube el documento justificativo.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fecha fin del reconocimiento
          </label>
          <SynqDateField
            value={medicalUntil}
            onChange={setMedicalUntil}
            minYear={new Date().getFullYear() - 1}
            maxYear={new Date().getFullYear() + 5}
          />
          <input type="hidden" name="medicalUntil" value={medicalUntil} readOnly />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Válido hasta {formatMedicalDate(medicalUntil)} · estado actual:{' '}
            <span className={medical.ok ? 'text-primary' : 'text-destructive'}>{medical.label}</span>
          </p>
        </div>

        <PlayerDocumentField
          key={`${player.id}-medical-${player.medical_document_url ?? 'empty'}`}
          clubId={clubId}
          playerId={player.id}
          hiddenInputName="medicalDocumentUrl"
          title="Documento del reconocimiento"
          description="Sube el justificante en PDF o imagen, o pega una URL del archivo."
          initialDocumentUrl={player.medical_document_url}
        />
      </section>

      <section className="space-y-4 rounded-xl border border-primary/15 bg-muted/5 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
            Ficha federativa
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sube la licencia federativa actualizada e indica su fecha de caducidad.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fecha fin de la licencia
          </label>
          <SynqDateField
            value={federationUntil}
            onChange={setFederationUntil}
            minYear={new Date().getFullYear() - 1}
            maxYear={new Date().getFullYear() + 5}
          />
          <input type="hidden" name="federationUntil" value={federationUntil} readOnly />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Válida hasta {formatMedicalDate(federationUntil)} · estado actual:{' '}
            <span className={federation.ok ? 'text-primary' : 'text-destructive'}>
              {federation.label}
            </span>
          </p>
        </div>

        <PlayerDocumentField
          key={`${player.id}-federation-${player.federation_document_url ?? 'empty'}`}
          clubId={clubId}
          playerId={player.id}
          hiddenInputName="federationDocumentUrl"
          title="Documento de la ficha federativa"
          description="Sube la licencia en PDF o imagen, o pega una URL del archivo."
          initialDocumentUrl={player.federation_document_url}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar documentación'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Documentación actualizada.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">No se pudo guardar. Revisa permisos.</p>
        ) : null}
        {state.message === 'validation' ? (
          <p className="text-sm text-destructive">Revisa las fechas de la documentación.</p>
        ) : null}
        {demoMode ? (
          <p className="text-xs text-muted-foreground">
            En demo el formulario es funcional; la persistencia depende de Supabase.
          </p>
        ) : null}
      </div>
    </form>
  );
}
