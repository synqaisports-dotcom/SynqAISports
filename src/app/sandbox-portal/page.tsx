"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SandboxPortalPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    if (loading) return;

    // Si está logueado, entra al Sandbox completo (dashboard/promo).
    if (profile) {
      const dest = sp.get("dest") || "/dashboard/promo/team";
      router.replace(dest);
      return;
    }

    // Si no está logueado, fuerza login con retorno.
    const next = encodeURIComponent(pathname + (sp?.toString() ? `?${sp.toString()}` : ""));
    router.replace(`/login?next=${next}`);
  }, [loading, profile, router, pathname, sp]);

  return (
    <main className="min-h-[100dvh] bg-background flex items-center justify-center px-6">
      <div className="text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">Sincronizando_Sandbox...</div>
    </main>
  );
}

