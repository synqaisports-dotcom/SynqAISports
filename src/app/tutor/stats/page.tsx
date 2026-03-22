
"use client";

import { 
  ChevronLeft, 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  ArrowUpRight,
  Award
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

/**
 * Evolución del Atleta para Tutor - v1.0.0
 * Foco en progreso técnico y compromiso (sin datos médicos).
 */
export default function TutorStats() {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#020408]">
      <header className="p-8 bg-[#04070c] border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/tutor/dashboard" className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 active:scale-95 transition-all">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-headline font-black text-white italic tracking-tighter uppercase">EVOLUCIÓN</h1>
            <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.3em] italic">Progreso Técnico</p>
          </div>
          <button className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
            <TrendingUp className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* COMPROMISO */}
        <section className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
            <Award className="h-24 w-24 text-amber-500" />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] italic">Factor_Esfuerzo</span>
            <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none">98% <span className="text-xs text-amber-500/40">ASISTENCIA</span></h3>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-amber-500 shadow-[0_0_10px_var(--amber-500)]" style={{ width: '98%' }} />
          </div>
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed italic relative z-10">
            Lucas mantiene el nivel de compromiso más alto de su categoría. ¡Excelente trabajo!
          </p>
        </section>

        {/* MÉTRICAS TÉCNICAS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <Target className="h-4 w-4 text-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Dominios Técnicos</h3>
          </div>

          <div className="space-y-4">
            <SkillMetric label="Control Orientado" value={85} />
            <SkillMetric label="Pase Corto" value={92} />
            <SkillMetric label="Visión de Juego" value={78} />
            <SkillMetric label="Finalización" value={65} />
          </div>
        </section>

        {/* FEEDBACK DEL ENTRENADOR */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Últimas Valoraciones</h3>
          </div>
          
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Objetivo Cumplido</span>
            </div>
            <p className="text-[11px] font-bold text-white/40 leading-relaxed uppercase italic">
              "Gran mejora en la toma de decisiones durante los partidos de este mes. Seguimos trabajando el perfilado defensivo."
            </p>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Firma: Carlos Ruiz</span>
              <Badge variant="outline" className="text-[7px] border-amber-500/20 text-amber-500 font-black px-2">NOV_W2</Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SkillMetric({ label, value }: any) {
  return (
    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-white uppercase italic tracking-widest">{label}</span>
        <span className="text-xs font-black text-amber-500">{value}%</span>
      </div>
      <Progress value={value} className="h-1 bg-white/5" />
    </div>
  );
}
