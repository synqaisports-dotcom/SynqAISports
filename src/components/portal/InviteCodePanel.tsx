'use client';

import { regenerateInviteCode } from '@/app/actions/club';
import { InviteCodeCard } from '@/components/portal/InviteCodeCard';
import { useState } from 'react';

type Props = {
  clubId: string;
  clubName: string;
  inviteCode: string | null;
};

export function InviteCodePanel({ clubId, clubName, inviteCode: initialCode }: Props) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);

  async function handleRegenerate() {
    setLoading(true);
    const result = await regenerateInviteCode(clubId);
    if (result.ok && result.code) setCode(result.code);
    setLoading(false);
  }

  if (!code) {
    return (
      <div className="rounded-2xl border border-white/5 bg-synq-navy/60 p-6">
        <p className="text-sm text-synq-muted">Aún no hay código de invitación.</p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={loading}
          className="mt-4 rounded-full bg-synq-pitch px-6 py-2 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
        >
          {loading ? 'Generando…' : 'Generar código'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <InviteCodeCard code={code} clubName={clubName} />
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={loading}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-synq-muted hover:border-synq-accent/50 hover:text-white disabled:opacity-50"
      >
        {loading ? '…' : 'Regenerar código'}
      </button>
    </div>
  );
}
