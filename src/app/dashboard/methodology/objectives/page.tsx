
"use client";

import { useState } from "react";
import { 
  Target, 
  Sparkles, 
  Sprout, 
  Brain, 
  Dumbbell, 
  Zap, 
  Heart, 
  ChevronRight, 
  Info,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  Compass
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "debutantes", label: "Debutantes", age: "5-7 años", icon: Sprout },
  { id: "prebenjamin", label: "Prebenjamín", age: "6-8 años", icon: Zap },
  { id: "benjamin", label: "Benjamín", age: "8-10 años", icon: Target },
];

const CONTENT: Record<string, any> = {
  debutantes: {
    title: "INICIACIÓN Y",
    titleAccent: "FORMACIÓN INTEGRAL",
    philosophy: "La categoría debutante se enfoca en la iniciación deportiva, donde el objetivo principal no es ganar partidos, sino el disfrute a través del aprendizaje técnico y motor. El fútbol es nuestra herramienta educativa para desarrollar habilidades sociales y técnicas básicas.",
    tips: [
      "El juego es la metodología: Componente lúdico siempre.",
      "No especializar: Todos juegan en todas las posiciones.",
      "Paciencia infinita: Atención y motricidad en desarrollo.",
      "Refuerzo positivo: Celebra el esfuerzo, no el gol."
    ],
    dimensions: [
      {
        title: "Técnicos",
        subtitle: "Relación con el Balón",
        icon: Zap,
        items: [
          "Familiarización: Un balón por niño para maximizar toques.",
          "Conducción básica: Balón cerca del pie.",
          "Iniciación al regate: Perder el miedo al cambio de dirección.",
          "Golpeo/Remate: Contacto inicial para pase o tiro.",
          "Control básico: Intentar parar el balón con el cuerpo."
        ]
      },
      {
        title: "Tácticos",
        subtitle: "Entendimiento del Juego",
        icon: Compass,
        items: [
          "Concepto de dirección: Saber qué portería atacar/defender.",
          "Evitar 'Efecto Colmena': Empezar a dispersarse.",
          "Nociones espaciales: Dónde estoy en el campo.",
          "Noción compañero/rival: Reconocer con quién juego.",
          "Reglas básicas: El balón no se toca con la mano."
        ]
      },
      {
        title: "Motores y Físicos",
        subtitle: "Desarrollo General",
        icon: Dumbbell,
        items: [
          "Motricidad general: Correr, saltar, girar y frenar.",
          "Coordinación ojo-pie y equilibrio dinámico.",
          "Orientación espacial y temporal.",
          "Conocimiento del propio cuerpo.",
          "Familiarización con el césped y material técnico."
        ]
      },
      {
        title: "Psicopedagógicos",
        subtitle: "Valores y Socialización",
        icon: Heart,
        items: [
          "Diversión absoluta: Ganas de volver mañana.",
          "Hábitos de higiene y vestuario (autonomía).",
          "Respeto: Compañeros, rivales y normas.",
          "Integración en el grupo y compartir.",
          "Cuidado del material y la mochila propia."
        ]
      }
    ]
  },
  prebenjamin: {
    title: "FORMACIÓN Y",
    titleAccent: "COOPERACIÓN INICIAL",
    philosophy: "Se centra en la formación integral y el desarrollo motor a través del juego, priorizando el aprendizaje técnico individual sobre el resultado. Se busca fomentar el compañerismo y la familiarización con el balón en un entorno lúdico.",
    tips: [
      "Utilizar ejercicios lúdicos (transporte, lucha, persecución).",
      "Evitar la especialización prematura por puestos.",
      "Priorizar la participación de todos los jugadores.",
      "Fomentar el levantado de cabeza en conducción."
    ],
    dimensions: [
      {
        title: "Técnicos Individuales",
        subtitle: "Dominio y Golpeo",
        icon: Zap,
        items: [
          "Dominio del balón: Conducción con distintas superficies.",
          "Iniciación al regate: Fomentar el 1x1 para superar rivales.",
          "Finalización: Aprender a tirar a portería y marcar.",
          "Pase y recepción: Iniciación al control orientado.",
          "Capacidad de levantar la cabeza al conducir."
        ]
      },
      {
        title: "Tácticos Colectivos",
        subtitle: "Ocupación de Espacios",
        icon: Compass,
        items: [
          "Evitar aglomeraciones: Separarse para recibir.",
          "Noción de equipo: Cooperación y oposición (3x3, 2x1).",
          "Zonas de riesgo: No complicarse cerca de portería propia.",
          "Inicio de la noción de 'pasar y moverse'.",
          "Entendimiento del fuera de juego básico."
        ]
      },
      {
        title: "Físicos y Motores",
        subtitle: "Agilidad y Reacción",
        icon: Dumbbell,
        items: [
          "Mejora de la agilidad y el equilibrio dinámico.",
          "Velocidad de reacción mediante juegos específicos.",
          "Mantener y mejorar la movilidad articular.",
          "Circuitos de coordinación ojo-pie con balón.",
          "Desarrollo de la fuerza básica a través de saltos."
        ]
      },
      {
        title: "Educativos",
        subtitle: "Gestión Emocional",
        icon: Heart,
        items: [
          "Gestión emocional: Convivir con éxito y frustración.",
          "Fair Play: Respeto absoluto a rivales y árbitros.",
          "Compañerismo: El equipo por encima del individuo.",
          "Disciplina formativa: Puntualidad y cuidado material.",
          "Fomentar la toma de decisiones sin miedo al error."
        ]
      }
    ]
  },
  benjamin: {
    title: "INICIACIÓN",
    titleAccent: "ESPECÍFICA TÁCTICA",
    philosophy: "Etapa de transición donde la técnica individual y los conceptos básicos de cooperación cobran importancia. El foco está en la formación técnica y la comprensión del juego, educando en valores por encima de los resultados competitivos.",
    tips: [
      "Introducir el pase y el juego en parejas/tríos.",
      "Ejercicios basados en el juego (rondos, 2x2, 3x3).",
      "Aprender a ganar con respeto y perder sin frustración.",
      "Fomentar la toma de decisiones propia del atleta."
    ],
    dimensions: [
      {
        title: "Técnicos Individuales",
        subtitle: "Precisión y Visión",
        icon: Zap,
        items: [
          "Conducción: Uso de ambos pies con visión periférica.",
          "Control orientado: Preparar la siguiente acción con el primer toque.",
          "Pase: Iniciación a la precisión y tensión del envío.",
          "Finalización: Golpeo con empeine e interior en 1x1.",
          "Regate: Uso intencionado para superar líneas rivales."
        ]
      },
      {
        title: "Tácticos Básicos",
        subtitle: "Fases del Juego",
        icon: Compass,
        items: [
          "Situaciones reducidas: Dominio de 1x1, 2x1 y 2x2.",
          "Posicionamiento: Abrir el campo en ataque y cerrar en defensa.",
          "Desmarques: Iniciación al apoyo y a la ruptura.",
          "Transiciones: Reacción rápida al perder/recuperar el balón.",
          "Orientación: Uso efectivo de todo el ancho del campo."
        ]
      },
      {
        title: "Coordinativos",
        subtitle: "Agilidad Motriz",
        icon: Dumbbell,
        items: [
          "Coordinación dinámica y agilidad en espacios cortos.",
          "Cambios de dirección y velocidad de reacción estímulo.",
          "Habilidades motoras: Desplazamientos, saltos y giros.",
          "Equilibrio estático y dinámico bajo presión.",
          "Familiarización con la carga física aeróbica básica."
        ]
      },
      {
        title: "Psico-Educativos",
        subtitle: "Autonomía y Valores",
        icon: Heart,
        items: [
          "Compañerismo: Respeto total al ecosistema del club.",
          "Respeto al reglamento: Aceptar decisiones arbitrales.",
          "Autonomía: Fomentar que decidan qué hacer con el balón.",
          "Motivación: Mantener la pasión por la práctica deportiva.",
          "Resiliencia: Gestión positiva del error en el aprendizaje."
        ]
      }
    ]
  }
};

export default function ObjectivesPage() {
  const [selectedCat, setSelectedCat] = useState("debutantes");
  const currentContent = CONTENT[selectedCat];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Strategic_Objectives_v2.4</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow">
            OBJETIVOS_TÁCTICOS
          </h1>
          <p className="text-[10px] font-black text-amber-500/30 tracking-[0.2em] uppercase">Hoja de Ruta Formativa del Club</p>
        </div>

        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl transition-all whitespace-nowrap group relative overflow-hidden",
                selectedCat === cat.id 
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <cat.icon className={cn("h-4 w-4", selectedCat === cat.id ? "text-black" : "text-amber-500/40 group-hover:text-amber-500")} />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                <span className={cn("text-[8px] font-bold uppercase", selectedCat === cat.id ? "text-black/60" : "text-white/20")}>{cat.age}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {currentContent ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          <div className="xl:col-span-1 space-y-10">
            <Card className="glass-panel border-amber-500/20 bg-amber-500/5 p-10 relative group overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.05)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                <BookOpen className="h-32 w-32 text-amber-500" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500">Filosofía de Etapa</span>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight">
                {currentContent.title} <br /><span className="text-amber-500">{currentContent.titleAccent}</span>
              </h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose italic relative z-10">
                {currentContent.philosophy}
              </p>
            </Card>

            <div className="p-8 rounded-[2.5rem] border border-amber-500/10 bg-black/40 space-y-6 relative overflow-hidden group">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Guía para el Entrenador</span>
              </div>
              <div className="space-y-4">
                {currentContent.tips.map((tip: string, i: number) => (
                  <CoachTip key={i} text={tip} />
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentContent.dimensions.map((dim: any, i: number) => (
                <ObjectiveCard 
                  key={i}
                  title={dim.title} 
                  subtitle={dim.subtitle}
                  icon={dim.icon}
                  items={dim.items}
                />
              ))}
            </div>

            <div className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] flex items-center justify-between group hover:border-amber-500/40 transition-all cursor-pointer">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Sincronización con Neural Planner</p>
                    <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">Los ejercicios generados por IA respetarán estos objetivos automáticamente.</p>
                  </div>
               </div>
               <ArrowRight className="h-6 w-6 text-amber-500/20 group-hover:text-amber-500 transition-colors" />
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

function ObjectiveCard({ title, subtitle, icon: Icon, items }: any) {
  return (
    <Card className="glass-panel border-none bg-black/40 overflow-hidden group hover:bg-black/60 transition-all rounded-3xl">
      <div className="h-1 w-full bg-amber-500/40" />
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:amber-text-glow transition-all">{title}</CardTitle>
            <CardDescription className="text-[8px] font-black text-amber-500/40 uppercase tracking-[0.2em] italic">{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <ul className="space-y-3">
          {items.map((item: string, idx: number) => (
            <li key={idx} className="flex gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
              <div className="h-1 w-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CoachTip({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-amber-500/20 transition-all">
      <CheckCircle2 className="h-3 w-3 text-amber-500/40 group-hover:text-amber-500 transition-colors" />
      <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-tight italic">{text}</span>
    </div>
  );
}
