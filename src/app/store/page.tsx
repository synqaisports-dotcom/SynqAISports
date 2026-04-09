"use client";

import Link from "next/link";
import { ArrowRight, Download, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STORE_PRODUCTS } from "@/lib/store-catalog";

export default function StorePage() {
  return (
    <main className="min-h-screen public-shell-bg text-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">SynqAI Store</span>
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black italic uppercase tracking-tighter cyan-text-glow">
            Catálogo de Micro-Apps
          </h1>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/45 max-w-4xl">
            Instala y abre productos por URL independiente. Algunas apps son abiertas sin login; otras requieren autenticación para datos de club.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {STORE_PRODUCTS.map((app) => {
            const requiresLogin = app.accessMode === "login_required";
            const optionalLogin = app.accessMode === "optional_login";
            return (
              <Card key={app.slug} className="surface-card border-primary/25 bg-[#222a35] rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight">{app.name}</CardTitle>
                    {requiresLogin ? (
                      <Badge variant="outline" className="border-rose-500/25 text-rose-300 text-[9px] font-black uppercase tracking-widest">
                        <Lock className="h-3 w-3 mr-1" /> Secure
                      </Badge>
                    ) : optionalLogin ? (
                      <Badge variant="outline" className="border-amber-500/25 text-amber-300 text-[9px] font-black uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3 mr-1" /> Mixed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/25 text-emerald-300 text-[9px] font-black uppercase tracking-widest">
                        <Download className="h-3 w-3 mr-1" /> Open
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-relaxed">{app.shortDescription}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {app.tags.slice(0, 4).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Button asChild className="h-11 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest border-none">
                      <Link href={`/store/${app.slug}`}>Ver detalle</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-2xl border-white/15 text-white font-black uppercase text-[10px] tracking-widest bg-[#2b3342] hover:bg-[#353f52]"
                    >
                      <Link href={app.href}>
                        Abrir <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}

