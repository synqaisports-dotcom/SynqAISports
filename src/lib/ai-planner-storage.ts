export type AiPlannerSavedPlan = {
  id: string;
  clubId: string;
  authorId: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  input: unknown;
  output: unknown;
};

export type AiPlannerStateV1 = {
  version: 1;
  updatedAt: number;
  form?: unknown;
  plan?: unknown;
};

const PREFIX_SAVED = "synq_ai_planner_saved_v1";
const PREFIX_STATE = "synq_ai_planner_state_v1";

function safeKeyPart(v: string): string {
  return String(v || "")
    .trim()
    .slice(0, 120)
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function aiPlannerSavedKey(clubId: string, authorId: string): string {
  return `${PREFIX_SAVED}__${safeKeyPart(clubId || "global-hq")}__${safeKeyPart(authorId || "anon")}`;
}

export function readAiPlannerSavedPlans(clubId: string, authorId: string): AiPlannerSavedPlan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(aiPlannerSavedKey(clubId, authorId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && typeof p === "object")
      .map((p: any) => {
        const id = typeof p.id === "string" ? p.id : "";
        if (!id) return null;
        const title = typeof p.title === "string" ? p.title : "(sin título)";
        const createdAt = Number(p.createdAt);
        const updatedAt = Number(p.updatedAt);
        return {
          id,
          clubId,
          authorId,
          createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
          updatedAt: Number.isFinite(updatedAt) ? updatedAt : Date.now(),
          title,
          input: p.input,
          output: p.output,
        } satisfies AiPlannerSavedPlan;
      })
      .filter(Boolean) as AiPlannerSavedPlan[];
  } catch {
    return [];
  }
}

export function writeAiPlannerSavedPlans(
  clubId: string,
  authorId: string,
  plans: AiPlannerSavedPlan[],
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(aiPlannerSavedKey(clubId, authorId), JSON.stringify(plans.slice(0, 50)));
  } catch {
    // noop
  }
}

export function upsertAiPlannerSavedPlan(
  clubId: string,
  authorId: string,
  plan: Omit<AiPlannerSavedPlan, "clubId" | "authorId" | "createdAt" | "updatedAt"> & {
    createdAt?: number;
    updatedAt?: number;
  },
): AiPlannerSavedPlan {
  const now = Date.now();
  const next: AiPlannerSavedPlan = {
    id: plan.id,
    clubId,
    authorId,
    createdAt: Number.isFinite(plan.createdAt) ? Number(plan.createdAt) : now,
    updatedAt: Number.isFinite(plan.updatedAt) ? Number(plan.updatedAt) : now,
    title: plan.title,
    input: plan.input,
    output: plan.output,
  };
  const prev = readAiPlannerSavedPlans(clubId, authorId);
  const without = prev.filter((p) => p.id !== next.id);
  writeAiPlannerSavedPlans(clubId, authorId, [next, ...without]);
  return next;
}

export function aiPlannerKey(clubId: string, userId: string | null): string {
  return `${PREFIX_STATE}__${safeKeyPart(clubId || "global-hq")}__${safeKeyPart(userId || "anon")}`;
}

export function readAiPlannerState(storageKey: string): AiPlannerStateV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiPlannerStateV1>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== 1) return null;
    const updatedAt = Number(parsed.updatedAt);
    if (!Number.isFinite(updatedAt)) return null;
    return {
      version: 1,
      updatedAt,
      form: parsed.form,
      plan: parsed.plan,
    };
  } catch {
    return null;
  }
}

export function writeAiPlannerState(
  storageKey: string,
  payload: { form?: unknown; plan?: unknown },
): AiPlannerStateV1 {
  const out: AiPlannerStateV1 = {
    version: 1,
    updatedAt: Date.now(),
    form: payload.form,
    plan: payload.plan,
  };
  if (typeof window === "undefined") return out;
  try {
    localStorage.setItem(storageKey, JSON.stringify(out));
  } catch {
    // noop
  }
  return out;
}

