'use client';

import { useState, useTransition } from 'react';
import { validateTicketQr } from '@/app/actions/tournaments';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export function GateScanner({ gateToken }: { gateToken: string }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleScan() {
    startTransition(async () => {
      const res = await validateTicketQr(gateToken, code.trim());
      setResult({ ok: res.ok, message: res.message ?? (res.ok ? 'OK' : 'Error') });
      if (res.ok) setCode('');
    });
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background p-4">
      <div className="portal-section-surface rounded-xl p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Taquilla · SynqAI</p>
        <h1 className="mt-2 text-lg font-semibold">Validar entrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escanea o pega el código QR</p>
      </div>

      <div className="mt-6 space-y-3">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="synq-ticket:..."
          rows={3}
          className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm font-mono"
        />
        <Button className="w-full" onClick={handleScan} disabled={pending || !code.trim()}>
          Validar
        </Button>
      </div>

      {result ? (
        <div
          className={`mt-6 flex items-center gap-3 rounded-xl border p-4 ${
            result.ok ? 'border-green-500/30 bg-green-500/10' : 'border-destructive/30 bg-destructive/10'
          }`}
        >
          {result.ok ? (
            <CheckCircle className="size-6 shrink-0 text-green-400" />
          ) : (
            <XCircle className="size-6 shrink-0 text-destructive" />
          )}
          <p className="text-sm">{result.message}</p>
        </div>
      ) : null}
    </div>
  );
}
