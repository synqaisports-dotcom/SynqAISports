import type { CycleFeedbackType } from './cycle-types';

export type StoredFeedback = {
  slot_id: string;
  feedback_type: CycleFeedbackType;
  notes: string | null;
  updated_at: string;
};

const KEY_PREFIX = 'trendpulse-feedback:';

export function readFeedbackLocal(slotId: string): StoredFeedback | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slotId);
    if (!raw) return null;
    return JSON.parse(raw) as StoredFeedback;
  } catch {
    return null;
  }
}

export function writeFeedbackLocal(data: StoredFeedback): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_PREFIX + data.slot_id, JSON.stringify(data));
}

export function clearFeedbackLocal(slotId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_PREFIX + slotId);
}
