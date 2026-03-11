
"use client";

import { useState, useMemo, useEffect } from "react";
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
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Check,
  X,
  History,
  MessageSquareQuote,
  UserX,
  UserCheck,
  ArrowRight
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
import { useAuth } from "@/lib/auth-context";

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

const MOCK_ROSTER = [
  { id: "p1", name: "LUCAS GARCÍA", number: 10 },
  { id: "p2", name: "MARC SOLER", number: 1 },
  { id: "p3", name: "ELENA ROSSI", number: 9 },
  { id: "p4", name: "SOFÍA MENDES", number: 4 },
  { id: "p5", name: "JUAN PÉREZ", number: 5 },
  { id: "p6", name: "CARLOS RUIZ", number: 7 },
  { id: "p7", name: "MIGUEL ÁNGEL", number: 8 },
  { id: "p8", name: "LAURA SÁNCHEZ", number: 6 },
];

// MOCK DE EQUIPOS DEL CLUB CON ASIGNACIÓN DE ETAPA
const CLUB_TEAMS = [
  { id: "t1", name: "Infantil A", type: "F11", stage: "Infantil" },
  { id: "t2", name: "Alevín B", type: "F7", stage: "Alevín" },
  { id: "t3", name: "Cadete C", type: "F11", stage: "Cadete" },
  { id: "t4", name: "Primer Equipo", type: "F11", stage: "Rendimiento" },
  { id: "t5", name: "Debutantes A", type: "F7", stage: "Debutantes" },
];

// MOCK DE SOLICITUDES DE CAMBIO
const INITIAL_REQUESTS = [
  { id: "req1", teamId: "t1", mcc: "OCT_W2", session: "1", type: "Substitution", original: "Rondo 4x4", proposed: "Posesión 5x5 + 2", reason: "Falta de intensidad detectada", status: "Pending", coach: "Carlos Ruiz" },
];

export default function SessionPlannerPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // MODO PROTOTIPO: Switch de Rol para testing
  const [viewRole, setViewRole] = useState<"director" | "coach">("director");
  
  const [selectedTeam, setSelectedTeam] = useState(CLUB_TEAMS[0].id);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [activeSessionInWeek, setActiveSessionInWeek] = useState("1");
  const [changeRequests, setRequests] = useState(INITIAL_REQUESTS);
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});

  // Inicializar asistencia por defecto
  useEffect(() => {
    if (selectedMCC) {
      const sessionKey = `${selectedTeam}_${selectedMCC}_S${activeSessionInWeek}`;
      if (!attendance[sessionKey]) {
        const defaultAtt = Object.fromEntries(MOCK_ROSTER.map(p => [p.id, 'present']));
        setAttendance(prev => ({ ...prev, [sessionKey]: defaultAtt }));
      }
    }
  }, [selectedMCC, activeSessionInWeek, selectedTeam, attendance]);

  const toggleAttendance = (playerId: string) => {
    const sessionKey = `${selectedTeam}_${selectedMCC}_S${activeSessionInWeek}`;
    const current = attendance[sessionKey] || {};
    const status = current[playerId];
    const nextStatus = status === 'present' ? 'absent' : status === 'absent' ? 'late' : 'present';
    
    setAttendance(prev => ({
      ...prev,
      [sessionKey]: { ...current, [playerId]: nextStatus }
    }));
  };

  const currentSessionAttendance = useMemo(() => {
    const sessionKey = `${selectedTeam}_${selectedMCC}_S${activeSessionInWeek}`;
    return attendance[sessionKey] || {};
  }, [attendance, selectedMCC, activeSessionInWeek, selectedTeam]);

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

  const canRequestChange = (mcc: string) => {
    if (mcc.startsWith("SEPT")) return false; 
    return true; 
  };

  const handleMCCClic = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
    setActiveSessionInWeek("1");
  };

  const handleSaveConfig = () => {
    toast({
      title: "MATRIZ_SINCRO_EXITOSA",
      description: `Protocolo de tiempos (${totalTime} min) aplicado a ${currentTeam?.name}.`,
    });
    setSelectedMCC(null);
  };

  const handleProcessRequest = (id: string, approve: boolean) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: approve ? 'Approved' : 'Denied' } : r));
    toast({
      title: approve ? "CAMBIO_AUTORIZADO" : "CAMBIO_DENEGADO",
      description: `Se ha sincronizado la respuesta con el terminal del entrenador.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      
      {/* MODO_SWITCH_PROTOTIPO */}
      <div className="flex justify-end gap-2 mb-4">
         <Badge variant="outline" className="border-white/5 text-white/20 uppercase text-[8px] font-black mr-4">Preview_Role:</Badge>
         <button onClick={() => setViewRole("director")} className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", viewRole === 'director' ? 'bg-amber-500 text-black border-amber-500' : 'bg-white/5 text-white/40 border-white/5')}>DIRECTOR_MODO</button>
         <button onClick={() => setViewRole("coach")} className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", viewRole === 'coach' ? 'bg-primary text-black border-primary' : 'bg-white/5 text-white/40 border-white/5')}>COACH_MODO</button>
      </div>

      {/* HEADER DE MANDO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Operational_Planning_v5.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter amber-text-glow leading-none">
            PLANIFICADOR_MAESTRO
          </h1>
          <p className="text-[11px] font-black text-amber-500/30 tracking-[0.3em] uppercase">
            {viewRole === 'director' ? 'Terminal de Diseño Metodológico Central' : `Terminal Operativa: ${currentTeam?.name}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {viewRole === 'director' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Configuración de Nodo</span>
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
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Arquitectura_Maestra</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">CONFIG_ESTRUCTURA</SheetTitle>
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
                      <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Frecuencia Semanal</Label>
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
                    <Button onClick={handleSaveConfig} className="w-full h-16 bg-amber-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl amber-glow">GUARDAR_PROTOCOLO</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">MODO_LECTURA_OPERATIVA</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase italic">Diseño bloqueado por Metodología</p>
               </div>
            </div>
          )}

          <Button className="h-12 bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl amber-glow hover:scale-105 transition-all border-none">
            <Download className="h-4 w-4 mr-2" /> PDF Temporada
          </Button>
        </div>
      </div>

      {/* DASHBOARD DE VALIDACIONES PARA EL DIRECTOR */}
      {viewRole === 'director' && changeRequests.filter(r => r.status === 'Pending').length > 0 && (
        <div className="animate-in slide-in-from-top-4 duration-700">
          <Card className="glass-panel border-amber-500/20 bg-amber-500/5 p-6 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><History className="h-20 w-20 text-amber-500" /></div>
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">SOLICITUDES_DE_CAMBIO_PENDIENTES</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {changeRequests.filter(r => r.status === 'Pending').map(req => (
                  <div key={req.id} className="p-5 bg-black/60 border border-white/5 rounded-2xl space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-white uppercase italic">{req.coach}</p>
                           <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{req.teamId} • {req.mcc}</p>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[8px] font-black">PENDIENTE</Badge>
                     </div>
                     <div className="p-3 bg-white/5 rounded-xl space-y-2 border border-white/5">
                        <div className="flex items-center gap-2">
                           <X className="h-3 w-3 text-rose-500" />
                           <span className="text-[9px] font-bold text-white/40 uppercase line-through">{req.original}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Check className="h-3 w-3 text-emerald-500" />
                           <span className="text-[9px] font-bold text-emerald-400 uppercase italic">{req.proposed}</span>
                        </div>
                     </div>
                     <p className="text-[8px] text-white/20 italic">"{req.reason}"</p>
                     <div className="flex gap-2 pt-2">
                        <Button onClick={() => handleProcessRequest(req.id, true)} className="flex-1 h-8 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-lg">APROBAR</Button>
                        <Button onClick={() => handleProcessRequest(req.id, false)} variant="ghost" className="flex-1 h-8 border border-white/5 text-white/40 text-[8px] font-black uppercase rounded-lg">RECHAZAR</Button>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      )}

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
                  {viewRole === 'director' ? 'Protocolo Metodológico' : 'Mi Agenda Táctica'}: <span className="text-white/80">{currentTeam?.name}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Estado Plan</p>
                  <p className="text-xl font-black text-emerald-400 italic tracking-tighter uppercase">SINCRO_OK</p>
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
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Septiembre - Junio</span>
                <Badge variant="outline" className="bg-black/10 border-black/20 text-black text-[8px] font-black">ETAPA: {currentTeam?.stage.toUpperCase()}</Badge>
             </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] flex">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex-col group/month hover:bg-white/[0.01] transition-colors">
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-amber-500 tracking-[0.3em] uppercase">{month.label}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {Array.from({ length: month.weeks }).map((_, i) => {
                      const mccId = `${month.id.toUpperCase()}_W${i+1}`;
                      const hasPending = changeRequests.some(r => r.mcc === mccId && r.status === 'Pending');
                      
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleMCCClic(month.id, i + 1)}
                          className={cn(
                            "p-4 rounded-xl border transition-all cursor-pointer group/mcc relative overflow-hidden",
                            selectedMCC === mccId 
                              ? "bg-amber-500/20 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                              : hasPending 
                              ? "border-amber-500/40 bg-amber-500/5"
                              : "bg-white/5 border-white/5 hover:border-amber-500/40 hover:bg-amber-500/5"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              selectedMCC === mccId ? "text-amber-500" : "text-white/20"
                            )}>MCC_{i + 1}</span>
                            {hasPending ? (
                              <ShieldAlert className="h-3 w-3 text-amber-500 animate-pulse" />
                            ) : (
                              <LayoutGrid className={cn("h-3 w-3", selectedMCC === mccId ? "text-amber-500" : "text-white/10")} />
                            )}
                          </div>
                          <p className={cn(
                            "text-[8px] font-bold uppercase",
                            selectedMCC === mccId ? "text-white" : "text-white/10"
                          )}>{sessionsPerWeek} Sesiones</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-amber-500/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-amber-500 animate-pulse" /> Sincronización de Red: Óptima
            </span>
            <span>Protocolo de Validación v5.0 • Blindaje Metodológico Activo</span>
          </div>
        </Card>
      </div>

      {/* PANEL LATERAL DE DETALLE Y SOLICITUDES */}
      <Sheet open={!!selectedMCC} onOpenChange={(open) => !open && setSelectedMCC(null)}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col">
          {selectedMCC && (
            <>
              <div className="p-8 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", viewRole === 'director' ? 'bg-amber-500' : 'bg-primary')} />
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.4em]", viewRole === 'director' ? 'text-amber-500' : 'text-primary')}>
                      {viewRole === 'director' ? 'MCC_Design_Studio' : 'MCC_Operational_View'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Semana {selectedMCC}</SheetTitle>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setIsAttendanceOpen(true)}
                        className="h-10 bg-amber-500 text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all border-none"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-2" /> Asistencia
                      </Button>
                      <Badge variant="outline" className="border-amber-500/20 text-amber-500 font-black uppercase tracking-widest px-4 py-1.5 h-auto hidden sm:flex">
                        ETAPA: {currentTeam?.stage.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
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
                
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500" key={activeSessionInWeek}>
                  
                  {viewRole === 'coach' && !canRequestChange(selectedMCC) && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4">
                       <ShieldAlert className="h-5 w-5 text-rose-500" />
                       <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Protocolo Inmutable: Sugerencia de cambio bloqueada (Lead-Time &lt; 7 días)</p>
                    </div>
                  )}

                  <div className="space-y-8">
                    <SessionBlock 
                      title="1. Calentamiento / Activación" 
                      time={sessionTimes.warmup} 
                      icon={Flame} 
                      color="orange" 
                      role={viewRole}
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Activación Preventiva"
                    />
                    
                    <SessionBlock 
                      title="2. Zona Central (Ejercicios)" 
                      time={sessionTimes.central} 
                      icon={Dumbbell} 
                      color="amber" 
                      role={viewRole}
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Rondo 4x4 + 3"
                    />

                    <SessionBlock 
                      title="3. Vuelta a la Calma" 
                      time={sessionTimes.cooldown} 
                      icon={Wind} 
                      color="blue" 
                      role={viewRole}
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Feedback y Estiramientos"
                    />
                  </div>
                </div>

                {(viewRole === 'director' || (viewRole === 'coach' && canRequestChange(selectedMCC))) && (
                  <div className="pt-12 border-t border-white/5 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Library className="h-5 w-5 text-amber-500" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Buscador Filtrado por Etapa</span>
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white/40 uppercase text-[8px] font-black tracking-widest">
                        FILTRO: {currentTeam?.stage.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-4 top-4 h-5 w-5 text-white/20" />
                      <Input placeholder="BUSCAR EN BIBLIOTECA MANUAL..." className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-[11px] font-black uppercase focus:border-amber-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl hover:border-amber-500/40 cursor-grab active:cursor-grabbing transition-all group">
                         <p className="text-[11px] font-black text-white uppercase italic group-hover:text-amber-500 transition-colors">Ejercicio Aptitud {currentTeam?.stage}</p>
                         <p className="text-[9px] font-bold text-white/20 uppercase mt-1.5 flex items-center gap-2">
                           <ShieldCheck className="h-3 w-3 text-emerald-500" /> Sincronizado con Etapa
                         </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5 flex gap-4">
                <SheetClose asChild>
                  <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white/5 transition-all">CERRAR</Button>
                </SheetClose>
                {viewRole === 'director' && (
                  <Button onClick={handleSaveConfig} className="flex-[2] h-16 bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl amber-glow hover:scale-[1.02] transition-all">SINC_CAMBIOS_MAESTROS</Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* PANEL INDEPENDIENTE DE ASISTENCIA */}
      <Sheet open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-amber-500/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full animate-pulse bg-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Attendance_Master_Control</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Pasar Lista</SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-amber-500/40 tracking-widest text-left italic">
                {currentTeam?.name} • SESIÓN {activeSessionInWeek} • {selectedMCC}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MOCK_ROSTER.map(player => {
                const status = currentSessionAttendance[player.id] || 'present';
                return (
                  <div 
                    key={player.id}
                    onClick={() => toggleAttendance(player.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden relative",
                      status === 'present' ? "bg-emerald-500/5 border-emerald-500/20" :
                      status === 'absent' ? "bg-rose-500/5 border-rose-500/20" :
                      "bg-amber-500/5 border-amber-500/20"
                    )}
                  >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                          "h-10 w-10 border rounded-xl flex items-center justify-center text-[11px] font-black italic",
                          status === 'present' ? "bg-black/40 border-emerald-500/30 text-emerald-400" :
                          status === 'absent' ? "bg-black/40 border-rose-500/30 text-rose-400" :
                          "bg-black/40 border-amber-500/30 text-amber-400"
                        )}>
                          {player.number}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white uppercase italic group-hover:amber-text-glow transition-all">{player.name}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest",
                            status === 'present' ? "text-emerald-400/60" :
                            status === 'absent' ? "text-rose-400/60" :
                            "text-amber-400/60"
                          )}>
                            {status === 'present' ? 'SINCRO_OK' : status === 'absent' ? 'AUSENCIA' : 'RETRASO'}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {status === 'present' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in" />
                        ) : status === 'absent' ? (
                          <UserX className="h-5 w-5 text-rose-500 animate-in zoom-in" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500 animate-in zoom-in" />
                        )}
                      </div>
                      {status === 'present' && <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-black/60 border-t border-white/5">
            <Button 
              onClick={() => setIsAttendanceOpen(false)}
              className="flex-1 h-16 bg-amber-500 text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-all border-none w-full"
            >
              FINALIZAR_REGISTRO <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SessionBlock({ title, time, icon: Icon, color, role, canRequest, assignedExercise }: any) {
  const [showSuggest, setShowSuggest] = useState(false);
  const colorClass = color === 'orange' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' : 
                     color === 'amber' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
                     'text-blue-500 border-blue-500/20 bg-blue-500/10';

  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
            <p className={cn("text-[9px] font-bold uppercase italic opacity-60")}>Duración: {time} Minutos</p>
          </div>
        </div>
        {role === 'coach' && canRequest && (
          <Button onClick={() => setShowSuggest(true)} variant="ghost" className="h-8 text-[8px] font-black uppercase text-primary border border-primary/20 hover:bg-primary/10 rounded-lg">SUGERIR_CAMBIO</Button>
        )}
      </div>

      <div className={cn(
        "p-6 border-2 rounded-3xl transition-all relative overflow-hidden",
        assignedExercise ? "bg-white/[0.02] border-white/5" : "border-dashed border-white/5 text-center"
      )}>
        {assignedExercise ? (
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center">
                   <LayoutGrid className="h-5 w-5 text-white/20" />
                </div>
                <div>
                   <p className="text-xs font-black text-white uppercase italic">{assignedExercise}</p>
                   <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Biblioteca Manual • ID: 0XX</p>
                </div>
             </div>
             {role === 'director' && (
               <button className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-all"><Trash2 className="h-4 w-4" /></button>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
             <Plus className="h-5 w-5 text-white/10 group-hover:text-amber-500 transition-colors" />
             <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Asignar Tarea Metodológica</span>
          </div>
        )}
      </div>

      {showSuggest && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 space-y-4">
           <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase">Motivo del Cambio</span>
           </div>
           <Input placeholder="EJ: EL GRUPO NECESITA MÁS RITMO..." className="h-10 bg-black/40 border-primary/20 text-[10px] uppercase font-bold text-primary" />
           <div className="flex gap-2">
              <Button onClick={() => setShowSuggest(false)} className="flex-1 h-8 bg-primary text-black text-[8px] font-black uppercase rounded-lg">ENVIAR_SOLICITUD</Button>
              <Button onClick={() => setShowSuggest(false)} variant="ghost" className="h-8 text-[8px] font-black uppercase text-white/20 border border-white/5 rounded-lg">CANCELAR</Button>
           </div>
        </div>
      )}
    </div>
  );
}
