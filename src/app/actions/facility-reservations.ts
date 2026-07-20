'use server';

import { requireClubId } from '@/lib/auth-staff';
import { loadFacilityById } from '@/app/actions/club-facilities';
import { isDemoActive } from '@/lib/demo';
import {
  DEMO_RESERVATIONS,
  RESERVATION_SELECT,
  mapReservationRow,
  validateReservationRequest,
  type FacilityReservation,
  type ReservationStatus,
} from '@/lib/facility-reservations';
import { getDemoReservations, setDemoReservations } from '@/lib/demo-reservations-store';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ReservationActionState = {
  ok: boolean;
  message?: string;
  reservationId?: string;
};

function revalidateReservationPaths() {
  revalidatePath('/portal/club/instalaciones');
  revalidatePath('/familias');
  revalidatePath('/familias/reservas');
}

export async function loadFacilityReservations(
  clubId: string,
  options?: { facilityId?: string; status?: ReservationStatus | ReservationStatus[] }
): Promise<FacilityReservation[]> {
  if (await isDemoActive()) {
    let list = getDemoReservations().filter((reservation) => reservation.club_id === clubId);
    if (options?.facilityId) {
      list = list.filter((reservation) => reservation.facility_id === options.facilityId);
    }
    if (options?.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status];
      list = list.filter((reservation) => statuses.includes(reservation.status));
    }
    return list.sort((a, b) => a.start_at.localeCompare(b.start_at));
  }

  const supabase = await createClient();
  let query = supabase
    .from('synq_facility_reservations')
    .select(RESERVATION_SELECT)
    .eq('club_id', clubId)
    .order('start_at', { ascending: true });

  if (options?.facilityId) {
    query = query.eq('facility_id', options.facilityId);
  }
  if (options?.status) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    query = query.in('status', statuses);
  }

  const { data, error } = await query;
  if (error) {
    console.error('loadFacilityReservations', error);
    return [];
  }

  return (data ?? []).map((row) => mapReservationRow(row as Record<string, unknown>));
}

export async function loadFamilyReservations(
  clubId: string,
  playerIds: string[]
): Promise<FacilityReservation[]> {
  if (playerIds.length === 0) return [];
  const all = await loadFacilityReservations(clubId);
  return all.filter((reservation) => playerIds.includes(reservation.player_id));
}

async function insertReservationRecord(input: {
  clubId: string;
  facilityId: string;
  playerId: string;
  playerName: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
  bookingSource: FacilityReservation['booking_source'];
  notes?: string | null;
  familyAccountId?: string | null;
  familyAccountName?: string | null;
  staffUserId?: string | null;
}): Promise<ReservationActionState> {
  if (await isDemoActive()) {
    const reservation: FacilityReservation = {
      id: `demo-res-${Date.now()}`,
      club_id: input.clubId,
      facility_id: input.facilityId,
      player_id: input.playerId,
      player_name: input.playerName,
      booked_by_family_account_id: input.familyAccountId ?? null,
      booked_by_family_name: input.familyAccountName ?? null,
      booked_by_staff_user_id: input.staffUserId ?? null,
      start_at: input.startAt,
      end_at: input.endAt,
      status: input.status,
      booking_source: input.bookingSource,
      notes: input.notes ?? null,
      reviewed_at: input.status === 'confirmed' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    };
    setDemoReservations([...getDemoReservations(), reservation]);
    revalidateReservationPaths();
    return { ok: true, reservationId: reservation.id };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_facility_reservations')
    .insert({
      club_id: input.clubId,
      facility_id: input.facilityId,
      player_id: input.playerId,
      booked_by_family_account_id: input.familyAccountId ?? null,
      booked_by_staff_user_id: input.staffUserId ?? null,
      start_at: input.startAt,
      end_at: input.endAt,
      status: input.status,
      booking_source: input.bookingSource,
      notes: input.notes ?? null,
      reviewed_at: input.status === 'confirmed' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('insertReservationRecord', error);
    return { ok: false, message: 'error' };
  }

  revalidateReservationPaths();
  return { ok: true, reservationId: data.id };
}

export async function createStaffReservation(
  _prev: ReservationActionState,
  formData: FormData
): Promise<ReservationActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const facilityId = String(formData.get('facilityId') ?? '');
  const playerId = String(formData.get('playerId') ?? '');
  const startAt = String(formData.get('startAt') ?? '');
  const endAt = String(formData.get('endAt') ?? '');
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!facilityId || !playerId || !startAt || !endAt) {
    return { ok: false, message: 'validation' };
  }

  const facility = await loadFacilityById(clubId, facilityId);
  if (!facility) return { ok: false, message: 'validation' };

  const reservations = await loadFacilityReservations(clubId, { facilityId });
  const validation = validateReservationRequest({
    facility,
    playerId,
    startAt,
    endAt,
    reservations,
  });
  if (!validation.ok) return { ok: false, message: validation.code };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const status: ReservationStatus =
    facility.booking_mode === 'instant' ? 'confirmed' : 'confirmed';

  return insertReservationRecord({
    clubId,
    facilityId,
    playerId,
    playerName: String(formData.get('playerName') ?? 'Jugador'),
    startAt,
    endAt,
    status,
    bookingSource: 'portal',
    notes,
    staffUserId: user?.id ?? null,
  });
}

export async function createFamilyReservation(input: {
  facilityId: string;
  playerId: string;
  playerName: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
  familyAccountId: string;
  familyAccountName: string;
  clubId: string;
}): Promise<ReservationActionState> {
  const facility = await loadFacilityById(input.clubId, input.facilityId);
  if (!facility) return { ok: false, message: 'validation' };

  const reservations = await loadFacilityReservations(input.clubId, { facilityId: input.facilityId });
  const validation = validateReservationRequest({
    facility,
    playerId: input.playerId,
    startAt: input.startAt,
    endAt: input.endAt,
    reservations,
  });
  if (!validation.ok) return { ok: false, message: validation.code };

  const status: ReservationStatus =
    facility.booking_mode === 'instant' ? 'confirmed' : 'pending';

  return insertReservationRecord({
    clubId: input.clubId,
    facilityId: input.facilityId,
    playerId: input.playerId,
    playerName: input.playerName,
    startAt: input.startAt,
    endAt: input.endAt,
    status,
    bookingSource: 'families_web',
    notes: input.notes ?? null,
    familyAccountId: input.familyAccountId,
    familyAccountName: input.familyAccountName,
  });
}

export async function reviewReservation(
  reservationId: string,
  decision: 'confirm' | 'reject'
): Promise<ReservationActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const status: ReservationStatus = decision === 'confirm' ? 'confirmed' : 'rejected';

  if (await isDemoActive()) {
    setDemoReservations(
      getDemoReservations().map((reservation) =>
        reservation.id === reservationId
          ? {
              ...reservation,
              status,
              reviewed_at: new Date().toISOString(),
            }
          : reservation
      )
    );
    revalidateReservationPaths();
    return { ok: true, reservationId };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('synq_facility_reservations')
    .update({
      status,
      reviewed_by_user_id: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .eq('club_id', clubId);

  if (error) {
    console.error('reviewReservation', error);
    return { ok: false, message: 'error' };
  }

  revalidateReservationPaths();
  return { ok: true, reservationId };
}

export async function cancelReservation(reservationId: string): Promise<ReservationActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    setDemoReservations(
      getDemoReservations().map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: 'cancelled', reviewed_at: new Date().toISOString() }
          : reservation
      )
    );
    revalidateReservationPaths();
    return { ok: true, reservationId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_facility_reservations')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidateReservationPaths();
  return { ok: true, reservationId };
}

export async function cancelFamilyReservation(
  reservationId: string,
  clubId: string
): Promise<ReservationActionState> {
  if (await isDemoActive()) {
    setDemoReservations(
      getDemoReservations().map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: 'cancelled', reviewed_at: new Date().toISOString() }
          : reservation
      )
    );
    revalidateReservationPaths();
    return { ok: true, reservationId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_facility_reservations')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', reservationId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidateReservationPaths();
  return { ok: true, reservationId };
}
