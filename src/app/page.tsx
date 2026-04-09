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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#020617] to-black text-white selection:bg-primary/30">
      <SiteNav />

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-14 pt-20 lg:grid-cols-2 md:pt-28">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/90 drop-shadow-[0_0_10px_rgba(0,242,255,0.6)]">Enterprise landing</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tight leading-[0.95] md:text-7xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SynqAI Sports <br />
              <span className="text-primary drop-shadow-[0_0_12px_rgba(0,242,255,0.65)] [filter:blur(0.5px)]">Performance Platform</span>
            </h1>
            <p className="text-base leading-relaxed text-gray-300 md:text-lg">
              Plataforma de operaciones deportivas con micro-apps conectadas, backoffice analítico y experiencia
              de campo multideporte con enfoque profesional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/50">
                <Link href="/apps">
                  Explorar apps <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                <Link href="/plataforma">Ver plataforma</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80 backdrop-blur-2xl">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#0F172A]/80 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-300 backdrop-blur-md">
                  <CirclePlay className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
                  Video Demo
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 pb-20 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,242,255,0.15)] lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">Sandbox Coach</p>
                <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tight">CONTINUIDAD</h2>
              </div>
              <Button asChild className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest shadow-lg shadow-cyan-500/50">
                <Link href="/sandbox/app">
                  Ir a Sandbox Coach <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80 backdrop-blur-2xl shadow-[0_0_20px_rgba(0,242,255,0.15)]">
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

        <section
          id="plataforma"
          className="mx-auto mt-2 max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#020617] via-[#0b1120] to-black px-6 py-12 shadow-[0_0_40px_rgba(0,0,0,0.35)]"
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
                OPERACIONES DE ELITE A CUALQUIER ESCALA
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                SYNQAI SPORTS GLOBAL PLATFORM: EL ESTÁNDAR DE LA PROFESIONALIZACIÓN
              </h2>
              <p className="text-base leading-relaxed text-slate-300">
                Centralice la captación, la metodología de cantera, el backoffice del club y el control global en una
                única infraestructura. SynqAI Sports proporciona a los clubes de todo el mundo —desde academias
                locales hasta canteras de primer nivel— las herramientas de software que definen a la élite europea.
                Estandarice su ADN deportivo, proteja sus activos y profesionalice cada operación con tecnología
                diseñada para ganar.
              </p>
              <Button
                asChild
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-cyan-500/50"
              >
                <Link href="/dashboard">
                  PROFESIONALICE SU CLUB <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-[2.5rem] border border-white/10 bg-[#0F172A]/80 p-4 backdrop-blur-xl shadow-xl shadow-cyan-900/40">
                <div className="rounded-[2.1rem] border border-white/10 bg-gradient-to-b from-slate-700/35 to-slate-900/45 p-3">
                  <div className="mb-2 flex justify-center">
                    <span className="h-1.5 w-12 rounded-full bg-white/30" />
                  </div>
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30">
                    <iframe
                      title="Terminal Sandbox operativa"
                      src="https://synq-ai-sports-git-cursor-03a5cb-synqaisports-dotcoms-projects.vercel.app/sandbox/app"
                      className="h-[380px] w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-45" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    <Link href={href} className="group rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6 backdrop-blur-2xl shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors hover:border-primary/35">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10">
        <Icon className="h-5 w-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
      </div>
      <h2 className="mt-4 text-xl font-black uppercase italic tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-300">{desc}</p>
      <span className="mt-4 inline-flex items-center text-[11px] font-black uppercase tracking-widest text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
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
    <Link href={href} className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5 backdrop-blur-xl shadow-xl shadow-cyan-900/40 transition-colors hover:border-primary/35">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/35 bg-cyan-500/10">
        <Icon className="h-4.5 w-4.5 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]" />
      </div>
      <h3 className="mt-3 text-lg font-black uppercase italic tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-gray-300">{desc}</p>
    </Link>
  );
}
