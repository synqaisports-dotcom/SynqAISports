"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Lock,
  ShieldCheck,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORE_PRODUCTS } from "@/lib/store-catalog";

type AccessMode = "open" | "optional_login" | "login_required";

function accessCopy(mode: AccessMode) {
  if (mode === "open") return { label: "Abierta", icon: Download, tone: "emerald" as const };
  if (mode === "optional_login") return { label: "Mixta", icon: ShieldCheck, tone: "amber" as const };
  return { label: "Segura", icon: Lock, tone: "cyan" as const };
}

function accessBadge(mode: AccessMode) {
  const conf = accessCopy(mode);
  const Icon = conf.icon;
  const toneClass =
    conf.tone === "emerald"
      ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
      : conf.tone === "amber"
        ? "border-amber-500/35 bg-amber-500/10 text-amber-300"
        : "border-cyan-500/35 bg-cyan-500/10 text-cyan-300";
  return (
    <Badge variant="outline" className={`${toneClass} uppercase text-[9px] font-black tracking-widest`}>
      <Icon className="h-3 w-3 mr-1" />
      {conf.label}
    </Badge>
  );
}

function ProductCard({ product }: { product: (typeof STORE_PRODUCTS)[number] }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#232831] p-5 hover:border-primary/40 hover:bg-[#2a303b] transition-colors">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-white text-lg md:text-xl font-black tracking-tight uppercase italic">{product.name}</h3>
        {accessBadge(product.accessMode)}
      </header>

      <p className="mt-3 text-sm text-white/70 leading-relaxed">{product.shortDescription}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {product.tags.slice(0, 4).map((tag) => (
          <li key={tag}>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-[#2d3440] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/70">
              {tag}
            </span>
          </li>
        ))}
      </ul>

      <footer className="mt-5 flex items-center gap-2">
        <Button asChild className="bg-primary text-black font-black uppercase text-[10px] tracking-widest">
          <Link href={product.href}>
            Abrir app <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-white/15 bg-[#2d3440] text-white hover:bg-[#384152]">
          <Link href={`/store/${product.slug}`}>Ver detalle</Link>
        </Button>
      </footer>
    </article>
  );
}

export default function SynqAiLandingPage() {
  const openApps = STORE_PRODUCTS.filter((p) => p.accessMode === "open");
  const mixedApps = STORE_PRODUCTS.filter((p) => p.accessMode === "optional_login");
  const secureApps = STORE_PRODUCTS.filter((p) => p.accessMode === "login_required");

  return (
    <div className="min-h-screen bg-[#1b1f27] text-white selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_0%,rgba(0,242,255,0.14),transparent_34%),radial-gradient(circle_at_95%_8%,rgba(255,255,255,0.08),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#20252e]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl h-20 px-5 md:px-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black">
              <Zap className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black uppercase italic tracking-tight">
              Synq<span className="text-primary">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
            <a href="#apps" className="hover:text-primary transition-colors">Apps</a>
            <a href="#modelo" className="hover:text-primary transition-colors">Modelo</a>
            <a href="#cta" className="hover:text-primary transition-colors">Acceso</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
              <Link href="/store">Store</Link>
            </Button>
            <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-20 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Index profesional</span>
              </div>
              <h1 className="mt-5 text-4xl md:text-6xl font-black uppercase italic tracking-tight leading-[0.95]">
                Ecosistema de apps <br />
                <span className="text-primary">SynqAI Sports</span>
              </h1>
              <p className="mt-4 max-w-3xl text-white/70 text-base leading-relaxed">
                Entrada clara por producto: apps abiertas para captación, apps mixtas para adopción progresiva y apps seguras
                para operación profesional de clubes y backoffice.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                  <Link href="/sandbox-portal?dest=/sandbox/app">
                    Abrir Sandbox Coach <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                  <Link href="/store">Ver catálogo completo</Link>
                </Button>
              </div>
            </div>

            <aside className="lg:col-span-4 rounded-3xl border border-white/10 bg-[#232831] p-5 md:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/80">Resumen</p>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  Sandbox Coach como app de entrada conectada al terminal real existente.
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  Separación de acceso por seguridad y modelo de negocio.
                </li>
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  Base visual enterprise en grises + acento SynqAI.
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section id="apps" className="mx-auto max-w-7xl px-5 md:px-8 pb-14 space-y-10">
          <div className="rounded-3xl border border-white/10 bg-[#20252e] p-5 md:p-7">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/85">Apps abiertas (sin login)</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {openApps.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#20252e] p-5 md:p-7">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/85">Apps mixtas (login opcional)</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mixedApps.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#20252e] p-5 md:p-7">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/85">Apps seguras (login requerido)</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {secureApps.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section id="modelo" className="mx-auto max-w-7xl px-5 md:px-8 pb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="rounded-3xl border border-white/10 bg-[#232831] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-primary/80">Captación</h3>
              <p className="mt-3 text-sm text-white/70">Apps abiertas con experiencia ligera, multideporte y monetización publicitaria no intrusiva.</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-[#232831] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-primary/80">Conversión</h3>
              <p className="mt-3 text-sm text-white/70">Paso progresivo desde uso libre a cuentas conectadas y funcionalidades de club.</p>
            </article>
            <article className="rounded-3xl border border-white/10 bg-[#232831] p-6">
              <h3 className="text-sm font-black uppercase tracking-[0.25em] text-primary/80">Operación</h3>
              <p className="mt-3 text-sm text-white/70">Backoffice global para gestionar usuarios, salud del sistema, analítica y control de negocio.</p>
            </article>
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-[#24313a] to-[#1f2732] p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/90">Siguiente paso</p>
              <h3 className="mt-2 text-2xl md:text-3xl font-black uppercase italic tracking-tight">Entra al catálogo y abre tu app</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                <Link href="/store">
                  <Store className="h-3.5 w-3.5 mr-1.5" />
                  Ir a Store
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/20 bg-[#2b313d] text-white hover:bg-[#353d4c]">
                <Link href="/login">Entrar al sistema</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
