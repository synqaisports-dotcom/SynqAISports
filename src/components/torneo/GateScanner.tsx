'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { loadGateContext, searchTicketsAtGate, validateTicketQr } from '@/app/actions/tournaments';
import type { GateContext } from '@/app/actions/tournaments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  appendGateScanLog,
  loadGateScanLog,
  TICKET_STATUS_LABELS,
  type GateScanLogEntry,
} from '@/lib/tournament-ticketing';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  CheckCircle,
  Loader2,
  Search,
  Video,
  VideoOff,
  XCircle,
} from 'lucide-react';

type TabId = 'scan' | 'search' | 'summary';

type Props = {
  gateToken: string;
};

export function GateScanner({ gateToken }: Props) {
  const [tab, setTab] = useState<TabId>('scan');
  const [context, setContext] = useState<GateContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [pending, startTransition] = useTransition();
  const [manualCode, setManualCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    { id: string; purchaser_name: string; status: string; qr_payload: string }[]
  >([]);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [scanLog, setScanLog] = useState<GateScanLogEntry[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const scannerDivId = 'synq-gate-qr-reader';

  useEffect(() => {
    setScanLog(loadGateScanLog(gateToken));
    loadGateContext(gateToken).then((ctx) => {
      setContext(ctx);
      setLoadingContext(false);
    });
  }, [gateToken]);

  const recordScan = useCallback(
    (ok: boolean, message: string, purchaserName?: string) => {
      setResult({ ok, message });
      const entry = appendGateScanLog(gateToken, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        ok,
        message,
        purchaserName,
      });
      setScanLog(entry);
      if (ok && context) {
        setContext({
          ...context,
          stats: {
            ...context.stats,
            used: context.stats.used + 1,
            pending: Math.max(0, context.stats.pending - 1),
          },
        });
      }
    },
    [gateToken, context]
  );

  const validatePayload = useCallback(
    (payload: string) => {
      startTransition(async () => {
        const res = await validateTicketQr(gateToken, payload);
        recordScan(res.ok, res.message ?? (res.ok ? 'OK' : 'Error'), res.ticket?.purchaser_name);
        if (res.ok) setManualCode('');
      });
    },
    [gateToken, recordScan]
  );

  useEffect(() => {
    if (tab !== 'scan' || !cameraOn) return;

    let mounted = true;
    setCameraError(null);

    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (!mounted) return;
        const scanner = new Html5Qrcode(scannerDivId);
        scannerRef.current = scanner;
        return scanner.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (pending) return;
            validatePayload(decoded);
          },
          () => undefined
        );
      })
      .catch(() => {
        setCameraError('No se pudo acceder a la cámara. Usa búsqueda o pega el código manualmente.');
        setCameraOn(false);
      });

    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner?.isScanning) {
        scanner.stop().catch(() => undefined);
      }
    };
  }, [tab, cameraOn, validatePayload, pending]);

  function runSearch() {
    startTransition(async () => {
      const res = await searchTicketsAtGate(gateToken, searchQuery);
      setSearchResults(res.results ?? []);
      if (!res.ok) setResult({ ok: false, message: res.message ?? 'Sin resultados' });
    });
  }

  if (loadingContext) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center p-4">
        <Loader2 className="size-8 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className="mx-auto min-h-dvh max-w-md p-4">
        <div className="portal-section-surface rounded-xl p-6 text-center">
          <XCircle className="mx-auto size-10 text-red-400" />
          <h1 className="mt-3 text-lg font-semibold">Taquilla no disponible</h1>
          <p className="mt-2 text-sm text-muted-foreground">El enlace de taquilla no es válido o ha caducado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Taquilla PWA · SynqAI</p>
        <h1 className="mt-2 text-lg font-semibold">{context.tournamentName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Validación de entradas en puerta</p>
      </div>

      <div className="mt-4 flex gap-1 rounded-lg border border-border/50 p-1">
        {(
          [
            { id: 'scan' as TabId, label: 'Escanear', icon: Video },
            { id: 'search' as TabId, label: 'Buscar', icon: Search },
            { id: 'summary' as TabId, label: 'Resumen', icon: BarChart3 },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              if (id !== 'scan') setCameraOn(false);
            }}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors',
              tab === id ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'scan' ? (
        <div className="mt-4 space-y-3">
          <div className="overflow-hidden rounded-xl border border-border/50 bg-black/40">
            <div id={scannerDivId} className={cn('min-h-[260px]', !cameraOn && 'hidden')} />
            {!cameraOn ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 p-6 text-center">
                <Video className="size-10 text-cyan-300/60" />
                <p className="text-sm text-muted-foreground">Activa la cámara para escanear códigos QR</p>
                <Button type="button" onClick={() => setCameraOn(true)}>
                  <Video className="mr-2 size-4" />
                  Activar cámara
                </Button>
              </div>
            ) : (
              <div className="border-t border-border/40 p-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setCameraOn(false)}
                >
                  <VideoOff className="mr-2 size-4" />
                  Detener cámara
                </Button>
              </div>
            )}
          </div>
          {cameraError ? <p className="text-sm text-amber-300">{cameraError}</p> : null}

          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Código manual</p>
            <textarea
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="synq-ticket:..."
              rows={2}
              className="mt-2 w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm font-mono"
            />
            <Button
              className="mt-2 w-full"
              onClick={() => validatePayload(manualCode)}
              disabled={pending || !manualCode.trim()}
            >
              Validar código
            </Button>
          </div>
        </div>
      ) : null}

      {tab === 'search' ? (
        <div className="mt-4 space-y-3">
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Buscar por nombre</p>
            <div className="mt-2 flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre del espectador"
                className="portal-field-surface"
              />
              <Button type="button" onClick={runSearch} disabled={pending || searchQuery.trim().length < 2}>
                Buscar
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {searchResults.map((ticket) => (
              <div key={ticket.id} className="portal-section-surface rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{ticket.purchaser_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {TICKET_STATUS_LABELS[ticket.status as keyof typeof TICKET_STATUS_LABELS] ?? ticket.status}
                    </p>
                  </div>
                  {ticket.status === 'valid' ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() => validatePayload(ticket.qr_payload)}
                    >
                      Validar
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'summary' ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Emitidas" value={context.stats.issued} />
            <SummaryCard label="Pendientes" value={context.stats.pending} accent="text-amber-300" />
            <SummaryCard label="Validadas" value={context.stats.used} accent="text-emerald-300" />
            <SummaryCard label="Anuladas" value={context.stats.cancelled} />
          </div>
          <div className="portal-section-surface rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Historial de esta sesión</p>
            {scanLog.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Aún no hay validaciones en esta sesión.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {scanLog.map((entry) => (
                  <li
                    key={entry.id}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border px-3 py-2',
                      entry.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                    )}
                  >
                    {entry.ok ? (
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                    )}
                    <div className="min-w-0">
                      <p>{entry.message}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(entry.at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {result && tab !== 'summary' ? (
        <div
          className={cn(
            'mt-4 flex items-center gap-3 rounded-xl border p-4',
            result.ok ? 'border-green-500/30 bg-green-500/10' : 'border-destructive/30 bg-destructive/10'
          )}
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

function SummaryCard({
  label,
  value,
  accent = 'text-cyan-300',
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="portal-section-surface rounded-xl px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', accent)}>{value}</p>
    </div>
  );
}
