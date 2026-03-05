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
import { Zap, Database, Loader2, Chrome, ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
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
      console.error("AUTH_ERROR:", error.code, error.message);
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
    setApiError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      prompt: 'select_account',
      client_id: '116171513626-elfpqoqa7apefapulnnp9ajrctlv0e5k.apps.googleusercontent.com'
    });
    
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("GOOGLE_OAUTH_ERROR:", error.code, error.message);
      
      let errorTitle = "FALLO_OAUTH";
      let errorMsg = "Sincronización interrumpida.";
      
      if (error.message.includes("identitytoolkit.googleapis.com") || error.code === 'auth/operation-not-allowed') {
        setApiError("https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=659509021859");
        errorTitle = "API_BLOQUEADA";
        errorMsg = "La API de Identidad no está activa en tu consola.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = "Bloqueador de ventanas detectado.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = "Terminal cerrado por el usuario.";
      }
      
      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMsg,
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
            {isRegistering ? "NUEVA_IDENTIDAD" : "TERMINAL_ACCESO"}
          </CardTitle>
          <CardDescription className="uppercase text-[10px] tracking-[0.2em] text-white/40 mt-4 font-bold">
            {isRegistering ? "Inicializando secuencia de registro" : "Sincronización requerida"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pb-14 px-[10%]">
          
          {apiError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 animate-pulse">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-xs font-black uppercase tracking-widest">ERROR_DE_PROTOCOLO</AlertTitle>
              <AlertDescription className="text-[10px] uppercase leading-relaxed mt-2">
                Debes activar la API en tu consola de Google para permitir el acceso por Google.
                <a 
                  href={apiError} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1 text-primary hover:underline font-black"
                >
                  ACTIVAR_API_AHORA <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="w-full h-14 border-primary/30 rounded-none text-primary hover:bg-primary/10 hover:border-primary transition-all font-black tracking-[0.2em] text-xs bg-transparent flex gap-3 uppercase"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Chrome className="h-4 w-4" /> ACCESO_GOOGLE
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.5em] font-black">
              <span className="bg-[#0b0e14] px-4 text-white/20">O PROTOCOLO MANUAL</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">EMAIL_USUARIO</label>
              <Input
                type="email"
                placeholder="usuario@synqsports.pro"
                className="h-14 bg-white border-none rounded-none text-black placeholder:text-black/30 text-sm font-bold"
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
                className="h-14 bg-white border-none rounded-none text-black placeholder:text-black/30 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              className="w-full h-14 bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-none transition-all active:scale-95 cyan-glow flex gap-3 text-sm tracking-widest uppercase"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  {isRegistering ? "REGISTRAR" : "VALIDAR"} 
                  <Zap className="h-4 w-4 fill-current" />
                </>
              )}
            </Button>
          </form>

          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-[9px] text-white/40 hover:text-primary transition-colors font-bold uppercase tracking-[0.2em]"
          >
            {isRegistering ? "<< Volver al Terminal" : "¿Nuevo Usuario? Registrar Identidad >>"}
          </button>

          <div className="flex items-center gap-2 justify-center text-[9px] text-white/20 uppercase tracking-[0.3em] font-black pt-2">
            <ShieldAlert className="h-3.5 w-3.5" /> ENCRIPTACIÓN_ACTIVA
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
