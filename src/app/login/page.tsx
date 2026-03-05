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
        title: "AUTH_ERROR",
        description: error.message,
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
        title: "OAUTH_FAILED",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md border border-white/10 bg-black/60 backdrop-blur-2xl rounded-none relative z-10 overflow-hidden">
        <div className="h-1 bg-primary cyan-glow" />
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="inline-flex justify-center mb-6">
            <div className="p-3 border border-primary/40 bg-primary/5 rounded-sm rotate-45 cyan-glow">
              <Database className="h-8 w-8 text-primary -rotate-45" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-black text-white tracking-[0.2em]">ACCESS_TERMINAL</CardTitle>
          <CardDescription className="uppercase text-[10px] tracking-widest text-white/40 mt-2">Authorization required for club access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-12 px-10">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Identity_ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="USER@SYNQSPORTS.PRO"
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-none focus:border-primary focus:ring-0 text-white placeholder:text-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Secure_Token</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-white/5 border-white/10 rounded-none focus:border-primary focus:ring-0 text-white placeholder:text-white/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-none transition-all active:scale-95 cyan-glow flex gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>AUTHENTICATE <Zap className="h-4 w-4 fill-current" /></>}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5"></span>
            </div>
            <div className="relative flex justify-center text-[8px] uppercase tracking-[0.4em]">
              <span className="bg-black/40 px-4 text-white/20">External_Bypass</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-12 border-white/10 rounded-none text-white/60 hover:bg-white/5 hover:text-white transition-all font-bold tracking-widest text-xs"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            GOOGLE_SECURE_AUTH
          </Button>

          <div className="flex items-center gap-2 justify-center text-[8px] text-white/20 uppercase tracking-widest">
            <ShieldAlert className="h-3 w-3" /> Encrypted Connection via Firebase v11
          </div>
        </CardContent>
      </Card>
    </div>
  );
}