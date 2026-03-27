
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
  Megaphone,
  Download,
  ClipboardList,
  Flame,
  Dumbbell,
  Wind,
  Pencil
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter, 
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const MAX_SESSIONS = 4;

/**
 * Mi Agenda Promo - v10.0.0
 * PROTOCOLO_SESSION_COMPOSITION: Ahora permite crear sesiones reales vinculando tareas locales.
 */
export default function PromoSessionsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [] });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    warmupId: "",
    mainId: "",
    cooldownId: ""
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": []}');
    setVault(saved);
  }, []);

  const warmupTasks = vault.exercises?.filter((e: any) => e.block === 'warmup') || [];
  const mainTasks = vault.exercises?.filter((e: any) => e.block === 'main') || [];
  const cooldownTasks = vault.exercises?.filter((e: any) => e.block === 'cooldown') || [];

  const handleDeleteSession = (id: number) => {
    const nextVault = { ...vault, sessions: vault.sessions.filter((s: any) => s.id !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "SESIÓN_LIBERADA", description: "Plan diario eliminado del Sandbox." });
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (vault.sessions.length >= MAX_SESSIONS) {
      toast({ variant: "destructive", title: "CUOTA_AGOTADA", description: "Límite de 4 sesiones alcanzado." });
      return;
    }

    const newSession = {
      id: Date.now(),
      title: formData.title.toUpperCase() || `SESIÓN_${vault.sessions.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0],
      warmup: warmupTasks.find((t: any) => t.id.toString() === formData.warmupId),
      main: mainTasks.find((t: any) => t.id.toString() === formData.mainId),
      cooldown: cooldownTasks.find((t: any) => t.id.toString() === formData.cooldownId)
    };

    const nextVault = { ...vault, sessions: [newSession, ...(vault.sessions || [])] };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    setIsSheetOpen(false);
    setFormData({ title: "", warmupId: "", mainId: "", cooldownId: "" });
    toast({ title: "SESIÓN_PLANIFICADA", description: "Plan diario añadido a tu agenda Sandbox." });
  };

  const handlePrintSession = () => {
    toast({
      title: "GENERANDO_FICHA_DE_CAMPO",
      description: "Preparando documento optimizado con los 3 bloques de la sesión.",
    });
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12 print:p-0 print:bg-white">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8 print:border-black/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 print:hidden">
            <Calendar className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Sandbox_Agenda_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none print:text-black print:text-glow-none">
            MI_AGENDA_PROMO
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase print:text-black/40">Planificación Diaria Simplificada</p>
        </div>

        <div className="flex items-center gap-4">
           <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-2xl print:hidden">
             CUOTA: {vault.sessions?.length || 0} / {MAX_SESSIONS} SESIONES
           </Badge>
           <Button onClick={handlePrintSession} className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl blue-glow hover:scale-105 transition-all border-none print:hidden">
              <Download className="h-4 w-4 mr-2" /> Ficha de Sesión (PDF)
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 print:grid-cols-1">
        {Array.from({ length: MAX_SESSIONS }).map((_, i) => {
          const session = vault.sessions?.[i];
          return (
            <div key={i} className="space-y-4 print:mb-8">
               <div className="flex items-center justify-between px-2 print:hidden">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Slot_0{i+1}</span>
                  {session && (
                    <button onClick={() => handleDeleteSession(session.id)} className="text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  )}
               </div>
               
               {session ? (
                 <Card className="glass-panel border-primary/30 bg-primary/5 rounded-[2.5rem] overflow-hidden relative group print:bg-white print:border-black/10">
                    <CardHeader className="p-8 border-b border-white/5 bg-black/40 print:bg-black/5 print:border-black/10">
                       <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase leading-none print:text-black truncate">{session.title}</CardTitle>
                       <CardDescription className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-2 print:text-black/40">Protocolo de Entrenamiento • ID: {session.id.toString().slice(-4)}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                       <SessionPart label="Activación" status={session.warmup ? "SINCRO_OK" : "PENDIENTE"} active={!!session.warmup} />
                       <SessionPart label="Parte Principal" status={session.main ? "SINCRO_OK" : "PENDIENTE"} active={!!session.main} />
                       <SessionPart label="Vuelta a la Calma" status={session.cooldown ? "SINCRO_OK" : "PENDIENTE"} active={!!session.cooldown} />
                    </CardContent>
                    <CardFooter className="p-6 bg-black/40 border-t border-white/5 flex justify-center print:hidden">
                       <Button variant="ghost" className="text-[9px] font-black text-primary uppercase tracking-widest hover:blue-text-glow" asChild>
                          <Link href="/board/match?source=sandbox">DIRIGIR EN PARTIDO <ArrowRight className="h-3 w-3 ml-2" /></Link>
                       </Button>
                    </CardFooter>
                 </Card>
               ) : (
                 <Sheet open={isSheetOpen && i === vault.sessions?.length} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <button 
                        disabled={i !== (vault.sessions?.length || 0)}
                        className="h-[400px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-white/[0.01] group hover:border-primary/20 hover:bg-primary/[0.02] transition-all print:hidden disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-white/10 group-hover:text-primary/40" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40">Crear Plan Diario</p>
                            <p className="text-[8px] font-bold text-white/5 uppercase tracking-widest italic group-hover:text-primary/20">Slot Disponible</p>
                        </div>
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
                      <div className="p-8 border-b border-white/5 bg-black/40">
                        <SheetHeader className="space-y-4">
                          <div className="flex items-center gap-3">
                            <ClipboardList className="h-5 w-5 text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Architect_Session_v1.0</span>
                          </div>
                          <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">PLANIFICAR <span className="text-primary">DÍA</span></SheetTitle>
                          <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left italic">
                            Ensamble su sesión vinculando tareas del almacén local.
                          </SheetDescription>
                        </SheetHeader>
                      </div>

                      <form onSubmit={handleCreateSession} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Identificador de Sesión</Label>
                            <Input 
                              value={formData.title} 
                              onChange={(e) => setFormData({...formData, title: e.target.value.toUpperCase()})} 
                              placeholder="EJ: MICROCICLO_AJUSTE_01" 
                              className="h-14 bg-black/40 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary text-lg" 
                            />
                          </div>

                          <div className="space-y-8 pt-4">
                            {/* BLOQUE 1: CALENTAMIENTO */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white">1. Activación (Warmup)</Label>
                              </div>
                              {warmupTasks.length > 0 ? (
                                <Select value={formData.warmupId} onValueChange={(v) => setFormData({...formData, warmupId: v})}>
                                  <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl text-[10px] font-black uppercase">
                                    <SelectValue placeholder="SELECCIONAR TAREA..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                                    {warmupTasks.map((t: any) => (
                                      <SelectItem key={t.id} value={t.id.toString()} className="text-[10px] font-black uppercase">{t.metadata?.title || `Tarea_${t.id.toString().slice(-4)}`}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Link href="/board/promo" className="flex items-center justify-between p-4 bg-orange-500/5 border border-dashed border-orange-500/20 rounded-xl group hover:border-orange-500/40 transition-all">
                                  <span className="text-[9px] font-bold text-orange-500/40 uppercase tracking-widest">No hay tareas Warmup</span>
                                  <Pencil className="h-3 w-3 text-orange-500/40 group-hover:text-orange-500" />
                                </Link>
                              )}
                            </div>

                            {/* BLOQUE 2: PARTE PRINCIPAL */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Dumbbell className="h-4 w-4 text-amber-500" />
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white">2. Parte Principal (Main)</Label>
                              </div>
                              {mainTasks.length > 0 ? (
                                <Select value={formData.mainId} onValueChange={(v) => setFormData({...formData, mainId: v})}>
                                  <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl text-[10px] font-black uppercase">
                                    <SelectValue placeholder="SELECCIONAR TAREA..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                                    {mainTasks.map((t: any) => (
                                      <SelectItem key={t.id} value={t.id.toString()} className="text-[10px] font-black uppercase">{t.metadata?.title || `Tarea_${t.id.toString().slice(-4)}`}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Link href="/board/promo" className="flex items-center justify-between p-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl group hover:border-amber-500/40 transition-all">
                                  <span className="text-[9px] font-bold text-amber-500/40 uppercase tracking-widest">No hay tareas Main</span>
                                  <Pencil className="h-3 w-3 text-amber-500/40 group-hover:text-amber-500" />
                                </Link>
                              )}
                            </div>

                            {/* BLOQUE 3: VUELTA A LA CALMA */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Wind className="h-4 w-4 text-blue-400" />
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white">3. Vuelta a la Calma (Cool)</Label>
                              </div>
                              {cooldownTasks.length > 0 ? (
                                <Select value={formData.cooldownId} onValueChange={(v) => setFormData({...formData, cooldownId: v})}>
                                  <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl text-[10px] font-black uppercase">
                                    <SelectValue placeholder="SELECCIONAR TAREA..." />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                                    {cooldownTasks.map((t: any) => (
                                      <SelectItem key={t.id} value={t.id.toString()} className="text-[10px] font-black uppercase">{t.metadata?.title || `Tarea_${t.id.toString().slice(-4)}`}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Link href="/board/promo" className="flex items-center justify-between p-4 bg-blue-500/5 border border-dashed border-blue-500/20 rounded-xl group hover:border-blue-500/40 transition-all">
                                  <span className="text-[9px] font-bold text-blue-500/40 uppercase tracking-widest">No hay tareas Cool</span>
                                  <Pencil className="h-3 w-3 text-blue-500/40 group-hover:text-blue-500" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-3">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">Aviso de Composición</span>
                          </div>
                          <p className="text-[9px] text-primary/40 leading-relaxed font-bold uppercase italic">
                            Vincule al menos una tarea para activar el protocolo de sesión. Las tareas no asignadas aparecerán como "PENDIENTES" en la agenda.
                          </p>
                        </div>
                      </form>

                      <div className="p-8 bg-black/60 border-t border-white/5 flex gap-4">
                        <SheetClose asChild>
                          <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary/60 font-black uppercase text-[11px] tracking-widest rounded-2xl">CANCELAR</Button>
                        </SheetClose>
                        <Button onClick={handleCreateSession} className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl blue-glow hover:scale-[1.02] transition-all">ENSAMBLAR_PLAN</Button>
                      </div>
                    </SheetContent>
                 </Sheet>
               )}
            </div>
          );
        })}
      </div>

      <div className="mt-16 p-12 bg-black/40 border-2 border-primary/20 rounded-[3rem] relative overflow-hidden group print:hidden">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 print:hidden">
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

function SessionPart({ label, status, active }: { label: string, status: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-black/40 border rounded-2xl group transition-all print:bg-white print:border-black/10",
      active ? "border-white/10 hover:border-primary/20" : "border-dashed border-white/5 opacity-40"
    )}>
       <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest print:text-black/40">{label}</span>
          <span className={cn(
            "text-[10px] font-black uppercase italic mt-0.5 print:text-black",
            active ? "text-white" : "text-white/20"
          )}>{status}</span>
       </div>
       {active ? (
         <CheckCircle2 className="h-4 w-4 text-emerald-500/40 group-hover:text-emerald-500 transition-colors print:text-emerald-600" />
       ) : (
         <Lock className="h-4 w-4 text-white/10" />
       )}
    </div>
  );
}
