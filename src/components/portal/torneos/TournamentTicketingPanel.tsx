'use client';

import { useState, useTransition } from 'react';
import { getGateAccessUrl, updateTicketType } from '@/app/actions/tournaments';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import { formatTicketPrice } from '@/lib/tournament-ticketing';
import type { TournamentBundle, TournamentTicketType } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Copy, ExternalLink, Loader2, QrCode, Smartphone } from 'lucide-react';
import Link from 'next/link';

type Props = {
  bundle: TournamentBundle;
};

export function TournamentTicketingPanel({ bundle }: Props) {
  const { tournament } = bundle;
  const [ticketTypes, setTicketTypes] = useState(bundle.ticketTypes.filter((t) => t.active));
  const [gateUrl, setGateUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function loadGateLink() {
    startTransition(async () => {
      const url = await getGateAccessUrl(tournament.id);
      setGateUrl(url);
      setMessage(url ? 'Enlace listo para compartir con la mesa exterior' : 'No se pudo generar el enlace');
    });
  }

  return (
    <div className="portal-section-surface rounded-xl p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-medium">
            <Smartphone className="size-4 text-cyan-300" />
            Taquilla móvil (opcional)
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Para el típico puesto exterior con datáfono y tickets a mano: abre este enlace en un móvil,
            registra ventas en efectivo con un toque y consulta el total del día. No sustituye tu TPV ni la
            facturación del club.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={loadGateLink} disabled={pending}>
          {pending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <QrCode className="mr-1.5 size-4" />}
          Obtener enlace taquilla
        </Button>
      </div>

      {gateUrl ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-cyan-200">{gateUrl}</code>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={async () => {
              await navigator.clipboard.writeText(`${window.location.origin}${gateUrl}`);
              setMessage('Enlace copiado');
            }}
          >
            <Copy className="size-4" />
          </Button>
          <Link href={gateUrl} target="_blank">
            <Button type="button" size="sm" variant="secondary">
              <ExternalLink className="mr-1.5 size-4" />
              Abrir
            </Button>
          </Link>
        </div>
      ) : null}

      {ticketTypes.length > 0 ? (
        <div className="mt-5">
          <p className={PORTAL_FIELD_LABEL_CLASS}>Precios en puerta (referencia)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Los botones de venta en el móvil usan estos importes para el resumen de efectivo.
          </p>
          <div className="mt-3 space-y-2">
            {ticketTypes.map((tt) => (
              <TicketTypePriceRow
                key={tt.id}
                ticketType={tt}
                disabled={pending}
                onSaved={(priceCents) => {
                  setTicketTypes((prev) =>
                    prev.map((t) => (t.id === tt.id ? { ...t, price_cents: priceCents } : t))
                  );
                  setMessage('Precio actualizado');
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          En demo hay tipos predefinidos. En producción, configúralos al crear el torneo.
        </p>
      )}

      {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}
    </div>
  );
}

function TicketTypePriceRow({
  ticketType,
  disabled,
  onSaved,
}: {
  ticketType: TournamentTicketType;
  disabled: boolean;
  onSaved: (priceCents: number) => void;
}) {
  const [priceEur, setPriceEur] = useState(ticketType.price_cents / 100);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set('name', ticketType.name);
        fd.set('description', ticketType.description ?? '');
        fd.set('ticket_scope', ticketType.ticket_scope);
        fd.set('price_eur', String(priceEur));
        fd.set('max_quantity', ticketType.max_quantity != null ? String(ticketType.max_quantity) : '');
        fd.set('valid_for_date', ticketType.valid_for_date ?? '');
        fd.set('active', 'on');
        startTransition(async () => {
          const res = await updateTicketType(ticketType.id, fd);
          if (res.ok) onSaved(Math.round(priceEur * 100));
        });
      }}
    >
      <span className="min-w-[8rem] flex-1 text-sm font-medium">{ticketType.name}</span>
      <Input
        type="number"
        min={0}
        step="0.5"
        value={priceEur}
        onChange={(e) => setPriceEur(Number(e.target.value) || 0)}
        className="portal-field-surface w-24"
      />
      <span className="text-xs text-muted-foreground tabular-nums">{formatTicketPrice(Math.round(priceEur * 100))}</span>
      <Button type="submit" size="sm" variant="ghost" disabled={disabled || pending}>
        Guardar
      </Button>
    </form>
  );
}
