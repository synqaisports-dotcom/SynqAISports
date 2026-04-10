"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Script from "next/script";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  LogOut,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { synqSync } from "@/lib/sync-service";

type SandboxMetrics = {
  starters: number;
  exercises: number;
  activeField: string;
};

type PromoMatch = {
  id?: number | string;
  date?: string;
  rivalName?: string;
  location?: string;
  status?: string;
  score?: { home?: number; guest?: number };
};

type PromoSession = {
  id?: number | string;
  title?: string;
  createdAt?: string;
};

type HomeMiniStats = {
  wins: number;
  goalsFor: number;
  goalsAgainst: number;
};

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ?? "";
const ADSENSE_SLOT_H = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_HORIZONTAL ?? "";

function SurfaceCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.5)] overflow-hidden",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SurfaceHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80 truncate">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 truncate">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

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

function PlayerDataChart({ wins, goalsFor, goalsAgainst }: HomeMiniStats) {
  const data = useMemo(() => {
    const base = Math.max(1, wins + goalsFor + goalsAgainst);
    return Array.from({ length: 14 }).map((_, i) => {
      const t = i;
      const waveA = Math.sin(t / 2.1) * 18 + (goalsFor / Math.max(1, base)) * 40;
      const waveB = Math.cos(t / 1.7) * 14 + (goalsAgainst / Math.max(1, base)) * 35;
      const waveC = Math.sin(t / 3 + 1) * 22 + wins * 6;
      return {
        t: String(t).padStart(2, "0"),
        a: Math.max(4, 40 + waveA + i * 1.2),
        b: Math.max(4, 35 + waveB - i * 0.6),
        c: Math.max(4, 32 + waveC * 0.35 + (i % 4) * 3),
      };
    });
  }, [wins, goalsFor, goalsAgainst]);

  return (
    <SurfaceCard className="relative min-h-[220px]">
      <DigitalGrain />
      <SurfaceHeader title="PLAYER DATA" subtitle="Señales compuestas · tiempo de sesión" />
      <div className="relative p-3 sm:p-4 h-[240px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="pdA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pdB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pdC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "rgba(148,163,184,0.65)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={["dataMin - 8", "dataMax + 12"]} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0,
                fontSize: 11,
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area type="monotone" dataKey="a" stroke="#22d3ee" strokeWidth={1.6} fill="url(#pdA)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="b" stroke="#38bdf8" strokeWidth={1.4} fill="url(#pdB)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="c" stroke="#0ea5e9" strokeWidth={1.2} fill="url(#pdC)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

function AnalysisBarsChart({ exercises, starters }: { exercises: number; starters: number }) {
  const data = useMemo(() => {
    const e = Math.max(1, exercises);
    const s = Math.max(1, starters);
    return [
      { name: "E1", v: Math.min(100, 22 + (e % 7) * 9) },
      { name: "E2", v: Math.min(100, 35 + (s % 5) * 11) },
      { name: "E3", v: Math.min(100, 48 + (e % 4) * 8) },
      { name: "E4", v: Math.min(100, 30 + (s % 6) * 7) },
      { name: "E5", v: Math.min(100, 55 + (e % 3) * 10) },
      { name: "E6", v: Math.min(100, 40 + (s % 4) * 9) },
      { name: "E7", v: Math.min(100, 62 + (e % 5) * 6) },
    ];
  }, [exercises, starters]);

  return (
    <SurfaceCard className="relative min-h-[220px]">
      <DigitalGrain />
      <SurfaceHeader title="ANALYSIS" subtitle="Distribución vertical · brillo en punta" />
      <div className="relative p-3 sm:p-4 h-[240px] sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }} barCategoryGap="28%">
            <defs>
              <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: "rgba(148,163,184,0.55)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: "rgba(34,211,238,0.06)" }}
              contentStyle={{
                background: "rgba(15,23,42,0.92)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 0,
                fontSize: 11,
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
              }}
            />
            <Bar dataKey="v" radius={[0, 0, 0, 0]} barSize={8} filter="url(#barGlow)">
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i % 2 === 0 ? "#22d3ee" : "#38bdf8"}
                  style={{ filter: "drop-shadow(0 -6px 10px rgba(34,211,238,0.85))" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SurfaceCard>
  );
}

function TacticalBoardFrame() {
  return (
    <SurfaceCard className="relative flex flex-col min-h-[320px] xl:min-h-[520px] h-full">
      <DigitalGrain />
      <SurfaceHeader title="TACTICAL BOARD" subtitle="Vista previa · operación en vivo" />
      <div className="relative flex-1 p-4 flex flex-col">
        <div className="relative flex-1 min-h-[260px] border border-white/10 bg-slate-950/40 overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.45)]">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#052e16",
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px),
                radial-gradient(ellipse at center, rgba(34,197,94,0.25) 0%, transparent 65%)
              `,
              backgroundSize: "14px 14px, 14px 14px, 100% 100%",
            }}
          />
          <div className="absolute inset-4 border border-cyan-400/25 rounded-none shadow-[0_0_40px_rgba(34,211,238,0.12)]" />
          <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/15 -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 border border-white/25 bg-emerald-950/50 rotate-45 shadow-[0_0_24px_rgba(16,185,129,0.25)]" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/10" />
          <p className="absolute bottom-3 left-4 text-[9px] font-black uppercase tracking-[0.35em] text-emerald-200/70">
            Grid fino · césped neón
          </p>
        </div>
        <Button
          asChild
          className="mt-4 h-14 rounded-none bg-cyan-500 text-black font-black uppercase text-xs tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.8)] hover:bg-cyan-400"
        >
          <Link href="/sandbox/app/board/match?source=sandbox">Entrar a la pizarra</Link>
        </Button>
      </div>
    </SurfaceCard>
  );
}

function FloatingMetric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <SurfaceCard className="relative">
      <div className="relative px-4 py-4">
        <p className="text-[9px] font-black uppercase tracking-[0.32em] text-white/45">{label}</p>
        <p className="mt-2 font-technic text-4xl sm:text-5xl font-bold tabular-nums text-cyan-400 leading-none drop-shadow-[0_0_14px_rgba(34,211,238,0.75)]">
          {value}
        </p>
      </div>
    </SurfaceCard>
  );
}

function NeonActionButton({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button
      asChild
      className="h-16 w-full rounded-none bg-cyan-500 text-black font-black uppercase text-[11px] tracking-widest shadow-[0_0_25px_rgba(6,182,212,0.8)] hover:bg-cyan-400 justify-between px-5"
    >
      <Link href={href}>
        <span className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          {label}
        </span>
        <ChevronRight className="h-5 w-5 opacity-80" />
      </Link>
    </Button>
  );
}

function SandboxHomeAdPanel() {
  const adRef = useRef<HTMLDivElement | null>(null);
  const refreshIntervalRef = useRef<number | null>(null);

  const pushAd = () => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    const w = window as unknown as { adsbygoogle?: unknown[] };
    if (!w.adsbygoogle) return;
    try {
      w.adsbygoogle.push({});
      synqSync.trackEvent("ad_impression", {
        app_slug: "sandbox-coach",
        source: "sandbox",
        placement: "sandbox_home_horizontal",
        format: "horizontal",
      });
    } catch {
      // noop
    }
  };

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_H) return;
    if (!adRef.current) return;

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
    <SurfaceCard className="relative">
      {isConfigured ? (
        <Script
          id="sandbox-home-adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
        />
      ) : null}

      <SurfaceHeader
        title="MONETIZACIÓN"
        subtitle={isConfigured ? "Panel activo" : "Demo (configura .env)"}
        right={<Sparkles className="h-4 w-4 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
      />

      <div className="p-4">
        <div
          className={cn(
            "min-h-14 w-full overflow-hidden border border-white/10 bg-black/35",
            !isConfigured && "border-dashed",
          )}
        >
          {isConfigured ? (
            <div
              ref={adRef}
              onClick={() =>
                synqSync.trackEvent("ad_click", {
                  app_slug: "sandbox-coach",
                  source: "sandbox",
                  placement: "sandbox_home_horizontal",
                  format: "horizontal",
                })
              }
            >
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
            <div className="h-14 w-full flex items-center justify-center text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200/70">
              NEXT_PUBLIC_GOOGLE_ADSENSE_*
            </div>
          )}
        </div>
      </div>
    </SurfaceCard>
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
    <SurfaceCard>
      <SurfaceHeader title="PRÓXIMOS PARTIDOS" subtitle="3 siguientes" right={<Swords className="h-4 w-4 text-cyan-300" />} />

      <div className="p-4 space-y-3">
        {rows.map((m, idx) => {
          const isPending = !m || !m.date || !m.rivalName || !m.location;
          const location = (m?.location || "").toLowerCase().includes("visit") ? "Fuera" : m?.location ? "Casa" : "Pendiente";
          const dateLabel = m?.date ? m.date : "—";
          const rivalLabel = m?.rivalName ? m.rivalName : "Configurar";
          return (
            <div
              key={idx}
              className={cn(
                "rounded-none border border-white/10 bg-black/30 px-3 py-2.5 flex items-center justify-between gap-3",
                isPending && "border-dashed border-white/20",
              )}
            >
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-white/40">{isPending ? "Pendiente" : location}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-tight text-white truncate">VS {rivalLabel}</p>
              </div>
              <div className="shrink-0 text-right font-technic text-[11px] text-cyan-200/90">{dateLabel}</div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
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
    <SurfaceCard>
      <SurfaceHeader title="AGENDA" subtitle="Próximos 3" right={<CalendarDays className="h-4 w-4 text-cyan-300" />} />

      <div className="p-4 space-y-3">
        {slots.map((s, idx) => {
          const isPending = !s;
          const title = s?.title?.trim() ? s!.title!.toUpperCase() : "SIN EVENTO";
          const dateLabel = s?.createdAt ? s.createdAt : "—";
          return (
            <div
              key={idx}
              className={cn(
                "rounded-none border border-white/10 bg-black/30 px-3 py-2.5 flex items-center justify-between gap-3",
                isPending && "border-dashed border-white/20",
              )}
            >
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-white/40">
                  {isPending ? "Pendiente" : "EVENTO"}
                </p>
                <p className="mt-1 text-xs font-black uppercase tracking-tight text-white truncate">{title}</p>
              </div>
              <div className="shrink-0 text-right font-technic text-[11px] text-cyan-200/90">{dateLabel}</div>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
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
      { href: "/sandbox/app/team", label: "Mi equipo", icon: Users },
      { href: "/sandbox/app/tasks", label: "Mis tareas", icon: ClipboardList },
      { href: "/sandbox/app/sessions", label: "Agenda", icon: CalendarDays },
      { href: "/sandbox/app/matches", label: "Mis partidos", icon: Swords },
      { href: "/sandbox/app/stats", label: "Estadísticas", icon: BarChart3 },
      { href: "/sandbox/app/mobile-continuity", label: "Modo continuidad", icon: Gauge },
    ],
    [],
  );

  return (
    <main className="relative animate-in fade-in duration-700 p-4 sm:p-6 lg:p-8 text-white bg-[#020617]">
      <DigitalGrain />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 pb-4 lg:pb-6 border-b border-white/10">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-300/90">SANDBOX COACH · PANEL</p>
          <h1 className="text-2xl sm:text-3xl font-headline font-black tracking-tight text-white">
            Control táctico <span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.55)]">operativo</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Réplica de estilo tablet · datos reales desde almacenamiento local{profile?.email ? ` · ${profile.email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl px-3 py-2">
            <SynqAiSportsLogo compact />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-none border-white/10 bg-slate-900/50 text-white/90 font-black uppercase text-[10px] tracking-widest hover:border-cyan-400/40 hover:text-cyan-200"
            onClick={async () => {
              await logout();
              router.replace("/sandbox/login?next=/sandbox/app");
            }}
          >
            <LogOut className="h-4 w-4 mr-2 text-cyan-400" />
            Salir
          </Button>
        </div>
      </div>

      <div className="relative mt-4 lg:mt-6 grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
        <div className="xl:col-span-7 space-y-4 lg:space-y-6">
          <PlayerDataChart {...miniStats} />
        </div>
        <div className="xl:col-span-5 space-y-4 lg:space-y-6">
          <AnalysisBarsChart exercises={metrics.exercises} starters={metrics.starters} />
        </div>

        <div className="xl:col-span-7 space-y-4 lg:space-y-6 xl:row-start-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <FloatingMetric label="Victorias" value={miniStats.wins} />
            <FloatingMetric label="Goles +" value={miniStats.goalsFor} />
            <FloatingMetric label="Goles −" value={miniStats.goalsAgainst} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <FloatingMetric label="Titulares" value={metrics.starters} />
            <FloatingMetric label="Ejercicios" value={metrics.exercises} />
            <FloatingMetric label="Campo" value={<span className="text-3xl sm:text-4xl">{metrics.activeField}</span>} />
          </div>
          <SandboxHomeAdPanel />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <UpcomingAgendaPanel />
            <UpcomingMatchesPanel />
          </div>
        </div>

        <div className="xl:col-span-5 xl:row-start-2 xl:row-span-2 flex">
          <div className="flex-1 min-w-0 w-full max-w-full xl:max-w-[40vw] xl:ml-auto">
            <TacticalBoardFrame />
          </div>
        </div>

        <div className="xl:col-span-12 xl:row-start-4 space-y-4 lg:space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Acciones</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {accessItems.map((item) => (
              <NeonActionButton key={item.href} href={item.href} label={item.label} icon={item.icon} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
