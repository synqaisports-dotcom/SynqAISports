"use client";

import Link from "next/link";
import { CalendarClock, Coins, ShieldCheck, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TournamentsHomePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-white/5 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300/70">NODO TORNEOS</p>
        <h1 className="mt-2 text-3xl font-black uppercase italic tracking-tight text-white">
          Torneos No Oficiales
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Gestión de torneos por fases (grupos + eliminatoria), operación en campo y monetización para clubes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-violet-400/20 bg-black/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base"><Trophy className="h-4 w-4 text-violet-300" /> Resumen</CardTitle>
            <CardDescription>Estado general del torneo y configuración.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tournaments" className="text-violet-300 text-sm font-bold">Abrir</Link>
          </CardContent>
        </Card>

        <Card className="border border-violet-400/20 bg-black/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base"><CalendarClock className="h-4 w-4 text-violet-300" /> Planificador</CardTitle>
            <CardDescription>Campos, horarios, tiempos y descansos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tournaments/planner" className="text-violet-300 text-sm font-bold">Configurar</Link>
          </CardContent>
        </Card>

        <Card className="border border-violet-400/20 bg-black/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base"><Coins className="h-4 w-4 text-violet-300" /> Ingresos</CardTitle>
            <CardDescription>Entradas, previsión y control económico del club.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/tournaments/revenue" className="text-violet-300 text-sm font-bold">Planificar</Link>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4 text-sm text-white/80">
        <p className="font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-violet-300" /> Nota operativa</p>
        <p className="mt-2">
          Los ingresos son para el club y su pasarela/sistema propio. SynqAI solo proporciona la operativa y el panel de previsión.
        </p>
      </div>
    </div>
  );
}
