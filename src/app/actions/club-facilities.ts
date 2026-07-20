'use server';

import { requireClubId } from '@/lib/auth-staff';
import { isDemoActive } from '@/lib/demo';
import {
  DEMO_FACILITIES,
  FACILITY_SELECT,
  type ClubFacility,
  facilityToDbPayload,
  parseFacilityFromForm,
} from '@/lib/club-facilities';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type FacilityActionState = { ok: boolean; message?: string; facilityId?: string };

function mapFacilityRow(row: Record<string, unknown>): ClubFacility {
  const availabilityStart = row.availability_start
    ? String(row.availability_start).slice(0, 5)
    : '';
  const availabilityEnd = row.availability_end
    ? String(row.availability_end).slice(0, 5)
    : '';

  const divisionScheduleStart = row.division_schedule_start
    ? String(row.division_schedule_start).slice(0, 5)
    : '';
  const divisionScheduleEnd = row.division_schedule_end
    ? String(row.division_schedule_end).slice(0, 5)
    : '';

  return {
    id: String(row.id),
    name: String(row.name),
    sport: row.sport as ClubFacility['sport'],
    facility_kind: row.facility_kind as ClubFacility['facility_kind'],
    surface_type: row.surface_type ? String(row.surface_type) : null,
    division_mode: row.division_mode as ClubFacility['division_mode'],
    address: row.address ? String(row.address) : null,
    availability_days: row.availability_days ? String(row.availability_days) : '',
    availability_start: availabilityStart,
    availability_end: availabilityEnd,
    division_schedule_days: row.division_schedule_days
      ? String(row.division_schedule_days)
      : '',
    division_schedule_start: divisionScheduleStart,
    division_schedule_end: divisionScheduleEnd,
    is_match_venue: row.is_match_venue === true,
    supports_reservations: row.supports_reservations === true,
    reservation_capacity: Number(row.reservation_capacity ?? 1),
    slot_duration_minutes: Number(row.slot_duration_minutes ?? 60),
    booking_mode: (row.booking_mode as ClubFacility['booking_mode']) ?? 'instant',
    max_active_reservations_per_player: Number(row.max_active_reservations_per_player ?? 1),
    advance_booking_days: Number(row.advance_booking_days ?? 7),
    availability_note: row.availability_note ? String(row.availability_note) : null,
    notes: row.notes ? String(row.notes) : null,
    active: row.active !== false,
  };
}

export async function loadClubFacilities(
  clubId: string,
  options?: { includeInactive?: boolean }
): Promise<ClubFacility[]> {
  if (await isDemoActive()) return DEMO_FACILITIES;

  const supabase = await createClient();
  let query = supabase
    .from('synq_facilities')
    .select(FACILITY_SELECT)
    .eq('club_id', clubId)
    .order('name');

  if (!options?.includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('loadClubFacilities', error);
    return [];
  }

  return (data ?? []).map((row) => mapFacilityRow(row as Record<string, unknown>));
}

export async function loadFacilityById(
  clubId: string,
  facilityId: string
): Promise<ClubFacility | null> {
  if (await isDemoActive()) {
    return DEMO_FACILITIES.find((facility) => facility.id === facilityId) ?? null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_facilities')
    .select(FACILITY_SELECT)
    .eq('club_id', clubId)
    .eq('id', facilityId)
    .maybeSingle();

  if (error || !data) {
    console.error('loadFacilityById', error);
    return null;
  }

  return mapFacilityRow(data as Record<string, unknown>);
}

function revalidateFacilityPaths(facilityId?: string) {
  revalidatePath('/portal/club/instalaciones');
  revalidatePath('/portal/cantera/equipos');
  if (facilityId) {
    revalidatePath(`/portal/club/instalaciones/${facilityId}`);
    revalidatePath(`/portal/club/instalaciones/${facilityId}/editar`);
  }
}

export async function createFacility(
  _prev: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const parsed = parseFacilityFromForm(formData);
  if (!parsed.name) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidateFacilityPaths();
    return { ok: true };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_facilities')
    .insert({
      club_id: clubId,
      ...facilityToDbPayload(parsed),
      active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('createFacility', error);
    return { ok: false, message: 'error' };
  }

  revalidateFacilityPaths(data.id);
  return { ok: true, facilityId: data.id };
}

export async function updateFacility(
  facilityId: string,
  _prev: FacilityActionState,
  formData: FormData
): Promise<FacilityActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const parsed = parseFacilityFromForm(formData);
  if (!parsed.name) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidateFacilityPaths(facilityId);
    return { ok: true, facilityId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_facilities')
    .update(facilityToDbPayload(parsed))
    .eq('id', facilityId)
    .eq('club_id', clubId);

  if (error) {
    console.error('updateFacility', error);
    return { ok: false, message: 'error' };
  }

  revalidateFacilityPaths(facilityId);
  return { ok: true, facilityId };
}

export async function toggleFacilityActive(
  facilityId: string,
  active: boolean
): Promise<FacilityActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    revalidateFacilityPaths(facilityId);
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_facilities')
    .update({ active })
    .eq('id', facilityId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  revalidateFacilityPaths(facilityId);
  return { ok: true };
}
