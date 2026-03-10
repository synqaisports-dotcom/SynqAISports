
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
  { id: "prebenjamin", label: "Prebenjamín", age: "7-8 años", icon: Zap },
  { id: "benjamin", label: "Benjamín", age: "9-10 años", icon: Target },
];

export default function ObjectivesPage() {
  const [selectedCat, setSelectedCat] = useState("debutantes");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Strategic_Objectives_v2.2</span>
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

      {selectedCat === "debutantes" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          
          {/* COLUMNA FILOSOFÍA Y RECOMENDACIONES */}
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
                INICIACIÓN Y <br /><span className="text-amber-500">FORMACIÓN INTEGRAL</span>
              </h3>
              <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest leading-loose italic relative z-10">
                La categoría debutante se enfoca en la iniciación deportiva, donde el objetivo principal no es ganar partidos, sino el disfrute a través del aprendizaje técnico y motor. El fútbol es nuestra herramienta educativa para desarrollar habilidades físicas, sociales y técnicas básicas.
              </p>
            </Card>

            <div className="p-8 rounded-[2.5rem] border border-amber-500/10 bg-black/40 space-y-6 relative overflow-hidden group">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Guía para el Entrenador</span>
              </div>
              <div className="space-y-4">
                <CoachTip text="El juego es la metodología: Componente lúdico siempre." />
                <CoachTip text="No especializar: Todos juegan en todas las posiciones." />
                <CoachTip text="Paciencia infinita: Atención y motricidad en desarrollo." />
                <CoachTip text="Refuerzo positivo: Celebra el esfuerzo, no el gol." />
              </div>
            </div>
          </div>

          {/* MATRIZ DE OBJETIVOS ESPECÍFICOS */}
          <div className="xl:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* TÉCNICOS */}
              <ObjectiveCard 
                title="Técnicos" 
                subtitle="Relación con el Balón"
                icon={Zap}
                items={[
                  "Familiarización: Un balón por niño para maximizar toques.",
                  "Conducción básica: Balón cerca del pie.",
                  "Iniciación al regate: Perder el miedo al cambio de dirección.",
                  "Golpeo/Remate: Contacto inicial para pase o tiro.",
                  "Control básico: Intentar parar el balón con el cuerpo."
                ]}
              />

              {/* TÁCTICOS */}
              <ObjectiveCard 
                title="Tácticos" 
                subtitle="Entendimiento del Juego"
                icon={Compass}
                items={[
                  "Concepto de dirección: Saber qué portería atacar/defender.",
                  "Evitar 'Efecto Colmena': Empezar a dispersarse.",
                  "Nociones espaciales: Dónde estoy en el campo.",
                  "Noción compañero/rival: Reconocer con quién juego.",
                  "Reglas básicas: El balón no se toca con la mano."
                ]}
              />

              {/* MOTORES */}
              <ObjectiveCard 
                title="Motores y Físicos" 
                subtitle="Desarrollo General"
                icon={Dumbbell}
                items={[
                  "Motricidad general: Correr, saltar, girar y frenar.",
                  "Coordinación ojo-pie y equilibrio dinámico.",
                  "Orientación espacial y temporal.",
                  "Conocimiento del propio cuerpo.",
                  "Familiarización con el césped y material técnico."
                ]}
              />

              {/* PSICOLÓGICOS */}
              <ObjectiveCard 
                title="Psicopedagógicos" 
                subtitle="Valores y Socialización"
                icon={Heart}
                items={[
                  "Diversión absoluta: Ganas de volver mañana.",
                  "Hábitos de higiene y vestuario (autonomía).",
                  "Respeto: Compañeros, rivales y normas.",
                  "Integración en el grupo y compartir.",
                  "Cuidado del material y la mochila propia."
                ]}
              />

            </div>

            <div className="p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase italic tracking-widest">Sincronización con Neural Planner</p>
                    <p className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">Los ejercicios generados por IA respetarán estos objetivos automáticamente.</p>
                  </div>
               </div>
               <ArrowRight className="h-6 w-6 text-amber-500/20" />
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
