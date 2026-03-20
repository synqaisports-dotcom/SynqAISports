
"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode, RefObject } from "react";

export type FieldType = "f11" | "f7" | "futsal";

interface TacticalFieldProps {
  theme?: "cyan" | "amber";
  showWatermark?: boolean;
  fieldType?: FieldType;
  showLanes?: boolean;
  isHalfField?: boolean;
  children?: ReactNode;
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * TacticalField - v57.0.0
 * PROTOCOL_SAFE_WORK_AREA: Ajuste de dimensiones para evitar cortes en tablets.
 * Se limita la altura al 72% del viewport dinámico para dejar espacio a cabeceras y footers.
 */
export function TacticalField({ 
  theme = "cyan", 
  showWatermark, 
  fieldType = "f11",
  showLanes = false,
  isHalfField = false,
  children,
  containerRef
}: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/30" : "border-amber-500/30";
  
  const isFutsal = fieldType === "futsal";
  const bgClass = isFutsal ? "bg-[#0a2e5c]" : "bg-[#143d14]";
  
  // Ratio W/H: Full horizontal es ~1.54. Half Vertical ensanchado es ~0.85
  const ratio = isHalfField ? 0.85 : (isFutsal ? 2.0 : 1.54);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4 overflow-hidden select-none pointer-events-none bg-black">
      <div 
        ref={containerRef}
        className={cn(
          "relative rounded-lg md:rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-2 transition-all duration-700 pointer-events-auto",
          accentColor,
          bgClass
        )}
        style={{
          // Ajustamos para que nunca exceda el 72% de la altura (espacio libre real entre header y footer)
          width: isHalfField 
            ? `min(90vw, calc(72dvh * ${ratio}))` 
            : `min(95vw, calc(72dvh * ${ratio}))`,
          height: isHalfField 
            ? `min(72dvh, calc(90vw / ${ratio}))` 
            : `min(72dvh, calc(95vw / ${ratio}))`,
          margin: 'auto'
        }}
      >
        {/* TEXTURAS OPTIMIZADAS */}
        {!isFutsal ? (
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent_0%,transparent_10%,#000_10%,#000_20%)]" />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        )}
        
        {/* LÍNEAS REGLAMENTARIAS */}
        <div className={cn(
          "absolute border border-white/20 rounded-sm pointer-events-none transition-all duration-700",
          isHalfField ? "inset-x-[6%] top-[6%] bottom-[-50%]" : "inset-[4%]"
        )}>
          
          {/* CARRILES / CANALES TÁCTICOS */}
          {showLanes && (
            <>
              {isHalfField ? (
                <>
                  <div className="absolute top-0 bottom-0 left-[20%] w-[1px] border-l border-dashed border-white/20 z-0" />
                  <div className="absolute top-0 bottom-0 left-[80%] w-[1px] border-l border-dashed border-white/20 z-0" />
                </>
              ) : (
                <>
                  <div className="absolute left-0 right-0 top-[20%] h-[1px] border-t border-dashed border-white/20 z-0" />
                  <div className="absolute left-0 right-0 top-[80%] h-[1px] border-t border-dashed border-white/20 z-0" />
                </>
              )}
            </>
          )}

          {/* LÍNEA CENTRAL */}
          <div className={cn(
            "absolute bg-white/20 transition-all duration-700",
            isHalfField ? "bottom-0 left-0 right-0 h-[1px]" : "top-0 left-1/2 w-[1px] h-full -translate-x-1/2"
          )} />
          
          {/* CÍRCULO CENTRAL */}
          <div className={cn(
            "absolute border border-white/20 rounded-full transition-all duration-700",
            isHalfField 
              ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[40%] aspect-square" 
              : (isFutsal ? "w-[15%] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "w-[18%] aspect-square top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2")
          )} />
          
          {/* PUNTO CENTRAL */}
          <div className={cn(
            "absolute bg-white/30 rounded-full transition-all duration-700",
            isHalfField ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1"
          )} />

          {/* ÁREAS (Sólo una en modo Half) */}
          {!isFutsal ? (
            <>
              {/* ÁREA GRANDE ARRIBA / IZQUIERDA */}
              <div className={cn(
                "absolute border border-white/20 transition-all duration-700",
                isHalfField 
                  ? "top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15.5%] border-t-0" 
                  : "top-1/2 left-0 -translate-y-1/2 w-[15.5%] h-[60%] border-l-0"
              )} />
              {/* ÁREA PEQUEÑA ARRIBA / IZQUIERDA */}
              <div className={cn(
                "absolute border border-white/20 transition-all duration-700",
                isHalfField 
                  ? "top-0 left-1/2 -translate-x-1/2 w-[26%] h-[5.5%] border-t-0" 
                  : "top-1/2 left-0 -translate-y-1/2 w-[5.5%] h-[26%] border-l-0"
              )} />
              
              {!isHalfField && (
                <>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/20 border-r-0" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/20 border-r-0" />
                </>
              )}
            </>
          ) : (
            <>
              <div className={cn(
                "absolute border border-white/20 transition-all duration-700",
                isHalfField 
                  ? "top-0 left-1/2 -translate-x-1/2 w-[60%] h-[15%] border-t-0 rounded-b-full" 
                  : "top-1/2 left-0 -translate-y-1/2 w-[15%] h-[60%] border-l-0 rounded-r-full"
              )} />
              {!isHalfField && (
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15%] h-[60%] border border-white/20 border-r-0 rounded-l-full" />
              )}
            </>
          )}
        </div>

        {showWatermark && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-5 select-none rotate-[-15deg]">
            <span className="text-6xl md:text-9xl font-headline font-black text-white uppercase tracking-[0.5em]">SynqAI</span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1 rounded-xl z-50 scale-[0.8] origin-top-left">
          <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", theme === "cyan" ? "bg-primary" : "bg-amber-500")} />
          <span className="text-[8px] font-black text-white/60 uppercase tracking-widest italic">
            {isHalfField ? 'HALF_FOCUS' : `${fieldType.toUpperCase()}_SURFACE`}
          </span>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
