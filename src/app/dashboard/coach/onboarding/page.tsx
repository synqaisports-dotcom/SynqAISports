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
  Cpu
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

export default function OnboardingTunnel() {
  const { profile, completeOnboarding } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(false);

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
      completeOnboarding({ name: clubName, id: "club-" + Math.random().toString(36).substr(2, 9) });
      toast({
        title: "SINC_COMPLETA",
        description: `El nodo ${clubName} ha sido vinculado a su identidad.`,
      });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#04070c] relative overflow-hidden flex">
      {/* FUTURISTIC GRID OVERLAY */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* SIDEBAR (INACTIVE VISUAL) */}
      <aside className="w-64 border-r border-white/5 bg-black/40 flex flex-col p-6 opacity-20 grayscale pointer-events-none z-20">
        <div className="flex items-center gap-3 mb-12">
           <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center">
             <Zap className="h-4 w-4 text-primary" />
           </div>
           <span className="font-headline font-black text-white italic tracking-tighter">SYNQAI Coach</span>
        </div>
        <nav className="space-y-4 flex-1">
          {['Dashboard', 'Plantilla', 'Tácticas', 'Informes'].map(item => (
            <div key={item} className="flex items-center gap-3 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              <div className="w-1 h-1 rounded-full bg-white/10" />
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
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
            <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.5em]">Identidad Única para UID: {profile?.email.split('@')[0].toUpperCase()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 items-stretch">
            {/* SECURITY STATUS */}
            <div className="glass-panel p-10 flex flex-col justify-center space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                  <ShieldCheck className="h-32 w-32 text-primary" />
               </div>
               <div className="space-y-4 relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center pulse-glow">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Estado: Validando Identidad</h3>
                    <p className="text-[10px] text-white/40 uppercase mt-2 leading-relaxed">
                      Este proceso vinculará su cuenta de forma irreversible como Administrador Fundador del nuevo nodo de club.
                    </p>
                  </div>
               </div>
               <div className="pt-6 border-t border-white/5 space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Código de Seguridad</span>
                  <p className="font-mono text-emerald-400 text-xs tracking-widest">AUTH_TOKEN_0X{Math.random().toString(16).substr(2, 8).toUpperCase()}</p>
               </div>
            </div>

            {/* CLUB FORM */}
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

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 ml-1">Sector Operativo</label>
                  <Select defaultValue="elite">
                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl text-white/40 font-bold uppercase tracking-widest px-6">
                      <SelectValue placeholder="SELECCIONAR CATEGORÍA..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-2xl">
                      <SelectItem value="elite">Academia de Élite</SelectItem>
                      <SelectItem value="pro">Club Profesional</SelectItem>
                      <SelectItem value="grassroots">Fútbol Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleFinish}
                disabled={loading}
                className="w-full h-16 bg-primary text-black font-black text-xs uppercase tracking-[0.4em] rounded-2xl cyan-glow hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? "SINCRONIZANDO..." : "VINCULAR_NODO_AL_SISTEMA"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
