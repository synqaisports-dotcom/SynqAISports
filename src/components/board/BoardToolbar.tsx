
"use client";

import { useState } from "react";
import { 
  MousePointer2, 
  Pencil, 
  ArrowUpRight, 
  Square, 
  Circle, 
  Type, 
  Trash2,
  Undo2,
  Redo2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardToolbarProps {
  theme?: "cyan" | "amber";
  onToolSelect?: (toolId: string) => void;
  className?: string;
}

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Selección' },
  { id: 'draw', icon: Pencil, label: 'Trazo Libre' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Movimiento' },
  { id: 'square', icon: Square, label: 'Zona Rectangular' },
  { id: 'circle', icon: Circle, label: 'Zona Circular' },
  { id: 'text', icon: Type, label: 'Texto Táctico' },
];

export function BoardToolbar({ theme = "cyan", onToolSelect, className }: BoardToolbarProps) {
  const [activeTool, setActiveTool] = useState('select');

  const handleSelect = (id: string) => {
    setActiveTool(id);
    onToolSelect?.(id);
  };

  const activeClass = theme === "cyan" 
    ? "bg-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] scale-110" 
    : "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110";

  return (
    <aside className={cn(
      "w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50",
      className
    )}>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => handleSelect(tool.id)}
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
            activeTool === tool.id ? activeClass : "text-white/20 hover:text-white"
          )}
          title={tool.label}
        >
          <tool.icon className="h-5 w-5" />
          {activeTool === tool.id && (
            <div className={cn(
              "absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full",
              theme === "cyan" ? "bg-primary" : "bg-amber-500"
            )} />
          )}
        </button>
      ))}
      <div className="w-8 h-[1px] bg-white/10 my-2" />
      <div className="flex flex-col gap-2">
        <button className="text-white/20 hover:text-white transition-colors"><Undo2 className="h-4 w-4" /></button>
        <button className="text-white/20 hover:text-white transition-colors"><Redo2 className="h-4 w-4" /></button>
      </div>
      <div className="w-8 h-[1px] bg-white/10 my-2" />
      <button className="text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
    </aside>
  );
}
