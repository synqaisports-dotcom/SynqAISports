"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  LogOut,
  Swords,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  SANDBOX_APP_BOARD_ROOT,
  SANDBOX_APP_ROOT,
  sandboxAppHref,
  sandboxLoginHref,
} from "@/lib/sandbox-routes";

const NAV = [
  { href: sandboxAppHref(""), label: "Command hub", icon: LayoutDashboard },
  { href: sandboxAppHref("/team"), label: "Mi equipo", icon: Users },
  { href: sandboxAppHref("/tasks"), label: "Mis tareas", icon: ClipboardList },
  { href: sandboxAppHref("/sessions"), label: "Agenda", icon: CalendarDays },
  { href: sandboxAppHref("/matches"), label: "Mis partidos", icon: Swords },
  { href: sandboxAppHref("/stats"), label: "Estadísticas", icon: BarChart3 },
  { href: sandboxAppHref("/mobile-continuity"), label: "Continuidad", icon: Gauge },
] as const;

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

function ImmersionNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-3 py-3 border border-white/10 bg-slate-900/50 backdrop-blur-xl transition-all",
        "drop-shadow-[0_0_15px_rgba(6,182,212,0.1)] shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        "hover:bg-slate-900/70 hover:border-white/15",
        active && "border-cyan-400/20 bg-slate-900/65 text-cyan-100",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]" : "text-cyan-200/70",
        )}
      />
      <span
        className={cn(
          "text-[9px] font-black uppercase tracking-[0.22em] leading-tight",
          active ? "text-cyan-100" : "text-white/75 group-hover:text-cyan-100/90",
        )}
      >
        {label}
      </span>
      <ChevronRight className={cn("ml-auto h-4 w-4 shrink-0 opacity-40", active && "text-cyan-300 opacity-70")} />
    </Link>
  );
}

function sectionHeading(pathname: string): { kicker: string; title: string; subtitle: string } {
  if (pathname === SANDBOX_APP_ROOT) {
    return {
      kicker: "TERMINAL SANDBOX",
      title: "Control táctico operativo",
      subtitle: "Réplica de estilo tablet · datos reales desde almacenamiento local",
    };
  }
  if (pathname.startsWith(sandboxAppHref("/team"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Mi equipo", subtitle: "Titulares, suplentes y configuración de campo." };
  }
  if (pathname.startsWith(sandboxAppHref("/tasks"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Mis tareas", subtitle: "Seguimiento operativo del día a día." };
  }
  if (pathname.startsWith(sandboxAppHref("/sessions"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Agenda", subtitle: "Sesiones y eventos planificados." };
  }
  if (pathname.startsWith(sandboxAppHref("/matches"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Mis partidos", subtitle: "Calendario y preparación táctica." };
  }
  if (pathname.startsWith(sandboxAppHref("/stats"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Estadísticas", subtitle: "Lectura rápida de rendimiento." };
  }
  if (pathname.startsWith(sandboxAppHref("/mobile-continuity"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Modo continuidad", subtitle: "Flujo móvil y uso en campo." };
  }
  if (pathname.startsWith(sandboxAppHref("/watch-config"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Config Watch", subtitle: "Emparejamiento y ajustes del reloj." };
  }
  if (pathname.startsWith(sandboxAppHref("/collaboration"))) {
    return { kicker: "TERMINAL SANDBOX", title: "Colaboración", subtitle: "Trabajo compartido en sandbox." };
  }
  if (pathname.startsWith(`${SANDBOX_APP_BOARD_ROOT}/promo`)) {
    return { kicker: "TERMINAL SANDBOX", title: "Pizarra promo", subtitle: "Tablero táctico de promoción." };
  }
  if (pathname.startsWith(`${SANDBOX_APP_BOARD_ROOT}/match`)) {
    return { kicker: "TERMINAL SANDBOX", title: "Pizarra partido", subtitle: "Operación en vivo del encuentro." };
  }
  return { kicker: "TERMINAL SANDBOX", title: "Sandbox", subtitle: "Micro-app operativa." };
}

const PANEL_OUTER = "drop-shadow-[0_0_15px_rgba(6,182,212,0.1)] shadow-[0_18px_60px_rgba(0,0,0,0.5)]";

export function SandboxCommandHubShell(props: { children: ReactNode }) {
  const pathname = usePathname() || SANDBOX_APP_ROOT;
  const router = useRouter();
  const { profile, logout } = useAuth();

  const isBoardFullscreen = pathname.startsWith(`${SANDBOX_APP_BOARD_ROOT}/`);
  const heading = useMemo(() => sectionHeading(pathname), [pathname]);

  if (isBoardFullscreen) {
    return <div className="min-h-[100dvh] bg-[#020408] text-white">{props.children}</div>;
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#050812] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />
      <DigitalGrain />

      <div className="relative flex flex-col lg:flex-row">
        <aside className="w-full lg:w-[220px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050812]/90 backdrop-blur-2xl p-3 lg:p-4 space-y-2 lg:min-h-[100dvh] lg:sticky lg:top-0 lg:self-start z-[60] drop-shadow-[0_0_15px_rgba(6,182,212,0.08)]">
          <p className="px-1 pb-2 text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/70">Navegación</p>
          {NAV.map((item) => {
            const active =
              item.href === SANDBOX_APP_ROOT
                ? pathname === SANDBOX_APP_ROOT
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <ImmersionNavLink key={item.href} {...item} active={active} />;
          })}
        </aside>

        <div className="flex-1 min-w-0 p-3 sm:p-4 lg:p-6">
          <section
            className={cn(
              "mb-4 lg:mb-6 rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl overflow-hidden",
              PANEL_OUTER,
            )}
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 lg:gap-6 px-4 py-4 lg:px-6 lg:py-5 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
              <div className="space-y-2 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.38em] text-cyan-300/90">{heading.kicker}</p>
                <h1 className="text-2xl sm:text-3xl font-headline font-black tracking-tight text-white uppercase">
                  {pathname === SANDBOX_APP_ROOT ? (
                    <>
                      Control táctico{" "}
                      <span className="text-cyan-300 drop-shadow-[0_0_32px_rgba(34,211,238,1)]">operativo</span>
                    </>
                  ) : (
                    <span className="text-cyan-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.85)]">{heading.title}</span>
                  )}
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">{heading.subtitle}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 xl:shrink-0">
                <div className="rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl px-4 py-3 min-w-0 drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/45">Perfil</p>
                  <p className="mt-1 text-xs font-semibold text-cyan-100/95 truncate max-w-[240px]">
                    {profile?.email ?? "Sesión activa"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl px-3 py-2 drop-shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                    <SynqAiSportsLogo compact />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-none border-white/10 bg-slate-900/50 text-white/90 font-black uppercase text-[10px] tracking-widest hover:border-cyan-400/30 hover:text-cyan-100 drop-shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                    onClick={async () => {
                      await logout();
                      router.replace(sandboxLoginHref(SANDBOX_APP_ROOT));
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2 text-cyan-400" />
                    Salir
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="rounded-none border border-white/10 bg-gradient-to-b from-[#050812]/98 to-[#050812]/95 shadow-[0_0_15px_rgba(6,182,212,0.08),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm p-3 sm:p-4 lg:p-5 min-h-[40vh]">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
