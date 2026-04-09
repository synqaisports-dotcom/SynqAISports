"use client";

import Link from "next/link";
import { ArrowRight, Download, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STORE_PRODUCTS } from "@/lib/store-catalog";

function accessBadge(mode: "open" | "optional_login" | "login_required") {
  if (mode === "open") {
    return (
      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 uppercase text-[9px] font-black tracking-widest">
        <Download className="h-3 w-3 mr-1" />
        Abierta
      </Badge>
    );
  }
  if (mode === "optional_login") {
    return (
      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 uppercase text-[9px] font-black tracking-widest">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Mixta
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300 uppercase text-[9px] font-black tracking-widest">
      <Lock className="h-3 w-3 mr-1" />
      Segura
    </Badge>
  );
}

export default function SynqAiLandingPage() {
  const openApps = STORE_PRODUCTS.filter((p) => p.accessMode === "open");
  const mixedApps = STORE_PRODUCTS.filter((p) => p.accessMode === "optional_login");
  const secureApps = STORE_PRODUCTS.filter((p) => p.accessMode === "login_required");

  return (
    <div className="min-h-screen bg-[#111317] text-white">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(0,242,255,0.12),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.08),transparent_35%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#171a1f]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl h-20 px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/90 flex items-center justify-center">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="font-black text-2xl tracking-tight italic uppercase">
              Synq<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-white/15 bg-[#1f232a] text-white hover:bg-[#272c35]">
              <Link href="/store">Ver Store</Link>
            </Button>
            <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
              <Link href="/login">Acceso</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">App Hub</span>
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-black uppercase tracking-tight italic">
            Tus apps en un <span className="text-primary">solo lugar</span>
          </h1>
          <p className="mt-4 max-w-3xl text-white/65 text-sm uppercase tracking-wider font-bold">
            Diseño más limpio y profesional, con secciones por tipo de acceso y colorimetría SynqAI sobre grises.
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 space-y-10">
          <AppsSection title="Apps abiertas (sin login)" items={openApps} />
          <AppsSection title="Apps mixtas (login opcional)" items={mixedApps} />
          <AppsSection title="Apps seguras (login requerido)" items={secureApps} />
        </section>
      </main>
    </div>
  );
}

function AppsSection({
  title,
  items,
}: {
  title: string;
  items: typeof STORE_PRODUCTS;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-black uppercase tracking-[0.35em] text-primary/80">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((app) => (
          <Card key={app.slug} className="rounded-3xl border border-white/10 bg-[#1b1f26] hover:border-primary/35 transition-colors">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg font-black uppercase italic tracking-tight text-white">{app.name}</CardTitle>
                {accessBadge(app.accessMode)}
              </div>
              <p className="text-[11px] text-white/65 font-bold uppercase tracking-wide leading-relaxed">{app.shortDescription}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {app.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline" className="border-white/15 bg-[#222833] text-white/70 text-[9px] uppercase font-black tracking-wider">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button asChild className="bg-primary text-black font-black uppercase text-[10px] tracking-widest">
                  <Link href={app.href}>
                    Abrir <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-[#222833] text-white hover:bg-[#2b3341]">
                  <Link href={`/store/${app.slug}`}>Detalle</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
