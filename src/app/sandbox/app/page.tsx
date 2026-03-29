"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function SandboxAppHomePage() {
  const { profile } = useAuth();
  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <div className="rounded-3xl border border-primary/20 bg-white/[0.02] p-6 sm:p-8 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Sandbox (Micro‑app)</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Terminal completa <span className="text-primary">logueada</span>
          </h1>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            Bienvenido{profile?.name ? `, ${profile.name}` : ""}. Aquí tienes todas las funcionalidades del Sandbox
            (equipo, tareas, agenda, partidos, stats) dentro del scope de la micro‑app.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button asChild className="h-12 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/team">Mi equipo</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/tasks">Mis tareas</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/sessions">Agenda</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/matches">Mis partidos</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/stats">Estadísticas</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest">
              <Link href="/sandbox/app/mobile-continuity">Modo continuidad</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

