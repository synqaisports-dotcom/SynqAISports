
"use client";

import { useState, useEffect } from "react";
import { 
  CalendarDays, 
  MessageSquareQuote, 
  TrendingUp, 
  IdCard, 
  Zap, 
  Bell, 
  MapPin, 
  Clock, 
  ChevronRight,
  UserCircle,
  Trophy,
  Dumbbell,
  Smartphone
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Dashboard del Tutor - v1.0.0
 * Centro operativo modular para familias.
 */
export default function TutorDashboard() {
  const [childName, setChildName] = useState("LUCAS GARCÍA");
  const [team, setTeam] = useState("INFANTIL A");

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-700">
      {/* HEADER PERFIL */}
      <header className="p-8 pb-12 border-b border-white/5 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary/10 border-2 border-primary/30 rounded-2xl flex items-center justify-center relative">
              <UserCircle className="h-10 w-10 text-primary" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                <span className="text-[8px] font-black text-black">#10</span>
              </div>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-headline font-black text-white italic tracking-tighter uppercase">{childName}</h2>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[8px] font-black uppercase px-3">
                {team} • FEDERADO
              </Badge>
            </div>
          </div>
          <button className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative">
            <Bell className="h-5 w-5 text-white/40" />
            <div className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
          </button>
        </div>
      </header>

      {/* PRÓXIMO EVENTO (ALERTA) */}
      <div className="px-6 -mt-6 relative z-20">
        <Card className="glass-panel border-primary/20 bg-[#0a0f18] p-5 rounded-[2rem] shadow-2xl flex items-center justify-between">
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
      <div className="flex-1 p-6 space-y-6">
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
            desc="Evolución Técnica" 
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

        {/* FEED DE NOTICIAS CLUB */}
        <section className="space-y-4 pt-4">
          <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.4em] px-2 italic">Avisos del Club</h3>
          <div className="space-y-3">
            <ClubNotice title="Partido vs CD Ciudad" desc="Confirmada ubicación en Estadio Municipal." type="match" />
            <ClubNotice title="Nueva Equipación" desc="Ya disponible para recogida en oficinas." type="info" />
          </div>
        </section>
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <nav className="h-20 bg-[#04070c]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6">
        <NavItem icon={Zap} active />
        <NavItem icon={CalendarDays} />
        <NavItem icon={MessageSquareQuote} />
        <NavItem icon={UserCircle} />
      </nav>
    </div>
  );
}

function ModuleButton({ title, desc, icon: Icon, href, color, bg, border, badge }: any) {
  return (
    <Link href={href} className={cn("p-6 rounded-[2.5rem] border flex flex-col gap-4 relative overflow-hidden transition-all active:scale-95", bg, border)}>
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

function NavItem({ icon: Icon, active }: any) {
  return (
    <button className={cn(
      "h-12 w-12 rounded-2xl flex items-center justify-center transition-all relative",
      active ? "bg-primary/10 text-primary" : "text-white/20 hover:text-white"
    )}>
      <Icon className="h-6 w-6" />
      {active && <div className="absolute -bottom-1 h-1 w-4 bg-primary rounded-full" />}
    </button>
  );
}
