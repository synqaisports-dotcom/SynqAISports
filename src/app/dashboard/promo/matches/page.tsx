
"use client";

import { useState, useEffect } from "react";
import { 
  Swords, 
  Plus, 
  Trash2, 
  Trophy, 
  Zap, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Monitor,
  Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter, 
  SheetClose
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MAX_MATCHES = 20;

export default function PromoMatchesPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [], matches: [] });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [formData, setFormData] = useState({
    rival: "",
    date: new Date().toISOString().split('T')[0],
    location: "Local",
    status: "Scheduled"
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": [], "matches": []}');
    setVault(saved);
  }, []);

  const totalUsed = vault.matches?.length || 0;
  const progressPercent = (totalUsed / MAX_MATCHES) * 100;

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalUsed >= MAX_MATCHES) {
      toast({ variant: "destructive", title: "CUOTA_AGOTADA", description: "Has alcanzado el límite de 20 partidos locales." });
      return;
    }

    const newMatch = {
      id: Date.now(),
      date: formData.date,
      rivalName: formData.rival.toUpperCase(),
      location: formData.location,
      status: formData.status,
      score: { home: 0, guest: 0 }
    };

    const nextVault = { ...vault, matches: [newMatch, ...(vault.matches || [])] };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    setIsSheetOpen(false);
    toast({ title: "PARTIDO_AGENDADO", description: "Encuentro añadido a tu calendario Sandbox." });
  };

  const handleDeleteMatch = (id: number) => {
    const nextVault = { ...vault, matches: vault.matches.filter((m: any) => m.id !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "SLOT_LIBERADO", description: "Partido eliminado del historial local." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Swords className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Local_Competition_Manager_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            MIS_PARTIDOS
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Calendario y Resultados Sandbox</p>
        </div>

        <div className="flex gap-6 items-center">
           <div className="w-48 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-primary/60">
                 <span>Slots Partidos</span>
                 <span>{totalUsed} / {MAX_MATCHES}</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-white/5" />
           </div>
           <Button 
            onClick={() => setIsSheetOpen(true)}
            className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl blue-glow hover:scale-105 transition-all border-none"
           >
            <Plus className="h-4 w-4 mr-2" /> Agendar Partido
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
          {(vault.matches || []).map((match: any) => (
            <Card key={match.id} className="glass-panel border-white/5 bg-black/40 rounded-3xl overflow-hidden group hover:border-primary/30 transition-all relative">
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button onClick={() => handleDeleteMatch(match.id)} className="text-rose-500/40 hover:text-rose-500"><Trash2 className="h-4 w-4" /></button>
               </div>
               <CardHeader className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-2">
                     <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">{match.date}</Badge>
                     <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{match.location}</span>
                  </div>
                  <CardTitle className="text-lg font-black text-white uppercase italic truncate">vs {match.rivalName}</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-6 py-4 bg-primary/5 rounded-2xl border border-primary/10">
                     <div className="text-center">
                        <p className="text-[8px] font-black text-white/20 uppercase mb-1">LOCAL</p>
                        <p className="text-3xl font-black text-white">{match.score?.home || 0}</p>
                     </div>
                     <div className="text-2xl font-black text-primary/20 italic">-</div>
                     <div className="text-center">
                        <p className="text-[8px] font-black text-white/20 uppercase mb-1">RIVAL</p>
                        <p className="text-3xl font-black text-white">{match.score?.guest || 0}</p>
                     </div>
                  </div>
               </CardContent>
               <CardFooter className="p-4 bg-black/40 flex justify-center">
                  <Button variant="ghost" className="w-full text-[9px] font-black uppercase text-primary/60 hover:text-primary" asChild>
                     <Link href="/board/match">DIRIGIR PARTIDO <ArrowRight className="h-3 w-3 ml-2" /></Link>
                  </Button>
               </CardFooter>
            </Card>
          ))}
          
          {totalUsed < MAX_MATCHES && (
            <button 
              onClick={() => setIsSheetOpen(true)}
              className="h-[280px] border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 bg-white/[0.01] group hover:border-primary/20 hover:bg-primary/[0.02] transition-all"
            >
               <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white/10 group-hover:text-primary/40" />
               </div>
               <span className="text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40">Añadir Slot de Temporada</span>
            </button>
          )}
        </div>

        <aside className="space-y-8">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Zap className="h-32 w-32 text-primary" /></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">HISTORIAL_SINCRO</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-8 leading-loose italic">
              Al pulsar "Guardar" en la Pizarra de Partido, el marcador se vuelca automáticamente en esta terminal para que lleves el control de tu liga local.
            </p>
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary">Ventaja Pro</span>
               </div>
               <p className="text-[9px] text-white/20 uppercase font-bold leading-relaxed italic">
                 El modo Elite Club sincroniza los goles con las apps de los padres y genera analíticas de rendimiento por jugador automáticamente.
               </p>
               <Button className="w-full h-12 bg-primary text-black font-black uppercase text-[9px] tracking-widest rounded-xl blue-glow border-none" asChild>
                  <Link href="/login">UPGRADE A PRO</Link>
               </Button>
            </div>
          </Card>

          <div className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center group">
             <Megaphone className="h-10 w-10 text-white/10 mb-4 group-hover:text-primary/20 transition-colors" />
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Google_Ad_Slot_Vertical_Competition</p>
          </div>
        </aside>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Match_Asset_Deploy</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">AGENDAR PARTIDO</SheetTitle>
            </SheetHeader>
          </div>

          <form onSubmit={handleAddMatch} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Nombre del Rival</Label>
                <Input 
                  required
                  value={formData.rival}
                  onChange={(e) => setFormData({...formData, rival: e.target.value})}
                  placeholder="EJ: CLUB DEPORTIVO CIUDAD" 
                  className="h-14 bg-white/5 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Fecha del Encuentro</Label>
                <Input 
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="h-14 bg-white/5 border-primary/20 rounded-2xl font-bold focus:border-primary text-primary [color-scheme:dark]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Ubicación</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({...formData, location: v})}>
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20">
                      <SelectItem value="Local" className="text-[10px] font-black uppercase">EN CASA</SelectItem>
                      <SelectItem value="Visitante" className="text-[10px] font-black uppercase">FUERA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Estado</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-xl text-white font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20">
                      <SelectItem value="Scheduled" className="text-[10px] font-black uppercase">PROGRAMADO</SelectItem>
                      <SelectItem value="Played" className="text-[10px] font-black uppercase">FINALIZADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">Aviso de Slot Local</span>
              </div>
              <p className="text-[9px] text-primary/40 leading-relaxed font-bold uppercase italic">
                La creación de este slot permite vincular los datos del cronómetro y marcador en tiempo real durante el partido.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary/60 font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 rounded-2xl transition-all">CANCELAR</Button>
            </SheetClose>
            <Button onClick={handleAddMatch} className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl blue-glow hover:scale-[1.02] transition-all">SINCRO_PARTIDO</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
