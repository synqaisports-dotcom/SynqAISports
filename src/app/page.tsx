import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CirclePlay,
  LayoutGrid,
  Layers,
  ShieldCheck,
  Watch,
} from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/marketing/site-nav";

export default function SynqAiLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 text-white selection:bg-primary/30">
      <SiteNav />

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-14 pt-20 lg:grid-cols-2 md:pt-28">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Enterprise landing</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tight leading-[0.95] md:text-7xl">
              SynqAI Sports <br />
              <span className="text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Performance Platform</span>
            </h1>
            <p className="text-base leading-relaxed text-gray-300 md:text-lg">
              Plataforma de operaciones deportivas con micro-apps conectadas, backoffice analítico y experiencia
              de campo multideporte con enfoque profesional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px] drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
                <Link href="/apps">
                  Explorar apps <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                <Link href="/plataforma">Ver plataforma</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-4 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5 bg-[#0f131a]">
              <video
                className="h-full w-full object-cover"
                controls
                preload="none"
                poster="/canvas-slide-1.svg"
                aria-label="Video de presentación SynqAI Sports"
              >
                <source src="/intro.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-slate-900/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-300 backdrop-blur-md">
                  <CirclePlay className="h-4 w-4 text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
                  Video Demo
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 pb-20 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Canvas táctico</p>
                <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tight">CANVAS T1</h2>
              </div>
              <Button asChild className="bg-primary text-black font-black uppercase text-[10px] tracking-widest drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
                <Link href="/sandbox/board">
                  Abrir Canvas <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <iframe
                title="Canvas táctico T1 en vivo"
                src="https://synq-ai-sports-git-cursor-03a5cb-synqaisports-dotcoms-projects.vercel.app/sandbox/app/board/match?source=sandbox&matchId=1775739556877"
                className="h-[260px] w-full md:h-[360px]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </article>

          <div className="grid grid-cols-1 gap-5">
            <MiniHubCard
              href="/sandbox-portal?dest=/sandbox/app"
              title="Sandbox Coach"
              desc="Entrada abierta para entrenadores."
              icon={ShieldCheck}
            />
            <MiniHubCard
              href="/smartwatch"
              title="Watch Link"
              desc="Conexión y telemetría en tiempo real."
              icon={Watch}
            />
            <MiniHubCard
              href="/admin-global/analytics"
              title="Analytics"
              desc="Métricas y comportamiento de red."
              icon={Activity}
            />
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 pb-20 md:grid-cols-2 xl:grid-cols-4">
          <LandingTile
            href="/plataforma"
            title="Plataforma"
            desc="Arquitectura y propuesta de valor."
            icon={Layers}
          />
          <LandingTile
            href="/apps"
            title="Apps"
            desc="Catálogo por tipo de acceso."
            icon={LayoutGrid}
          />
          <LandingTile href="/precios" title="Precios" desc="Modelo comercial y planes." icon={LayoutGrid} />
          <LandingTile href="/contacto" title="Contacto" desc="Canal comercial y partnership." icon={LayoutGrid} />
        </section>
      </main>
    </div>
  );
}

function LandingTile({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors hover:border-primary/35">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <Icon className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
      </div>
      <h2 className="mt-4 text-xl font-black uppercase italic tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-300">{desc}</p>
      <span className="mt-4 inline-flex items-center text-[11px] font-black uppercase tracking-widest text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
        Abrir <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function MiniHubCard({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-white/5 bg-slate-900/40 p-5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors hover:border-primary/35">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
      </div>
      <h3 className="mt-3 text-lg font-black uppercase italic tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-gray-300">{desc}</p>
    </Link>
  );
}
