export type CoachChangeRequest = {
  id: string;
  teamId: string;
  teamName: string;
  reason: string;
  microcycleId?: string;
  mccLabel?: string;
  sessionLabel?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
};

const STORAGE_KEY = 'synq-coach-change-requests';
export const COACH_CHANGE_REQUESTS_EVENT = 'synq-coach-change-requests-updated';

function notifyCoachChangeRequestsUpdated(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COACH_CHANGE_REQUESTS_EVENT));
}

export function loadCoachChangeRequests(): CoachChangeRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CoachChangeRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCoachChangeRequest(request: CoachChangeRequest): void {
  if (typeof window === 'undefined') return;
  const current = loadCoachChangeRequests();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([request, ...current]));
  notifyCoachChangeRequestsUpdated();
}

export function updateCoachChangeRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  resolutionNote?: string
): void {
  if (typeof window === 'undefined') return;
  const current = loadCoachChangeRequests().map((item) =>
    item.id === requestId
      ? {
          ...item,
          status,
          resolvedAt: new Date().toISOString(),
          resolutionNote: resolutionNote?.trim() || item.resolutionNote,
        }
      : item
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  notifyCoachChangeRequestsUpdated();
}
