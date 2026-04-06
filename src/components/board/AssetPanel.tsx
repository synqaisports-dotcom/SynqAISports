
"use client";

import { cn } from "@/lib/utils";
import { Library, Circle, Flag, Info, Zap } from "lucide-react";

interface AssetPanelProps {
  theme?: "cyan" | "amber";
  className?: string;
  type: "training" | "promo";
}

const ASSETS = [
  { id: 'ball', icon: Circle, label: 'Balón' },
  { id: 'cone', icon: Triangle, label: 'Cono' },
  { id: 'pica', icon: Minus, label: 'Pica' },
  { id: 'flag', icon: Flag, label: 'Banderín' },
];

function Triangle(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><path d="M12 3L2 20h20L12 3z" /></svg>
}

function Minus(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" {...props}><line x1="12" y1="5" x2="12" y2="19" /></svg>
}

export function AssetPanel({ theme = "cyan", className, type }: AssetPanelProps) {
  const accentColor = theme === "cyan" ? "text-primary" : "text-amber-500";
  const borderColor = theme === "cyan" ? "border-primary/20" : "border-amber-500/20";
  const bgColor = theme === "cyan" ? "bg-primary/5" : "bg-amber-500/5";

  return (
    <aside className={cn(
      "w-72 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex flex-col p-6 gap-8 z-50",
      className
    )}>
      {type === "training" ? (
        <div className="flex flex-col h-full gap-8">
          <section>
            <h3 className={cn("text-[10px] font-black uppercase mb-4 tracking-widest flex items-center gap-2", accentColor)}>
              <Library className="h-3 w-3" /> Material Técnico
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ASSETS.map(asset => (
                <div key={asset.id} className={cn(
                  "h-16 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-move transition-[background-color,border-color,color,opacity,transform] group",
                  theme === "amber" ? "hover:border-amber-500/40" : "hover:border-primary/40"
                )}>
                  <asset.icon className={cn("h-5 w-5 text-white/20 transition-colors", theme === "amber" ? "group-hover:text-amber-500" : "group-hover:text-primary")} />
                  <span className="text-[8px] font-black uppercase text-white/20">{asset.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className={cn("mt-auto p-6 rounded-[2rem] space-y-3 border", bgColor, borderColor)}>
             <p className={cn("text-[9px] font-black uppercase tracking-widest italic", accentColor)}>Protocolo Metodológico</p>
             <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase">
               Dibuje la mecánica del ejercicio. Al finalizar, la IA completará los metadatos tácticos automáticamente.
             </p>
          </section>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-end space-y-6">
          <div className={cn("p-6 border rounded-[2rem] space-y-4 shadow-xl", bgColor, borderColor)}>
             <div className="flex items-center gap-3">
                <Info className={cn("h-4 w-4", accentColor)} />
                <span className={cn("text-[10px] font-black uppercase tracking-widest", accentColor)}>Ventajas Pro</span>
             </div>
             <ul className="space-y-3">
                {["Guardado Ilimitado", "Analítica IA Gemini", "Exportación Video HD"].map((text, i) => (
                  <li key={i} className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                     <Zap className={cn("h-3 w-3", accentColor)} /> {text}
                  </li>
                ))}
             </ul>
          </div>
        </div>
      )}
    </aside>
  );
}
