"use client";

import Link from "next/link";
import {
  CalendarClock,
  ListChecks,
  ShieldCheck,
  Trophy,
  UserPlus,
  BarChart3,
  Coins,
  GitBranch,
  LayoutGrid,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  { href: "/dashboard/tournaments/list", title: "Listado", desc: "Torneos y estado.", icon: ListChecks },
  { href: "/dashboard/tournaments/registration", title: "Inscripciones", desc: "Altas y control.", icon: UserPlus },
  { href: "/dashboard/tournaments/planner", title: "Planificador", desc: "Campos y horarios.", icon: CalendarClock },
  { href: "/dashboard/tournaments/bracket", title: "Eliminatoria", desc: "Cuadros y fases KO.", icon: GitBranch },
  { href: "/dashboard/tournaments/classification", title: "Clasificación", desc: "Grupos y ranking.", icon: LayoutGrid },
  { href: "/dashboard/tournaments/analytics", title: "Analytics", desc: "Métricas del torneo.", icon: BarChart3 },
  { href: "/dashboard/tournaments/revenue", title: "Ingresos", desc: "Previsión económica.", icon: Coins },
  { href: "/dashboard/tournaments/teams", title: "Equipos", desc: "Plantillas inscritas.", icon: Trophy },
] as const;

export default function TournamentsControlPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-white/5 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300/70">Mesa de control</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white">
          Operación torneos
        </h1>
        <p className="mt-2 text-sm text-white/70 max-w-2xl">
          Accesos rápidos a planificación, inscripciones, cuadros y economía. Misma navegación que el menú lateral Torneos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {links.map(({ href, title, desc, icon: Icon }) => (
          <Card key={href} className="border border-violet-400/20 bg-black/30 hover:border-violet-400/40 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                <Icon className="h-4 w-4 text-violet-300 shrink-0" />
                {title}
              </CardTitle>
              <CardDescription className="text-white/50 text-xs">{desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={href} className="text-violet-300 text-xs font-black uppercase tracking-widest hover:underline">
                Abrir →
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex gap-3 text-sm text-white/75">
        <ShieldCheck className="h-5 w-5 text-violet-300 shrink-0 mt-0.5" />
        <p>
          El acceso a estas pantallas sigue la{" "}
          <strong className="text-white">matriz del club</strong> en el módulo de planificación / operativa (planner).
        </p>
      </div>
    </div>
  );
}
