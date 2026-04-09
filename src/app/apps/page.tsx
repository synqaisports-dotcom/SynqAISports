import Link from "next/link";
import { ArrowRight, Download, Lock, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/marketing/site-nav";
import { STORE_PRODUCTS } from "@/lib/store-catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AccessBadge({ mode }: { mode: "open" | "optional_login" | "login_required" }) {
  if (mode === "open") {
    return (
      <Badge variant="outline" className="border-emerald-500/35 bg-emerald-500/10 text-emerald-300">
        <Download className="mr-1 h-3 w-3" /> Abierta
      </Badge>
    );
  }
  if (mode === "optional_login") {
    return (
      <Badge variant="outline" className="border-amber-500/35 bg-amber-500/10 text-amber-300">
        <ShieldCheck className="mr-1 h-3 w-3" /> Mixta
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-cyan-500/35 bg-cyan-500/10 text-cyan-300">
      <Lock className="mr-1 h-3 w-3" /> Segura
    </Badge>
  );
}

export default function AppsPage() {
  const openApps = STORE_PRODUCTS.filter((p) => p.accessMode === "open");
  const mixedApps = STORE_PRODUCTS.filter((p) => p.accessMode === "optional_login");
  const secureApps = STORE_PRODUCTS.filter((p) => p.accessMode === "login_required");

  return (
    <div className="min-h-screen public-shell-bg text-white">
      <SiteNav />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-16">
        <header className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/85">Apps</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tight md:text-6xl">Catálogo de productos</h1>
        </header>

        <AppSection title="Abiertas (sin login)" items={openApps} />
        <AppSection title="Mixtas (login opcional)" items={mixedApps} />
        <AppSection title="Seguras (login requerido)" items={secureApps} />
      </main>
    </div>
  );

  function AppSection({
    title,
    items,
  }: {
    title: string;
    items: typeof STORE_PRODUCTS;
  }) {
    return (
      <section className="surface-card p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.25em] text-primary/85">{title}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((app) => (
            <article key={app.slug} className="surface-muted p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-black uppercase italic tracking-tight">{app.name}</h3>
                <AccessBadge mode={app.accessMode} />
              </div>
              <p className="mt-2 text-sm text-white/70">{app.shortDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {app.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase text-white/75">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                  <Link href={app.href}>
                    Abrir <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-white/15 bg-[#2f3745] text-white hover:bg-[#394254]">
                  <Link href={`/store/${app.slug}`}>Detalle</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }
}
