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
 * Diseñado para ser "Resistente a Entornos": Se escala perfectamente tanto en 
 * ancho como en alto para evitar el efecto huevo en cualquier resolución.
 */
export function TacticalField({ theme = "cyan", showWatermark, children }: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/20" : "border-amber-500/20";
  const fieldBg = theme === "cyan" ? "bg-[#0a0f18]" : "bg-[#050505]";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden select-none pointer-events-none">
      {/* 
        CONTENEDOR DE GEOMETRÍA DINÁMICA
        Usa max-w y max-h con aspect-ratio para asegurar que NUNCA se deforme 
        independientemente de si la pantalla es ultra-ancha o cuadrada.
      */}
      <div 
        className={cn(
          "relative w-full h-full max-w-full max-h-full aspect-[105/68] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border-2 transition-all duration-700 pointer-events-auto",
          accentColor,
          fieldBg
        )}
        style={{
          width: 'min(100%, calc((100vh - 160px) * 105 / 68))',
          height: 'min(100%, calc(100vw * 68 / 105))'
        }}
      >
        {/* Grilla Técnica de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        {/* LÍNEAS REGLAMENTARIAS (Sizing Relativo %) */}
        <div className="absolute inset-[4%] border border-white/10 rounded-sm pointer-events-none">
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10 -translate-x-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] aspect-square border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[14%] h-[55%] border border-white/10 border-l-0" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[5%] h-[20%] border border-white/10 border-l-0" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[14%] h-[55%] border border-white/10 border-r-0" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5%] h-[20%] border border-white/10 border-r-0" />
        </div>

        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-5 select-none rotate-[-15deg]">
            <span className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-[0.5em]">SynqAI</span>
            <span className="text-xs md:text-sm font-black text-white uppercase tracking-[1em]">PROTOCOLO_RESTRINGIDO</span>
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl z-50">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic">Neural_Sync_Ready</span>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}