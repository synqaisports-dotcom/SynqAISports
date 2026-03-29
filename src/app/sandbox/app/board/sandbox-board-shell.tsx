"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { SynqAiSportsLogo } from "@/components/branding/SynqAiSportsLogo";

export function SandboxBoardShell(props: { children: ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <div className="h-[100dvh] w-full bg-[#020408] overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Barra global sandbox: visible en secciones board */}
      <div className="fixed top-4 left-4 right-4 z-[320]">
        <div className="mx-auto w-full max-w-[1200px] rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <SynqAiSportsLogo compact />
            <div className="ml-auto sm:ml-0 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-2xl border-white/10 bg-black/50 text-white/80 font-black uppercase text-[10px] tracking-widest"
          onClick={() => {
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
          className="h-10 rounded-2xl border-white/10 bg-black/50 text-white/80 font-black uppercase text-[10px] tracking-widest"
        >
          <Link href="/sandbox/app">
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Link>
        </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-rose-400/30 bg-rose-500/10 text-rose-200 hover:text-rose-100 font-black uppercase text-[10px] tracking-widest"
                onClick={async () => {
                  await logout();
                  router.push("/sandbox/login?next=/sandbox/app");
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
            <div className="ml-auto hidden md:flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/75">Sandbox</span>
            </div>
          </div>
        </div>
      </div>

      <main className="h-full w-full relative z-10 flex flex-col overflow-hidden pt-16">
        {props.children}
      </main>
    </div>
  );
}

