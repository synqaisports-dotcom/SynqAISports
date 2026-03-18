
"use client";

import { useState } from "react";
import { 
  Monitor, 
  MousePointer2, 
  Pencil, 
  Type, 
  Square, 
  Circle as CircleIcon, 
  ArrowUpRight, 
  RotateCcw, 
  Save, 
  Share2, 
  Layers, 
  Settings2,
  ChevronDown,
  Maximize2,
  Trash2,
  Undo2,
  Redo2,
  Video,
  Download,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Selección' },
  { id: 'draw', icon: Pencil, label: 'Trazo Libre' },
  { id: 'text', icon: Type, label: 'Texto Táctico' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Flecha de Movimiento' },
  { id: 'square', icon: Square, label: 'Zona Rectangular' },
  { id: 'circle', icon: CircleIcon, label: 'Zona Circular' },
];

export default function TacticalBoardPage() {
  const [activeTool, setActiveTool] = useState('select');
  const [sport, setSport] = useState('football');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#04070c]">
      {/* TOOLBAR SUPERIOR */}
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Tactical_Board_v2.0</span>
            </div>
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">Pizarra de Élite</h1>
          </div>

          <div className="h-8 w-[1px] bg-white/5 mx-2" />

          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger className="w-[180px] h-11 bg-white/5 border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f18] border-primary/20">
              <SelectItem value="football" className="text-[10px] font-black uppercase">Fútbol / Futsal</SelectItem>
              <SelectItem value="basketball" className="text-[10px] font-black uppercase">Baloncesto</SelectItem>
              <SelectItem value="handball" className="text-[10px] font-black uppercase">Balonmano</SelectItem>
              <SelectItem value="hockey" className="text-[10px] font-black uppercase">Hockey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 hover:text-white"><Undo2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/30 hover:text-white"><Redo2 className="h-4 w-4" /></Button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></Button>
          </div>

          <Button variant="outline" className="h-11 border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 rounded-xl px-6">
            <Video className="h-4 w-4 mr-2" /> Grabar Clip
          </Button>
          
          <Button className="h-11 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow shadow-[0_0_20px_rgba(0,242,255,0.2)]">
            <Save className="h-4 w-4 mr-2" /> Guardar Táctica
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* BARRA LATERAL DE HERRAMIENTAS */}
        <aside className="w-20 border-r border-white/5 bg-black/20 flex flex-col items-center py-8 gap-4 shrink-0">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all group relative",
                activeTool === tool.id 
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.3)] scale-110" 
                  : "text-white/20 hover:text-white hover:bg-white/5"
              )}
              title={tool.label}
            >
              <tool.icon className="h-5 w-5" />
              {activeTool === tool.id && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-full" />
              )}
            </button>
          ))}
          
          <div className="mt-auto flex flex-col gap-4">
            <button className="h-12 w-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/20 hover:text-primary transition-all">
              <Layers className="h-5 w-5" />
            </button>
          </div>
        </aside>

        {/* ÁREA DEL CANVAS / CAMPO */}
        <main className="flex-1 bg-black p-12 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          {/* REPRESENTACIÓN VISUAL DEL CAMPO */}
          <div className="relative w-full max-w-5xl aspect-[1.6/1] glass-panel border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
             {/* MARCAS DEL CAMPO (DISEÑO) */}
             <div className="absolute inset-8 border-2 border-white/10 rounded-sm">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/10 rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/20 rounded-full" />
                
                {/* ÁREAS */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-64 border-2 border-white/10 border-l-0" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-32 h-64 border-2 border-white/10 border-r-0" />
             </div>

             <div className="text-center space-y-4 relative z-10">
                <Monitor className="h-12 w-12 text-primary/20 mx-auto animate-pulse" />
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[1em]">Terminal_en_espera_de_datos</p>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                  Listo para recibir la configuración de {sport.toUpperCase()} desde el nodo central.
                </p>
             </div>

             <div className="absolute bottom-6 right-6 flex items-center gap-4">
                <button className="text-white/20 hover:text-white transition-colors">
                  <Maximize2 className="h-5 w-5" />
                </button>
             </div>
          </div>

          {/* OVERLAY DE INFORMACIÓN */}
          <div className="absolute top-12 left-12 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Sincronización_IA_Activa</span>
            </div>
          </div>
        </main>

        {/* PANEL DERECHO DE ACTIVOS / JUGADORES */}
        <aside className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Activos Tácticos</h3>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">Sincronizados con el nodo local</p>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <section className="space-y-4">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Jugadores / Fichas</span>
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="aspect-square bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-[10px] font-black text-primary hover:bg-primary hover:text-black cursor-pointer transition-all">
                    {i}
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Material de Entrenamiento</span>
              <div className="grid grid-cols-2 gap-3">
                {['Cono', 'Pica', 'Escalera', 'Aro'].map(item => (
                  <div key={item} className="h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[8px] font-black text-white/40 uppercase tracking-widest hover:border-primary/40 hover:text-white transition-all cursor-pointer">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5">
             <Button variant="ghost" className="w-full h-12 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:text-primary rounded-xl">
                <Share2 className="h-3.5 w-3.5 mr-2" /> Exportar para RRSS
             </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
