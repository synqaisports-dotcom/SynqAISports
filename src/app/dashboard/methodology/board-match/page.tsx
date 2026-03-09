
"use client";

import { Monitor, Sparkles } from "lucide-react";

export default function BoardMatchPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase">Match_Board_Elite</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow">
          PIZARRA_DE_PARTIDO
        </h1>
      </div>
      
      <div className="p-20 text-center space-y-4 border border-dashed border-amber-500/20 bg-amber-500/5 rounded-[3rem]">
         <Sparkles className="h-12 w-12 text-amber-500/20 mx-auto animate-pulse" />
         <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[1em]">Terminal táctica de alta competición</p>
      </div>
    </div>
  );
}
