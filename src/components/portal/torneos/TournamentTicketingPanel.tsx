'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  cancelTicket,
  createTicketType,
  deleteTicketType,
  getGateAccessUrl,
  issueTicket,
  issueTicketsBatch,
  updateTicketType,
} from '@/app/actions/tournaments';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { TicketQrCard } from '@/components/torneo/TicketQrCard';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  formatTicketPrice,
  parseBatchNameLines,
  TICKET_SCOPE_LABELS,
  TICKET_STATUS_LABELS,
  ticketStatsForTournament,
  ticketTypeAvailability,
  ticketsCsvContent,
} from '@/lib/tournament-ticketing';
import {
  TICKET_SCOPES,
  type TicketScope,
  type TournamentBundle,
  type TournamentTicket,
  type TournamentTicketType,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Plus,
  QrCode,
  Ticket,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';

type Props = {
  bundle: TournamentBundle;
};

type IssuedPreview = {
  purchaserName: string;
  typeName: string;
  qrPayload: string;
};

type FilterStatus = 'all' | TournamentTicket['status'];

export function TournamentTicketingPanel({ bundle }: Props) {
  const { tournament } = bundle;
  const [ticketTypes, setTicketTypes] = useState(bundle.ticketTypes);
  const [tickets, setTickets] = useState(bundle.tickets);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [gateUrl, setGateUrl] = useState<string | null>(null);
  const [issuedPreview, setIssuedPreview] = useState<IssuedPreview | null>(null);
  const [batchIssued, setBatchIssued] = useState<IssuedPreview[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [issueTypeId, setIssueTypeId] = useState(bundle.ticketTypes.find((t) => t.active)?.id ?? '');
  const [batchTypeId, setBatchTypeId] = useState(bundle.ticketTypes.find((t) => t.active)?.id ?? '');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  const stats = useMemo(() => ticketStatsForTournament(tickets), [tickets]);
  const activeTypes = ticketTypes.filter((t) => t.active);

  const filteredTickets = useMemo(() => {
    const list = [...tickets].sort((a, b) => (a.purchaser_name > b.purchaser_name ? 1 : -1));
    if (filter === 'all') return list;
    return list.filter((t) => t.status === filter);
  }, [tickets, filter]);

  function notify(ok: boolean, text?: string) {
    setError(!ok);
    setMessage(text ?? (ok ? 'Guardado' : 'Error'));
  }

  function typeName(id: string) {
    return ticketTypes.find((t) => t.id === id)?.name ?? '—';
  }

  function loadGateLink() {
    startTransition(async () => {
      const url = await getGateAccessUrl(tournament.id);
      setGateUrl(url);
      if (url) notify(true, 'Enlace de taquilla listo');
    });
  }

  function exportCsv() {
    const csv = ticketsCsvContent(tickets, ticketTypes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `entradas-${tournament.slug}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="space-y-5">
      <div className="portal-section-surface rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <Ticket className="size-4 text-cyan-300" />
              Taquilla y entradas QR
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Emite entradas manualmente (sin pasarela de pago). El cobro lo gestiona el club por factura o en puerta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={loadGateLink} disabled={pending}>
              {pending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <QrCode className="mr-1.5 size-4" />}
              Enlace taquilla PWA
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={exportCsv} disabled={tickets.length === 0}>
              <Download className="mr-1.5 size-4" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {gateUrl ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm">
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-cyan-200">{gateUrl}</code>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}${gateUrl}`);
                notify(true, 'Enlace copiado');
              }}
            >
              <Copy className="size-4" />
            </Button>
            <Link href={gateUrl} target="_blank" className="inline-flex">
              <Button type="button" size="sm" variant="secondary">
                <ExternalLink className="mr-1.5 size-4" />
                Abrir taquilla
              </Button>
            </Link>
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <StatCard label="Emitidas" value={stats.issued} />
          <StatCard label="Pendientes" value={stats.pending} accent="text-amber-300" />
          <StatCard label="Validadas" value={stats.used} accent="text-emerald-300" />
          <StatCard label="Anuladas" value={stats.cancelled} />
        </div>
      </div>

      {issuedPreview ? (
        <TicketQrCard
          title={issuedPreview.purchaserName}
          subtitle={issuedPreview.typeName}
          qrPayload={issuedPreview.qrPayload}
          onClose={() => setIssuedPreview(null)}
        />
      ) : null}

      {batchIssued.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{batchIssued.length} entradas emitidas en lote</p>
            <Button type="button" size="sm" variant="ghost" onClick={() => setBatchIssued([])}>
              Cerrar
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {batchIssued.map((item) => (
              <TicketQrCard
                key={item.qrPayload}
                title={item.purchaserName}
                subtitle={item.typeName}
                qrPayload={item.qrPayload}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="portal-section-surface rounded-xl p-4">
          <h4 className="font-medium">Tipos de entrada</h4>
          <p className="mt-1 text-xs text-muted-foreground">Define precio informativo y cupo máximo por tipo.</p>

          <div className="mt-3 space-y-2">
            {ticketTypes.map((tt) => {
              const availability = ticketTypeAvailability(tt, tickets);
              const editing = editingTypeId === tt.id;
              return (
                <div key={tt.id} className="rounded-lg border border-border/50 p-3">
                  {editing ? (
                    <TicketTypeForm
                      initial={tt}
                      pending={pending}
                      onCancel={() => setEditingTypeId(null)}
                      onSubmit={(fd) => {
                        startTransition(async () => {
                          const res = await updateTicketType(tt.id, fd);
                          if (res.ok) {
                            const next = ticketTypes.map((t) =>
                              t.id === tt.id
                                ? {
                                    ...t,
                                    name: String(fd.get('name') ?? t.name),
                                    description: String(fd.get('description') ?? '') || null,
                                    ticket_scope: String(fd.get('ticket_scope') ?? t.ticket_scope) as TicketScope,
                                    price_cents: Math.round(Number(fd.get('price_eur') ?? 0) * 100),
                                    max_quantity: (() => {
                                      const raw = String(fd.get('max_quantity') ?? '').trim();
                                      return raw ? Number(raw) : null;
                                    })(),
                                    valid_for_date: String(fd.get('valid_for_date') ?? '') || null,
                                    active: fd.get('active') === 'on',
                                  }
                                : t
                            );
                            setTicketTypes(next);
                            setEditingTypeId(null);
                          }
                          notify(res.ok, res.message);
                        });
                      }}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {tt.name}{' '}
                          {!tt.active ? <Badge variant="outline">Inactivo</Badge> : null}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {TICKET_SCOPE_LABELS[tt.ticket_scope]} · {formatTicketPrice(tt.price_cents)}
                          {tt.max_quantity != null
                            ? ` · ${availability.issued}/${tt.max_quantity} emitidas`
                            : ` · ${availability.issued} emitidas`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingTypeId(tt.id)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-300"
                          disabled={pending}
                          onClick={() => {
                            startTransition(async () => {
                              const res = await deleteTicketType(tt.id);
                              if (res.ok) {
                                setTicketTypes((prev) =>
                                  res.message?.includes('desactivado')
                                    ? prev.map((t) => (t.id === tt.id ? { ...t, active: false } : t))
                                    : prev.filter((t) => t.id !== tt.id)
                                );
                              }
                              notify(res.ok, res.message);
                            });
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <TicketTypeForm
            pending={pending}
            onSubmit={(fd) => {
              startTransition(async () => {
                const res = await createTicketType(tournament.id, fd);
                if (res.ok && res.id) {
                  const newId = res.id;
                  setTicketTypes((prev) => [
                    ...prev,
                    {
                      id: newId,
                      tournament_id: tournament.id,
                      name: String(fd.get('name') ?? ''),
                      description: String(fd.get('description') ?? '') || null,
                      ticket_scope: String(fd.get('ticket_scope') ?? 'day') as TicketScope,
                      price_cents: Math.round(Number(fd.get('price_eur') ?? 0) * 100),
                      currency: 'EUR',
                      valid_for_date: String(fd.get('valid_for_date') ?? '') || null,
                      match_id: null,
                      max_quantity: (() => {
                        const raw = String(fd.get('max_quantity') ?? '').trim();
                        return raw ? Number(raw) : null;
                      })(),
                      active: true,
                      sort_order: prev.length,
                    },
                  ]);
                  if (!issueTypeId) setIssueTypeId(newId);
                  if (!batchTypeId) setBatchTypeId(newId);
                }
                notify(res.ok, res.message);
              });
            }}
            submitLabel="Añadir tipo"
          />
        </section>

        <div className="space-y-5">
          <section className="portal-section-surface rounded-xl p-4">
            <h4 className="font-medium">Emitir entrada</h4>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const typeId = String(fd.get('ticket_type_id') ?? '');
                const name = String(fd.get('purchaser_name') ?? '').trim();
                const email = String(fd.get('purchaser_email') ?? '').trim() || undefined;
                startTransition(async () => {
                  const res = await issueTicket(tournament.id, typeId, name, email);
                  if (res.ok && res.qrPayload) {
                    const ticket: TournamentTicket = {
                      id: res.id ?? crypto.randomUUID(),
                      tournament_id: tournament.id,
                      ticket_type_id: typeId,
                      purchaser_name: name,
                      purchaser_email: email ?? null,
                      qr_code_hash: '',
                      qr_payload: res.qrPayload,
                      status: 'valid',
                      paid_flag: false,
                      paid_amount_cents: ticketTypes.find((t) => t.id === typeId)?.price_cents ?? 0,
                      valid_for_date: null,
                      match_id: null,
                      scanned_at: null,
                      scanned_by: null,
                    };
                    setTickets((prev) => [...prev, ticket]);
                    setIssuedPreview({
                      purchaserName: name,
                      typeName: typeName(typeId),
                      qrPayload: res.qrPayload,
                    });
                    e.currentTarget.reset();
                  }
                  notify(res.ok, res.message);
                });
              }}
            >
              <Field label="Tipo">
                <SynqSelect
                  value={issueTypeId}
                  onChange={setIssueTypeId}
                  options={activeTypes.map((t) => ({ value: t.id, label: t.name }))}
                />
                <input type="hidden" name="ticket_type_id" value={issueTypeId} readOnly />
              </Field>
              <Field label="Nombre">
                <Input name="purchaser_name" required className="portal-field-surface" placeholder="Nombre del espectador" />
              </Field>
              <Field label="Email (opcional)">
                <Input name="purchaser_email" type="email" className="portal-field-surface" placeholder="correo@ejemplo.com" />
              </Field>
              <Button type="submit" className="w-full" disabled={pending || !issueTypeId}>
                {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                Emitir y mostrar QR
              </Button>
            </form>
          </section>

          <section className="portal-section-surface rounded-xl p-4">
            <h4 className="flex items-center gap-2 font-medium">
              <Users className="size-4 text-cyan-300" />
              Emisión en lote
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Una línea por persona. Formato: <code>Nombre</code> o <code>Nombre, email</code>
            </p>
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const typeId = String(fd.get('ticket_type_id') ?? '');
                const entries = parseBatchNameLines(String(fd.get('names') ?? ''));
                startTransition(async () => {
                  const res = await issueTicketsBatch(tournament.id, typeId, entries);
                  if (res.ok && res.issued) {
                    const price = ticketTypes.find((t) => t.id === typeId)?.price_cents ?? 0;
                    const newTickets = res.issued.map((item) => ({
                      id: item.id,
                      tournament_id: tournament.id,
                      ticket_type_id: typeId,
                      purchaser_name: item.purchaserName,
                      purchaser_email: null,
                      qr_code_hash: '',
                      qr_payload: item.qrPayload,
                      status: 'valid' as const,
                      paid_flag: false,
                      paid_amount_cents: price,
                      valid_for_date: null,
                      match_id: null,
                      scanned_at: null,
                      scanned_by: null,
                    }));
                    setTickets((prev) => [...prev, ...newTickets]);
                    setBatchIssued(
                      res.issued.map((item) => ({
                        purchaserName: item.purchaserName,
                        typeName: typeName(typeId),
                        qrPayload: item.qrPayload,
                      }))
                    );
                    e.currentTarget.reset();
                  }
                  notify(res.ok, res.message);
                });
              }}
            >
              <Field label="Tipo">
                <SynqSelect
                  value={batchTypeId}
                  onChange={setBatchTypeId}
                  options={activeTypes.map((t) => ({ value: t.id, label: t.name }))}
                />
                <input type="hidden" name="ticket_type_id" value={batchTypeId} readOnly />
              </Field>
              <Field label="Listado">
                <textarea
                  name="names"
                  rows={6}
                  required
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm"
                  placeholder={'Prensa RFEF\nPatrocinador Gold, prensa@club.com\nVoluntario puerta 1'}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={pending || !batchTypeId}>
                Emitir lote
              </Button>
            </form>
          </section>
        </div>
      </div>

      <section className="portal-section-surface rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-medium">Entradas emitidas</h4>
          <div className="flex flex-wrap gap-1">
            {(['all', 'valid', 'used', 'cancelled'] as FilterStatus[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px]',
                  filter === key
                    ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-100'
                    : 'border-white/10 text-muted-foreground'
                )}
              >
                {key === 'all' ? 'Todas' : TICKET_STATUS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No hay entradas con este filtro.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2">Estado</th>
                  <th className="px-2 py-2">Validada</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-border/30">
                    <td className="px-2 py-2">
                      <p className="font-medium">{ticket.purchaser_name}</p>
                      {ticket.purchaser_email ? (
                        <p className="text-xs text-muted-foreground">{ticket.purchaser_email}</p>
                      ) : null}
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{typeName(ticket.ticket_type_id)}</td>
                    <td className="px-2 py-2">
                      <Badge variant="outline">{TICKET_STATUS_LABELS[ticket.status]}</Badge>
                    </td>
                    <td className="px-2 py-2 text-xs text-muted-foreground">
                      {ticket.scanned_at
                        ? new Date(ticket.scanned_at).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        {ticket.status === 'valid' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setIssuedPreview({
                                  purchaserName: ticket.purchaser_name,
                                  typeName: typeName(ticket.ticket_type_id),
                                  qrPayload: ticket.qr_payload,
                                })
                              }
                            >
                              <QrCode className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-red-300"
                              disabled={pending}
                              onClick={() => {
                                startTransition(async () => {
                                  const res = await cancelTicket(tournament.id, ticket.id);
                                  if (res.ok) {
                                    setTickets((prev) =>
                                      prev.map((t) =>
                                        t.id === ticket.id ? { ...t, status: 'cancelled' } : t
                                      )
                                    );
                                  }
                                  notify(res.ok, res.message);
                                });
                              }}
                            >
                              Anular
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {message ? (
        <p className={cn('text-center text-sm', error ? 'text-red-400' : 'text-muted-foreground')}>{message}</p>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = 'text-cyan-300',
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-border/40 bg-background/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tabular-nums', accent)}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={PORTAL_FIELD_LABEL_CLASS}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TicketTypeForm({
  initial,
  pending,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
}: {
  initial?: TournamentTicketType;
  pending: boolean;
  onSubmit: (fd: FormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [scope, setScope] = useState<TicketScope>(initial?.ticket_scope ?? 'day');

  return (
    <form
      className="mt-3 grid gap-3 border-t border-border/40 pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set('ticket_scope', scope);
        onSubmit(fd);
      }}
    >
      <Field label="Nombre">
        <Input name="name" required defaultValue={initial?.name} className="portal-field-surface" />
      </Field>
      <Field label="Descripción">
        <Input name="description" defaultValue={initial?.description ?? ''} className="portal-field-surface" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ámbito">
          <SynqSelect
            value={scope}
            onChange={(v) => setScope(v as TicketScope)}
            options={TICKET_SCOPES.map((s) => ({ value: s, label: TICKET_SCOPE_LABELS[s] }))}
          />
        </Field>
        <Field label="Precio (€)">
          <Input
            name="price_eur"
            type="number"
            min={0}
            step="0.5"
            defaultValue={(initial?.price_cents ?? 0) / 100}
            className="portal-field-surface"
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cupo máximo">
          <Input
            name="max_quantity"
            type="number"
            min={1}
            placeholder="Sin límite"
            defaultValue={initial?.max_quantity ?? ''}
            className="portal-field-surface"
          />
        </Field>
        <Field label="Válido para fecha">
          <Input
            name="valid_for_date"
            type="date"
            defaultValue={initial?.valid_for_date ?? ''}
            className="portal-field-surface"
          />
        </Field>
      </div>
      {initial ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={initial.active} />
          Tipo activo
        </label>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
