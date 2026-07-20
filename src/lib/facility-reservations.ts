import {
  type ClubFacility,
  type FacilityBookingMode,
  type FacilityKind,
  WEEKDAY_BUTTONS,
  facilityKindSupportsReservations,
} from '@/lib/club-facilities';
import { getDemoClubIdFallback } from '@/lib/demo-constants';

export type { FacilityBookingMode };
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';
export type ReservationSource = 'portal' | 'families_web' | 'families_app';

export type FacilityReservation = {
  id: string;
  club_id: string;
  facility_id: string;
  player_id: string;
  player_name: string;
  booked_by_family_account_id: string | null;
  booked_by_family_name: string | null;
  booked_by_staff_user_id: string | null;
  start_at: string;
  end_at: string;
  status: ReservationStatus;
  booking_source: ReservationSource;
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type BookableSlot = {
  start_at: string;
  end_at: string;
  available_spots: number;
  capacity: number;
  booked_count: number;
};

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  rejected: 'Rechazada',
};

export const BOOKING_MODE_LABELS: Record<FacilityBookingMode, string> = {
  instant: 'Instantánea (con aforo)',
  approval: 'Con aprobación',
};

export function defaultBookingConfigForKind(kind: FacilityKind): {
  reservation_capacity: number;
  slot_duration_minutes: number;
  booking_mode: FacilityBookingMode;
  max_active_reservations_per_player: number;
  advance_booking_days: number;
} {
  if (kind === 'physiotherapy_room') {
    return {
      reservation_capacity: 1,
      slot_duration_minutes: 45,
      booking_mode: 'approval',
      max_active_reservations_per_player: 2,
      advance_booking_days: 14,
    };
  }
  if (kind === 'gym') {
    return {
      reservation_capacity: 8,
      slot_duration_minutes: 60,
      booking_mode: 'instant',
      max_active_reservations_per_player: 3,
      advance_booking_days: 14,
    };
  }
  return {
    reservation_capacity: 1,
    slot_duration_minutes: 60,
    booking_mode: 'instant',
    max_active_reservations_per_player: 1,
    advance_booking_days: 7,
  };
}

function weekdayCodeForDate(date: Date): string {
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[date.getDay()] ?? 'mon';
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return hours * 60 + minutes;
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function combineDateAndTime(date: Date, time: string): Date {
  const result = new Date(date);
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB;
}

export function countActiveReservationsForPlayer(
  reservations: FacilityReservation[],
  playerId: string
): number {
  return reservations.filter(
    (reservation) =>
      reservation.player_id === playerId &&
      (reservation.status === 'pending' || reservation.status === 'confirmed')
  ).length;
}

export function countOverlappingConfirmed(
  reservations: FacilityReservation[],
  facilityId: string,
  startAt: Date,
  endAt: Date
): number {
  return reservations.filter(
    (reservation) =>
      reservation.facility_id === facilityId &&
      reservation.status === 'confirmed' &&
      overlaps(startAt, endAt, new Date(reservation.start_at), new Date(reservation.end_at))
  ).length;
}

export function countOverlappingPendingOrConfirmed(
  reservations: FacilityReservation[],
  facilityId: string,
  startAt: Date,
  endAt: Date
): number {
  return reservations.filter(
    (reservation) =>
      reservation.facility_id === facilityId &&
      (reservation.status === 'pending' || reservation.status === 'confirmed') &&
      overlaps(startAt, endAt, new Date(reservation.start_at), new Date(reservation.end_at))
  ).length;
}

export function generateBookableSlots(
  facility: ClubFacility,
  date: Date,
  reservations: FacilityReservation[]
): BookableSlot[] {
  if (!facilityKindSupportsReservations(facility.facility_kind)) return [];

  const dayCode = weekdayCodeForDate(date);
  const allowedDays = facility.availability_days
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);

  if (!allowedDays.includes(dayCode)) return [];
  if (!facility.availability_start || !facility.availability_end) return [];

  const startMinutes = parseTimeToMinutes(facility.availability_start);
  const endMinutes = parseTimeToMinutes(facility.availability_end);
  const duration = facility.slot_duration_minutes;
  const capacity = facility.reservation_capacity;
  const slots: BookableSlot[] = [];

  for (let cursor = startMinutes; cursor + duration <= endMinutes; cursor += duration) {
    const startAt = combineDateAndTime(date, minutesToTimeString(cursor));
    const endAt = combineDateAndTime(date, minutesToTimeString(cursor + duration));
    const bookedCount = countOverlappingConfirmed(reservations, facility.id, startAt, endAt);
    const availableSpots = Math.max(0, capacity - bookedCount);

    slots.push({
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      available_spots: availableSpots,
      capacity,
      booked_count: bookedCount,
    });
  }

  return slots;
}

export function getUpcomingDates(count: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let index = 0; index < count; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    dates.push(date);
  }
  return dates;
}

export function formatReservationRange(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const day = start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = `${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  return `${day} · ${time}`;
}

export function formatSlotTime(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  return `${start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

export function formatDateHeading(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function isDateWithinAdvanceWindow(facility: ClubFacility, date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays >= 0 && diffDays <= facility.advance_booking_days;
}

export function validateReservationRequest(input: {
  facility: ClubFacility;
  playerId: string;
  startAt: string;
  endAt: string;
  reservations: FacilityReservation[];
}): { ok: true } | { ok: false; code: string } {
  const { facility, playerId, startAt, endAt, reservations } = input;
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (!facilityKindSupportsReservations(facility.facility_kind)) {
    return { ok: false, code: 'facility_not_bookable' };
  }

  if (!isDateWithinAdvanceWindow(facility, start)) {
    return { ok: false, code: 'outside_window' };
  }

  const dayCode = weekdayCodeForDate(start);
  const allowedDays = facility.availability_days
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);
  if (!allowedDays.includes(dayCode)) {
    return { ok: false, code: 'day_closed' };
  }

  const activeCount = countActiveReservationsForPlayer(reservations, playerId);
  if (activeCount >= facility.max_active_reservations_per_player) {
    return { ok: false, code: 'max_active' };
  }

  if (facility.booking_mode === 'instant') {
    const overlapping = countOverlappingConfirmed(reservations, facility.id, start, end);
    if (overlapping >= facility.reservation_capacity) {
      return { ok: false, code: 'full' };
    }
  } else {
    const overlapping = countOverlappingPendingOrConfirmed(reservations, facility.id, start, end);
    if (overlapping >= facility.reservation_capacity) {
      return { ok: false, code: 'slot_taken' };
    }
  }

  return { ok: true };
}

export const RESERVATION_ERROR_MESSAGES: Record<string, string> = {
  facility_not_bookable: 'Esta instalación no admite reservas.',
  outside_window: 'La fecha está fuera del periodo de reserva permitido.',
  day_closed: 'La instalación no abre ese día.',
  max_active: 'Has alcanzado el máximo de reservas activas.',
  full: 'No quedan plazas en esa franja.',
  slot_taken: 'Esa franja ya está ocupada o pendiente.',
  unauthorized: 'No tienes permiso para reservar.',
  player_not_linked: 'No puedes reservar para este jugador.',
  validation: 'Revisa los datos de la reserva.',
  error: 'No se pudo completar la reserva.',
};

export const DEMO_RESERVATIONS: FacilityReservation[] = [
  {
    id: 'demo-res-gym-1',
    club_id: getDemoClubIdFallback(),
    facility_id: 'demo-facility-gym',
    player_id: 'demo-pl-ale-1',
    player_name: 'Alejandro Castro',
    booked_by_family_account_id: 'demo-family-ana',
    booked_by_family_name: 'Ana Castro',
    booked_by_staff_user_id: null,
    start_at: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
    end_at: new Date(new Date().setHours(19, 0, 0, 0)).toISOString(),
    status: 'confirmed',
    booking_source: 'families_web',
    notes: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-res-physio-1',
    club_id: getDemoClubIdFallback(),
    facility_id: 'demo-facility-physio',
    player_id: 'demo-pl-ale-1',
    player_name: 'Alejandro Castro',
    booked_by_family_account_id: 'demo-family-ana',
    booked_by_family_name: 'Ana Castro',
    booked_by_staff_user_id: null,
    start_at: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(
      /T.*/,
      'T10:00:00.000Z'
    ),
    end_at: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(
      /T.*/,
      'T10:45:00.000Z'
    ),
    status: 'pending',
    booking_source: 'families_web',
    notes: 'Dolor en rodilla derecha',
    reviewed_at: null,
    created_at: new Date().toISOString(),
  },
];

export const RESERVATION_SELECT = `
  id,
  club_id,
  facility_id,
  player_id,
  booked_by_family_account_id,
  booked_by_staff_user_id,
  start_at,
  end_at,
  status,
  booking_source,
  notes,
  reviewed_at,
  created_at,
  synq_players(display_name),
  synq_family_accounts(display_name)
`;

export function mapReservationRow(row: Record<string, unknown>): FacilityReservation {
  const player = Array.isArray(row.synq_players) ? row.synq_players[0] : row.synq_players;
  const family = Array.isArray(row.synq_family_accounts)
    ? row.synq_family_accounts[0]
    : row.synq_family_accounts;

  return {
    id: String(row.id),
    club_id: String(row.club_id),
    facility_id: String(row.facility_id),
    player_id: String(row.player_id),
    player_name: String(player?.display_name ?? 'Jugador'),
    booked_by_family_account_id: row.booked_by_family_account_id
      ? String(row.booked_by_family_account_id)
      : null,
    booked_by_family_name: family?.display_name ? String(family.display_name) : null,
    booked_by_staff_user_id: row.booked_by_staff_user_id ? String(row.booked_by_staff_user_id) : null,
    start_at: String(row.start_at),
    end_at: String(row.end_at),
    status: row.status as ReservationStatus,
    booking_source: row.booking_source as ReservationSource,
    notes: row.notes ? String(row.notes) : null,
    reviewed_at: row.reviewed_at ? String(row.reviewed_at) : null,
    created_at: String(row.created_at),
  };
}

export function weekdayLettersForDate(date: Date): string {
  const code = weekdayCodeForDate(date);
  return WEEKDAY_BUTTONS.find((day) => day.value === code)?.letter ?? '';
}
