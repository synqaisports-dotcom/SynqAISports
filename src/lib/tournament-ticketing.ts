import type { TicketScope, TournamentTicket, TournamentTicketType } from '@/lib/tournaments';

export const TICKET_SCOPE_LABELS: Record<TicketScope, string> = {
  match: 'Partido',
  day: 'Día',
  tournament: 'Torneo completo',
};

export const TICKET_STATUS_LABELS: Record<TournamentTicket['status'], string> = {
  valid: 'Pendiente',
  used: 'Validada',
  cancelled: 'Anulada',
};

export type TicketStats = {
  issued: number;
  used: number;
  pending: number;
  cancelled: number;
};

export type TicketTypeAvailability = {
  id: string;
  name: string;
  maxQuantity: number | null;
  issued: number;
  used: number;
  pending: number;
  remaining: number | null;
};

export function formatTicketPrice(cents: number, currency = 'EUR'): string {
  return (cents / 100).toLocaleString('es-ES', { style: 'currency', currency });
}

export function ticketStatsForTournament(tickets: TournamentTicket[]): TicketStats {
  const issued = tickets.filter((t) => t.status !== 'cancelled').length;
  const used = tickets.filter((t) => t.status === 'used').length;
  const pending = tickets.filter((t) => t.status === 'valid').length;
  const cancelled = tickets.filter((t) => t.status === 'cancelled').length;
  return { issued, used, pending, cancelled };
}

export function ticketTypeAvailability(
  ticketType: TournamentTicketType,
  tickets: TournamentTicket[]
): TicketTypeAvailability {
  const typeTickets = tickets.filter((t) => t.ticket_type_id === ticketType.id && t.status !== 'cancelled');
  const used = typeTickets.filter((t) => t.status === 'used').length;
  const pending = typeTickets.filter((t) => t.status === 'valid').length;
  const issued = typeTickets.length;
  const remaining =
    ticketType.max_quantity != null ? Math.max(0, ticketType.max_quantity - issued) : null;
  return {
    id: ticketType.id,
    name: ticketType.name,
    maxQuantity: ticketType.max_quantity,
    issued,
    used,
    pending,
    remaining,
  };
}

export function ticketsCsvContent(
  tickets: TournamentTicket[],
  ticketTypes: TournamentTicketType[]
): string {
  const typeName = (id: string) => ticketTypes.find((t) => t.id === id)?.name ?? id;
  const header = ['id', 'tipo', 'nombre', 'email', 'estado', 'precio_cents', 'validada_en', 'qr_payload'];
  const rows = tickets.map((t) => [
    t.id,
    typeName(t.ticket_type_id),
    t.purchaser_name,
    t.purchaser_email ?? '',
    TICKET_STATUS_LABELS[t.status],
    String(t.paid_amount_cents),
    t.scanned_at ?? '',
    t.qr_payload,
  ]);
  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function parseBatchNameLines(raw: string): { purchaserName: string; purchaserEmail?: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, email] = line.split(/[,;\t]/).map((part) => part.trim());
      return {
        purchaserName: name,
        purchaserEmail: email && email.includes('@') ? email : undefined,
      };
    })
    .filter((entry) => entry.purchaserName.length > 0);
}

export type GateTicketTypeOption = {
  id: string;
  name: string;
  priceCents: number;
};

export function gateCashTotalCents(tickets: TournamentTicket[]): number {
  return tickets
    .filter((t) => t.paid_flag && t.status !== 'cancelled')
    .reduce((sum, t) => sum + t.paid_amount_cents, 0);
}

export type GateScanLogEntry = {
  id: string;
  at: string;
  ok: boolean;
  message: string;
  purchaserName?: string;
  amountCents?: number;
  kind?: 'sale' | 'scan';
};

const GATE_LOG_KEY = 'synq-gate-scan-log';

export function loadGateScanLog(gateToken: string): GateScanLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(`${GATE_LOG_KEY}:${gateToken}`);
    if (!raw) return [];
    return JSON.parse(raw) as GateScanLogEntry[];
  } catch {
    return [];
  }
}

export function appendGateScanLog(gateToken: string, entry: GateScanLogEntry): GateScanLogEntry[] {
  const prev = loadGateScanLog(gateToken);
  const next = [entry, ...prev].slice(0, 50);
  sessionStorage.setItem(`${GATE_LOG_KEY}:${gateToken}`, JSON.stringify(next));
  return next;
}
