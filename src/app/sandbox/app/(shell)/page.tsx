"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  ShieldCheck,
  LogOut,
  Swords,
  Trophy,
  Zap,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type SandboxMetrics = {
  starters: number;
  exercises: number;
  activeField: string;
};

type PromoMatch = {
  id?: number | string;
  date?: string;
  rivalName?: string;
  location?: string; // "Local" | "Visitante"
  status?: string; // "Scheduled" | "Played" | ...
  score?: { home?: number; guest?: number };
};

type PromoSession = {
  id?: number | string;
  title?: string;
  createdAt?: string; // YYYY-MM-DD
};

type HomeMiniStats = {
  wins: number;
  goalsFor: number;
  goalsAgainst: number;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "";
const ADSENSE_SLOT_H = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HORIZONTAL ?? "";

function SandboxHomeAdPanel() {
  const adRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const pushAd = () => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    const w = window as unknown as { adsbygoogle?: unknown[] };
    if (!w.adsbygoogle) return;
    try {
      w.adsbygoogle.push({});
    } catch {
      // noop
    }
  };

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    if (!adRef.current) return;

    // First push (wait a bit for script)
    let tries = 0;
    const maxTries = 40;
    const t = window.setInterval(() => {
      tries += 1;
      const w = window as unknown as { adsbygoogle?: unknown[] };
      if (!w.adsbygoogle) {
        if (tries >= maxTries) window.clearInterval(t);
        return;
      }
      pushAd();
      window.clearInterval(t);
    }, 150);

    // Auto-refresh: recreate <ins> and push again.
    refreshIntervalRef.current = window.setInterval(() => {
      if (!adRef.current) return;
      adRef.current.innerHTML = "";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", ADSENSE_CLIENT);
      ins.setAttribute("data-ad-slot", ADSENSE_SLOT_H);
      ins.setAttribute("data-ad-format", "horizontal");
      ins.setAttribute("data-full-width-responsive", "true");
      adRef.current.appendChild(ins);
      pushAd();
    }, 25000);

    return () => {
      window.clearInterval(t);
      if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
    };
  }, []);

  const isConfigured = !!(ADSENSE_CLIENT && ADSENSE_SLOT_H);

  return (
    <section className="rounded-3xl border border-primary/20 bg-black/35 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden">
      {isConfigured ? (
        <Script
          id="sandbox-home-adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
        />
      ) : null}

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">AdMob / Ads</p>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
          {isConfigured ? "Panel activo" : "Demo (configura .env)"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div
          className={cn(
            "min-h-16 w-full rounded-2xl overflow-hidden border border-primary/20 bg-black/40",
            !isConfigured && "border-dashed",
          )}
        >
          {isConfigured ? (
            <div ref={adRef}>
              <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={ADSENSE_SLOT_H}
                data-ad-format="horizontal"
                data-full-width-responsive="true"
              />
            </div>
          ) : (
            <div className="h-16 w-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">
              Slot demo (NEXT_PUBLIC_GOOGLE_ADSENSE_*)
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function parseMatchDate(value: string | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}

function UpcomingMatchesPanel() {
  const [nextMatches, setNextMatches] = useState<PromoMatch[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { matches: [] });
    const matchesRaw: PromoMatch[] = Array.isArray(vault?.matches) ? vault.matches : [];
    const now = Date.now();
    const normalized = matchesRaw
      .map((m) => ({ ...m, _t: parseMatchDate(m.date) }))
      .filter((m: any) => typeof m._t === "number" && m._t >= (now - 24 * 60 * 60 * 1000));

    normalized.sort((a: any, b: any) => (a._t ?? 0) - (b._t ?? 0));
    setNextMatches(normalized.slice(0, 3).map(({ _t, ...rest }: any) => rest));
  }, []);

  const rows = Array.from({ length: 3 }).map((_, i) => nextMatches[i] || null);

  return (
    <section className="rounded-3xl border border-primary/20 bg-black/35 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">Próximos partidos</p>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">3 siguientes</span>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {rows.map((m, idx) => {
          const isPending = !m || !m.date || !m.rivalName || !m.location;
          const location = (m?.location || "").toLowerCase().includes("visit") ? "Fuera" : (m?.location ? "Casa" : "Pendiente");
          const dateLabel = m?.date ? m.date : "Pendiente de configurar";
          const rivalLabel = m?.rivalName ? m.rivalName : "Pendiente de configurar";
          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border border-primary/15 bg-black/40 px-4 py-3 flex items-center justify-between gap-4",
                isPending && "border-dashed",
              )}
            >
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35">
                  {isPending ? "Pendiente" : location}
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-tight text-white truncate">
                  VS {rivalLabel}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Fecha</p>
                <p className="text-[11px] font-black text-white/70">{dateLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function UpcomingAgendaPanel() {
  const [sessions, setSessions] = useState<PromoSession[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { sessions: [] });
    const raw: PromoSession[] = Array.isArray(vault?.sessions) ? vault.sessions : [];
    const next = [...raw]
      .filter((s) => s && (s.title || s.createdAt))
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : Number.POSITIVE_INFINITY;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : Number.POSITIVE_INFINITY;
        return ta - tb;
      })
      .slice(0, 3);
    setSessions(next);
  }, []);

  const slots = Array.from({ length: 3 }).map((_, i) => sessions[i] ?? null);

  return (
    <section className="rounded-3xl border border-primary/20 bg-black/35 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">Agenda</p>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Próximos 3 eventos</span>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {slots.map((s, idx) => {
          const isPending = !s;
          const title = s?.title?.trim() ? s!.title!.toUpperCase() : "PENDIENTE_DE_CONFIGURAR";
          const dateLabel = s?.createdAt ? s.createdAt : "PENDIENTE";
          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border border-primary/15 bg-black/40 px-4 py-3 flex items-center justify-between gap-4",
                isPending && "border-dashed",
              )}
            >
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/35">
                  {isPending ? "Pendiente" : `Evento_${String(s?.id ?? "").slice(-4) || `0${idx + 1}`}`}
                </p>
                <p className="mt-1 text-sm font-black uppercase tracking-tight text-white truncate">{title}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70">Fecha</p>
                <p className="text-[11px] font-black text-white/70">{dateLabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

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
  const [miniStats, setMiniStats] = useState<HomeMiniStats>({
    wins: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const team = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
    const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { exercises: [], matches: [], sessions: [] });
    const starters = Array.isArray(team?.starters)
      ? team.starters.filter((name: string) => name?.trim?.() !== "").length
      : 0;
    const exercises = Array.isArray(vault?.exercises) ? vault.exercises.length : 0;
    const activeField = String(team?.type || "f11").toUpperCase();
    setMetrics({ starters, exercises, activeField });

    const matches: PromoMatch[] = Array.isArray(vault?.matches) ? vault.matches : [];
    const played = matches.filter((m) => (m.status || "").toLowerCase() === "played");
    const wins = played.filter((m) => (m.score?.home || 0) > (m.score?.guest || 0)).length;
    const goalsFor = played.reduce((acc, m) => acc + (m.score?.home || 0), 0);
    const goalsAgainst = played.reduce((acc, m) => acc + (m.score?.guest || 0), 0);
    setMiniStats({ wins, goalsFor, goalsAgainst });
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
        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 w-fit">
              <SynqAiSportsLogo compact />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-rose-300/20 bg-black/30 text-rose-200/90 font-black uppercase text-[10px] tracking-widest hover:border-rose-300/40 hover:text-rose-100 transition-colors"
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
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <div className="rounded-3xl border border-primary/20 bg-black/35 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">Sandbox (Micro‑app)</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Terminal completa <span className="text-primary">logueada</span>
              </h2>
            </div>
            <div className="p-4 sm:p-5">
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Victorias</p>
                    <p className="mt-1 text-2xl font-black text-primary italic leading-none">{miniStats.wins}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Goles a favor</p>
                    <p className="mt-1 text-2xl font-black text-white italic leading-none">{miniStats.goalsFor}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/40">Goles en contra</p>
                    <p className="mt-1 text-2xl font-black text-white italic leading-none">{miniStats.goalsAgainst}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </div>

          <UpcomingAgendaPanel />
        </div>

        <div className="space-y-6">
          <SandboxHomeAdPanel />
          <UpcomingMatchesPanel />
        </div>
      </div>
    </main>
  );
}

