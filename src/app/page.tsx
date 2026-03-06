"use client";

import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Activity, 
  Monitor, 
  Watch, 
  UserCircle, 
  Key, 
  BrainCircuit, 
  Cpu, 
  Users, 
  LayoutDashboard,
  ArrowRight,
  Database,
  Network,
  Target,
  Rocket,
  Shield,
  BarChart3,
  ChevronDown,
  Mail,
  Building2,
  Send,
  Heart
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function SynqAiLandingPage() {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "SOLICITUD_ENVIADA",
      description: "Su solicitud de alianza ha sido encriptada y enviada al Centro de Mando.",
    });
  };

  const categories = [
    {
      title: "Núcleo de Control",
      description: "Administración global y gestión de red",
      color: "text-emerald-400",
      nodes: [
        { label: "Admin Global", icon: LayoutDashboard, href: "/admin-global" },
        { label: "Red de Clubes", icon: Globe, href: "/admin-global/clubs" },
        { label: "Gestión de Usuarios", icon: Users, href: "/admin-global/users" },
      ]
    },
    {
      title: "Operativa de Cantera",
      description: "Terminales de rendimiento y táctica",
      color: "text-primary",
      nodes: [
        { label: "Coach Hub", icon: Cpu, href: "/dashboard" },
        { label: "Tactical Board", icon: Monitor, href: "/board" },
        { label: "Neural Planner", icon: BrainCircuit, href: "/dashboard/coach/planner" },
      ]
    },
    {
      title: "Sincronización",
      description: "Terminales de acceso y telemetría",
      color: "text-white/40",
      nodes: [
        { label: "Smartwatch", icon: Watch, href: "/smartwatch" },
        { label: "Tutor Portal", icon: UserCircle, href: "/tutor" },
        { label: "Acceso Sistema", icon: Key, href: "/login" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#04070c] text-white font-body selection:bg-primary/30 selection:text-white">
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
            {['Ecosistema', 'Visión', 'Escalado', 'Contacto'].map((item) => (
              <button key={item} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary transition-colors">
                {item}
              </button>
            ))}
          </div>

          <Button className="bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest rounded-none h-10 px-6 hover:bg-primary hover:text-black transition-all" asChild>
            <Link href="/login">Acceso Terminal</Link>
          </Button>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-6">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-10 blur-[100px] bg-primary/40 rounded-full animate-pulse pointer-events-none" />
          
          <div className="max-w-5xl text-center space-y-12 relative">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <Heart className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Tecnología Profesional para el Fútbol Base</span>
             </div>

             <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-black italic tracking-tighter uppercase leading-[0.85] cyan-text-glow">
               ÉLITE PARA <br />
               <span className="text-primary">TODOS</span>
             </h1>

             <p className="max-w-2xl mx-auto text-white/40 font-bold uppercase text-[11px] md:text-xs tracking-[0.5em] leading-relaxed">
               Democratizando las herramientas profesionales de fútbol. <br />
               Porque cada niño, en cada club de barrio, merece entrenar como los mejores.
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button size="lg" className="bg-primary text-black font-black h-16 px-12 rounded-none cyan-glow uppercase tracking-[0.3em] text-[11px] shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none" asChild>
                  <Link href="/login">UNIR MI CLUB A LA RED <ArrowRight className="h-4 w-4 ml-3" /></Link>
                </Button>
                <div className="flex items-center gap-4 px-8 py-4 border border-white/5 bg-white/[0.02] backdrop-blur-md">
                   <Users className="h-4 w-4 text-primary/40" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/30">+1.2k CANTERAS UNIDAS</span>
                </div>
             </div>
          </div>

          <div className="absolute bottom-10 animate-bounce opacity-20">
            <ChevronDown className="h-8 w-8 text-primary" />
          </div>
        </section>

        {/* QUIENES SOMOS (VISIÓN) */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative aspect-video rounded-3xl overflow-hidden glass-panel border-none group">
               <Image 
                src="https://picsum.photos/seed/youth-sports/1200/800" 
                alt="SynqAI Grassroots Vision" 
                fill 
                className="object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                data-ai-hint="youth football"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40">
                    <Sprout className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Operativa Local</p>
                    <p className="text-xs font-black italic uppercase">Grassroots Revolution</p>
                  </div>
               </div>
            </div>

            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Nuestra Misión</h3>
                  <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-tight">
                    LA TECNOLOGÍA PRO, <br />
                    AL PRECIO DE <span className="text-primary">UN CAFÉ</span>
                  </h2>
               </div>
               
               <p className="text-white/40 font-bold uppercase text-xs leading-loose tracking-widest">
                 SynqAI nació con un objetivo social: que el fútbol base deje de ser el olvidado de la tecnología. <br /><br />
                 Hemos roto la barrera del precio para que cualquier coordinador de cantera pueda tener las mismas herramientas que un club de Champions. Automatizamos la táctica y la gestión para que los entrenadores se centren en lo que importa: formar personas y deportistas.
               </p>

               <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">1€</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">POR NIÑO AL MES</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">0.70€</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">EN REDES DE APOYO</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* ESCALADO DE PRECIOS (MODELO DE NEGOCIO) */}
        <section className="py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="max-w-7xl mx-auto px-6 relative">
             <div className="text-center space-y-4 mb-20">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Protocolo de Apoyo Social</h3>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">COSTES PARA CANTERAS</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingStep 
                  step="01" 
                  title="Club Local" 
                  price="1.00€" 
                  desc="Gestión total para clubes pequeños con grandes sueños." 
                />
                <PricingStep 
                  step="02" 
                  title="Alianza Regional" 
                  price="0.85€" 
                  desc="Para academias que superan los 400 niños en su red." 
                />
                <PricingStep 
                  step="03" 
                  title="Red de Canteras" 
                  price="0.70€" 
                  desc="Protocolo especial para federaciones o redes de +800 niños." 
                  featured
                />
             </div>
          </div>
        </section>

        {/* CONTACTO / CAPTACIÓN DE LEADS */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Suma tu Club</h3>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">DIGITALIZA TU CANTERA</h2>
                <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] leading-relaxed">
                  ¿Quieres que tus entrenadores tengan herramientas pro? Solicita tu acceso y únete a la red de canteras más avanzada.
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
                    <span className="text-xs font-black uppercase text-white">CANTERA HUB DISTRICT, ES</span>
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
                  <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">NOMBRE_OFICIAL_CANTERA</label>
                  <Input placeholder="EJ: CLUB DEPORTIVO LOCAL" className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">Nº_DE_NIÑOS</label>
                  <Input placeholder="+200" className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">EMAIL_COORDINADOR</label>
                <Input type="email" placeholder="COORDINACION@CLUB.COM" className="h-12 bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1">MENSAJE_PARA_EL_EQUIPO</label>
                <Textarea placeholder="CUÉNTANOS SOBRE TU PROYECTO DE CANTERA..." className="min-h-[120px] bg-black/40 border-white/10 rounded-none font-bold uppercase text-[10px] tracking-widest" />
              </div>

              <Button type="submit" className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-none cyan-glow hover:scale-[1.02] transition-all">
                ENVIAR_SOLICITUD_DE_ACCESO <Send className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </div>
        </section>

        {/* ACCESO AL SISTEMA (PORTAL DE LANZAMIENTO) */}
        <section className="py-32 px-6 max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Terminales de Gestión</h3>
             <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-tight">ACCESO A LA RED</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-6">
                <div className="px-4 space-y-1 border-l-2 border-white/5 ml-1">
                  <div className="flex items-center gap-2">
                     <div className={cn("h-1 w-1 rounded-full bg-current", cat.color)} />
                     <h3 className={cn("text-[10px] font-black uppercase tracking-[0.4em]", cat.color)}>{cat.title}</h3>
                  </div>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest ml-3">{cat.description}</p>
                </div>

                <div className="grid gap-3">
                  {cat.nodes.map((node, i) => (
                    <Link 
                      key={i} 
                      href={node.href} 
                      className="group flex items-center gap-4 p-5 glass-panel border border-white/5 hover:border-primary/40 transition-all duration-500 rounded-2xl relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <node.icon className="h-5 w-5 text-white/20 group-hover:text-primary transition-all group-hover:scale-110 relative z-10" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors relative z-10 group-hover:emerald-text-glow">
                        {node.label}
                      </span>
                      <ArrowRight className="h-3 w-3 ml-auto text-white/5 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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
                 Digitalizando el fútbol base. <br />
                 © 2024 SynqSports Neural Systems. Porque el futuro está en la cantera.
               </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
               <FooterGroup title="Plataforma" items={['IA Planner', 'Tactical Board', 'Gestión Cantera']} />
               <FooterGroup title="Proyecto" items={['Misión', 'Precios', 'Seguridad']} />
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
      featured && "border-primary/40 bg-primary/5 shadow-[0_0_30px_rgba(0,242,255,0.05)]"
    )}>
       <span className="absolute top-8 right-8 text-4xl font-black italic opacity-5 group-hover:opacity-10 transition-all">{step}</span>
       <div className="space-y-1">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Tarifa</p>
          <h4 className="text-xl font-black uppercase italic tracking-tighter">{title}</h4>
       </div>
       <div className="text-4xl font-black text-primary font-headline italic">{price} <span className="text-xs opacity-40">/ niño</span></div>
       <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-relaxed">{desc}</p>
       <div className="h-[1px] w-full bg-white/5" />
    </div>
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

const Sprout = ({ className }: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5 8-6.4 8-10 0-4.4-3.6-8-8-8s-8 3.6-8 8c0 3.6 2.5 7.5 8 10Z" />
    <path d="M12 20V2" />
  </svg>
);
