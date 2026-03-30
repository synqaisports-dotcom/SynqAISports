
"use client";

import { Zap, ArrowRight, Share2, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BoardPromoLauncher() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase">Launcher_Promo_Restricted</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          PIZARRA_PROMO
        </h1>
      </div>
      
      <div className="max-w-3xl mx-auto text-center space-y-12 pt-12">
         <div className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Terminal de Captación de Red</h2>
            <p className="text-white/40 font-bold uppercase text-[11px] leading-relaxed tracking-[0.3em] mx-auto max-w-xl">
              Esta terminal permite a los usuarios externos probar las herramientas de dibujo de SynqAI con un límite de 4 sesiones. Ideal para campañas de marketing y leads.
            </p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-2 group hover:border-primary/20 transition-all">
               <MousePointerClick className="h-6 w-6 text-primary/40 mx-auto group-hover:text-primary transition-colors" />
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Modo Guest</p>
            </div>
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-2 group hover:border-primary/20 transition-all">
               <Share2 className="h-6 w-6 text-primary/40 mx-auto group-hover:text-primary transition-colors" />
               <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Link Público</p>
            </div>
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-2">
               <span className="text-2xl font-black text-primary italic">4</span>
               <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Límite Usos</p>
            </div>
         </div>

         <Button className="h-20 w-full max-w-md bg-primary text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl cyan-glow hover:scale-[1.02] transition-all border-none" asChild>
            <Link href="/board/promo">
              <Zap className="h-5 w-5 mr-3" /> ABRIR PIZARRA PROMOCIONAL
            </Link>
         </Button>
      </div>
    </div>
  );
}
