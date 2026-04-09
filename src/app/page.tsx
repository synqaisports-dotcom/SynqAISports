import Link from "next/link";
import { ArrowRight, CirclePlay, LayoutGrid, Layers, Mail, WalletCards } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/marketing/site-nav";
import { HomeAppCarousel } from "@/components/marketing/home-app-carousel";

export default function SynqAiLandingPage() {
  return (
    <div className="min-h-screen public-shell-bg text-white selection:bg-primary/30">
      <SiteNav />

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-16 pt-20 lg:grid-cols-2 md:pt-28">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Enterprise landing</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tight leading-[0.95] md:text-7xl">
              SynqAI Sports <br />
              <span className="text-primary">Performance Platform</span>
            </h1>
            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Plataforma de operaciones deportivas con micro-apps conectadas, backoffice analítico y experiencia
              de campo multideporte con enfoque profesional.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                <Link href="/apps">
                  Explorar apps <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                <Link href="/plataforma">Ver plataforma</Link>
              </Button>
            </div>
          </div>
          <div className="surface-card p-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f131a] aspect-video">
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
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-black uppercase tracking-widest text-white/85">
                  <CirclePlay className="h-4 w-4 text-primary" />
                  Video Demo
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeAppCarousel />

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
          <LandingTile
            href="/precios"
            title="Precios"
            desc="Modelo comercial y planes."
            icon={WalletCards}
          />
          <LandingTile
            href="/contacto"
            title="Contacto"
            desc="Canal comercial y partnership."
            icon={Mail}
          />
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
    <Link href={href} className="surface-card group p-6 transition-colors hover:border-primary/35">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="mt-4 text-xl font-black uppercase italic tracking-tight text-white">{title}</h2>
      <p className="mt-2 text-sm text-white/65">{desc}</p>
      <span className="mt-4 inline-flex items-center text-[11px] font-black uppercase tracking-widest text-primary">
        Abrir <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
