"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  LogOut,
  ShieldCheck,
  Swords,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { useRouter } from "next/navigation";

type SandboxMetrics = {
  starters: number;
  exercises: number;
  activeField: string;
};

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function SandboxAppHomePage() {
  const { profile, logout } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SandboxMetrics>({
    starters: 0,
    exercises: 0,
    activeField: "F11",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const team = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
    const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { exercises: [] });
    const starters = Array.isArray(team?.starters)
      ? team.starters.filter((name: string) => name?.trim?.() !== "").length
      : 0;
    const exercises = Array.isArray(vault?.exercises) ? vault.exercises.length : 0;
    const activeField = String(team?.type || "f11").toUpperCase();
    setMetrics({ starters, exercises, activeField });
  }, []);

  const accessItems = useMemo(
    () => [
      { href: "/sandbox/app/team", label: "Mi equipo", icon: Users, tone: "primary" as const },
      { href: "/sandbox/app/tasks", label: "Mis tareas", icon: ClipboardList, tone: "dark" as const },
      { href: "/sandbox/app/sessions", label: "Agenda", icon: CalendarDays, tone: "dark" as const },
      { href: "/sandbox/app/matches", label: "Mis partidos", icon: Swords, tone: "dark" as const },
      { href: "/sandbox/app/stats", label: "Estadísticas", icon: Activity, tone: "dark" as const },
      { href: "/sandbox/app/mobile-continuity", label: "Modo continuidad", icon: Gauge, tone: "dark" as const },
    ],
    [],
  );

  return (
    <main className="space-y-8 animate-in fade-in duration-700 p-6 sm:p-8 lg:p-10 text-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-5 border-b border-primary/10 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.45em] uppercase italic">Sandbox_Home_v1.0</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-black text-white uppercase italic tracking-tighter leading-none">
            TERMINAL_<span className="text-primary">SANDBOX</span>
          </h1>
          <p className="text-[11px] font-black text-primary/40 tracking-[0.28em] uppercase">
            Nodo principal de acceso
          </p>
        </div>
        <div className="w-full lg:w-auto flex items-center gap-2">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 w-fit">
            <SynqAiSportsLogo compact />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-2xl border-rose-300/25 bg-rose-500/10 text-rose-200 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/20"
            onClick={async () => {
              await logout();
              router.replace("/sandbox/login?next=/sandbox/app");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-primary/20 bg-white/[0.02] p-5 sm:p-6 shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Sandbox (Micro‑app)</p>
        <h2 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
          Terminal completa <span className="text-primary">logueada</span>
        </h2>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          Bienvenido{profile?.name ? `, ${profile.name}` : ""}. Aquí tienes todas las funcionalidades del Sandbox dentro del scope de la micro‑app.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Titulares</p>
            <p className="mt-1 text-xl font-black text-primary">{metrics.starters}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Ejercicios</p>
            <p className="mt-1 text-xl font-black text-primary">{metrics.exercises}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Campo activo</p>
            <p className="mt-1 text-xl font-black text-primary">{metrics.activeField}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accessItems.map((item) => {
            const Icon = item.icon;
            const isPrimary = item.tone === "primary";
            return (
              <Button
                key={item.href}
                asChild
                variant={isPrimary ? "default" : "outline"}
                className={
                  isPrimary
                    ? "h-12 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-widest justify-between shadow-[0_0_24px_rgba(0,242,255,0.28)] hover:brightness-110 active:scale-[0.99]"
                    : "h-12 rounded-2xl border-primary/25 bg-black/45 text-white/90 font-black uppercase text-[11px] tracking-widest justify-between hover:border-primary/45 hover:bg-primary/10 hover:text-primary active:scale-[0.99]"
                }
              >
                <Link href={item.href}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

