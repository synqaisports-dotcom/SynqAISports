'use client';

import { useState, useTransition } from 'react';
import { getGateAccessUrl, refreshRevenueEstimates, toggleTournamentPublic } from '@/app/actions/tournaments';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

type Props =
  | { tournamentId: string; publicEnabled: boolean; mode?: 'public' }
  | { tournamentId: string; mode: 'gate' }
  | { tournamentId: string; mode: 'revenue' };

export function TournamentDetailActions(props: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (props.mode === 'gate') {
    return (
      <GateLinkButton
        tournamentId={props.tournamentId}
        onMessage={setMessage}
        message={message}
      />
    );
  }

  if (props.mode === 'revenue') {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const res = await refreshRevenueEstimates(props.tournamentId);
              setMessage(res.message ?? null);
            });
          }}
        >
          Recalcular
        </Button>
        {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
      </>
    );
  }

  const { tournamentId, publicEnabled } = props;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const res = await toggleTournamentPublic(tournamentId, !publicEnabled);
            setMessage(res.message ?? (res.ok ? 'Actualizado' : 'Error'));
          });
        }}
      >
        <Globe className="mr-1.5 size-4" />
        {publicEnabled ? 'Ocultar web' : 'Publicar web'}
      </Button>
      {message ? <p className="w-full text-sm text-cyan-300">{message}</p> : null}
    </>
  );
}

function GateLinkButton({
  tournamentId,
  onMessage,
  message,
}: {
  tournamentId: string;
  onMessage: (m: string | null) => void;
  message: string | null;
}) {
  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          const u = await getGateAccessUrl(tournamentId);
          if (u) {
            await navigator.clipboard.writeText(`${window.location.origin}${u}`);
            onMessage('Enlace taquilla copiado');
          }
        }}
      >
        Obtener enlace taquilla
      </Button>
      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
    </>
  );
}
