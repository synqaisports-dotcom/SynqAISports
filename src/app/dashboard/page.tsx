
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
  Plus, 
  Users, 
  Building2, 
  Trophy, 
  TrendingUp,
  BrainCircuit,
  Calendar,
  Dumbbell
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const renderSuperAdmin = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-headline font-bold">Vista Global del Sistema</h1>
        <p className="text-white/50">Control maestro de la red SynqSports Pro.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
          <Building2 className="absolute -right-4 -bottom-4 h-24 w-24 opacity-20 rotate-12" />
          <CardHeader>
            <CardTitle className="text-4xl font-headline font-bold">12</CardTitle>
            <CardDescription className="text-primary-foreground/80">Clubes Activos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="font-semibold" asChild>
              <Link href="/dashboard/superadmin/clubs">Gestionar Red</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold text-white">2,450</CardTitle>
            <CardDescription>Usuarios Totales</CardDescription>
          </CardHeader>
        </Card>
        <Card className="glass-panel border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-headline font-bold text-white">$12.4k</CardTitle>
            <CardDescription>Crecimiento MRR</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white">Hub de Entrenador</h1>
          <p className="text-white/50 tracking-widest text-[10px] uppercase">Estatus: Activo | Rol: Operativo</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-none border-primary/30 text-primary hover:bg-primary/5 uppercase text-[10px] tracking-widest h-12" asChild>
            <Link href="/dashboard/coach/exercises"><Dumbbell className="h-4 w-4 mr-2" /> Módulo Táctico</Link>
          </Button>
          <Button className="rounded-none shadow-lg cyan-glow flex gap-2 h-12 uppercase text-[10px] tracking-widest font-black" asChild>
            <Link href="/dashboard/coach/planner"><BrainCircuit className="h-4 w-4" /> Nuevo Plan AI</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Sesiones Hoy</CardTitle>
            <CardDescription>Misiones asignadas para el periodo actual.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-4">04</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10">Ver Calendario</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Rendimiento</CardTitle>
            <CardDescription>Crecimiento promedio del grupo primario.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary mb-4">+12%</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10">Analítica</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all border-t-2 border-t-primary/40">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Atletas</CardTitle>
            <CardDescription>Activos bajo tu supervisión táctica.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white mb-4">24</div>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest h-10">Gestionar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  switch (profile.role) {
    case "superadmin": return renderSuperAdmin();
    case "coach": return renderCoach();
    default: return <div className="p-8">Nivel de Acceso No Definido</div>;
  }
}
