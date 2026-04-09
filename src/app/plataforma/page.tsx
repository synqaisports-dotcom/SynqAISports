import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Workflow } from "lucide-react";
import type { ComponentType } from "react";
import { SiteNav } from "@/components/marketing/site-nav";
import { Button } from "@/components/ui/button";

export default function PlataformaPage() {
  return (
    <div className="min-h-screen bg-[#1b1f27] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(0,242,255,0.12),transparent_35%)]" />
      <SiteNav />

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-6 py-16">
        <header className="max-w-4xl space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Plataforma</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tight md:text-6xl">Arquitectura del ecosistema</h1>
          <p className="text-white/70">
            SynqAI Sports separa captación, operación de club y control global en superficies de producto claras,
            con rutas dedicadas y seguridad por contexto.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <InfoCard
            title="Captación abierta"
            text="Apps sandbox orientadas a adquisición, ligeras y con monetización publicitaria no intrusiva."
            icon={Workflow}
          />
          <InfoCard
            title="Operación club"
            text="Apps con login y permisos para estructura de club, staff, jugadores y metodología."
            icon={Building2}
          />
          <InfoCard
            title="Backoffice global"
            text="Control de negocio, salud del sistema, analítica, roles y usuarios a nivel plataforma."
            icon={ShieldCheck}
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#222833] p-7">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary/85">Entrada recomendada</h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Para entrenadores que llegan por primera vez: SANDBOX COACH. Para operación estructurada: apps de club.
            Para administración del entorno: Backoffice.
          </p>
          <div className="mt-5 flex gap-3">
            <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
              <Link href="/apps">
                Ir a Apps <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#222833] p-6">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 text-xl font-black uppercase italic tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{text}</p>
    </article>
  );
}
