"use client";

import { useState, useEffect } from "react";
import { 
  Lock, 
  ShieldCheck, 
  ChevronDown, 
  Fingerprint, 
  Building2, 
  Cpu, 
  Globe,
  Loader2,
  CheckCircle2,
  Zap,
  Dumbbell,
  Users,
  ChevronLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function generateUuidV4(): string | null {
  if (typeof crypto === "undefined") return null;
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues !== "function") return null;

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const COUNTRIES = [
  { value: "ES", label: "España" },
  { value: "AR", label: "Argentina" },
  { value: "MX", label: "México" },
  { value: "CO", label: "Colombia" },
  { value: "CL", label: "Chile" },
  { value: "US", label: "USA" },
];

const SPORTS = [
  { value: "Fútbol", label: "Fútbol" },
  { value: "Baloncesto", label: "Baloncesto" },
  { value: "Waterpolo", label: "Waterpolo" },
  { value: "Voleibol", label: "Voleibol" },
  { value: "Balonmano", label: "Balonmano" },
];

export default function OnboardingTunnel() {
  const { profile, completeOnboarding, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [clubName, setClubName] = useState(profile?.clubName || "");
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || "ES");
  const [selectedSport, setSelectedSport] = useState("Fútbol");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isFromPromo = !!profile?.claimedToken;
  const isSandbox = profile?.plan === 'free' || profile?.role === 'promo_coach';

  useEffect(() => {
    if (profile?.country) {
      setSelectedCountry(profile.country);
    }
    if (profile?.clubName) {
      setClubName(profile.clubName);
    }
  }, [profile]);

  const handleFinish = () => {
    if (!clubName) {
      toast({
        variant: "destructive",
        title: "ERROR_DE_PROTOCOLO",
        description: isSandbox ? "Debe asignar un nombre a su equipo local." : "Debe asignar una identidad al club para continuar.",
      });
      return;
    }
    setLoading(true);
    
    setTimeout(() => {
      // `clubs.id` y `profiles.club_id` deben ser UUID válidos para alinear con RLS/Supabase.
      const generatedClubId = generateUuidV4();
      if (!generatedClubId) {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "UUID_NO_DISPONIBLE",
          description: "No se pudo generar un identificador seguro del club en este dispositivo.",
        });
        return;
      }
      
      completeOnboarding({ 
        name: clubName, 
        id: generatedClubId,
        country: selectedCountry,
        sport: selectedSport
      });

      setSuccess(true);
      setLoading(false);

      toast({
        title: isSandbox ? "SANDBOX_LISTO" : "NODO_ACTIVADO",
        description: isSandbox ? `Bienvenido, Coach. Tu equipo "${clubName}" está listo.` : `El nodo ${clubName} ha sido vinculado con ID: ${generatedClubId}.`,
      });

      setTimeout(() => {
        router.push(isSandbox ? "/dashboard/promo/team" : "/dashboard/club");
      }, 2000);
    }, 2500);
  };

  const handleGoBack = () => {
    logout();
    router.push("/login");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
           <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/40 blur-3xl rounded-full animate-pulse" />
              <CheckCircle2 className="h-32 w-32 text-primary relative z-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-4xl font-headline font-black text-white italic tracking-tighter uppercase">{isSandbox ? 'ACCESO_AUTORIZADO' : 'NODO_ACTIVADO'}</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Sincronizando con la terminal de mado...</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* BOTÓN VOLVER */}
      <div className="fixed top-8 left-8 z-[100]">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="text-white/40 hover:text-primary font-black uppercase text-[10px] tracking-widest group border border-white/5 bg-black/20 rounded-xl px-4 h-10"
        >
          <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Volver al Acceso
        </Button>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-4xl space-y-12">
          
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
              <Cpu className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                {isSandbox ? 'Túnel de Entrada Sandbox (Light)' : 'Túnel de Vinculación de Nodo Pro'}
              </span>
            </div>
            <h1 className="text-6xl font-headline font-black text-white italic tracking-tighter cyan-text-glow leading-tight">
              {isSandbox ? 'IDENTIDAD_LOCAL' : 'GENERAR PERFIL DE CLUB'}
            </h1>
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.5em]">
              Sincronizando Identidad: {profile?.name.toUpperCase() || 'USUARIO_PENDIENTE'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-stretch">
            <div className="glass-panel p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                  <ShieldCheck className="h-32 w-32 text-primary" />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center pulse-glow">
                    {isSandbox ? <Dumbbell className="h-8 w-8 text-primary" /> : <Zap className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Protocolo de Plan</h3>
                      <p className="text-sm font-black text-white uppercase italic mt-1">{profile?.plan?.replace('_', ' ') || 'STANDARD_NODE'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Estado de Acceso</h3>
                      <p className="text-[10px] text-white/40 uppercase mt-1 leading-relaxed italic">
                        {isSandbox 
                          ? "ACCESO_SANDBOX: Dispone de slots limitados y pizarras con publicidad. Los datos se guardan localmente."
                          : isFromPromo 
                          ? "ACCESO_PRE_AUTORIZADO: Se han bloqueado los parámetros regionales según la campaña activa."
                          : "ACCESO_ORGÁNICO: Defina sus parámetros operativos manualmente."
                        }
                      </p>
                    </div>
                  </div>
               </div>
               {!isSandbox && (
                 <div className="pt-6 border-t border-white/5 space-y-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Token de Sincronización</span>
                    <p className="font-mono text-emerald-400 text-xs tracking-widest">
                      {loading ? "GENERANDO..." : `AUTH_CODE_0X${Math.random().toString(16).substr(2, 8).toUpperCase()}`}
                    </p>
                 </div>
               )}
            </div>

            <div className="glass-panel p-12 space-y-10 relative">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1 italic">
                    {isSandbox ? 'Nombre de tu Equipo Local' : 'Identidad de la Cantera (Nombre)'}
                  </label>
                  <div className="relative">
                    {isSandbox ? <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" /> : <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />}
                    <Input 
                      placeholder={isSandbox ? "EJ: RAYO VALLECANO" : "EJ: FC BARCELONA ACADÈMIA"}
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value.toUpperCase())}
                      className="h-16 bg-white/5 border-primary/20 rounded-2xl pl-12 text-lg font-black italic tracking-tighter focus:border-primary transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1 italic">Disciplina Deportiva</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest px-6">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-primary/40" />
                        <SelectValue placeholder="DEPORTE..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                      {SPORTS.map(s => (
                        <SelectItem key={s.value} value={s.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={cn("grid gap-6", isSandbox ? "grid-cols-1" : "grid-cols-2")}>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1 italic">Sector Operativo (País)</label>
                    <Select 
                      value={selectedCountry} 
                      onValueChange={setSelectedCountry}
                      disabled={isFromPromo}
                    >
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest px-6">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-primary/40" />
                          <SelectValue placeholder="PAÍS..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                        {COUNTRIES.map(c => (
                          <SelectItem key={c.value} value={c.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!isSandbox && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1 italic">Estructura de Entidad</label>
                      <Select defaultValue="grassroots">
                        <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest px-6">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                          <SelectItem value="elite" className="text-[10px] font-black uppercase">Academia de Élite</SelectItem>
                          <SelectItem value="pro" className="text-[10px] font-black uppercase">Club Profesional</SelectItem>
                          <SelectItem value="grassroots" className="text-[10px] font-black uppercase">Fútbol Base / Cantera</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleFinish}
                disabled={loading}
                className="w-full h-20 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl cyan-glow hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] border-none"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isSandbox ? "EMPEZAR_A_ENTRENAR_GRATIS" : "VINCULAR_CANTERA_A_LA_RED")}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
