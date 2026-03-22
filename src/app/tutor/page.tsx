
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Zap, ShieldCheck, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com'];

/**
 * Pantalla de Acceso Tutor - v1.2.0
 * PROTOCOLO_ELITE: Bypass para administradores del sistema.
 */
export default function TutorLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    // Simulación de validación contra el "Cepo de Datos" de jugadores
    setTimeout(() => {
      const isRootAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      const savedPlayers = JSON.parse(localStorage.getItem("synq_players") || "[]");
      
      const foundMatch = savedPlayers.some((p: any) => 
        p.tutorEmail?.toLowerCase() === email.toLowerCase()
      );

      if (foundMatch || isRootAdmin) {
        localStorage.setItem("synq_tutor_session_email", email.toLowerCase());
        
        toast({
          title: isRootAdmin ? "PROTOCOLO_ELITE_ACTIVADO" : "IDENTIDAD_VINCULADA",
          description: isRootAdmin 
            ? "Acceso de autoridad raíz concedido. Sincronizando terminal de auditoría..."
            : "Acceso autorizado al nodo de familia. Sincronizando datos de atletas...",
        });
        router.push("/tutor/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "ERROR_VINCULACIÓN",
          description: "Este email no consta como Tutor en ninguna ficha activa del club. Verifique el dato con su coordinador.",
        });
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-700 bg-background">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="h-20 w-20 bg-black border border-primary/30 rounded-3xl flex items-center justify-center relative z-10 mx-auto">
            <Zap className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-white italic tracking-tighter uppercase">
            Synq<span className="text-primary">AI</span>_FAMILIA
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Portal Oficial de Tutores</p>
        </div>
      </div>

      <div className="w-full space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Email del Tutor</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
              <Input 
                type="email" 
                placeholder="ejemplo@mail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 bg-black/40 border-primary/20 rounded-2xl text-white font-bold focus:border-primary"
              />
            </div>
            <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest leading-relaxed">
              Use el email registrado en la inscripción del club.
            </p>
          </div>

          <Button 
            onClick={handleAccess}
            disabled={loading || !email}
            className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
          >
            {loading ? "SINCRO_DATA..." : "ACCEDER AL NODO"} <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="pt-12 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Protocolo de Privacidad GDPR Activo</span>
        </div>
        <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest max-w-[200px] leading-loose italic">
          Terminal exclusiva para tutores legales verificados por el club.
        </p>
      </div>
    </div>
  );
}
