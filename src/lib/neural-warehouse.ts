/**
 * Orígenes de datos para el almacén neural (entrenamiento IA).
 * - Supabase: ejercicios de club / pizarras persistidos en red
 * - Local: sandbox promo, metodología y estudio training (mismo navegador)
 */

export const STORAGE_PROMO_VAULT = "synq_promo_vault";
export const STORAGE_METHODOLOGY_NEURAL = "synq_methodology_neural";
export const STORAGE_TRAINING_NEURAL = "synq_training_neural";

export type NeuralOrigin =
  | "supabase"
  | "sandbox_promo"
  | "methodology_local"
  | "training_studio";

export type UnifiedNeuralExercise = {
  key: string;
  origin: NeuralOrigin;
  title: string;
  subtitle?: string;
  clubLabel?: string;
  country?: string;
  sport?: string;
  stage?: string;
  dimension?: string;
  block?: string;
  bytesApprox: number;
  createdAt?: string;
  payload: unknown;
};

/** `typeof null === "object"`: hay que excluir null explícitamente antes de confiar en el objeto. */
export function isUnifiedNeuralExercise(row: unknown): row is UnifiedNeuralExercise {
  if (row === null || typeof row !== "object" || Array.isArray(row)) return false;
  const r = row as Partial<UnifiedNeuralExercise>;
  return (
    typeof r.key === "string" &&
    r.key.length > 0 &&
    typeof r.origin === "string" &&
    typeof r.bytesApprox === "number" &&
    Number.isFinite(r.bytesApprox)
  );
}

function approxBytes(obj: unknown): number {
  try {
    return new Blob([JSON.stringify(obj)]).size;
  } catch {
    return 0;
  }
}

export function readPromoVaultExercises(): UnifiedNeuralExercise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_PROMO_VAULT) || '{"exercises":[]}',
    ) as { exercises?: unknown[] };
    const list = (Array.isArray(raw.exercises) ? raw.exercises : []).filter(
      (ex): ex is Record<string, unknown> =>
        ex !== null && ex !== undefined && typeof ex === "object" && !Array.isArray(ex),
    );
    return list.map((ex: any, i: number) => {
      const meta = ex.metadata || {};
      const title =
        typeof meta.title === "string" && meta.title.trim()
          ? meta.title
          : `Sandbox ${String(ex.block || "?").toUpperCase()} #${i + 1}`;
      return {
        key: `promo-${ex.id ?? i}`,
        origin: "sandbox_promo" as const,
        title,
        subtitle: "Pizarra promo / sandbox",
        stage: meta.stage,
        dimension: meta.dimension,
        block: typeof ex.block === "string" ? ex.block : undefined,
        bytesApprox: approxBytes(ex),
        createdAt: ex.savedAt,
        payload: ex,
      };
    });
  } catch {
    return [];
  }
}

export function readMethodologyNeural(): UnifiedNeuralExercise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_METHODOLOGY_NEURAL) || "[]",
    ) as unknown[];
    const list = (Array.isArray(raw) ? raw : []).filter(
      (ex): ex is Record<string, unknown> =>
        ex !== null && ex !== undefined && typeof ex === "object" && !Array.isArray(ex),
    );
    return list.map((ex: any, i: number) => ({
      key: `meth-${ex.id ?? i}`,
      origin: "methodology_local" as const,
      title: ex.title || `Metodología #${i + 1}`,
      subtitle: "Biblioteca metodológica (local)",
      stage: ex.stage,
      dimension: ex.dimension,
      bytesApprox: approxBytes(ex),
      createdAt: ex.savedAt,
      payload: ex,
    }));
  } catch {
    return [];
  }
}

export function readTrainingNeural(): UnifiedNeuralExercise[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_TRAINING_NEURAL) || '{"exercises":[]}',
    ) as { exercises?: unknown[] };
    const list = (Array.isArray(raw.exercises) ? raw.exercises : []).filter(
      (ex): ex is Record<string, unknown> =>
        ex !== null && ex !== undefined && typeof ex === "object" && !Array.isArray(ex),
    );
    return list.map((ex: any, i: number) => {
      const meta = ex.metadata || {};
      const title =
        typeof meta.title === "string" && meta.title.trim()
          ? meta.title
          : `Training #${i + 1}`;
      return {
        key: `train-${ex.id ?? i}`,
        origin: "training_studio" as const,
        title,
        subtitle: "Diseño élite / board training",
        stage: meta.stage,
        dimension: meta.dimension,
        bytesApprox: approxBytes(ex),
        createdAt: ex.savedAt,
        payload: ex,
      };
    });
  } catch {
    return [];
  }
}

export type RemoteNeuralRow = {
  id: string;
  club_id: string;
  author_id: string;
  title: string;
  stage?: string | null;
  dimension?: string | null;
  objective?: string | null;
  description?: string | null;
  payload_json: string | null;
  created_at?: string | null;
  club?: { name: string; country: string; sport?: string | null } | null;
};

export function sanitizeRemoteNeuralRows(raw: unknown): RemoteNeuralRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (r): r is RemoteNeuralRow =>
      r !== null &&
      typeof r === "object" &&
      !Array.isArray(r) &&
      typeof (r as RemoteNeuralRow).id === "string" &&
      Boolean((r as RemoteNeuralRow).id?.length),
  );
}

export function mapRemoteToUnified(r: RemoteNeuralRow | null | undefined): UnifiedNeuralExercise | null {
  if (r == null || typeof r.id !== "string" || !r.id) {
    return null;
  }
  let parsed: unknown = null;
  if (r.payload_json) {
    try {
      parsed = JSON.parse(r.payload_json) as unknown;
    } catch {
      parsed = { raw: r.payload_json };
    }
  }
  const club = r.club;
  return {
    key: `sb-${r.id}`,
    origin: "supabase",
    title: r.title != null && String(r.title).trim() !== "" ? String(r.title) : "(sin título)",
    subtitle: "Red central (Postgres)",
    clubLabel: club?.name,
    country: club?.country,
    sport: club?.sport ?? undefined,
    stage: r.stage ?? undefined,
    dimension: r.dimension ?? undefined,
    bytesApprox: approxBytes(parsed ?? r.payload_json ?? {}),
    createdAt: r.created_at ?? undefined,
    payload: {
      id: r.id,
      club_id: r.club_id,
      author_id: r.author_id,
      objective: r.objective,
      description: r.description,
      payload: parsed,
    },
  };
}
