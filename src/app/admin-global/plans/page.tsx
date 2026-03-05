"use client";

import { useState } from "react";
import { 
  TicketPercent, 
  Plus, 
  Zap, 
  Shield, 
  Crown, 
  Check, 
  X, 
  Layers, 
  DollarSign, 
  Users, 
  ShieldAlert,
  Cpu,
  Monitor,
  Activity,
  ChevronRight,
  Lock,
  UserCog,
  Pencil,
  Pause,
  Play
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ACCESS_MODULES = [
  { id: "ia_planner", label: "Neural IA Planner", description: "Generación de planes tácticos con IA.", icon: Cpu },
  { id: "tactical_board", label: "Elite Tactical Board", description: "Pizarra 3D y análisis de video.", icon: Monitor },
  { id: "academy_pro", label: "Gestión de Cantera", description: "Control total de categorías inferiores.", icon: Activity },
  { id: "live_metrics", label: "Métricas en Vivo", description: "Sincronización con Smartwatch y GPS.", icon: Zap },
  { id: "tutor_portal", label: "Portal de Tutores", description: "Terminal de comunicación con familias.", icon: Users },
];

const AVAILABLE_ROLES = [
  { value: "club_admin", label: "Administrador del Club" },
  { value: "academy_director", label: "Director de Cantera" },
  { value: "coach", label: "Entrenador" },
  { value: "tutor", label: "Tutor / Familia" },
  { value: "athlete", label: "Atleta / Jugador" },
];

export default function GlobalPlansPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const [newPlan, setNewPlan] = useState({
    title: "",
    price: "",
    users: "",
    features: ["", "", ""],
    access: [] as string[],
    defaultRole: "club_admin"
  });

  const handleToggleAccess = (moduleId: string) => {
    setNewPlan(prev => ({
      ...prev,
      access: prev.access.includes(moduleId) 
        ? prev.access.filter(id => id !== moduleId) 
        : [...prev.access, moduleId]
    }));
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setNewPlan({ 
      title: "", 
      price: "", 
      users: "", 
      features: ["", "", ""], 
      access: [], 
      defaultRole: "club_admin" 
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setIsEditing(true);
    setNewPlan({
      title: plan.title,
      price: plan.price,
      users: plan.users,
      features: plan.features || ["", "", ""],
      access: plan.access || [],
      defaultRole: plan.defaultRole || "club_admin"
    });
    setIsSheetOpen(true);
    toast({
      title: "PROTOCOLO_CARGADO",
      description: `Sincronizando parámetros de ${plan.title} para modificación.`,
    });
  };

  const handleSincProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: isEditing ? "PROTOCOLO_ACTUALIZADO" : "PROTOCOLO_SINC_EXITOSA",
      description: `El nodo "${newPlan.title || 'SIN_NOMBRE'}" ha sido ${isEditing ? 'actualizado' : 'desplegado'} correctamente.`,
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <TicketPercent className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Subscription_Protocols</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            CONFIGURACIÓN DE PLANES
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Protocolo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PlanTerminalCard 
          title="BASIC_NODE" 
          price="$199" 
          users="10" 
          icon={Zap} 
          features={["Gestión Base", "5 Entrenadores", "Analítica Simple"]} 
          onEdit={handleOpenEdit}
        />
        <PlanTerminalCard 
          title="PRO_NETWORK" 
          price="$499" 
          users="50" 
          icon={Shield} 
          featured
          features={["Todo en Basic", "IA Neural Planner", "API Acceso", "Soporte 24/7"]} 
          onEdit={handleOpenEdit}
        />
        <PlanTerminalCard 
          title="ELITE_CORE" 
          price="CUSTOM" 
          users="ILIMITADOS" 
          icon={Crown} 
          features={["Todo en Pro", "Despliegue On-Premise", "IA Personalizada", "Gestión Multiclub"]} 
          onEdit={handleOpenEdit}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Deploy_Manager_v1.5</span>
              </div>
              <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                {isEditing ? "MODIFICAR_PROTOCOLO" : "CONFIG_NUEVO_PLAN"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                {isEditing ? "Actualizando parámetros operativos del nodo." : "Definición de parámetros económicos y operativos de red."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSincProtocol} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Identificador_Protocolo</Label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                  <Input 
                    value={newPlan.title}
                    onChange={(e) => setNewPlan({...newPlan, title: e.target.value.toUpperCase()})}
                    placeholder="EJ: NEXUS_ENTERPRISE" 
                    className="pl-10 h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-emerald-500/50 transition-all placeholder:text-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Tarifa_Mensual</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                      placeholder="$999" 
                      className="pl-10 h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-emerald-500/50" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Capacidad_Nodos</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      value={newPlan.users}
                      onChange={(e) => setNewPlan({...newPlan, users: e.target.value})}
                      placeholder="100" 
                      className="pl-10 h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-emerald-500/50" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Rol_Predeterminado_Invitación</Label>
                <div className="relative">
                  <Select 
                    value={newPlan.defaultRole} 
                    onValueChange={(v) => setNewPlan({...newPlan, defaultRole: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-[0.2em] focus:border-emerald-500/50 transition-all">
                      <div className="flex items-center gap-3">
                        <UserCog className="h-4 w-4 text-emerald-500/40" />
                        <SelectValue placeholder="SELECCIONAR ROL..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value} className="text-[10px] font-black uppercase tracking-widest text-white/70 focus:bg-emerald-500 focus:text-black">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Control_de_Permisos</Label>
                <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 bg-emerald-500/5 border-emerald-500/30 text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/10 rounded-none flex justify-between px-6 group"
                    >
                      <span className="flex items-center gap-3">
                        <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Configurar Matriz de Acceso
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#04070c]/98 border-emerald-500/20 text-white max-w-lg rounded-none shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                    <DialogHeader className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Security_Protocol_v2</span>
                      </div>
                      <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">MATRIZ_DE_ACCESO_PLAN</DialogTitle>
                      <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-white/30">Habilita los sectores operativos para este protocolo.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-8">
                      {ACCESS_MODULES.map((module) => (
                        <div 
                          key={module.id} 
                          className={cn(
                            "p-4 border transition-all cursor-pointer group flex items-center justify-between",
                            newPlan.access.includes(module.id) ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-white/10 hover:border-emerald-500/20"
                          )}
                          onClick={() => handleToggleAccess(module.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 flex items-center justify-center border",
                              newPlan.access.includes(module.id) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-black border-white/5"
                            )}>
                              <module.icon className={cn("h-5 w-5", newPlan.access.includes(module.id) ? "text-emerald-400" : "text-white/20")} />
                            </div>
                            <div className="flex flex-col">
                              <span className={cn("text-xs font-black uppercase tracking-widest", newPlan.access.includes(module.id) ? "text-white" : "text-white/40")}>{module.label}</span>
                              <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{module.description}</span>
                            </div>
                          </div>
                          <Checkbox 
                            checked={newPlan.access.includes(module.id)} 
                            onCheckedChange={() => handleToggleAccess(module.id)}
                            className="rounded-none border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black"
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter className="pt-4 border-t border-white/5">
                      <Button 
                        onClick={() => setIsAccessDialogOpen(false)}
                        className="w-full h-14 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest rounded-none shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      >
                        CONFIRMAR_CONFIGURACIÓN
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="px-2 flex flex-wrap gap-2">
                   {newPlan.access.map(id => {
                     const mod = ACCESS_MODULES.find(m => m.id === id);
                     return (
                       <span key={id} className="text-[8px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-1 uppercase tracking-widest">
                         {mod?.label}
                       </span>
                     );
                   })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Atributos Visuales (Preview)</Label>
                {newPlan.features.map((feature, idx) => (
                  <Input 
                    key={idx}
                    value={feature}
                    onChange={(e) => {
                      const updated = [...newPlan.features];
                      updated[idx] = e.target.value;
                      setNewPlan({...newPlan, features: updated});
                    }}
                    placeholder={`ATRIBUTO_0${idx + 1}`} 
                    className="h-10 bg-white/5 border-white/10 rounded-none font-bold uppercase text-xs" 
                  />
                ))}
              </div>
            </div>
          </form>

          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSincProtocol}
              className="flex-[2] h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {isEditing ? "ACTUALIZAR_NODO" : "SINCRONIZAR_PLAN"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PlanTerminalCard({ title, price, users, icon: Icon, features, featured, onEdit }: any) {
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();

  const handleToggleActive = () => {
    setIsActive(!isActive);
    toast({
      title: isActive ? "PROTOCOLO_SUSPENDIDO" : "PROTOCOLO_REACTIVADO",
      description: `El plan ${title} ha sido ${isActive ? 'desconectado de la red' : 'sincronizado nuevamente'}.`,
    });
  };

  return (
    <Card className={cn(
      "glass-panel overflow-hidden relative group flex flex-col min-h-[500px]",
      featured && "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]",
      !isActive && "grayscale opacity-60"
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-12 w-12 text-emerald-500" />
      </div>
      <CardHeader className="text-center pt-8">
        <CardDescription className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">{featured ? 'RECOMENDADO' : 'NIVEL_ACCESO'}</CardDescription>
        <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase mt-2">{title}</CardTitle>
        <div className="text-3xl font-black text-emerald-400 emerald-text-glow mt-4 font-headline">{price}</div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 flex-1">
        <div className="flex flex-col items-center gap-1 border-y border-white/5 py-4 bg-white/[0.01]">
           <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Capacidad de Nodos</span>
           <span className="text-xs font-black text-white">{users} Usuarios Activos</span>
        </div>
        <ul className="space-y-3">
          {features.map((f: any, i: number) => (
            <li key={i} className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">
              <div className="h-1 w-1 bg-emerald-500" /> {f}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto p-6 border-t border-white/5 flex gap-3">
        <Button 
          className="flex-1 h-12 rounded-none border border-emerald-500/40 bg-transparent text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
          onClick={() => onEdit({ title, price, users, features })}
        >
          <Pencil className="h-3.5 w-3.5 mr-2" /> Modificar
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "h-12 w-12 rounded-none border transition-all",
            isActive 
              ? "border-white/10 text-white/20 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10" 
              : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-black"
          )}
          onClick={handleToggleActive}
          title={isActive ? "Pausar Protocolo" : "Activar Protocolo"}
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
