"use client";

import { CalendarClock, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TournamentsPlannerPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/10 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">TORNEOS · PLANIFICADOR</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
          Planificador de Campos y Horarios
        </h1>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Motor de planificación (Fase 1)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/75">
          <p>Se añadirá aquí la programación automática por campo/hora con buffers entre partidos.</p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-[12px]">
              Reglas previstas: 1xX min o 2xX min, descanso entre partes y 10 min entre partidos (configurable).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
