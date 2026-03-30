"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { useAuth } from "@/lib/auth-context";

function resolveSafeNext(raw: string | null): string {
  const candidate = (raw || "").trim();
  if (!candidate) return "/sandbox/app";
  if (!candidate.startsWith("/")) return "/sandbox/app";
  if (candidate.startsWith("//")) return "/sandbox/app";
  return candidate;
}

export default function SandboxLoginPage() {
  // Next.js 15 requiere Suspense para `useSearchParams()` en algunas rutas.
  return (
    <Suspense fallback={null}>
      <SandboxLoginPageInner />
    </Suspense>
  );
}

function SandboxLoginPageInner() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const next = resolveSafeNext(sp.get("next"));
  const encodedNext = encodeURIComponent(next);

  useEffect(() => {
    if (loading) return;
    if (profile) router.replace(next);
  }, [loading, profile, router, next]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-black flex items-center justify-center px-6">
        <div className="text-primary font-black uppercase tracking-[0.6em] animate-pulse italic">
          Sincronizando_Acceso...
        </div>
      </main>
    );
  }

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
                  Login Sandbox
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                Acceso dedicado <span className="text-primary">SynqAI Sandbox</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl">
                Entrada optimizada para tablet y compatible con PC. Usa tu cuenta SynqAI para abrir la micro-app completa.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                className="h-12 sm:h-14 px-6 rounded-2xl bg-primary text-black font-black uppercase tracking-[0.18em] text-[11px] sm:text-xs"
                asChild
              >
                <Link href={`/login?next=${encodedNext}`}>
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 sm:h-14 px-6 rounded-2xl border-white/10 text-white/80 font-black uppercase tracking-[0.18em] text-[11px] sm:text-xs"
                asChild
              >
                <Link href="/sandbox-portal?dest=/sandbox/app">Volver al portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
