"use client";

import { 
  ChevronLeft, 
  Zap, 
  ShieldCheck, 
  Shield,
  Download,
  Share2,
  QrCode
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTutor } from "@/app/tutor/tutor-client-layout";
import { QRCodeCanvas } from "qrcode.react";

export default function AthleteIDPage() {
  const { selectedChild } = useTutor();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#020408]">
      <header className="p-8 bg-[#04070c] border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">CARNET</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Acceso Digital</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
        <div className="relative aspect-[1.6/1] w-full bg-gradient-to-br from-primary/20 via-black to-black border-2 border-primary/30 rounded-[2.5rem] overflow-hidden shadow-2xl group transition-all hover:border-primary/60">
           <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all"><Zap className="h-32 w-32 text-primary" /></div>
           
           <div className="p-8 relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">SYNQAI_ID_NODE</span>
                    <h2 className="text-2xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">{selectedChild.name}</h2>
                 </div>
                 <div className="h-12 w-12 bg-black border border-primary/40 rounded-xl flex items-center justify-center text-xl font-black text-primary italic">#{selectedChild.number}</div>
              </div>

              <div className="flex justify-between items-end">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <Shield className="h-3 w-3 text-primary/40" />
                       <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{selectedChild.team}</span>
                    </div>
                    <Badge className="bg-primary text-black font-black text-[8px] px-3 py-1 uppercase rounded-none tracking-widest">{selectedChild.category}</Badge>
                 </div>
                 <div className="text-right">
                    <p className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Status</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase italic tracking-widest">ACTIVE_MEMBER</p>
                 </div>
              </div>
           </div>
        </div>

        <section className="space-y-6 text-center">
           <div className="flex items-center justify-center gap-3">
              <QrCode className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">CÓDIGO_DE_ACCESO</h3>
           </div>

           <div className="p-8 bg-white rounded-[3rem] inline-block shadow-[0_0_50px_rgba(0,242,255,0.2)] group hover:scale-105 transition-transform cursor-pointer">
              <QRCodeCanvas value={`SYNQAI_USER_${selectedChild.id}`} size={200} level="H" />
           </div>

           <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed italic max-w-xs mx-auto">
             Muestre este código en el terminal de la instalación para registrar la asistencia automáticamente.
           </p>
        </section>

        <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-4">
           <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest italic">Vínculo Seguro Activo</span>
           </div>
           <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic tracking-widest">
             Este carnet es personal e intransferible. La suplantación de identidad en la red SynqAI conlleva la suspensión inmediata del nodo de familia.
           </p>
        </div>
      </div>

      <div className="p-8 border-t border-white/5 bg-[#04070c]/50 flex gap-4">
         <button className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all">
            <Share2 className="h-4 w-4" /> Compartir
         </button>
         <button className="flex-1 h-14 bg-primary text-black rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
            <Shield className="h-4 w-4" /> Añadir Wallet
         </button>
      </div>
    </div>
  );
}
