export type ChangeRequestType = 'methodology' | 'cantera' | 'mixed';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export const CHANGE_REQUEST_TYPE_LABELS: Record<ChangeRequestType, string> = {
  methodology: 'Metodología',
  cantera: 'Cantera',
  mixed: 'Metodología y cantera',
};

export const CHANGE_REQUEST_STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const METHODOLOGY_APPROVER_ROLES = new Set([
  'admin',
  'president',
  'methodology',
  'sport_director',
]);

const CANTERA_APPROVER_ROLES = new Set([
  'admin',
  'president',
  'sport_director',
  'coordinator',
]);

const INBOX_VIEWER_ROLES = new Set([
  'admin',
  'president',
  'methodology',
  'sport_director',
  'coordinator',
]);

export function canViewChangeRequestInbox(role: string): boolean {
  return INBOX_VIEWER_ROLES.has(role);
}

export function canApproveChangeRequest(role: string, requestType: ChangeRequestType): boolean {
  if (role === 'admin' || role === 'president') return true;
  if (requestType === 'cantera') return CANTERA_APPROVER_ROLES.has(role);
  if (requestType === 'methodology') return METHODOLOGY_APPROVER_ROLES.has(role);
  return METHODOLOGY_APPROVER_ROLES.has(role) || CANTERA_APPROVER_ROLES.has(role);
}

export function changeRequestVisibleToRole(
  role: string,
  requestType: ChangeRequestType
): boolean {
  if (role === 'admin' || role === 'president') return true;
  if (requestType === 'cantera') {
    return CANTERA_APPROVER_ROLES.has(role) || role === 'coach';
  }
  if (requestType === 'methodology') {
    return METHODOLOGY_APPROVER_ROLES.has(role) || role === 'coach';
  }
  return INBOX_VIEWER_ROLES.has(role) || role === 'coach';
}

export function notificationAudienceForRequestType(
  requestType: ChangeRequestType
): 'methodology' | 'cantera' | 'all_staff' {
  if (requestType === 'cantera') return 'cantera';
  if (requestType === 'mixed') return 'all_staff';
  return 'methodology';
}

export function roleMatchesNotificationAudience(
  role: string,
  audience: string
): boolean {
  if (audience === 'all_staff') return INBOX_VIEWER_ROLES.has(role);
  if (audience === 'methodology') return METHODOLOGY_APPROVER_ROLES.has(role);
  if (audience === 'cantera') return CANTERA_APPROVER_ROLES.has(role);
  return false;
}

export type ChangeRequestInboxRow = {
  id: string;
  reason: string;
  status: ChangeRequestStatus;
  request_type: ChangeRequestType;
  created_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
  session_label: string | null;
  team_id: string | null;
  microcycle_id: string | null;
  requested_by: string | null;
  requester_name: string | null;
  team_name: string | null;
  microcycle_title: string | null;
  exercise_title: string | null;
  source?: 'server' | 'coach-demo';
};
