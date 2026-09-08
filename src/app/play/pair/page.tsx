'use client';

import { useEffect, useState } from 'react';
import { createPairingSession, getPairingStatus } from '@/app/actions/signage';

export default function PlayPairPage() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'pending' | 'paired' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await createPairingSession();
      if (cancelled) return;
      if (!result.ok || !result.code) {
        setStatus('error');
        return;
      }
      setCode(result.code);
      setExpiresAt(result.expiresAt ?? null);
      setStatus('pending');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!code || status !== 'pending') return;
    const interval = window.setInterval(async () => {
      const result = await getPairingStatus(code);
      if (result.status === 'paired' && result.deviceToken) {
        window.location.href = `/play/${result.deviceToken}`;
      }
      if (result.status === 'expired' || result.status === 'invalid') {
        setStatus('error');
      }
    }, 2000);
    return () => window.clearInterval(interval);
  }, [code, status]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-8 text-center shadow-[0_8px_40px_rgba(34,211,238,0.15)] backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-400/70">SynqAI Signage</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">Emparejar pantalla</h1>
        <p className="mt-2 text-sm text-cyan-200/70">
          Introduce este código en el portal del club → Signage → Emparejar pantalla
        </p>
        {status === 'loading' ? (
          <p className="mt-10 text-cyan-300/60">Generando código…</p>
        ) : status === 'error' ? (
          <p className="mt-10 text-red-300">No se pudo generar el código. Recarga la página.</p>
        ) : (
          <>
            <p className="mt-10 font-mono text-6xl font-bold tracking-[0.2em] text-cyan-100">{code}</p>
            {expiresAt ? (
              <p className="mt-4 text-xs text-cyan-400/50">
                Expira a las {new Date(expiresAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            ) : null}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-cyan-300/60">
              <span className="inline-block size-2 animate-pulse rounded-full bg-cyan-400" />
              Esperando emparejamiento…
            </div>
          </>
        )}
      </div>
    </div>
  );
}
