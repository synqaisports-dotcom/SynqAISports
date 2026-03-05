
"use client";

import { TicketPercent, Plus, Zap, Shield, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GlobalPlansPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <TicketPercent className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Subscription_Protocols</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            PLAN_CONFIGURATION
          </h1>
        </div>
        <Button className="rounded-none bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 cyan-glow hover:scale-105 transition-all">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Protocolo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanTerminalCard 
          title="BASIC_NODE" 
          price="$199/mes" 
          users="10" 
          icon={Zap} 
          features={["Gestión Base", "5 Entrenadores", "Analítica Simple"]} 
        />
        <PlanTerminalCard 
          title="PRO_NETWORK" 
          price="$499/mes" 
          users="50" 
          icon={Shield} 
          featured
          features={["Todo en Basic", "IA Neural Planner", "API Acceso", "Soporte 24/7"]} 
        />
        <PlanTerminalCard 
          title="ELITE_CORE" 
          price="CUSTOM" 
          users="ILIMITADOS" 
          icon={Crown} 
          features={["Todo en Pro", "Despliegue On-Premise", "IA Personalizada", "Gestión Multiclub"]} 
        />
      </div>
    </div>
  );
}

function PlanTerminalCard({ title, price, users, icon: Icon, features, featured }: any) {
  return (
    <Card className={cn(
      "glass-panel overflow-hidden relative group",
      featured && "border-primary shadow-[0_0_30px_rgba(0,242,255,0.1)]"
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="text-center pt-8">
        <CardDescription className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">{featured ? 'RECOMENDADO' : 'NIVEL_ACCESO'}</CardDescription>
        <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase mt-2">{title}</CardTitle>
        <div className="text-3xl font-black text-primary cyan-text-glow mt-4 font-headline">{price}</div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-col items-center gap-1 border-y border-white/5 py-4 bg-white/[0.01]">
           <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Capacidad de Nodos</span>
           <span className="text-xs font-black text-white">{users} Usuarios Activos</span>
        </div>
        <ul className="space-y-3">
          {features.map((f: any, i: number) => (
            <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">
              <div className="h-1 w-1 bg-primary" /> {f}
            </li>
          ))}
        </ul>
        <Button className="w-full h-12 rounded-none border border-primary/40 bg-transparent text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-black transition-all">
          Modificar Configuración
        </Button>
      </CardContent>
    </Card>
  );
}
