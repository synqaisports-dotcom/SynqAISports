
"use client";

import { useState } from "react";
import { 
  Pencil, 
  Eraser,
  Trash2,
  Undo2,
  Redo2,
  MousePointer2,
  Paintbrush
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardToolbarProps {
  theme?: "cyan" | "amber";
  onToolSelect?: (toolId: string) => void;
  onColorSelect?: (color: string) => void;
  onClear?: () => void;
  activeTool?: string;
  activeColor?: string;
  isPaintMode?: boolean;
  onTogglePaintMode?: (active: boolean) => void;
  className?: string;
  variant?: "full" | "match";
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

export function BoardToolbar({ 
  theme = "cyan", 
  onToolSelect, 
  onColorSelect,
  onClear,
  activeTool = 'draw',
  activeColor = '#00f2ff',
  isPaintMode = false,
  onTogglePaintMode,
  className,
  variant = "match"
}: BoardToolbarProps) {

  const activeClass = theme === "cyan" 
    ? "bg-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] scale-110" 
    : "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110";

  if (variant === "match") {
    return (
      <aside className={cn(
        "w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50",
        className
      )}>
        {/* Toggle Modo Pintura / Selección */}
        <button
          onClick={() => onTogglePaintMode?.(!isPaintMode)}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
            !isPaintMode ? activeClass : "text-white/20 hover:text-white"
          )}
          title="Modo Selección (Mover Jugadores)"
        >
          <MousePointer2 className="h-5 w-5" />
        </button>

        <button
          onClick={() => onTogglePaintMode?.(true)}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
            isPaintMode ? activeClass : "text-white/20 hover:text-white"
          )}
          title="Modo Pizarra (Dibujo Libre)"
        >
          <Paintbrush className="h-5 w-5" />
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        {/* Colores (Solo visibles en modo pintura) */}
        <div className={cn("flex flex-col gap-3 transition-all duration-500", isPaintMode ? "opacity-100 scale-100" : "opacity-20 scale-90 pointer-events-none")}>
          {COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => onColorSelect?.(color.value)}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                activeColor === color.value ? "border-white scale-125 shadow-lg" : "border-transparent opacity-60"
              )}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>

        <div className="w-8 h-[1px] bg-white/10 my-2" />

        <button 
          onClick={onClear}
          className="text-rose-500/40 hover:text-rose-500 transition-colors h-10 w-10 flex items-center justify-center"
          title="Limpiar Pizarra"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </aside>
    );
  }

  // Fallback para otras pizarras (mantenemos la anterior por ahora)
  return (
    <aside className={cn(
      "w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50",
      className
    )}>
      <button
        onClick={() => onToolSelect?.('draw')}
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
          activeTool === 'draw' ? activeClass : "text-white/20 hover:text-white"
        )}
      >
        <Pencil className="h-5 w-5" />
      </button>
      <div className="w-8 h-[1px] bg-white/10 my-2" />
      <button onClick={onClear} className="text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
    </aside>
  );
}
