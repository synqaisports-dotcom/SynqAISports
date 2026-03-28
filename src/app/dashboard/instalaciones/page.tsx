
"use client";

import { useEffect, useState } from "react";
import { 
  MapPin, 
  Plus, 
  Search, 
  Warehouse, 
  Activity, 
  Settings2, 
  Calendar, 
  Users, 
  Clock, 
  AlertCircle,
  MoreHorizontal,
  Pencil, 
  Trash2, 
  ParkingCircle, 
  Dumbbell, 
  LayoutDashboard, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Trophy, 
  LayoutGrid, 
  Zap,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useClubModulePermissions } from "@/hooks/use-club-module-permissions";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";

const SPORTS = [
  { value: "Fútbol", label: "Fútbol" },
  { value: "Baloncesto", label: "Baloncesto" },
  { value: "Waterpolo", label: "Waterpolo" },
  { value: "Voleibol", label: "Voleibol" },
  { value: "Balonmano", label: "Balonmano" },
];

const WEEK_DAYS = [
  { id: "L", label: "L" },
  { id: "M", label: "M" },
  { id: "X", label: "X" },
  { id: "J", label: "J" },
  { id: "V", label: "V" },
  { id: "S", label: "S" },
  { id: "D", label: "D" },
];

const INITIAL_FACILITIES = [
  { id: "f1", name: "Campo de Fútbol Principal", type: "Campo Exterior", sport: "Fútbol", status: "Active", capacity: "22 Jugadores", nextMaintenance: "12 Oct", subdivisions: "2", divisionStartTime: "17:00", divisionEndTime: "21:00", divisionDays: ["L", "M", "X", "J", "V"], isHeadquarters: true },
  { id: "f2", name: "Pabellón Cubierto A", type: "Pabellón", sport: "Baloncesto", status: "Active", capacity: "40 Atletas", nextMaintenance: "05 Nov", subdivisions: "1", isHeadquarters: false },
  { id: "f3", name: "Gimnasio de Alto Rendimiento", type: "Fitness", sport: "Multideporte", status: "Maintenance", capacity: "15 Atletas", nextMaintenance: "Hoy", subdivisions: "1", isHeadquarters: false },
];

export default function FacilitiesManagementPage() {
  const { profile, session } = useAuth();
  const { canEdit: canEditFacilities, canDelete: canDeleteFacilities } = useClubModulePermissions("facilities");
  const clubScopeId = profile?.clubId ?? "global-hq";
  const facilitiesStorageKey = `synq_methodology_facilities_v1_${clubScopeId}`;
  const canUseRemote = canUseOperativaSupabase(clubScopeId) && !!session?.access_token;

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted" | "local_error">("local");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "Campo Exterior",
    sport: "Fútbol",
    status: "Active",
    capacity: "",
    startTime: "08:00",
    endTime: "23:00",
    days: ["L", "M", "X", "J", "V", "S", "D"] as string[],
    subdivisions: "1",
    divisionStartTime: "17:00",
    divisionEndTime: "21:00",
    divisionDays: ["L", "M", "X", "J", "V"] as string[],
    isHeadquarters: false,
  });

  const persistFacilities = (next: typeof INITIAL_FACILITIES) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(facilitiesStorageKey, JSON.stringify(next));
  };

  useEffect(() => {
    let cancelled = false;
    if (typeof window === "undefined") return;
    const loadFacilities = async () => {
      try {
        const raw = localStorage.getItem(facilitiesStorageKey);
        if (!raw) {
          persistFacilities(INITIAL_FACILITIES as any);
        } else {
          const parsed = JSON.parse(raw) as typeof INITIAL_FACILITIES;
          if (Array.isArray(parsed) && !cancelled) setFacilities(parsed);
        }
      } catch {
        // No bloqueamos si falla el parseo
      }

      if (!canUseRemote || !session?.access_token) {
        if (!cancelled) setSyncMode("local");
        return;
      }

      try {
        const res = await fetch("/api/club/facilities", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 404) {
          if (!cancelled) setSyncMode("local");
          toast({
            title: "API_FACILITIES_NO_DISPONIBLE",
            description: "Ruta de servidor no encontrada (404). Operando en modo local.",
          });
          return;
        }
        if (res.status === 403) {
          if (!cancelled) setSyncMode("restricted");
          return;
        }
        if (!res.ok) {
          if (!cancelled) setSyncMode("local_error");
          return;
        }
        const json = (await res.json()) as { payload?: unknown[] };
        const remoteFacilities = Array.isArray(json.payload) ? (json.payload as typeof INITIAL_FACILITIES) : [];
        if (!cancelled) {
          setFacilities(remoteFacilities);
          setSyncMode("remote");
        }
        persistFacilities(remoteFacilities as any);
      } catch {
        if (!cancelled) setSyncMode("local_error");
      }
    };
    void loadFacilities();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilitiesStorageKey, canUseRemote, session?.access_token]);

  const persistFacilitiesHybrid = async (next: typeof INITIAL_FACILITIES) => {
    persistFacilities(next);
    if (!canUseRemote || !session?.access_token) {
      setSyncMode("local");
      return;
    }
    try {
      const res = await fetch("/api/club/facilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ payload: next }),
      });
      if (res.status === 403) {
        setSyncMode("restricted");
        toast({
          variant: "destructive",
          title: "PERMISOS_LIMITADOS",
          description: "Sin permisos para guardar instalaciones en servidor. Se guardó localmente.",
        });
        return;
      }
      if (res.status === 404) {
        setSyncMode("local");
        toast({
          title: "API_FACILITIES_NO_DISPONIBLE",
          description: "Ruta de servidor no encontrada (404). Se guardó en modo local.",
        });
        return;
      }
      if (!res.ok) {
        setSyncMode("local_error");
        return;
      }
      setSyncMode("remote");
    } catch {
      setSyncMode("local_error");
    }
  };

  const handleOpenCreate = () => {
    if (!canEditFacilities) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso de edición en Instalaciones.",
      });
      return;
    }
    setEditingId(null);
    setFormData({ 
      name: "", 
      type: "Campo Exterior", 
      sport: "Fútbol", 
      status: "Active", 
      capacity: "",
      startTime: "08:00",
      endTime: "23:00",
      days: ["L", "M", "X", "J", "V", "S", "D"],
      subdivisions: "1",
      divisionStartTime: "17:00",
      divisionEndTime: "21:00",
      divisionDays: ["L", "M", "X", "J", "V"],
      isHeadquarters: false,
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (facility: any) => {
    if (!canEditFacilities) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso de edición en Instalaciones.",
      });
      return;
    }
    setEditingId(facility.id);
    setFormData({
      name: facility.name,
      type: facility.type,
      sport: facility.sport || "Fútbol",
      status: facility.status,
      capacity: facility.capacity,
      startTime: facility.startTime || "08:00",
      endTime: facility.endTime || "23:00",
      days: facility.days || ["L", "M", "X", "J", "V", "S", "D"],
      subdivisions: facility.subdivisions || "1",
      divisionStartTime: facility.divisionStartTime || "17:00",
      divisionEndTime: facility.divisionEndTime || "21:00",
      divisionDays: facility.divisionDays || ["L", "M", "X", "J", "V"],
      isHeadquarters: !!facility.isHeadquarters,
    });
    setIsSheetOpen(true);
  };

  const toggleDay = (dayId: string, key: "days" | "divisionDays" = "days") => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(dayId)
        ? prev[key].filter(d => d !== dayId)
        : [...prev[key], dayId]
    }));
  };

  const handleDelete = (id: string, name: string) => {
    if (!canDeleteFacilities) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso de borrado en Instalaciones.",
      });
      return;
    }
    setFacilities((prev) => {
      const next = prev.filter((f) => f.id !== id);
      void persistFacilitiesHybrid(next as any);
      return next;
    });
    toast({
      variant: "destructive",
      title: "ACTIVO_ELIMINADO",
      description: `La instalación ${name} ha sido desconectada de la matriz.`,
    });
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditFacilities) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso de edición en Instalaciones.",
      });
      return;
    }
    if (parseInt(formData.subdivisions, 10) > 1 && formData.divisionDays.length === 0) {
      toast({
        variant: "destructive",
        title: "VALIDACIÓN_DIVISIÓN",
        description: "Selecciona al menos un día para la división activa antes de guardar.",
      });
      return;
    }
    setLoading(true);

    const currentEditingId = editingId;
    setTimeout(() => {
      if (currentEditingId) {
        setFacilities((prev) => {
          const next = prev.map((f) => (f.id === currentEditingId ? { ...f, ...formData } : f));
          void persistFacilitiesHybrid(next as any);
          return next;
        });
        toast({
          title: "ACTIVO_ACTUALIZADO",
          description: `Los protocolos de ${formData.name} han sido sincronizados.`,
        });
      } else {
        const newFacility = {
          id: `f${Date.now()}`,
          ...formData,
          nextMaintenance: "Próximamente"
        };
        setFacilities((prev) => {
          const next = [newFacility, ...prev];
          void persistFacilitiesHybrid(next as any);
          return next;
        });
        toast({
          title: "INSTALACIÓN_REGISTRADA",
          description: `El nodo ${formData.name} ha sido añadido a la matriz del club.`,
        });
      }
      
      setLoading(false);
      setIsSheetOpen(false);
    }, 1000);
  };

  const filteredFacilities = facilities.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.sport?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Facility_Network_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Instalaciones
          </h1>
          <p
            className={cn(
              "text-[9px] font-black uppercase tracking-widest mt-1",
              syncMode === "remote"
                ? "text-emerald-400/80"
                : syncMode === "restricted"
                ? "text-amber-400/80"
                : syncMode === "local_error"
                ? "text-rose-400/80"
                : "text-white/40",
            )}
          >
            {syncMode === "remote"
              ? "SINCRO_REMOTA_ACTIVA"
              : syncMode === "restricted"
              ? "MODO_LOCAL_POR_PERMISOS"
              : syncMode === "local_error"
              ? "MODO_LOCAL_POR_ERROR"
              : "MODO_LOCAL_FALLBACK"}
          </p>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          disabled={!canEditFacilities}
          className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none disabled:opacity-40"
        >
          <Plus className="h-4 w-4 mr-2" /> Nuevo Activo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FacilityStat label="Total Espacios" value={facilities.length.toString()} icon={Warehouse} />
        <FacilityStat label="Ocupación Hoy" value="82%" icon={Activity} highlight />
        <FacilityStat label="En Mantenimiento" value="01" icon={AlertCircle} warning />
        <FacilityStat label="Sectores Sincro" value="04" icon={LayoutDashboard} />
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/40 overflow-hidden mb-8 shadow-2xl rounded-3xl">
        <CardHeader className="p-6 border-b border-white/5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR POR NOMBRE O DEPORTE..." 
              className="pl-10 h-12 bg-white/5 border-primary/20 rounded-2xl text-primary placeholder:text-primary/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFacilities.map((f) => (
          <Card key={f.id} className="glass-panel overflow-hidden relative group border border-primary/10 bg-black/40 hover:border-primary/30 transition-all rounded-3xl">
            <div className={cn(
              "absolute top-0 left-0 w-full h-[2px]",
              f.status === 'Active' ? 'bg-primary/40' : 'bg-amber-500/40'
            )} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-center transition-all rotate-3 group-hover:rotate-0 duration-500">
                  <Warehouse className={cn("h-6 w-6", f.status === 'Active' ? "text-primary" : "text-amber-400")} />
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className={cn(
                    "rounded-2xl font-black text-[8px] uppercase tracking-widest px-3 py-1",
                    f.status === 'Active' ? 'border-primary/20 text-primary bg-primary/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                  )}>
                    {f.status}
                  </Badge>
                  <span className="text-[8px] text-primary/30 font-bold uppercase tracking-widest mt-2">ID: {f.id.toUpperCase()}</span>
                </div>
              </div>
              <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 group-hover:cyan-text-glow transition-all">
                {f.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">{f.sport}</span>
              </div>
              <CardDescription className="text-[9px] font-black uppercase tracking-widest text-primary/30 italic">
                {f.type} • {f.subdivisions === "1" ? "Espacio Único" : `${f.subdivisions} Divisiones`}
              </CardDescription>
              {f.isHeadquarters && (
                <Badge className="mt-3 rounded-xl bg-primary/15 text-primary border border-primary/30 text-[8px] font-black uppercase tracking-widest">
                  Campo Sede de Partidos
                </Badge>
              )}
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase italic">Aforo Máximo</span>
                </div>
                <span className="text-xs font-black text-primary">{f.capacity}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase italic">Mantenimiento</span>
                </div>
                <span className="text-xs font-black text-primary cyan-text-glow">{f.nextMaintenance}</span>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center rounded-b-3xl">
              <span className="flex items-center gap-2 text-[8px] font-black text-primary/30 uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3 text-primary/40" /> Sincronización Estable
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-primary hover:bg-primary/10 border border-primary/10 transition-all rounded-xl active:scale-95"
                  onClick={() => handleEdit(f)}
                  disabled={!canEditFacilities}
                  title="Modificar Activo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 transition-all rounded-xl active:scale-95"
                  onClick={() => handleDelete(f.id, f.name)}
                  disabled={!canDeleteFacilities}
                  title="Eliminar Activo"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="z-[70] bg-background/95 bg-grid-pattern backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="sticky top-0 z-20 p-10 border-b border-white/5 bg-background/90 backdrop-blur-md">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Facility_Deploy_v2.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingId ? "MODIFICAR_ACTIVO" : "AÑADIR_ACTIVO"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-primary/40 tracking-widest text-left italic">
                Sincronice un nuevo espacio físico con la red operativa del club.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSaveFacility} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10 bg-background/70">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Nombre de la Instalación</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  placeholder="EJ: PABELLÓN MUNICIPAL" 
                  className="h-14 bg-white/5 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary transition-all text-primary placeholder:text-primary/20 text-lg" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Tipo de Espacio</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-2xl text-primary font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                      <SelectItem value="Campo Exterior" className="text-[10px] font-black uppercase focus:bg-primary">CAMPO EXTERIOR</SelectItem>
                      <SelectItem value="Pabellón" className="text-[10px] font-black uppercase focus:bg-primary">PABELLÓN CUBIERTO</SelectItem>
                      <SelectItem value="Fitness" className="text-[10px] font-black uppercase focus:bg-primary">GIMNASIO / SALA</SelectItem>
                      <SelectItem value="Acuática" className="text-[10px] font-black uppercase focus:bg-primary">ZONA ACUÁTICA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Disciplina Deportiva</Label>
                  <Select 
                    value={formData.sport} 
                    onValueChange={(v) => setFormData({...formData, sport: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-2xl text-primary font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-primary/40" />
                        <SelectValue placeholder="DEPORTE..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                      {SPORTS.map(s => (
                        <SelectItem key={s.value} value={s.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {s.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="Multideporte" className="text-[10px] font-black uppercase focus:bg-primary">MULTIDEPORTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Layers className="h-24 w-24 text-primary" />
                </div>
                <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                  <LayoutGrid className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Configuración de Divisiones</span>
                </div>
                <div className="space-y-3">
                  <Label className="text-[9px] font-black uppercase text-primary tracking-widest ml-1 italic">Subdivisiones de Espacio</Label>
                  <Select 
                    value={formData.subdivisions} 
                    onValueChange={(v) => setFormData({...formData, subdivisions: v})}
                  >
                    <SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                      <SelectItem value="1" className="text-[10px] font-black uppercase focus:bg-primary">ESPACIO ÚNICO</SelectItem>
                      <SelectItem value="2" className="text-[10px] font-black uppercase focus:bg-primary">2 MITADES (ZONA A/B)</SelectItem>
                      <SelectItem value="4" className="text-[10px] font-black uppercase focus:bg-primary">4 CUADRANTES (A/B/C/D)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[8px] text-primary/40 uppercase font-bold tracking-tighter mt-2 leading-relaxed">
                    Permite asignar múltiples equipos a la misma instalación de forma simultánea.
                  </p>
                </div>

                {parseInt(formData.subdivisions) > 1 && (
                  <div className="space-y-4 pt-4 border-t border-primary/10 mt-4 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Franja Horaria de División Activa</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[8px] font-bold text-primary/40 uppercase">Inicio División</span>
                        <Input 
                          type="time" 
                          value={formData.divisionStartTime}
                          onChange={(e) => setFormData({...formData, divisionStartTime: e.target.value})}
                          className="h-10 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary [color-scheme:dark]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[8px] font-bold text-primary/40 uppercase">Fin División</span>
                        <Input 
                          type="time" 
                          value={formData.divisionEndTime}
                          onChange={(e) => setFormData({...formData, divisionEndTime: e.target.value})}
                          className="h-10 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                    <p className="text-[7px] text-primary/30 uppercase font-bold italic leading-relaxed">
                      Fuera de este horario, el sistema tratará la instalación como un Nodo de Espacio Único.
                    </p>
                    <div className="space-y-2 pt-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Días con División Activa</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEK_DAYS.map(day => (
                          <button
                            key={`division-${day.id}`}
                            type="button"
                            onClick={() => toggleDay(day.id, "divisionDays")}
                            className={cn(
                              "h-9 min-w-9 px-2 flex items-center justify-center font-black text-[10px] border transition-all rounded-xl active:scale-95",
                              formData.divisionDays.includes(day.id)
                                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                                : "bg-white/5 border-primary/20 text-primary/40 hover:border-primary/40"
                            )}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Warehouse className="h-24 w-24 text-primary" />
                  </div>
                  
                  <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">
                      Horario General de la Instalación
                    </span>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Días Operativos</Label>
                    <div className="flex gap-2">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={cn(
                            "h-10 w-10 flex items-center justify-center font-black text-[10px] border transition-all rounded-xl active:scale-95",
                            formData.days.includes(day.id)
                              ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                              : "bg-white/5 border-primary/20 text-primary/30 hover:border-primary/40"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Apertura</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          type="time" 
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="pl-10 h-11 bg-white/5 border-primary/20 rounded-2xl font-bold text-xs focus:border-primary text-primary [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Cierre</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          type="time" 
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="pl-10 h-11 bg-white/5 border-primary/20 rounded-2xl font-bold text-xs focus:border-primary text-primary [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Capacidad Máx. Atletas</Label>
                  <Input 
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="EJ: 25 ATLETAS" 
                    className="h-12 bg-white/5 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary transition-all text-primary placeholder:text-primary/20" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Estatus_Red</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-2xl text-primary font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                      <SelectItem value="Active" className="text-[10px] font-black uppercase text-primary focus:bg-primary focus:text-black">OPERATIVO</SelectItem>
                      <SelectItem value="Maintenance" className="text-[10px] font-black uppercase text-amber-400 focus:bg-amber-500">MANTENIMIENTO</SelectItem>
                      <SelectItem value="Inactive" className="text-[10px] font-black uppercase text-rose-400 focus:bg-rose-500">CERRADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 p-6 border border-primary/20 bg-primary/5 rounded-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest italic">Campo sede para partidos</Label>
                    <p className="text-[9px] text-primary/40 font-bold uppercase tracking-tight">
                      Marca la instalación principal para partidos oficiales.
                    </p>
                  </div>
                  <Switch
                    checked={formData.isHeadquarters}
                    onCheckedChange={(checked) => setFormData({ ...formData, isHeadquarters: checked })}
                    aria-label="Campo sede para partidos"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">Protocolo de Seguridad</span>
              </div>
              <p className="text-[9px] text-primary/40 leading-relaxed font-bold uppercase italic">
                La configuración de subdivisiones permite al motor de planificación de SynQAI gestionar la ocupación de zonas de forma inteligente sin solapar entrenamientos.
              </p>
            </div>

            <div className="pt-2 flex gap-4">
              <SheetClose asChild>
                <Button type="button" variant="ghost" className="flex-1 h-14 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all rounded-2xl active:scale-95">
                  CANCELAR
                </Button>
              </SheetClose>
              <Button
                type="submit"
                disabled={loading || !canEditFacilities}
                className="flex-[2] h-14 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] border-none active:scale-95 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "SINCRONIZAR_CAMBIOS" : "VINCULAR_ACTIVO")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FacilityStat({ label, value, icon: Icon, highlight, warning }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-primary/20 bg-black/20 rounded-3xl">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl bg-primary/10 border-primary/20",
         warning ? "border-rose-500/20 bg-rose-500/10" : ""
       )}>
          <Icon className={cn("h-6 w-6", warning ? "text-rose-400" : "text-primary")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               warning ? "text-rose-400" : "text-primary cyan-text-glow"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}
