import Link from "next/link";
import { Mail, Building2 } from "lucide-react";
import { SiteNav } from "@/components/marketing/site-nav";
import { Button } from "@/components/ui/button";

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-[#1b1f27] text-white">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="max-w-3xl space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Contacto</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tight md:text-6xl">Hablemos de tu proyecto</h1>
          <p className="text-white/70">Canal directo para clubs, academias y partners que quieran desplegar SynqAI Sports.</p>
        </header>

        <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-white/10 bg-[#222833] p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-4 text-xl font-black uppercase italic tracking-tight">Correo comercial</h2>
            <p className="mt-2 text-white/70">hq@synqai.sports</p>
            <Button asChild className="mt-5 bg-primary text-black font-black uppercase tracking-widest text-[10px]">
              <Link href="mailto:hq@synqai.sports">Enviar email</Link>
            </Button>
          </article>

          <article className="rounded-3xl border border-white/10 bg-[#222833] p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-4 text-xl font-black uppercase italic tracking-tight">Partnership</h2>
            <p className="mt-2 text-white/70">Acuerdos para red de clubes, academias y federaciones.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
