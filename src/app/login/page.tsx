
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Mail, Lock, Loader2, Database, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "FALLO_DE_AUTENTICACIÓN",
        description: "Credenciales no válidas en la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "FALLO_OAUTH",
        description: "El bypass de Google ha sido rechazado.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decoración de Fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]" />
      
      <Card className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-2xl rounded-none relative z-10 overflow-hidden shadow-2xl">
        <div className="h-1 bg-primary cyan-glow" />
        <CardHeader className="pt-12 pb-6 text-center">
          <div className="inline-flex justify-center mb-8">
            <div className="p-4 border border-primary/40 bg-primary/5 rounded-sm rotate-45 cyan-glow">
              <Database className="h-8 w-8 text-primary -rotate-45" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-black text-white tracking-[0.3em]">TERMINAL_DE_ACCESO</CardTitle>
          <CardDescription className="uppercase text-[10px] tracking-[0.2em] text-white/40 mt-4">Autorización requerida para acceso al club</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pb-14 px-12">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">ID_IDENTIDAD</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="USUARIO@SYNQSPORTS.PRO"
                  className="pl-10 h-14 bg-white/5 border-white/10 rounded-none focus:border-primary/50 focus:ring-0 text-white placeholder:text-white/10 text-sm tracking-wider"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary block">TOKEN_SEGURIDAD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-14 bg-white/5 border-white/10 rounded-none focus:border-primary/50 focus:ring-0 text-white placeholder:text-white/10 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              className="w-full h-14 bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-none transition-all active:scale-95 cyan-glow flex gap-3 text-sm tracking-widest"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>AUTENTICAR <Zap className="h-4 w-4 fill-current" /></>}
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.5em]">
              <span className="bg-[#070a0f] px-4 text-white/20">BYPASS_EXTERNO</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-14 border-white/10 rounded-none text-white/70 hover:bg-white/5 hover:text-white transition-all font-black tracking-[0.2em] text-xs bg-transparent"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            GOOGLE_SECURE_AUTH
          </Button>

          <div className="flex items-center gap-2 justify-center text-[9px] text-white/20 uppercase tracking-[0.3em] font-medium pt-2">
            <ShieldAlert className="h-3.5 w-3.5" /> CONEXIÓN CIFRADA VÍA FIREBASE
          </div>
        </CardContent>
      </Card>

      {/* Logo Decorativo Inferior Izquierda */}
      <div className="absolute bottom-8 left-8 flex items-center gap-3 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
        <div className="h-8 w-8 rounded-full border border-white flex items-center justify-center font-black text-xs text-white">N</div>
      </div>
    </div>
  );
}
