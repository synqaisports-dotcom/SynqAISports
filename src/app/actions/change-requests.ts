'use server';

import { isDemoActive } from '@/lib/demo';
import { requireClubId, requireUserId } from '@/lib/auth-staff';
import {
  canApproveChangeRequest,
  canViewChangeRequestInbox,
  changeRequestVisibleToRole,
  notificationAudienceForRequestType,
  roleMatchesNotificationAudience,
  type ChangeRequestInboxRow,
  type ChangeRequestStatus,
  type ChangeRequestType,
} from '@/lib/change-requests';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type ChangeRequestActionState = { ok: boolean; message?: string };

type RawRequestRow = {
  id: string;
  reason: string;
  status: string;
  request_type: string | null;
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
  session_label: string | null;
  team_id: string | null;
  microcycle_id: string | null;
  requested_by: string | null;
  synq_teams: { name: string } | { name: string }[] | null;
  synq_microcycles: { title: string } | { title: string }[] | null;
  synq_exercises: { title: string } | { title: string }[] | null;
};

function relName<T extends { name?: string; title?: string }>(
  value: T | T[] | null,
  field: 'name' | 'title' = 'name'
): string | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row) return null;
  return (field === 'title' ? row.title : row.name) ?? null;
}

async function getStaffRole(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('synq_staff')
    .select('role')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return data?.role ?? 'coach';
}

async function loadRequesterNames(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};
  const { data: people } = await supabase
    .from('synq_club_people')
    .select('user_id, full_name')
    .in('user_id', userIds);

  const map: Record<string, string> = {};
  for (const person of people ?? []) {
    if (person.user_id) map[person.user_id] = person.full_name;
  }
  return map;
}

function mapRow(row: RawRequestRow, requesterNames: Record<string, string>): ChangeRequestInboxRow {
  return {
    id: row.id,
    reason: row.reason,
    status: row.status as ChangeRequestStatus,
    request_type: (row.request_type as ChangeRequestType) ?? 'methodology',
    created_at: row.created_at,
    resolved_at: row.resolved_at,
    resolution_note: row.resolution_note,
    session_label: row.session_label,
    team_id: row.team_id,
    microcycle_id: row.microcycle_id,
    requested_by: row.requested_by,
    requester_name: row.requested_by ? requesterNames[row.requested_by] ?? null : null,
    team_name: relName(row.synq_teams, 'name'),
    microcycle_title: relName(row.synq_microcycles, 'title'),
    exercise_title: relName(row.synq_exercises, 'title'),
    source: 'server',
  };
}

const REQUEST_SELECT = `
  id,
  reason,
  status,
  request_type,
  created_at,
  resolved_at,
  resolution_note,
  session_label,
  team_id,
  microcycle_id,
  requested_by,
  synq_teams(name),
  synq_microcycles(title),
  synq_exercises(title)
`;

export async function fetchChangeRequestInbox(options?: {
  limit?: number;
  status?: ChangeRequestStatus | 'all';
  mineOnly?: boolean;
}): Promise<ChangeRequestInboxRow[]> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId) return [];

  if (await isDemoActive()) return [];

  const supabase = await createClient();
  const role = await getStaffRole(supabase, userId);

  let query = supabase
    .from('synq_change_requests')
    .select(REQUEST_SELECT)
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });

  if (options?.mineOnly || role === 'coach') {
    query = query.eq('requested_by', userId);
  } else if (!canViewChangeRequestInbox(role)) {
    return [];
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  const rows = (data ?? []) as RawRequestRow[];
  const requesterNames = await loadRequesterNames(
    supabase,
    [...new Set(rows.map((row) => row.requested_by).filter(Boolean) as string[])]
  );

  return rows
    .map((row) => mapRow(row, requesterNames))
    .filter((row) => changeRequestVisibleToRole(role, row.request_type));
}

export async function fetchPendingChangeRequestCount(): Promise<number> {
  const items = await fetchChangeRequestInbox({ status: 'pending', limit: 100 });
  return items.filter((item) => item.status === 'pending').length;
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId) return 0;
  if (await isDemoActive()) return 0;

  const supabase = await createClient();
  const role = await getStaffRole(supabase, userId);

  const { data: direct } = await supabase
    .from('synq_notifications')
    .select('id, audience')
    .eq('club_id', clubId)
    .eq('recipient_user_id', userId)
    .is('read_at', null);

  const { data: broadcast } = await supabase
    .from('synq_notifications')
    .select('id, audience')
    .eq('club_id', clubId)
    .is('recipient_user_id', null)
    .is('read_at', null);

  const unread = [...(direct ?? []), ...(broadcast ?? [])].filter((item) =>
    roleMatchesNotificationAudience(role, item.audience)
  );

  if (unread.length > 0) return unread.length;
  return fetchPendingChangeRequestCount();
}

export async function markInboxNotificationsRead(): Promise<void> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId || (await isDemoActive())) return;

  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from('synq_notifications')
    .update({ read_at: now })
    .eq('club_id', clubId)
    .eq('recipient_user_id', userId)
    .is('read_at', null);
}

export async function resolveChangeRequestWithNote(
  requestId: string,
  status: 'approved' | 'rejected',
  resolutionNote?: string
): Promise<ChangeRequestActionState> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId || !userId) return { ok: false, message: 'unauthorized' };

  if (requestId.startsWith('coach-req-')) {
    return { ok: false, message: 'demo_local' };
  }

  const supabase = await createClient();
  const role = await getStaffRole(supabase, userId);

  const { data: request } = await supabase
    .from('synq_change_requests')
    .select('id, request_type, requested_by, reason, team_id, session_label, microcycle_slot_id')
    .eq('id', requestId)
    .eq('club_id', clubId)
    .maybeSingle();

  if (!request) return { ok: false, message: 'not_found' };

  const requestType = (request.request_type as ChangeRequestType) ?? 'methodology';
  if (!canApproveChangeRequest(role, requestType)) {
    return { ok: false, message: 'forbidden' };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('synq_change_requests')
    .update({
      status,
      resolved_by: userId,
      resolved_at: now,
      resolution_note: resolutionNote?.trim() || null,
    })
    .eq('id', requestId)
    .eq('club_id', clubId);

  if (error) return { ok: false, message: 'error' };

  if (status === 'approved' && request.microcycle_slot_id) {
    const noteLine = `[Solicitud aprobada ${new Date().toLocaleDateString('es-ES')}] ${resolutionNote?.trim() || request.reason}`;
    const { data: slot } = await supabase
      .from('synq_microcycle_slots')
      .select('notes')
      .eq('id', request.microcycle_slot_id)
      .maybeSingle();
    const mergedNotes = [slot?.notes?.trim(), noteLine].filter(Boolean).join('\n\n');
    await supabase
      .from('synq_microcycle_slots')
      .update({ notes: mergedNotes })
      .eq('id', request.microcycle_slot_id);
  }

  if (request.requested_by) {
    const statusLabel = status === 'approved' ? 'aprobada' : 'rechazada';
    await supabase.from('synq_notifications').insert({
      club_id: clubId,
      change_request_id: requestId,
      recipient_user_id: request.requested_by,
      audience: 'coach',
      title: `Solicitud ${statusLabel}`,
      body: resolutionNote?.trim() || request.reason,
    });
  }

  revalidatePath('/portal/metodologia/solicitudes');
  revalidatePath('/portal/entrenador');
  revalidatePath('/portal/metodologia');
  return { ok: true };
}

export async function notifyApproversForRequest(
  clubId: string,
  changeRequestId: string,
  requestType: ChangeRequestType,
  title: string,
  body: string
): Promise<void> {
  if (await isDemoActive()) return;

  const supabase = await createClient();
  await supabase.from('synq_notifications').insert({
    club_id: clubId,
    change_request_id: changeRequestId,
    audience: notificationAudienceForRequestType(requestType),
    title,
    body,
  });
}
