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
import { 
  Users, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Activity,
  UserCog,
  Clock,
  ChevronRight,
  Globe,
  Heart
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const isSuperAdmin = profile.role === "superadmin";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER TÁCTICO DINÁMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">
              Control de Cantera: {profile.clubId?.toUpperCase() || "SIN_NODO"}
            </span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white italic tracking-tighter uppercase cyan-text-glow">
            ACADEMY_CONTROL
          </h1>
          <p className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Optimización Multideporte y Formación Base</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {isSuperAdmin && (
            <Button variant="outline" className="rounded-2xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 uppercase text-[10px] tracking-widest h-14 px-8 font-black shadow-[0_0_15px_rgba(16,185,129,0.1)]" asChild>
              <Link href="/admin-global"><Globe className="h-4 w-4 mr-2" /> Núcleo Global</Link>
            </Button>
          )}
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
        {/* PRÓXIMOS ENTRENAMIENTOS */}
        <Card className="glass-panel lg:col-span-2 rounded-3xl overflow-hidden border-none bg-black/40">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                <Dumbbell className="h-5 w-5 text-primary" /> Cronograma de Sesiones
              </CardTitle>
              <CardDescription className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Actividad de las categorías base</CardDescription>
            </div>
            <Button variant="link" className="text-primary font-black text-[10px] uppercase tracking-widest p-0" asChild>
              <Link href="/dashboard/coach/planner">Ver Todo <ChevronRight className="h-3 w-3 ml-1" /></Link>
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
              <TrainingItem 
                time="Mañana" 
                category="Iniciación" 
                focus="Juegos Formativos" 
                location="Pista Anexa"
                status="pending"
              />
            </div>
          </CardContent>
        </Card>

        {/* ÚLTIMOS REPORTES / ALERTAS */}
        <Card className="glass-panel rounded-3xl border-none bg-black/40 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest">Actividad de la Red</CardTitle>
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
            <div className="p-8 pt-0">
               <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 uppercase text-[10px] tracking-widest font-black hover:text-primary hover:border-primary/30 transition-all">Ver Actividad Completa</Button>
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
      "glass-panel relative overflow-hidden group hover:scale-[1.02] transition-all rounded-3xl border-none bg-black/20",
      highlight && "border-t-2 border-primary/30 bg-primary/5"
    )}>
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{title}</p>
          <div className="flex items-end gap-3">
            <p className={cn(
              "text-4xl font-black italic tracking-tighter",
              highlight ? "text-primary cyan-text-glow" : "text-white"
            )}>{value}</p>
            {trend && <span className="text-[10px] font-bold text-primary mb-1 uppercase italic">{trend}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">{desc}</p>
      </CardContent>
    </Card>
  );
}

function TrainingItem({ time, category, focus, location, status }: any) {
  return (
    <div className="p-6 hover:bg-white/[0.02] transition-colors group flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center min-w-[60px] h-14 bg-white/5 border border-white/10 rounded-2xl group-hover:border-primary/30 transition-all">
          <Clock className="h-3 w-3 text-white/30 mb-1" />
          <span className="text-xs font-black text-white">{time}</span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">{category}</p>
          <h4 className="text-sm font-bold text-white uppercase italic">{focus}</h4>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-2 w-2 rounded-full",
          status === 'ready' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/10'
        )} />
        <Button variant="ghost" size="icon" className="text-white/20 hover:text-primary">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ActivityLog({ type, title, desc }: any) {
  const colors: any = {
    success: "bg-primary shadow-[0_0_10px_rgba(0,242,255,0.3)]",
    info: "bg-white/40",
    warning: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
  };
  
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={cn("h-2 w-2 rounded-full mt-1.5", colors[type])} />
        <div className="w-[1px] flex-1 bg-white/5 mt-2" />
      </div>
      <div className="space-y-1 pb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">{title}</p>
        <p className="text-[10px] font-bold text-white/30 leading-relaxed uppercase">{desc}</p>
      </div>
    </div>
  );
}