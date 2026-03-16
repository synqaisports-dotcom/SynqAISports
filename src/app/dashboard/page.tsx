
"use client";

import { useAuth } from "@/lib/auth-context";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Activity,
  UserCog,
  Clock,
  ChevronRight,
  Heart,
  Award,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

/**
 * Dashboard Maestro - v10.1.0
 * Centro de mando simplificado. La gamificación se ha movido a Estadísticas Sandbox
 * para usuarios Free para optimizar el túnel de conversión.
 */
export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER TÁCTICO LIMPIO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">
              Control de Cantera: {profile.clubName || "MODO_SANDBOX"}
            </span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white italic tracking-tighter uppercase cyan-text-glow leading-none">
            ACADEMY_CONTROL
          </h1>
          <p className="text-[10px] font-black text-primary/60 tracking-[0.2em] uppercase">Optimización Multideporte y Formación Base</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-2xl">
             SINCRO_ESTABLE
           </Badge>
        </div>
      </div>
      
      {/* MÉTRICAS OPERATIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OperationalMetricCard 
          title="Atletas Totales" 
          value="142" 
          icon={Users} 
          desc="Niños/as en Formación"
          trend="+12 este mes"
        />
        <OperationalMetricCard 
          title="Staff Técnico" 
          value="12" 
          icon={UserCog} 
          desc="Monitores y Coordinadores"
        />
        <OperationalMetricCard 
          title="Sesiones Mes" 
          value="48" 
          icon={Calendar} 
          desc="Entrenamientos Realizados"
          trend="85% asistencia media"
        />
        <OperationalMetricCard 
          title="Índice Formativo" 
          value="+24%" 
          icon={TrendingUp} 
          desc="Progreso Metodológico"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="glass-panel lg:col-span-2 rounded-3xl overflow-hidden border border-primary/20 bg-black/40">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-primary">
                <Dumbbell className="h-5 w-5 text-primary" /> Cronograma de Sesiones
              </CardTitle>
              <CardDescription className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Actividad de las categorías base</CardDescription>
            </div>
            <Button variant="link" className="text-primary font-black text-[10px] uppercase tracking-widest p-0" asChild>
              <Link href="/dashboard/sessions">Ver Todo <ChevronRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              <TrainingItem 
                time="17:00" 
                category="Infantil A" 
                focus="Fundamentos Técnicos" 
                location="Pista Central"
                status="ready"
              />
              <TrainingItem 
                time="17:00" 
                category="Alevín B" 
                focus="Psicomotricidad" 
                location="Zona Norte"
                status="ready"
              />
              <TrainingItem 
                time="18:30" 
                category="Cadete C" 
                focus="Lectura Táctica" 
                location="Sala Táctica"
                status="pending"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-3xl border border-primary/20 bg-black/40 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Actividad de la Red</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 space-y-6">
              <ActivityLog 
                type="info" 
                title="Nueva_Inscripción" 
                desc="Un nuevo atleta se ha unido a la categoría Iniciación." 
              />
              <ActivityLog 
                type="success" 
                title="Plan_Sincronizado" 
                desc="Se han actualizado los ejercicios del bloque táctico." 
              />
              <ActivityLog 
                type="warning" 
                title="Alerta_Asistencia" 
                desc="Baja asistencia detectada en el grupo Cadete B." 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OperationalMetricCard({ title, value, icon: Icon, desc, trend, highlight }: any) {
  return (
    <Card className={cn(
      "glass-panel relative overflow-hidden group hover:scale-[1.02] transition-all rounded-3xl border border-primary/20 bg-black/20",
      highlight && "border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
    )}>
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">{title}</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black italic tracking-tighter text-primary cyan-text-glow">{value}</p>
            {trend && <span className="text-[10px] font-bold text-primary mb-1 uppercase italic">{trend}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{desc}</p>
      </CardContent>
    </Card>
  );
}

function TrainingItem({ time, category, focus, location, status }: any) {
  return (
    <div className="p-6 hover:bg-primary/[0.03] transition-colors group flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center min-w-[60px] h-14 bg-primary/5 border border-primary/20 rounded-2xl group-hover:border-primary/40 transition-all">
          <Clock className="h-3 w-3 text-primary/60 mb-1" />
          <span className="text-xs font-black text-primary">{time}</span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">{category}</p>
          <h4 className="text-sm font-bold text-white uppercase italic">{focus}</h4>
          <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-2 w-2 rounded-full",
          status === 'ready' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/10'
        )} />
        <Button variant="ghost" size="icon" className="text-primary/20 hover:text-primary transition-all">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ActivityLog({ type, title, desc }: any) {
  const colors: any = {
    success: "bg-primary shadow-[0_0_10px_rgba(0,242,255,0.3)]",
    info: "bg-primary/40",
    warning: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
  };
  
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={cn("h-2 w-2 rounded-full mt-1.5", colors[type])} />
        <div className="w-[1px] flex-1 bg-white/5 mt-2" />
      </div>
      <div className="space-y-1 pb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] font-bold text-primary/30 leading-relaxed uppercase">{desc}</p>
      </div>
    </div>
  );
}
