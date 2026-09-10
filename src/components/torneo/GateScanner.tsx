'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import {
  loadGateContext,
  sellTicketAtGate,
  validateTicketQr,
} from '@/app/actions/tournaments';
import type { GateContext } from '@/app/actions/tournaments';
import { TicketQrCard } from '@/components/torneo/TicketQrCard';
import { Button } from '@/components/ui/button';
import {
  appendGateScanLog,
  formatTicketPrice,
  loadGateScanLog,
  type GateScanLogEntry,
} from '@/lib/tournament-ticketing';
import { cn } from '@/lib/utils';
import {
  Banknote,
  BarChart3,
  CheckCircle,
  Loader2,
  QrCode,
  Video,
  VideoOff,
  XCircle,
} from 'lucide-react';

type TabId = 'sell' | 'scan' | 'summary';

type Props = {
  gateToken: string;
};

export function GateScanner({ gateToken }: Props) {
  const [tab, setTab] = useState<TabId>('sell');
  const [context, setContext] = useState<GateContext | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [pending, startTransition] = useTransition();
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [activityLog, setActivityLog] = useState<GateScanLogEntry[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastQr, setLastQr] = useState<{ name: string; payload: string } | null>(null);
  const [withQr, setWithQr] = useState(false);
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const scannerDivId = 'synq-gate-qr-reader';

  const refreshContext = useCallback(() => {
    loadGateContext(gateToken).then((ctx) => {
      if (ctx) setContext(ctx);
    });
  }, [gateToken]);

  useEffect(() => {
    setActivityLog(loadGateScanLog(gateToken));
    loadGateContext(gateToken).then((ctx) => {
      setContext(ctx);
      setLoadingContext(false);
    });
  }, [gateToken]);

  const recordActivity = useCallback(
    (entry: Omit<GateScanLogEntry, 'id' | 'at'>) => {
      setResult({ ok: entry.ok, message: entry.message });
      const next = appendGateScanLog(gateToken, {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        ...entry,
      });
      setActivityLog(next);
    },
    [gateToken]
  );

  const validatePayload = useCallback(
    (payload: string) => {
      startTransition(async () => {
        const res = await validateTicketQr(gateToken, payload);
        recordActivity({
          ok: res.ok,
          message: res.message ?? (res.ok ? 'OK' : 'Error'),
          purchaserName: res.ticket?.purchaser_name,
          kind: 'scan',
        });
        if (res.ok) {
          setManualCode('');
          refreshContext();
        }
      });
    },
    [gateToken, recordActivity, refreshContext]
  );

  function sell(typeId: string) {
    startTransition(async () => {
      const res = await sellTicketAtGate(gateToken, typeId, { withQr });
      if (res.ok) {
        recordActivity({
          ok: true,
          message: res.message ?? 'Venta registrada',
          amountCents: res.priceCents,
          kind: 'sale',
        });
        if (res.qrPayload) {
          setLastQr({ name: res.typeName ?? 'Entrada', payload: res.qrPayload });
        } else {
          setLastQr(null);
        }
        refreshContext();
      } else {
        recordActivity({ ok: false, message: res.message ?? 'Error', kind: 'sale' });
      }
    });
  }

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
        setCameraError('No se pudo usar la cámara.');
        setCameraOn(false);
      });

    return () => {
      mounted = false;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner?.isScanning) scanner.stop().catch(() => undefined);
    };
  }, [tab, cameraOn, validatePayload, pending]);

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
          <p className="mt-2 text-sm text-muted-foreground">Enlace no válido.</p>
        </div>
      </div>
    );
  }

  const sessionCash = activityLog
    .filter((e) => e.ok && e.kind === 'sale')
    .reduce((sum, e) => sum + (e.amountCents ?? 0), 0);

  return (
    <div className="mx-auto min-h-dvh max-w-md px-4 py-6">
      <div className="portal-section-surface rounded-2xl p-5 text-center">
        <p className="text-xs uppercase tracking-widest text-cyan-300">Taquilla · SynqAI</p>
        <h1 className="mt-2 text-lg font-semibold">{context.tournamentName}</h1>
        <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-300">
          {formatTicketPrice(context.cashTotalCents)}
        </p>
        <p className="text-xs text-muted-foreground">Efectivo registrado hoy · {context.stats.used} entradas</p>
      </div>

      <div className="mt-4 flex gap-1 rounded-lg border border-border/50 p-1">
        {(
          [
            { id: 'sell' as TabId, label: 'Vender', icon: Banknote },
            { id: 'scan' as TabId, label: 'QR', icon: QrCode },
            { id: 'summary' as TabId, label: 'Día', icon: BarChart3 },
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

      {tab === 'sell' ? (
        <div className="mt-4 space-y-3">
          <p className="text-center text-xs text-muted-foreground">
            Toca el tipo de entrada cuando cobres en efectivo o datáfono. La persona entra al momento.
          </p>

          {context.ticketTypes.length === 0 ? (
            <p className="rounded-xl border border-border/40 p-4 text-center text-sm text-muted-foreground">
              No hay tipos de entrada configurados. Define precios en el portal del torneo.
            </p>
          ) : (
            <div className="grid gap-2">
              {context.ticketTypes.map((tt) => (
                <Button
                  key={tt.id}
                  type="button"
                  size="lg"
                  className="h-auto flex-col gap-1 py-4"
                  disabled={pending}
                  onClick={() => sell(tt.id)}
                >
                  <span className="text-base font-semibold">{tt.name}</span>
                  <span className="text-sm opacity-80">{formatTicketPrice(tt.priceCents)}</span>
                </Button>
              ))}
            </div>
          )}

          <label className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={withQr} onChange={(e) => setWithQr(e.target.checked)} />
            Generar QR (solo si entregas ticket digital)
          </label>

          {lastQr ? (
            <TicketQrCard
              title={lastQr.name}
              subtitle="Entregar al espectador"
              qrPayload={lastQr.payload}
              onClose={() => setLastQr(null)}
            />
          ) : null}
        </div>
      ) : null}

      {tab === 'scan' ? (
        <div className="mt-4 space-y-3">
          <p className="text-center text-xs text-muted-foreground">
            Solo si usas entradas con QR impreso o en el móvil del espectador.
          </p>
          <div className="overflow-hidden rounded-xl border border-border/50 bg-black/40">
            <div id={scannerDivId} className={cn('min-h-[220px]', !cameraOn && 'hidden')} />
            {!cameraOn ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 p-6">
                <Button type="button" onClick={() => setCameraOn(true)}>
                  <Video className="mr-2 size-4" />
                  Activar cámara
                </Button>
              </div>
            ) : (
              <div className="border-t border-border/40 p-2">
                <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => setCameraOn(false)}>
                  <VideoOff className="mr-2 size-4" />
                  Detener
                </Button>
              </div>
            )}
          </div>
          {cameraError ? <p className="text-sm text-amber-300">{cameraError}</p> : null}
          <textarea
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Pegar código..."
            rows={2}
            className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm font-mono"
          />
          <Button className="w-full" onClick={() => validatePayload(manualCode)} disabled={pending || !manualCode.trim()}>
            Validar
          </Button>
        </div>
      ) : null}

      {tab === 'summary' ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Ventas hoy" value={context.stats.used} accent="text-emerald-300" />
            <SummaryCard label="Efectivo" valueLabel={formatTicketPrice(context.cashTotalCents)} />
            <SummaryCard label="Esta sesión" valueLabel={formatTicketPrice(sessionCash)} />
            <SummaryCard label="Con QR pend." value={context.stats.pending} accent="text-amber-300" />
          </div>
          <ActivityList entries={activityLog} />
        </div>
      ) : null}

      {result && tab !== 'summary' ? (
        <div
          className={cn(
            'mt-4 flex items-center gap-3 rounded-xl border p-4',
            result.ok ? 'border-green-500/30 bg-green-500/10' : 'border-destructive/30 bg-destructive/10'
          )}
        >
          {result.ok ? <CheckCircle className="size-6 text-green-400" /> : <XCircle className="size-6 text-destructive" />}
          <p className="text-sm">{result.message}</p>
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueLabel,
  accent = 'text-cyan-300',
}: {
  label: string;
  value?: number;
  valueLabel?: string;
  accent?: string;
}) {
  return (
    <div className="portal-section-surface rounded-xl px-4 py-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-semibold tabular-nums', accent)}>
        {valueLabel ?? value}
      </p>
    </div>
  );
}

function ActivityList({ entries }: { entries: GateScanLogEntry[] }) {
  return (
    <div className="portal-section-surface rounded-xl p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Actividad de la sesión</p>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Sin movimientos aún.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className={cn(
                'rounded-lg border px-3 py-2',
                entry.ok ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
              )}
            >
              <p>{entry.message}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(entry.at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                {entry.amountCents ? ` · ${formatTicketPrice(entry.amountCents)}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
