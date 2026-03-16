
"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Lock, 
  Zap, 
  Clock, 
  LayoutGrid, 
  CheckCircle2,
  Info,
  ArrowRight,
  CalendarDays,
  ShieldCheck,
  Smartphone,
  Megaphone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MAX_SESSIONS = 4;

export default function PromoSessionsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [] });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": []}');
    setVault(saved);
  }, []);

  const handleDeleteSession = (id: number) => {
    const nextVault = { ...vault, sessions: vault.sessions.filter((s: any) => s.id !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "SESIÓN_LIBERADA", description: "Plan diario eliminado del Sandbox." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Sandbox_Agenda_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            MI_AGENDA_PROMO
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Planificación Diaria Simplificada</p>
        </div>

        <div className="flex items-center gap-4">
           <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-2xl">
             CUOTA: {vault.sessions.length} / {MAX_SESSIONS} SESIONES
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: MAX_SESSIONS }).map((_, i) => {
          const session = vault.sessions[i];
          return (
            <div key={i} className="space-y-4">
               <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Slot_0{i+1}</span>
                  {session && (
                    <button onClick={() => handleDeleteSession(session.id)} className="text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
               </div>
               
               {session ? (
                 <Card className="glass-panel border-primary/30 bg-primary/5 rounded-[2.5rem] overflow-hidden relative group">
                    <CardHeader className="p-8 border-b border-white/5 bg-black/40">
                       <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">SESIÓN_ACTIVA</CardTitle>
                       <CardDescription className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-2">Protocolo de Entrenamiento</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                       <SessionPart label="Activación" status="SINCRO_OK" />
                       <SessionPart label="Parte Principal" status="SINCRO_OK" />
                       <SessionPart label="Vuelta a la Calma" status="SINCRO_OK" />
                    </CardContent>
                    <CardFooter className="p-6 bg-black/40 border-t border-white/5 flex justify-center">
                       <Button variant="ghost" className="text-[9px] font-black text-primary uppercase tracking-widest hover:blue-text-glow" asChild>
                          <Link href="/board/match">ABRIR EN PARTIDO <ArrowRight className="h-3 w-3 ml-2" /></Link>
                       </Button>
                    </CardFooter>
                 </Card>
               ) : (
                 <div className="h-[400px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-white/[0.01] group hover:border-primary/20 hover:bg-primary/[0.02] transition-all">
                    <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <Plus className="h-6 w-6 text-white/10 group-hover:text-primary/40" />
                    </div>
                    <div className="text-center space-y-1">
                       <p className="text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40">Crear Plan Diario</p>
                       <p className="text-[8px] font-bold text-white/5 uppercase tracking-widest italic group-hover:text-primary/20">Slot Disponible</p>
                    </div>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      <div className="mt-16 p-12 bg-black/40 border-2 border-primary/20 rounded-[3rem] relative overflow-hidden group">
         <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all"><CalendarDays className="h-48 w-48 text-primary" /></div>
         
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-center">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">Upgrade_To_Elite_Methodology</span>
               </div>
               <h2 className="text-4xl font-headline font-black text-white italic tracking-tighter uppercase leading-tight">
                  PLANIFICACIÓN SIN LÍMITES <br />
                  <span className="text-primary">PARA TU CLUB</span>
               </h2>
               <p className="text-white/40 font-bold uppercase text-[11px] tracking-[0.3em] leading-loose max-w-2xl">
                  Accede al Macrociclo Anual, control de asistencia en tiempo real, histórico de progresión de atletas y sincronización multiplataforma. Deja atrás los slots locales y profesionaliza tu cantera.
               </p>
            </div>
            <Button className="h-20 bg-primary text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl blue-glow hover:scale-[1.02] transition-all border-none" asChild>
               <Link href="/login">PASAR A MODO PRO <Zap className="h-5 w-5 ml-3" /></Link>
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
         <div className="p-8 glass-panel border-white/5 rounded-[2.5rem] flex items-center gap-6">
            <Smartphone className="h-10 w-10 text-primary/40" />
            <div>
               <p className="text-xs font-black text-white uppercase italic tracking-widest">Sincronización Watch</p>
               <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">El modo promo permite cronómetro y marcador en el reloj.</p>
            </div>
         </div>
         <div className="p-8 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex items-center justify-center group overflow-hidden">
            <Megaphone className="h-5 w-5 text-white/10 mr-4 group-hover:text-primary transition-colors" />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Google_Ad_Slot_Leaderboard_Sessions</span>
         </div>
      </div>
    </div>
  );
}

function SessionPart({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl group hover:border-primary/20 transition-all">
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
          <span className="text-[10px] font-black text-white uppercase italic mt-0.5">{status}</span>
       </div>
       <CheckCircle2 className="h-4 w-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
    </div>
  );
}
