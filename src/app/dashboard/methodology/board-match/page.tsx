
"use client";

import { Trophy, ArrowRight, Monitor, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BoardMatchLauncher() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase">Launcher_Match_Elite</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          PIZARRA_DE_PARTIDO
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-12">
        <div className="space-y-8">
           <div className="space-y-4">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Terminal Táctica de Tiempo Real</h2>
              <p className="text-white/40 font-bold uppercase text-xs leading-loose tracking-widest">
                Acceda a la micro-app independiente optimizada para tablets y banquillos. Incluye marcador dinámico, cronómetro de periodos y guardado rápido de jugadas.
              </p>
           </div>
           
           <div className="flex flex-col gap-4">
              <Button className="h-20 bg-primary text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl cyan-glow hover:scale-[1.02] transition-all border-none" asChild>
                <Link href="/board/match?source=elite">
                  <Play className="h-5 w-5 mr-3" /> INICIAR TERMINAL DE PARTIDO
                </Link>
              </Button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/5 rounded-2xl">
                 <Monitor className="h-4 w-4 text-primary/40" />
                 <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Recomendado: Pantalla Completa (F11)</span>
              </div>
           </div>
        </div>

        <div className="aspect-video bg-black border border-primary/20 rounded-[3rem] overflow-hidden relative group">
           <div className="absolute inset-0 bg-grid-pattern opacity-10" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="h-32 w-32 text-primary/10 group-hover:scale-110 transition-transform duration-1000" />
           </div>
           <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Estado de Sincronización</p>
              <p className="text-xs font-black text-white uppercase italic">Listo para despliegue en jornada 14</p>
           </div>
        </div>
      </div>
    </div>
  );
}
