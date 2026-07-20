'use client';

import { useState, useTransition } from 'react';
import { Mail } from 'lucide-react';
import { inviteTutorFromGuardian } from '@/app/actions/family-accounts';
import { Button } from '@/components/ui/button';

type Props = {
  clubId: string;
  playerId: string;
  email: string;
  displayName: string;
};

export function FamilyInviteButton({ clubId, playerId, email, displayName }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!email.trim()) return null;

  const handleInvite = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await inviteTutorFromGuardian({
        clubId,
        playerId,
        email,
        displayName,
      });
      if (!result.ok) {
        setMessage('No se pudo enviar la invitación.');
        return;
      }
      setMessage(
        result.message === 'demo'
          ? 'Invitación registrada (demo). El tutor puede entrar en /familias.'
          : 'Invitación registrada. El tutor puede vincularse en /join.'
      );
    });
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={handleInvite}>
        <Mail className="size-3.5" />
        Invitar al portal familias
      </Button>
      {message ? <span className="text-xs text-primary">{message}</span> : null}
    </div>
  );
}
