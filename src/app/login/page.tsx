"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { loginAsGuest } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleBypass = () => {
    setLoading(true);
    loginAsGuest();
    toast({
      title: "ACCESO_AUTORIZADO",
      description: "Sincronizando con el nodo central...",
    });
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070a0f] px-6 relative overflow-hidden font-body">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.05),transparent_70%)]" />
      
      <Card className="w-full max-w-xl glass-panel shadow-2xl relative z-10 overflow-hidden border-t-2 border-t-primary">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="h-32 w-32 text-primary" />
        </div>

        <CardHeader className="pt-12 pb-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse" />
              <div className="relative p-5 border border-primary/40 bg-black/60 rounded-sm rotate-45 cyan-glow">
                <Database className="h-10 w-10 text-primary -rotate-45" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-headline font-black text-white tracking-[0.2em] uppercase italic">
            Synq<span className="text-primary cyan-text-glow">AI</span>_ACCESS
          </CardTitle>
          <CardDescription className="uppercase text-[9px] tracking-[0.5em] text-white/30 mt-4 font-bold">
            Protocolo de Identidad y Sincronización
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-12">
          <Tabs defaultValue="activation" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/40 h-14 rounded-none border border-white/5 p-1 mb-8">
              <TabsTrigger 
                value="activation" 
                className="rounded-none font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
              >
                <Key className="h-3 w-3 mr-2" /> Código Activación
              </TabsTrigger>
              <TabsTrigger 
                value="qr" 
                className="rounded-none font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
              >
                <QrCode className="h-3 w-3 mr-2" /> Escaneo de Nodo
              </TabsTrigger>
            </TabsList>

            {/* FORMULARIO DE ALTA CON CÓDIGO */}
            <TabsContent value="activation" className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">NOMBRE_USUARIO</label>
                    <Input placeholder="EJ. MARC" className="h-12 bg-white/5 border-white/10 rounded-none text-white font-bold uppercase placeholder:text-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">MAIL_ACCESO</label>
                    <Input type="email" placeholder="USER@SYNQ.PRO" className="h-12 bg-white/5 border-white/10 rounded-none text-white font-bold uppercase placeholder:text-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">CÓDIGO_DE_ACTIVACIÓN</label>
                  <Input placeholder="XXXX-XXXX-XXXX" className="h-12 bg-primary/5 border-primary/30 rounded-none text-xl font-headline font-black text-center tracking-[0.3em] text-primary cyan-text-glow placeholder:text-primary/10" />
                </div>
              </div>

              <Button 
                onClick={handleBypass}
                className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.3em] text-xs rounded-none cyan-glow hover:scale-[1.01] transition-all"
              >
                VINCULAR_IDENTIDAD <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </TabsContent>

            {/* SECCIÓN DE QR / PROMO */}
            <TabsContent value="qr" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col items-center py-6 space-y-6 border border-dashed border-primary/20 bg-primary/5">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
                  <QrCode className="h-24 w-24 text-primary relative" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">ESCANEA TU CÓDIGO_NODO</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-white/40">Sincronización automática de Plan y Promo</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1 text-center block w-full">O INTRODUCE CÓDIGO_PROMOCIONAL</label>
                <Input placeholder="PROMO_CODE_2024" className="h-12 bg-white/5 border-white/10 rounded-none text-white font-bold text-center uppercase tracking-widest" />
              </div>

              <Button 
                onClick={handleBypass}
                className="w-full h-16 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-xs rounded-none hover:bg-white/10 transition-all"
              >
                SINCRONIZAR_NODO
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary opacity-50" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">Seguridad por Encriptación de Nodo Activa</span>
            </div>
            
            <button 
              onClick={handleBypass}
              className="text-[9px] text-primary/40 hover:text-primary transition-all font-black uppercase tracking-[0.3em] border border-primary/20 px-8 py-3 hover:bg-primary/5"
            >
              [ BYPASS_ADMIN_SISTEMA_DEV ]
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
