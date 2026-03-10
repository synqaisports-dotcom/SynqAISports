
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
 * PlayerChip - Nodo de Atleta en Pizarra.
 * Optimizado para Latencia Cero en dispositivos táctiles mediante desactivación 
 * dinámica de transiciones durante el arrastre.
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
        // CRÍTICO: Desactivar transiciones durante el arrastre para eliminar el lag visual
        transition: isDragging ? 'none' : 'left 0.3s ease-out, top 0.3s ease-out, transform 0.2s ease'
      }}
      onPointerDown={onPointerDown}
    >
      <div 
        className={cn(
          "h-8 w-8 md:h-10 md:w-10 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-black shadow-lg",
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
          "text-[8px] font-black uppercase tracking-tighter whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded-sm transition-opacity",
          isDragging ? "opacity-0" : "opacity-100"
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
