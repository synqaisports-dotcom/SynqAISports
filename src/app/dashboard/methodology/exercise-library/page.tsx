
"use client";

import { useState } from "react";
import { 
  Library, 
  Plus, 
  Search, 
  ShieldCheck, 
  Activity, 
  Pencil, 
  Trash2, 
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  MoreHorizontal,
  ChevronRight,
  Info,
  Clock,
  Maximize2,
  Target,
  Zap,
  Dumbbell,
  Layers,
  ClipboardList,
  Boxes,
  ScrollText,
  AlertCircle,
  Camera,
  Upload,
  PencilLine,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const STAGES = ["Debutantes", "Prebenjamín", "Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Senior"];

const MOCK_EXERCISES = [
  { id: "ex1", title: "Rondo 4x4 + 3 Comodines", stage: "Infantil", dimension: "Táctica", status: "Official", author: "I. Muñoz", date: "12 Oct 2024" },
  { id: "ex2", title: "Circuito de Coordinación 01", stage: "Alevín", dimension: "Técnica", status: "Official", author: "L. Sánchez", date: "10 Oct 2024" },
  { id: "ex3", title: "Finalización tras Centros", stage: "Cadete", dimension: "Táctica", status: "Coach_Draft", author: "C. Ruiz", date: "08 Oct 2024" },
];

export default function ExerciseLibraryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    didacticStrategy: "",
    objectives: "",
    conditionalContent: "",
    time: "",
    space: "",
    gameSituation: "",
    technicalAction: "",
    tacticalAction: "",
    collectiveContent: "",
    description: "",
    provocationRules: "",
    instructions: "",
    equipment: "",
    stage: "Alevín",
    dimension: "Táctica"
  });

  const handleSaveMasterTask = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSheetOpen(false);
      toast({
        title: "TAREA_MAESTRA_SINCRO",
        description: `El ejercicio "${formData.title || 'NUEVA_TAREA'}" ha sido blindado en la biblioteca oficial.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Library className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Club_Tactical_Stylebook</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic amber-text-glow leading-none">
            BIBLIOTECA_OFICIAL
          </h1>
        </div>
        
        <Button 
          onClick={() => setIsSheetOpen(true)}
          className="rounded-2xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all border-none"
        >
          <Plus className="h-4 w-4 mr-2" /> Crear Tarea Maestra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LibraryStat label="Tareas Validadas" value="42" icon={ShieldCheck} highlight />
        <LibraryStat label="Propuestas Coach" value="12" icon={Activity} />
        <LibraryStat label="Etapa Dominante" value="Alevín" icon={Info} />
      </div>

      <Card className="glass-panel border-amber-500/20 bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-4 h-4 w-4 text-amber-500 opacity-50" />
            <Input 
              placeholder="BUSCAR EN EL LIBRO DE ESTILO..." 
              className="pl-12 h-14 bg-white/5 border-amber-500/20 rounded-2xl text-amber-500 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-amber-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest italic">Control de Acceso Metodológico</span>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">SINCRO_CLUB_MASTER</span>
             </div>
             <Filter className="h-5 w-5 text-amber-500/40 cursor-pointer hover:text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-left">Título de la Tarea / Autor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-center">Etapa Objetivada</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-center">Dimensión</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-center">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-right">Acciones</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_EXERCISES.map((ex) => (
                <TableRow key={ex.id} className="border-white/5 hover:bg-amber-500/[0.03] transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all">
                        <Library className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:amber-text-glow transition-all">{ex.title}</p>
                        <p className="text-[8px] text-amber-500/40 font-bold uppercase tracking-widest mt-1">Por: {ex.author} • {ex.date}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="rounded-lg border-amber-500/20 text-amber-500 text-[8px] font-black px-3 py-1 uppercase">{ex.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{ex.dimension}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className={cn("h-1.5 w-1.5 rounded-full", ex.status === 'Official' ? 'bg-amber-500 shadow-[0_0_8px_var(--amber-500)]' : 'bg-white/20')} />
                       <span className={cn("text-[9px] font-black uppercase", ex.status === 'Official' ? 'text-amber-500' : 'text-white/20')}>{ex.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-500/40 hover:text-amber-500 border border-white/5 rounded-xl"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500/40 hover:text-rose-500 border border-white/5 rounded-xl"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-amber-500/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 animate-pulse" /> Sincronización de Estilo: Activa</span>
          <span>Modelo de Blindaje v6.3</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 italic">Master_Asset_Factory_v6.3</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                CREAR <span className="text-amber-500">TAREA MAESTRA</span>
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-amber-500/40 tracking-widest text-left italic">
                Defina el ADN táctico completo para la biblioteca oficial del club.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSaveMasterTask} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
            
            {/* SECCIÓN 0: RECURSOS VISUALES */}
            <div className="space-y-6 p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl relative overflow-hidden">
              <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
                <Camera className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Recursos Visuales</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="h-16 border-amber-500/30 bg-black/40 text-amber-500 font-black uppercase text-[10px] tracking-widest hover:bg-amber-500/10 rounded-2xl flex items-center justify-center gap-3"
                >
                  <Upload className="h-4 w-4" /> Subir Imagen Técnica
                </Button>
                <Button 
                  type="button"
                  asChild
                  className="h-16 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl amber-glow hover:scale-[1.02] transition-all border-none flex items-center justify-center gap-3"
                >
                  <Link href="/board/training?source=form">
                    <PencilLine className="h-4 w-4" /> Diseñar en Pizarra
                  </Link>
                </Button>
              </div>
              <p className="text-[8px] text-amber-500/40 uppercase font-bold tracking-tighter mt-2 leading-relaxed text-center italic">
                Sincronice un diagrama táctico o suba una captura de pantalla del ejercicio.
              </p>
            </div>

            {/* SECCIÓN 1: IDENTIDAD BÁSICA */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Target className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Identidad y Estrategia</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Título de la Tarea</Label>
                  <Input 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value.toUpperCase()})}
                    placeholder="EJ: JUEGO ADAPTADO CONDUCCIÓN" 
                    className="h-14 bg-white/5 border-amber-500/20 rounded-2xl font-bold uppercase focus:border-amber-500 text-amber-500 text-lg placeholder:text-amber-500/20" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Estrategia Didáctica</Label>
                  <Input 
                    value={formData.didacticStrategy}
                    onChange={(e) => setFormData({...formData, didacticStrategy: e.target.value.toUpperCase()})}
                    placeholder="EJ: JUEGO ADAPTADO" 
                    className="h-14 bg-white/5 border-amber-500/20 rounded-2xl font-bold uppercase focus:border-amber-500 text-amber-500 text-lg placeholder:text-amber-500/20" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Etapa Federativa</Label>
                  <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                    <SelectTrigger className="h-14 bg-white/5 border-amber-500/20 rounded-2xl text-white font-bold uppercase text-[10px] focus:border-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-amber-500/20 rounded-xl">
                      {STAGES.map(s => (
                        <SelectItem key={s} value={s} className="text-[10px] font-black uppercase">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Dimensión</Label>
                  <Select value={formData.dimension} onValueChange={(v) => setFormData({...formData, dimension: v})}>
                    <SelectTrigger className="h-14 bg-white/5 border-amber-500/20 rounded-2xl text-white font-bold uppercase text-[10px] focus:border-amber-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-amber-500/20 rounded-xl">
                      <SelectItem value="Táctica" className="text-[10px] font-black uppercase">Táctica</SelectItem>
                      <SelectItem value="Técnica" className="text-[10px] font-black uppercase">Técnica</SelectItem>
                      <SelectItem value="Física" className="text-[10px] font-black uppercase">Física</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Objetivos Principales</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3.5 h-4 w-4 text-amber-500/40" />
                  <Textarea 
                    value={formData.objectives}
                    onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                    placeholder="EJ: TRABAJAR LA CONDUCCIÓN DEL BALÓN..." 
                    className="min-h-[100px] pl-10 bg-white/5 border-amber-500/20 rounded-2xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: LOGÍSTICA Y CONDICIÓN */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Activity className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Logística y Condición</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Contenido Condicional</Label>
                  <Input 
                    value={formData.conditionalContent}
                    onChange={(e) => setFormData({...formData, conditionalContent: e.target.value})}
                    placeholder="EJ: COORDINACIÓN" 
                    className="h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Tiempo Sugerido</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-amber-500/40" />
                    <Input 
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      placeholder="EJ: 15’" 
                      className="pl-10 h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Espacio / Área</Label>
                  <div className="relative">
                    <Maximize2 className="absolute left-3 top-3 h-4 w-4 text-amber-500/40" />
                    <Input 
                      value={formData.space}
                      onChange={(e) => setFormData({...formData, space: e.target.value})}
                      placeholder="EJ: 20M X 20M" 
                      className="pl-10 h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Situación de Juego</Label>
                <Input 
                  value={formData.gameSituation}
                  onChange={(e) => setFormData({...formData, gameSituation: e.target.value})}
                  placeholder="EJ: 4X4 CON COMODINES..." 
                  className="h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                />
              </div>
            </div>

            {/* SECCIÓN 3: CONTENIDOS TÁCTICO-TÉCNICOS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Boxes className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Contenidos Táctico-Técnicos</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Habilidad Coordinativa / Técnica</Label>
                  <Input 
                    value={formData.technicalAction}
                    onChange={(e) => setFormData({...formData, technicalAction: e.target.value})}
                    placeholder="EJ: CONDUCCIÓN Y REGATE" 
                    className="h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Intención Táctica Individual</Label>
                  <Input 
                    value={formData.tacticalAction}
                    onChange={(e) => setFormData({...formData, tacticalAction: e.target.value})}
                    placeholder="EJ: SUPERAR OPONENTE" 
                    className="h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Contenido Colectivo del Modelo</Label>
                  <Input 
                    value={formData.collectiveContent}
                    onChange={(e) => setFormData({...formData, collectiveContent: e.target.value})}
                    placeholder="EJ: AMPLITUD Y PROFUNDIDAD" 
                    className="h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: DESCRIPCIÓN Y NORMAS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <ScrollText className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Mecánica y Normativa</h3>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Descripción Dinámica</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="EXPLIQUE LA DINÁMICA DEL EJERCICIO..." 
                  className="min-h-[140px] bg-white/5 border-amber-500/20 rounded-2xl font-bold focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Reglas de Provocación</Label>
                <Textarea 
                  value={formData.provocationRules}
                  onChange={(e) => setFormData({...formData, provocationRules: e.target.value})}
                  placeholder="EJ: TOQUES LIMITADOS, PUNTUACIÓN DOBLE..." 
                  className="min-h-[100px] bg-white/5 border-amber-500/20 rounded-2xl font-bold focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                />
              </div>
            </div>

            {/* SECCIÓN 5: CONSIGNAS Y MATERIAL */}
            <div className="space-y-8 pb-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Consignas y Recursos</h3>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Consignas Clave (Coaching)</Label>
                <Textarea 
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="• BAJAR CENTRO DE GRAVEDAD • CONTACTOS CORTOS..." 
                  className="min-h-[100px] bg-white/5 border-amber-500/20 rounded-2xl font-bold focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest ml-1 italic">Material Técnico Necesario</Label>
                <div className="relative">
                  <Dumbbell className="absolute left-3 top-3.5 h-4 w-4 text-amber-500/40" />
                  <Input 
                    value={formData.equipment}
                    onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                    placeholder="EJ: 10 BALONES, 4 CONOS, 2 PETOS..." 
                    className="pl-10 h-12 bg-white/5 border-amber-500/20 rounded-xl font-bold uppercase focus:border-amber-500 text-amber-500 placeholder:text-amber-500/20" 
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Protocolo de Registro Maestro</span>
              </div>
              <p className="text-[10px] text-amber-500/40 leading-relaxed font-bold uppercase italic">
                Al blindar esta tarea, estará disponible para todos los entrenadores del club bajo el manual oficial de estilo.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/60 border-t border-white/5 flex gap-6">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-amber-500/20 text-amber-500/60 font-black uppercase text-[11px] tracking-widest hover:bg-amber-500/10 rounded-2xl transition-all">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSaveMasterTask}
              disabled={loading}
              className="flex-[2] h-16 bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl amber-glow hover:scale-[1.02] transition-all border-none"
            >
              {loading ? "SINCRO_PROCESO..." : "BLINDAR_TAREA_MAESTRA"} <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LibraryStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-6 border-amber-500/20 bg-black/20 rounded-[2rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <Icon className="h-16 w-16 text-amber-500" />
       </div>
       <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">{label}</p>
          <p className={cn("text-3xl font-black italic tracking-tighter", highlight ? "text-amber-500 amber-text-glow" : "text-white")}>{value}</p>
       </div>
    </Card>
  );
}
