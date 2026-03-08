
"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  UserCog, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Save, 
  ShieldAlert,
  Users,
  Building2,
  MapPin,
  ClipboardCheck,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ROLES_TO_MANAGE = [
  { id: "academy_director", label: "Director de Cantera", rank: 80 },
  { id: "methodology_director", label: "Director Metodología", rank: 70 },
  { id: "stage_coordinator", label: "Coordinador Etapa", rank: 60 },
  { id: "coach", label: "Entrenador", rank: 50 },
  { id: "delegate", label: "Delegado", rank: 40 },
  { id: "tutor", label: "Tutor / Familia", rank: 30 },
  { id: "athlete", label: "Atleta / Jugador", rank: 20 },
];

const MODULES = [
  { id: "staff", label: "Gestión de Personal", icon: UserCog },
  { id: "players", label: "Gestión de Jugadores", icon: Users },
  { id: "facilities", label: "Instalaciones", icon: MapPin },
  { id: "tactics", label: "Pizarra y Ejercicios", icon: ClipboardCheck },
];

export default function AdminPermissionsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState(ROLES_TO_MANAGE[0].id);
  const [loading, setLoading] = useState(false);

  // Control de acceso a la página
  const isAuthorized = profile && ["superadmin", "club_admin", "academy_director"].includes(profile.role);

  if (!isAuthorized) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse" />
          <ShieldAlert className="h-20 w-20 text-rose-500 relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Acceso de Nivel Insuficiente</h2>
        <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] max-w-md mx-auto leading-relaxed">
          Este terminal requiere privilegios de autoridad raíz o directiva. Su identidad actual no tiene permisos para modificar la matriz de red.
        </p>
      </div>
    );
  }

  const handleSaveMatrix = () => {
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "MATRIZ_SINCRO",
        description: "Los protocolos de permisos han sido actualizados en el nodo.",
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Auth_Matrix_Control</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Admin & Permisos
          </h1>
        </div>
        
        <Button 
          onClick={handleSaveMatrix}
          disabled={loading}
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
        >
          {loading ? "Sincronizando..." : "Guardar Cambios Matriz"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
        {/* LISTA DE ROLES (JERARQUÍA) */}
        <aside className="space-y-6">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Jerarquía de Mando</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Seleccione un nivel jerárquico para configurar sus capacidades operativas dentro de la plataforma.
             </p>
          </div>

          <div className="flex flex-col gap-2">
            {ROLES_TO_MANAGE.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-2xl border transition-all group relative overflow-hidden",
                  selectedRole === role.id 
                    ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(0,242,255,0.1)]" 
                    : "bg-white/5 border-white/5 text-white/40 hover:border-primary/20 hover:text-white"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    selectedRole === role.id ? "bg-primary animate-pulse" : "bg-white/10"
                  )} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{role.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  selectedRole === role.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
                {selectedRole === role.id && (
                  <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* MATRIZ DE CONFIGURACIÓN */}
        <main className="space-y-8">
          <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase">
                    Configuración de Capacidades: {ROLES_TO_MANAGE.find(r => r.id === selectedRole)?.label}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    Defina los privilegios de lectura, escritura y eliminación.
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 rounded-none uppercase text-[9px] tracking-widest">
                  Nivel_Autoridad: {ROLES_TO_MANAGE.find(r => r.id === selectedRole)?.rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {MODULES.map((module) => (
                  <div key={module.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-6 min-w-[240px]">
                      <div className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/40 transition-all">
                        <module.icon className="h-6 w-6 text-white/20 group-hover:text-primary transition-all" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-white uppercase italic tracking-widest group-hover:cyan-text-glow">{module.label}</h4>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Módulo de Sistema 0{MODULES.indexOf(module) + 1}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 flex-1">
                      <PermissionToggle label="Acceder" icon={Eye} defaultChecked />
                      <PermissionToggle label="Ver" icon={Eye} defaultChecked />
                      <PermissionToggle label="Editar" icon={Pencil} />
                      <PermissionToggle label="Borrar" icon={Trash2} critical />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
              <span>Sincronización de Identidad: Activa</span>
              <span className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-primary/40" /> Cifrado de Permisos AES-256
              </span>
            </div>
          </Card>

          <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Protocolo de Seguridad Crítica</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Cualquier cambio en esta matriz afectará de forma inmediata al acceso de todos los usuarios vinculados a este rol. Asegúrese de no revocar permisos críticos para la operativa diaria del club.
             </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function PermissionToggle({ label, icon: Icon, defaultChecked, critical }: any) {
  const [checked, setChecked] = useState(defaultChecked || false);

  return (
    <div 
      className={cn(
        "flex flex-col items-center gap-3 p-4 border transition-all cursor-pointer rounded-2xl group/toggle",
        checked 
          ? (critical ? "bg-rose-500/10 border-rose-500/30" : "bg-primary/5 border-primary/30") 
          : "bg-white/5 border-white/5 hover:border-white/10"
      )}
      onClick={() => setChecked(!checked)}
    >
      <div className={cn(
        "h-8 w-8 rounded-xl flex items-center justify-center border transition-all",
        checked 
          ? (critical ? "bg-rose-500/20 border-rose-500/40" : "bg-primary/20 border-primary/40") 
          : "bg-black border-white/5 group-hover/toggle:border-white/20"
      )}>
        <Icon className={cn(
          "h-4 w-4", 
          checked 
            ? (critical ? "text-rose-400" : "text-primary") 
            : "text-white/10 group-hover/toggle:text-white/30"
        )} />
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-widest",
        checked ? "text-white" : "text-white/20"
      )}>{label}</span>
      <Switch 
        checked={checked} 
        onCheckedChange={setChecked}
        className={cn(
          "scale-75",
          checked && !critical ? "data-[state=checked]:bg-primary" : "",
          checked && critical ? "data-[state=checked]:bg-rose-500" : ""
        )}
      />
    </div>
  );
}

function Badge({ className, children }: any) {
  return (
    <div className={cn("px-3 py-1 rounded-full border text-[10px] font-bold", className)}>
      {children}
    </div>
  );
}
