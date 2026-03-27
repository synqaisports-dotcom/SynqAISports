"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useClubAccessMatrixOptional } from "@/contexts/club-access-matrix-context";
import {
  canAccessClubModule,
  shouldBypassClubMatrix,
  type ClubModuleId,
} from "@/lib/club-permissions";

/**
 * Permisos de matriz para un módulo del club (tras cargar el contexto).
 * superadmin / club_admin: siempre todo true.
 */
export function useClubModulePermissions(moduleId: ClubModuleId) {
  const { profile } = useAuth();
  const ctx = useClubAccessMatrixOptional();
  const normalized = ctx?.normalizedMatrix;
  const loading = ctx?.loading ?? false;
  const role = profile?.role;

  return useMemo(() => {
    const bypass = shouldBypassClubMatrix(role);
    if (bypass) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        loading: false,
        bypass: true as const,
      };
    }
    if (!role) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        loading,
        bypass: false as const,
      };
    }
    const matrix = normalized ?? {};
    return {
      canView: canAccessClubModule(matrix, role, moduleId, "view"),
      canEdit: canAccessClubModule(matrix, role, moduleId, "edit"),
      canDelete: canAccessClubModule(matrix, role, moduleId, "delete"),
      loading,
      bypass: false as const,
    };
  }, [moduleId, normalized, role, loading]);
}
