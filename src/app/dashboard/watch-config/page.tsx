
"use client";

import { useState } from "react";
import { 
  Smartphone, 
  Watch, 
  Zap, 
  ShieldCheck, 
  Bell, 
  Activity, 
  Clock, 
  RotateCcw, 
  Save, 
  ChevronRight,
  UserCheck,
  Flame,
  Vibrate,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function WatchConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [operationalAlertsActive, setOperationalAlertsActive] = useState(true);

  // ESTADO DE CONFIGURACIÓN DE ALERTAS
  const [config, setConfig] = useState({
    alertFatigue: true,
    fatigueThreshold: 25,
    alertHeartRate: true,
    hrThreshold: 175,
    vibrateOnPeriod: true,
    vibrateIntensity: 80,
    syncSubs: true,
    autoConfirmSubs: false,
    alertMatchTime: true,
    timeIncrement: 1
  });

  const handleSaveProtocol = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "PROTOCOL_SYNC_COMPLETE",
        description: "Los umbrales de telemetría han sido actualizados en el ecosistema.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24">
      {/* HEADER TÁCTICO */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Peripheral_Protocol_v2.1</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Watch Protocol
          </h1>
        </div>
        
        <Button 
          onClick={handleSaveProtocol}
          disabled={loading}
          className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
        >
          {loading ? "Sincronizando..." : "Guardar Protocolo"} <Save className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: ESTADO DE CONEXIÓN */}
        <div className="space-y-8">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <Watch className="h-32 w-32 text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sincronización_Activa</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">ESTADO_DEL_PERIFÉRICO</h3>
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase">Hardware Detectado</span>
                  <span className="text-[10px] font-black text-primary italic uppercase">SynqWatch_Alpha_v2</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase">Latencia de Red</span>
                  <span className="text-[10px] font-black text-emerald-400 italic uppercase">4ms [Excelente]</span>
               </div>
               <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black text-white/40 uppercase">Batería Nodo</span>
                  <span className="text-[10px] font-black text-white uppercase">84%</span>
               </div>
            </div>
          </Card>

          <div className="p-8 rounded-3xl border border-white/5 bg-black/40 space-y-4 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-all">
                <ShieldCheck className="h-20 w-20 text-primary" />
             </div>
             <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Seguridad_Biométrica</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Los datos recibidos desde el Smartwatch se procesan mediante el motor de IA para predecir fatiga antes de que el atleta baje su rendimiento.
             </p>
          </div>
        </div>

        {/* COLUMNA CENTRAL Y DERECHA: AJUSTES DE TELEMETRÍA */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECCIÓN 1: ALERTAS OPERATIVAS */}
          <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 text-primary/60">
                <Bell className="h-5 w-5 text-primary" /> Alertas Operativas de Partido
              </CardTitle>
              <Switch 
                checked={operationalAlertsActive} 
                onCheckedChange={setOperationalAlertsActive}
                className="data-[state=checked]:bg-primary"
              />
            </CardHeader>
            <CardContent className={cn(
              "p-8 space-y-10 transition-all duration-500",
              !operationalAlertsActive && "opacity-30 pointer-events-none grayscale"
            )}>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Umbral de Fatiga (Tiempo)</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Avisar al Watch cuando un titular supere los minutos definidos sin descanso.
                  </p>
                </div>
                <div className="flex items-center gap-8 min-w-[240px]">
                  <Slider 
                    value={[config.fatigueThreshold]} 
                    min={5} max={45} step={1}
                    onValueChange={(v) => setConfig({...config, fatigueThreshold: v[0]})}
                    className="flex-1"
                  />
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 rounded-none uppercase text-[10px] tracking-widest min-w-[80px] text-center">
                    {config.fatigueThreshold} MIN
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Sincronización de Sustituciones</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Permitir confirmar cambios de roster directamente desde la muñeca.
                  </p>
                </div>
                <Switch 
                  checked={config.syncSubs} 
                  onCheckedChange={(v) => setConfig({...config, syncSubs: v})}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Avisos de Periodo</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Vibración hápica al inicio y fin de cada periodo/entrenamiento.
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Vibrate className="h-4 w-4 text-primary/40" />
                    <Slider 
                      value={[config.vibrateIntensity]} 
                      min={0} max={100} step={10}
                      onValueChange={(v) => setConfig({...config, vibrateIntensity: v[0]})}
                      className="w-32"
                    />
                  </div>
                  <Switch 
                    checked={config.vibrateOnPeriod} 
                    onCheckedChange={(v) => setConfig({...config, vibrateOnPeriod: v})}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* SECCIÓN 2: TELEMETRÍA AVANZADA */}
          <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 text-primary/60">
                <Activity className="h-5 w-5 text-primary" /> Telemetría Biométrica (Simulada)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Alerta de Frecuencia Crítica</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Notificar picos de pulsaciones que sugieran fatiga aguda o riesgo.
                  </p>
                </div>
                <div className="flex items-center gap-8 min-w-[240px]">
                  <Slider 
                    value={[config.hrThreshold]} 
                    min={140} max={200} step={5}
                    onValueChange={(v) => setConfig({...config, hrThreshold: v[0]})}
                    className="flex-1"
                  />
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 rounded-none uppercase text-[10px] tracking-widest min-w-[80px] text-center">
                    {config.hrThreshold} BPM
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 border border-primary/20 bg-primary/5 rounded-[2rem]">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                       <ShieldAlert className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-white uppercase italic">Confirmación Automática</p>
                       <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Ejecutar cambios sugeridos por IA sin intervención.</p>
                    </div>
                 </div>
                 <Switch 
                  checked={config.autoConfirmSubs} 
                  onCheckedChange={(v) => setConfig({...config, autoConfirmSubs: v})}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

            </CardContent>
            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
              <span>Protocolo de Transmisión: Encriptado AES-256</span>
              <span className="flex items-center gap-2">
                <RotateCcw className="h-3 w-3 text-primary/40" /> Actualización de Nodos en Tiempo Real
              </span>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
