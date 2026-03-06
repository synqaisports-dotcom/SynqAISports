
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
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SynqAiLandingPage() {
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
      title: "Operativa Élite",
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
            {['Ecosistema', 'Visión', 'Escalado', 'Tecnología'].map((item) => (
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
                <Activity className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Sincronización Deportiva 1.0</span>
             </div>

             <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-black italic tracking-tighter uppercase leading-[0.85] cyan-text-glow">
               EL FUTURO DEL <br />
               <span className="text-primary">DEPORTE ÉLITE</span>
             </h1>

             <p className="max-w-2xl mx-auto text-white/40 font-bold uppercase text-[11px] md:text-xs tracking-[0.5em] leading-relaxed">
               Inteligencia Artificial aplicada al análisis táctico, <br />
               gestión de canteras y optimización de redes globales.
             </p>

             <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                <Button size="lg" className="bg-primary text-black font-black h-16 px-12 rounded-none cyan-glow uppercase tracking-[0.3em] text-[11px] shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none" asChild>
                  <Link href="/login">EXPLORAR LA RED <ArrowRight className="h-4 w-4 ml-3" /></Link>
                </Button>
                <div className="flex items-center gap-4 px-8 py-4 border border-white/5 bg-white/[0.02] backdrop-blur-md">
                   <Users className="h-4 w-4 text-primary/40" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/30">+1.2k NODOS ACTIVOS</span>
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
                src="https://picsum.photos/seed/tech/1200/800" 
                alt="SynqAI Vision" 
                fill 
                className="object-cover opacity-40 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                data-ai-hint="artificial intelligence"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/40">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Operativa HQ</p>
                    <p className="text-xs font-black italic uppercase">The Neural Leap</p>
                  </div>
               </div>
            </div>

            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Quienes Somos</h3>
                  <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase leading-tight">
                    NO SOMOS SOFTWARE, <br />
                    SOMOS EL <span className="text-primary">SISTEMA OPERATIVO</span>
                  </h2>
               </div>
               
               <p className="text-white/40 font-bold uppercase text-xs leading-loose tracking-widest">
                 SynqAI nació con una visión clara: la democratización de la tecnología de élite. <br /><br />
                 Eliminamos la fricción entre la recolección de datos y la toma de decisiones tácticas. Nuestra red permite que un club de base en Argentina o una academia Pro en Madrid operen bajo los mismos protocolos de eficiencia aeroespacial.
               </p>

               <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">0.14ms</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">LATENCIA IA</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-black italic text-primary">100%</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">SEGURIDAD NODO</p>
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
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Sostenibilidad de Red</h3>
                <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">PROTOCOLOS DE VOLUMEN</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingStep 
                  step="01" 
                  title="Nodo Base" 
                  price="1.00€" 
                  desc="Gestión integral para clubes en fase de crecimiento." 
                />
                <PricingStep 
                  step="02" 
                  title="Escalado Red" 
                  price="0.85€" 
                  desc="Optimización automática al superar los 400 niños." 
                />
                <PricingStep 
                  step="03" 
                  title="Enterprise Élite" 
                  price="0.70€" 
                  desc="Protocolo total para redes de más de 800 niños." 
                  featured
                />
             </div>
          </div>
        </section>

        {/* ACCESO AL SISTEMA (REPLICADO DEL PORTAL ORIGINAL) */}
        <section className="py-32 px-6 max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Acceso Directo</h3>
             <h2 className="text-5xl font-headline font-black italic tracking-tighter uppercase">PORTAL DE LANZAMIENTO</h2>
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
                 Diseñando el tejido neural del deporte moderno. <br />
                 © 2024 SynqSports Neural Systems. Todos los derechos reservados bajo protocolo de encriptación 0X1.
               </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
               <FooterGroup title="Plataforma" items={['IA Planner', 'Tactical Board', 'Global Red']} />
               <FooterGroup title="Empresa" items={['Visión', 'Socio', 'Seguridad']} />
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
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Protocolo</p>
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
