
"use client";

import { useState } from "react";
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
  Zap
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
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  { id: "f1", name: "Campo de Fútbol Principal", type: "Campo Exterior", sport: "Fútbol", status: "Active", capacity: "22 Jugadores", nextMaintenance: "12 Oct" },
  { id: "f2", name: "Pabellón Cubierto A", type: "Pabellón", sport: "Baloncesto", status: "Active", capacity: "40 Atletas", nextMaintenance: "05 Nov" },
  { id: "f3", name: "Gimnasio de Alto Rendimiento", type: "Fitness", sport: "Multideporte", status: "Maintenance", capacity: "15 Atletas", nextMaintenance: "Hoy" },
];

export default function FacilitiesManagementPage() {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    footballType: "F11",
    subdivisions: "1",
    subStartTime: "16:00",
    subEndTime: "21:30",
    subDays: ["L", "M", "X", "J", "V"] as string[]
  });

  const isSubdivided = formData.subdivisions !== "1";

  const handleOpenCreate = () => {
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
      footballType: "F11",
      subdivisions: "1",
      subStartTime: "16:00",
      subEndTime: "21:30",
      subDays: ["L", "M", "X", "J", "V"]
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (facility: any) => {
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
      footballType: facility.footballType || "F11",
      subdivisions: facility.subdivisions || "1",
      subStartTime: facility.subStartTime || "16:00",
      subEndTime: facility.subEndTime || "21:30",
      subDays: facility.subDays || ["L", "M", "X", "J", "V"]
    });
    setIsSheetOpen(true);
  };

  const toggleDay = (dayId: string, type: 'global' | 'sub') => {
    const field = type === 'global' ? 'days' : 'subDays';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(dayId) 
        ? prev[field].filter(d => d !== dayId) 
        : [...prev[field], dayId]
    }));
  };

  const handleDelete = (id: string, name: string) => {
    setFacilities(prev => prev.filter(f => f.id !== id));
    toast({
      variant: "destructive",
      title: "ACTIVO_ELIMINADO",
      description: `La instalación ${name} ha sido desconectada de la matriz.`,
    });
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (editingId) {
        setFacilities(prev => prev.map(f => 
          f.id === editingId 
            ? { ...f, ...formData } 
            : f
        ));
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
        setFacilities([newFacility, ...facilities]);
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
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Facility_Network_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Instalaciones
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
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

      <Card className="glass-panel border-none bg-black/40 overflow-hidden mb-8">
        <CardHeader className="p-6 border-b border-white/5">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR POR NOMBRE O DEPORTE..." 
              className="pl-10 h-12 bg-white/5 border-primary/20 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFacilities.map((f) => (
          <Card key={f.id} className="glass-panel overflow-hidden relative group border-none bg-black/40">
            <div className={cn(
              "absolute top-0 left-0 w-full h-[2px]",
              f.status === 'Active' ? 'bg-primary/40' : 'bg-amber-500/40'
            )} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/40 transition-all rotate-3 group-hover:rotate-0 duration-500">
                  <Warehouse className={cn("h-6 w-6", f.status === 'Active' ? 'text-primary' : 'text-amber-400')} />
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className={cn(
                    "rounded-none font-black text-[8px] uppercase tracking-widest px-3 py-1",
                    f.status === 'Active' ? 'border-primary/20 text-primary bg-primary/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'
                  )}>
                    {f.status}
                  </Badge>
                  <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-2">ID: {f.id.toUpperCase()}</span>
                </div>
              </div>
              <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 group-hover:cyan-text-glow transition-all">
                {f.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="h-3 w-3 text-primary/60" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/80 italic">{f.sport}</span>
              </div>
              <CardDescription className="text-[9px] font-black uppercase tracking-widest text-white/30 italic">
                {f.type}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-white/20" />
                  <span className="text-[9px] font-black text-white/40 uppercase">Aforo Máximo</span>
                </div>
                <span className="text-xs font-black text-white">{f.capacity}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-white/20" />
                  <span className="text-[9px] font-black text-white/40 uppercase">Mantenimiento</span>
                </div>
                <span className="text-xs font-black text-primary">{f.nextMaintenance}</span>
              </div>
            </CardContent>
            <CardFooter className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
              <span className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3 text-primary/40" /> Sincronización Estable
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-primary hover:bg-primary/10 border border-primary/10 transition-all"
                  onClick={() => handleEdit(f)}
                  title="Modificar Activo"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 transition-all"
                  onClick={() => handleDelete(f.id, f.name)}
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
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Facility_Deploy_v2.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingId ? "MODIFICAR_ACTIVO" : "AÑADIR_ACTIVO"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Sincronice un nuevo espacio físico con la red operativa del club.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSaveFacility} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre de la Instalación</Label>
                <Input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                  placeholder="EJ: PABELLÓN MUNICIPAL" 
                  className="h-14 bg-white/5 border-primary/20 rounded-none font-bold uppercase focus:border-primary transition-all placeholder:text-white/10 text-lg" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Tipo de Espacio</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({...formData, type: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      <SelectItem value="Campo Exterior" className="text-[10px] font-black uppercase">CAMPO EXTERIOR</SelectItem>
                      <SelectItem value="Pabellón" className="text-[10px] font-black uppercase">PABELLÓN CUBIERTO</SelectItem>
                      <SelectItem value="Fitness" className="text-[10px] font-black uppercase">GIMNASIO / SALA</SelectItem>
                      <SelectItem value="Acuática" className="text-[10px] font-black uppercase">ZONA ACUÁTICA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Disciplina Deportiva</Label>
                  <Select 
                    value={formData.sport} 
                    onValueChange={(v) => setFormData({...formData, sport: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-primary/40" />
                        <SelectValue placeholder="DEPORTE..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      {SPORTS.map(s => (
                        <SelectItem key={s.value} value={s.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {s.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="Multideporte" className="text-[10px] font-black uppercase">MULTIDEPORTE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* BLOQUE TÉCNICO FÚTBOL */}
              {formData.sport === "Fútbol" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  
                  {/* SECCIÓN 1: HORARIO GENERAL DE LA INSTALACIÓN (CIAN) */}
                  <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Warehouse className="h-24 w-24 text-primary" />
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Horario General de la Instalación
                      </span>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Días Operativos</Label>
                      <div className="flex gap-2">
                        {WEEK_DAYS.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id, 'global')}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center font-black text-[10px] border transition-all",
                              formData.days.includes(day.id)
                                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                                : "bg-white/5 border-primary/20 text-white/30 hover:border-primary/40"
                            )}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Apertura</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                          <Input 
                            type="time" 
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            className="pl-10 h-11 bg-white/5 border-primary/20 rounded-none font-bold text-xs focus:border-primary" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Cierre</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                          <Input 
                            type="time" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            className="pl-10 h-11 bg-white/5 border-primary/20 rounded-none font-bold text-xs focus:border-primary" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: CONFIGURACIÓN DE ZONAS Y DISPONIBILIDAD (ESMERALDA) */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Tipo de Disciplina</Label>
                        <Select 
                          value={formData.footballType} 
                          onValueChange={(v) => setFormData({...formData, footballType: v})}
                        >
                          <SelectTrigger className="h-11 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase text-[10px] tracking-widest focus:border-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                            <SelectItem value="F11" className="text-[10px] font-black uppercase">FÚTBOL 11</SelectItem>
                            <SelectItem value="F7" className="text-[10px] font-black uppercase">FÚTBOL 7</SelectItem>
                            <SelectItem value="FSala" className="text-[10px] font-black uppercase">FÚTBOL SALA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Subdivisión de Campo</Label>
                        <Select 
                          value={formData.subdivisions} 
                          onValueChange={(v) => setFormData({...formData, subdivisions: v})}
                        >
                          <SelectTrigger className={cn(
                            "h-11 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase text-[10px] tracking-widest focus:border-primary",
                            isSubdivided ? "border-emerald-500/50 text-emerald-400" : ""
                          )}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                            <SelectItem value="1" className="text-[10px] font-black uppercase">CAMPO ENTERO</SelectItem>
                            <SelectItem value="2" className="text-[10px] font-black uppercase text-emerald-400">2 MITADES (ZONAS)</SelectItem>
                            <SelectItem value="4" className="text-[10px] font-black uppercase text-emerald-400">4 CUARTOS (ZONAS)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {isSubdivided && (
                      <div className="p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-3xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <LayoutGrid className="h-24 w-24 text-emerald-500" />
                        </div>
                        
                        <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
                          <LayoutGrid className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                            Protocolo de Disponibilidad por Zona
                          </span>
                        </div>

                        <div className="space-y-4">
                          <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Días Disponibles para Entrenos</Label>
                          <div className="flex gap-2">
                            {WEEK_DAYS.map(day => (
                              <button
                                key={day.id}
                                type="button"
                                onClick={() => toggleDay(day.id, 'sub')}
                                className={cn(
                                  "h-10 w-10 flex items-center justify-center font-black text-[10px] border transition-all",
                                  formData.subDays.includes(day.id)
                                    ? "bg-emerald-500 text-black border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    : "bg-white/5 border-emerald-500/30 text-white/30 hover:border-emerald-500/40"
                                )}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Inicio Disponibilidad</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-emerald-500/40" />
                              <Input 
                                type="time" 
                                value={formData.subStartTime}
                                onChange={(e) => setFormData({...formData, subStartTime: e.target.value})}
                                className="pl-10 h-11 bg-white/5 border-emerald-500/30 rounded-none font-bold text-xs focus:border-emerald-500" 
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Fin Disponibilidad</Label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-3 h-4 w-4 text-emerald-500/40" />
                              <Input 
                                type="time" 
                                value={formData.subEndTime}
                                onChange={(e) => setFormData({...formData, subEndTime: e.target.value})}
                                className="pl-10 h-11 bg-white/5 border-emerald-500/30 rounded-none font-bold text-xs focus:border-emerald-500" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-[8px] text-emerald-400/60 leading-relaxed uppercase font-bold italic mt-6">
                          * Este horario define los slots disponibles para distribuir a los equipos en cada una de las {formData.subdivisions} zonas.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Capacidad Máx. Atletas</Label>
                  <Input 
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                    placeholder="EJ: 25 ATLETAS" 
                    className="h-12 bg-white/5 border-primary/20 rounded-none font-bold uppercase focus:border-primary transition-all placeholder:text-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Estatus_Red</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      <SelectItem value="Active" className="text-[10px] font-black uppercase">OPERATIVO</SelectItem>
                      <SelectItem value="Maintenance" className="text-[10px] font-black uppercase">MANTENIMIENTO</SelectItem>
                      <SelectItem value="Inactive" className="text-[10px] font-black uppercase">CERRADO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Protocolo de Seguridad</span>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                La configuración de horarios dual permite al motor de planificación de SynQAI distinguir entre la apertura del club y las franjas de alta intensidad formativa.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSaveFacility}
              disabled={loading}
              className={cn(
                "flex-[2] h-16 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none transition-all border-none shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02]",
                isSubdivided ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-primary"
              )}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "SINCRONIZAR_CAMBIOS" : "VINCULAR_ACTIVO")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FacilityStat({ label, value, icon: Icon, highlight, warning }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border border-primary/20 bg-black/20">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl",
         highlight ? "bg-primary/10 border-primary/20" : 
         warning ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary" : warning ? "text-amber-400" : "text-white/40")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary" : warning ? "text-amber-400" : "text-white"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 scan-line" />
    </Card>
  );
}
