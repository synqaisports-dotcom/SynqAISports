"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";
import {
  buildDefaultStaffAccessMatrix,
  normalizeStaffAccessMatrix,
  STAFF_ACCESS_MATRIX_PREFIX,
  type StaffAccessMatrix,
} from "@/lib/club-permissions";

type ClubAccessMatrixContextValue = {
  /** Matriz normalizada (solo roles en ROLES_TO_MANAGE). */
  normalizedMatrix: StaffAccessMatrix;
  /** Copia en edición / cruda local. */
  rawMatrix: StaffAccessMatrix;
  loading: boolean;
  refetch: () => Promise<void>;
  buildDefaultMatrix: StaffAccessMatrix;
};

const ClubAccessMatrixContext = createContext<ClubAccessMatrixContextValue | null>(null);

export function ClubAccessMatrixProvider({ children }: { children: React.ReactNode }) {
  const { profile, session } = useAuth();
  const clubScopeId = profile?.clubId ?? "";
  const buildDefaultMatrix = useMemo(() => buildDefaultStaffAccessMatrix(), []);
  const [rawMatrix, setRawMatrix] = useState<StaffAccessMatrix>({});
  const [loading, setLoading] = useState(true);

  const canFetchRemote =
    canUseOperativaSupabase(clubScopeId) &&
    !!session?.access_token &&
    !["superadmin"].includes(profile?.role ?? "");

  const storageKey = `${STAFF_ACCESS_MATRIX_PREFIX}_${clubScopeId}`;

  const load = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (profile?.role === "superadmin" || !clubScopeId || clubScopeId === "global") {
      setRawMatrix({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (canFetchRemote && session?.access_token) {
        try {
          const res = await fetch("/api/club/staff-access-matrix", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const json = (await res.json()) as { ok?: boolean; payload?: StaffAccessMatrix };
            const payload = json?.payload;
            if (payload && typeof payload === "object") {
              const normalized = normalizeStaffAccessMatrix(payload, buildDefaultMatrix);
              setRawMatrix(normalized);
              try {
                localStorage.setItem(storageKey, JSON.stringify(normalized));
              } catch {
                /* ignore */
              }
              setLoading(false);
              return;
            }
          }
        } catch {
          /* fallback local */
        }
      }

      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setRawMatrix(buildDefaultMatrix);
        setLoading(false);
        return;
      }
      const parsed = JSON.parse(raw) as StaffAccessMatrix;
      setRawMatrix(normalizeStaffAccessMatrix(parsed, buildDefaultMatrix));
    } catch {
      setRawMatrix(buildDefaultMatrix);
    } finally {
      setLoading(false);
    }
  }, [
    profile?.role,
    clubScopeId,
    canFetchRemote,
    session?.access_token,
    buildDefaultMatrix,
    storageKey,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const normalizedMatrix = useMemo(
    () => normalizeStaffAccessMatrix(rawMatrix, buildDefaultMatrix),
    [rawMatrix, buildDefaultMatrix]
  );

  const value = useMemo<ClubAccessMatrixContextValue>(
    () => ({
      normalizedMatrix,
      rawMatrix,
      loading,
      refetch: load,
      buildDefaultMatrix,
    }),
    [normalizedMatrix, rawMatrix, loading, load, buildDefaultMatrix]
  );

  return <ClubAccessMatrixContext.Provider value={value}>{children}</ClubAccessMatrixContext.Provider>;
}

export function useClubAccessMatrix(): ClubAccessMatrixContextValue {
  const ctx = useContext(ClubAccessMatrixContext);
  if (!ctx) {
    throw new Error("useClubAccessMatrix debe usarse dentro de ClubAccessMatrixProvider");
  }
  return ctx;
}

/** Para páginas que pueden montarse fuera del provider (p. ej. tests). */
export function useClubAccessMatrixOptional(): ClubAccessMatrixContextValue | null {
  return useContext(ClubAccessMatrixContext);
}
