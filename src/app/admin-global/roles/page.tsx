
"use client";

import { useState } from "react";
import { 
  Fingerprint, 
  Plus, 
  Shield, 
  Check, 
  X, 
  Search, 
  MoreHorizontal, 
  Settings2, 
  Activity, 
  Pause, 
  Play, 
  Pencil,
  ShieldCheck,
  Crown,
  Cpu,
  Globe,
  Monitor,
  ChevronDown,
  Zap,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const INITIAL_ROLES = [
  { id: "r1", name: "Superadmin", users: 3, status: "System", permissions: ["ALL"] },
  { id: "r2", name: "Administrador del Club", users: 12, status: "Active", permissions: ["Club_Manage", "User_Manage"] },
  { id: "r3", name: "Director de Cantera", users: 5, status: "Active", permissions: ["Academy_Manage"] },
  { id: "r4", name: "Director de Metodología", users: 4, status: "Active", permissions: ["Methodology_Manage"] },
  { id: "r5", name: "Coordinador de Etapa", users: 8, status: "Active", permissions: ["Stage_Manage"] },
  { id: "r6", name: "Entrenador", users: 85, status: "Active", permissions: ["Tactics_Create", "Session_Manage"] },
  { id: "r7", name: "Delegado", users: 20, status: "Active", permissions: ["Match_Report"] },
  { id: "r8", name: "Tutor", users: 150, status: "Active", permissions: ["Consult_Only"] },
];

const SECTOR_PERMISSIONS = [
  {
    id: "global",
    label: "Control Global",
    icon: Globe,
    color: "text-emerald-400",
    modules: [
      { id: "clubs", label: "Gestión de Clubes", features: ["Ver", "Crear", "Editar", "Suspender"] },
      { id: "plans", label: "Gestión de Planes", features: ["Ver", "Modificar Precios", "Crear Protocolos"] },
      { id: "promos", label: "Promociones IA", features: ["Ver", "Generar Códigos", "Analítica ROI"] },
    ]
  },
  {
    id: "elite",
    label: "Operativa Élite",
    icon: Cpu,
    color: "text-primary",
    modules: [
      { id: "coach_hub", label: "Coach Hub", features: ["Dashboard", "Gestión Atletas", "Informes"] },
      { id: "tactical_board", label: "Tactical Board", features: ["Acceso", "Guardar Tácticas", "Exportar Video"] },
      { id: "neural_planner", label: "Neural Planner", features: ["Generar Planes", "Biblioteca IA", "Ajustes Avanzados"] },
    ]
  },
  {
    id: "terminals",
    label: "Terminales de Acceso",
    icon: Monitor,
    color: "text-white/60",
    modules: [
      { id: "tutor", label: "Portal Tutor", features: ["Consultas", "Chat Directo", "Pagos"] },
      { id: "smartwatch", label: "Link Reloj Inteligente", features: ["Sincronización", "Métricas en Vivo"] },
    ]
  }
];

export default function GlobalRolesPage() {
  const { profile } = useAuth();
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [activeSectors, setActiveSectors] = useState<Record<string, boolean>>({ global: true });
  const { toast } = useToast();

  const handleToggleStatus = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (!role) return;

    if (role.status === "System") {
      toast({
        variant: "destructive",
        title: "ACCESO_DENEGADO",
        description: "No se pueden suspender protocolos críticos del sistema.",
      });
      return;
    }

    const isCurrentlyActive = role.status === "Active";
    const newStatus = isCurrentlyActive ? "Inactive" : "Active";

    setRoles(prev => prev.map(r => 
      r.id === id ? { ...r, status: newStatus } : r
    ));

    toast({
      title: isCurrentlyActive ? "IDENTIDAD_SUSPENDIDA" : "IDENTIDAD_REACTIVADA",
      description: `El rol ${role.name} ha cambiado su estado a ${newStatus.toUpperCase()}.`,
    });
  };

  const openSheet = (role: any = null) => {
    setEditingRole(role);
    setIsSheetOpen(true);
    if (role) {
      toast({
        title: "CONFIG_TERMINAL_OPEN",
        description: `Sincronizando matriz de niveles para el rol ${role.name}.`,
      });
    }
  };

  const toggleSector = (sectorId: string) => {
    setActiveSectors(prev => ({
      ...prev,
      [sectorId]: !prev[sectorId]
    }));
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Auth_Protocol_Matrix</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            GESTIÓN DE ROLES
          </h1>
        </div>
        
        <Button 
          onClick={() => openSheet()}
          className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-14 px-10 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-5 w-5 mr-2" /> Crear Nuevo Rol
        </Button>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
            <div className="p-10 pb-6 border-b border-white/5">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Terminal_Identidad_v2.5</span>
                </div>
                <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                  {editingRole ? `EDITAR: ${editingRole.name}` : "CONFIG_NUEVO_ROL"}
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">Matriz de autoridad multinivel y sectores de acceso.</SheetDescription>
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
              
              {profile?.role === "superadmin" && (
                <div className="p-8 bg-emerald-500/5 border border-emerald-500/30 rounded-3xl space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                    <Crown className="h-16 w-16 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/40">
                        <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">PROTOCOLO_ACCESO_TOTAL</span>
                        <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">AUTORIDAD RAÍZ DEL SISTEMA</span>
                      </div>
                    </div>
                    <Switch className="data-[state=checked]:bg-emerald-500" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Identificador_Nodo</label>
                <Input 
                  defaultValue={editingRole?.name || ""}
                  placeholder="EJ: ANALISTA_TACTICO_PRO" 
                  className="h-16 bg-white/5 border-white/10 rounded-2xl font-bold uppercase focus:border-emerald-500/50 transition-all text-lg placeholder:text-white/10" 
                />
              </div>
              
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest block ml-1">Configuración de Sectores y Niveles</label>
                
                <Accordion type="multiple" className="space-y-4">
                  {SECTOR_PERMISSIONS.map(sector => (
                    <AccordionItem 
                      key={sector.id} 
                      value={sector.id} 
                      className={cn(
                        "border border-white/5 rounded-3xl overflow-hidden bg-white/[0.02] transition-all",
                        activeSectors[sector.id] ? "border-emerald-500/20" : "opacity-50"
                      )}
                    >
                      <div className="px-6 py-4 flex items-center justify-between bg-black/40">
                        <div className="flex items-center gap-4">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center bg-white/5", sector.color)}>
                            <sector.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-widest text-white">{sector.label}</span>
                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Acceso a Sector</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <Switch 
                            checked={activeSectors[sector.id]} 
                            onCheckedChange={() => toggleSector(sector.id)}
                            className="data-[state=checked]:bg-emerald-500"
                          />
                          <AccordionTrigger className="hover:no-underline p-0 h-8 w-8 rounded-full hover:bg-white/5 justify-center" />
                        </div>
                      </div>

                      <AccordionContent className="p-6 pt-2 space-y-6">
                        {sector.modules.map(module => (
                          <div key={module.id} className="space-y-4 p-5 bg-black/60 rounded-2xl border border-white/5 relative group/module">
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{module.label}</span>
                               </div>
                               <Checkbox className="rounded-md border-emerald-500/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              {module.features.map(feature => (
                                <div key={feature} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer">
                                   <Checkbox className="h-3.5 w-3.5 rounded-sm border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-black" />
                                   <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter group-hover/module:text-white/60">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            <div className="p-10 pt-6 border-t border-white/5 bg-black/40">
              <Button 
                onClick={() => {
                  toast({ title: "SINC_ESTABLECIDA", description: "La matriz de niveles ha sido actualizada en la red." });
                  setIsSheetOpen(false);
                }}
                className="w-full h-16 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none"
              >
                {editingRole ? "ACTUALIZAR_PROTOCOLO" : "SINCRONIZAR_IDENTIDAD"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <Card className="glass-panel overflow-hidden border-none relative bg-black/40">
          <CardHeader className="p-8 pb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-4 h-5 w-5 text-emerald-500 opacity-50" />
              <Input 
                placeholder="BUSCAR IDENTIDAD DE ROL..." 
                className="pl-12 h-14 bg-white/[0.03] border-white/10 rounded-2xl text-white font-bold uppercase text-[11px] tracking-widest focus:ring-emerald-500/30 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 h-16 pl-10">Identidad_Rol</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40">Nodos_Asignados</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-[0.2em] text-white/40 text-center">Estatus</TableHead>
                  <TableHead className="text-right font-black text-[11px] uppercase tracking-[0.2em] text-white/40 pr-10">Terminal_Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id} className="border-white/5 hover:bg-white/[0.03] transition-all group">
                    <TableCell className="pl-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all relative overflow-hidden">
                          <Shield className="h-5 w-5 text-emerald-400 relative z-10" />
                          <div className="absolute inset-0 bg-emerald-500/5 scan-line" />
                        </div>
                        <div>
                          <p className="font-black text-white uppercase text-sm italic group-hover:emerald-text-glow transition-all tracking-tighter">
                            {role.name}
                          </p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">ID_AUTH: {role.id.toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Activity className="h-3 w-3 text-emerald-500/30" />
                         <span className="font-mono text-base text-white/80 font-bold">{role.users}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "rounded-full font-black text-[9px] uppercase tracking-widest px-4 py-1.5",
                        role.status === 'System' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 
                        role.status === 'Active' ? 'border-emerald-500/20 text-emerald-400/70 bg-emerald-500/5' :
                        'border-white/10 text-white/30 bg-white/5'
                      )}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-xl text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 transition-all"
                          onClick={() => openSheet(role)}
                          title="Modificar Protocolo"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn(
                            "h-10 w-10 rounded-xl border border-white/5 transition-all",
                            role.status === "Active" 
                              ? "hover:border-amber-500/50 hover:bg-amber-500/10 text-white/20 hover:text-amber-400" 
                              : "hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400"
                          )}
                          title={role.status === "Active" ? "Suspender Identidad" : "Reactivar Identidad"}
                          onClick={() => handleToggleStatus(role.id)}
                          disabled={role.status === "System"}
                        >
                          {role.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 border border-white/5">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="p-6 bg-black/20 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] flex justify-between rounded-b-3xl">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Sincronización de matriz activa
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-3 w-3 text-emerald-500/50" /> Seguridad Nivel 4
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel border-emerald-500/20 bg-emerald-500/[0.03] overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-3">
                <Shield className="h-4 w-4 animate-pulse" /> Resumen de Auditoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-6 bg-black/60 rounded-2xl border border-white/5 space-y-2 group-hover:border-emerald-500/30 transition-all">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Nodos Críticos Inmutables</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black italic text-white tracking-tighter">01</p>
                  <span className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-widest italic">Estable</span>
                </div>
              </div>
              <div className="p-6 bg-black/60 rounded-2xl border border-white/5 space-y-2 group-hover:border-emerald-500/30 transition-all">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Protocolos Personalizados</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black italic text-emerald-400 tracking-tighter">{filteredRoles.filter(r => r.status !== 'System').length}</p>
                  <span className="text-[10px] text-white/30 font-bold mb-1 uppercase tracking-widest italic">Sincronizados</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-8 rounded-3xl border border-white/5 bg-black/40 space-y-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
                <Fingerprint className="h-20 w-20 text-emerald-500" />
             </div>
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Operativa_Matrix</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic tracking-wider">
               La matriz multinivel permite activar sectores completos y refinar permisos específicos dentro de cada módulo. Use con precaución operativa.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
