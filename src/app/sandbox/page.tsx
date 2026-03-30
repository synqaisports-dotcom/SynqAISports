"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SandboxHomePage() {
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <div className="rounded-3xl border border-primary/20 bg-white/[0.02] p-6 sm:p-8 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Sandbox (Demo)</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Pizarra táctica <span className="text-primary">local-first</span>
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Acceso rápido para tablet/PC sin login. Datos guardados en tu dispositivo.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild className="h-12 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/board">Abrir Pizarra</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/smartwatch">Smartwatch</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest"
            >
              <Link href="/dashboard/mobile-continuity">Continuidad</Link>
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-white/5 bg-black/40 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
              Consejo
            </p>
            <p className="mt-1 text-xs text-white/70">
              En Android/Chrome puedes instalar esta micro‑app desde el banner de “Instalar”.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

