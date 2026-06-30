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
};

const STORAGE_KEY = 'synq-coach-change-requests';

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
}

export function updateCoachChangeRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected'
): void {
  if (typeof window === 'undefined') return;
  const current = loadCoachChangeRequests().map((item) =>
    item.id === requestId ? { ...item, status } : item
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}
