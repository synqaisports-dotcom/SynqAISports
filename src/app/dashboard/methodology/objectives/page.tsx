
"use client";

import { Target, Sparkles } from "lucide-react";

export default function ObjectivesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase">Tactical_Objectives_v1.0</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow">
          OBJETIVOS_TÁCTICOS
        </h1>
      </div>
      
      <div className="p-20 text-center space-y-4 border border-dashed border-amber-500/20 bg-amber-500/5 rounded-[3rem]">
         <Sparkles className="h-12 w-12 text-amber-500/20 mx-auto animate-pulse" />
         <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[1em]">Defina los objetivos por etapa y categoría</p>
      </div>
    </div>
  );
}
