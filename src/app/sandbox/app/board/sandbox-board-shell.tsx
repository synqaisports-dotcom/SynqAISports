"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SandboxBoardShell(props: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <header className="fixed top-0 left-0 right-0 z-[300] border-b border-white/5 bg-black/40 backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[10px] tracking-widest"
              onClick={() => {
                try {
                  router.back();
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
              className="h-10 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[10px] tracking-widest"
            >
              <Link href="/sandbox/app">
                <Home className="h-4 w-4 mr-2" />
                Inicio
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-[64px]">{props.children}</div>
    </div>
  );
}

