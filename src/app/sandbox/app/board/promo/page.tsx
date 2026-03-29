"use client";

import { Suspense } from "react";
import PromoBoardPage from "@/app/board/promo/page";

export default function SandboxAppPromoBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-black text-primary font-black uppercase tracking-[0.5em] animate-pulse">
          Cargando_Pizarra_Promo...
        </div>
      }
    >
      <PromoBoardPage />
    </Suspense>
  );
}

