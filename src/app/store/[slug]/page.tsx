import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStoreProductBySlug, STORE_PRODUCTS } from "@/lib/store-catalog";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return STORE_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default function StoreAppDetailPage({ params }: Props) {
  const app = getStoreProductBySlug(params.slug);
  if (!app) return notFound();

  const securityLabel =
    app.accessMode === "open"
      ? "Sin login inicial"
      : app.accessMode === "optional_login"
        ? "Login opcional"
        : "Login requerido";

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Store</p>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter cyan-text-glow">{app.name}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{app.shortDescription}</p>
          </div>
          <Button asChild variant="outline" className="rounded-2xl border-primary/20 text-primary">
            <Link href="/store">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-panel border-primary/20 bg-black/30 lg:col-span-2 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.35em] text-primary">Resumen operativo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoLine icon={ShieldCheck} label="Tipo de acceso" value={securityLabel} />
                <InfoLine icon={Smartphone} label="URL App" value={app.href} mono />
                <InfoLine icon={app.accessMode === "login_required" ? Lock : Download} label="Instalable" value="PWA / URL directa" />
                <InfoLine icon={CheckCircle2} label="Estado" value="Activa" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Normas de producto</p>
                <ul className="mt-3 space-y-2 text-[10px] font-bold uppercase tracking-widest text-white/45">
                  <li>• Cada micro-app tiene su propia URL y ciclo de evolución.</li>
                  <li>• Login unificado cuando aplique sincronización/seguridad.</li>
                  <li>• Superficies críticas de club siempre bajo permisos de rol.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-primary/20 bg-black/30 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-[0.35em] text-primary">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full h-12 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest border-none">
                <Link href={app.href}>
                  Abrir app <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-2xl border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest">
                <Link href="/login">Login unificado</Link>
              </Button>
              <div className="pt-2">
                <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                  {app.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoLine(props: { icon: any; label: string; value: string; mono?: boolean }) {
  const Icon = props.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-[9px] font-black uppercase tracking-widest text-primary/70">{props.label}</p>
      </div>
      <p className={`mt-2 text-[10px] font-black uppercase tracking-widest text-white ${props.mono ? "break-all" : ""}`}>{props.value}</p>
    </div>
  );
}

