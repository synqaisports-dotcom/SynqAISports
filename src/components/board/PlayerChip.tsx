
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
 * PlayerChip - Nodo de Atleta en Pizarra v69.0.0
 * PROTOCOLO_MOBILE_SCALING: Aumentado el tamaño base para móviles (h-8) y fuentes legibles.
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
        willChange: "left, top",
        transform: `translate3d(-50%, -50%, 0) translateZ(0)`, 
        backfaceVisibility: "hidden",
        perspective: 1000,
        transition: isDragging 
          ? 'none' 
          : 'left 0.4s cubic-bezier(0.2, 0, 0, 1), top 0.4s cubic-bezier(0.2, 0, 0, 1)'
      }}
      onPointerDown={onPointerDown}
    >
      <div 
        className={cn(
          "h-8 w-8 md:h-10 md:w-10 lg:h-11 lg:w-11 rounded-full border-[1.5px] md:border-2 flex items-center justify-center text-[10px] md:text-[10px] lg:text-xs font-black shadow-lg transition-[background-color,border-color,color,opacity,transform] duration-300",
          team === 'local' 
            ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
            : "bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
          isDragging && "shadow-[0_0_30px_rgba(255,255,255,0.6)] border-white"
        )}
      >
        {number}
      </div>
      {label && (
        <span className={cn(
          "text-[7px] md:text-[7px] lg:text-[8px] font-black uppercase tracking-tight whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded-sm transition-opacity duration-300",
          isDragging ? "opacity-0" : "opacity-100"
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
