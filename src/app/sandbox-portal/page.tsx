"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";

export default function SandboxPortalPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    if (loading) return;

    // Si está logueado, entra al Sandbox completo dentro de la micro-app (/sandbox/app).
    if (profile) {
      const dest = sp.get("dest") || "/sandbox/app";
      router.replace(dest);
      return;
    }

  }, [loading, profile, router, pathname, sp]);

  const next = encodeURIComponent(pathname + (sp?.toString() ? `?${sp.toString()}` : ""));

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-black flex items-center justify-center px-6">
        <div className="text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">
          Sincronizando_Sandbox...
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-[100dvh] bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-10 md:py-12">
          <div className="rounded-3xl border border-primary/20 bg-white/[0.03] shadow-2xl p-6 sm:p-8 md:p-10">
            <div className="flex flex-col gap-6 md:gap-8">
              <SynqAiSportsLogo size="lg" />
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 w-fit">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.32em] text-primary/80">
                    Sandbox Portal
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                  Micro-app <span className="text-primary">tablet-first</span>
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
                  Accede a tu Sandbox completo con identidad SynqAI Sports. Optimizado para tablet, compatible con PC y listo para uso en campo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="h-12 sm:h-14 px-6 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.18em] text-[11px] sm:text-xs"
                  onClick={() => router.push(`/sandbox/login?next=${next}`)}
                >
                  Iniciar sesión Sandbox
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-black flex items-center justify-center px-6">
      <div className="text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">Sincronizando_Sandbox...</div>
    </main>
  );
}

