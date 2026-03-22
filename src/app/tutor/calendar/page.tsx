
"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Trophy, 
  Dumbbell, 
  CheckCircle2,
  ChevronRight,
  Zap,
  Info
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_EVENTS = [
  { id: 1, type: 'train', title: "Entrenamiento Táctico", time: "17:30 - 19:00", location: "Campo 2 (Mitad Norte)", date: "Lunes, 12 Oct", status: 'SINCRO_OK' },
  { id: 2, type: 'match', title: "Jornada 14: vs CD Leganés", time: "10:00 - 12:00", location: "Anexo Butarque", date: "Sábado, 17 Oct", status: 'PENDIENTE' },
  { id: 3, type: 'train', title: "Sesión Técnica", time: "17:30 - 19:00", location: "Campo 2", date: "Miércoles, 14 Oct", status: 'SINCRO_OK' },
];

/**
 * Agenda del Atleta para Tutor - v1.0.0
 * Vista logística de horarios y ubicaciones.
 */
export default function TutorCalendar() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#020408]">
      <header className="p-8 bg-[#04070c] border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">AGENDA</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Horarios y Sedes</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <CalendarDays className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Zap className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Próximas Citas</h3>
          </div>

          <div className="space-y-4">
            {MOCK_EVENTS.map(event => (
              <div key={event.id} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
                <div className={cn("h-1 w-full", event.type === 'match' ? 'bg-primary' : 'bg-white/10')} />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{event.date}</span>
                      <h4 className="text-lg font-black text-white uppercase italic group-hover:cyan-text-glow transition-all leading-none">{event.title}</h4>
                    </div>
                    {event.type === 'match' ? <Trophy className="h-5 w-5 text-primary" /> : <Dumbbell className="h-5 w-5 text-white/20" />}
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-3.5 w-3.5 text-white/20" />
                      <span className="text-[10px] font-bold text-white/60 uppercase">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-3.5 w-3.5 text-white/20" />
                      <span className="text-[10px] font-bold text-white/60 uppercase italic truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <Badge variant="outline" className="border-white/5 text-white/20 text-[7px] font-black tracking-[0.2em]">{event.status}</Badge>
                    <button className="text-[9px] font-black text-primary flex items-center gap-2 uppercase tracking-widest active:scale-95 transition-all">
                      Abrir Mapa <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="p-8 rounded-[2.5rem] border border-white/5 bg-black/40 space-y-4">
          <div className="flex items-center gap-3">
            <Info className="h-4 w-4 text-white/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Nota Logística</span>
          </div>
          <p className="text-[10px] text-white/20 leading-relaxed font-bold uppercase italic tracking-widest">
            Cualquier cambio de última hora será notificado mediante PUSH y aparecerá resaltado en esta agenda.
          </p>
        </div>
      </div>
    </div>
  );
}
