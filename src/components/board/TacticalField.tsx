
"use client";

import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";

interface TacticalFieldProps {
  sport?: string;
  theme?: "cyan" | "amber";
  showWatermark?: boolean;
  children?: React.ReactNode;
}

/**
 * TacticalField - Componente centralizado y responsivo.
 * Diseñado para escalar desde tablets hasta TV 4K manteniendo el aspect ratio.
 */
export function TacticalField({ sport = "football", theme = "cyan", showWatermark, children }: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/10" : "border-amber-500/10";
  const lineColor = theme === "cyan" ? "bg-white/10" : "bg-white/5";
  const borderLine = theme === "cyan" ? "border-white/10" : "border-white/5";

  return (
    <div className="w-full h-full flex items-center justify-center p-4 lg:p-8">
      <div className={cn(
        "relative w-full max-w-[95vw] max-h-[85vh] aspect-[1.6/1] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border transition-all duration-500",
        accentColor,
        theme === "cyan" ? "bg-[#0a0f18]" : "bg-black"
      )}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* LÍNEAS DEL CAMPO - Escaladas por porcentajes o posiciones relativas */}
        <div className={cn("absolute inset-[5%] border-2 rounded-sm", borderLine)}>
          <div className={cn("absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2", lineColor)} />
          <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] aspect-square border-2 rounded-full", borderLine)} />
          <div className={cn("absolute top-1/2 left-0 -translate-y-1/2 w-[15%] h-[60%] border-2 border-l-0", borderLine)} />
          <div className={cn("absolute top-1/2 right-0 -translate-y-1/2 w-[15%] h-[60%] border-2 border-r-0", borderLine)} />
        </div>

        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none select-none">
            <span className="text-4xl lg:text-6xl font-headline font-black text-white/[0.03] uppercase tracking-[0.5em]">SynqAI</span>
            <span className="text-[8px] lg:text-[10px] font-black text-white/[0.05] uppercase tracking-[1em]">MODO_PROMOCIÓN_RESTRINGIDO</span>
          </div>
        )}

        {/* ÁREA DE DIBUJO / CONTENIDO ESPECÍFICO */}
        <div className="absolute inset-0 z-10">
          {children}
        </div>

        {/* OVERLAY DE ESTADO */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12 flex flex-col gap-2 z-20">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
            <span className="text-[8px] lg:text-[9px] font-black text-white/60 uppercase tracking-widest">Sincronización_IA_Activa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
