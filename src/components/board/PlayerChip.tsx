
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
        "absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all duration-700 ease-in-out z-20 select-none",
        isDragging ? "scale-125 z-50 duration-0 cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transitionProperty: isDragging ? 'none' : 'all'
      }}
      onPointerDown={onPointerDown}
    >
      <div 
        className={cn(
          "h-8 w-8 md:h-10 md:w-10 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-black shadow-lg transition-all",
          isLocal 
            ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]" 
            : "bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
          isDragging && (isLocal ? "shadow-[0_0_30px_rgba(0,242,255,0.6)]" : "shadow-[0_0_30px_rgba(244,63,94,0.6)]")
        )}
      >
        {number}
      </div>
      {label && (
        <span className="text-[8px] font-black text-white/60 uppercase tracking-tighter whitespace-nowrap bg-black/40 px-1.5 py-0.5 rounded-sm">
          {label}
        </span>
      )}
    </div>
  );
}
