
"use client";

import { useState, useEffect } from "react";
import { ensureWatchPairingCode } from "@/lib/watch-pairing";
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
  ShieldAlert,
  History,
  Download,
  Info,
  ArrowRight,
  QrCode
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { BoardPerformanceSettingsCard } from "@/components/board/BoardPerformanceSettingsCard";

export default function SandboxWatchConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState("");

  useEffect(() => {
    setPairingCode(ensureWatchPairingCode({ clubId: "sandbox", mode: "sandbox" }));
  }, []);

  // ESTADO DE CONFIGURACIÓN LOCAL
  const [config, setConfig] = useState({
    alertFatigue: true,
    fatigueThreshold: 20,
    vibrateOnPeriod: true,
    vibrateIntensity: 70,
    syncSubs: true,
    alertMatchTime: true,
    changeInterval: "5"
  });

  const handleSaveLocal = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "SINCRO_LOCAL_WATCH",
        description: "Umbrales de telemetría blindados en tu Sandbox.",
      });
    }, 1000);
  };

  const watchUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/smartwatch?code=${pairingCode}`
    : "";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Local_Watch_Protocol_v1.5</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            VINCULAR_WATCH
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Configuración de Periférico Sandbox</p>
        </div>
        
        <div className="flex gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-12 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 rounded-xl hover:bg-primary/10 transition-all">
                <QrCode className="h-4 w-4 mr-2" /> Vínculo Express (QR)
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Express_Link_Sandbox</span>
                  </div>
                  <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">VINCULAR RELOJ</SheetTitle>
                  <SheetDescription className="text-[10px] uppercase font-bold text-primary/40 tracking-widest italic">Vínculo instantáneo por QR.</SheetDescription>
                </SheetHeader>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 flex flex-col items-center justify-center space-y-10">
                <div className="p-6 bg-white rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                  <QRCodeCanvas value={watchUrl} size={240} level="H" fgColor="#000000" bgColor="#ffffff" />
                </div>

                <div className="space-y-6 w-full">
                  <div className="flex gap-4 group">
                    <span className="text-xl font-black italic text-primary/40">01</span>
                    <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed">Escanee con el móvil para abrir el vínculo.</p>
                  </div>
                  <div className="flex gap-4 group">
                    <span className="text-xl font-black italic text-primary/40">02</span>
                    <p className="text-[10px] text-white/60 font-bold uppercase leading-relaxed italic">La app se emparejará automáticamente al detectar el nodo local.</p>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4 w-full">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Sincro Sin Cables</span>
                   </div>
                   <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
                     El código QR elimina la necesidad de teclear la URL en la pantalla táctil del Smartwatch.
                   </p>
                </div>
              </div>
              <div className="p-10 bg-black/60 border-t border-white/5">
                <SheetClose asChild>
                  <Button variant="ghost" className="w-full h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                    CERRAR_ASISTENTE
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            onClick={handleSaveLocal}
            disabled={loading}
            className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-all border-none"
          >
            {loading ? "Blindando..." : "Guardar Configuración"} <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="space-y-8">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden group rounded-[2.5rem]">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
              <Watch className="h-32 w-32 text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sincronización_Sandbox</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-4">ESTADO_DEL_NODO</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6 leading-relaxed italic">
              El reloj se sincroniza localmente con tu navegador. Genera el código en la Pizarra de Partido para activar el enlace de datos.
            </p>
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase">Hardware Sandbox</span>
                  <span className="text-[10px] font-black text-primary italic uppercase">SynqWatch_Lite</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black text-white/40 uppercase">Código Nodo</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{pairingCode}</span>
               </div>
            </div>
          </Card>

          <BoardPerformanceSettingsCard />

          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Zap className="h-32 w-32 text-primary" /></div>
             <h4 className="text-xl font-black italic uppercase text-white mb-4">VENTAJA_PRO</h4>
             <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-relaxed mb-8 italic">
               El modo Pro permite la telemetría cardíaca real y el volcado de datos biométricos a la base de datos del club para prevenir lesiones y fatiga crónica.
             </p>
             <Button className="w-full h-14 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl blue-glow border-none transition-all" asChild>
                <Link href="/login">UPGRADE A ELITE CLUB <ArrowRight className="h-4 w-4 ml-2" /></Link>
             </Button>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-[0.4em] flex items-center gap-4 text-primary/60">
                <Bell className="h-5 w-5 text-primary" /> Alertas Sandbox de Partido
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><History className="h-16 w-16 text-primary" /></div>
                <div className="space-y-1 max-w-sm relative z-10">
                  <h4 className="text-sm font-black text-white uppercase italic">Sincronización de Cronómetro Master</h4>
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-relaxed">
                    El tiempo del Watch viene dictado por la Pizarra de Partido en tiempo real.
                  </p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                   <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black tracking-widest">SOURCE: LOCAL_BOARD</Badge>
                   <Switch 
                    checked={true} 
                    disabled
                    className="data-[state=checked]:bg-primary opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Umbral de Fatiga (Tiempo)</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed italic">
                    Avisar al Watch cuando un jugador local supere los minutos definidos.
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
                  <h4 className="text-sm font-black text-white uppercase italic">Vibración en Periodos</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Vibración hápica al inicio y fin de cada periodo configurado.
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <Slider 
                    value={[config.vibrateIntensity]} 
                    min={0} max={100} step={10}
                    onValueChange={(v) => setConfig({...config, vibrateIntensity: v[0]})}
                    className="w-32"
                  />
                  <Switch 
                    checked={config.vibrateOnPeriod} 
                    onCheckedChange={(v) => setConfig({...config, vibrateOnPeriod: v})}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-black text-white uppercase italic">Sincronización de Sustituciones</h4>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed italic">
                    Visualizar los cambios de roster local directamente desde la muñeca.
                  </p>
                </div>
                <Switch 
                  checked={config.syncSubs} 
                  onCheckedChange={(v) => setConfig({...config, syncSubs: v})}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

            </CardContent>
            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-primary/20 uppercase tracking-[0.5em]">
              <span>Protocolo de Transmisión Local Sandbox</span>
              <span className="flex items-center gap-2">
                <RotateCcw className="h-3 w-3 text-primary/40" /> Actualización de Nodos en Tiempo Real
              </span>
            </div>
          </Card>

          <div className="p-8 rounded-[2.5rem] border border-primary/10 bg-primary/[0.02] space-y-4 relative overflow-hidden group">
             <div className="absolute inset-0 bg-grid-pattern opacity-5" />
             <div className="flex items-center gap-3 relative z-10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Aviso Metodológico</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic relative z-10">
               La configuración del reloj en modo Sandbox es temporal y vive en tu caché local. Para guardar perfiles de entrenamiento personalizados y umbrales biométricos por cada atleta individual, es necesario el nodo Pro.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
