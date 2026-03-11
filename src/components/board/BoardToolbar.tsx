
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
  const glowShadow = theme === "cyan" ? "shadow-[0_0_20px_rgba(0,242,255,0.3)]" : "shadow-[0_0_20px_rgba(245,158,11,0.3)]";
  const activeClass = `${accentColor} text-black ${glowShadow} scale-110`;
  const isHorizontal = orientation === "horizontal";

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
          title="Modo Selección"
        >
          <MousePointer2 className="h-5 w-5" />
        </button>

        <button
          onClick={() => onTogglePaintMode?.(true)}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
            isPaintMode ? activeClass : "text-white/20 hover:text-white"
          )}
          title="Modo Pizarra"
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

  const currentTools = variant === 'materials' ? MATERIAL_TOOLS : TRAINING_TOOLS;

  return (
    <aside className={cn(
      "bg-black/60 backdrop-blur-2xl border-2 transition-all duration-500 flex items-center z-50 overflow-hidden",
      theme === "amber" ? "border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]" : "border-primary/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]",
      isHorizontal 
        ? "flex-row px-2 rounded-full h-14" 
        : "flex-col py-6 rounded-3xl w-16",
      isCollapsed 
        ? (isHorizontal ? "w-14 px-0" : "h-14 py-0") 
        : (isHorizontal ? "max-w-[1000px] gap-2 px-4" : "max-h-[1000px] gap-4 py-6"),
      className
    )}>
      {isCollapsed ? (
        <button 
          onClick={() => setIsCollapsed(false)}
          className={cn(
            "h-10 w-10 flex items-center justify-center text-white/40 hover:text-white transition-all rounded-xl",
            theme === "amber" ? "hover:bg-amber-500/10 hover:text-amber-500" : "hover:bg-primary/10 hover:text-primary",
            isHorizontal ? "mx-auto" : "my-auto"
          )}
          title={variant === 'materials' ? "Expandir Materiales" : "Expandir Herramientas"}
        >
          {variant === 'materials' ? <Library className="h-5 w-5" /> : <Pencil className="h-5 w-5" />}
        </button>
      ) : (
        <>
          {variant !== 'materials' && (
            <>
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
              <div className={cn(isHorizontal ? "h-6 w-[1px]" : "w-8 h-[1px]", "bg-white/10")} />
            </>
          )}

          {currentTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect?.(tool.id as DrawingTool)}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
                activeTool === tool.id ? activeClass : "text-white/20 hover:text-white"
              )}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
          ))}

          {variant !== 'materials' && (
            <>
              <div className={cn(isHorizontal ? "h-6 w-[1px]" : "w-8 h-[1px]", "bg-white/10")} />
              <button 
                onClick={onClear} 
                className="text-rose-500/40 hover:text-rose-500 transition-colors h-10 w-10 flex items-center justify-center rounded-xl hover:bg-rose-500/10"
                title="Borrar Todo"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}

          <div className={cn(isHorizontal ? "h-6 w-[1px]" : "w-8 h-[1px]", "bg-white/10")} />

          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-white/20 hover:text-white h-10 w-10 flex items-center justify-center transition-all rounded-xl hover:bg-white/5"
            title="Colapsar"
          >
            {isHorizontal ? <ChevronDown className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </>
      )}
    </aside>
  );
}
