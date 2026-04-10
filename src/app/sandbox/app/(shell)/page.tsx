"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  ShieldCheck,
  LogOut,
  Sparkles,
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

function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] overflow-hidden",
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
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200/70 truncate">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/35 truncate">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

function MiniBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values.map((v) => (Number.isFinite(v) ? v : 0)));
  return (
    <div className="flex items-end gap-1 h-8">
      {values.map((v, idx) => {
        const pct = Math.max(8, Math.min(100, Math.round((Math.max(0, v) / max) * 100)));
        return (
          <div
            key={idx}
            className="w-2 rounded-full bg-white/10 overflow-hidden border border-white/10"
            aria-hidden="true"
            title={`${v}`}
          >
            <div className="w-full rounded-full bg-cyan-400/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" style={{ height: `${pct}%` }} />
          </div>
        );
      })}
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  icon: Icon,
  bars,
}: {
  label: string;
  value: React.ReactNode;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  bars?: number[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_14px_50px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 truncate">{label}</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-3xl sm:text-4xl font-black text-cyan-400 italic leading-none drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]">
              {value}
            </p>
            {helper ? (
              <span className="pb-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/35">{helper}</span>
            ) : null}
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-white/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        </div>
      </div>
      {bars && bars.length ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">Tendencia</span>
          <MiniBars values={bars} />
        </div>
      ) : null}
    </div>
  );
}

function ActionTile({
  href,
  label,
  description,
  icon: Icon,
  tone,
}: {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "dark";
}) {
  const primary = tone === "primary";
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-2xl p-5 shadow-[0_14px_50px_rgba(0,0,0,0.45)] transition-all",
        "hover:border-cyan-300/30 hover:bg-slate-900/55 hover:shadow-[0_20px_70px_rgba(0,0,0,0.55)]",
        primary && "border-cyan-300/25 bg-gradient-to-br from-cyan-500/12 via-slate-900/45 to-slate-950/55",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/40">Acceso rápido</p>
          <p className="mt-2 text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-cyan-200 transition-colors">
            {label}
          </p>
          <p className="mt-2 text-sm text-gray-300/90 leading-relaxed">{description}</p>
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center",
            primary ? "bg-cyan-500/15" : "bg-white/5",
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]",
              primary ? "text-cyan-200" : "text-cyan-300/80",
            )}
          />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">
          Abrir módulo
        </span>
        <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-cyan-200 transition-colors" />
      </div>
    </Link>
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
    <SurfaceCard>
      {isConfigured ? (
        <Script
          id="sandbox-home-adsense"
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`}
        />
      ) : null}

      <SurfaceHeader
        title="Ads / Monetización"
        subtitle={isConfigured ? "Panel activo" : "Demo (configura .env)"}
        right={<Sparkles className="h-4 w-4 text-cyan-200/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
      />

      <div className="p-4 sm:p-5">
        <div
          className={cn(
            "min-h-16 w-full rounded-2xl overflow-hidden border border-white/10 bg-black/30",
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
            <div className="h-16 w-full flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/70">
              Slot demo (NEXT_PUBLIC_GOOGLE_ADSENSE_*)
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
      <SurfaceHeader title="Próximos partidos" subtitle="3 siguientes" right={<Swords className="h-4 w-4 text-cyan-200/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />} />

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
                "rounded-2xl border border-white/10 bg-black/25 px-4 py-3 flex items-center justify-between gap-4",
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
      <SurfaceHeader title="Agenda" subtitle="Próximos 3 eventos" right={<CalendarDays className="h-4 w-4 text-cyan-200/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />} />

      <div className="p-4 sm:p-5 space-y-3">
        {slots.map((s, idx) => {
          const isPending = !s;
          const title = s?.title?.trim() ? s!.title!.toUpperCase() : "PENDIENTE_DE_CONFIGURAR";
          const dateLabel = s?.createdAt ? s.createdAt : "PENDIENTE";
          return (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border border-white/10 bg-black/25 px-4 py-3 flex items-center justify-between gap-4",
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
      {
        href: "/sandbox/app/team",
        label: "Mi equipo",
        description: "Jugadores, roles y titulares. Configure su base en segundos.",
        icon: Users,
        tone: "primary" as const,
      },
      {
        href: "/sandbox/app/tasks",
        label: "Mis tareas",
        description: "Asignaciones rápidas y control diario de ejecución.",
        icon: ClipboardList,
        tone: "dark" as const,
      },
      {
        href: "/sandbox/app/sessions",
        label: "Agenda",
        description: "Sesiones y eventos. Planificación simple y directa.",
        icon: CalendarDays,
        tone: "dark" as const,
      },
      {
        href: "/sandbox/app/matches",
        label: "Mis partidos",
        description: "Partidos, resultados y preparación táctica.",
        icon: Swords,
        tone: "dark" as const,
      },
      {
        href: "/sandbox/app/stats",
        label: "Estadísticas",
        description: "KPIs base y lectura rápida del rendimiento.",
        icon: BarChart3,
        tone: "dark" as const,
      },
      {
        href: "/sandbox/app/mobile-continuity",
        label: "Modo continuidad",
        description: "Flujo rápido para móvil y uso en campo.",
        icon: Gauge,
        tone: "dark" as const,
      },
    ],
    [],
  );

  return (
    <main className="space-y-8 animate-in fade-in duration-700 p-6 sm:p-8 lg:p-10 text-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-cyan-200 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200/75">SANDBOX COACH</p>
              <p className="mt-1 text-xs text-gray-300/80">
                Sesión activa{profile?.email ? ` · ${profile.email}` : ""}
              </p>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-black text-white tracking-tight leading-none">
            Centro de mando <span className="text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]">operativo</span>
          </h1>
          <p className="text-gray-300/90 max-w-2xl">
            Acceso directo a equipo, planificación y rendimiento. Diseño rápido para operar en campo sin fricción.
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 w-fit backdrop-blur-xl">
              <SynqAiSportsLogo compact />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-white/15 bg-black/30 text-white/85 font-black uppercase text-[10px] tracking-widest hover:border-cyan-300/35 hover:bg-cyan-500/10 hover:text-cyan-100 transition-colors"
              onClick={async () => {
                await logout();
                router.replace("/sandbox/login?next=/sandbox/app");
              }}
            >
              <LogOut className="h-4 w-4 mr-2 text-cyan-200/80 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]" />
              Salir
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <SurfaceCard>
            <SurfaceHeader
              title="Resumen operativo"
              subtitle="KPIs y accesos rápidos"
              right={<Zap className="h-4 w-4 text-cyan-200/70 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />}
            />
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label="Victorias" value={miniStats.wins} helper="partidos jugados" icon={Trophy} bars={[1, 2, 3, 3, 4]} />
                <KpiCard label="Goles a favor" value={miniStats.goalsFor} helper="acumulado" icon={Zap} bars={[1, 2, 2, 3, 5]} />
                <KpiCard label="Goles en contra" value={miniStats.goalsAgainst} helper="acumulado" icon={Activity} bars={[1, 1, 2, 2, 3]} />
                <KpiCard
                  label="Base de trabajo"
                  value={metrics.exercises}
                  helper={`titulares ${metrics.starters} · ${metrics.activeField}`}
                  icon={BarChart3}
                  bars={[1, 2, 2, 4, Math.max(1, metrics.exercises)]}
                />
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {accessItems.slice(0, 2).map((item) => (
                  <ActionTile
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    description={item.description}
                    icon={item.icon}
                    tone={item.tone}
                  />
                ))}
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {accessItems.slice(2).map((item) => (
                  <ActionTile
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    description={item.description}
                    icon={item.icon}
                    tone={item.tone}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="rounded-3xl border border-white/10 bg-black/25 backdrop-blur-xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Modo</p>
                  <p className="mt-1 text-sm font-black uppercase tracking-tight text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                    Operativo · rápido
                  </p>
                </div>
                <Button
                  asChild
                  className="h-12 rounded-2xl bg-cyan-300 text-black font-black uppercase text-[11px] tracking-widest justify-center shadow-[0_0_24px_rgba(0,242,255,0.28)] hover:brightness-110 active:scale-[0.99]"
                >
                  <Link href="/sandbox/app/board/match?source=sandbox">
                    Abrir pizarra de partido
                  </Link>
                </Button>
              </div>
            </div>
          </SurfaceCard>

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

