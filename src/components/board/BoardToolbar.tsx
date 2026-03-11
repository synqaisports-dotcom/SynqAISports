
"use client";

import { useState } from "react";
import { 
  Pencil, 
  Eraser,
  Trash2,
  Undo2,
  Redo2,
  MousePointer2,
  Paintbrush,
  Square,
  Circle,
  ArrowUpRight,
  ArrowLeftRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawingTool = 'select' | 'freehand' | 'rect' | 'circle' | 'arrow' | 'double-arrow' | 'zigzag';

interface BoardToolbarProps {
  theme?: "cyan" | "amber";
  onToolSelect?: (toolId: DrawingTool) => void;
  onColorSelect?: (color: string) => void;
  onClear?: () => void;
  activeTool?: DrawingTool;
  activeColor?: string;
  isPaintMode?: boolean;
  onTogglePaintMode?: (active: boolean) => void;
  className?: string;
  variant?: "full" | "match" | "training";
}

const COLORS = [
  { id: 'cyan', value: '#00f2ff', label: 'Local' },
  { id: 'rose', value: '#f43f5e', label: 'Visitante' },
  { id: 'yellow', value: '#facc15', label: 'Atención' },
  { id: 'white', value: '#ffffff', label: 'Neutro' },
];

const TRAINING_TOOLS = [
  { id: 'freehand', icon: Pencil, label: 'Dibujo Libre' },
  { id: 'rect', icon: Square, label: 'Rectángulo' },
  { id: 'circle', icon: Circle, label: 'Círculo' },
  { id: 'zigzag', icon: Activity, label: 'Zig-Zag / Onda' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Flecha' },
  { id: 'double-arrow', icon: ArrowLeftRight, label: 'Flecha Doble' },
] as const;

export function BoardToolbar({ 
  theme = "cyan", 
  onToolSelect, 
  onColorSelect,
  onClear,
  activeTool = 'freehand',
  activeColor = '#00f2ff',
  isPaintMode = false,
  onTogglePaintMode,
  className,
  variant = "full"
}: BoardToolbarProps) {

  const accentColor = theme === "cyan" ? "bg-primary" : "bg-amber-500";
  const glowShadow = theme === "cyan" ? "shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "shadow-[0_0_20px_rgba(245,158,11,0.3)]";
  const activeClass = `${accentColor} text-black ${glowShadow} scale-110`;

  // VARIANTE PARTIDO: Simplificada para rotulador fluido
  if (variant === "match") {
    return (
      <aside className={cn(
        "w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50",
        className
      )}>
        <button
          onClick={() => onTogglePaintMode?.(false)}
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

  // VARIANTE ENTRENAMIENTO / FULL: Incluye formas y flechas
  return (
    <aside className={cn(
      "w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50",
      className
    )}>
      {/* Botón de selección para mover activos */}
      <button
        onClick={() => onToolSelect?.('select')}
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
          activeTool === 'select' ? activeClass : "text-white/20 hover:text-white"
        )}
        title="Seleccionar / Mover"
      >
        <MousePointer2 className="h-5 w-5" />
      </button>

      <div className="w-8 h-[1px] bg-white/10 my-2" />

      {/* Herramientas de Dibujo */}
      {TRAINING_TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect?.(tool.id)}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
            activeTool === tool.id ? activeClass : "text-white/20 hover:text-white"
          )}
          title={tool.label}
        >
          <tool.icon className="h-5 w-5" />
        </button>
      ))}

      <div className="w-8 h-[1px] bg-white/10 my-2" />

      {/* Colores */}
      <div className="flex flex-col gap-3">
        {COLORS.map(color => (
          <button
            key={color.id}
            onClick={() => onColorSelect?.(color.value)}
            className={cn(
              "h-5 w-5 rounded-full border transition-all",
              activeColor === color.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-40 hover:opacity-100"
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>

      <div className="w-8 h-[1px] bg-white/10 my-2" />

      <button 
        onClick={onClear} 
        className="text-rose-500/40 hover:text-rose-500 transition-colors"
        title="Borrar Todo"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </aside>
  );
}
