
"use client";

import { useState, useEffect } from "react";
import { 
  Sprout, 
  Plus, 
  Search, 
  Trophy, 
  Users, 
  LayoutGrid, 
  ChevronRight, 
  Settings2, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  ShieldCheck, 
  Activity, 
  Target,
  ArrowUpRight,
  ArrowRight,
  Loader2,
  FolderPlus,
  Layers,
  Tag,
  MapPin,
  Clock,
  Calendar,
  Zap,
  UserCog,
  Dumbbell,
  IdCard,
  ClipboardCheck,
  Eye,
  Info,
  Shield
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
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "s1", name: "Iniciación", description: "Descubrimiento y psicomotricidad básica.", color: "text-blue-400" },
  { id: "s2", name: "Formación", description: "Desarrollo de fundamentos técnicos y tácticos.", color: "text-emerald-400" },
  { id: "s3", name: "Competición", description: "Alto rendimiento y especialización.", color: "text-primary" },
  { id: "s4", name: "Rendimiento", description: "Máxima exigencia y resultados de red.", color: "text-rose-400" },
];

const INITIAL_CATEGORIES = [
  { id: "c1", name: "Debutantes", stageId: "s1", teams: [{ name: "Escuela", suffix: "A", facility: "Campo Principal", zone: "Zona A", days: ["L", "X"], staff: { head: "Carlos Ruiz", coord: "Ismael Muñoz" } }, { name: "Escuela", suffix: "B", facility: "Campo Principal", zone: "Zona B", days: ["M", "J"], staff: { head: "Laura Sánchez", coord: "Ismael Muñoz" } }], players: 20 },
  { id: "c2", name: "Prebenjamín", stageId: "s1", teams: [{ name: "Prebenjamín", suffix: "A", facility: "Anexo", zone: "Completo", days: ["L", "X", "V"], staff: { head: "Sara Torres", coord: "Ismael Muñoz" } }], players: 12 },
  { id: "c3", name: "Benjamín", stageId: "s2", teams: [{ name: "Benjamín", suffix: "A", facility: "Pabellón", zone: "Zona A", days: ["M", "J"], staff: { head: "Miguel Ángel", coord: "Elena Gómez" } }], players: 24 },
  { id: "c4", name: "Alevín", stageId: "s2", teams: [{ name: "Alevín", suffix: "A", facility: "Campo Principal", zone: "Zona A", days: ["L", "X", "V"], staff: { head: "Roberto S.", coord: "Elena Gómez" } }], players: 36 },
];

const MOCK_FACILITIES = [
  { id: "f1", name: "Campo de Fútbol Principal", subdivisions: "2", zones: ["Zona A (Mitad 1)", "Zona B (Mitad 2)"] },
  { id: "f2", name: "Pabellón Cubierto A", subdivisions: "1", zones: [] },
  { id: "f3", name: "Anexo Formación", subdivisions: "4", zones: ["Zona A", "Zona B", "Zona C", "Zona D"] },
];

const WEEK_DAYS = [
  { id: "L", label: "Lunes" },
  { id: "M", label: "Martes" },
  { id: "X", label: "Miércoles" },
  { id: "J", label: "Jueves" },
  { id: "V", label: "Viernes" },
  { id: "S", label: "Sábado" },
  { id: "D", label: "Domingo" },
];

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export default function AcademyManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [selectedViewTeam, setSelectedViewTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sheetMode, setSheetMode] = useState<'category' | 'team'>('category');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    suffix: "A",
    stageId: "s2",
    parentCategory: "c1",
    facilityId: "",
    zone: "",
    days: [] as string[],
    startTime: "17:00",
    endTime: "18:30",
    coordinatorId: "",
    firstCoachId: "",
    secondCoachId: "",
    physicalTrainerId: "",
    delegateId: ""
  });

  const selectedFacility = MOCK_FACILITIES.find(f => f.id === formData.facilityId);
  const hasZones = selectedFacility && parseInt(selectedFacility.subdivisions) > 1;

  const handleOpenSheet = (mode: 'category' | 'team') => {
    setSheetMode(mode);
    setEditingId(null);
    setFormData({ 
      name: "", 
      suffix: "A", 
      stageId: "s2", 
      parentCategory: categories[0]?.id || "c1",
      facilityId: "",
      zone: "",
      days: [],
      startTime: "17:00",
      endTime: "18:30",
      coordinatorId: "",
      firstCoachId: "",
      secondCoachId: "",
      physicalTrainerId: "",
      delegateId: ""
    });
    setIsSheetOpen(true);
  };

  const handleEditCategory = (cat: any) => {
    setSheetMode('category');
    setEditingId(cat.id);
    setFormData(prev => ({
      ...prev,
      name: cat.name,
      stageId: cat.stageId
    }));
    setIsSheetOpen(true);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast({
      variant: "destructive",
      title: "CATEGORÍA_DESVINCULADA",
      description: `La categoría ${name} ha sido eliminada de la red.`,
    });
  };

  const handleViewTeam = (team: any, catName: string) => {
    setSelectedViewTeam({ ...team, categoryName: catName });
    setIsViewSheetOpen(true);
  };

  const toggleDay = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(dayId) 
        ? prev.days.filter(d => d !== dayId) 
        : [...prev.days, dayId]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (sheetMode === 'category') {
        if (editingId) {
          setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name: formData.name, stageId: formData.stageId } : c));
          toast({ title: "CATEGORÍA_ACTUALIZADA", description: `Se han guardado los cambios para ${formData.name}.` });
        } else {
          const newCat = {
            id: `c${Date.now()}`,
            name: formData.name,
            stageId: formData.stageId,
            teams: [],
            players: 0
          };
          setCategories([...categories, newCat]);
          toast({ title: "ETAPA_SINCRO", description: "Nueva categoría añadida a la estructura." });
        }
      } else {
        // Lógica para añadir equipo (simplificada para el prototipo)
        setCategories(prev => prev.map(c => {
          if (c.id === formData.parentCategory) {
            return {
              ...c,
              teams: [...c.teams, { 
                name: c.name, 
                suffix: formData.suffix, 
                facility: selectedFacility?.name || "", 
                zone: formData.zone, 
                days: formData.days,
                staff: { head: "Nuevo Entrenador", coord: "Ismael Muñoz" }
              }]
            };
          }
          return c;
        }));
        toast({ title: "EQUIPO_VINCULADO", description: `Equipo ${formData.suffix} añadido correctamente.` });
      }
      
      setLoading(false);
      setIsSheetOpen(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Academy_Architect_v1.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Gestión de Cantera
          </h1>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => handleOpenSheet('category')}
            className="rounded-none border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest h-12 px-6 hover:bg-white/5"
          >
            <FolderPlus className="h-4 w-4 mr-2" /> Nueva Categoría
          </Button>
          <Button 
            onClick={() => handleOpenSheet('team')}
            className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
          >
            <Plus className="h-4 w-4 mr-2" /> Vincular Equipo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AcademyStat label="Total Equipos" value={categories.reduce((acc, cat) => acc + (cat.teams?.length || 0), 0).toString()} icon={Trophy} />
        <AcademyStat label="Atletas en Formación" value={categories.reduce((acc, cat) => acc + (cat.players || 0), 0).toString()} icon={Users} highlight />
        <AcademyStat label="Etapas Metodológicas" value={STAGES.length.toString()} icon={Layers} />
        <AcademyStat label="Sincronización Red" value="100%" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 pt-4">
        {STAGES.map((stage) => (
          <div key={stage.id} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", stage.color.replace('text', 'bg'))} />
                <h3 className={cn("text-[11px] font-black uppercase tracking-[0.4em]", stage.color)}>{stage.name}</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/20 uppercase">Stage_{stage.id.toUpperCase()}</Badge>
            </div>

            <div className="space-y-4">
              {categories.filter(c => c.stageId === stage.id).map((cat) => (
                <Card key={cat.id} className="glass-panel border-none bg-black/40 overflow-hidden group hover:bg-black/60 transition-all cursor-default">
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:cyan-text-glow transition-all">
                        {cat.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-white/20" />
                        <span className="text-[10px] font-black text-white/40">{cat.players}</span>
                      </div>
                    </div>
                    <CardDescription className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                      {cat.teams.length} Equipos • Fase {stage.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <div className="grid grid-cols-1 gap-2">
                      {cat.teams.map((team, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-all group/team cursor-pointer"
                          onClick={() => handleViewTeam(team, cat.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-1 w-1 rounded-full bg-primary/40 group-hover/team:bg-primary transition-colors" />
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-tight group-hover/team:text-white">
                              {team.name} <span className="text-primary/60 group-hover/team:text-primary font-black ml-1">[{team.suffix}]</span>
                            </span>
                          </div>
                          <ArrowUpRight className="h-3 w-3 text-white/0 group-hover/team:text-primary group-hover/team:opacity-100 transition-all" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between">
                    <button 
                      onClick={() => handleEditCategory(cat)}
                      className="text-[8px] font-black text-primary hover:cyan-text-glow transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                      <Pencil className="h-2.5 w-2.5" /> Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-[8px] font-black text-rose-500 hover:text-rose-400 transition-all flex items-center gap-2 uppercase tracking-widest"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Eliminar
                    </button>
                  </CardFooter>
                </Card>
              ))}

              <Button 
                variant="ghost" 
                onClick={() => handleOpenSheet('category')}
                className="w-full h-12 border border-dashed border-white/5 hover:border-primary/20 bg-transparent text-[8px] font-black text-white/10 hover:text-primary uppercase tracking-[0.3em] transition-all"
              >
                <Plus className="h-3 w-3 mr-2" /> Nueva Categoría
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* TERMINAL DE VISTA DETALLADA DEL EQUIPO */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          {selectedViewTeam && (
            <>
              <div className="p-10 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Node_Audit_v2.0</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-1">Ficha Técnica de Equipo</span>
                    <SheetTitle className="text-5xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                      {selectedViewTeam.name} <span className="text-primary">[{selectedViewTeam.suffix}]</span>
                    </SheetTitle>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] rounded-none px-4">{selectedViewTeam.categoryName}</Badge>
                    <Badge variant="outline" className="border-white/5 text-white/20 font-black uppercase text-[10px] rounded-none px-4">Protocolo Activo</Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                {/* BLOQUE LOGÍSTICA */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Configuración Logística</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Instalación / Nodo</span>
                      <p className="text-sm font-black text-white uppercase italic">{selectedViewTeam.facility || "Sede Principal"}</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Zona Operativa</span>
                      <p className="text-sm font-black text-primary uppercase italic">{selectedViewTeam.zone || "Sector Central"}</p>
                    </div>
                  </div>

                  <div className="p-6 border border-primary/20 bg-primary/5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Cronograma de Sesiones</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map(day => (
                        <div 
                          key={day.id} 
                          className={cn(
                            "h-9 w-9 flex items-center justify-center font-black text-[10px] border",
                            selectedViewTeam.days?.includes(day.id) 
                              ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(0,242,255,0.3)]" 
                              : "border-white/5 text-white/10"
                          )}
                        >
                          {day.id}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      Franja: 17:00 - 18:30 <span className="text-primary/40 italic ml-2">(90 Min. de Alta Intensidad)</span>
                    </p>
                  </div>
                </section>

                {/* BLOQUE STAFF */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <UserCog className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">Staff Técnico Sincronizado</h3>
                  </div>

                  <div className="space-y-4">
                    <StaffDetailItem label="Coordinador Etapa" value={selectedViewTeam.staff?.coord || "Ismael Muñoz"} icon={Shield} />
                    <StaffDetailItem label="Primer Entrenador" value={selectedViewTeam.staff?.head || "Carlos Ruiz"} icon={Trophy} highlight />
                    <StaffDetailItem label="Segundo Entrenador" value="Elena Gómez" icon={Users} />
                    <StaffDetailItem label="Preparador Físico" value="Roberto S." icon={Dumbbell} />
                    <StaffDetailItem label="Delegado Equipo" value="Juan García" icon={ClipboardCheck} />
                  </div>
                </section>

                <div className="p-8 border border-white/5 bg-black/40 rounded-[2rem] space-y-4">
                  <div className="flex items-center gap-3">
                    <Info className="h-4 w-4 text-white/20" />
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Metodología de Red</span>
                  </div>
                  <p className="text-[10px] text-white/30 leading-relaxed font-bold uppercase italic">
                    Este nodo operativo está sincronizado con la matriz del club. Los entrenadores vinculados tienen acceso automático a la telemetría de los atletas asignados a este equipo.
                  </p>
                </div>
              </div>

              <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
                <Button 
                  className="flex-1 h-16 bg-white/5 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/10 rounded-none"
                  onClick={() => setIsViewSheetOpen(false)}
                >
                  CERRAR_FICHA
                </Button>
                <Button 
                  className="flex-1 h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-none cyan-glow"
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    setFormData({ ...formData, parentCategory: INITIAL_CATEGORIES.find(c => c.name === selectedViewTeam.categoryName)?.id || "c1", suffix: selectedViewTeam.suffix });
                    setSheetMode('team');
                    setIsSheetOpen(true);
                  }}
                >
                  EDITAR_NODO <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Academy_Deploy_v1.5</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {sheetMode === 'category' ? (editingId ? "MODIFICAR_CATEGORÍA" : "CONFIG_CATEGORÍA") : "VINCULAR_EQUIPO"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Defina los nodos de formación para la red del club.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            <div className="space-y-8">
              {sheetMode === 'category' ? (
                <div className="space-y-10">
                  <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Layers className="h-24 w-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Identidad y Metodología
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre de la Categoría</Label>
                      <Input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                        placeholder="EJ: ALEVÍN" 
                        className="h-14 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-primary/50 transition-all placeholder:text-white/10 text-lg" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Etapa Metodológica</Label>
                      <Select 
                        value={formData.stageId} 
                        onValueChange={(v) => setFormData({...formData, stageId: v})}
                      >
                        <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none">
                          {STAGES.map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* BLOQUE 0: CLASIFICACIÓN METODOLÓGICA */}
                  <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Layers className="h-24 w-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Clasificación Metodológica
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Etapa de Desarrollo</Label>
                      <Select 
                        value={formData.stageId} 
                        onValueChange={(v) => setFormData({...formData, stageId: v})}
                      >
                        <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[10px] tracking-widest">
                          <div className="flex items-center gap-3">
                            <Layers className="h-4 w-4 text-primary/40" />
                            <SelectValue placeholder="SELECCIONAR ETAPA..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                          {STAGES.map(s => (
                            <SelectItem key={s.id} value={s.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* BLOQUE 1: IDENTIDAD FEDERATIVA */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Categoría Federativa</Label>
                        <Select 
                          value={formData.parentCategory} 
                          onValueChange={(v) => setFormData({...formData, parentCategory: v})}
                        >
                          <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none">
                            {categories.map(c => (
                              <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Equipo (Letra)</Label>
                        <Select 
                          value={formData.suffix} 
                          onValueChange={(v) => setFormData({...formData, suffix: v})}
                        >
                          <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-none text-primary font-black text-xl focus:border-primary/50 transition-all">
                            <div className="flex items-center justify-center w-full gap-3">
                              <Tag className="h-4 w-4 text-primary/40" />
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-none max-h-[200px]">
                            {ALPHABET.map(letter => (
                              <SelectItem key={letter} value={letter} className="text-lg font-black text-white focus:bg-primary">
                                {letter}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 2: INSTALACIÓN Y HORARIO */}
                  <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <MapPin className="h-20 w-20 text-primary" />
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                      <Zap className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                        Asignación de Activo y Horario
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Instalación Asignada</Label>
                        <Select 
                          value={formData.facilityId} 
                          onValueChange={(v) => setFormData({...formData, facilityId: v, zone: ""})}
                        >
                          <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[10px] tracking-widest">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-primary/40" />
                              <SelectValue placeholder="SELECCIONAR CAMPO/SALA..." />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                            {MOCK_FACILITIES.map(f => (
                              <SelectItem key={f.id} value={f.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {hasZones && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-500">
                          <Label className="text-[9px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Zona Específica</Label>
                          <Select 
                            value={formData.zone} 
                            onValueChange={(v) => setFormData({...formData, zone: v})}
                          >
                            <SelectTrigger className="h-12 bg-emerald-500/5 border-emerald-500/30 rounded-none text-emerald-400 font-bold uppercase text-[10px] tracking-widest">
                              <div className="flex items-center gap-3">
                                <LayoutGrid className="h-4 w-4 text-emerald-400/40" />
                                <SelectValue placeholder="ASIGNAR ZONA..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                              {selectedFacility.zones.map(z => (
                                <SelectItem key={z} value={z} className="text-[10px] font-black uppercase tracking-widest focus:bg-emerald-500 focus:text-black">
                                  {z}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-4">
                      <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Días de Entrenamiento</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEK_DAYS.map(day => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={cn(
                              "h-10 w-10 flex items-center justify-center font-black text-[10px] border transition-all",
                              formData.days.includes(day.id)
                                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                                : "bg-black/40 border-white/10 text-white/30 hover:border-primary/40"
                            )}
                          >
                            {day.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Hora Inicio</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                          <Input 
                            type="time" 
                            value={formData.startTime}
                            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            className="pl-10 h-11 bg-black/40 border-white/10 rounded-none font-bold text-xs focus:border-primary/50" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Hora Fin</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                          <Input 
                            type="time" 
                            value={formData.endTime}
                            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            className="pl-10 h-11 bg-black/40 border-white/10 rounded-none font-bold text-xs focus:border-primary/50" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: STAFF TÉCNICO */}
                  <div className="space-y-6 p-8 border border-emerald-500/30 bg-emerald-500/5 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <UserCog className="h-20 w-20 text-emerald-500" />
                    </div>
                    
                    <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
                      <Users className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                        Staff Técnico Asignado
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Coordinador de Etapa</Label>
                        <Select 
                          value={formData.coordinatorId} 
                          onValueChange={(v) => setFormData({...formData, coordinatorId: v})}
                        >
                          <SelectTrigger className="h-11 bg-black/40 border-white/10 rounded-none text-white/60 font-bold uppercase text-[9px] tracking-widest">
                            <div className="flex items-center gap-3">
                              <UserCog className="h-3.5 w-3.5 text-emerald-500/40" />
                              <SelectValue placeholder="ASIGNAR COORDINADOR..." />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="bg-[#04070c] border-emerald-500/20">
                            <SelectItem value="s1" className="text-[9px] font-black uppercase">Ismael Muñoz</SelectItem>
                            <SelectItem value="s2" className="text-[9px] font-black uppercase">Elena Gómez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Primer Entrenador</Label>
                          <Select 
                            value={formData.firstCoachId} 
                            onValueChange={(v) => setFormData({...formData, firstCoachId: v})}
                          >
                            <SelectTrigger className="h-11 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[9px] tracking-widest">
                              <div className="flex items-center gap-3">
                                <Trophy className="h-3.5 w-3.5 text-emerald-500/40" />
                                <SelectValue placeholder="1er ENTRENADOR..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#04070c] border-emerald-500/20">
                              <SelectItem value="c1" className="text-[9px] font-black uppercase">Carlos Ruiz</SelectItem>
                              <SelectItem value="c2" className="text-[9px] font-black uppercase">Laura Sánchez</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Segundo Entrenador</Label>
                          <Select 
                            value={formData.secondCoachId} 
                            onValueChange={(v) => setFormData({...formData, secondCoachId: v})}
                          >
                            <SelectTrigger className="h-11 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[9px] tracking-widest">
                              <div className="flex items-center gap-3">
                                <Users className="h-3.5 w-3.5 text-emerald-500/40" />
                                <SelectValue placeholder="2º ENTRENADOR..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#04070c] border-emerald-500/20">
                              <SelectItem value="c3" className="text-[9px] font-black uppercase">Miguel Ángel</SelectItem>
                              <SelectItem value="c4" className="text-[9px] font-black uppercase">Sara Torres</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Preparador Físico</Label>
                          <Select 
                            value={formData.physicalTrainerId} 
                            onValueChange={(v) => setFormData({...formData, physicalTrainerId: v})}
                          >
                            <SelectTrigger className="h-11 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[9px] tracking-widest">
                              <div className="flex items-center gap-3">
                                <Dumbbell className="h-3.5 w-3.5 text-emerald-500/40" />
                                <SelectValue placeholder="P. FÍSICO..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#04070c] border-emerald-500/20">
                              <SelectItem value="pf1" className="text-[9px] font-black uppercase">Roberto S.</SelectItem>
                              <SelectItem value="pf2" className="text-[9px] font-black uppercase">Ana Belén</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Delegado de Equipo</Label>
                          <Select 
                            value={formData.delegateId} 
                            onValueChange={(v) => setFormData({...formData, delegateId: v})}
                          >
                            <SelectTrigger className="h-11 bg-black/40 border-white/10 rounded-none text-white font-bold uppercase text-[9px] tracking-widest">
                              <div className="flex items-center gap-3">
                                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500/40" />
                                <SelectValue placeholder="DELEGADO..." />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-[#04070c] border-emerald-500/20">
                              <SelectItem value="d1" className="text-[9px] font-black uppercase">Juan García</SelectItem>
                              <SelectItem value="d2" className="text-[9px] font-black uppercase">Marta López</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black uppercase text-primary tracking-widest">Protocolo de Organización</span>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                  La clasificación por etapa y staff vincula los perfiles de usuario con el nodo de equipo, permitiendo una gestión segmentada de la metodología del club.
                </p>
              </div>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSave}
              disabled={loading}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "ACTUALIZAR_NODO" : "SINCRONIZAR_NODO")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AcademyStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border-none bg-black/20">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl",
         highlight ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary" : "text-white/40")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary cyan-text-glow" : "text-white"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}

function StaffDetailItem({ label, value, icon: Icon, highlight }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/item">
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-10 w-10 flex items-center justify-center border rounded-xl",
          highlight ? "bg-primary/10 border-primary/30 text-primary" : "bg-black border-white/5 text-white/20"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">{label}</span>
          <span className={cn("text-xs font-black uppercase", highlight ? "text-white cyan-text-glow" : "text-white/70")}>{value}</span>
        </div>
      </div>
      <Badge variant="outline" className="border-white/5 text-white/10 text-[8px] group-hover/item:border-primary/20 group-hover/item:text-primary transition-all">SINC_OK</Badge>
    </div>
  );
}
