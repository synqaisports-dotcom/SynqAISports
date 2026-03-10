
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
  Shield,
  Pause,
  Play,
  UserPlus,
  Hash
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

// PROTOCOLO DE ETAPAS MAESTRAS
const STAGES = [
  { id: "s1", name: "Iniciación", description: "Descubrimiento y psicomotricidad básica.", color: "text-blue-400" },
  { id: "s2", name: "Formación", description: "Desarrollo de fundamentos técnicos y tácticos.", color: "text-emerald-400" },
  { id: "s3", name: "Competición", description: "Alto rendimiento y especialización.", color: "text-primary" },
  { id: "s4", name: "Rendimiento", description: "Máxima exigencia y resultados de red.", color: "text-rose-400" },
];

// ARQUITECTURA DE CATEGORÍAS BLINDADAS
const INITIAL_CATEGORIES = [
  { 
    id: "cat_debutantes", 
    name: "Debutantes", 
    stageId: "s1", 
    teams: [{ 
      name: "Debutantes", 
      suffix: "A", 
      facility: "Campo de Fútbol Principal", 
      zone: "Zona A (Mitad 1)", 
      days: ["L", "X"], 
      startTime: "17:00", 
      endTime: "18:30", 
      status: "Active",
      staff: { coord: "Ismael Muñoz", head: "Carlos Ruiz", second: "Elena Gómez", delegate: "Juan García", physical: "Roberto S." } 
    }], 
    players: 12 
  },
  { id: "cat_prebenjamin", name: "Prebenjamín", stageId: "s1", teams: [], players: 0 },
  { id: "cat_benjamin", name: "Benjamín", stageId: "s2", teams: [], players: 0 },
  { 
    id: "cat_alevin", 
    name: "Alevín", 
    stageId: "s2", 
    teams: [{ 
      name: "Alevín", 
      suffix: "A", 
      facility: "Anexo Formación", 
      zone: "Zona B", 
      days: ["M", "J"], 
      startTime: "17:30", 
      endTime: "19:00", 
      status: "Active",
      staff: { coord: "Elena Gómez", head: "Laura Sánchez", second: "Miguel Ángel", delegate: "Marta López", physical: "Roberto S." } 
    }], 
    players: 15 
  },
  { id: "cat_infantil", name: "Infantil", stageId: "s2", teams: [], players: 0 },
  { id: "cat_cadete", name: "Cadete", stageId: "s3", teams: [], players: 0 },
  { id: "cat_juvenil", name: "Juvenil", stageId: "s3", teams: [], players: 0 },
  { id: "cat_senior", name: "Senior", stageId: "s4", teams: [], players: 0 },
  { 
    id: "cat_primer_equipo", 
    name: "Primer Equipo", 
    stageId: "s4", 
    teams: [{ 
      name: "Primer Equipo", 
      suffix: "A", 
      facility: "Estadio", 
      zone: "Completo", 
      days: ["L", "M", "X", "J", "V"], 
      startTime: "10:00", 
      endTime: "12:00", 
      status: "Active",
      staff: { coord: "Director Deportivo", head: "M. Arteta", second: "Sara Torres", delegate: "Juan García", physical: "Ana Belén" } 
    }], 
    players: 25 
  },
];

const MOCK_FACILITIES = [
  { id: "f1", name: "Campo de Fútbol Principal", subdivisions: "2", zones: ["Zona A (Mitad 1)", "Zona B (Mitad 2)"], divisionStartTime: "17:00", divisionEndTime: "21:00" },
  { id: "f2", name: "Pabellón Cubierto A", subdivisions: "1", zones: [] },
  { id: "f3", name: "Anexo Formación", subdivisions: "4", zones: ["Zona A", "Zona B", "Zona C", "Zona D"], divisionStartTime: "16:00", divisionEndTime: "20:00" },
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
  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    suffix: "A",
    stageId: "s2",
    parentCategory: INITIAL_CATEGORIES[0].id,
    facilityId: "",
    zone: "",
    days: [] as string[],
    startTime: "17:00",
    endTime: "18:30",
    status: "Active" as "Active" | "Paused",
    staffCoord: "",
    staffHead: "",
    staffSecond: "",
    staffDelegate: "",
    staffPhysical: ""
  });

  const selectedFacility = MOCK_FACILITIES.find(f => f.id === formData.facilityId);
  const hasZones = selectedFacility && parseInt(selectedFacility.subdivisions) > 1;

  const handleOpenSheet = (mode: 'category' | 'team') => {
    setSheetMode(mode);
    setEditingId(null);
    setEditingTeamIdx(null);
    setFormData({ 
      name: "", 
      suffix: "A", 
      stageId: "s2", 
      parentCategory: categories[0]?.id || "cat_debutantes",
      facilityId: "",
      zone: "",
      days: [],
      startTime: "17:00",
      endTime: "18:30",
      status: "Active",
      staffCoord: "",
      staffHead: "",
      staffSecond: "",
      staffDelegate: "",
      staffPhysical: ""
    });
    setIsSheetOpen(true);
  };

  const handleEditCategory = (cat: any) => {
    if (cat.id.startsWith('cat_')) {
      toast({
        variant: "destructive",
        title: "ACCESO_DENEGADO",
        description: "Las categorías federativas base son inmutables por protocolo de club.",
      });
      return;
    }
    setSheetMode('category');
    setEditingId(cat.id);
    setFormData(prev => ({
      ...prev,
      name: cat.name,
      stageId: cat.stageId
    }));
    setIsSheetOpen(true);
  };

  const handleEditTeam = (catId: string, team: any, idx: number) => {
    setSheetMode('team');
    setEditingId(catId);
    setEditingTeamIdx(idx);
    
    const fac = MOCK_FACILITIES.find(f => f.name === team.facility);
    
    setFormData({
      ...formData,
      parentCategory: catId,
      suffix: team.suffix,
      facilityId: fac?.id || "",
      zone: team.zone || "",
      days: team.days || [],
      startTime: team.startTime || "17:00",
      endTime: team.endTime || "18:30",
      status: team.status || "Active",
      staffCoord: team.staff?.coord || "",
      staffHead: team.staff?.head || "",
      staffSecond: team.staff?.second || "",
      staffDelegate: team.staff?.delegate || "",
      staffPhysical: team.staff?.physical || ""
    });
    setIsSheetOpen(true);
  };

  const handleToggleTeamStatus = (catId: string, teamIdx: number) => {
    const category = categories.find(c => c.id === catId);
    if (!category) return;
    const team = category.teams[teamIdx];
    if (!team) return;

    const currentStatus = team.status || "Active";
    const newStatus = currentStatus === "Active" ? "Paused" : "Active";

    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        const newTeams = [...c.teams];
        newTeams[teamIdx] = { ...newTeams[teamIdx], status: newStatus };
        return { ...c, teams: newTeams };
      }
      return c;
    }));

    setTimeout(() => {
      toast({
        title: newStatus === "Paused" ? "NODO_PAUSADO" : "NODO_ACTIVADO",
        description: `El equipo ha cambiado su estado a ${newStatus.toUpperCase()}.`,
      });
    }, 100);
  };

  const handleDeleteTeam = (catId: string, teamIdx: number) => {
    setCategories(prev => prev.map(c => {
      if (c.id === catId) {
        const newTeams = [...c.teams];
        newTeams.splice(teamIdx, 1);
        return { ...c, teams: newTeams };
      }
      return c;
    }));
    toast({
      variant: "destructive",
      title: "EQUIPO_DESVINCULADO",
      description: "El equipo ha sido eliminado de la estructura.",
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (id.startsWith('cat_')) {
      toast({
        variant: "destructive",
        title: "BORRADO_BLOQUEADO",
        description: "No se puede eliminar un nodo troncal de la estructura federativa.",
      });
      return;
    }
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
        if (editingTeamIdx !== null && editingId) {
          setCategories(prev => prev.map(c => {
            if (c.id === editingId) {
              const newTeams = [...c.teams];
              newTeams[editingTeamIdx] = {
                ...newTeams[editingTeamIdx],
                suffix: formData.suffix,
                facility: selectedFacility?.name || "",
                zone: formData.zone,
                days: formData.days,
                startTime: formData.startTime,
                endTime: formData.endTime,
                status: formData.status,
                staff: {
                  coord: formData.staffCoord,
                  head: formData.staffHead,
                  second: formData.staffSecond,
                  delegate: formData.staffDelegate,
                  physical: formData.staffPhysical
                }
              };
              return { ...c, teams: newTeams };
            }
            return c;
          }));
          toast({ title: "EQUIPO_ACTUALIZADO", description: `Cambios guardados para el equipo ${formData.suffix}.` });
        } else {
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
                  startTime: formData.startTime,
                  endTime: formData.endTime,
                  status: "Active",
                  staff: { 
                    coord: formData.staffCoord,
                    head: formData.staffHead,
                    second: formData.staffSecond,
                    delegate: formData.staffDelegate,
                    physical: formData.staffPhysical
                  }
                }]
              };
            }
            return c;
          }));
          toast({ title: "EQUIPO_VINCULADO", description: `Equipo ${formData.suffix} añadido correctamente.` });
        }
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
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Academy_Architect_v1.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Gestión de Cantera
          </h1>
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => handleOpenSheet('category')}
            className="rounded-2xl border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest h-12 px-6 hover:bg-primary/10 transition-all"
          >
            <FolderPlus className="h-4 w-4 mr-2" /> Nueva Categoría
          </Button>
          <Button 
            onClick={() => handleOpenSheet('team')}
            className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
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
              <Badge variant="outline" className="text-[8px] font-black border-primary/10 text-primary/40 uppercase rounded-2xl px-3">Stage_{stage.id.toUpperCase()}</Badge>
            </div>

            <div className="space-y-4">
              {categories.filter(c => c.stageId === stage.id).map((cat) => (
                <Card key={cat.id} className="glass-panel border-none bg-black/40 overflow-hidden group hover:bg-black/60 transition-all cursor-default rounded-3xl">
                  <div className={cn("h-1 w-full", stage.color.replace('text', 'bg'))} />
                  
                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:cyan-text-glow transition-all">
                        {cat.name} {cat.teams.length > 0 && (
                          <span className="text-primary/20 text-[10px] ml-2 font-black tracking-widest italic">
                            [{cat.teams.map(t => t.suffix).sort().join('')}]
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black text-primary">{cat.players}</span>
                      </div>
                    </div>
                    <CardDescription className="text-[8px] font-bold text-primary uppercase tracking-widest leading-relaxed italic">
                      {cat.teams.length} Equipos • Fase {stage.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-4">
                    <div className="grid grid-cols-1 gap-2">
                      {cat.teams.map((team, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "flex items-center justify-between p-2.5 bg-primary/5 rounded-2xl border transition-all group/team cursor-default",
                            team.status === "Paused" ? "border-amber-500/20 opacity-60" : "border-primary/10 hover:border-primary/30"
                          )}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2" onClick={() => handleViewTeam(team, cat.name)}>
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full animate-pulse shrink-0",
                              team.status === "Paused" ? "bg-amber-500" : "bg-primary"
                            )} />
                            <span className="text-[9px] font-black text-primary uppercase tracking-tight group-hover/team:cyan-text-glow truncate">
                              {team.name} <span className="text-primary/60 font-black ml-1">{team.suffix}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleViewTeam(team, cat.name)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-all" title="Ver Ficha"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleEditTeam(cat.id, team, idx)} className="p-1.5 hover:bg-primary/20 rounded-lg text-primary transition-all" title="Editar Nodo"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => handleToggleTeamStatus(cat.id, idx)} className="p-1.5 hover:bg-amber-500/20 rounded-lg text-amber-500 transition-all" title={team.status === "Paused" ? "Reactivar" : "Pausar"}>
                              {team.status === "Paused" ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => handleDeleteTeam(cat.id, idx)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-all" title="Borrar"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between rounded-b-3xl">
                    {!cat.id.startsWith('cat_') ? (
                      <>
                        <button 
                          onClick={() => handleEditCategory(cat)}
                          className="text-[8px] font-black text-primary hover:cyan-text-glow transition-all flex items-center gap-2 uppercase tracking-widest italic"
                        >
                          <Pencil className="h-2.5 w-2.5" /> Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="text-[8px] font-black text-rose-500 hover:text-rose-400 transition-all flex items-center gap-2 uppercase tracking-widest italic"
                        >
                          <Trash2 className="h-2.5 w-2.5" /> Eliminar
                        </button>
                      </>
                    ) : (
                      <span className="text-[7px] font-black text-primary/20 uppercase tracking-[0.2em] italic">Maestro_Inmutable</span>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FICHA TÉCNICA DEL EQUIPO (VIEWER) */}
      <Sheet open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          {selectedViewTeam && (
            <>
              <div className="p-10 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Node_Audit_v2.0</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] mb-1 italic">Ficha Técnica de Equipo</span>
                    <SheetTitle className="text-5xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                      {selectedViewTeam.name} <span className="text-primary">[{selectedViewTeam.suffix}]</span>
                    </SheetTitle>
                  </div>
                </SheetHeader>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                {/* CONFIGURACIÓN LOGÍSTICA */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Configuración Logística</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-2">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Instalación / Nodo</span>
                      <p className="text-sm font-black text-primary uppercase italic cyan-text-glow">{selectedViewTeam.facility || "Sede Principal"}</p>
                    </div>
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-2">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Zona Operativa</span>
                      <p className="text-sm font-black text-primary uppercase italic">{selectedViewTeam.zone || "Sector Central"}</p>
                    </div>
                  </div>
                </section>

                {/* STAFF TÉCNICO */}
                <section className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <UserCog className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Staff Técnico Sincronizado</h3>
                  </div>
                  <div className="space-y-4">
                    <StaffDetailItem label="Coordinador Etapa" value={selectedViewTeam.staff?.coord || "Sin Asignar"} icon={Shield} />
                    <StaffDetailItem label="Primer Entrenador" value={selectedViewTeam.staff?.head || "Sin Asignar"} icon={Trophy} highlight />
                    <StaffDetailItem label="Segundo Entrenador" value={selectedViewTeam.staff?.second || "Sin Asignar"} icon={Users} />
                    <StaffDetailItem label="Delegado" value={selectedViewTeam.staff?.delegate || "Sin Asignar"} icon={ClipboardCheck} />
                    <StaffDetailItem label="Preparador Físico" value={selectedViewTeam.staff?.physical || "Sin Asignar"} icon={Activity} />
                  </div>
                </section>

                {/* JUGADORES (ROSTER) */}
                <section className="space-y-6 pb-10">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">Roster de Jugadores Sincronizados</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Generamos algunos ítems mock para representar a los jugadores en el visor */}
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-primary/5 rounded-[1.5rem] border border-primary/10 hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 flex items-center justify-center border border-primary/20 rounded-xl bg-black text-primary font-headline font-black italic shadow-lg group-hover:scale-110 transition-transform">
                            {i === 1 ? '1' : i * 2}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase text-white italic group-hover:cyan-text-glow transition-all">JUGADOR_NODE_0{i}</span>
                            <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">{i === 1 ? 'POR' : 'ATK'} • Telemetría Activa</span>
                          </div>
                        </div>
                        <IdCard className="h-4 w-4 text-primary/20 group-hover:text-primary transition-all" />
                      </div>
                    ))}
                    <div className="p-4 border border-dashed border-primary/20 rounded-2xl text-center">
                       <p className="text-[9px] font-black text-primary/20 uppercase tracking-widest">Sincronizando base de datos completa...</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
                <button 
                  className="flex-1 h-16 bg-primary/5 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/10 rounded-2xl transition-all"
                  onClick={() => setIsViewSheetOpen(false)}
                >
                  CERRAR
                </button>
                <button 
                  className="flex-1 h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    const cat = categories.find(c => c.name === selectedViewTeam.categoryName);
                    handleEditTeam(cat?.id || "", selectedViewTeam, cat?.teams.findIndex(t => t.suffix === selectedViewTeam.suffix) ?? 0);
                  }}
                >
                  EDITAR_NODO
                </button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* TERMINAL DE CONFIGURACIÓN */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Academy_Deploy_v1.5</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {sheetMode === 'category' ? (editingId ? "MODIFICAR_CATEGORÍA" : "CONFIG_CATEGORÍA") : (editingTeamIdx !== null ? "MODIFICAR_EQUIPO" : "VINCULAR_EQUIPO")}
              </SheetTitle>
            </SheetHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            {sheetMode === 'category' ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Nombre de la Categoría</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    placeholder="EJ: ALEVÍN" 
                    className="h-14 bg-white/5 border-primary/20 rounded-2xl font-bold uppercase focus:border-primary text-primary" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Etapa Metodológica</Label>
                  <Select value={formData.stageId} onValueChange={(v) => setFormData({...formData, stageId: v})}>
                    <SelectTrigger className="h-14 bg-black/40 border-primary/20 rounded-2xl text-primary font-bold uppercase tracking-widest px-6 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                      {STAGES.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary text-primary/80">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Categoría</Label>
                      <Select 
                        value={formData.parentCategory} 
                        onValueChange={(v) => setFormData({...formData, parentCategory: v})}
                        disabled={editingTeamIdx !== null}
                      >
                        <SelectTrigger className="h-14 bg-white/5 border-primary/20 rounded-2xl text-primary font-bold uppercase tracking-widest focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase focus:bg-primary">{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Equipo (Letra)</Label>
                      <Select value={formData.suffix} onValueChange={(v) => setFormData({...formData, suffix: v})}>
                        <SelectTrigger className="h-14 bg-white/5 border-primary/20 rounded-2xl text-primary font-black text-xl focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                          {ALPHABET.map(letter => (
                            <SelectItem key={letter} value={letter} className="text-lg font-black text-primary focus:bg-primary">{letter}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                    <MapPin className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Ubicación y Sectorización</span>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[9px] font-black uppercase text-primary tracking-widest ml-1 italic">Instalación Asignada</Label>
                    <Select value={formData.facilityId} onValueChange={(v) => setFormData({...formData, facilityId: v, zone: ""})}>
                      <SelectTrigger className="h-12 bg-black/40 border-primary/20 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest focus:border-primary">
                        <SelectValue placeholder="SELECCIONAR CAMPO..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                        {MOCK_FACILITIES.map(f => (
                          <SelectItem key={f.id} value={f.id} className="text-[10px] font-black uppercase focus:bg-primary">{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {hasZones && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-[9px] font-black uppercase text-primary tracking-widest ml-1 italic">Zona Específica (Subdivisión)</Label>
                      <Select value={formData.zone} onValueChange={(v) => setFormData({...formData, zone: v})}>
                        <SelectTrigger className="h-12 bg-primary/10 border-primary/40 rounded-2xl text-primary font-bold uppercase text-[10px] tracking-widest focus:border-primary shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                          <SelectValue placeholder="ASIGNAR ZONA..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                          {selectedFacility.zones.map(z => (
                            <SelectItem key={z} value={z} className="text-[10px] font-black uppercase focus:bg-primary">{z}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-6 p-8 border border-primary/30 bg-primary/5 rounded-3xl relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-primary/20 pb-4 mb-6">
                    <UserCog className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Asignación de Staff Técnico</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Coordinador de Etapa</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          value={formData.staffCoord}
                          onChange={(e) => setFormData({...formData, staffCoord: e.target.value})}
                          placeholder="NOMBRE DEL COORDINADOR" 
                          className="pl-10 h-11 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary uppercase" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Primer Entrenador</Label>
                      <div className="relative">
                        <Trophy className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          value={formData.staffHead}
                          onChange={(e) => setFormData({...formData, staffHead: e.target.value})}
                          placeholder="NOMBRE DEL ENTRENADOR" 
                          className="pl-10 h-11 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary uppercase" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Segundo Entrenador</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          value={formData.staffSecond}
                          onChange={(e) => setFormData({...formData, staffSecond: e.target.value})}
                          placeholder="NOMBRE DEL 2º ENTRENADOR" 
                          className="pl-10 h-11 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary uppercase" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Delegado de Equipo</Label>
                      <div className="relative">
                        <ClipboardCheck className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          value={formData.staffDelegate}
                          onChange={(e) => setFormData({...formData, staffDelegate: e.target.value})}
                          placeholder="NOMBRE DEL DELEGADO" 
                          className="pl-10 h-11 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary uppercase" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Preparador Físico</Label>
                      <div className="relative">
                        <Activity className="absolute left-3 top-3 h-4 w-4 text-primary/40" />
                        <Input 
                          value={formData.staffPhysical}
                          onChange={(e) => setFormData({...formData, staffPhysical: e.target.value})}
                          placeholder="NOMBRE DEL PREPARADOR" 
                          className="pl-10 h-11 bg-black/40 border-primary/20 rounded-xl text-primary text-xs focus:border-primary uppercase" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-2xl">CANCELAR</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={loading} className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] transition-all active:scale-95">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingTeamIdx !== null ? "ACTUALIZAR_NODO" : "SINCRONIZAR_NODO")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AcademyStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group bg-black/20 border border-primary/20 rounded-3xl">
       <div className="h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl bg-primary/10 border-primary/20">
          <Icon className="h-6 w-6 text-primary" />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-primary uppercase tracking-widest italic">{label}</p>
          <p className="text-2xl font-black italic tracking-tighter text-primary cyan-text-glow">{value}</p>
       </div>
    </Card>
  );
}

function StaffDetailItem({ label, value, icon: Icon, highlight }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-3xl border border-primary/10 hover:border-primary/30 transition-all">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 flex items-center justify-center border rounded-2xl bg-primary/10 border-primary/30 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">{label}</span>
          <span className="text-xs font-black uppercase text-primary cyan-text-glow">{value}</span>
        </div>
      </div>
    </div>
  );
}
