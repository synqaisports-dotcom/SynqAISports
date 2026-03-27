import type {
  OperativaAssignmentRow,
  OperativaChangeRequestRow,
} from "@/lib/operativa-sync";

export type UiSessionPlannerAssignment = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: "warmup" | "central" | "cooldown";
  exerciseKey?: string;
  exerciseTitle?: string;
  updatedAt?: string;
};

export type UiSessionPlannerRequest = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: "warmup" | "central" | "cooldown";
  original?: string;
  proposed: string;
  reason: string;
  status: "Pending" | "Approved" | "Denied";
  coach: string;
  createdAt: string;
  directorComment?: string;
  processedAt?: string;
};

export function mapOperativaAssignmentsToUi(
  rows: OperativaAssignmentRow[],
): UiSessionPlannerAssignment[] {
  return rows.map((row) => ({
    id: row.id,
    teamId: row.teamId,
    mcc: row.mcc,
    session: row.session,
    blockKey: row.blockKey,
    exerciseKey: row.exerciseKey,
    exerciseTitle: row.exerciseTitle,
    updatedAt: row.updatedAt,
  }));
}

export function mapOperativaRequestsToUi(
  rows: OperativaChangeRequestRow[],
): UiSessionPlannerRequest[] {
  return rows.map((row) => ({
    id: row.id,
    teamId: row.teamId,
    mcc: row.mcc,
    session: row.session,
    blockKey: row.blockKey,
    original: row.original,
    proposed: row.proposed,
    reason: row.reason,
    status: row.status,
    coach: row.coach,
    createdAt: row.createdAt,
    directorComment: row.directorComment,
    processedAt: row.processedAt,
  }));
}
