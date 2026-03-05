"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, LayoutDashboard, BrainCircuit, Users, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-[5%] h-20 flex items-center border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 group" href="#">
          <div className="bg-primary p-2 rounded-sm rotate-45 group-hover:rotate-90 transition-transform duration-500 cyan-glow">
            <Zap className="h-5 w-5 text-primary-foreground -rotate-45 group-hover:-rotate-90 transition-transform duration-500" />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tighter text-white uppercase cyan-text-glow">SynqSports <span className="text-primary">Pro</span></span>
        </Link>
        <nav className="ml-auto flex gap-8 items-center">
          <Link className="text-sm font-medium text-white/70 hover:text-primary transition-colors uppercase tracking-widest" href="/login">
            Terminal
          </Link>
          <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold rounded-none px-8 cyan-glow transition-all active:scale-95" asChild>
            <Link href="/login">Launch Mission</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-[10%] relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(180,100,50,0.15),transparent_70%)]" />
          <div className="container px-[5%] mx-auto relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    <Globe className="h-3 w-3" /> System Status: Operational
                  </div>
                  <h1 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] text-white">
                    Command the <span className="text-primary cyan-text-glow">Next Era</span> of Sports.
                  </h1>
                  <p className="max-w-[500px] text-white/60 text-lg font-light leading-relaxed">
                    Un sistema de gestión multi-club de alto rendimiento. Optimización táctica impulsada por IA con seguridad de grado aeroespacial.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground font-black rounded-none px-10 cyan-glow" asChild>
                    <Link href="/login">Initialize Interface</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-none border-white/20 text-white hover:bg-white/5 px-10">
                    System Specs
                  </Button>
                </div>
              </div>
              <div className="relative group perspective-1000">
                <div className="absolute -inset-4 bg-primary/20 rounded-none blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative border border-white/10 p-2 bg-black/40 backdrop-blur-sm">
                  <img
                    alt="Space Athletes"
                    className="w-full aspect-[4/3] object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    src="https://picsum.photos/seed/sports-nasa/800/600"
                    data-ai-hint="futuristic athlete"
                  />
                  <div className="absolute top-4 left-4 border-l-2 border-t-2 border-primary w-8 h-8"></div>
                  <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-primary w-8 h-8"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Data Section */}
        <section className="w-full py-[8%] border-y border-white/5 bg-black/20">
          <div className="container px-[5%] mx-auto">
            <div className="grid gap-12 md:grid-cols-3">
              {[
                { icon: Shield, title: "Data Isolation", desc: "Arquitectura clubId-based con protocolos de seguridad síncronos." },
                { icon: BrainCircuit, title: "Neural Planner", desc: "Motores GenAI Gemini-Flash para la generación de ciclos de entrenamiento." },
                { icon: LayoutDashboard, title: "Micro-Terminal", desc: "Dashboards modulares adaptativos según el rol operativo asignado." }
              ].map((item, i) => (
                <div key={i} className="group p-8 border border-white/5 hover:border-primary/30 transition-all duration-500 bg-card/20 glass-panel">
                  <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-4 text-white tracking-widest">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 border-t border-white/5 bg-black/40">
        <div className="container px-[5%] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-headline font-bold text-lg text-white tracking-widest">SYNQSPORTS <span className="text-primary">PRO</span></span>
            <p className="text-white/30 text-xs uppercase tracking-[0.3em]">Sector 7-G | Ground Control</p>
          </div>
          <nav className="flex gap-12 text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link className="hover:text-primary transition-colors" href="#">Protocols</Link>
            <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-primary transition-colors" href="#">Log</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}