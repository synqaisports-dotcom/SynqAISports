
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
  Swords,
  Activity,
  Trophy,
  Video,
  LineChart,
  Microscope,
  Stethoscope
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
    description: "La planificación en la categoría debutante es extremadamente flexible y se centra en el juego. No hablamos de ciclos de rendimiento, sino de bloques temáticos que aseguran la variedad y la diversión.",
    blocksLabel: "Línea de Tiempo Mensual",
    monthlyBlocks: [
      { id: 1, title: "Familiarización", focus: "Dominio y tacto", desc: "Conducción libre, pisar el balón y juegos de persecución con móvil.", period: "MES_01" },
      { id: 2, title: "Coordinación", focus: "Motricidad Base", desc: "Correr, saltar, girar y equilibrio dinámico en circuitos divertidos.", period: "MES_02" },
      { id: 3, title: "Interacción", focus: "Cooperación Inicial", desc: "Juegos de pases sencillos y noción de 'ayudar al amigo'.", period: "MES_03" },
      { id: 4, title: "Finalización", focus: "Golpeo y Puntería", desc: "Juegos de puntería a porterías gigantes para fomentar el éxito.", period: "MES_04" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Habilidad Individual", focus: "CONDUCCIÓN Y REGATE SIMPLE", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Aplicación al Juego", focus: "MINI-JUEGOS 1v1 / 2v2", color: "border-sky-400/30 bg-sky-400/10" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "10 min", desc: "Juegos de activación y movilidad articular.", icon: Zap },
      { part: "Parte Principal", time: "30 min", desc: "Desarrollo del objetivo de la semana mediante el juego.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Juegos de baja intensidad y recogida de material.", icon: Wind }
    ],
    focusPoints: [
      "La palabra clave es 'JUGAR'.",
      "Máxima participación y contacto con el balón.",
      "El resultado es irrelevante, el esfuerzo lo es todo.",
      "Flexibilidad total ante la pérdida de interés."
    ]
  },
  prebenjamin: {
    title: "PLANIFICACIÓN",
    titleAccent: "BIMENSUAL TÉCNICA",
    description: "En Prebenjamín, la planificación sigue siendo lúdica, pero se introducen objetivos técnicos más definidos. Los ciclos se organizan en bloques bimensuales para permitir la asimilación.",
    blocksLabel: "Mesociclos Bimensuales",
    monthlyBlocks: [
      { id: 1, title: "Bloque 1", focus: "Conducción", desc: "Familiarización avanzada y transporte del balón con diferentes superficies.", period: "SEPT-OCT" },
      { id: 2, title: "Bloque 2", focus: "Pase y Control", desc: "Introducción al juego asociado y control orientado básico.", period: "NOV-DIC" },
      { id: 3, title: "Bloque 3", focus: "El 1 contra 1", desc: "Regate ofensivo y entrada defensiva. Iniciación al duelo.", period: "ENE-FEB" },
      { id: 4, title: "Bloque 4", focus: "Finalización", desc: "Efectividad y precisión en el remate a puerta.", period: "MAR-ABR" },
      { id: 5, title: "Bloque 5", focus: "Consolidación", desc: "Repaso general y juegos de aplicación global del curso.", period: "MAY-JUN" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Adquisición", focus: "TÉCNICA INDIVIDUAL Y ANALÍTICA", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Aplicación", focus: "JUEGOS 2v1 / 2v2 Y PARTIDOS", color: "border-sky-400/30 bg-sky-400/10" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "15 min", desc: "Juegos con balón y activación progresiva.", icon: Zap },
      { part: "Parte Principal", time: "35 min", desc: "Desarrollo del objetivo con progresión de dificultad.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Juegos tranquilos y estiramientos suaves.", icon: Wind }
    ],
    focusPoints: [
      "Introducir la competición sana.",
      "Fomentar la toma de decisiones simples.",
      "El error es parte fundamental del aprendizaje.",
      "Rotación total por todas las posiciones."
    ]
  },
  benjamin: {
    title: "PLANIFICACIÓN",
    titleAccent: "TRIMESTRAL COLECTIVA",
    description: "Se introducen los primeros conceptos de cooperación y se estructura la semana de forma más definida. El objetivo es que los jugadores empiecen a entender el juego colectivo.",
    blocksLabel: "Mesociclos Trimestrales",
    monthlyBlocks: [
      { id: 1, title: "Trimestre 1", focus: "Fundamentos 2v1", desc: "Mejora del pase y control bajo nociones de superioridad numérica.", period: "1er TRIM" },
      { id: 2, title: "Trimestre 2", focus: "Principios Tácticos", desc: "Ocupación de espacios (amplitud) e inicio de la presión tras pérdida.", period: "2º TRIM" },
      { id: 3, title: "Trimestre 3", focus: "Situaciones 3v2 / 3v3", desc: "Toma de decisiones compleja y finalización colectiva.", period: "3er TRIM" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Técnico-Coordinativo", focus: "MEJORA INDIVIDUAL ESPECÍFICA", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Táctico-Individual", focus: "SITUACIONES REDUCIDAS (1v1, 2v1)", color: "border-sky-400/30 bg-sky-400/10" },
      { day: "Día 3", label: "Táctico-Colectivo", focus: "APLICACIÓN REAL (PARTIDO)", color: "border-blue-500/20 bg-blue-500/5" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "15 min", desc: "Juegos de posesión y rondos técnicos.", icon: Swords },
      { part: "Parte Principal", time: "50 min", desc: "Tareas progresivas de analítico a global.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Estiramientos dirigidos y feedback táctico.", icon: Users }
    ],
    focusPoints: [
      "Corregir la toma de decisiones: ¿Cuándo pasar?",
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
      { id: 1, title: "Fase Ofensiva", focus: "Conservación", desc: "Mantenimiento del balón y progresión en campo contrario.", period: "MES_01" },
      { id: 2, title: "Fase Defensiva", focus: "Marcaje y Cobertura", desc: "Principios defensivos colectivos y repliegue sincronizado.", period: "MES_02" },
      { id: 3, title: "Transición A-D", focus: "Presión tras Pérdida", desc: "Reacción inmediata para evitar el contraataque rival.", period: "MES_03" },
      { id: 4, title: "Transición D-A", focus: "Contraataque", desc: "Aprovechamiento de espacios libres tras recuperación.", period: "MES_04" },
      { id: 5, title: "Acciones ABP", focus: "Estrategia", desc: "Diseño y ejecución de balón parado ofensivo y defensivo.", period: "MES_05" }
    ],
    weeklyMicro: [
      { day: "Día 1", label: "Sub-principios", focus: "TAREAS DE ASPECTOS CONCRETOS", color: "border-primary/20 bg-primary/5" },
      { day: "Día 2", label: "Principios Completos", focus: "TAREAS COLECTIVAS COMPLEJAS", color: "border-sky-400/20 bg-sky-400/5" },
      { day: "Día 3", label: "Aplicación al Modelo", focus: "PARTIDO CONDICIONADO / REAL", color: "border-blue-500/20 bg-blue-500/5" }
    ],
    sessionStructure: [
      { part: "Calentamiento", time: "20 min", desc: "Rondos complejos y juegos de posición.", icon: Swords },
      { part: "Parte Principal", time: "60 min", desc: "Tareas tácticas y partidos modificados.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Estiramientos y análisis táctico grupal.", icon: Users }
    ],
    focusPoints: [
      "Entender el 'porqué' de cada ejercicio.",
      "Trabajo por líneas: Defensa, Medio y Ataque.",
      "Uso de vídeo para la corrección táctica.",
      "Adaptación espacial al campo de Fútbol 11."
    ]
  },
  infantil: {
    title: "PLANIFICACIÓN",
    titleAccent: "POR MODELO DE JUEGO",
    description: "En la 'edad de oro del aprendizaje', la planificación busca perfeccionar la técnica en un contexto táctico real y competitivo.",
    blocksLabel: "Mesociclos del Modelo",
    monthlyBlocks: [
      { id: 1, title: "Construcción", focus: "Salida de Balón", desc: "Inicio del juego y progresión limpia desde portería.", period: "BLOQUE_1" },
      { id: 2, title: "Finalización", focus: "Zona de Ataque", desc: "Creación de ocasiones y efectividad en el último tercio.", period: "BLOQUE_2" },
      { id: 3, title: "Organización", focus: "Bloque Defensivo", desc: "Presión organizada y repliegue colectivo sincronizado.", period: "BLOQUE_3" },
      { id: 4, title: "Estrategia", focus: "ABP Avanzada", desc: "Estrategia operativa compleja en balón parado.", period: "BLOQUE_4" }
    ],
    weeklyMicro: [
      { day: "MD-4", label: "Condicional", focus: "FUERZA Y RESISTENCIA ESPECÍFICA", color: "border-blue-500/20 bg-blue-500/5" },
      { day: "MD-3", label: "Táctico", focus: "PRINCIPIOS DEL MODELO DE JUEGO", color: "border-primary/20 bg-primary/5" },
      { day: "MD-2", label: "Velocidad", focus: "VELOCIDAD Y FINALIZACIÓN", color: "border-sky-400/20 bg-sky-400/5" },
      { day: "MD-1", label: "Activación", focus: "AJUSTES TÁCTICOS Y ABP", color: "border-rose-500/20 bg-rose-500/5" }
    ],
    sessionStructure: [
      { part: "Activación", time: "20 min", desc: "Tareas técnico-tácticas introductorias.", icon: Zap },
      { part: "Parte Principal", time: "60 min", desc: "Tareas de alta intensidad y carga cognitiva.", icon: Gamepad2 },
      { part: "Vuelta a la Calma", time: "10 min", desc: "Regenerativo y feedback de sesión.", icon: Wind }
    ],
    focusPoints: [
      "Automatizar movimientos tácticos colectivos.",
      "Carga física controlada y específica.",
      "Fomentar el liderazgo dentro del grupo.",
      "La competitividad formativa es la prioridad."
    ]
  },
  cadete: {
    title: "PLANIFICACIÓN",
    titleAccent: "DE RENDIMIENTO",
    description: "Etapa de rendimiento. La planificación se orienta a la competición y a la optimización del rendimiento individual y colectivo.",
    blocksLabel: "Periodización Táctica",
    monthlyBlocks: [
      { id: 1, title: "Pretemporada", focus: "Adquisición", desc: "Adquisición de la forma física y del modelo de juego base.", period: "AGO-SEPT" },
      { id: 2, title: "Competitivo", focus: "Mantenimiento", desc: "Ajustes tácticos semanales basados en el análisis del rival.", period: "OCT-MAY" },
      { id: 3, title: "Transitorio", focus: "Recuperación", desc: "Descanso activo y análisis de rendimiento individual.", period: "JUN-JUL" }
    ],
    weeklyMicro: [
      { day: "Lunes", label: "Recuperación", focus: "COMPENSATORIO / REGENERATIVO", color: "border-blue-500/20 bg-blue-500/5" },
      { day: "Martes", label: "Fuerza", focus: "TÁCTICA GENERAL DEL MODELO", color: "border-primary/20 bg-primary/5" },
      { day: "Miércoles", label: "Resistencia", focus: "TÁCTICA ESPECÍFICA POR LÍNEAS", color: "border-sky-400/20 bg-sky-400/5" },
      { day: "Jueves", label: "Velocidad", focus: "ABP Y VELOCIDAD DE REACCIÓN", color: "border-rose-500/20 bg-rose-500/5" },
      { day: "Viernes", label: "Activación", focus: "AJUSTES PRE-PARTIDO RIVAL", color: "border-emerald-500/20 bg-emerald-500/5" }
    ],
    sessionStructure: [
      { part: "Activación", time: "20 min", desc: "Preparación específica de alta concentración.", icon: Zap },
      { part: "Bloque Táctico", time: "70 min", desc: "Simulación de situaciones reales de partido.", icon: Swords },
      { part: "Feedback / Vídeo", time: "10 min", desc: "Análisis táctico y recuperación activa.", icon: Video }
    ],
    focusPoints: [
      "Especialización por puesto es total.",
      "Gestión del 'entrenamiento invisible'.",
      "Resiliencia y presión competitiva.",
      "Análisis de vídeo propio y del rival."
    ]
  },
  juvenil: {
    title: "PLANIFICACIÓN",
    titleAccent: "DE ALTA COMPETICIÓN",
    description: "Antesala del fútbol senior. La planificación es casi profesional, buscando maximizar el rendimiento y la proyección de los jugadores hacia el primer equipo.",
    blocksLabel: "Macrociclo Anual (ATR)",
    monthlyBlocks: [
      { id: 1, title: "Acumulación", focus: "Volumen / Fuerza", desc: "Base física y técnica. Trabajo de fuerza general y conceptos tácticos amplios.", period: "ACUM" },
      { id: 2, title: "Transformación", focus: "Especificidad", desc: "Conversión de la base en potencia y velocidad. Táctica específica por líneas.", period: "TRANS" },
      { id: 3, title: "Realización", focus: "Pico de Forma", desc: "Máxima velocidad y precisión. Ajustes estratégicos para momentos clave.", period: "REAL" },
      { id: 4, title: "Análisis", focus: "Optimización", desc: "Ajuste constante de la planificación basado en el análisis de rendimiento real.", period: "CONT" }
    ],
    weeklyMicro: [
      { day: "Proyecto Semanal", label: "Análisis Rival", focus: "ESTRATEGIA ESPECÍFICA SEMANAL", color: "border-primary/20 bg-primary/5" },
      { day: "Entrenamientos", label: "Carga GPS", focus: "CONTROL TECNOLÓGICO DE ESFUERZO", color: "border-sky-400/20 bg-sky-400/5" },
      { day: "Específico", label: "Líneas / Jugador", focus: "ESPECIALIZACIÓN TÁCTICA PROFESIONAL", color: "border-blue-500/20 bg-blue-500/5" },
      { day: "Psicológico", label: "Mentalidad Élite", focus: "COACHING Y DINÁMICAS DE GRUPO", color: "border-rose-500/20 bg-rose-500/5" }
    ],
    sessionStructure: [
      { part: "Preparación", time: "25 min", desc: "Activación profesional y protocolos de prevención.", icon: Zap },
      { part: "Bloque de Élite", time: "70 min", desc: "Tareas de máxima exigencia y rigor táctico real.", icon: Swords },
      { part: "Recuperación", time: "15 min", desc: "Descarga, crioterapia y feedback analítico.", icon: Wind }
    ],
    focusPoints: [
      "Maximizar el rendimiento individual y colectivo.",
      "Análisis exhaustivo del rival para el microciclo.",
      "Control de cargas con tecnología (GPS).",
      "Preparación mental para el salto al nivel Senior."
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
            <GitBranch className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase italic">Cyclic_Planner_v3.6</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            PLANIFICACIÓN_CÍCLICA
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Cronograma Metodológico del Club</p>
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
                  ? "bg-primary/20 text-white border-primary/40 shadow-[0_0_24px_rgba(0,242,255,0.32)] z-10" 
                  : "text-primary/80 hover:text-white hover:bg-white/5 border-white/10 hover:border-primary/40"
              )}
            >
              <cat.icon className={cn("h-5 w-5", selectedCat === cat.id ? "text-white" : "text-primary/70 group-hover:text-white")} />
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                <span className={cn("text-[9px] font-bold uppercase", selectedCat === cat.id ? "text-white/80" : "text-primary/60 group-hover:text-white/80")}>{cat.age}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: FILOSOFÍA Y ENFOQUE */}
          <div className="xl:col-span-1 space-y-8">
            <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar className="h-24 w-24 text-primary" /></div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Estrategia Temporal</span>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4 leading-tight">
                {data.title} <br /><span className="text-primary">{data.titleAccent}</span>
              </h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose italic">
                {data.description}
              </p>
            </Card>

            <div className="p-8 rounded-[2.5rem] border border-primary/10 bg-black/40 space-y-6">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Pilares del Ciclo</span>
              </div>
              <div className="space-y-3">
                {data.focusPoints.map((point: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/20 transition-all">
                    <CheckCircle2 className="h-3 w-3 text-primary/50 group-hover:text-primary" />
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
                <Layers className="h-4 w-4 text-primary" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">{data.blocksLabel}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.monthlyBlocks.map((block: any) => (
                  <div key={block.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl group hover:border-primary/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-4 py-2 bg-primary/10 text-[10px] font-black text-primary italic">{block.period}</div>
                    <div className="space-y-1 mb-4">
                      <h4 className="text-sm font-black text-white uppercase italic group-hover:cyan-text-glow transition-all">{block.title}</h4>
                      <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest">{block.focus}</p>
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
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Estructura Semanal</h3>
                </div>
                <div className="space-y-3">
                  {data.weeklyMicro.map((day: any, i: number) => (
                    <div key={i} className={cn("p-5 border rounded-2xl relative group overflow-hidden", day.color)}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black text-white/40 uppercase">{day.day}</span>
                        <ArrowRight className="h-3 w-3 text-white/10 group-hover:text-primary transition-all" />
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
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">Anatomía de la Sesión</h3>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden divide-y divide-white/5">
                  {data.sessionStructure.map((part: any, i: number) => (
                    <div key={i} className="p-5 flex items-center gap-5 hover:bg-white/[0.02] transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <part.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-[10px] font-black text-white uppercase italic">{part.part}</span>
                          <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">{part.time}</Badge>
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
        <div className="p-20 text-center space-y-4 border border-dashed border-primary/20 bg-primary/5 rounded-[3rem]">
           <Sparkles className="h-12 w-12 text-primary/20 mx-auto animate-pulse" />
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-[1em]">Terminal en espera de sincronización de datos</p>
        </div>
      )}
    </div>
  );
}
