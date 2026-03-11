
"use client";

import { useState, useMemo } from "react";
import { 
  CalendarDays, 
  Settings2, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Users, 
  LayoutGrid, 
  Layers, 
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Library,
  Save,
  Trash2,
  Search,
  Filter,
  Flame,
  Dumbbell,
  Wind,
  Info,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// DATA MAESTRA DE LA TEMPORADA (SEPT - JUN)
const MONTHS = [
  { id: "sept", label: "SEPTIEMBRE", weeks: 4 },
  { id: "oct", label: "OCTUBRE", weeks: 4 },
  { id: "nov", label: "NOVIEMBRE", weeks: 5 },
  { id: "dec", label: "DICIEMBRE", weeks: 4 },
  { id: "jan", label: "ENERO", weeks: 4 },
  { id: "feb", label: "FEBRERO", weeks: 4 },
  { id: "mar", label: "MARZO", weeks: 5 },
  { id: "apr", label: "ABRIL", weeks: 4 },
  { id: "may", label: "MAYO", weeks: 4 },
  { id: "jun", label: "JUNIO", weeks: 4 },
];

// MOCK DE EQUIPOS DEL CLUB
const CLUB_TEAMS = [
  { id: "t1", name: "Infantil A", type: "F11" },
  { id: "t2", name: "Alevín B", type: "F7" },
  { id: "t3", name: "Cadete C", type: "F11" },
  { id: "t4", name: "Primer Equipo", type: "F11" },
];

export default function SessionPlannerPage() {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState(CLUB_TEAMS[0].id);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);
  const [activeSessionInWeek, setActiveSessionInWeek] = useState("1");

  // CONFIGURACIÓN DE TIEMPOS DE SESIÓN
  const [sessionTimes, setSessionTimes] = useState({
    warmup: 10,
    central: 45,
    cooldown: 5
  });

  const totalTime = useMemo(() => 
    sessionTimes.warmup + sessionTimes.central + sessionTimes.cooldown
  , [sessionTimes]);

  const currentTeam = useMemo(() => 
    CLUB_TEAMS.find(t => t.id === selectedTeam), 
  [selectedTeam]);

  const handleMCCClic = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
    setActiveSessionInWeek("1"); // Reset a la primera sesión al abrir MCC
  };

  const handleSaveConfig = () => {
    toast({
      title: "MATRIZ_SINCRO_EXITOSA",
      description: `Protocolo de tiempos (${totalTime} min) aplicado a ${currentTeam?.name}.`,
    });
    setSelectedMCC(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      {/* HEADER DE MANDO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Operational_Planning_v4.3</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow leading-none">
            PLANIFICADOR_MAESTRO
          </h1>
          <p className="text-[11px] font-black text-amber-500/30 tracking-[0.3em] uppercase">Control Operativo por Equipo Septiembre - Junio</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Seleccionar Equipo</span>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[220px] h-12 bg-black border-amber-500/20 rounded-xl text-amber-500 font-black uppercase text-[10px] tracking-widest focus:ring-amber-500/30">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                {CLUB_TEAMS.map(team => (
                  <SelectItem key={team.id} value={team.id} className="text-[10px] font-black uppercase text-amber-500/80 focus:bg-amber-500 focus:text-black">
                    {team.name} [{team.type}]
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 rounded-xl border-amber-500/20 text-amber-500 hover:bg-amber-500/10 font-black uppercase text-[10px] tracking-widest px-6">
                <Settings2 className="h-4 w-4 mr-2" /> Estructura Sesión
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white sm:max-w-md">
              <SheetHeader className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Ajustes_de_Arquitectura</span>
                </div>
                <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">CONFIG_ESTRUCTURA</SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Defina la duración de cada fase para {currentTeam?.name}.</SheetDescription>
              </SheetHeader>
              
              <div className="space-y-8">
                <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-2 text-center">
                   <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Duración Total Sesión</p>
                   <p className="text-5xl font-black text-amber-500 italic tracking-tighter amber-text-glow">
                    {totalTime} <span className="text-sm text-white/20">MIN</span>
                   </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">1. Calentamiento / Activación</Label>
                      <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-500">{sessionTimes.warmup} min</Badge>
                    </div>
                    <Input 
                      type="range" min="5" max="30" step="5"
                      value={sessionTimes.warmup} 
                      onChange={(e) => setSessionTimes({...sessionTimes, warmup: parseInt(e.target.value)})}
                      className="accent-amber-500" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">2. Zona Central (Ejercicios)</Label>
                      <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-500">{sessionTimes.central} min</Badge>
                    </div>
                    <Input 
                      type="range" min="20" max="90" step="5"
                      value={sessionTimes.central} 
                      onChange={(e) => setSessionTimes({...sessionTimes, central: parseInt(e.target.value)})}
                      className="accent-amber-500" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">3. Vuelta a la Calma</Label>
                      <Badge variant="outline" className="text-[10px] border-amber-500/20 text-amber-500">{sessionTimes.cooldown} min</Badge>
                    </div>
                    <Input 
                      type="range" min="5" max="20" step="5"
                      value={sessionTimes.cooldown} 
                      onChange={(e) => setSessionTimes({...sessionTimes, cooldown: parseInt(e.target.value)})}
                      className="accent-amber-500" 
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Frecuencia Semanal (Días Entrenamiento)</Label>
                  <Select value={sessionsPerWeek.toString()} onValueChange={(v) => setSessionsPerWeek(parseInt(v))}>
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-amber-500/20">
                      {[1,2,3,4,5,6,7].map(n => (
                        <SelectItem key={n} value={n.toString()} className="text-[10px] font-black uppercase">{n} Días / Semana</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-12">
                <Button onClick={handleSaveConfig} className="w-full h-16 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl amber-glow">SINCRONIZAR_MATRIZ</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button className="h-12 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl amber-glow hover:scale-105 transition-all border-none">
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* MATRIZ DE PLANIFICACIÓN */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          
          <div className="bg-rose-600 px-10 py-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-black/20 rounded-xl flex items-center justify-center border border-white/20">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Temporada 2024 / 2025</span>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Plan Metodológico: <span className="text-white/80">{currentTeam?.name}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Carga por Sesión</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{totalTime} MIN</p>
               </div>
               <div className="h-8 w-[1px] bg-white/10" />
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Días Entreno</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{sessionsPerWeek} DÍAS</p>
               </div>
            </div>
          </div>

          <div className="bg-amber-500 text-black px-10 py-4 flex items-center justify-between border-b border-black/10">
             <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.5em]">MACROCICLO_OPERATIVO_ANUAL</span>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest italic">Septiembre - Junio • Protocolo Centralizado</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] flex">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex flex-col group/month hover:bg-white/[0.01] transition-colors">
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-amber-500 tracking-[0.3em] uppercase">{month.label}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {Array.from({ length: month.weeks }).map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleMCCClic(month.id, i + 1)}
                        className={cn(
                          "p-4 rounded-xl border transition-all cursor-pointer group/mcc relative overflow-hidden",
                          selectedMCC === `${month.id.toUpperCase()}_W${i+1}` 
                            ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                            : "bg-white/5 border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            selectedMCC === `${month.id.toUpperCase()}_W${i+1}` ? "text-amber-500" : "text-white/20"
                          )}>MCC_{i + 1}</span>
                          <LayoutGrid className={cn("h-3 w-3", selectedMCC === `${month.id.toUpperCase()}_W${i+1}` ? "text-amber-500" : "text-white/10")} />
                        </div>
                        <p className={cn(
                          "text-[8px] font-bold uppercase",
                          selectedMCC === `${month.id.toUpperCase()}_W${i+1}` ? "text-white" : "text-white/10"
                        )}>{sessionsPerWeek} Sesiones Distintas</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-amber-500/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-amber-500 animate-pulse" /> Sincronización Metodológica Activa
            </span>
            <span>SynqSports Operational Planner v4.3 • Protocolo de Sesiones Diferenciadas</span>
          </div>
        </Card>
      </div>

      {/* PANEL LATERAL DE ESTRUCTURA DE SESIÓN DETALLADA (Sheet) */}
      <Sheet open={!!selectedMCC} onOpenChange={(open) => !open && setSelectedMCC(null)}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col">
          {selectedMCC && (
            <>
              <div className="p-8 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Microciclo_Planning_v4.3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Semana {selectedMCC}</SheetTitle>
                    <Badge variant="outline" className="border-amber-500/20 text-amber-500 font-black uppercase tracking-widest px-4 py-1.5 h-auto">
                      {sessionsPerWeek} DÍAS OPERATIVOS
                    </Badge>
                  </div>
                  <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest">
                    Arquitectura de Entrenamiento Semanal para {currentTeam?.name}.
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* SELECTOR DE SESIÓN DENTRO DE LA SEMANA */}
              <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5">
                <Tabs value={activeSessionInWeek} onValueChange={setActiveSessionInWeek} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-black/40 border border-white/10 p-1 h-12 rounded-xl">
                    {Array.from({ length: sessionsPerWeek }).map((_, i) => (
                      <TabsTrigger 
                        key={i} 
                        value={(i + 1).toString()}
                        className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                      >
                        SES_{i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
                
                {/* 1. ESTRUCTURA DE LA SESIÓN SELECCIONADA */}
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500" key={activeSessionInWeek}>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-8 bg-amber-500" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Sesión {activeSessionInWeek} del Microciclo</h3>
                  </div>

                  {/* BLOQUE 1: CALENTAMIENTO */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                          <Flame className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">1. Calentamiento y Activación</h4>
                          <p className="text-[9px] font-bold text-orange-500/60 uppercase italic">Duración Configurada: {sessionTimes.warmup} Minutos</p>
                        </div>
                      </div>
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 uppercase text-[8px] font-black">Slot_Libre</Badge>
                    </div>
                    <div className="p-8 border-2 border-dashed border-orange-500/10 bg-orange-500/[0.02] rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-orange-500/30 transition-all cursor-pointer">
                       <Plus className="h-5 w-5 text-orange-500/20 group-hover:text-orange-500 transition-colors" />
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Asignar Tarea de Activación</span>
                    </div>
                  </div>

                  {/* BLOQUE 2: ZONA CENTRAL */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">2. Zona Central (Contenidos)</h4>
                          <p className="text-[9px] font-bold text-amber-500/60 uppercase italic">Duración Configurada: {sessionTimes.central} Minutos</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[8px] font-black">Multitarea_ON</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-10 border-2 border-dashed border-amber-500/10 bg-amber-500/[0.02] rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-amber-500/30 transition-all cursor-pointer">
                        <Plus className="h-5 w-5 text-amber-500/20 group-hover:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Añadir Tarea Táctica</span>
                      </div>
                      <div className="p-10 border-2 border-dashed border-white/5 bg-white/[0.01] rounded-3xl flex flex-col items-center justify-center gap-2">
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">Espacio para Tarea 02</span>
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE 3: VUELTA A LA CALMA */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Wind className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-widest">3. Vuelta a la Calma</h4>
                          <p className="text-[9px] font-bold text-blue-500/60 uppercase italic">Duración Configurada: {sessionTimes.cooldown} Minutos</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[8px] font-black">Feedback_Final</Badge>
                    </div>
                    <div className="p-8 border-2 border-dashed border-blue-500/10 bg-blue-500/[0.02] rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-blue-500/30 transition-all cursor-pointer">
                       <Plus className="h-5 w-5 text-blue-500/20 group-hover:text-blue-500 transition-colors" />
                       <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Asignar Tarea de Cierre</span>
                    </div>
                  </div>
                </div>

                {/* 2. BUSCADOR DE BIBLIOTECA INTEGRADO */}
                <div className="pt-12 border-t border-white/5 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Library className="h-5 w-5 text-amber-500" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Buscador de Biblioteca</span>
                    </div>
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Filtrado por: {currentTeam?.type}</span>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-white/20" />
                    <Input placeholder="BUSCAR TAREA MANUAL POR NOMBRE O ID..." className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black uppercase focus:border-amber-500 transition-all" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:border-amber-500/40 cursor-grab active:cursor-grabbing transition-all group">
                       <p className="text-[11px] font-black text-white uppercase italic group-hover:text-amber-500 transition-colors">Rondo 4x4 + 3 Comodines</p>
                       <p className="text-[9px] font-bold text-white/20 uppercase mt-1.5 flex items-center gap-2">
                         <LayoutGrid className="h-3 w-3" /> Bloque: Zona Central • ID: 042
                       </p>
                    </div>
                    <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:border-amber-500/40 cursor-grab active:cursor-grabbing transition-all group">
                       <p className="text-[11px] font-black text-white uppercase italic group-hover:text-amber-500 transition-colors">Activación Coordinativa</p>
                       <p className="text-[9px] font-bold text-white/20 uppercase mt-1.5 flex items-center gap-2">
                         <Flame className="h-3 w-3" /> Bloque: Calentamiento • ID: 012
                       </p>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4">
                     <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                     <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
                       Seleccione una sesión (SES_1, SES_2...) para configurar su estructura específica. Cada día de entrenamiento es un nodo táctico independiente.
                     </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5 flex gap-4">
                <SheetClose asChild>
                  <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white/5 transition-all">CANCELAR</Button>
                </SheetClose>
                <Button onClick={handleSaveConfig} className="flex-[2] h-16 bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl amber-glow hover:scale-[1.02] transition-all">GUARDAR_MICROCICLO</Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
