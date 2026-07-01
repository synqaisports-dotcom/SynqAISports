'use client';

import { useFormState } from 'react-dom';
import { updatePlayerPhoto, type ActionState } from '@/app/actions/cantera';
import { PlayerPhotoField } from '@/components/portal/PlayerPhotoField';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const initial: ActionState = { ok: false };

type Props = {
  clubId: string;
  playerId: string;
  playerName: string;
  photoUrl: string | null;
};

export function PlayerPhotoForm({ clubId, playerId, playerName, photoUrl }: Props) {
  const bound = updatePlayerPhoto.bind(null, playerId);
  const [state, action, pending] = useFormState(bound, initial);

  return (
    <form action={action} className="w-full space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">Fotografía — {playerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerPhotoField
            clubId={clubId}
            playerId={playerId}
            initialPhotoUrl={photoUrl}
            playerName={playerName}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar foto'}
        </Button>
        {state.ok ? <p className="text-sm font-medium text-primary">Foto guardada.</p> : null}
        {state.message === 'error' ? (
          <p className="text-sm text-destructive">Error al guardar. Revisa permisos RLS.</p>
        ) : null}
      </div>
    </form>
  );
}
