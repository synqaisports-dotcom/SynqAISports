"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, Loader2, Chrome, Terminal, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { loginAsGuest, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleBypass = () => {
    setLoading(true);
    loginAsGuest();
    toast({
      title: "PROTOCOLO_BYPASS_INICIADO",
      description: "Accediendo como Administrador de Élite (Bypass Local).",
    });
    // Forzamos navegación física para asegurar que el contexto se refresque
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "IDENTIDAD_CREADA",
          description: "Bienvenido al sector operativo de SynqSports.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("AUTH_ERROR:", error.code);
      setErrorStatus(error.code);
      toast({
        variant: "destructive",
        title: "FALLO_DE_SISTEMA",
        description: "Error de validación. Verifique credenciales.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorStatus(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("GOOGLE_OAUTH_ERROR:", error.code, error.message);
      setErrorStatus(error.code);
      
      toast({
        variant: "destructive",
        title: "FALLO_SINCRO",
        description: "Error en configuración de Google Cloud.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a0f] px-[5%] relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03),transparent_70%)]" />
      
      <Card className="w-full max-w-md border border-white/10 bg-black/40 backdrop-blur-2xl rounded-none relative z-10 overflow-hidden shadow-2xl border-t-2 border-t-primary">
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="inline-flex justify-center mb-8">
            <div className="p-4 border border-primary/40 bg-primary/5 rounded-sm rotate-45 cyan-glow">
              <Database className="h-8 w-8 text-primary -rotate-45" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-black text-white tracking-[0.3em] uppercase">
            TERMINAL_ACCESO
          </CardTitle>
          <CardDescription className="uppercase text-[10px] tracking-[0.2em] text-white/40 mt-4 font-bold">
            Sincronización de Identidad Requerida
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-14 px-[10%]">
          
          {errorStatus && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Alert variant="destructive" className="bg-primary/10 border-primary/50 rounded-none border-l-4">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <AlertTitle className="text-xs font-black uppercase tracking-widest mb-2 text-primary">BLOQUEO_DETECTADO: {errorStatus}</AlertTitle>
                <AlertDescription className="text-[10px] uppercase leading-relaxed text-white/60">
                  Fallo de configuración en Google Cloud/Firebase. Pulsa el botón de abajo para entrar inmediatamente por la puerta trasera.
                </AlertDescription>
              </Alert>

              {(errorStatus.includes('api-has-not-been-used') || errorStatus.includes('requests-to-this-api')) && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(`https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=659509021859`, '_blank')}
                  className="w-full h-10 border-white/20 text-white/60 text-[9px] uppercase tracking-widest"
                >
                  <ExternalLink className="h-3 w-3 mr-2" /> Habilitar API en Google Cloud
                </Button>
              )}

              <Button 
                onClick={handleBypass}
                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-none transition-all flex gap-3 text-xs tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(0,255,255,0.3)]"
              >
                <Terminal className="h-4 w-4" /> FORZAR_ACCESO_DASHBOARD
              </Button>
            </div>
          )}

          {!errorStatus && (
            <Button
              variant="outline"
              className="w-full h-14 border-primary/30 rounded-none text-primary hover:bg-primary/10 hover:border-primary transition-all font-black tracking-[0.2em] text-xs bg-transparent flex gap-3 uppercase"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Chrome className="h-4 w-4" />} 
              ACCESO_GOOGLE_SINCRO
            </Button>
          )}

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.5em] font-black">
              <span className="bg-[#0b0e14] px-4 text-white/20">O PROTOCOLO MANUAL</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">EMAIL_USUARIO</label>
              <Input
                type="email"
                placeholder="usuario@synqsports.pro"
                className="h-12 bg-white border-none rounded-none text-black placeholder:text-black/30 text-sm font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">CONTRASEÑA_ACCESO</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-12 bg-white border-none rounded-none text-black placeholder:text-black/30 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-none transition-all active:scale-95 cyan-glow flex gap-3 text-xs tracking-widest uppercase"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "VALIDAR_CREDENCIALES"}
            </Button>
          </form>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[9px] text-white/40 hover:text-primary transition-colors font-bold uppercase tracking-[0.2em]"
            >
              {isRegistering ? "<< Volver al Terminal" : "¿Nuevo Usuario? Registrar Identidad >>"}
            </button>
            
            <button 
              type="button"
              onClick={handleBypass}
              className="text-[10px] text-primary hover:bg-primary/10 transition-all font-black uppercase tracking-[0.3em] border-2 border-primary/40 py-4 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
            >
              {loading ? "SINCRONIZANDO..." : ">> FORZAR_ACCESO_INMEDIATO (MODO_DEV) <<"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
