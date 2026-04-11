"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const PANEL_OUTER =
  "drop-shadow-[0_0_15px_rgba(6,182,212,0.1)] shadow-[0_18px_60px_rgba(0,0,0,0.5)]";

function DigitalGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

/** Campo visto como reflejo / gota: verdes profundos + núcleo cian (brillo húmedo). */
function FieldWaterDropBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Masa del “campo” bajo la gota */}
      <div
        className="absolute left-1/2 top-[12%] h-[min(78vh,640px)] w-[min(125vw,820px)] -translate-x-1/2 rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse 52% 58% at 50% 48%, rgba(6,78,59,0.45) 0%, rgba(15,118,110,0.22) 38%, rgba(6,182,212,0.08) 55%, transparent 72%)",
        }}
      />
      {/* Gota / condensación cian (highlight) */}
      <div
        className="absolute left-[42%] top-[20%] h-[min(42vh,280px)] w-[min(55vw,340px)] -translate-x-1/2 rounded-[50%] blur-[1px]"
        style={{
          background:
            "radial-gradient(ellipse 48% 52% at 45% 38%, rgba(34,211,238,0.38) 0%, rgba(6,182,212,0.14) 42%, transparent 68%)",
        }}
      />
      {/* Líneas de campo muy suaves (horizontal + mediana) */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: [
            "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.15) 50%, transparent 100%)",
            "repeating-linear-gradient(0deg, transparent 0px, transparent 48px, rgba(34,211,238,0.12) 48px, rgba(34,211,238,0.12) 49px)",
          ].join(", "),
          backgroundSize: "100% 100%, 100% 100%",
          backgroundPosition: "center, center",
        }}
      />
      <div
        className="absolute left-1/2 top-[38%] h-px w-[min(88vw,720px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
        style={{ boxShadow: "0 0 24px rgba(34,211,238,0.25)" }}
      />
    </div>
  );
}

function resolveSafeNext(raw: string | null): string {
  const candidate = (raw || "").trim();
  if (!candidate) return "/sandbox/app";
  if (!candidate.startsWith("/")) return "/sandbox/app";
  if (candidate.startsWith("//")) return "/sandbox/app";
  return candidate;
}

export default function SandboxLoginPage() {
  return (
    <Suspense fallback={<SandboxLoginFallback />}>
      <SandboxLoginPageInner />
    </Suspense>
  );
}

function SandboxLoginFallback() {
  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#050812] text-white sandbox-theme flex items-center justify-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />
      <DigitalGrain />
      <Loader2 className="relative z-10 h-10 w-10 text-cyan-400 animate-spin drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
    </main>
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
    return <SandboxLoginFallback />;
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#050812] text-white sandbox-theme">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />
      <FieldWaterDropBackdrop />
      <DigitalGrain />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-4 py-10 sm:px-6">
        <div
          className={cn(
            "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden",
            PANEL_OUTER,
          )}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.38em] text-cyan-300/90">Terminal sandbox</p>
            <h1 className="mt-2 font-headline text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
              Acceso{" "}
              <span className="text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.85)]">operativo</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Entra con tu cuenta SynqAI para abrir el Command Hub. Sesión cifrada; datos locales en tu dispositivo.
            </p>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:items-start">
              <SynqAiSportsLogo size="lg" className="shrink-0" />
              <div className="rounded-none border border-cyan-400/25 bg-cyan-500/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/90">Login seguro</span>
                </div>
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-none border-0 bg-cyan-500 text-black font-black uppercase text-[11px] tracking-widest shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:bg-cyan-400 hover:shadow-[0_0_36px_rgba(34,211,238,0.75)]"
              asChild
            >
              <Link href={`/login?next=${encodedNext}`}>
                Iniciar sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-600">
              Tras el login volverás a <span className="text-cyan-500/80 font-mono">{next}</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
