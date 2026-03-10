
"use client";

import { useState } from "react";
import { 
  GitBranch, 
  Sparkles, 
  Sprout, 
  Zap, 
  Target, 
  Triangle, 
  Brain, 
  ShieldCheck, 
  Award,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Wind,
  Gamepad2,
  Users,
  Swords
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "debutantes", label: "Debutantes", age: "5-7 años", icon: Sprout },
  { id: "prebenjamin", label: "Prebenjamín", age: "6-8 años", icon: Zap },
  { id: "benjamin", label: "Benjamín", age: "8-10 años", icon: Target },
  { id: "alevin", label: "Alevín", age: "10-12 años", icon: Triangle },
  { id: "infantil", label: "Infantil", age: "11-13 años", icon: Brain },
  { id: "cadete", label: "Cadete", age: "14-15 años", icon: ShieldCheck },
  { id: "juvenil", label: "Juvenil", age: "16-18 años", icon: Award },
];

const PLANNING_DATA: Record<string, any> = {
  debutantes: {
    title: "PLANIFICACIÓN",
    titleAccent: "POR BLOQUES TEMÁTICOS",
    description: "La planificación en debutantes es extremadamente flexible. No buscamos picos de forma, sino una progresión lúdica que asegure la variedad y el hábito deportivo.",
    blocksLabel: "Línea de Tiempo Mensual",
    monthlyBlocks: [
      { id: 1, title: "Familiarización", focus: "Dominio y tacto", desc: "Conducción libre, pisar el balón y juegos de persecución con móvil.", period: "MES_01" },
      { id: 2, title: "Coordinación", focus: "Motricidad Base", desc: "Correr, saltar, girar y equilibrio dinámico en circuitos divertidos.", period: "MES_02" },
      { id: 3, title: "Interacción", focus: "Cooperación Inicial", desc: "Juegos de pases sencillos y noción de 'ayudar al amigo'.", period: "MES_03" },
      { id: 4, title: "Finalización", focus: "Golpeo y Puntería", desc: "Juegos de puntería a porterías gigantes para fomentar el éxito.", period: "MES_04" }
    ],
    weeklyMicro: [
      { day: "Sesión 1", label: "Habilidad Individual", focus: "CONDUCCIÓN Y REGATE", color: "border-primary/20 bg-primary/5" },
      { day: "Sesión 2", label: "Aplicación al Juego", focus: "MINI-JUEGOS 1v1 / 2v2", color: "border-amber-500/20 bg-amber-500/5" }
    ],
    sessionStructure: [
      { part: "Activación", time: "10 min", desc: "Juegos lúdicos de entrada y movilidad.", icon: Zap },
      { part: "Bloque Central", time: "30 min", desc: "Desarrollo del tema a través del juego.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Estiramientos suaves y recogida.", icon: Wind }
    ],
    focusPoints: [
      "La palabra clave es 'JUGAR'.",
      "Máxima participación (Sin colas de espera).",
      "El resultado es irrelevante.",
      "Flexibilidad total ante la fatiga atencional."
    ]
  },
  prebenjamin: {
    title: "PLANIFICACIÓN",
    titleAccent: "BIMENSUAL TÉCNICA",
    description: "Se introducen objetivos técnicos definidos organizados en bloques de dos meses para permitir una asimilación profunda antes de progresar.",
    blocksLabel: "Mesociclos Bimensuales",
    monthlyBlocks: [
      { id: 1, title: "Dominio Base", focus: "Conducción", desc: "Familiarización avanzada y transporte del balón con diferentes superficies.", period: "SEPT-OCT" },
      { id: 2, title: "Cooperación", focus: "Pase y Control", desc: "Introducción al juego asociado y control orientado básico.", period: "NOV-DIC" },
      { id: 3, title: "Oposición", focus: "1 contra 1", desc: "Regate ofensivo y entrada defensiva. Iniciación al duelo.", period: "ENE-FEB" },
      { id: 4, title: "Definición", focus: "Tiro a Puerta", desc: "Finalización efectiva y precisión en el remate.", period: "MAR-ABR" },
      { id: 5, title: "Consolidación", focus: "Repaso General", desc: "Juegos de aplicación global de todos los contenidos del curso.", period: "MAY-JUN" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Adquisición", focus: "TÉCNICA ANALÍTICA", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Aplicación", focus: "JUEGOS REALES 2v1 / 2v2", color: "border-amber-500/20 bg-amber-500/5" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "10-15 min", desc: "Juegos con balón y activación progresiva.", icon: Zap },
      { part: "Parte Principal", time: "35-40 min", desc: "Desarrollo del objetivo semanal con progresión de dificultad.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "5-10 min", desc: "Juegos tranquilos, estiramientos y feedback.", icon: Wind }
    ],
    focusPoints: [
      "Introducir la competición sana.",
      "Fomentar toma de decisiones simple.",
      "El error es fundamental para aprender.",
      "Rotación total por todas las posiciones."
    ]
  },
  benjamin: {
    title: "PLANIFICACIÓN",
    titleAccent: "TRIMESTRAL COLECTIVA",
    description: "En la etapa benjamín se introducen los primeros conceptos de cooperación. El objetivo es la transición del 'yo' al 'nosotros', entendiendo el pase como el lenguaje del juego colectivo.",
    blocksLabel: "Mesociclos Trimestrales",
    monthlyBlocks: [
      { id: 1, title: "Fundamentos Técnicos", focus: "Control, Pase y Conducción", desc: "Mejora de la precisión en el envío y fundamentos del 2 contra 1.", period: "1er TRIM" },
      { id: 2, title: "Principios Tácticos", focus: "Amplitud y Apoyo", desc: "Ocupación racional del espacio e introducción a la presión tras pérdida.", period: "2º TRIM" },
      { id: 3, title: "Juego Colectivo", focus: "Situaciones 3v2 / 3v3", desc: "Toma de decisiones en superioridad e inferioridad. Finalización.", period: "3er TRIM" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Técnico-Coordinativo", focus: "MEJORA INDIVIDUAL", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Táctico-Individual", focus: "SITUACIONES 1v1 / 2v1", color: "border-amber-500/20 bg-amber-500/5" },
      { day: "Día 3", label: "Táctico-Colectivo", focus: "APLICACIÓN REAL (PARTIDO)", color: "border-blue-500/20 bg-blue-500/5" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "15 min", desc: "Juegos de posesión y rondos técnicos.", icon: Swords },
      { part: "Parte Principal", time: "45-50 min", desc: "Tareas progresivas de analítico a global.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Estiramientos dirigidos y charla sobre la sesión.", icon: Users }
    ],
    focusPoints: [
      "Corregir la toma de decisiones (¿Cuándo pasar?).",
      "El pase como herramienta clave de comunicación.",
      "Fomentar la comunicación activa en el campo.",
      "Uso de la competición para evaluar conceptos."
    ]
  },
  alevin: {
    title: "PLANIFICACIÓN",
    titleAccent: "POR PRINCIPIOS DE JUEGO",
    description: "Es la etapa de transición a Fútbol 11. La planificación se vuelve más táctica y se introducen los principios del modelo de juego del club.",
    blocksLabel: "Mesociclos por Principios",
    monthlyBlocks: [
      { id: 1, title: "Fase Ofensiva", focus: "Conservación y Progresión", desc: "Mantenimiento del balón en zona de inicio y progresión a zona de finalización.", period: "MES_01" },
      { id: 2, title: "Fase Defensiva", focus: "Marcaje y Cobertura", desc: "Principios defensivos colectivos, repliegue y ayudas permanentes.", period: "MES_02" },
      { id: 3, title: "Transición A-D", focus: "Presión tras Pérdida", desc: "Reacción inmediata tras perder la posesión para evitar el contraataque.", period: "MES_03" },
      { id: 4, title: "Transición D-A", focus: "Contraataque", desc: "Aprovechamiento de espacios libres tras recuperación en bloque bajo o medio.", period: "MES_04" },
      { id: 5, title: "Acciones ABP", focus: "Estrategia", desc: "Diseño y ejecución de saques de esquina, faltas y saques de banda.", period: "MES_05" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Sub-principios", focus: "ASPECTOS CONCRETOS DEL TEMA", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Principios Completos", focus: "TAREAS COLECTIVAS COMPLEJAS", color: "border-amber-500/20 bg-amber-500/5" },
      { day: "Día 3", label: "Aplicación Real", focus: "PARTIDO CONDICIONADO / MODELO", color: "border-blue-500/20 bg-blue-500/5" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "15-20 min", desc: "Rondos complejos y juegos de posición.", icon: Swords },
      { part: "Parte Principal", time: "50-60 min", desc: "Tareas tácticas y partidos modificados.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Estiramientos y análisis táctico grupal.", icon: Users }
    ],
    focusPoints: [
      "Entender el 'porqué' de cada ejercicio.",
      "Trabajo específico por líneas (DEF/MED/ATQ).",
      "Uso de vídeo para corrección técnica.",
      "Adaptación espacial al campo de Fútbol 11."
    ]
  }
};

export default function CyclePlannerPage() {
  const [selectedCat, setSelectedCat] = useState("debutantes");
  const data = PLANNING_DATA[selectedCat];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 p-8 lg:p-12">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col gap-8 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Cyclic_Planner_v3.3</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow leading-none">
            PLANIFICACIÓN_CÍCLICA
          </h1>
          <p className="text-[11px] font-black text-amber-500/30 tracking-[0.3em] uppercase">Cronograma Metodológico del Club</p>
        </div>

        {/* SELECTOR DE CATEGORÍAS */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full custom-scrollbar shadow-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={cn(
                "flex items-center gap-4 px-8 py-4 rounded-xl transition-all whitespace-nowrap group relative overflow-hidden flex-1 min-w-[180px] border",
                selectedCat === cat.id 
                  ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] z-10" 
                  : "text-white/40 hover:text-white hover:bg-white/5 border-white/10 hover:border-amber-500/30"
              )}
            >
              <cat.icon className={cn("h-5 w-5", selectedCat === cat.id ? "text-black" : "text-amber-500/40 group-hover:text-amber-500")} />
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                <span className={cn("text-[9px] font-bold uppercase", selectedCat === cat.id ? "text-black/60" : "text-white/20")}>{cat.age}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: FILOSOFÍA Y ENFOQUE */}
          <div className="xl:col-span-1 space-y-8">
            <Card className="glass-panel border-amber-500/20 bg-amber-500/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar className="h-24 w-24 text-amber-500" /></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Estrategia Temporal</span>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
                {data.title} <br /><span className="text-amber-500">{data.titleAccent}</span>
              </h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose italic">
                {data.description}
              </p>
            </Card>

            <div className="p-8 rounded-[2.5rem] border border-amber-500/10 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Pilares del Ciclo</span>
              </div>
              <div className="space-y-3">
                {data.focusPoints.map((point: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-amber-500/20 transition-all">
                    <CheckCircle2 className="h-3 w-3 text-amber-500/40 group-hover:text-amber-500" />
                    <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase italic">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: MESES Y SEMANAS */}
          <div className="xl:col-span-2 space-y-10">
            
            {/* BLOQUES TEMPORALES */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <Layers className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">{data.blocksLabel}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.monthlyBlocks.map((block: any) => (
                  <div key={block.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl group hover:border-amber-500/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-4 py-2 bg-amber-500/10 text-[10px] font-black text-amber-500 italic">{block.period}</div>
                    <div className="space-y-1 mb-4">
                      <h4 className="text-sm font-black text-white uppercase italic group-hover:amber-text-glow transition-all">{block.title}</h4>
                      <p className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest">{block.focus}</p>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase leading-relaxed">{block.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* MICROCICLO Y SESIÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* SEMANA TIPO */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Estructura Semanal</h3>
                </div>
                <div className="space-y-3">
                  {data.weeklyMicro.map((day: any, i: number) => (
                    <div key={i} className={cn("p-5 border rounded-2xl relative group overflow-hidden", day.color)}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-white/40 uppercase">{day.day}</span>
                        <ArrowRight className="h-3 w-3 text-white/10 group-hover:text-amber-500 transition-all" />
                      </div>
                      <p className="text-[10px] font-black text-white uppercase italic tracking-widest">{day.label}</p>
                      <p className="text-xs font-black text-white/80 uppercase italic mt-1">{day.focus}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* DESGLOSE SESIÓN */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Anatomía de la Sesión</h3>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
                  {data.sessionStructure.map((part: any, i: number) => (
                    <div key={i} className="p-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <part.icon className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-black text-white uppercase italic">{part.part}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-amber-500/20 text-amber-500">{part.time}</Badge>
                        </div>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{part.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-20 text-center space-y-4 border border-dashed border-amber-500/20 bg-amber-500/5 rounded-[3rem]">
           <Sparkles className="h-12 w-12 text-amber-500/20 mx-auto animate-pulse" />
           <p className="text-[10px] font-black text-amber-500/40 uppercase tracking-[1em]">Terminal en espera de sincronización de datos</p>
        </div>
      )}
    </div>
  );
}
