
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
  Compass,
  Activity,
  Triangle,
  Award,
  ShieldCheck
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
    philosophy: "Los objetivos principales para un equipo prebenjamín (6-8 años) se centran en la formación integral, la diversión y el desarrollo motor a través del juego, priorizando el aprendizaje técnico individual sobre el resultado. Se busca fomentar el compañerismo, el respeto y la familiarización con el balón en un entorno lúdico.",
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
          "Dominio del balón: Familiarización y conducción con distintas superficies del pie.",
          "Iniciación al regate: Fomentar el 1 contra 1 para superar rivales.",
          "Finalización: Aprender a tirar a portería y marcar.",
          "Pase y recepción: Iniciar toques básicos y control orientado.",
          "Capacidad de levantar la cabeza al conducir."
        ]
      },
      {
        title: "Tácticos",
        subtitle: "Colectivos e Individuales",
        icon: Compass,
        items: [
          "Evitar aglomeraciones: Separarse y ocupar espacios para recibir.",
          "Noción de equipo: Entender la cooperación y oposición (3x3, 2x1).",
          "Zonas de riesgo: Salir jugando sin complicarse cerca de portería propia.",
          "Inicio de la noción de 'pasar y moverse'.",
          "Entendimiento del fuera de juego básico."
        ]
      },
      {
        title: "Físicos y Motores",
        subtitle: "Coordinación y Motricidad",
        icon: Dumbbell,
        items: [
          "Mejora de la agilidad, equilibrio y velocidad de reacción.",
          "Velocidad de reacción mediante juegos y circuitos.",
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
          "Diversión: Que el niño disfrute practicando deporte.",
          "Valores: Fomentar compañerismo, juego limpio y respeto.",
          "Gestión emocional: Convivir con éxito y frustración.",
          "Disciplina formativa: Puntualidad y cuidado material.",
          "Fomentar la toma de decisiones sin miedo al error."
        ]
      }
    ]
  },
  benjamin: {
    title: "INICIACIÓN",
    titleAccent: "ESPECÍFICA TÁCTICA",
    philosophy: "La categoría Benjamín (8-10 años) es una etapa de 'iniciación específica', donde se pasa de un enfoque puramente lúdico a uno donde la técnica individual y los conceptos básicos de cooperación cobran importancia. El foco está en la formación técnica y la comprensión del juego.",
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
          "Transiciones: Empezar a entender la rápida transición de ataque a defensa (perder el balón y reaccionar).",
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
          "Respeto al reglamento: Aceptar las decisiones del árbitro.",
          "Autonomía: Fomentar que decidan qué hacer con el balón.",
          "Motivación: Mantener la pasión por la práctica deportiva.",
          "Resiliencia: Gestión positiva del error en el aprendizaje."
        ]
      }
    ]
  },
  alevin: {
    title: "CONSOLIDACIÓN Y",
    titleAccent: "TRANSICIÓN TÁCTICA",
    philosophy: "La categoría alevín (10-12 años) es una etapa crítica y de transición. Se pasa de un juego más individualista a una etapa donde se consolida la técnica y se inicia la comprensión táctica colectiva, especialmente en el paso de Fútbol 7 a Fútbol 11.",
    tips: [
      "Formar jugadores inteligentes y cooperativos.",
      "No especialización: Experimentar todas las posiciones.",
      "Prioridad formativa sobre el resultado competitivo.",
      "Trabajar la técnica colectiva mediante estructuras en triángulo."
    ],
    dimensions: [
      {
        title: "Técnicos",
        subtitle: "Automatización bajo Presión",
        icon: Zap,
        items: [
          "Control orientado: Ganar tiempo y espacio (pies, pecho, cabeza).",
          "Pase: Aumentar precisión y fuerza; iniciación al pase largo.",
          "Conducción y Regate: Con visión periférica para superar 1x1.",
          "Finalización: Efectividad con ambas piernas y superficies.",
          "Protección de balón: Uso del cuerpo para mantener posesión."
        ]
      },
      {
        title: "Tácticos",
        subtitle: "Entendimiento del Juego",
        icon: Compass,
        items: [
          "Amplitud y profundidad: Ocupación racional del campo.",
          "Desmarques y apoyos: Movimiento constante sin balón.",
          "Paredes y combinaciones: Automatización de pases rápidos.",
          "Marcaje y cobertura: Temporización y ayudas defensivas.",
          "Estructura táctica: Recuperación de posición tras pérdida."
        ]
      },
      {
        title: "Físicos",
        subtitle: "Capacidades Motoras",
        icon: Dumbbell,
        items: [
          "Coordinación y Agilidad: Control del propio cuerpo en carrera.",
          "Velocidad de Reacción: Ante estímulos técnicos y tácticos.",
          "Resistencia Aeróbica: Capacidad de trabajo (50-60 min).",
          "Fuerza explosiva: Iniciación en saltos y arrancadas.",
          "Flexibilidad: Prevención de lesiones en etapa de crecimiento."
        ]
      },
      {
        title: "Psicopedagógicos",
        subtitle: "Toma de Decisiones",
        icon: Heart,
        items: [
          "Cooperación: El fútbol como deporte de equipo.",
          "Autonomía: Decidir sin esperar indicaciones constantes.",
          "Gestión del error: El fallo como parte del aprendizaje.",
          "Aceptación de normas y respeto absoluto al árbitro.",
          "Liderazgo positivo dentro del grupo."
        ]
      }
    ]
  },
  infantil: {
    title: "COMPETICIÓN Y",
    titleAccent: "EDAD DE ORO",
    philosophy: "En la categoría infantil (11-13 años), conocida como la 'edad de oro' del aprendizaje motor, el enfoque se centra en la formación integral del jugador. Se busca perfeccionar la técnica individual, introducir la toma de decisiones tácticas y consolidar los valores del deporte por encima del resultado competitivo.",
    tips: [
      "Fomentar la inteligencia de juego por encima de la mecánica.",
      "Consolidar la cultura de equipo y el respeto mutuo.",
      "Introducir hábitos saludables como parte del entrenamiento.",
      "La diversión y la autonomía son pilares de la motivación."
    ],
    dimensions: [
      {
        title: "Técnicos",
        subtitle: "Perfeccionamiento",
        icon: Zap,
        items: [
          "Dominio de fundamentos: Control, pase y tiro avanzado.",
          "Técnica en velocidad: Ejecución correcta bajo presión rival.",
          "Especialización técnica: Gestos propios de la posición.",
          "Ambidiestrismo: Mejora del pie menos hábil.",
          "Golpeo de larga distancia y centros precisos."
        ]
      },
      {
        title: "Tácticos",
        subtitle: "Inteligencia de Juego",
        icon: Compass,
        items: [
          "Toma de decisiones: Resolver situaciones reales de campo.",
          "Juego colectivo: Conceptos elementales en ataque y defensa.",
          "Basculaciones y coberturas: Movimiento coordinado de línea.",
          "Estrategia básica: Iniciación al balón parado.",
          "Ocupación de espacios en Fútbol 11."
        ]
      },
      {
        title: "Físicos y Motrices",
        subtitle: "Coordinación y Hábitos",
        icon: Dumbbell,
        items: [
          "Coordinación específica: Agilidad y equilibrio óculo-pédica.",
          "Hábitos saludables: Calentamiento, enfriamiento e higiene.",
          "Desarrollo motor: Condición física adaptada al crecimiento.",
          "Velocidad gestual y de desplazamiento.",
          "Prevención: Ejercicios de fortalecimiento básico."
        ]
      },
      {
        title: "Psicosociales",
        subtitle: "Cultura y Resiliencia",
        icon: Heart,
        items: [
          "Cultura de equipo: Priorizar el grupo sobre el individuo.",
          "Resiliencia: Gestionar victoria, derrota y error.",
          "Respeto absoluto: Compañeros, rivales y árbitros.",
          "Autonomía: Responsabilidad sobre material y mochila.",
          "Diversión constante: El deporte como hábito de vida."
        ]
      }
    ]
  },
  cadete: {
    title: "ESPECIALIZACIÓN Y",
    titleAccent: "RENDIMIENTO",
    philosophy: "Para un equipo de categoría cadete (aproximadamente 14 a 15 años), el enfoque evoluciona desde la formación básica hacia la especialización y el rendimiento. En esta etapa, los jugadores ya poseen una base técnica y comienzan a entender el deporte de forma más profesionalizada.",
    tips: [
      "Fomentar la mentalidad competitiva: Confianza, Control, Compromiso y Concentración.",
      "Orientar la preparación física al rendimiento armónico.",
      "Potenciar la comunicación y empatía en el grupo.",
      "Responsabilizar al jugador de su propio progreso (autocrítica)."
    ],
    dimensions: [
      {
        title: "Técnicos",
        subtitle: "Perfeccionamiento por Puesto",
        icon: Zap,
        items: [
          "Dominar habilidades propias de la demarcación específica.",
          "Perfeccionamiento de la técnica aplicada a la posición.",
          "Eficacia en gestos técnicos a alta intensidad.",
          "Optimización del tiempo de ejecución técnica."
        ]
      },
      {
        title: "Tácticos",
        subtitle: "Lectura de Juego y Estrategia",
        icon: Compass,
        items: [
          "Mejorar la toma de decisiones en situaciones reales de partido.",
          "Aplicación de conceptos de táctica colectiva compleja.",
          "Profundizar en el reglamento para aprovechar situaciones de juego.",
          "Análisis táctico del rival y adaptaciones en vivo."
        ]
      },
      {
        title: "Físicos y Condicionales",
        subtitle: "Rendimiento y Hábitos",
        icon: Dumbbell,
        items: [
          "Preparación física orientada al rendimiento (fuerza, velocidad).",
          "Entrenamiento invisible: Nutrición, descanso y recuperación.",
          "Prevención de lesiones mediante fortalecimiento específico.",
          "Adaptación armónica al desarrollo biológico final."
        ]
      },
      {
        title: "Psicopedagógicos",
        subtitle: "Mentalidad y Madurez",
        icon: Heart,
        items: [
          "Fomentar las '4 C': Confianza, Control, Compromiso y Concentración.",
          "Cohesión de grupo: Éxito colectivo sobre individualismo.",
          "Valores de club: Respeto, responsabilidad y esfuerzo.",
          "Autonomía y madurez: Autocrítica constante del rendimiento.",
          "Filosofía de mejora continua y aprendizaje profesional."
        ]
      }
    ]
  },
  juvenil: {
    title: "OPTIMIZACIÓN Y",
    titleAccent: "ALTA COMPETICIÓN",
    philosophy: "En la categoría juvenil (16 a 18 años), estamos en la antesala del mundo adulto. Aquí el chip cambia: pasamos de la formación pura a la optimización del rendimiento y la preparación para la alta competición.",
    tips: [
      "Optimización del rendimiento y preparación para la alta competición.",
      "Dominio táctico y estratégico, con análisis del rival.",
      "Fomentar la mentalidad competitiva, el liderazgo y la ética de trabajo.",
      "Preparar al jugador para el salto a la categoría Senior."
    ],
    dimensions: [
      {
        title: "Técnicos",
        subtitle: "Efectividad Máxima",
        icon: Zap,
        items: [
          "Perfeccionamiento técnico en velocidad y bajo presión.",
          "Dominio de gestos técnicos complejos específicos de la posición.",
          "Efectividad en finalización con ambas piernas.",
          "Mantenimiento técnico bajo fatiga acumulada.",
          "Especialización en golpeos de balón parado."
        ]
      },
      {
        title: "Tácticos y Estratégicos",
        subtitle: "Dominio del Juego",
        icon: Compass,
        items: [
          "Flexibilidad táctica: Alternar dibujos durante un partido.",
          "Análisis del rival: Identificar y explotar debilidades.",
          "Especialización por puesto: Consolidar el rol específico.",
          "Gestión de tiempos de partido y marcadores.",
          "Dominio de la estrategia defensiva y ofensiva."
        ]
      },
      {
        title: "Físicos de Alto Nivel",
        subtitle: "Rendimiento y Prevención",
        icon: Dumbbell,
        items: [
          "Pico de forma: Fuerza, potencia y resistencia específica.",
          "Prevención de lesiones: Cultura de autocuidado constante.",
          "Gestión de cargas: Evitar el sobreentrenamiento.",
          "Nutrición y suplementación deportiva profesional.",
          "Recuperación post-esfuerzo: Crioterapia y protocolos."
        ]
      },
      {
        title: "Psicológicos",
        subtitle: "Mentalidad y Proyección",
        icon: Heart,
        items: [
          "Gestión de la presión en situaciones críticas (finales).",
          "Liderazgo: Fomentar líderes positivos en el vestuario.",
          "Ambición y ética de trabajo: El talento no es suficiente.",
          "Salto a Senior: Preparación para la dureza física adulta.",
          "Compromiso con el club y representación de valores."
        ]
      }
    ]
  }
};

export default function ObjectivesPage() {
  const [selectedCat, setSelectedCat] = useState("debutantes");
  const currentContent = CONTENT[selectedCat];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 p-8 lg:p-12">
      {/* HEADER TÁCTICO REESTRUCTURADO (DOS FILAS) */}
      <div className="flex flex-col gap-8 border-b border-white/5 pb-10">
        {/* FILA 1: TÍTULO E IDENTIDAD */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase italic">Strategic_Objectives_v2.9</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            OBJETIVOS_TÁCTICOS
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Hoja de Ruta Formativa del Club</p>
        </div>

        {/* FILA 2: SELECTOR DE CATEGORÍAS (OCUPANDO TODO EL ANCHO) */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5 overflow-x-auto max-w-full custom-scrollbar shadow-inner">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={cn(
                "flex items-center gap-4 px-8 py-4 rounded-xl transition-[background-color,border-color,color,opacity,transform] whitespace-nowrap group relative overflow-hidden flex-1 min-w-[180px]",
                selectedCat === cat.id 
                  ? "bg-primary/20 text-white border border-primary/40 shadow-[0_0_24px_rgba(0,242,255,0.32)] z-10" 
                  : "text-primary/80 hover:text-white hover:bg-white/5 border border-white/10 hover:border-primary/40"
              )}
            >
              <cat.icon className={cn("h-5 w-5", selectedCat === cat.id ? "text-white" : "text-primary/70 group-hover:text-white")} />
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                <span className={cn("text-[9px] font-bold uppercase", selectedCat === cat.id ? "text-white/80" : "text-primary/60 group-hover:text-white/80")}>{cat.age}</span>
              </div>
              {selectedCat === cat.id && (
                <div className="absolute inset-0 bg-white/10 scan-line" />
              )}
            </button>
          ))}
        </div>
      </div>

      {currentContent ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          <div className="xl:col-span-1 space-y-10">
            <Card className="glass-panel border-primary/20 bg-primary/5 p-10 relative group overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.06)]">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-[background-color,border-color,color,opacity,transform]">
                <BookOpen className="h-32 w-32 text-primary" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Filosofía de Etapa</span>
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight">
                {currentContent.title} <br /><span className="text-primary">{currentContent.titleAccent}</span>
              </h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose italic relative z-10">
                {currentContent.philosophy}
              </p>
            </Card>

            <div className="p-8 rounded-[2.5rem] border border-primary/10 bg-black/40 space-y-6 relative overflow-hidden group">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Guía para el Entrenador</span>
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

            <div className="p-10 bg-primary/5 border border-primary/20 rounded-[3rem] flex items-center justify-between group hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform] cursor-pointer">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Sincronización con Neural Planner</p>
                    <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Los ejercicios generados por IA respetarán estos objetivos automáticamente.</p>
                  </div>
               </div>
               <ArrowRight className="h-6 w-6 text-primary/20 group-hover:text-primary transition-colors" />
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

function ObjectiveCard({ title, subtitle, icon: Icon, items }: any) {
  return (
    <Card className="glass-panel border-none bg-black/40 overflow-hidden group hover:bg-black/60 transition-[background-color,border-color,color,opacity,transform] rounded-3xl">
      <div className="h-1 w-full bg-primary/40" />
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:cyan-text-glow transition-[background-color,border-color,color,opacity,transform]">{title}</CardTitle>
            <CardDescription className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] italic">{subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <ul className="space-y-3">
          {items.map((item: string, idx: number) => (
            <li key={idx} className="flex gap-3 text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
              <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
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
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-primary/20 transition-[background-color,border-color,color,opacity,transform]">
      <CheckCircle2 className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors" />
      <span className="text-[9px] font-black text-white/40 group-hover:text-white uppercase tracking-tight italic">{text}</span>
    </div>
  );
}
