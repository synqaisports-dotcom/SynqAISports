"use client";

import { Suspense } from "react";
import PromoBoardPage from "@/app/board/promo/page";

export default function SandboxBoardPage() {
  // Reutilizamos la pizarra promo en el scope /sandbox.
  // La pizarra ya es local-first (localStorage) y detecta perf-lite.
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-black text-primary font-black uppercase tracking-[0.5em] animate-pulse">Cargando_Sandbox...</div>}>
      <PromoBoardPage />
    </Suspense>
  );
}

