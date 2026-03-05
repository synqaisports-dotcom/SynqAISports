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
  Building2, 
  TrendingUp,
  BrainCircuit,
  Calendar,
  Dumbbell,
  Zap,
  Activity
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const renderSuperAdmin = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" /> Global Command Center
        </h1>
        <p className="text-white/50">Control maestro de la red SynqSports Pro.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none shadow-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="relative">
            <CardTitle className="text-4xl font-headline font-black">12</CardTitle>
            <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Clubes Activos</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <Button variant="outline" size="sm" className="rounded-none border-primary/30 text-primary uppercase text-[10px] font-black" asChild>
              <Link href="/dashboard/superadmin/clubs">Gestionar Red</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-black">2,450</CardTitle>
            <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Usuarios Totales</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-black text-primary">$12.4k</CardTitle>
            <CardDescription className="uppercase tracking-widest text-[10px] font-bold">Crecimiento MRR</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-black text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" /> Hub de Operaciones
          </h1>
          <p className="text-white/50 tracking-[0.3em] text-[10px] uppercase font-bold mt-2">Estatus: Activo | Rol: Operativo Táctico</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-none border-primary/30 text-primary hover:bg-primary/5 uppercase text-[10px] tracking-widest h-12 px-6" asChild>
            <Link href="/dashboard/coach/exercises"><Dumbbell className="h-4 w-4 mr-2" /> Biblioteca Táctica</Link>
          </Button>
          <Button className="rounded-none shadow-lg cyan-glow flex gap-2 h-12 uppercase text-[10px] tracking-widest font-black px-8" asChild>
            <Link href="/dashboard/coach/planner"><BrainCircuit className="h-4 w-4" /> Generar Plan AI</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Sesiones Hoy</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Próximas misiones tácticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-6">04</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Abrir Calendario</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Rendimiento</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Crecimiento promedio del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary mb-6">+12%</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Ver Analítica</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all border-t-2 border-t-primary/40">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Atletas</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Bajo supervisión directa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-6">24</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Gestionar Base</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-black tracking-widest uppercase mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Actividad Reciente
        </h2>
        <Card className="glass-panel border-none overflow-hidden">
          <div className="p-8 text-center border border-dashed border-white/10">
            <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.5em]">No se han detectado eventos recientes en el sector</p>
          </div>
        </Card>
      </div>
    </div>
  );

  switch (profile.role) {
    case "superadmin": return renderSuperAdmin();
    case "coach": return renderCoach();
    default: return (
      <div className="p-12 text-center glass-panel">
        <h2 className="text-2xl font-black uppercase text-primary mb-4">Acceso Limitado</h2>
        <p className="text-white/40 uppercase text-[10px] tracking-widest">Su rol actual no tiene una terminal asignada.</p>
      </div>
    );
  }
}
