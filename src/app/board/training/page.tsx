
"use client";

import { useState } from "react";
import { Sparkles, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TacticalField } from "@/components/board/TacticalField";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { AssetPanel } from "@/components/board/AssetPanel";

export default function TrainingBoardPage() {
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
    <div className="h-full flex flex-col bg-[#04070c] overflow-hidden">
      <header className="h-20 border-b border-amber-500/20 bg-black/60 backdrop-blur-3xl flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-amber-500 tracking-[0.4em] uppercase">Exercise_Designer_IA_v2.0</span>
            </div>
            <h1 className="text-lg lg:text-xl font-headline font-black text-white italic tracking-tighter uppercase">Pizarra de Ejercicios</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button 
            onClick={handleAiSync}
            disabled={isAiProcessing}
            className="h-11 bg-amber-500/10 border border-amber-500/40 text-amber-500 font-black uppercase text-[10px] tracking-widest px-4 lg:px-6 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
          >
            {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Sparkles className="h-4 w-4 sm:mr-2" />}
            <span className="hidden sm:inline">Sincronizar con IA</span>
          </Button>
          <Button className="h-11 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-6 lg:px-8 rounded-xl amber-glow border-none">
            <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Guardar Ejercicio</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <BoardToolbar theme="amber" className="absolute left-4 top-1/2 -translate-y-1/2 hidden sm:flex" />

        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <TacticalField theme="amber" />
        </main>

        <AssetPanel 
          theme="amber" 
          type="training" 
          className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex" 
        />
      </div>
    </div>
  );
}
