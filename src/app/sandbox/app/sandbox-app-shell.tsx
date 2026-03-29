"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";
import { useAuth } from "@/lib/auth-context";

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
  const { logout } = useAuth();
  const pathname = usePathname() || "/sandbox/app";

  const sectionTitle = useMemo(() => titleForPath(pathname), [pathname]);
  const showBack = pathname !== "/sandbox/app";

  return (
    <div className="min-h-[100dvh] bg-[#040812] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-[80] border-b border-primary/10 bg-[#03070f]/85 backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="mr-1 sm:mr-3">
              <SynqAiSportsLogo compact />
            </div>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-10 rounded-2xl border-white/10 bg-black/30 text-white/80 font-black uppercase text-[10px] tracking-widest hover:border-primary/30 hover:text-primary transition-colors",
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
              className="h-10 rounded-2xl border-white/10 bg-black/30 text-white/80 font-black uppercase text-[10px] tracking-widest hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Link href="/sandbox/app">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl border-white/10 bg-black/30 text-white/80 font-black uppercase text-[10px] tracking-widest hover:border-rose-300/40 hover:text-rose-200 transition-colors"
              onClick={async () => {
                await logout();
                router.replace("/sandbox/login");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/70">
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

      <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-5 lg:px-6">
        <div className="py-4 sm:py-6">
          <div className="rounded-3xl border border-primary/15 bg-gradient-to-b from-[#0a1222]/90 to-[#050a14]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

