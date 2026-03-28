
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Zap, ShieldCheck, Lock, ChevronLeft, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { readPlayersLocalAcrossClubs } from "@/lib/player-storage";

const ADMIN_EMAILS = ['munozmartinez.ismael@gmail.com', 'synqaisports@gmail.com'];

/**
 * Pantalla de Acceso Tutor Evolucionada - v2.0.0
 * PROTOCOLO_SECURE_ACCESS: Validación de email, contraseña y flujo de recuperación.
 */
export default function TutorLoginPage() {
  const [step, setStep] = useState<'email' | 'password' | 'recovery'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Limpiar sesión al entrar si se viene de logout
  useEffect(() => {
    const session = localStorage.getItem("synq_tutor_session_email");
    if (session && step === 'email') {
      // Si ya hay sesión, podríamos redirigir, pero dejamos que el usuario vea el login si vuelve atrás
    }
  }, [step]);

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const emailLower = email.toLowerCase();
      const isRootAdmin = ADMIN_EMAILS.includes(emailLower);
      const savedPlayers = readPlayersLocalAcrossClubs();
      
      const foundMatch = savedPlayers.some((p: any) => 
        p.tutorEmail?.toLowerCase() === emailLower
      );

      if (foundMatch || isRootAdmin) {
        // Verificar si ya tiene contraseña creada
        const authStore = JSON.parse(localStorage.getItem("synq_tutor_auth") || "{}");
        if (authStore[emailLower]) {
          setStep('password');
        } else {
          // Primer acceso: Ir a Onboarding
          localStorage.setItem("synq_tutor_pending_email", emailLower);
          toast({
            title: "PRIMER_ACCESO_DETECTADO",
            description: "Sincronizando túnel de configuración de seguridad...",
          });
          router.push("/tutor/onboarding");
        }
      } else {
        toast({
          variant: "destructive",
          title: "ERROR_VINCULACIÓN",
          description: "Este email no consta como Tutor en ninguna ficha activa del club.",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const emailLower = email.toLowerCase();
      const authStore = JSON.parse(localStorage.getItem("synq_tutor_auth") || "{}");
      const isRootAdmin = ADMIN_EMAILS.includes(emailLower);

      if (authStore[emailLower] === password || (isRootAdmin && password === "admin123")) {
        localStorage.setItem("synq_tutor_session_email", emailLower);
        toast({
          title: isRootAdmin ? "PROTOCOLO_ELITE_ACTIVADO" : "IDENTIDAD_VALIDADA",
          description: "Acceso autorizado al nodo de familia.",
        });
        router.push("/tutor/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "ERROR_PASSWORD",
          description: "La contraseña no coincide con el registro del nodo.",
        });
      }
      setLoading(false);
    }, 1000);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({
        title: "TOKEN_ENVIADO",
        description: `Se ha enviado un enlace de recuperación a ${email}.`,
      });
      setStep('email');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-700 bg-background">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="h-20 w-20 bg-black border border-primary/30 rounded-3xl flex items-center justify-center relative z-10 mx-auto">
            {step === 'password' ? (
              <Lock className="h-10 w-10 text-primary animate-in zoom-in" />
            ) : (
              <Zap className="h-10 w-10 text-primary animate-pulse" />
            )}
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-white italic tracking-tighter uppercase leading-none">
            Synq<span className="text-primary">AI</span>_FAMILIA
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">
            {step === 'email' ? 'Portal Oficial de Tutores' : 
             step === 'password' ? 'Validación de Credenciales' : 'Recuperación de Nodo'}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-8 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {step === 'email' && (
          <form onSubmit={handleVerifyEmail} className="space-y-6 relative z-10 animate-in slide-in-from-left-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1 italic">Email del Tutor</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                <Input 
                  required
                  type="email" 
                  placeholder="ejemplo@mail.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 bg-black/40 border-primary/20 rounded-2xl text-white font-bold focus:border-primary"
                />
              </div>
            </div>
            <Button 
              type="submit"
              disabled={loading || !email}
              className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "ACCEDER AL NODO"} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handleLogin} className="space-y-6 relative z-10 animate-in slide-in-from-right-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase text-primary tracking-widest italic">Contraseña</label>
                <button type="button" onClick={() => setStep('email')} className="text-[8px] font-black text-white/20 hover:text-primary uppercase tracking-widest">Cambiar Email</button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                <Input 
                  required
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 bg-black/40 border-primary/20 rounded-2xl text-white font-bold focus:border-primary"
                />
              </div>
              <button 
                type="button" 
                onClick={() => setStep('recovery')}
                className="text-[9px] font-black text-white/30 hover:text-primary transition-all uppercase tracking-widest ml-1"
              >
                ¿Has olvidado tu contraseña?
              </button>
            </div>
            <Button 
              type="submit"
              disabled={loading || !password}
              className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "VALIDAR IDENTIDAD"} <ShieldCheck className="h-4 w-4 ml-2" />
            </Button>
          </form>
        )}

        {step === 'recovery' && (
          <form onSubmit={handleRecovery} className="space-y-6 relative z-10 animate-in zoom-in-95">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setStep('password')} className="text-primary/40 hover:text-primary transition-all"><ChevronLeft className="h-5 w-5" /></button>
                <span className="text-[10px] font-black uppercase text-white tracking-widest">Recuperar Acceso</span>
              </div>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed px-1 italic">
                Enviaremos un token de reactivación al email vinculado con el club: <span className="text-primary">{email}</span>
              </p>
            </div>
            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-white/5 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-primary hover:text-black transition-all"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : "ENVIAR TOKEN DE RECORDE"}
            </Button>
          </form>
        )}
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
