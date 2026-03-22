
"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  MessageSquareQuote, 
  TrendingUp, 
  IdCard, 
  Zap, 
  Bell, 
  Clock, 
  ChevronRight, 
  UserCircle, 
  Trophy, 
  Info, 
  ChevronDown, 
  RefreshCw, 
  LayoutGrid,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTutor } from "@/app/tutor/layout";

const CHILDREN = [
  { id: 'c1', name: 'LUCAS GARCÍA', number: '10', team: 'INFANTIL A', category: 'FEDERADO' },
  { id: 'c2', name: 'MATEO GARCÍA', number: '7', team: 'BENJAMÍN B', category: 'FEDERADO' }
];

export default function TutorDashboard() {
  const { selectedChild, setSelectedChild, showAd } = useTutor();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleSwitchChild = (child: any) => {
    setSelectedChild(child);
    setIsSelectorOpen(false);
    showAd(); 
  };

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-700">
      {/* HEADER PERFIL Y SELECTOR MULTI-HIJO */}
      <header className="p-8 pb-12 border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent relative z-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none overflow-hidden rounded-b-[2.5rem]" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsSelectorOpen(!isSelectorOpen)}>
            <div className="h-16 w-16 bg-primary/10 border-2 border-primary/30 rounded-2xl flex items-center justify-center relative transition-transform group-active:scale-95">
              <UserCircle className="h-10 w-10 text-primary" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-[8px] font-black text-black">#{selectedChild.number}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">{selectedChild.name}</h2>
                <ChevronDown className={cn("h-4 w-4 text-primary transition-transform", isSelectorOpen && "rotate-180")} />
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase px-3">
                {selectedChild.team} • {selectedChild.category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-8 border-emerald-500/20 text-emerald-400 uppercase text-[7px] font-black tracking-widest hidden sm:flex">PUSH_ACTIVE</Badge>
            <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative active:scale-90 transition-all">
              <Bell className="h-5 w-5 text-white/40" />
              <div className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
            </button>
          </div>
        </div>

        {/* SELECTOR DESPLEGABLE */}
        {isSelectorOpen && (
          <div className="absolute top-24 left-8 right-8 z-[100] bg-[#0a0f18] border border-primary/20 rounded-3xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-2 duration-300">
            {CHILDREN.map((child) => (
              <button 
                key={child.id}
                onClick={() => handleSwitchChild(child)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                  selectedChild.id === child.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-[10px] font-black italic text-primary border border-primary/20">#{child.number}</div>
                  <span className="text-xs font-black text-white uppercase italic">{child.name}</span>
                </div>
                {selectedChild.id === child.id && <Zap className="h-3 w-3 text-primary animate-pulse" />}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* PRÓXIMO EVENTO */}
      <div className="px-6 py-4 relative z-20">
        <Card className="glass-panel border-primary/20 bg-[#0a0f18] p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">Hoy • 17:30</span>
              <span className="text-xs font-bold text-white uppercase tracking-tight">Entrenamiento Táctico</span>
            </div>
          </div>
          <Badge className="bg-primary text-black font-black text-[8px] px-3 uppercase">Campo 2</Badge>
        </Card>
      </div>

      {/* MÓDULOS OPERATIVOS */}
      <div className="flex-1 p-6 space-y-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          <ModuleButton 
            title="Agenda" 
            desc="Horarios y Sedes" 
            icon={CalendarDays} 
            href="/tutor/calendar" 
            color="text-primary" 
            bg="bg-primary/5" 
            border="border-primary/20"
          />
          <ModuleButton 
            title="Mensajes" 
            desc="Chat Directo" 
            icon={MessageSquareQuote} 
            href="/tutor/chat" 
            color="text-emerald-400" 
            bg="bg-emerald-500/5" 
            border="border-emerald-500/20"
            badge="2"
          />
          <ModuleButton 
            title="Progreso" 
            desc="Ver Asistencia" 
            icon={TrendingUp} 
            href="/tutor/stats" 
            color="text-amber-400" 
            bg="bg-amber-500/5" 
            border="border-amber-500/20"
          />
          <ModuleButton 
            title="Carnet" 
            desc="Acceso Digital" 
            icon={IdCard} 
            href="/tutor/id" 
            color="text-blue-400" 
            bg="bg-blue-500/5" 
            border="border-blue-500/20"
          />
        </div>

        {/* FEED DE NOTICIAS CLUB / SIMULACIÓN PUSH */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-white/30 tracking-[0.4em] italic uppercase">Avisos del Club</h3>
            <span className="text-[7px] font-black text-emerald-400/40 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="h-2 w-2" /> Canales Oficiales
            </span>
          </div>
          <div className="space-y-3">
            <ClubNotice title="Partido vs CD Ciudad" desc="Confirmada ubicación en Estadio Municipal." type="match" />
            <ClubNotice title="Nueva Equipación" desc="Ya disponible para recogida en oficinas." type="info" />
          </div>
        </section>

        {/* PUBLICIDAD INTEGRADA (BANNER) */}
        <div className="p-4 bg-primary/5 border border-dashed border-primary/20 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-primary/[0.08] transition-all">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center">
                 <RefreshCw className="h-4 w-4 text-primary/40 animate-spin-slow" />
              </div>
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-primary/60 uppercase tracking-[0.2em] italic">Multiplex_Ad_Node</span>
                 <span className="text-[9px] font-bold text-white/40 uppercase">Sponsor: Academia Nike Training</span>
              </div>
           </div>
           <ChevronRight className="h-4 w-4 text-white/10 group-hover:text-primary transition-all" />
        </div>
      </div>
    </div>
  );
}

function ModuleButton({ title, desc, icon: Icon, href, color, bg, border, badge }: any) {
  return (
    <Link href={href} className={cn("p-6 rounded-[2.5rem] border flex flex-col gap-4 relative overflow-hidden transition-all active:scale-95 shadow-xl", bg, border)}>
      {badge && (
        <div className="absolute top-4 right-4 h-5 w-5 bg-rose-500 rounded-full border-2 border-[#020408] flex items-center justify-center animate-bounce">
          <span className="text-[8px] font-black text-white">{badge}</span>
        </div>
      )}
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", border)}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-black text-white uppercase italic leading-none">{title}</h4>
        <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{desc}</p>
      </div>
    </Link>
  );
}

function ClubNotice({ title, desc, type }: any) {
  return (
    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4 group active:bg-white/5 transition-all">
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
        type === 'match' ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/40'
      )}>
        {type === 'match' ? <Trophy className="h-5 w-5" /> : <Info className="h-5 w-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white uppercase italic truncate">{title}</p>
        <p className="text-[9px] font-bold text-white/20 uppercase truncate tracking-tight">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-white/10 group-active:text-primary transition-all" />
    </div>
  );
}
