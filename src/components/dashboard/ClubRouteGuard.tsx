"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  canAccessClubModule,
  resolveClubModuleForPath,
  shouldBypassClubMatrix,
} from "@/lib/club-permissions";
import { useClubAccessMatrixOptional } from "@/contexts/club-access-matrix-context";

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-12 text-center space-y-6">
      <ShieldAlert className="h-16 w-16 text-amber-500" />
      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Acceso restringido</h2>
      <p className="text-white/40 font-bold uppercase text-[10px] tracking-widest max-w-md">
        Su rol no tiene permiso de acceso a esta área según la matriz del club. Contacte con la administración.
      </p>
      <Link
        href="/dashboard"
        className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
      >
        Volver al hub del club
      </Link>
    </div>
  );
}

/**
 * Bloquea rutas del dashboard según la matriz de módulos (después de cargar).
 * superadmin y club_admin ignoran la matriz.
 */
export function ClubRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading: authLoading } = useAuth();
  const ctx = useClubAccessMatrixOptional();
  const loading = ctx?.loading ?? false;
  const normalizedMatrix = ctx?.normalizedMatrix;

  const moduleIdEarly = resolveClubModuleForPath(pathname);
  const waitForMatrix =
    !!moduleIdEarly &&
    !shouldBypassClubMatrix(profile?.role) &&
    !(profile?.plan === "free" || profile?.role === "promo_coach");

  if (authLoading || (waitForMatrix && ctx && loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Cargando permisos…</p>
      </div>
    );
  }

  if (pathname.includes("/coach/onboarding")) {
    return <>{children}</>;
  }

  if (shouldBypassClubMatrix(profile?.role)) {
    return <>{children}</>;
  }

  const isFree = profile?.plan === "free" || profile?.role === "promo_coach";
  if (isFree && pathname.startsWith("/dashboard/promo")) {
    return <>{children}</>;
  }
  if (isFree) {
    return <>{children}</>;
  }

  if (!ctx || !normalizedMatrix) {
    return <>{children}</>;
  }

  const moduleId = resolveClubModuleForPath(pathname);
  if (!moduleId) {
    return <>{children}</>;
  }

  if (!canAccessClubModule(normalizedMatrix, profile?.role, moduleId, "access")) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
