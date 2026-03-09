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
 * Diseñado con aspect-ratio nativo para prevenir el 'efecto huevo' en TV 4K.
 * Utiliza un sistema de capas absolutas para el renderizado de activos tácticos.
 */
export function TacticalField({ theme = "cyan", showWatermark, children }: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/20" : "border-amber-500/20";
  const fieldBg = theme === "cyan" ? "bg-[#0a0f18]" : "bg-[#050505]";
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden bg-transparent select-none">
      {/* 
        CONTENEDOR DE GEOMETRÍA INMUTABLE 
        El aspect-ratio 105/68 asegura que el círculo central sea SIEMPRE un círculo.
      */}
      <div 
        className={cn(
          "relative w-full max-w-full max-h-full aspect-[105/68] rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border-2 transition-all duration-700",
          accentColor,
          fieldBg
        )}
      >
        {/* Grilla Técnica de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        {/* LÍNEAS REGLAMENTARIAS (Sizing Relativo %) */}
        <div className="absolute inset-[4%] border border-white/10 rounded-sm pointer-events-none">
          {/* Línea Divisoria */}
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/10 -translate-x-1/2" />
          
          {/* Círculo Central Proporcional */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] aspect-square border border-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full" />
          
          {/* Áreas Técnicas */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[14%] h-[55%] border border-white/10 border-l-0" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[5%] h-[20%] border border-white/10 border-l-0" />
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[14%] h-[55%] border border-white/10 border-r-0" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5%] h-[20%] border border-white/10 border-r-0" />
        </div>

        {/* MARCA DE AGUA (SOLO MODO PROMO) */}
        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-5 select-none rotate-[-15deg]">
            <span className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-[0.5em]">SynqAI</span>
            <span className="text-xs md:text-sm font-black text-white uppercase tracking-[1em]">PROTOCOLO_RESTRINGIDO</span>
          </div>
        )}

        {/* OVERLAY DE SINCRONIZACIÓN */}
        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl z-50">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic">Neural_Sync_Ready</span>
        </div>

        {/* ÁREA DE RENDERIZADO DE ACTIVOS (Z-Index Superior) */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
