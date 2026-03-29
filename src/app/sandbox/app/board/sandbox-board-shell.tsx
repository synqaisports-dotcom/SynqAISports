"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SandboxBoardShell(props: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="h-[100dvh] w-full bg-[#020408] overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Botones flotantes: no empujan layout de la pizarra */}
      <div className="fixed top-4 left-4 z-[320] flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-2xl border-white/10 bg-black/60 backdrop-blur-2xl text-white/80 font-black uppercase text-[10px] tracking-widest"
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
          className="h-10 rounded-2xl border-white/10 bg-black/60 backdrop-blur-2xl text-white/80 font-black uppercase text-[10px] tracking-widest"
        >
          <Link href="/sandbox/app">
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Link>
        </Button>
      </div>

      <main className="h-full w-full relative z-10 flex flex-col overflow-hidden">
        {props.children}
      </main>
    </div>
  );
}

