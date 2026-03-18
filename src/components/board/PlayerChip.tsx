
"use client";

import { cn } from "@/lib/utils";

interface PlayerChipProps {
  number: number;
  team: "local" | "visitor";
  x: number; // 0-100
  y: number; // 0-100
  label?: string;
  className?: string;
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
}

/**
 * PlayerChip - Nodo de Atleta en Pizarra v18.0.0
 * PROTOCOLO_PERFORMANCE_SCALING_FIX:
 * - Escalado dinámico: Chips reducidos en tablet (h-8) y optimizados en PC (md:h-12, lg:h-14).
 * - Aceleración por hardware: Uso de translate3d para fluidez en dispositivos con poca RAM (3GB).
 */
export function PlayerChip({ 
  number, 
  team, 
  x, 
  y, 
  label, 
  className, 
  isDragging,
  onPointerDown 
}: PlayerChipProps) {
  const isLocal = team === "local";
  
  return (
    <div 
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-20 select-none touch-none",
        isDragging ? "scale-110 z-50 cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        willChange: "left, top, transform",
        transform: `translate3d(-50%, -50%, 0)`, 
        backfaceVisibility: "hidden",
        perspective: 1000,
        transition: isDragging 
          ? 'none' 
          : 'left 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0), top 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0), transform 0.2s ease'
      }}
      onPointerDown={onPointerDown}
    >
      <div 
        className={cn(
          "h-8 w-8 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full border-2 flex items-center justify-center text-[9px] md:text-xs lg:text-sm font-black shadow-lg transition-all duration-300",
          isLocal 
            ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
            : "bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
          isDragging && (isLocal ? "shadow-[0_0_30px_rgba(0,242,255,0.6)] border-white" : "shadow-[0_0_30px_rgba(244,63,94,0.6)] border-white")
        )}
      >
        {number}
      </div>
      {label && (
        <span className={cn(
          "text-[6px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-tighter whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-sm transition-opacity duration-300",
          isDragging ? "opacity-0" : "opacity-100"
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
