
"use client";

import { useState, useMemo } from "react";
import { 
  CalendarDays, 
  ChevronRight, 
  Download, 
  Users, 
  LayoutGrid, 
  Layers, 
  CheckCircle2,
  Clock,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Dumbbell,
  Wind,
  Search,
  Check,
  X,
  MessageSquareQuote,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

// DATA MAESTRA DE LA TEMPORADA
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

export default function CoachSessionsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Simulamos que el entrenador tiene asignado el "Infantil A"
  const myTeam = { name: "Infantil A", stage: "Infantil", sessionsPerWeek: 3 };
  
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);
  const [activeSessionInWeek, setActiveSessionInWeek] = useState("1");

  // LÓGICA DE PLAZO DE 7 DÍAS (SIMULADA)
  const canRequestChange = (mcc: string) => {
    if (mcc.startsWith("SEPT")) return false; // Bloqueado por cercanía en el prototipo
    return true; 
  };

  const handleMCCClic = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
    setActiveSessionInWeek("1");
  };

  const handleSendRequest = () => {
    toast({
      title: "SOLICITUD_ENVIADA",
      description: "La propuesta de cambio ha sido enviada al Director de Metodología.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      
      {/* HEADER OPERATIVO (CYAN THEME) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Coach_Operational_Mirror_v5.1</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            PLANIFICACIÓN_Y_SESIONES
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">
            Equipo Asignado: {myTeam.name} • Etapa {myTeam.stage}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
             <ShieldCheck className="h-5 w-5 text-primary" />
             <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">MODO_LECTURA_ACTIVO</p>
                <p className="text-[8px] font-bold text-white/40 uppercase italic">Sincronizado con Metodología Central</p>
             </div>
          </div>
          <Button className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow hover:scale-105 transition-all border-none">
            <Download className="h-4 w-4 mr-2" /> Mi Temporada
          </Button>
        </div>
      </div>

      {/* MATRIZ DE PLANIFICACIÓN (ESPEJO) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          
          <div className="bg-primary px-10 py-6 flex items-center justify-between border-b border-black/10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-black/20 rounded-xl flex items-center justify-center border border-black/10">
                <LayoutGrid className="h-6 w-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black/60 uppercase tracking-[0.4em]">Temporada 2024 / 2025</span>
                <h2 className="text-2xl font-black text-black italic tracking-tighter uppercase leading-none">
                  Mi Agenda Táctica: <span className="text-black/80">{myTeam.name}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">Sincronización</p>
                  <p className="text-xl font-black text-black italic tracking-tighter uppercase">ESTABLE_100%</p>
               </div>
               <div className="h-8 w-[1px] bg-black/10" />
               <div className="text-right">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">Sesiones/Semana</p>
                  <p className="text-xl font-black text-black italic tracking-tighter">{myTeam.sessionsPerWeek} DÍAS</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] flex">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex flex-col group/month hover:bg-white/[0.01] transition-colors">
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-primary tracking-[0.3em] uppercase">{month.label}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {Array.from({ length: month.weeks }).map((_, i) => {
                      const mccId = `${month.id.toUpperCase()}_W${i+1}`;
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleMCCClic(month.id, i + 1)}
                          className={cn(
                            "p-4 rounded-xl border transition-all cursor-pointer group/mcc relative overflow-hidden",
                            selectedMCC === mccId 
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,242,255,0.2)]" 
                              : "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              selectedMCC === mccId ? "text-primary" : "text-white/20"
                            )}>MCC_{i + 1}</span>
                            <LayoutGrid className={cn("h-3 w-3", selectedMCC === mccId ? "text-primary" : "text-white/10")} />
                          </div>
                          <p className={cn(
                            "text-[8px] font-bold uppercase",
                            selectedMCC === mccId ? "text-white" : "text-white/10"
                          )}>{myTeam.sessionsPerWeek} Sesiones Previstas</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-primary/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary animate-pulse" /> Sincronizado con el Nodo de Metodología
            </span>
            <span>Protocolo de Espejo Operativo • Blindaje de Edición Activo</span>
          </div>
        </Card>
      </div>

      {/* PANEL LATERAL DE DETALLE (VISTA COACH) */}
      <Sheet open={!!selectedMCC} onOpenChange={(open) => !open && setSelectedMCC(null)}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col">
          {selectedMCC && (
            <>
              <div className="p-8 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full animate-pulse bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Detalle de Sesiones</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Semana {selectedMCC}</SheetTitle>
                    <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest px-4 py-1.5 h-auto">
                      CATEGORÍA: {myTeam.stage.toUpperCase()}
                    </Badge>
                  </div>
                </SheetHeader>
              </div>

              <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5">
                <Tabs value={activeSessionInWeek} onValueChange={setActiveSessionInWeek} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-black/40 border border-white/10 p-1 h-12 rounded-xl">
                    {Array.from({ length: myTeam.sessionsPerWeek }).map((_, i) => (
                      <TabsTrigger 
                        key={i} 
                        value={(i + 1).toString()}
                        className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                      >
                        SES_{i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
                <div className="space-y-10" key={activeSessionInWeek}>
                  
                  {/* ALERTA DE LEAD-TIME */}
                  {!canRequestChange(selectedMCC) ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4">
                       <ShieldAlert className="h-5 w-5 text-rose-500" />
                       <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Protocolo Inmutable: Sugerencia de cambio bloqueada (Lead-Time &lt; 7 días)</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                       <Info className="h-5 w-5 text-primary" />
                       <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Terminal Activa: Puede sugerir cambios hasta 7 días antes de la sesión.</p>
                    </div>
                  )}

                  {/* BLOQUES DE SESIÓN */}
                  <div className="space-y-8">
                    <CoachSessionBlock 
                      title="1. Calentamiento / Activación" 
                      time={15} 
                      icon={Flame} 
                      color="orange" 
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Rondo de Activación 4x1"
                      onSuggest={handleSendRequest}
                    />
                    
                    <CoachSessionBlock 
                      title="2. Zona Central (Ejercicios)" 
                      time={45} 
                      icon={Dumbbell} 
                      color="amber" 
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Posesión 5x5 + 2 Comodines"
                      onSuggest={handleSendRequest}
                    />

                    <CoachSessionBlock 
                      title="3. Vuelta a la Calma" 
                      time={10} 
                      icon={Wind} 
                      color="blue" 
                      canRequest={canRequestChange(selectedMCC)}
                      assignedExercise="Estiramientos y Feedback"
                      onSuggest={handleSendRequest}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5">
                <SheetClose asChild>
                  <Button variant="ghost" className="h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/5 transition-all w-full">CERRAR_TERMINAL</Button>
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CoachSessionBlock({ title, time, icon: Icon, color, canRequest, assignedExercise, onSuggest }: any) {
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
        {canRequest && (
          <Button onClick={() => setShowSuggest(true)} variant="ghost" className="h-8 text-[8px] font-black uppercase text-primary border border-primary/20 hover:bg-primary/10 rounded-lg">SUGERIR_CAMBIO</Button>
        )}
      </div>

      <div className="p-6 border-2 rounded-3xl bg-white/[0.02] border-white/5 transition-all relative overflow-hidden">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center">
                 <LayoutGrid className="h-5 w-5 text-white/20" />
              </div>
              <div>
                 <p className="text-xs font-black text-white uppercase italic">{assignedExercise}</p>
                 <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Protocolo Metodológico • SINCRO_OK</p>
              </div>
           </div>
           <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px] font-black">VALIDADO</Badge>
        </div>
      </div>

      {showSuggest && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 space-y-4">
           <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase">Motivo de la Sugerencia</span>
           </div>
           <Input placeholder="EJ: PREFIERO UN TRABAJO DE MÁS INTENSIDAD..." className="h-10 bg-black/40 border-primary/20 text-[10px] uppercase font-bold text-primary" />
           <div className="flex gap-2">
              <Button onClick={() => { onSuggest(); setShowSuggest(false); }} className="flex-1 h-8 bg-primary text-black text-[8px] font-black uppercase rounded-lg">ENVIAR_SOLICITUD</Button>
              <Button onClick={() => setShowSuggest(false)} variant="ghost" className="h-8 text-[8px] font-black uppercase text-white/20 border border-white/5 rounded-lg">CANCELAR</Button>
           </div>
        </div>
      )}
    </div>
  );
}
