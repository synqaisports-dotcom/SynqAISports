"use client";

import { useState } from "react";
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  Fingerprint, 
  User,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function OnboardingTunnel() {
  const [clubName, setClubName] = useState("");

  return (
    <div className="min-h-screen bg-[#04070c] relative overflow-hidden flex">
      {/* FUTURISTIC GRID OVERLAY */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* SIDEBAR (GREYED OUT / INACTIVE) */}
      <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col p-6 opacity-40 grayscale pointer-events-none z-20">
        <div className="flex items-center gap-3 mb-12">
           <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center">
             <Zap className="h-4 w-4 text-primary" />
           </div>
           <span className="font-headline font-black text-white italic tracking-tighter">SYNQAI Coach</span>
        </div>
        
        <nav className="space-y-4 flex-1">
          {['Panel', 'Plantilla', 'Club', 'Competición', 'Informes', 'Familias', 'Admin', 'Laboratorio'].map(item => (
            <div key={item} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <div className="w-1 h-1 rounded-full bg-white/10" />
              {item}
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-3 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
             <ShieldCheck className="h-4 w-4" /> TÚNEL DE SEGURIDAD
          </div>
          <div className="px-3 text-[8px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-3">
             <Lock className="h-3 w-3" /> Sincronización con fundador
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-5xl space-y-16">
          
          {/* HEADER SECTION */}
          <div className="text-center space-y-8">
            <h1 className="text-6xl font-headline font-black text-white italic tracking-tighter cyan-text-glow">
              CREAR PERFIL DE CLUB
            </h1>
            
            {/* PROGRESS TUNNEL */}
            <div className="w-full max-w-3xl mx-auto space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-[4px] flex-1 bg-primary cyan-glow rounded-full" />
                <div className="h-[4px] flex-1 bg-white/10 rounded-full" />
                <div className="h-[4px] flex-1 bg-white/10 rounded-full" />
                <div className="h-[4px] flex-1 bg-white/10 rounded-full" />
              </div>
              <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-primary">Paso 1: Datos del Club</span>
                <span className="text-white/20 text-center">Tácticas Iniciales</span>
                <span className="text-white/20 text-center">Jugadores Base</span>
                <span className="text-white/20 text-right">Paso 2: Constarlo</span>
              </div>
            </div>
          </div>

          {/* MAIN FORM PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
            
            {/* LEFT: SECURITY STATUS */}
            <div className="space-y-8 py-8 px-12 border-r border-white/5">
              <div className="flex items-center gap-6">
                 <div className="relative">
                    <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse" />
                    <div className="relative h-20 w-20 rounded-full border-2 border-primary bg-black/60 flex items-center justify-center pulse-glow">
                       <Lock className="h-10 w-10 text-primary" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-tight">
                      VALIDANDO IDENTIDAD<br />DE FUNDADOR - <span className="text-white">ACCESO</span>
                    </p>
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                      EXCLUSIVO AL NODO UID
                    </p>
                 </div>
              </div>

              <div className="pt-12 flex items-center gap-8">
                <div className="flex flex-col items-center gap-2 opacity-30">
                   <div className="h-12 w-12 border border-white/20 flex items-center justify-center rotate-45">
                      <Fingerprint className="h-6 w-6 -rotate-45" />
                   </div>
                   <span className="text-[8px] font-black uppercase tracking-widest">ID de Invitación</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/10" />
                <div className="flex flex-col items-start gap-1">
                   <span className="text-5xl font-headline font-black text-primary italic cyan-text-glow leading-none">UID</span>
                   <span className="text-[8px] font-black text-white uppercase tracking-[0.3em] mt-2">VINCULACIÓN ÚNICA<br />A UID DE USUARIO</span>
                </div>
              </div>
            </div>

            {/* RIGHT: CLUB FORM */}
            <div className="glass-panel p-12 space-y-8 relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Zap className="h-24 w-24 text-primary" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Nombre del Club</label>
                  <Input 
                    placeholder="Ej. FC Barcelona Acadèmia"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="h-16 bg-white/5 border-primary/40 rounded-none text-xl font-bold italic tracking-tight focus:border-primary focus:ring-primary/20 transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Categoría</label>
                  <Select>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-none text-white/40 font-bold uppercase tracking-widest">
                      <SelectValue placeholder="SELECCIONAR CATEGORÍA..." />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-primary/20 rounded-none">
                      <SelectItem value="elite">Academia de Élite</SelectItem>
                      <SelectItem value="pro">Club Profesional</SelectItem>
                      <SelectItem value="grassroots">Fútbol Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                className="w-full h-20 bg-primary text-primary-foreground font-black text-lg uppercase tracking-[0.4em] rounded-none cyan-glow hover:scale-[1.02] active:scale-95 transition-all mt-8"
              >
                GENERAR DATOS DEL CLUB
              </Button>
            </div>

          </div>
        </div>
        
        {/* FOOTER LOGOS */}
        <div className="absolute bottom-8 left-12 right-12 flex justify-between items-center opacity-30">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-sm bg-white/10 flex items-center justify-center text-[10px] font-black">N</div>
             <span className="text-[8px] font-black uppercase tracking-widest">Neural Sync</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center">
                <Zap className="h-3 w-3" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest">SynqAI Framework</span>
           </div>
        </div>
      </main>
    </div>
  );
}