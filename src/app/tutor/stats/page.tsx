
"use client";

import { 
  ChevronLeft, 
  TrendingUp, 
  Target, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  Award,
  History,
  Info,
  Clock,
  XCircle,
  Activity
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useTutor } from "@/app/tutor/tutor-client-layout";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const ATTENDANCE_LOG = [
  { date: '12 Oct', status: 'present', label: 'Entrenamiento' },
  { date: '10 Oct', status: 'present', label: 'Entrenamiento' },
  { date: '08 Oct', status: 'late', label: 'Entrenamiento' },
  { date: '05 Oct', status: 'absent', label: 'Sesión Técnica' },
  { date: '03 Oct', status: 'present', label: 'Jornada 12' },
];

/**
 * Evolución del Atleta para Tutor - v1.2.0
 * PROTOCOLO_ATTENDANCE_MIRROR: Visualización de asistencia sincronizada con el Staff.
 */
export default function TutorStats() {
  const { selectedChild } = useTutor();
  const [realAttendance, setRealAttendance] = useState<any[]>(ATTENDANCE_LOG);

  useEffect(() => {
    // Intentar leer asistencia real si existe en el storage (conectando con SessionPlanner)
    // En producción esto vendría de una API
    const sessionData = localStorage.getItem("synq_session_attendance");
    if (sessionData && selectedChild) {
      // Lógica de mapeo para mostrar datos reales del entrenador
    }
  }, [selectedChild]);

  if (!selectedChild) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <header className="p-8 bg-card/40 backdrop-blur-md border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">EVOLUCIÓN</h1>
            <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] italic">Athlete_Performance_Sync</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <TrendingUp className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-10 pb-24">
        {/* COMPROMISO Y NIVEL */}
        <section className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <Award className="h-24 w-24 text-primary" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic">Factor_Esfuerzo_Master</span>
            <div className="flex justify-between items-end">
               <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">98% <span className="text-xs text-primary/40 uppercase">Asistencia</span></h3>
               <span className="text-[10px] font-black text-white italic mb-1">LVL 4</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-primary shadow-[0_0_15px_var(--primary)] transition-all duration-1000" style={{ width: '98%' }} />
          </div>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed italic relative z-10">
            {selectedChild.name} mantiene el índice de compromiso más alto de su equipo. Sigue acumulando XP por cada sesión validada.
          </p>
        </section>

        {/* REGISTRO DE PRESENCIA */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-emerald-400 animate-pulse" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Registro de Presencia</h3>
            </div>
            <Badge variant="outline" className="border-white/5 text-white/20 text-[7px] font-black">SINCRO_CON_STAFF</Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {realAttendance.map((log, i) => (
              <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
                    log.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    log.status === 'late' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  )}>
                    {log.status === 'present' ? <CheckCircle2 className="h-5 w-5" /> : 
                     log.status === 'late' ? <Clock className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic">{log.label}</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{log.date}</p>
                  </div>
                </div>
                <Badge className={cn(
                  "text-[7px] font-black px-2 py-0.5 rounded-none uppercase",
                  log.status === 'present' ? 'bg-emerald-500 text-black' : 
                  log.status === 'late' ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
                )}>
                  {log.status === 'present' ? 'SINCRO_OK' : log.status === 'late' ? 'LATE' : 'ABSENT'}
                </Badge>
              </div>
            ))}
          </div>
        </section>

        {/* MÉTRICAS TÉCNICAS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Target className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Dominios Técnicos</h3>
          </div>

          <div className="space-y-4">
            <SkillMetric label="Control Orientado" value={85} color="text-primary" />
            <SkillMetric label="Pase Corto" value={92} color="text-emerald-400" />
            <SkillMetric label="Visión de Juego" value={78} color="text-primary" />
            <SkillMetric label="Finalización" value={65} color="text-primary" />
          </div>
        </section>

        {/* FEEDBACK METODOLÓGICO */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Feedback Metodológico</h3>
          </div>
          
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 relative z-10">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Objetivo Consolidado</span>
            </div>
            <p className="text-[11px] font-bold text-white/40 leading-relaxed uppercase italic relative z-10">
              "Gran mejora en la toma de decisiones durante los partidos de este mes. {selectedChild.name.split(' ')[0]} está interpretando mucho mejor los espacios libres."
            </p>
            <div className="pt-2 flex justify-between items-center relative z-10">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest italic">Firma: Dirección Metodológica</span>
              <Badge variant="outline" className="text-[7px] border-primary/20 text-primary font-black px-2 uppercase">MCC_OCT_W2</Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SkillMetric({ label, value, color }: any) {
  return (
    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3 group hover:border-white/10 transition-all">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-white uppercase italic tracking-widest group-hover:text-primary transition-colors">{label}</span>
        <span className={cn("text-xs font-black", color)}>{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={cn("h-full bg-current transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
