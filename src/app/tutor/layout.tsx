
"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Layout de la App de Tutores - v1.0.0
 * Restringe la visualización a un contenedor móvil centrado para PWA.
 */
export default function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04070c] flex justify-center font-body">
      <div className="w-full max-w-[500px] bg-[#020408] min-h-screen relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col border-x border-white/5">
        {children}
      </div>
    </div>
  );
}
