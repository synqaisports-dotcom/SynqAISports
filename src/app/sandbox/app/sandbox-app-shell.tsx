"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";

function titleForPath(pathname: string): string {
  if (pathname === "/sandbox/app") return "Inicio";
  if (pathname.startsWith("/sandbox/app/team")) return "Mi equipo";
  if (pathname.startsWith("/sandbox/app/tasks")) return "Mis tareas";
  if (pathname.startsWith("/sandbox/app/sessions")) return "Agenda";
  if (pathname.startsWith("/sandbox/app/matches")) return "Mis partidos";
  if (pathname.startsWith("/sandbox/app/stats")) return "Estadísticas";
  if (pathname.startsWith("/sandbox/app/collaboration")) return "Colaboración";
  if (pathname.startsWith("/sandbox/app/watch-config")) return "Config Watch";
  if (pathname.startsWith("/sandbox/app/mobile-continuity")) return "Modo continuidad";
  if (pathname.startsWith("/sandbox/app/board/promo")) return "Pizarra Promo";
  if (pathname.startsWith("/sandbox/app/board/match")) return "Pizarra Partido";
  return "Sandbox";
}

export function SandboxAppShell(props: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/sandbox/app";

  const sectionTitle = useMemo(() => titleForPath(pathname), [pathname]);
  const showBack = pathname !== "/sandbox/app";
  const isCommandHubHome = pathname === "/sandbox/app";

  return (
    <div className="min-h-[100dvh] bg-[#050812] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />

      {!isCommandHubHome ? (
      <header className="sticky top-0 z-[80] px-3 sm:px-5 lg:px-6 pt-3">
        <div className="w-full rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-2xl px-3 sm:px-4 py-2.5 shadow-[0_0_15px_rgba(6,182,212,0.1),0_10px_30px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 sm:mr-3">
              <SynqAiSportsLogo compact />
            </div>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 rounded-none border-white/10 bg-slate-900/50 text-white/80 font-black uppercase text-[10px] tracking-widest hover:border-cyan-400/30 hover:text-cyan-200 transition-colors",
                !showBack && "opacity-50 pointer-events-none",
              )}
              onClick={() => {
                // Volver atrás del navegador; si no hay historial, caer a home.
                try {
                  router.back();
                  window.setTimeout(() => {
                    if ((window.location?.pathname || "").startsWith("/sandbox/app")) return;
                    router.replace("/sandbox/app");
                  }, 250);
                } catch {
                  router.replace("/sandbox/app");
                }
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-10 rounded-none border-white/10 bg-slate-900/50 text-white/80 font-black uppercase text-[10px] tracking-widest hover:border-cyan-400/30 hover:text-cyan-200 transition-colors"
            >
              <Link href="/sandbox/app">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Link>
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-none border border-white/10 bg-slate-900/40 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-200/80">
                  Sandbox
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Sección</p>
                <p className="text-sm font-black uppercase tracking-tight text-white">{sectionTitle}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      ) : null}

      <div className={cn("w-full", !isCommandHubHome && "px-3 sm:px-5 lg:px-6")}>
        <div className={cn(!isCommandHubHome && "py-4 sm:py-6")}>
          <div
            className={cn(
              !isCommandHubHome &&
                "rounded-none border border-white/10 bg-gradient-to-b from-[#050812]/98 to-[#050812]/95 shadow-[0_0_15px_rgba(6,182,212,0.08),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm",
            )}
          >
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

