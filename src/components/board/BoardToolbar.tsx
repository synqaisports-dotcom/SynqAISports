
"use client";

import { useState } from "react";
import { 
  Pencil, 
  Trash2, 
  MousePointer2, 
  Paintbrush, 
  Square, 
  Circle, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Activity,
  ChevronLeft,
  ChevronDown,
  Flag,
  Library,
  UserCircle,
  Disc,
  Grid3X3,
  Table2,
  Settings,
  Move,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawingTool = 'select' | 'freehand' | 'rect' | 'circle' | 'arrow' | 'double-arrow' | 'zigzag' | 'player' | 'ball' | 'cone' | 'seta' | 'ladder' | 'hurdle' | 'minigoal' | 'pica' | 'barrier' | 'cross-arrow' | 'text';

interface BoardToolbarProps {
  theme?: "cyan" | "amber";
  onToolSelect?: (toolId: DrawingTool) => void;
  onColorSelect?: (color: string) => void;
  onClear?: () => void;
  onOpenProperties?: () => void;
  activeTool?: DrawingTool;
  activeColor?: string;
  isPaintMode?: boolean;
  onTogglePaintMode?: (active: boolean) => void;
  className?: string;
  variant?: "full" | "match" | "training" | "materials";
  orientation?: "vertical" | "horizontal";
  hasSelection?: boolean;
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
  { id: 'zigzag', icon: Activity, label: 'Onda de Agilidad' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Flecha' },
  { id: 'double-arrow', icon: ArrowLeftRight, label: 'Flecha Doble' },
  { id: 'cross-arrow', icon: Move, label: 'Cruz de Movimiento' },
  { id: 'text', icon: Type, label: 'Texto Táctico' },
] as const;

function BarrierIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M7 6v12M12 6v12M17 6v12" />
    </svg>
  );
}

function ConeIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 2L3 20h18L12 2z" /><path d="M6 16h12" /></svg>
}

function MinigoalIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 20V8h18v12" /><path d="M3 8l3-4h12l3 4" /><path d="M6 4v4" /><path d="M18 4v4" /></svg>
}

function BallIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="M12 12l7-7" /><path d="M12 12l-7 7" /><path d="M12 12l7 7" /><path d="M12 12l-7-7" /></svg>
}

const MATERIAL_TOOLS = [
  { id: 'player', icon: UserCircle, label: 'Jugador' },
  { id: 'ball', icon: BallIcon, label: 'Balón' },
  { id: 'cone', icon: ConeIcon, label: 'Cono' },
  { id: 'seta', icon: Disc, label: 'Seta' },
  { id: 'barrier', icon: BarrierIcon, label: 'Barrera' },
  { id: 'ladder', icon: Grid3X3, label: 'Escalera' },
  { id: 'hurdle', icon: Table2, label: 'Valla' },
  { id: 'minigoal', icon: MinigoalIcon, label: 'Portería' },
  { id: 'pica', icon: Flag, label: 'Pica' },
] as const;

/**
 * BoardToolbar - v2.1.0
 * Compactado para Tablets. Botones de 36px y gaps de 4px.
 * Reducción de ancho total para evitar desbordamientos.
 */
export function BoardToolbar({ 
  theme = "cyan", 
  onToolSelect, 
  onColorSelect,
  onClear,
  onOpenProperties,
  activeTool = 'freehand',
  activeColor = '#00f2ff',
  isPaintMode = false,
  onTogglePaintMode,
  className,
  variant = "full",
  orientation = "vertical",
  hasSelection = false
}: BoardToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const accentColor = theme === "cyan" ? "bg-primary" : "bg-amber-500";
  const glowShadow = theme === "cyan" ? "shadow-[0_0_15px_rgba(0,242,255,0.3)]" : "shadow-[0_0_15px_rgba(245,158,11,0.3)]";
  const activeClass = `${accentColor} text-black ${glowShadow} scale-105`;
  const isHorizontal = orientation === "horizontal";

  // Estilos de botones compactos para tablet
  const btnClass = "h-9 w-9 rounded-xl flex items-center justify-center transition-all group relative shrink-0";

  if (variant === "match") {
    return (
      <aside className={cn(
        "w-14 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] flex flex-col items-center py-4 gap-3 z-50 shadow-2xl",
        className
      )}>
        <button onClick={() => onTogglePaintMode?.(false)} className={cn(btnClass, !isPaintMode ? activeClass : "text-white/20 hover:text-white")} title="Modo Selección">
          <MousePointer2 className="h-4 w-4" />
        </button>

        <button onClick={() => onTogglePaintMode?.(true)} className={cn(btnClass, isPaintMode ? activeClass : "text-white/20 hover:text-white")} title="Modo Pizarra">
          <Paintbrush className="h-4 w-4" />
        </button>

        <div className="w-6 h-[1px] bg-white/10 my-1" />

        <div className={cn("flex flex-col gap-2 transition-all duration-500", isPaintMode ? "opacity-100 scale-100" : "opacity-20 scale-90 pointer-events-none")}>
          {COLORS.map(color => (
            <button
              key={color.id}
              onClick={() => onColorSelect?.(color.value)}
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-all",
                activeColor === color.value ? "border-white scale-110 shadow-lg" : "border-transparent opacity-60"
              )}
              style={{ backgroundColor: color.value }}
            />
          ))}
        </div>

        <div className="w-6 h-[1px] bg-white/10 my-1" />

        <button onClick={onClear} className="text-rose-500/40 hover:text-rose-500 h-9 w-9 flex items-center justify-center">
          <Trash2 className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  const currentTools = variant === 'materials' ? MATERIAL_TOOLS : TRAINING_TOOLS;

  return (
    <aside className={cn(
      "bg-black/60 backdrop-blur-2xl border border-white/10 transition-all duration-500 flex items-center z-50 overflow-hidden shadow-2xl",
      theme === "amber" ? "border-amber-500/30 shadow-amber-500/10" : "border-primary/30 shadow-primary/10",
      isHorizontal 
        ? "flex-row px-2 rounded-full h-12" 
        : "flex-col py-4 rounded-[1.5rem] w-14",
      isCollapsed 
        ? (isHorizontal ? "w-12 px-0" : "h-12 py-0") 
        : (isHorizontal ? "max-w-fit gap-1 px-3" : "max-h-fit gap-2 py-4"),
      className
    )}>
      {isCollapsed ? (
        <button 
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "h-9 w-9 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-xl",
            theme === "amber" ? "hover:bg-amber-500/10 hover:text-amber-500" : "hover:bg-primary/10 hover:text-primary",
            isHorizontal ? "mx-auto" : "my-auto"
          )}
        >
          {variant === 'materials' ? <Library className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </button>
      ) : (
        <>
          {variant !== 'materials' && (
            <>
              <button
                onClick={() => onToolSelect?.('select')}
                className={cn(btnClass, activeTool === 'select' ? activeClass : "text-white/40 hover:text-white")}
              >
                <MousePointer2 className="h-4 w-4" />
              </button>
              <div className={cn(isHorizontal ? "h-5 w-[1px]" : "w-6 h-[1px]", "bg-white/10")} />
            </>
          )}

          {currentTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect?.(tool.id as DrawingTool)}
              className={cn(btnClass, activeTool === tool.id ? activeClass : "text-white/40 hover:text-white")}
              title={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </button>
          ))}

          {variant !== 'materials' && (
            <>
              <div className={cn(isHorizontal ? "h-5 w-[1px]" : "w-6 h-[1px]", "bg-white/10")} />
              <button onClick={onClear} className="text-rose-500/40 hover:text-rose-500 h-9 w-9 flex items-center justify-center rounded-xl hover:bg-rose-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          <div className={cn(isHorizontal ? "h-5 w-[1px]" : "w-6 h-[1px]", "bg-white/10")} />

          <button onClick={() => setIsCollapsed(true)} className="text-white/20 hover:text-white h-9 w-9 flex items-center justify-center transition-all rounded-xl">
            {isHorizontal ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </>
      )}
    </aside>
  );
}
