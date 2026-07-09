'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { updatePlayerMedical, type ActionState } from '@/app/actions/cantera';
import { PlayerMedicalDocumentField } from '@/components/portal/PlayerMedicalDocumentField';
import { SynqDateField } from '@/components/portal/SynqDateField';
import { Button } from '@/components/ui/button';
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
  const bound = updatePlayerMedical.bind(null, player.id);
  const [state, action, pending] = useFormState(bound, initial);
  const [medicalUntil, setMedicalUntil] = useState(
    player.medical_until ?? defaultMedicalUntilValue()
  );

  useEffect(() => {
    setMedicalUntil(player.medical_until ?? defaultMedicalUntilValue());
  }, [player.id, player.medical_until]);

  useEffect(() => {
    if (state.ok) onSaved?.();
  }, [state.ok, onSaved]);

  const medical = playerMedicalStatus({ ...player, medical_until: medicalUntil });

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

        <PlayerMedicalDocumentField
          key={`${player.id}-${player.medical_document_url ?? 'empty'}`}
          clubId={clubId}
          playerId={player.id}
          initialDocumentUrl={player.medical_document_url}
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
          <p className="text-sm text-destructive">Revisa la fecha del reconocimiento médico.</p>
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
