"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SANDBOX_APP_ROOT } from "@/lib/sandbox-routes";
import { inputProClass } from "@/app/dashboard/promo/command-hub-ui";

const DEEP_NIGHT = "#0F172A";
const ELECTRIC_CYAN = "#00F2FF";

const GLASS_PANEL =
  "rounded-none border border-[#00F2FF]/20 bg-slate-900/45 backdrop-blur-xl shadow-[0_0_30px_rgba(0,242,255,0.15)]";

function DigitalGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      aria-hidden
    />
  );
}

/** Campo táctico cenital: muy sutil (marca de agua ~5–8%). */
function TacticalFieldWatermark() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ opacity: 0.075 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 400 260"
        className="min-h-[70%] min-w-[120%] max-w-none text-[#00F2FF]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="sfGrass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="384" height="244" rx="4" fill="url(#sfGrass)" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35" />
        <line x1="200" y1="8" x2="200" y2="252" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="200" cy="130" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
        <circle cx="200" cy="130" r="3" fill="currentColor" fillOpacity="0.45" />
        <rect x="8" y="98" width="48" height="64" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.32" />
        <rect x="344" y="98" width="48" height="64" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.32" />
        <line x1="8" y1="130" x2="56" y2="130" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.28" />
        <line x1="344" y1="130" x2="392" y2="130" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.28" />
      </svg>
    </div>
  );
}

/** Destellos / líneas de fuga en cian eléctrico. */
function CyanVelocityStreaks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -left-1/4 top-[15%] h-[2px] w-[150%] origin-center rotate-[12deg] opacity-50"
        style={{
          background: `linear-gradient(90deg, transparent, ${ELECTRIC_CYAN}55, transparent)`,
          boxShadow: `0 0 24px ${ELECTRIC_CYAN}66`,
        }}
      />
      <div
        className="absolute -right-1/4 bottom-[22%] h-px w-[140%] origin-center -rotate-[8deg] opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${ELECTRIC_CYAN}44, transparent)`,
          boxShadow: `0 0 20px ${ELECTRIC_CYAN}55`,
        }}
      />
      <div
        className="absolute left-[10%] top-1/2 h-[120%] w-px -translate-y-1/2 rotate-[18deg] opacity-30"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${ELECTRIC_CYAN}55 45%, transparent 100%)`,
        }}
      />
      <div
        className="absolute right-[18%] top-0 h-full w-px rotate-[-14deg] opacity-25"
        style={{
          background: `linear-gradient(180deg, transparent 10%, ${ELECTRIC_CYAN}44 50%, transparent 90%)`,
        }}
      />
    </div>
  );
}

function resolveSafeNext(raw: string | null): string {
  const candidate = (raw || "").trim();
  if (!candidate) return SANDBOX_APP_ROOT;
  if (!candidate.startsWith("/")) return SANDBOX_APP_ROOT;
  if (candidate.startsWith("//")) return SANDBOX_APP_ROOT;
  return candidate;
}

function simpleEmailOk(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
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
    <main
      className="relative min-h-[100dvh] overflow-hidden text-white sandbox-theme flex items-center justify-center"
      style={{ backgroundColor: DEEP_NIGHT }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
      <DigitalGrain />
      <Loader2
        className="relative z-10 h-10 w-10 animate-spin"
        style={{ color: ELECTRIC_CYAN, filter: "drop-shadow(0 0 14px rgba(0,242,255,0.6))" }}
      />
    </main>
  );
}

function SandboxLoginPageInner() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const sp = useSearchParams();
  const next = resolveSafeNext(sp.get("next"));
  const encodedNext = encodeURIComponent(next);

  const [clubName, setClubName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leadOk, setLeadOk] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (profile) router.replace(next);
  }, [loading, profile, router, next]);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName.trim() || !country.trim() || !city.trim() || !address.trim() || !email.trim()) {
      toast({ variant: "destructive", title: "Datos incompletos", description: "Completa todos los campos." });
      return;
    }
    if (!simpleEmailOk(email)) {
      toast({ variant: "destructive", title: "Email no válido", description: "Introduce un correo válido (ID único)." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/sandbox/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubName: clubName.trim(),
          country: country.trim(),
          city: city.trim(),
          address: address.trim(),
          email: email.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; accepted?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo registrar",
          description: data.error || "Intenta de nuevo más tarde.",
        });
        setSubmitting(false);
        return;
      }
      setLeadOk(true);
      toast({
        title: "Terminal preactivada",
        description:
          data.accepted === false
            ? "Lead guardado en este dispositivo. Continúa con tu cuenta."
            : "Registro recibido. Continúa con tu cuenta SynqAI.",
      });
      try {
        localStorage.setItem(
          "synq_sandbox_terminal_lead_v1",
          JSON.stringify({
            clubName: clubName.trim(),
            country: country.trim(),
            city: city.trim(),
            address: address.trim(),
            email: email.trim().toLowerCase(),
            at: new Date().toISOString(),
          }),
        );
      } catch {
        /* noop */
      }
    } catch {
      toast({ variant: "destructive", title: "Error de red", description: "Comprueba la conexión." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <SandboxLoginFallback />;
  }

  const oauthHref = `/login?next=${encodedNext}`;

  return (
    <main
      className="relative min-h-[100dvh] overflow-hidden text-white sandbox-theme"
      style={{ backgroundColor: DEEP_NIGHT }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none" />
      <TacticalFieldWatermark />
      <CyanVelocityStreaks />
      <DigitalGrain />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
        <div className={cn(GLASS_PANEL, "overflow-hidden")}>
          <div
            className="border-b border-[#00F2FF]/15 px-5 py-4 sm:px-6 sm:py-5"
            style={{
              background: "linear-gradient(90deg, rgba(0,242,255,0.12) 0%, transparent 55%)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.38em]" style={{ color: `${ELECTRIC_CYAN}cc` }}>
                  Terminal sandbox
                </p>
                <h1 className="font-headline text-2xl font-black uppercase tracking-tight text-white sm:text-3xl leading-tight">
                  Enciende el{" "}
                  <span
                    className="text-[#00F2FF]"
                    style={{ textShadow: "0 0 28px rgba(0,242,255,0.85), 0 0 60px rgba(0,242,255,0.35)" }}
                  >
                    motor táctico
                  </span>
                </h1>
                <p className="text-sm leading-relaxed text-slate-400">
                  Registro del club e identidad de acceso. Después, vincula tu cuenta SynqAI para abrir el Command Hub.
                </p>
              </div>
              <Zap className="h-8 w-8 shrink-0 text-[#00F2FF] opacity-90" style={{ filter: "drop-shadow(0 0 12px rgba(0,242,255,0.7))" }} />
            </div>
          </div>

          <form onSubmit={submitLead} className="space-y-4 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4 mb-1">
              <SynqAiSportsLogo size="md" className="shrink-0" />
              <div className="rounded-none border border-[#00F2FF]/25 bg-[#00F2FF]/10 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#00F2FF]" style={{ filter: "drop-shadow(0 0 8px rgba(0,242,255,0.55))" }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/95">Acceso terminal</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-200/75">Nombre del club</Label>
              <Input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="EJ: CLUB ATLÉTICO NORTE"
                autoComplete="organization"
                className={cn(inputProClass, "h-11 placeholder:normal-case")}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-200/75">País</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="PAÍS"
                  autoComplete="country-name"
                  className={cn(inputProClass, "h-11")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-200/75">Ciudad</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="CIUDAD"
                  autoComplete="address-level2"
                  className={cn(inputProClass, "h-11")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-200/75">Dirección</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="CALLE, NÚMERO, CP"
                autoComplete="street-address"
                className={cn(inputProClass, "h-11 placeholder:normal-case")}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-200/75">Email (ID único)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTRENADOR@CLUB.COM"
                autoComplete="email"
                className={cn(inputProClass, "h-11 placeholder:normal-case")}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 h-14 w-full rounded-none border-0 bg-[#00F2FF] text-black font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_0_40px_rgba(0,242,255,0.85),0_0_80px_rgba(0,242,255,0.35)] hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(0,242,255,0.95)] disabled:opacity-60"
            >
              {submitting ? "Procesando…" : "Activar terminal sandbox"}
            </Button>

            {leadOk ? (
              <Button
                type="button"
                className="h-12 w-full rounded-none border border-[#00F2FF]/40 bg-slate-950/60 text-[#00F2FF] font-black uppercase text-[10px] tracking-widest hover:bg-[#00F2FF]/10"
                asChild
              >
                <Link href={oauthHref}>Continuar con cuenta SynqAI</Link>
              </Button>
            ) : (
              <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest pt-1">
                ¿Ya tienes cuenta?{" "}
                <Link href={oauthHref} className="text-[#00F2FF] font-black hover:underline underline-offset-4">
                  Entrar ahora
                </Link>
              </p>
            )}

            <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-600 pt-1">
              Tras vincular cuenta → <span className="font-mono text-cyan-600/80">{next}</span>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
