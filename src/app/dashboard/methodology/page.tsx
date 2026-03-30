
"use client";

import { Target, GitBranch, Library, CalendarDays, Monitor, PencilLine, Zap, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useClubAccessMatrixOptional } from "@/contexts/club-access-matrix-context";
import { canAccessClubModule, resolveClubModuleForPath, shouldBypassClubMatrix } from "@/lib/club-permissions";

export default function MethodologyDashboard() {
  const { profile } = useAuth();
  const ctx = useClubAccessMatrixOptional();
  const matrix = ctx?.normalizedMatrix ?? {};
  const role = profile?.role;
  const bypass = shouldBypassClubMatrix(role);

  const sections = [
    { title: "Objetivos", desc: "Metas tácticas por categoría y etapa.", icon: Target, href: "/dashboard/methodology/objectives" },
    { title: "Planificador de Ciclos", desc: "Gestión temporal del macrociclo.", icon: GitBranch, href: "/dashboard/methodology/cycle-planner" },
    { title: "Agenda de Ocupación", desc: "Calendario semanal por sección y campo.", icon: CalendarDays, href: "/dashboard/methodology/calendar" },
    { title: "Pizarra de Partido", desc: "Terminal táctica de alta competición.", icon: Monitor, href: "/board/match?source=elite" },
    { title: "Pizarra de Ejercicios", desc: "Diseño técnico de módulos de trabajo.", icon: PencilLine, href: "/board/training" },
    { title: "Biblioteca", desc: "Almacenamiento manual de tareas.", icon: Library, href: "/dashboard/methodology/exercise-library" },
    { title: "Planificador de Sesiones", desc: "Cronograma diario de entrenamientos.", icon: CalendarDays, href: "/dashboard/methodology/session-planner" },
    { title: "Almacén (Club)", desc: "Inventario y reparto por equipos.", icon: Zap, href: "/dashboard/methodology/warehouse" },
  ];

  const canUseLink = (href: string) => {
    if (!role || bypass) return true;
    const path = href.split("?")[0] ?? href;
    const mod = resolveClubModuleForPath(path);
    if (!mod) return true;
    return canAccessClubModule(matrix, role, mod, "access");
  };

  const visible = sections.filter((s) => canUseLink(s.href));

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary/90 animate-pulse" />
          <span className="text-[10px] font-black text-primary/80 tracking-[0.5em] uppercase">Strategic_Methodology_Hub</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          ESTRATEGIA_CENTRAL
        </h1>
        <p className="text-[10px] font-black text-primary/40 tracking-[0.2em] uppercase">
          Control maestro de la identidad deportiva (filtrado por matriz de acceso del club)
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-[10px] font-bold uppercase text-white/40 tracking-widest py-12">
          No tienes nodos de metodología visibles con tu rol actual.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visible.map((section, idx) => (
            <Link key={idx} href={section.href}>
              <Card className="glass-panel h-full relative overflow-hidden group hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] border border-primary/20 bg-black/20 rounded-3xl">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <section.icon className="h-12 w-12 text-primary/80" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black text-white group-hover:cyan-text-glow transition-[background-color,border-color,color,opacity,transform] italic tracking-widest uppercase">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-[9px] font-bold text-primary/45 uppercase tracking-widest mt-2 leading-relaxed">
                    {section.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mt-4">
                    <div className="h-[1px] flex-1 bg-primary/20" />
                    <span className="text-[8px] font-black text-primary uppercase">Acceder_Nodo</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
