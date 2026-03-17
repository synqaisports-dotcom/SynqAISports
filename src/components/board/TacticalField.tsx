
"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode, RefObject } from "react";

export type FieldType = "f11" | "f7" | "futsal";

interface TacticalFieldProps {
  theme?: "cyan" | "amber";
  showWatermark?: boolean;
  fieldType?: FieldType;
  showLanes?: boolean;
  children?: ReactNode;
  containerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * TacticalField - v15.0.0
 * PROTOCOLO_MAX_PITCH_SURFACE: Maximización del área táctica al 98% del viewport.
 * Eliminación de restricciones de Safe-Area excesivas para priorizar visualización.
 */
export function TacticalField({ 
  theme = "cyan", 
  showWatermark, 
  fieldType = "f11",
  showLanes = false,
  children,
  containerRef
}: TacticalFieldProps) {
  const accentColor = theme === "cyan" ? "border-primary/30" : "border-amber-500/30";
  
  const isFutsal = fieldType === "futsal";
  const isF7 = fieldType === "f7";
  const bgClass = isFutsal ? "bg-[#0a2e5c]" : "bg-[#143d14]";
  
  const ratio = isFutsal ? 2.0 : 1.54;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2 overflow-hidden select-none pointer-events-none bg-black">
      <div 
        ref={containerRef}
        className={cn(
          "relative rounded-lg md:rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-2 transition-all duration-700 pointer-events-auto",
          accentColor,
          bgClass
        )}
        style={{
          width: '98vw',
          height: `calc(98vw / ${ratio})`,
          maxHeight: '96vh',
          maxWidth: `calc(96vh * ${ratio})`
        }}
      >
        {/* TEXTURAS OPTIMIZADAS */}
        {!isFutsal ? (
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent_0%,transparent_10%,#000_10%,#000_20%)]" />
        ) : (
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        )}
        
        {/* LÍNEAS REGLAMENTARIAS */}
        <div className="absolute inset-[4%] border border-white/20 rounded-sm pointer-events-none">
          
          {showLanes && (
            <>
              <div className="absolute left-0 right-0 top-[20%] h-[1px] border-t border-dashed border-white/20 z-0" />
              <div className="absolute left-0 right-0 top-[80%] h-[1px] border-t border-dashed border-white/20 z-0" />
            </>
          )}

          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/20 -translate-x-1/2" />
          
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/20 rounded-full",
            isFutsal ? "w-[15%] aspect-square" : "w-[18%] aspect-square"
          )} />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white/30 rounded-full" />

          {!isFutsal ? (
            <>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/20 border-l-0" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/20 border-l-0" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15.5%] h-[60%] border border-white/20 border-r-0" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[5.5%] h-[26%] border border-white/20 border-r-0" />
            </>
          ) : (
            <>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[15%] h-[60%] border border-white/20 border-l-0 rounded-r-full" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[15%] h-[60%] border border-white/20 border-r-0 rounded-l-full" />
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
            {fieldType.toUpperCase()}_SURFACE
          </span>
        </div>

        <div className="absolute inset-0 z-10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
