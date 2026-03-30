"use client";

import { useCallback, useMemo } from "react";
import {
  canUseOperativaSupabase,
  fetchOperativaAssignments,
  fetchOperativaAttendance,
  fetchOperativaChangeRequests,
  type OperativaAssignmentRow,
  type OperativaChangeRequestRow,
} from "@/lib/operativa-sync";

export type OperativaSnapshot = {
  assignments: OperativaAssignmentRow[];
  requests: OperativaChangeRequestRow[];
  attendance: Record<string, Record<string, string>>;
};

export function useOperativaSync(clubId: string) {
  const canUseSupabase = useMemo(() => canUseOperativaSupabase(clubId), [clubId]);

  const loadSnapshot = useCallback(async (): Promise<OperativaSnapshot> => {
    if (!canUseSupabase) {
      return { assignments: [], requests: [], attendance: {} };
    }
    const [assignments, requests, attendance] = await Promise.all([
      fetchOperativaAssignments(clubId),
      fetchOperativaChangeRequests(clubId),
      fetchOperativaAttendance(clubId),
    ]);
    return { assignments, requests, attendance };
  }, [canUseSupabase, clubId]);

  return {
    canUseSupabase,
    loadSnapshot,
  };
}
