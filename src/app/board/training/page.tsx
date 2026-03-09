
"use client";

import { useState } from "react";
import { 
  Pencil, 
  MousePointer2, 
  Zap, 
  Save, 
  Trash2, 
  Sparkles,
  Layers,
  Circle,
  Square,
  ArrowUpRight,
  Dumbbell,
  Flag,
  Library,
  Video,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Selección' },
  { id: 'draw', icon: Pencil, label: 'Trazo' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Movimiento' },
  { id: 'circle', icon: Circle, label: 'Zona Circular' },
  { id: 'square', icon: Square, label: 'Zona Cuadrada' },
];

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

export default function TrainingBoardPage() {
  const [activeTool, setActiveTool] = useState('select');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { toast } = useToast();

  const handleAiSync = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      setIsAiProcessing(false);
      toast({
        title: "SINCRONIZACIÓN_IA_COMPLETA",
        description: "El motor Gemini ha analizado el dibujo y generado el informe técnico.",
      });
    }, 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#04070c] overflow-hidden">
      {/* HEADER ESTRATÉGICO AMBER */}
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Exercise_Designer_IA_v2.0</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">Pizarra de Ejercicios</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handleAiSync}
            disabled={isAiProcessing}
            className="h-11 bg-amber-500/10 border border-amber-500/40 text-amber-500 font-black uppercase text-[10px] tracking-widest px-6 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
          >
            {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Sincronizar con IA
          </Button>
          <Button className="h-11 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl amber-glow">
            <Save className="h-4 w-4 mr-2" /> Guardar Ejercicio
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* TOOLS IZQUIERDA */}
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 w-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col items-center py-6 gap-4 z-50">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all group relative",
                activeTool === tool.id 
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110" 
                  : "text-white/20 hover:text-white"
              )}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
            </button>
          ))}
        </aside>

        {/* ÁREA DE DIBUJO */}
        <main className="flex-1 p-12 flex items-center justify-center relative overflow-hidden">
          <div className="relative w-full max-w-5xl aspect-[1.4/1] bg-black border border-amber-500/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 bg-grid-pattern opacity-5" />
             <div className="absolute inset-12 border border-white/5 rounded-2xl flex items-center justify-center">
                <Dumbbell className="h-20 w-20 text-white/5 animate-pulse" />
             </div>
          </div>
        </main>

        {/* ASSETS DERECHA */}
        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-3xl p-6 flex flex-col shrink-0 z-50">
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black uppercase text-amber-500 mb-4 tracking-widest flex items-center gap-2">
                <Library className="h-3 w-3" /> Material Técnico
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {ASSETS.map(asset => (
                  <div key={asset.id} className="h-16 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-amber-500/40 cursor-move transition-all group">
                    <asset.icon className="h-5 w-5 text-white/20 group-hover:text-amber-500" />
                    <span className="text-[8px] font-black uppercase text-white/20">{asset.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] space-y-3">
               <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest italic">Protocolo Metodológico</p>
               <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase">
                 Dibuje la mecánica del ejercicio. Al finalizar, la IA completará los metadatos tácticos automáticamente.
               </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
