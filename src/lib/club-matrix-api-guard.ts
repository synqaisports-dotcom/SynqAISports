import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";
import type { VerifiedClubSession } from "@/lib/verify-club-session";
import {
  buildDefaultStaffAccessMatrix,
  normalizeStaffAccessMatrix,
  canAccessClubModule,
  shouldBypassClubMatrix,
  type ClubModuleId,
  type ModulePermState,
  type StaffAccessMatrix,
} from "@/lib/club-permissions";

function clientForUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient<Database>(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function loadNormalizedStaffMatrixForClub(
  clubId: string,
  token: string,
): Promise<StaffAccessMatrix | null> {
  const defaults = buildDefaultStaffAccessMatrix();
  const userClient = clientForUser(token);
  if (!userClient) return null;
  const { data, error } = await userClient
    .from("club_staff_access_matrices")
    .select("payload")
    .eq("club_id", clubId)
    .maybeSingle();
  if (error) return null;
  return normalizeStaffAccessMatrix((data?.payload ?? {}) as StaffAccessMatrix, defaults);
}

type GateOk = Extract<VerifiedClubSession, { ok: true }>;

/** null = permitido; si no, respuesta 403 lista para devolver. */
export async function guardClubModuleOr403(
  gate: GateOk,
  token: string,
  moduleId: ClubModuleId,
  level: keyof ModulePermState,
): Promise<NextResponse | null> {
  if (shouldBypassClubMatrix(gate.role)) return null;
  if (!gate.clubId) {
    return NextResponse.json({ error: "club_id requerido" }, { status: 403 });
  }
  const matrix = await loadNormalizedStaffMatrixForClub(gate.clubId, token);
  if (!matrix) {
    return NextResponse.json(
      { error: "No se pudo validar la matriz de permisos del club" },
      { status: 503 },
    );
  }
  if (!canAccessClubModule(matrix, gate.role, moduleId, level)) {
    return NextResponse.json(
      { error: "Permiso denegado según la matriz de acceso del club" },
      { status: 403 },
    );
  }
  return null;
}
