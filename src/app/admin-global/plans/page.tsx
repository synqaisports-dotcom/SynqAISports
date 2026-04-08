
"use client";

import { useEffect, useMemo, useState } from "react";
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
  Play,
  TrendingDown,
  Megaphone,
  Trash2
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
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import {
  buildRoleSelectOptions,
  getRoleDisplayLabel,
  ASSIGNABLE_ROLES,
  type SynqRoleRowLike,
} from "@/lib/role-catalog";

const ACCESS_MODULES = [
  { id: "ia_planner", label: "Neural IA Planner", description: "Generación de planes tácticos con IA.", icon: Cpu },
  { id: "tactical_board_pro", label: "Elite Tactical Board PRO", description: "Pizarra 3D sin publicidad.", icon: Monitor },
  { id: "tactical_board_promo", label: "Tactical Board (MODO PROMO)", description: "Versión gratuita con inserciones publicitarias.", icon: Megaphone },
  { id: "academy_pro", label: "Gestión de Cantera", description: "Control total de categorías inferiores.", icon: Activity },
  { id: "live_metrics", label: "Métricas en Vivo", description: "Sincronización con Smartwatch y GPS.", icon: Zap },
  { id: "tutor_portal", label: "Portal de Tutores", description: "Terminal de comunicación con familias.", icon: Users },
];

export default function GlobalPlansPage() {
  const { session } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isMutating, setIsMutating] = useState(false);
  const canUseSupabase = isSupabaseConfigured && !!supabase && !!session?.access_token;
  
  const [newPlan, setNewPlan] = useState({
    title: "",
    pricePerNode: "",
    minNodes: "",
    features: ["", "", ""],
    access: [] as string[],
    defaultRole: "club_admin"
  });

  const [synqRoleRows, setSynqRoleRows] = useState<SynqRoleRowLike[]>([]);

  const roleSelectOptions = useMemo(() => {
    const fallbackRows = ASSIGNABLE_ROLES.map((r) => ({
      key: r.id,
      label: r.label,
      is_system: r.systemLocked,
    })) as SynqRoleRowLike[];
    const sourceRows = synqRoleRows.length > 0 ? synqRoleRows : fallbackRows;
    const base = buildRoleSelectOptions(sourceRows, { includeSuperadmin: false });
    if (newPlan.defaultRole && !base.some((o) => o.value === newPlan.defaultRole)) {
      return [
        ...base,
        {
          value: newPlan.defaultRole,
          label: getRoleDisplayLabel(newPlan.defaultRole, synqRoleRows),
        },
      ].sort((a, b) => a.label.localeCompare(b.label, "es"));
    }
    return base;
  }, [synqRoleRows, newPlan.defaultRole]);

  useEffect(() => {
    if (!session?.access_token) {
      setSynqRoleRows([]);
      return;
    }
    let cancelled = false;
    void fetch("/api/roles/catalog", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        const j = (await res.json()) as { roles?: SynqRoleRowLike[] };
        if (!cancelled) setSynqRoleRows(j.roles ?? []);
      })
      .catch(() => {
        if (!cancelled) setSynqRoleRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    const load = async () => {
      const savedPlans = JSON.parse(localStorage.getItem("synq_global_plans") || "[]");
      setPlans(savedPlans);
      if (!canUseSupabase) return;
      const res = await fetch("/api/admin/plans", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const j = (await res.json()) as { plans?: any[] };
      const data = Array.isArray(j.plans) ? j.plans : [];
      if (res.ok) {
        const normalized = data.map((p) => ({
          id: p.id,
          title: p.title,
          pricePerNode: p.price_per_node ?? "",
          minNodes: p.min_nodes ?? "",
          features: Array.isArray(p.features) ? p.features : [],
          access: Array.isArray(p.access) ? p.access : [],
          defaultRole: p.default_role ?? "club_admin",
          isActive: p.is_active ?? true,
        }));
        setPlans(normalized);
        localStorage.setItem("synq_global_plans", JSON.stringify(normalized));
      }
    };
    void load();
  }, [canUseSupabase, session?.access_token]);

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
    setEditingPlanId(null);
    setNewPlan({ 
      title: "", 
      pricePerNode: "", 
      minNodes: "", 
      features: ["", "", ""], 
      access: [], 
      defaultRole: "club_admin" 
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setIsEditing(true);
    setEditingPlanId(plan.id);
    setNewPlan({
      title: plan.title,
      pricePerNode: plan.pricePerNode || "",
      minNodes: plan.minNodes || "",
      features: plan.features || ["", "", ""],
      access: plan.access || [],
      defaultRole: plan.defaultRole || "club_admin"
    });
    setIsSheetOpen(true);
  };

  const handleSincProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.title.trim()) {
      toast({ variant: "destructive", title: "TITULO_REQUERIDO", description: "Define un identificador de plan." });
      return;
    }
    const payload = {
      id: editingPlanId ?? `plan_${Date.now()}`,
      title: newPlan.title.trim(),
      pricePerNode: newPlan.pricePerNode.trim(),
      minNodes: newPlan.minNodes.trim(),
      features: newPlan.features.filter((f) => String(f).trim().length > 0),
      access: newPlan.access,
      defaultRole: newPlan.defaultRole,
      isActive: true,
    };
    setPlans((prev) => {
      const next = editingPlanId
        ? prev.map((p) => (p.id === editingPlanId ? { ...p, ...payload, isActive: p.isActive ?? true } : p))
        : [payload, ...prev];
      localStorage.setItem("synq_global_plans", JSON.stringify(next));
      return next;
    });
    if (canUseSupabase) {
      await fetch("/api/admin/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });
    }
    toast({
      title: isEditing ? "PROTOCOLO_ACTUALIZADO" : "PROTOCOLO_SINC_EXITOSA",
      description: `El nodo "${newPlan.title || 'SIN_NOMBRE'}" ha sido ${isEditing ? 'actualizado' : 'desplegado'} correctamente.`,
    });
    setIsSheetOpen(false);
  };

  const handleTogglePlanActive = (id: string) => {
    if (isMutating) return;
    setIsMutating(true);
    setPlans((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, isActive: !(p.isActive ?? true) } : p));
      localStorage.setItem("synq_global_plans", JSON.stringify(next));
      return next;
    });
    if (canUseSupabase) {
      const current = plans.find((p) => p.id === id);
      const nextActive = !(current?.isActive ?? true);
      void fetch("/api/admin/plans", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id, isActive: nextActive }),
      }).finally(() => setIsMutating(false));
      return;
    }
    setIsMutating(false);
  };

  const handleDeletePlan = (id: string, title: string) => {
    if (isMutating) return;
    setIsMutating(true);
    const prevPlans = plans;
    const nextPlans = prevPlans.filter((p) => p.id !== id);
    setPlans(nextPlans);
    localStorage.setItem("synq_global_plans", JSON.stringify(nextPlans));

    const rollback = () => {
      setPlans(prevPlans);
      localStorage.setItem("synq_global_plans", JSON.stringify(prevPlans));
    };

    const finishWithToast = (ok: boolean) => {
      toast({
        variant: ok ? "default" : "destructive",
        title: ok ? "PROTOCOLO_ELIMINADO" : "ERROR_ELIMINANDO_PROTOCOLO",
        description: ok
          ? `El plan ${title} fue eliminado del núcleo global.`
          : `No se pudo eliminar ${title}. Se restauró la configuración local.`,
      });
    };

    if (canUseSupabase) {
      void fetch("/api/admin/plans", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ id }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          finishWithToast(true);
        })
        .catch(() => {
          rollback();
          finishWithToast(false);
        })
        .finally(() => setIsMutating(false));
      return;
    }

    finishWithToast(true);
    setIsMutating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Home</p>
          <div className="flex items-center gap-3 mb-2">
            <TicketPercent className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Subscription_Protocols</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Dashboard_Planes
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Protocolo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.length === 0 ? (
          <Card className="glass-panel md:col-span-3 border border-amber-500/20 bg-amber-500/5 rounded-3xl">
            <CardContent className="py-10 text-center space-y-2">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Sin planes mock precargados</p>
              <p className="text-[10px] font-bold text-white/40 uppercase">Crea el primer protocolo real desde "Nuevo Protocolo".</p>
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <PlanTerminalCard
              key={plan.id}
              plan={plan}
              onEdit={handleOpenEdit}
              onToggleActive={handleTogglePlanActive}
              onDelete={handleDeletePlan}
              isMutating={isMutating}
            />
          ))
        )}
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
                Defina el escalado por niño y la matriz operativa del club.
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
                    placeholder="EJ: VOLUMEN_ESCALADO_800" 
                    className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform] placeholder:text-white/10" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Tarifa_Por_Niño (€)</Label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      value={newPlan.pricePerNode}
                      onChange={(e) => setNewPlan({...newPlan, pricePerNode: e.target.value})}
                      placeholder="0.70" 
                      className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Volumen_Mínimo</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      value={newPlan.minNodes}
                      onChange={(e) => setNewPlan({...newPlan, minNodes: e.target.value})}
                      placeholder="800" 
                      className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform]" 
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
                    <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-white/60 font-bold uppercase tracking-[0.2em] focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform]">
                      <div className="flex items-center gap-3">
                        <UserCog className="h-4 w-4 text-emerald-500/40" />
                        <SelectValue placeholder="SELECCIONAR ROL..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-2xl">
                      {roleSelectOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value} className="text-[10px] font-black uppercase tracking-widest text-white/70 focus:bg-emerald-500 focus:text-black">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Configuración_Accesos_Publicitarios</Label>
                <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full h-14 bg-emerald-500/5 border-emerald-500/30 text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500/10 rounded-2xl flex justify-between px-6 group"
                    >
                      <span className="flex items-center gap-3">
                        <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Matriz de Sectores Operativos
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#04070c]/98 border-emerald-500/20 text-white max-w-lg rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                    <DialogHeader className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Access_Matrix_V2</span>
                      </div>
                      <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">CONFIGURAR ACCESOS</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-8">
                      {ACCESS_MODULES.map((module) => (
                        <div 
                          key={module.id} 
                          className={cn(
                            "p-4 border transition-[background-color,border-color,color,opacity,transform] cursor-pointer group flex items-center justify-between rounded-2xl",
                            newPlan.access.includes(module.id) ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-emerald-500/10 hover:border-emerald-500/20"
                          )}
                          onClick={() => handleToggleAccess(module.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 flex items-center justify-center border rounded-xl",
                              newPlan.access.includes(module.id) ? "bg-emerald-500/20 border-emerald-500/40" : "bg-black border-emerald-500/10"
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
                            className="rounded-md border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black"
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button onClick={() => setIsAccessDialogOpen(false)} className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest rounded-2xl h-14">
                        CONFIRMAR_ACCESOS
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    className="h-10 bg-white/5 border-emerald-500/20 rounded-xl font-bold uppercase text-xs focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform]" 
                  />
                ))}
              </div>
            </div>
          </form>

          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 rounded-2xl">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              type="submit"
              form="global-plan-form"
              className="flex-[2] h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] border-none"
            >
              {isEditing ? "ACTUALIZAR_NODO" : "SINCRONIZAR_PLAN"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PlanTerminalCard({ plan, onEdit, onToggleActive, onDelete, isMutating }: any) {
  const title = plan.title;
  const price = plan.pricePerNode ? `${plan.pricePerNode}€ / NIÑO` : "SIN TARIFA";
  const users = plan.minNodes ? `DESDE ${plan.minNodes}` : "SIN UMBRAL";
  const features = plan.features || [];
  const isActive = plan.isActive ?? true;
  const Icon = title.toUpperCase().includes("PROMO") ? Megaphone : title.toUpperCase().includes("ENTERPRISE") ? Crown : Shield;
  const featured = title.toUpperCase().includes("CORE");
  const badge = title.toUpperCase().includes("PROMO") ? "GANCHO_REDES" : title.toUpperCase().includes("ENTERPRISE") ? "ESCALADO_ÉLITE" : undefined;

  return (
    <Card className={cn(
      "glass-panel overflow-hidden relative group flex flex-col min-h-[500px] rounded-3xl",
      featured && "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]",
      !isActive && "grayscale opacity-60"
    )}>
      {badge && (
        <div className="absolute top-0 left-0 bg-emerald-500 text-black text-[8px] font-black px-3 py-1 uppercase tracking-widest z-10">
          {badge}
        </div>
      )}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icon className="h-12 w-12 text-emerald-500" />
      </div>
      <CardHeader className="text-center pt-10">
        <CardDescription className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30">{featured ? 'MÁS_RENTABLE' : 'NIVEL_ACCESO'}</CardDescription>
        <CardTitle className="text-2xl font-black text-white italic tracking-tighter uppercase mt-2">{title}</CardTitle>
        <div className="text-3xl font-black text-emerald-400 emerald-text-glow mt-4 font-headline">{price}</div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 flex-1">
        <div className="flex flex-col items-center gap-1 border-y border-white/5 py-4 bg-white/[0.01]">
           <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Escalado de Red</span>
           <span className="text-xs font-black text-white">{users}</span>
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
          className="flex-1 h-12 rounded-2xl border border-emerald-500/40 bg-transparent text-emerald-400 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-black transition-[background-color,border-color,color,opacity,transform]"
          onClick={() => onEdit(plan)}
          disabled={isMutating}
        >
          <Pencil className="h-3.5 w-3.5 mr-2" /> Modificar
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "h-12 w-12 rounded-2xl border transition-[background-color,border-color,color,opacity,transform]",
            isActive 
              ? "border-white/10 text-white/20 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10" 
              : "border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500 hover:text-black"
          )}
          onClick={() => onToggleActive(plan.id)}
          disabled={isMutating}
          title={isActive ? "Pausar Protocolo" : "Activar Protocolo"}
        >
          {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          className="h-12 w-12 rounded-2xl border border-white/10 text-rose-300/70 hover:text-rose-300 hover:border-rose-400/50 hover:bg-rose-500/10 transition-colors"
          onClick={() => onDelete(plan.id, plan.title)}
          disabled={isMutating}
          title="Eliminar Protocolo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
