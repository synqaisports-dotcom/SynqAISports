"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, Zap, Info, CheckCircle2, RefreshCw, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { upsertDocument } from "@/lib/local-db/database-service";
import { cn } from "@/lib/utils";

/**
 * Onboarding de Tutor - Primer Acceso - v1.0.0
 * PROTOCOLO_CREDENTIAL_SETUP: Establecimiento de clave de seguridad.
 */
export default function TutorOnboardingPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const pending = localStorage.getItem("synq_tutor_pending_email");
    if (!pending) {
      router.push("/tutor");
    } else {
      setEmail(pending);
    }
  }, [router]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "CONTRASEÑA_DÉBIL",
        description: "La clave debe tener al menos 6 caracteres para el cifrado del nodo.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "ERROR_SINCRO",
        description: "Las contraseñas no coinciden.",
      });
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      // Guardar credenciales en el almacén de seguridad local
      const authStore = JSON.parse(localStorage.getItem("synq_tutor_auth") || "{}");
      authStore[email] = password;
      localStorage.setItem("synq_tutor_auth", JSON.stringify(authStore));
      
      // Iniciar sesión
      localStorage.setItem("synq_tutor_session_email", email);
      void upsertDocument("tutor", "session", "current", { email });
      localStorage.removeItem("synq_tutor_pending_email");

      toast({
        title: "CREDENCIAL_GENERADA",
        description: "Tu nodo de seguridad ha sido activado correctamente.",
      });
      
      setLoading(false);
      router.push("/tutor/dashboard");
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-700 bg-background">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
          <div className="h-24 w-24 bg-black border-2 border-primary/40 rounded-[2rem] flex items-center justify-center relative z-10 mx-auto shadow-[0_0_50px_rgba(0,242,255,0.2)]">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-primary/20 bg-primary/5 mb-2">
            <Zap className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Security_Setup_Protocol</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">
            BIENVENIDO A <span className="text-primary">LA RED</span>
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Creación de Contraseña de Nodo</p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-10 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        <div className="relative z-10 space-y-2">
           <span className="text-[9px] font-black uppercase text-primary/40 tracking-widest ml-1 italic">Vínculo de Identidad</span>
           <div className="p-4 bg-black/40 border border-primary/20 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase italic truncate mr-4">{email}</span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[7px] font-black">VERIFICADO</Badge>
           </div>
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Nueva Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                <Input 
                  required
                  type={showPass ? "text" : "password"} 
                  placeholder="MÍNIMO 6 CARACTERES" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 pr-12 bg-black/40 border-primary/20 rounded-2xl text-white font-bold focus:border-primary placeholder:text-primary/10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-primary transition-[background-color,border-color,color,opacity,transform]"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">Confirmar Contraseña</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                <Input 
                  required
                  type={showPass ? "text" : "password"} 
                  placeholder="REPITA SU CLAVE" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-14 pl-12 bg-black/40 border-primary/20 rounded-2xl text-white font-bold focus:border-primary placeholder:text-primary/10"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full h-20 bg-primary text-black font-black uppercase text-xs tracking-[0.4em] rounded-2xl shadow-[0_0_40px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] border-none"
          >
            {loading ? <RefreshCw className="h-6 w-6 animate-spin" /> : "ACTIVAR MI CUENTA DE TUTOR"}
          </Button>
        </form>

        <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4 relative z-10">
           <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">Aviso de Seguridad</span>
           </div>
           <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic tracking-tight">
             Al activar tu cuenta, aceptas los protocolos de sincronización de datos de menores y la política de privacidad de la red SynqAI.
           </p>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={() => { localStorage.removeItem("synq_tutor_pending_email"); router.push("/tutor"); }} 
          className="text-[10px] font-black text-white/20 hover:text-primary transition-[background-color,border-color,color,opacity,transform] uppercase tracking-[0.3em] italic"
        >
          [ CANCELAR_Y_SALIR ]
        </button>
      </div>
    </div>
  );
}
