import Link from "next/link";
import { ArrowRight, LayoutGrid, Layers, Mail, WalletCards } from "lucide-react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { SiteNav } from "@/components/marketing/site-nav";

export default function SynqAiLandingPage() {
  return (
    <div className="min-h-screen bg-[#1b1f27] text-white selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_0%,rgba(0,242,255,0.14),transparent_34%),radial-gradient(circle_at_95%_8%,rgba(255,255,255,0.08),transparent_30%)]" />
      <SiteNav />

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 md:pt-28">
          <div className="max-w-4xl space-y-6">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Plataforma modular</p>
            <h1 className="text-5xl font-black uppercase italic tracking-tight leading-[0.95] md:text-7xl">
              SynqAI Sports <br />
              <span className="text-primary">App Ecosystem</span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-white/70 md:text-lg">
              Un ecosistema de productos deportivos conectados: apps abiertas para captación, apps de club para
              operación y backoffice global para control de negocio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                <Link href="/apps">
                  Ver apps <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                <Link href="/plataforma">Conocer plataforma</Link>
              </Button>
            </div>
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
    <Link href={href} className="group rounded-3xl border border-white/10 bg-[#222833] p-6 transition-colors hover:border-primary/35">
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
