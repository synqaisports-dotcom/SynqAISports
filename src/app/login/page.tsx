
"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  QrCode, 
  Key, 
  Mail, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  UserPlus,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  ChevronLeft,
  UserCircle,
  Building2,
  LockKeyhole,
  Dumbbell,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function LoginContent() {
  const [localLoading, setLocalLoading] = useState(false);
  const [forceStandard, setForceStandard] = useState(false);
  const [regStep, setRegStep] = useState<'choice' | 'form'>('choice');
  const [regType, setRegType] = useState<'free' | 'enterprise_scale'>('free');
  
  const { profile, loginAsGuest, loginWithToken, register, login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [campaignData, setCampaignData] = useState<any>(null);
  const trackSentForToken = useRef<string | null>(null);

  // Form states
  const [regData, setRegData] = useState({ name: "", email: "", pass: "", club: "" });
  const [loginData, setLoginData] = useState({ email: "", pass: "" });

  useEffect(() => {
    if (profile) {
      if (profile.role === "superadmin") {
        router.push("/admin-global");
      } else if (profile.clubCreated) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard/coach/onboarding");
      }
    }
  }, [profile, router]);

  useEffect(() => {
    const t = searchParamsHook.get("token") || searchParamsHook.get("t");
    if (t && !forceStandard) {
      setToken(t);
      setCampaignData({
        plan: "Enterprise Scale",
        price: "Cuota al club (B2B) — ver condiciones en tu nodo",
        region: "Argentina",
        countryCode: "AR",
        limit: "10 primeros",
      });
      if (trackSentForToken.current !== t) {
        trackSentForToken.current = t;
        void fetch("/api/promo/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        }).catch(() => {});
      }
      toast({
        title: "INVITACIÓN_DETECTADA",
        description: `Sincronizando campaña regional: ${t}`,
      });
    }
  }, [searchParamsHook, toast, forceStandard]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await register(regData.email, regData.pass, regData.name, regData.club, regType);
      toast({ title: "CUENTA_CREADA", description: "Bienvenido a la red SynqAI. Sincronizando terminal..." });
    } catch (err) {
      toast({ variant: "destructive", title: "FALLO_SINCRO", description: "No se pudo crear el nodo de usuario." });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await login(loginData.email, loginData.pass);
      toast({ title: "IDENTIDAD_VALIDADA", description: "Acceso autorizado al núcleo central." });
    } catch (err) {
      toast({ variant: "destructive", title: "ERROR_AUTH", description: "Credenciales no reconocidas en la red." });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleClaimToken = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    loginWithToken(token!, campaignData.plan, campaignData.countryCode);
    toast({ title: "VINCULACIÓN_INICIADA", description: "Accediendo al túnel de onboarding del club." });
    router.push("/dashboard/coach/onboarding");
  };

  if (token && campaignData && !forceStandard) {
    return (
      <Card className="w-full max-w-xl glass-panel shadow-2xl relative z-10 overflow-hidden border-t-2 border-primary animate-in fade-in zoom-in-95 duration-500 rounded-3xl">
        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="h-24 w-24 text-primary" /></div>
        <CardHeader className="pt-12 pb-8 text-center">
          <Badge className="mx-auto mb-4 bg-primary text-black font-black px-4 py-1 rounded-2xl tracking-[0.3em] italic">INVITACIÓN_ACTIVA</Badge>
          <CardTitle className="text-4xl font-headline font-black text-white tracking-tighter uppercase italic">CLAIM_YOUR_NODE</CardTitle>
          <CardDescription className="uppercase text-[9px] tracking-[0.5em] text-white/30 mt-4 font-bold italic">Campaña: {token} • {campaignData.region}</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-12 space-y-8">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-4">
            <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">Protocolo de Plan</span><span className="text-xs font-black text-primary italic uppercase">{campaignData.plan}</span></div>
            <div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">País Vinculado</span><span className="text-xs font-black text-white uppercase">{campaignData.region}</span></div>
          </div>
          <form onSubmit={handleClaimToken} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">NOMBRE_DEL_ADMINISTRADOR</label><Input required placeholder="SU NOMBRE" className="h-14 bg-white/5 border-primary/20 rounded-2xl text-white font-bold uppercase focus:border-primary" /></div>
              <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">MAIL_ACCESO</label><Input required type="email" placeholder="MAIL@CLUB.COM" className="h-14 bg-white/5 border-primary/20 rounded-2xl text-white font-bold uppercase focus:border-primary" /></div>
            </div>
            <Button type="submit" disabled={localLoading} className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl cyan-glow hover:scale-[1.01] transition-all border-none">{localLoading ? "CONFIGURANDO_NODO..." : "ACTIVAR_MI_NODO_DE_CLUB"} <ArrowRight className="h-4 w-4 ml-2" /></Button>
          </form>
          <button onClick={() => setForceStandard(true)} className="text-[9px] text-white/40 hover:text-white transition-all font-black uppercase tracking-[0.3em] flex items-center gap-2 italic mx-auto"><ChevronLeft className="h-3 w-3" /> Ignorar invitación</button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <Card className="glass-panel shadow-2xl relative z-10 overflow-hidden border-t-2 border-t-primary rounded-3xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Zap className="h-32 w-32 text-primary" /></div>
        <CardHeader className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse" />
              <div className="relative p-5 border border-primary/40 bg-black/60 rounded-xl rotate-45 cyan-glow">
                <Database className="h-10 w-10 text-primary -rotate-45" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-black text-white tracking-[0.2em] uppercase italic">Synq<span className="text-primary cyan-text-glow">AI</span>_ACCESS</CardTitle>
          <CardDescription className="uppercase text-[9px] tracking-[0.5em] text-white/30 mt-4 font-bold italic">Sincronización de Identidad de Cantera</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-12">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 h-14 rounded-2xl border border-white/5 p-1 mb-8">
              <TabsTrigger value="login" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black italic">LOGIN</TabsTrigger>
              <TabsTrigger value="register" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black italic">REGISTRAR</TabsTrigger>
              <TabsTrigger value="qr" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black italic">NODO_QR</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">EMAIL_PROFESIONAL</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-4 w-4 text-primary/40" />
                    <Input required type="email" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} placeholder="USER@CLUB.COM" className="h-12 pl-12 bg-white/5 border-primary/20 rounded-2xl text-white font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">CLAVE_ACCESO</label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-4 h-4 w-4 text-primary/40" />
                    <Input required type="password" value={loginData.pass} onChange={e => setLoginData({...loginData, pass: e.target.value})} placeholder="••••••••" className="h-12 pl-12 bg-white/5 border-primary/20 rounded-2xl text-white font-bold" />
                  </div>
                </div>
                <Button type="submit" disabled={localLoading} className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl cyan-glow border-none transition-all active:scale-95">ACCEDER_A_MI_NODO <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              {regStep === 'choice' ? (
                <div className="grid grid-cols-1 gap-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => { setRegType('free'); setRegStep('form'); }}
                    className="p-8 bg-primary/5 border-2 border-primary/20 rounded-[2rem] group hover:border-primary transition-all text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Zap className="h-20 w-20 text-primary" /></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Dumbbell className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-xs font-black text-white uppercase italic tracking-widest">Soy un Entrenador</span>
                    </div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">ENTRADA_SANDBOX</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-relaxed italic">
                      Acceso gratuito a pizarras tácticas, gestión de equipo local y estadísticas. Ideal para el barro del campo.
                    </p>
                  </button>

                  <button 
                    onClick={() => { setRegType('enterprise_scale'); setRegStep('form'); }}
                    className="p-8 bg-white/5 border-2 border-white/5 rounded-[2rem] group hover:border-primary/40 transition-all text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Building2 className="h-20 w-20 text-white" /></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-xs font-black text-white/60 uppercase italic tracking-widest">Soy un Club</span>
                    </div>
                    <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">REGISTRO_PRO</h4>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed italic">
                      Digitaliza tu cantera. Neural Planner IA, gestión de staff, portal de padres y control de instalaciones.
                    </p>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <button type="button" onClick={() => setRegStep('choice')} className="text-primary/40 hover:text-primary transition-all"><ChevronLeft className="h-5 w-5" /></button>
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest italic">
                      {regType === 'free' ? 'MODO_SANDBOX_LIGHT' : 'PROTOCOLO_CLUB_PRO'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">TU_NOMBRE</label><Input required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value.toUpperCase()})} placeholder="MARC" className="h-12 bg-white/5 border-primary/20 rounded-2xl font-bold" /></div>
                    <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">{regType === 'free' ? 'TU_EQUIPO' : 'TU_CANTERA'}</label><Input required value={regData.club} onChange={e => setRegData({...regData, club: e.target.value.toUpperCase()})} placeholder={regType === 'free' ? "MI EQUIPO" : "CLUB_CITY"} className="h-12 bg-white/5 border-primary/20 rounded-2xl font-bold" /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">EMAIL_PROFESIONAL_OBLIGATORIO</label><Input required type="email" value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} placeholder="USER@CLUB.COM" className="h-12 bg-white/5 border-primary/20 rounded-2xl font-bold" /></div>
                  <div className="space-y-2"><label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1 italic">NUEVA_CLAVE</label><Input required type="password" value={regData.pass} onChange={e => setRegData({...regData, pass: e.target.value})} placeholder="••••••••" className="h-12 bg-white/5 border-primary/20 rounded-2xl text-white font-bold" /></div>
                  <Button type="submit" disabled={localLoading} className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs rounded-2xl cyan-glow border-none transition-all active:scale-95">
                    {regType === 'free' ? 'ACTIVAR_MI_SANDBOX' : 'VINCULAR_MI_CLUB'} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="qr" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center py-6 space-y-6 border border-dashed border-primary/20 bg-primary/5 rounded-3xl">
                <QrCode className="h-24 w-24 text-primary" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Escanee su código de nodo para vinculación express</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={() => { loginAsGuest(); }}
          className="text-[9px] font-black text-white/20 hover:text-primary transition-all uppercase tracking-[0.5em] italic flex items-center gap-2 group"
        >
          <Key className="h-3 w-3 group-hover:animate-pulse" /> Terminal de Fundadores
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <Suspense fallback={<div className="text-primary font-black uppercase tracking-[1em] animate-pulse italic">Sincronizando_Nodo...</div>}><LoginContent /></Suspense>
    </div>
  );
}
