
"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface TacticalFieldProps {
  theme?: "cyan" | "amber";
  showWatermark?: boolean;
  children?: ReactNode;
}

/**
 * TacticalField - Ingeniería Geométrica FIFA (105x68).
 * Rediseñado con textura de césped profesional y líneas de alta fidelidad.
 */
export function TacticalField({ theme = "cyan", showWatermark, children }: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/30" : "border-amber-500/30";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden select-none pointer-events-none">
      <div 
        className={cn(
          "relative w-full h-full max-w-full max-h-full aspect-[105/68] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border-2 transition-all duration-700 pointer-events-auto",
          accentColor,
          "bg-[#050a05]" // Verde base ultra-oscuro "Night Match"
        )}
        style={{
          width: 'min(100%, calc((100vh - 160px) * 105 / 68))',
          height: 'min(100%, calc(100vw * 68 / 105))'
        }}
      >
        {/* EFECTO CÉSPED: Franjas de segado profesional */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,#000_0%,#000_10%,transparent_10%,transparent_20%)]" />
        
        {/* Grilla Técnica de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        
        {/* LÍNEAS REGLAMENTARIAS (Sizing Relativo %) */}
        <div className="absolute inset-[4%] border border-white/20 rounded-sm pointer-events-none">
          
          {/* Línea de Medio Campo */}
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/20 -translate-x-1/2" />
          
          {/* Círculo Central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[18%] aspect-square border border-white/20 rounded-full" />
          
          {/* Punto Central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />

          {/* LADO IZQUIERDO */}
          {/* Área Grande */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/20 border-l-0" />
          {/* Área Pequeña */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/20 border-l-0" />
          {/* Punto de Penalti */}
          <div className="absolute top-1/2 left-[10.5%] -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          {/* Arco de Área */}
          <div className="absolute top-1/2 left-[15.5%] -translate-y-1/2 w-[8%] h-[20%] border border-white/20 border-l-0 rounded-r-full" />

          {/* LADO DERECHO */}
          {/* Área Grande */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/20 border-r-0" />
          {/* Área Pequeña */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/20 border-r-0" />
          {/* Punto de Penalti */}
          <div className="absolute top-1/2 right-[10.5%] -translate-y-1/2 w-1 h-1 bg-white/40 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
          {/* Arco de Área */}
          <div className="absolute top-1/2 right-[15.5%] -translate-y-1/2 w-[8%] h-[20%] border border-white/20 border-r-0 rounded-l-full" />

          {/* ARCOS DE CÓRNER */}
          <div className="absolute top-0 left-0 w-[2%] aspect-square border-r border-b border-white/20 rounded-br-full" />
          <div className="absolute bottom-0 left-0 w-[2%] aspect-square border-r border-t border-white/20 rounded-tr-full" />
          <div className="absolute top-0 right-0 w-[2%] aspect-square border-l border-b border-white/20 rounded-bl-full" />
          <div className="absolute bottom-0 right-0 w-[2%] aspect-square border-l border-t border-white/20 rounded-tl-full" />
        </div>

        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-5 select-none rotate-[-15deg]">
            <span className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-[0.5em]">SynqAI</span>
            <span className="text-xs md:text-sm font-black text-white uppercase tracking-[1em]">PROTOCOLO_RESTRINGIDO</span>
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl z-50">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic">Tactical_Surface_Online</span>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
