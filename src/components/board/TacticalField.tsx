
"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode, RefObject } from "react";

export type FieldType = "f11" | "f7" | "futsal";

interface TacticalFieldProps {
  theme?: "cyan" | "amber";
  showWatermark?: boolean;
  fieldType?: FieldType;
  children?: ReactNode;
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * TacticalField - Motor Geométrico de Superficies Deportivas.
 * Soporta Fútbol 11, Fútbol 7 y Fútbol Sala con proporciones reales y texturas vibrantes.
 * v1.9: Implementación de containerRef para sincronización de coordenadas 1:1.
 */
export function TacticalField({ 
  theme = "cyan", 
  showWatermark, 
  fieldType = "f11",
  children,
  containerRef
}: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/30" : "border-amber-500/30";
  
  const isFutsal = fieldType === "futsal";
  const isF7 = fieldType === "f7";
  const bgClass = isFutsal ? "bg-[#0a2e5c]" : "bg-[#143d14]";
  const aspectRatio = isFutsal ? "aspect-[40/20]" : "aspect-[105/68]";
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 lg:p-12 overflow-hidden select-none pointer-events-none">
      <div 
        ref={containerRef}
        className={cn(
          "relative w-full h-full max-w-full max-h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border-2 transition-all duration-700 pointer-events-auto",
          accentColor,
          aspectRatio,
          bgClass
        )}
        style={{
          width: isFutsal ? 'min(100%, calc((100vh - 160px) * 40 / 20))' : 'min(100%, calc((100vh - 160px) * 105 / 68))',
          height: isFutsal ? 'min(100%, calc(100vw * 20 / 40))' : 'min(100%, calc(100vw * 68 / 105))'
        }}
      >
        {/* TEXTURAS */}
        {!isFutsal ? (
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(90deg,transparent_0%,transparent_10%,#000_10%,#000_20%)]" />
        ) : (
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
        )}
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_80%)]" />
        
        {/* LÍNEAS REGLAMENTARIAS */}
        <div className="absolute inset-[4%] border border-white/30 rounded-sm pointer-events-none">
          
          {/* Línea de Medio Campo */}
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/30 -translate-x-1/2" />
          
          {/* Círculo Central */}
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/30 rounded-full",
            isFutsal ? "w-[15%] aspect-square" : "w-[18%] aspect-square"
          )} />
          
          {/* Punto Central */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)]" />

          {!isFutsal ? (
            <>
              {/* ÁREAS FÚTBOL */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/30 border-l-0" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/30 border-l-0" />
              <div className="absolute top-1/2 left-[10.5%] -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full" />
              <div className="absolute top-1/2 left-[15.5%] -translate-y-1/2 w-[8%] h-[20%] border border-white/30 border-l-0 rounded-r-full" />

              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/30 border-r-0" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/30 border-r-0" />
              <div className="absolute top-1/2 right-[10.5%] -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full" />
              <div className="absolute top-1/2 right-[15.5%] -translate-y-1/2 w-[8%] h-[20%] border border-white/30 border-r-0 rounded-l-full" />

              {/* LÍNEAS FUERA DE JUEGO F7 (20%) */}
              {isF7 && (
                <>
                  <div className="absolute top-0 left-[20%] bottom-0 w-[1px] border-l border-dashed border-white/30" />
                  <div className="absolute top-0 right-[20%] bottom-0 w-[1px] border-r border-dashed border-white/30" />
                </>
              )}
            </>
          ) : (
            <>
              {/* ÁREAS FUTSAL */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15%] h-[60%] border border-white/30 border-l-0 rounded-r-full" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15%] h-[60%] border border-white/30 border-r-0 rounded-l-full" />
              <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full" />
              <div className="absolute top-1/2 right-[15%] -translate-y-1/2 w-1 h-1 bg-white/50 rounded-full" />
              <div className="absolute top-1/2 left-[25%] -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
              <div className="absolute top-1/2 right-[25%] -translate-y-1/2 w-1 h-1 bg-white/20 rounded-full" />
            </>
          )}

          {/* CÓRNERS */}
          <div className="absolute top-0 left-0 w-[2%] aspect-square border-r border-b border-white/30 rounded-br-full" />
          <div className="absolute bottom-0 left-0 w-[2%] aspect-square border-r border-t border-white/30 rounded-tr-full" />
          <div className="absolute top-0 right-0 w-[2%] aspect-square border-l border-b border-white/30 rounded-bl-full" />
          <div className="absolute bottom-0 right-0 w-[2%] aspect-square border-l border-t border-white/30 rounded-tl-full" />
        </div>

        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-5 select-none rotate-[-15deg]">
            <span className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-[0.5em]">SynqAI</span>
            <span className="text-xs md:text-sm font-black text-white uppercase tracking-[1em]">PROTOCOLO_RESTRINGIDO</span>
          </div>
        )}

        <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl z-50">
          <div className={cn("h-2 w-2 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest italic">
            {fieldType.toUpperCase()}_SURFACE_ONLINE
          </span>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
