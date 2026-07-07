import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { sessionSlotsForMainCount, type MainTasksPerSession, type SessionsPerMicro } from '@/lib/periodization';
import type { SlotType } from '@/lib/methodology';
import { SLOT_LABELS } from '@/lib/methodology';

export type MicrocycleSlotSeed = {
  session_index: number;
  slot_type: SlotType;
  order_index: number;
};

export type MicrocycleMeta = {
  id: string;
  title: string;
  week_label: string;
  week_start: string | null;
  week_end: string | null;
  category_slug: CanteraCategorySlug | null;
  plan_variant_id: string | null;
  plan_mcc_id: string | null;
  sessions_per_micro: SessionsPerMicro;
  main_tasks_per_session: MainTasksPerSession;
  is_template: boolean;
  team_id: string | null;
};

export type SlotRowBase = {
  id: string;
  session_index: number;
  slot_type: SlotType;
  order_index: number;
  title: string;
  notes: string;
  session_date: string | null;
  exercise_id: string | null;
  sheet_json?: unknown;
  drawing_json?: unknown;
};

export function isDemoMicrocycleId(id: string): boolean {
  return id.startsWith('demo-micro-');
}

export function sessionsPerMicroFromVariantId(variantId: string | null | undefined): SessionsPerMicro {
  return variantId === 'variant-2' ? 2 : 3;
}

export function mainTasksFromVariantId(variantId: string | null | undefined): MainTasksPerSession {
  // Ambas variantes demo usan 3 principales; se puede extender si hay variant-2-principales-2
  void variantId;
  return 3;
}

export function resolveMicrocycleSessions(meta: {
  sessions_per_micro?: number | null;
  plan_variant_id?: string | null;
}): SessionsPerMicro {
  if (meta.sessions_per_micro === 2 || meta.sessions_per_micro === 3) {
    return meta.sessions_per_micro;
  }
  return sessionsPerMicroFromVariantId(meta.plan_variant_id);
}

export function resolveMainTasksPerSession(meta: {
  main_tasks_per_session?: number | null;
  plan_variant_id?: string | null;
}): MainTasksPerSession {
  if (meta.main_tasks_per_session === 2 || meta.main_tasks_per_session === 3) {
    return meta.main_tasks_per_session;
  }
  return mainTasksFromVariantId(meta.plan_variant_id);
}

export function buildMicrocycleSlotSeeds(
  sessionsPerMicro: SessionsPerMicro,
  mainTasksPerSession: MainTasksPerSession
): MicrocycleSlotSeed[] {
  const template = sessionSlotsForMainCount(mainTasksPerSession);
  const seeds: MicrocycleSlotSeed[] = [];

  for (let sessionIndex = 1; sessionIndex <= sessionsPerMicro; sessionIndex += 1) {
    for (const slot of template) {
      seeds.push({
        session_index: sessionIndex,
        slot_type: slot.slot_type,
        order_index: slot.order_index,
      });
    }
  }

  return seeds;
}

export function slotDisplayLabel(slotType: SlotType, orderIndex: number): string {
  if (slotType === 'main') {
    const mainNumber = Math.max(1, orderIndex);
    return `Principal ${mainNumber}`;
  }
  return SLOT_LABELS[slotType];
}

export function groupSlotsBySession<T extends { session_index: number; order_index: number }>(
  slots: T[]
): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const slot of slots) {
    const session = slot.session_index || 1;
    const list = map.get(session) ?? [];
    list.push(slot);
    map.set(session, list);
  }
  for (const [session, list] of map) {
    list.sort((a, b) => a.order_index - b.order_index);
    map.set(session, list);
  }
  return map;
}

export function countFilledSlots<T extends { exercise_id: string | null; title?: string; sheet_json?: unknown }>(
  slots: T[]
): number {
  return slots.filter((slot) => slot.exercise_id || (slot.title && slot.title.trim())).length;
}

export function sessionCompletionLabel(filled: number, total: number): string {
  if (total === 0) return 'Sin tareas';
  if (filled >= total) return 'Completa';
  if (filled === 0) return 'Vacía';
  return `${filled}/${total} tareas`;
}
