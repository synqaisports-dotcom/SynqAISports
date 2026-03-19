
"use client";

import { BookOpen, Target, GitBranch, Library, CalendarDays, Monitor, PencilLine, Zap, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function MethodologyDashboard() {
  const sections = [
    { title: "Items de Aprendizaje", desc: "Defina la hoja de ruta formativa del club.", icon: BookOpen, href: "/dashboard/methodology/learning-items" },
    { title: "Objetivos", desc: "Metas tácticas por categoría y etapa.", icon: Target, href: "/dashboard/methodology/objectives" },
    { title: "Planificador de Ciclos", desc: "Gestión temporal del macrociclo.", icon: GitBranch, href: "/dashboard/methodology/cycle-planner" },
    { title: "Pizarra de Partido", desc: "Terminal táctica de alta competición.", icon: Monitor, href: "/board/match" },
    { title: "Pizarra de Ejercicios", desc: "Diseño técnico de módulos de trabajo.", icon: PencilLine, href: "/board/training" },
    { title: "Biblioteca (Sin IA)", desc: "Almacenamiento manual de tareas.", icon: Library, href: "/dashboard/methodology/exercise-library" },
    { title: "Planificador de Sesiones", desc: "Cronograma diario de entrenamientos.", icon: CalendarDays, href: "/dashboard/methodology/session-planner" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase">Strategic_Methodology_Hub</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow">
          ESTRATEGIA_CENTRAL
        </h1>
        <p className="text-[10px] font-black text-amber-500/30 tracking-[0.2em] uppercase">Control Maestro de la Identidad Deportiva</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, idx) => (
          <Link key={idx} href={section.href}>
            <Card className="glass-panel h-full relative overflow-hidden group hover:scale-[1.02] transition-all border border-amber-500/20 bg-black/20 rounded-3xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <section.icon className="h-12 w-12 text-amber-500" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-white group-hover:amber-text-glow transition-all italic tracking-widest uppercase">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-[9px] font-bold text-amber-500/40 uppercase tracking-widest mt-2 leading-relaxed">
                  {section.desc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-4">
                   <div className="h-[1px] flex-1 bg-amber-500/20" />
                   <span className="text-[8px] font-black text-amber-500 uppercase">Acceder_Nodo</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
