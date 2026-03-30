
"use client";

import { 
  Zap, 
  Globe, 
  Monitor, 
  Watch, 
  UserCircle, 
  Key, 
  BrainCircuit, 
  Cpu, 
  Users, 
  LayoutDashboard,
  ArrowRight,
  Target,
  Heart,
  ChevronDown,
  Mail, 
  Building2,
  Send,
  Dumbbell,
  Trophy,
  QrCode,
  Smartphone,
  Download,
  RefreshCw,
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState, useCallback } from "react";

export default function SynqAiLandingPage() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "SOLICITUD_ENVIADA",
      description: "Su solicitud de alianza ha sido encriptada y enviada al Centro de Mando.",
    });
  };

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const externalAccessNodes = [
    { label: "Terminal Sandbox", icon: LayoutGrid, href: "/dashboard/promo/team", desc: "Nodo personal gratis" },
    { label: "Portal Tutores", icon: UserCircle, href: "/tutor", desc: "Acceso familias" },
    { label: "Smartwatch Link", icon: Watch, href: "/smartwatch", desc: "Telemetría en vivo" },
  ];

  const menuItems = [
    { label: 'Ecosistema', id: 'ecosistema' },
    { label: 'Misión', id: 'mision' },
    { label: 'Multideporte', id: 'multideporte' },
    { label: 'Contacto', id: 'contacto' },
  ];

  return (
    <div className="min-h-screen bg-background text-white font-body selection:bg-primary/30 selection:text-white">
      {/* CAPA TÉCNICA DE FONDO */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)] pointer-events-none" />
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-[100] w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-primary p-1.5 rounded-lg cyan-glow">
                <Zap className="h-5 w-5 text-black" />
             </div>
             <span className="font-headline font-black text-2xl tracking-tighter uppercase italic">
                Synq<span className="text-primary">AI</span>
             </span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => scrollToSection(item.id)}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button className="bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-none h-10 px-6 hover:bg-primary hover:text-black transition-[background-color,border-color,color,opacity,transform]" asChild>
            <Link href="/login">Acceso Terminal</Link>
          </Button>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 px-6">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-10 blur-[100px] bg-primary/40 rounded-full animate-pulse pointer-events-none" />
          
          <div className="max-w-5xl text-center space-y-12 relative">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Trophy className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Tecnología de Élite para todo el Deporte Base</span>
             </div>

             <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-black italic tracking-tighter uppercase leading-[0.85] cyan-text-glow">
               EL DEPORTE <br />
               <span className="text-primary">PARA TODOS</span>
             </h1>

             <p className="max-w-2xl mx-auto text-white/40 font-bold uppercase text-[11px] md:text-xs tracking-[0.5em] leading-relaxed">
               Democratizando las herramientas profesionales de élite. <br />
               Para cada niño, en cada disciplina, en cada barrio del mundo.
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button size="lg" className="bg-primary text-black font-black h-16 px-12 rounded-none cyan-glow hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none uppercase tracking-[0.3em] text-[11px]" asChild>
                  <Link href="/login">UNIR MI CANTERA A LA RED <ArrowRight className="h-4 w-4 ml-3" /></Link>
                </Button>
                <div className="flex items-center gap-4 px-8 py-4 border border-white/5 bg-white/[0.02] backdrop-blur-md">
                   <Target className="h-4 w-4 text-primary/40" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/30">CUALQUIER DEPORTE • UN SOLO PROTOCOLO</span>
                </div>
             </div>
          </div>
        </section>

        {/* ACCESOS RÁPIDOS EXTERNOS */}
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {externalAccessNodes.map((node, i) => (
              <Link 
                key={i} 
                href={node.href} 
                className="group flex items-center gap-6 p-6 glass-panel border border-white/5 hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform] duration-500 rounded-[2rem] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform] shrink-0">
                  <node.icon className="h-6 w-6 text-white/20 group-hover:text-primary transition-[background-color,border-color,color,opacity,transform] group-hover:scale-110" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:cyan-text-glow transition-[background-color,border-color,color,opacity,transform]">{node.label}</h3>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">{node.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto text-white/5 group-hover:text-primary transition-[background-color,border-color,color,opacity,transform] group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* QUIENES SOMOS (VISIÓN MULTIDEPORTE) */}
        <section id="mision" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden glass-panel border-none group">
               <Image 
                src="https://picsum.photos/seed/multi-sports/1200/800" 
                alt="SynqAI Multi-Sport Vision" 
                fill 
                className="object-cover opacity-40 group-hover:scale-105 transition-[background-color,border-color,color,opacity,transform] duration-1000 grayscale group-hover:grayscale-0"
                data-ai-hint="kids sports"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40">
                    <Dumbbell className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Formación Global</p>
                    <p className="text-xs font-black italic uppercase">Grassroots Innovation</p>
                  </div>
               </div>
            </div>

            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Nuestra Misión</h3>
                  <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-tight">
                    LA RED TECNOLÓGICA <br />
                    DEL <span className="text-primary">DEPORTE BASE</span>
                  </h2>
               </div>
               
               <p className="text-white/40 font-bold uppercase text-xs leading-loose tracking-widest">
                 SynqAI no es solo software; es un compromiso social. Nacimos para que ninguna cantera, sea del deporte que sea, se quede atrás por falta de presupuesto. <br /><br />
                 Desde el baloncesto hasta el balonmano, proporcionamos a los coordinadores y monitores las herramientas que antes solo estaban al alcance de los grandes presupuestos, optimizando la formación de la próxima generación.
               </p>

               <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">1€</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">POR ATLETA AL MES</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">0.70€</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">ACCESO POR VOLUMEN</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN DE DESCARGA QR DINÁMICA */}
        <section id="ecosistema" className="py-32 bg-primary/[0.02] border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="max-w-7xl mx-auto px-6 relative">
             <div className="text-center space-y-4 mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4">
                   <Smartphone className="h-3 w-3 text-primary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">PWA_Independent_Nodes</span>
                </div>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">INSTALA NUESTRAS APPS</h2>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.5em] max-w-2xl mx-auto">
                  Escanea el código correspondiente para instalar el nodo específico en tu pantalla de inicio.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <QRAppCard 
                  title="SynqAi Sandbox" 
                  desc="Tu equipo local. Pizarras, sesiones y partidos sin cuotas." 
                  url={baseUrl ? `${baseUrl}/dashboard/promo/team` : ""} 
                  icon={LayoutGrid}
                  qrColor="#3b82f6"
                />
                <QRAppCard 
                  title="Tutor by SynqAi" 
                  desc="Portal Oficial de Familias. Agenda, Chat y Asistencia." 
                  url={baseUrl ? `${baseUrl}/tutor` : ""} 
                  icon={UserCircle}
                  highlight
                  qrColor="#00f2ff"
                />
                <QRAppCard 
                  title="Smartwatch Link" 
                  desc="Telemetría y Control de Partido en tu muñeca." 
                  url={baseUrl ? `${baseUrl}/smartwatch` : ""} 
                  icon={Watch}
                  qrColor="#00f2ff"
                />
             </div>
          </div>
        </section>

        {/* ESCALADO DE PRECIOS */}
        <section className="py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative">
             <div className="text-center space-y-4 mb-20">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/40">Protocolo de Democratización</h3>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">COSTES SIN BARRERAS</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingStep 
                  step="01" 
                  title="Club Local" 
                  price="1.00€" 
                  desc="Acceso total para clubes de cantera locales en cualquier disciplina." 
                />
                <PricingStep 
                  step="02" 
                  title="Alianza Sectorial" 
                  price="0.85€" 
                  desc="Para redes deportivas y academias de +400 atletas." 
                />
                <PricingStep 
                  step="03" 
                  title="Red Federativa" 
                  price="0.70€" 
                  desc="Protocolo masivo para federaciones y redes de +800 atletas." 
                  featured
                />
             </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Suma tu Entidad</h3>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">IMPULSA TU CANTERA</h2>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                  ¿Quieres profesionalizar tu formación? Solicita el acceso al ecosistema y empieza a entrenar como los mejores.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-center p-6 glass-panel border-white/5 rounded-2xl">
                  <Mail className="h-6 w-6 text-primary/40" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Protocolo Directo</span>
                    <span className="text-xs font-black uppercase text-white">HQ@SYNQAI.SPORTS</span>
                  </div>
                </div>
                <div className="flex gap-4 items-center p-6 glass-panel border-white/5 rounded-2xl">
                  <Building2 className="h-6 w-6 text-primary/40" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Sede Central</span>
                    <span className="text-xs font-black uppercase text-white">SPORTS HUB DISTRICT, ES</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="glass-panel p-10 space-y-6 relative overflow-hidden border-primary/20">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Send className="h-20 w-20 text-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">NOMBRE_DE_LA_CANTERA</label>
                  <Input placeholder="EJ: ACADEMIA DEPORTIVA BARRIO" className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">Nº_DE_ATLETAS</label>
                  <Input placeholder="+150" className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">DEPORTE_PRINCIPAL</label>
                <Input placeholder="EJ: BALONCESTO, BALONMANO, MULTIDEPORTE..." className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">MENSAJE_AL_EQUIPO</label>
                <Textarea placeholder="CUÉNTANOS SOBRE TU PROYECTO FORMATIVO..." className="min-h-[120px] bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
              </div>

              <Button type="submit" className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-none cyan-glow hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform]">
                SOLICITAR ACCESO AL ECOSISTEMA <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/60 py-20 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6 max-w-sm">
               <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary" />
                  <span className="font-headline font-black text-2xl tracking-tighter uppercase italic">SynqAI</span>
               </div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 leading-loose">
                 Digitalizando el deporte base global. <br />
                 © 2024 SynqSports Neural Systems. Democratizando la élite.
               </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
               <FooterGroup title="Plataforma" items={['IA Planner', 'Tactical Board', 'Gestión Cantera']} />
               <FooterGroup title="Proyecto" items={['Misión', 'Multideporte', 'Seguridad']} />
               <FooterGroup title="Legal" items={['Privacidad', 'Protocolos', 'GDPR']} />
            </div>
         </div>
      </footer>
    </div>
  );
}

function PricingStep({ step, title, price, desc, featured }: any) {
  return (
    <div className={cn(
      "glass-panel p-10 space-y-6 relative overflow-hidden group",
      featured && "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(242,255,255,0.05)]"
    )}>
       <span className="absolute top-8 right-8 text-4xl font-black italic opacity-5 group-hover:opacity-10 transition-[background-color,border-color,color,opacity,transform]">{step}</span>
       <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Tarifa</p>
          <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
       </div>
       <div className="text-4xl font-black text-primary font-headline italic">{price} <span className="text-xs opacity-40">/ mes</span></div>
       <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-relaxed">{desc}</p>
       <div className="h-[1px] w-full bg-white/5" />
    </div>
  );
}

function QRAppCard({ title, desc, url, icon: Icon, highlight, qrColor = "#00f2ff" }: any) {
  return (
    <Card className={cn(
      "glass-panel p-8 flex flex-col items-center text-center space-y-6 transition-[background-color,border-color,color,opacity,transform] group overflow-hidden relative",
      highlight ? "border-primary/40 shadow-[0_0_40px_rgba(242,255,255,0.1)]" : "border-white/5"
    )}>
       {highlight && <div className="absolute top-0 left-0 bg-primary text-black text-[7px] font-black px-3 py-1 uppercase tracking-widest">Recomendado_Padres</div>}
       <div className={cn(
         "h-12 w-12 rounded-2xl flex items-center justify-center border transition-[background-color,border-color,color,opacity,transform] shadow-lg",
         qrColor === "#3b82f6" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : (highlight ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/20")
       )}>
          <Icon className="h-6 w-6" />
       </div>
       <div className="space-y-2">
          <h4 className="text-lg font-black text-white uppercase italic tracking-tighter">{title}</h4>
          <p className="text-[9px] font-bold text-white/30 uppercase leading-relaxed tracking-widest px-4">{desc}</p>
       </div>
       
       <div 
         className="p-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] relative group-hover:scale-105 transition-transform duration-500 bg-black"
         style={{ backgroundColor: '#000000' }}
       >
          <QRCodeCanvas 
            value={url || "https://synqai.sports"} 
            size={140} 
            level="H" 
            fgColor="#ffffff" 
            bgColor="#000000"
            includeMargin={false}
          />
          <div className="absolute inset-0 border-4 border-white/10 pointer-events-none rounded-3xl" />
       </div>

       <div className="pt-4 flex flex-col items-center gap-2">
          <span className={cn("text-[8px] font-black uppercase tracking-[0.3em]", qrColor === "#3b82f6" ? "text-blue-400/40" : "text-primary/40")}>Scan_to_Install</span>
          <Button variant="link" className={cn("text-[10px] font-black uppercase tracking-widest p-0 h-auto", qrColor === "#3b82f6" ? "text-blue-400" : "text-primary")} asChild>
             <Link href={url || "#"}>Abrir Link <ArrowRight className="h-3 w-3 ml-1" /></Link>
          </Button>
       </div>
    </Card>
  );
}

function FooterGroup({ title, items }: any) {
  return (
    <div className="space-y-6">
       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{title}</h4>
       <ul className="space-y-3">
          {items.map((item: any) => (
            <li key={item}>
              <button className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">{item}</button>
            </li>
          ))}
       </ul>
    </div>
  );
}
