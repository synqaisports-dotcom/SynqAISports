
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
 * PlayerChip - Nodo de Atleta en Pizarra v16.1.0
 * PROTOCOLO_TRANSITION_RESTORATION: Restauración de movimiento suave y elástico.
 * - Escala reducida en tablets para no saturar el campo.
 * - Transiciones inteligentes: Desactivadas durante el drag, elásticas en cambios tácticos.
 * - Aceleración por hardware mediante will-change.
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
        transition: isDragging ? 'none' : 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.2s ease'
      }}
      onPointerDown={onPointerDown}
    >
      <div 
        className={cn(
          "h-7 w-7 md:h-10 md:w-10 rounded-full border-2 flex items-center justify-center text-[9px] md:text-xs font-black shadow-lg transition-colors duration-300",
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
          "text-[7px] md:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded-sm transition-opacity duration-300",
          isDragging ? "opacity-0" : "opacity-100"
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
