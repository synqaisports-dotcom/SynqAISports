"use client";

import { BadgeEuro, TicketPercent, Megaphone, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TournamentsRevenuePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-white/5 pb-5">
        <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Torneos / Planificador de Ingresos</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ingresos Torneo</h1>
        <p className="mt-2 text-sm text-white/70">
          Configura modelo económico del club para el torneo: entradas familias y monetización publicitaria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-panel border border-violet-500/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase text-violet-200 flex items-center gap-2">
              <TicketPercent className="h-4 w-4" />
              Entradas Familias
            </CardTitle>
            <CardDescription className="text-white/70">Precio por acceso al evento (gestión del club).</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/75">
            Campo recomendado: precio por adulto, precio por niño, pases diarios, pases torneo completo.
          </CardContent>
        </Card>

        <Card className="glass-panel border border-violet-500/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-black uppercase text-violet-200 flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Publicidad Torneo
            </CardTitle>
            <CardDescription className="text-white/70">AdMob + patrocinadores locales del club.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-white/75">
            Sección preparada para diferenciar ingresos por impresión/click y acuerdos locales.
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border border-violet-500/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-black uppercase text-violet-200 flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Nota de Modelo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/75">
          La plataforma no cobra directamente entrada al padre. Este nodo contempla configuración para que el
          club gestione su propio sistema de cobro y visualice previsión de ingresos por torneo.
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 flex items-center gap-3">
        <BadgeEuro className="h-4 w-4 text-violet-300" />
        <p className="text-xs font-black uppercase tracking-wider text-violet-200/90">
          Fase inicial: diseño operativo. Conexión de datos en siguiente iteración.
        </p>
      </div>
    </div>
  );
}
