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
  BrainCircuit,
  Calendar,
  Dumbbell,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Settings
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  const renderSuperAdmin = () => (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Elite_Protocol_Active</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          SUPERADMIN_HUB
        </h1>
        <p className="text-[10px] font-black text-white/30 tracking-[0.2em] uppercase">Control Maestro de la Red SynqSports Pro</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="glass-panel p-8 relative group overflow-hidden border-primary/40 bg-primary/5 rounded-3xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
              <Zap className="h-32 w-32 text-primary" />
           </div>
           <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Ir al Panel de Control Global</h2>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed max-w-sm">
                 Acceso directo al núcleo de administración: Clubes, Planes, Promos, Usuarios y Analítica de red completa.
              </p>
              <Button className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 cyan-glow" asChild>
                 <Link href="/admin-global">ENTRAR_AL_NÚCLEO <ArrowUpRight className="h-4 w-4 ml-2" /></Link>
              </Button>
           </div>
        </Card>

        <Card className="glass-panel p-8 relative group overflow-hidden border-white/10 rounded-3xl">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
              <BrainCircuit className="h-32 w-32 text-white" />
           </div>
           <div className="relative z-10 space-y-6">
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Vista de Operativa Élite</h2>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed max-w-sm">
                 Monitoriza la experiencia de un entrenador: Tableros tácticos, Generadores AI y gestión de atletas.
              </p>
              <Button variant="outline" className="rounded-2xl border-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 hover:bg-white/5 transition-all" asChild>
                 <Link href="/dashboard/coach/planner">Ver Coach_Hub</Link>
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );

  const renderCoach = () => (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Club: {profile.clubId?.toUpperCase()} | Rol: Operativo Táctico</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white italic tracking-tighter uppercase italic cyan-text-glow">
            COACH_DASHBOARD
          </h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="rounded-2xl border-primary/30 text-primary hover:bg-primary/5 uppercase text-[10px] tracking-widest h-12 px-6" asChild>
            <Link href="/dashboard/coach/exercises"><Dumbbell className="h-4 w-4 mr-2" /> Biblioteca Táctica</Link>
          </Button>
          <Button className="rounded-2xl shadow-lg cyan-glow flex gap-2 h-12 uppercase text-[10px] tracking-widest font-black px-8" asChild>
            <Link href="/dashboard/coach/planner"><BrainCircuit className="h-4 w-4" /> Generar Plan AI</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel group hover:scale-[1.02] transition-all rounded-3xl">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Sesiones Hoy</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Próximas misiones tácticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-6 tracking-tighter italic">04</div>
            <Button variant="outline" className="w-full rounded-2xl border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Abrir Calendario</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel group hover:scale-[1.02] transition-all rounded-3xl">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Rendimiento</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Crecimiento promedio del equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary mb-6 tracking-tighter italic">+12%</div>
            <Button variant="outline" className="w-full rounded-2xl border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Ver Analítica</Button>
          </CardContent>
        </Card>

        <Card className="glass-panel group hover:scale-[1.02] transition-all border-t-2 border-t-primary/40 rounded-3xl">
          <CardHeader>
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Atletas</CardTitle>
            <CardDescription className="text-[10px] text-white/30 uppercase">Bajo supervisión directa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-6 tracking-tighter italic">24</div>
            <Button variant="outline" className="w-full rounded-2xl border-white/10 uppercase text-[10px] tracking-widest h-10 font-black">Gestionar Base</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-black tracking-widest uppercase mb-6 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Actividad Reciente del Nodo
        </h2>
        <Card className="glass-panel border-dashed border-white/10 p-12 text-center rounded-3xl">
            <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.5em]">No se han detectado eventos recientes en el sector {profile.clubId?.toUpperCase()}</p>
        </Card>
      </div>
    </div>
  );

  switch (profile.role) {
    case "superadmin": return renderSuperAdmin();
    case "club_admin":
    case "coach": return renderCoach();
    default: return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black uppercase text-white mb-4 italic tracking-tighter">Acceso Limitado</h2>
        <p className="text-white/40 uppercase text-[10px] tracking-widest">Su rol ({profile.role}) requiere vinculación a una terminal específica.</p>
        <Button variant="link" className="mt-6 text-primary uppercase text-[10px] font-black tracking-widest" asChild>
          <Link href="/login">Volver a Sincronización</Link>
        </Button>
      </div>
    );
  }
}
