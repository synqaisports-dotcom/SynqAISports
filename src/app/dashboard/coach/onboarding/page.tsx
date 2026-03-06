
"use client";

import { useState } from "react";
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ChevronDown, 
  Fingerprint, 
  User,
  Zap,
  Building2,
  Cpu,
  Globe
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

const COUNTRIES = [
  { value: "ES", label: "España" },
  { value: "AR", label: "Argentina" },
  { value: "MX", label: "México" },
  { value: "CO", label: "Colombia" },
  { value: "CL", label: "Chile" },
  { value: "US", label: "USA" },
];

export default function OnboardingTunnel() {
  const { profile, completeOnboarding } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [clubName, setClubName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(profile?.country || "ES");
  const [loading, setLoading] = useState(false);

  const isFromPromo = !!profile?.claimedToken;

  const handleFinish = () => {
    if (!clubName) {
      toast({
        variant: "destructive",
        title: "ERROR_DE_PROTOCOLO",
        description: "Debe asignar una identidad al club para continuar.",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      completeOnboarding({ 
        name: clubName, 
        id: "club-" + Math.random().toString(36).substr(2, 9),
        country: selectedCountry
      });
      toast({
        title: "SINC_COMPLETA",
        description: `El nodo ${clubName} ha sido vinculado a su identidad en el sector ${selectedCountry}.`,
      });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#04070c] relative overflow-hidden flex">
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-12">
        <div className="w-full max-w-4xl space-y-12">
          
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Cpu className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Túnel de Vinculación de Nodo</span>
            </div>
            <h1 className="text-6xl font-headline font-black text-white italic tracking-tighter cyan-text-glow">
              GENERAR PERFIL DE CLUB
            </h1>
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.5em]">
              Sincronizando Identidad: {profile?.name.toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-stretch">
            {/* HERENCIA DE PLAN Y REGIÓN */}
            <div className="glass-panel p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                  <ShieldCheck className="h-32 w-32 text-primary" />
               </div>
               <div className="space-y-6 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center pulse-glow">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Protocolo de Plan</h3>
                      <p className="text-sm font-black text-white uppercase italic mt-1">{profile?.plan?.replace('_', ' ') || 'STANDARD_NODE'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Estado de Acceso</h3>
                      <p className="text-[10px] text-white/40 uppercase mt-1 leading-relaxed">
                        {isFromPromo 
                          ? "ACCESO_PRE_AUTORIZADO: Se han bloqueado los parámetros regionales según la campaña activa."
                          : "ACCESO_ORGÁNICO: Defina sus parámetros operativos manualmente."
                        }
                      </p>
                    </div>
                  </div>
               </div>
               <div className="pt-6 border-t border-white/5 space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Código de Seguridad</span>
                  <p className="font-mono text-emerald-400 text-xs tracking-widest">AUTH_TOKEN_0X{Math.random().toString(16).substr(2, 8).toUpperCase()}</p>
               </div>
            </div>

            {/* FORMULARIO DE CLUB */}
            <div className="glass-panel p-12 space-y-10 relative">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Nombre Oficial del Club</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                    <Input 
                      placeholder="EJ: FC BARCELONA ACADÈMIA"
                      value={clubName}
                      onChange={(e) => setClubName(e.target.value.toUpperCase())}
                      className="h-16 bg-white/5 border-primary/20 rounded-2xl pl-12 text-lg font-black italic tracking-tighter focus:border-primary transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Sector / País</label>
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
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Tipo de Entidad</label>
                    <Select defaultValue="elite">
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                        <SelectItem value="elite" className="text-[10px] font-black uppercase">Academia de Élite</SelectItem>
                        <SelectItem value="pro" className="text-[10px] font-black uppercase">Club Profesional</SelectItem>
                        <SelectItem value="grassroots" className="text-[10px] font-black uppercase">Fútbol Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleFinish}
                disabled={loading}
                className="w-full h-20 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl cyan-glow hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] border-none"
              >
                {loading ? "SINC_OPERATIVA..." : "FINALIZAR_VINCULACIÓN_NODO"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
