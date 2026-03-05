
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
  Calendar
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

  const renderClubAdmin = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Gestión de Club</h1>
          <p className="text-white/50 tracking-widest">ID_NODO: {profile.clubId}</p>
        </div>
        <Button className="rounded-none shadow-lg cyan-glow flex gap-2" asChild>
          <Link href="/dashboard/clubadmin/users"><Plus className="h-4 w-4" /> Invitar Personal</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-panel border-none shadow-sm hover:shadow-primary/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Entrenadores</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-sm hover:shadow-primary/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-white/40">Atletas</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Hub de Entrenador</h1>
          <p className="text-white/50 tracking-widest">ACCESO_AUTORIZADO: COACH</p>
        </div>
        <Button className="rounded-none shadow-lg cyan-glow flex gap-2" asChild>
          <Link href="/dashboard/coach/planner"><BrainCircuit className="h-4 w-4" /> Nuevo Plan AI</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Sesiones Programadas</CardTitle>
            <CardDescription>Tiene 4 misiones asignadas para hoy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest">Ver Calendario</Button>
          </CardContent>
        </Card>
        <Card className="glass-panel border-none shadow-sm group hover:ring-1 hover:ring-primary/40 transition-all">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-sm flex items-center justify-center mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>Métricas de Rendimiento</CardTitle>
            <CardDescription>Los promedios han subido un 12% en el grupo primario.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full rounded-none border-white/10 uppercase text-[10px] tracking-widest">Analítica Completa</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTutor = () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Monitoreo de Atletas</h1>
      <Card className="glass-panel border-none shadow-sm">
        <CardHeader>
          <CardTitle>Progreso del Atleta</CardTitle>
          <CardDescription>Visualice rendimiento y asistencia de los atletas vinculados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-black/20 rounded-none p-12 text-center text-white/20 font-light italic border border-white/5">
            Sin métricas activas para el periodo actual.
          </div>
        </CardContent>
      </Card>
    </div>
  );

  switch (profile.role) {
    case "superadmin": return renderSuperAdmin();
    case "club_admin": return renderClubAdmin();
    case "coach": return renderCoach();
    case "tutor": return renderTutor();
    default: return <div className="p-8">Nivel de Acceso No Definido</div>;
  }
}
