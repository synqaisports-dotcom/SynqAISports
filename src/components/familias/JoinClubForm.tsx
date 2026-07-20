'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { joinClubWithInviteCode, requestFamilyMagicLink } from '@/app/actions/family-accounts';

const MESSAGES: Record<string, string> = {
  validation: 'Completa el código y el email.',
  invalid_code: 'Código de club no válido.',
  email_not_registered:
    'Este email no coincide con ningún tutor o jugador registrado en el club.',
  error: 'No se pudo completar el proceso. Inténtalo de nuevo.',
};

export function JoinClubForm({ initialCode = '' }: { initialCode?: string }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const joinResult = await joinClubWithInviteCode({
      inviteCode,
      email,
      displayName,
    });

    if (!joinResult.ok) {
      setLoading(false);
      setError(MESSAGES[joinResult.message ?? 'error'] ?? MESSAGES.error);
      return;
    }

    if (joinResult.message === 'demo') {
      router.push('/demo?next=/familias');
      return;
    }

    const origin = window.location.origin;
    const loginResult = await requestFamilyMagicLink(
      email,
      `${origin}/auth/callback?next=/familias`
    );

    setLoading(false);
    if (!loginResult.ok) {
      setError(MESSAGES[loginResult.message ?? 'error'] ?? MESSAGES.error);
      return;
    }

    setMessage(
      'Cuenta vinculada. Revisa tu email para acceder al portal de familias.'
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Código del club</label>
        <input
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
          required
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm uppercase tracking-widest text-white"
          placeholder="DEMO2026"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Tu nombre</label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          placeholder="Ana Castro"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Email registrado en el club</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          placeholder="ana.castro@email.com"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-synq-pitch py-3 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {loading ? 'Vinculando…' : 'Vincular y recibir acceso'}
      </button>
    </form>
  );
}
