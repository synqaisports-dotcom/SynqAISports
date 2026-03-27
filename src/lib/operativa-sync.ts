import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type OperativaBlockKey = "warmup" | "central" | "cooldown";
export type OperativaRequestStatus = "Pending" | "Approved" | "Denied";
export type OperativaAttendanceStatus = "present" | "absent" | "late";

export type OperativaAssignmentRow = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: OperativaBlockKey;
  exerciseKey?: string;
  exerciseTitle: string;
  updatedAt?: string;
};

export type OperativaChangeRequestRow = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: OperativaBlockKey;
  original?: string;
  proposed: string;
  reason: string;
  status: OperativaRequestStatus;
  coach: string;
  createdAt: string;
  directorComment?: string;
  processedAt?: string;
};

export function isUuidLike(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function canUseOperativaSupabase(clubId: string | null | undefined): clubId is string {
  return isSupabaseConfigured && !!supabase && isUuidLike(clubId);
}

export async function fetchOperativaAssignments(clubId: string): Promise<OperativaAssignmentRow[]> {
  if (!canUseOperativaSupabase(clubId) || !supabase) return [];
  const { data, error } = await supabase
    .from("methodology_session_assignments")
    .select("*")
    .eq("club_id", clubId)
    .order("updated_at", { ascending: false })
    .limit(1000);
  if (error || !Array.isArray(data)) return [];
  return data.map((row: any) => ({
    id: String(row.id),
    teamId: String(row.team_id),
    mcc: String(row.mcc),
    session: String(row.session),
    blockKey: row.block_key as OperativaBlockKey,
    exerciseKey: row.exercise_key ? String(row.exercise_key) : undefined,
    exerciseTitle: String(row.exercise_title ?? ""),
    updatedAt: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

export async function fetchOperativaChangeRequests(clubId: string): Promise<OperativaChangeRequestRow[]> {
  if (!canUseOperativaSupabase(clubId) || !supabase) return [];
  const { data, error } = await supabase
    .from("methodology_change_requests")
    .select("*")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false })
    .limit(400);
  if (error || !Array.isArray(data)) return [];
  return data.map((row: any) => ({
    id: String(row.id),
    teamId: String(row.team_id),
    mcc: String(row.mcc),
    session: String(row.session),
    blockKey: row.block_key as OperativaBlockKey,
    original: row.original_exercise ? String(row.original_exercise) : undefined,
    proposed: String(row.proposed_exercise ?? ""),
    reason: String(row.reason ?? ""),
    status: (row.status as OperativaRequestStatus) ?? "Pending",
    coach: String(row.coach_name ?? "Coach"),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    directorComment: row.director_comment ? String(row.director_comment) : undefined,
    processedAt: row.processed_at ? String(row.processed_at) : undefined,
  }));
}

export async function fetchOperativaAttendance(clubId: string): Promise<Record<string, Record<string, string>>> {
  if (!canUseOperativaSupabase(clubId) || !supabase) return {};
  const { data, error } = await supabase
    .from("methodology_session_attendance")
    .select("*")
    .eq("club_id", clubId)
    .order("updated_at", { ascending: false })
    .limit(6000);
  if (error || !Array.isArray(data)) return {};
  const out: Record<string, Record<string, string>> = {};
  data.forEach((row: any) => {
    const key = `${String(row.team_id)}_${String(row.mcc)}_S${String(row.session)}`;
    if (!out[key]) out[key] = {};
    out[key][String(row.player_id)] = String(row.status);
  });
  return out;
}

export async function upsertOperativaAttendance(args: {
  clubId: string;
  teamId: string;
  mcc: string;
  session: string;
  playerId: string;
  status: OperativaAttendanceStatus;
  updatedBy?: string | null;
}) {
  if (!canUseOperativaSupabase(args.clubId) || !supabase) return;
  await supabase.from("methodology_session_attendance").upsert(
    {
      club_id: args.clubId,
      team_id: args.teamId,
      mcc: args.mcc,
      session: args.session,
      player_id: args.playerId,
      status: args.status,
      updated_by: args.updatedBy ?? null,
    },
    { onConflict: "club_id,team_id,mcc,session,player_id" },
  );
}

export async function upsertOperativaAssignment(args: {
  clubId: string;
  id?: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: OperativaBlockKey;
  exerciseKey?: string;
  exerciseTitle: string;
  updatedBy?: string | null;
}) {
  if (!canUseOperativaSupabase(args.clubId) || !supabase) return;
  await supabase.from("methodology_session_assignments").upsert(
    {
      id: args.id && isUuidLike(args.id) ? args.id : undefined,
      club_id: args.clubId,
      team_id: args.teamId,
      mcc: args.mcc,
      session: args.session,
      block_key: args.blockKey,
      exercise_key: args.exerciseKey ?? null,
      exercise_title: args.exerciseTitle,
      source: "planner",
      updated_by: args.updatedBy ?? null,
    },
    { onConflict: "club_id,team_id,mcc,session,block_key" },
  );
}

export async function deleteOperativaAssignment(args: {
  clubId: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: OperativaBlockKey;
}) {
  if (!canUseOperativaSupabase(args.clubId) || !supabase) return;
  await supabase
    .from("methodology_session_assignments")
    .delete()
    .eq("club_id", args.clubId)
    .eq("team_id", args.teamId)
    .eq("mcc", args.mcc)
    .eq("session", args.session)
    .eq("block_key", args.blockKey);
}

export async function upsertOperativaChangeRequest(args: {
  id: string;
  clubId: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: OperativaBlockKey;
  originalExercise: string;
  proposedExercise: string;
  reason: string;
  coachId?: string | null;
  coachName?: string | null;
  originalExerciseKey?: string | null;
  proposedExerciseKey?: string | null;
}) {
  if (!canUseOperativaSupabase(args.clubId) || !supabase || !isUuidLike(args.id)) return;
  await supabase.from("methodology_change_requests").upsert(
    {
      id: args.id,
      club_id: args.clubId,
      team_id: args.teamId,
      mcc: args.mcc,
      session: args.session,
      block_key: args.blockKey,
      original_exercise_key: args.originalExerciseKey ?? null,
      original_exercise: args.originalExercise,
      proposed_exercise_key: args.proposedExerciseKey ?? null,
      proposed_exercise: args.proposedExercise,
      reason: args.reason,
      status: "Pending",
      coach_id: args.coachId ?? null,
      coach_name: args.coachName ?? null,
    },
    { onConflict: "id" },
  );
}

export async function updateOperativaChangeRequestDecision(args: {
  clubId: string;
  id: string;
  status: "Approved" | "Denied";
  directorComment?: string;
  directorId?: string | null;
}) {
  if (!canUseOperativaSupabase(args.clubId) || !supabase || !isUuidLike(args.id)) return;
  await supabase
    .from("methodology_change_requests")
    .update({
      status: args.status,
      director_comment: args.directorComment?.trim() || null,
      processed_at: new Date().toISOString(),
      director_id: args.directorId ?? null,
    })
    .eq("id", args.id)
    .eq("club_id", args.clubId);
}
