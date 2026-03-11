
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
  Filter
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

// MOCK DE EQUIPOS DEL CLUB (Sincronizado con Academy)
const CLUB_TEAMS = [
  { id: "t1", name: "Infantil A", type: "F11" },
  { id: "t2", name: "Alevín B", type: "F7" },
  { id: "t3", name: "Cadete C", type: "F11" },
  { id: "t4", name: "Primer Equipo", type: "F11" },
];

export default function SessionPlannerPage() {
  const { toast } = useToast();
  const [selectedTeam, setSelectedTeam] = useState(CLUB_TEAMS[0].id);
  const [tasksPerSession, setTasksPerSession] = useState(4);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);

  const currentTeam = useMemo(() => 
    CLUB_TEAMS.find(t => t.id === selectedTeam), 
  [selectedTeam]);

  const handleMCCClic = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
  };

  const handleSaveConfig = () => {
    toast({
      title: "PLANIFICACIÓN_SINCRO",
      description: `Estructura de temporada para ${currentTeam?.name} actualizada.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      {/* HEADER DE MANDO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Operational_Planning_v4.0</span>
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
                <Settings2 className="h-4 w-4 mr-2" /> Configurar Temporada
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white sm:max-w-md">
              <SheetHeader className="space-y-4 mb-10">
                <div className="flex items-center gap-3">
                  <Settings2 className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Ajustes de Matriz</span>
                </div>
                <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase">CONFIG_TEMPORADA</SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Defina los parámetros semanales para {currentTeam?.name}.</SheetDescription>
              </SheetHeader>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">Sesiones por Semana</Label>
                  <Input 
                    type="number" 
                    value={sessionsPerWeek} 
                    onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                    className="h-14 bg-white/5 border-amber-500/20 rounded-2xl text-amber-500 font-black text-xl text-center" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-amber-500/60 tracking-widest">Tareas por Sesión (Promedio)</Label>
                  <Input 
                    type="number" 
                    value={tasksPerSession} 
                    onChange={(e) => setTasksPerSession(parseInt(e.target.value))}
                    className="h-14 bg-white/5 border-amber-500/20 rounded-2xl text-amber-500 font-black text-xl text-center" 
                  />
                </div>
                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl space-y-2">
                   <p className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Total Estimado Temporada</p>
                   <p className="text-3xl font-black text-white italic tracking-tighter">
                    {sessionsPerWeek * tasksPerSession * 40} <span className="text-sm text-white/20">TAREAS</span>
                   </p>
                </div>
              </div>

              <div className="mt-12">
                <Button onClick={handleSaveConfig} className="w-full h-16 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl amber-glow">GUARDAR_AJUSTES</Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button className="h-12 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl amber-glow hover:scale-105 transition-all border-none">
            <Download className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* MATRIZ DE PLANIFICACIÓN (OPCIÓN A - SCROLL MAESTRO) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          
          {/* FILA 1: IDENTIDAD TEMPORADA */}
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
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Sesiones Totales</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{sessionsPerWeek * 40}</p>
               </div>
               <div className="h-8 w-[1px] bg-white/10" />
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Tareas Biblioteca</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{sessionsPerWeek * tasksPerSession * 40}</p>
               </div>
            </div>
          </div>

          {/* FILA 2: MACRO-ESTRUCTURA (ORO) */}
          <div className="bg-amber-500 text-black px-10 py-4 flex items-center justify-between border-b border-black/10">
             <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.5em]">MACROCICLO_ESTRATEGIA_BASE</span>
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">Protocolo de Carga: {sessionsPerWeek} Sesiones / Semanales</span>
          </div>

          {/* CUERPO DE LA MATRIZ CON SCROLL */}
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] flex">
              
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex flex-col group/month hover:bg-white/[0.01] transition-colors">
                  
                  {/* CABECERA MES */}
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-amber-500 tracking-[0.3em] uppercase">{month.label}</span>
                  </div>

                  {/* TOTALES MES */}
                  <div className="grid grid-cols-2 text-center border-b border-white/5 bg-black/40">
                    <div className="p-2 border-r border-white/5">
                      <p className="text-[7px] font-black text-white/30 uppercase">Sesiones</p>
                      <p className="text-xs font-black text-white italic">{month.weeks * sessionsPerWeek}</p>
                    </div>
                    <div className="p-2">
                      <p className="text-[7px] font-black text-white/30 uppercase">Tareas</p>
                      <p className="text-xs font-black text-white italic">{month.weeks * sessionsPerWeek * tasksPerSession}</p>
                    </div>
                  </div>

                  {/* MICROCICLOS (MCC) */}
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
                          <div className="flex items-center gap-1">
                             <div className="h-1 w-1 rounded-full bg-amber-500/20" />
                             <div className="h-1 w-1 rounded-full bg-amber-500/20" />
                             <div className="h-1 w-1 rounded-full bg-amber-500/20" />
                          </div>
                        </div>
                        <p className={cn(
                          "text-[8px] font-bold uppercase truncate",
                          selectedMCC === `${month.id.toUpperCase()}_W${i+1}` ? "text-white" : "text-white/10"
                        )}>Sin Tareas Asignadas</p>
                        
                        {selectedMCC === `${month.id.toUpperCase()}_W${i+1}` && (
                          <div className="absolute right-2 bottom-2">
                            <Plus className="h-3 w-3 text-amber-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                </div>
              ))}

            </div>
          </div>

          {/* FOOTER DE LA MATRIZ */}
          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-amber-500/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-amber-500 animate-pulse" /> Sincronización Metodológica Activa
            </span>
            <span>SynqSports Operational Planner v4.0</span>
          </div>
        </Card>
      </div>

      {/* PANEL LATERAL DE DETALLE DE MICROCICLO */}
      {selectedMCC && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="glass-panel xl:col-span-2 border-amber-500/20 bg-black/40 rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 bg-amber-500/5 flex flex-row items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <CardTitle className="text-xl font-black italic text-white uppercase tracking-tighter">Detalle de {selectedMCC}</CardTitle>
                </div>
                <CardDescription className="text-[10px] font-bold text-amber-500/40 uppercase tracking-widest">Asignación Manual de Tareas de Biblioteca</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedMCC(null)} className="text-white/20 hover:text-rose-500">
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
                 <Library className="h-12 w-12 text-white/10 mb-4" />
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Arrastra ejercicios aquí para planificar la semana</p>
                 <Button variant="outline" className="mt-6 border-amber-500/20 text-amber-500 hover:bg-amber-500/10 text-[9px] font-black uppercase tracking-widest rounded-xl h-10 px-6">
                    Abrir Buscador de Biblioteca
                 </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-amber-500/20 bg-black/40 rounded-3xl p-8 space-y-6">
             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Filter className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Filtros de Biblioteca</span>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/20" />
                <Input placeholder="BUSCAR TAREA..." className="pl-10 h-11 bg-white/5 border-white/10 rounded-xl text-[10px] font-black uppercase" />
             </div>
             <div className="space-y-3">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block ml-1">Tareas Sugeridas para {currentTeam?.type}</span>
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:border-amber-500/40 cursor-grab active:cursor-grabbing transition-all group">
                   <p className="text-[10px] font-black text-white uppercase italic group-hover:text-amber-500">Rondo 4x4 + 3</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase mt-1">Biblioteca_Manual • ID: 042</p>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:border-amber-500/40 cursor-grab active:cursor-grabbing transition-all group">
                   <p className="text-[10px] font-black text-white uppercase italic group-hover:text-amber-500">Salida 3v2 + POR</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase mt-1">Biblioteca_Manual • ID: 015</p>
                </div>
             </div>
             <Button className="w-full h-14 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl amber-glow">SINCRONIZAR_MCC</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
