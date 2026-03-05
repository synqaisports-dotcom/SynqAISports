"use client";

import { useState } from "react";
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
import { Zap, Database, Loader2, Chrome, ShieldAlert, AlertTriangle, ExternalLink, Key, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [apiErrorUrl, setApiErrorUrl] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { loginAsGuest } = useAuth();

  const handleBypass = () => {
    loginAsGuest();
    toast({
      title: "BYPASS_ACTIVADO",
      description: "Accediendo al sistema en modo emergencia.",
    });
    router.push("/dashboard");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiErrorUrl(null);
    setIsBlocked(false);
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
    setApiErrorUrl(null);
    setIsBlocked(false);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("DEBUG_OAUTH_CRITICAL:", error);
      
      const errorStr = error.message || "";
      
      if (errorStr.includes("identitytoolkit.googleapis.com") || error.code === 'auth/operation-not-allowed') {
        setApiErrorUrl("https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=659509021859");
      } else if (errorStr.includes("are-blocked") || error.code === 'auth/internal-error') {
        setIsBlocked(true);
      } else {
        toast({
          variant: "destructive",
          title: "FALLO_SINCRO",
          description: error.message || "Sincronización interrumpida.",
        });
      }
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
          
          {(apiErrorUrl || isBlocked) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <Alert variant="destructive" className="bg-primary/10 border-primary/50 rounded-none border-l-4">
                <ShieldAlert className="h-5 w-5 text-primary" />
                <AlertTitle className="text-xs font-black uppercase tracking-widest mb-2 text-primary">BLOQUEO_DE_NÚCLEO_DETECTADO</AlertTitle>
                <AlertDescription className="text-[10px] uppercase leading-relaxed text-white/60">
                  Google Cloud está bloqueando tu API Key. Mientras se propaga la solución, usa el acceso de emergencia:
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleBypass}
                className="w-full h-14 bg-white text-black hover:bg-white/90 font-black rounded-none transition-all flex gap-3 text-xs tracking-[0.2em] uppercase"
              >
                <Terminal className="h-4 w-4" /> FORZAR_ACCESO_DASHBOARD
              </Button>
            </div>
          )}

          {!apiErrorUrl && !isBlocked && (
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
            
            {/* Acceso de emergencia siempre visible en el pie si falla algo */}
            <button 
              type="button"
              onClick={handleBypass}
              className="text-[8px] text-primary/30 hover:text-primary transition-colors font-black uppercase tracking-[0.3em] border border-primary/10 py-2"
            >
              USAR_PROTOCOLO_EMERGENCIA_DEV
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
