'use client';

import type { CanteraCategorySlug } from '@/lib/cantera-categories';
import { emptyExerciseSheet, parseExerciseSheet } from '@/lib/exercise-sheet';
import {
  buildMicrocycleSlotSeeds,
  type MicrocycleMeta,
  type SlotRowBase,
} from '@/lib/microcycle-sessions';
import type { MainTasksPerSession, SessionsPerMicro } from '@/lib/periodization';

const STORAGE_KEY = 'synq-demo-microcycles';

export type DemoMicrocycleRecord = MicrocycleMeta & {
  slots: SlotRowBase[];
  created_at: string;
};

export type CreateDemoMicrocycleInput = {
  id: string;
  title: string;
  week_label: string;
  week_start: string | null;
  week_end: string | null;
  category_slug: CanteraCategorySlug;
  plan_variant_id: string;
  plan_mcc_id: string;
  sessions_per_micro: SessionsPerMicro;
  main_tasks_per_session: MainTasksPerSession;
  is_template: boolean;
  team_id: string | null;
  template_microcycle_id?: string | null;
};

function readStore(): Record<string, DemoMicrocycleRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DemoMicrocycleRecord>;
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, DemoMicrocycleRecord>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function buildDemoSlots(
  microcycleId: string,
  sessionsPerMicro: SessionsPerMicro,
  mainTasksPerSession: MainTasksPerSession
): SlotRowBase[] {
  return buildMicrocycleSlotSeeds(sessionsPerMicro, mainTasksPerSession).map((seed) => ({
    id: `demo-slot-${microcycleId}-${seed.session_index}-${seed.order_index}`,
    session_index: seed.session_index,
    slot_type: seed.slot_type,
    order_index: seed.order_index,
    title: '',
    notes: '',
    session_date: null,
    exercise_id: null,
    sheet_json: emptyExerciseSheet(seed.slot_type),
  }));
}

export function saveDemoMicrocycle(input: CreateDemoMicrocycleInput): DemoMicrocycleRecord {
  const store = readStore();
  const existing = store[input.id];

  const record: DemoMicrocycleRecord = {
    id: input.id,
    title: input.title,
    week_label: input.week_label,
    week_start: input.week_start,
    week_end: input.week_end,
    category_slug: input.category_slug,
    plan_variant_id: input.plan_variant_id,
    plan_mcc_id: input.plan_mcc_id,
    sessions_per_micro: input.sessions_per_micro,
    main_tasks_per_session: input.main_tasks_per_session,
    is_template: input.is_template,
    team_id: input.team_id,
    slots:
      existing?.slots ??
      buildDemoSlots(input.id, input.sessions_per_micro, input.main_tasks_per_session),
    created_at: existing?.created_at ?? new Date().toISOString(),
  };

  store[input.id] = record;
  writeStore(store);
  return record;
}

export function loadDemoMicrocycle(id: string): DemoMicrocycleRecord | null {
  return readStore()[id] ?? null;
}

export function loadDemoSlot(microcycleId: string, slotId: string): SlotRowBase | null {
  const micro = loadDemoMicrocycle(microcycleId);
  return micro?.slots.find((slot) => slot.id === slotId) ?? null;
}

export function updateDemoSlot(
  microcycleId: string,
  slotId: string,
  patch: Partial<Pick<SlotRowBase, 'title' | 'notes' | 'exercise_id' | 'session_date' | 'sheet_json'>>
): boolean {
  const store = readStore();
  const micro = store[microcycleId];
  if (!micro) return false;

  const slots = micro.slots.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot));
  store[microcycleId] = { ...micro, slots };
  writeStore(store);
  return true;
}

export function assignExerciseToDemoSlot(
  microcycleId: string,
  slotId: string,
  exercise: {
    id: string;
    title: string;
    sheet_json?: unknown;
    objectives?: string;
    notes?: string;
  }
): boolean {
  const micro = loadDemoMicrocycle(microcycleId);
  if (!micro) return false;

  const slot = micro.slots.find((item) => item.id === slotId);
  if (!slot) return false;

  const sheet = parseExerciseSheet(exercise.sheet_json);
  if (!sheet.title) sheet.title = exercise.title;
  if (!sheet.objectives && exercise.objectives) sheet.objectives = exercise.objectives;

  return updateDemoSlot(microcycleId, slotId, {
    exercise_id: exercise.id,
    title: sheet.title,
    notes: exercise.notes ?? '',
    sheet_json: sheet,
  });
}

export function forkDemoMicrocycleFromTemplate(input: {
  templateId: string;
  id: string;
  title: string;
  team_id: string;
}): DemoMicrocycleRecord | null {
  const template = loadDemoMicrocycle(input.templateId);
  if (!template) return null;

  const forked: DemoMicrocycleRecord = {
    ...template,
    id: input.id,
    title: input.title,
    is_template: false,
    team_id: input.team_id,
    slots: template.slots.map((slot) => ({
      ...slot,
      id: `demo-slot-${input.id}-${slot.session_index}-${slot.order_index}`,
      exercise_id: slot.exercise_id,
    })),
    created_at: new Date().toISOString(),
  };

  const store = readStore();
  store[input.id] = forked;
  writeStore(store);
  return forked;
}
