'use client';

import { useState } from 'react';
import { requestFamilyMagicLink } from '@/app/actions/family-accounts';

const MESSAGES: Record<string, string> = {
  validation: 'Introduce un email válido.',
  not_found: 'Este email no está registrado en el club. Pide al club que te invite.',
  error: 'No se pudo enviar el enlace. Inténtalo de nuevo.',
};

export function FamilyLoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const origin = window.location.origin;
    const result = await requestFamilyMagicLink(
      email,
      `${origin}/auth/callback?next=/familias`
    );

    setLoading(false);
    if (!result.ok) {
      setError(MESSAGES[result.message ?? 'error'] ?? MESSAGES.error);
      return;
    }
    setMessage('Te hemos enviado un enlace de acceso a tu email.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs text-synq-muted">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
          placeholder="tu@email.com"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-synq-pitch py-3 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {loading ? 'Enviando…' : 'Recibir enlace de acceso'}
      </button>
    </form>
  );
}
