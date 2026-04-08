
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { MessageSquareQuote, Gift, Mail, Search, ArrowRight, Activity, Building2, Loader2, RefreshCw, Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type CollabItemRow = {
  id: string;
  submissionType: "feedback" | "lead";
  timestamp: string;
  desc: string;
  email: string | null;
  clubName: string | null;
  contactPerson: string | null;
};

export default function InternalCollaborationTerminal() {
  const { session } = useAuth();
  const [items, setItems] = useState<CollabItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session?.access_token) {
      setItems([]);
      setLoading(false);
      setError("Inicia sesión como superadmin para consultar colaboración.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/collaboration", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        items?: CollabItemRow[];
      };
      if (!res.ok || !j.ok) {
        setError(j.error ?? `HTTP ${res.status}`);
        setItems([]);
      } else {
        setItems(j.items ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((l) => {
      return (
        l.desc.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.clubName ?? "").toLowerCase().includes(q) ||
        (l.contactPerson ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, searchTerm]);

  const leads = filtered.filter((l) => l.submissionType === "lead");
  const feedback = filtered.filter((l) => l.submissionType === "feedback");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquareQuote className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Internal_Communication_Core</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            CENTRO_DE_COLABORACIÓN
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => void load()}
          disabled={loading}
          className="rounded-2xl border-emerald-500/30 text-emerald-400 inline-flex items-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CollabStat label="Leads Pendientes" value={leads.length.toString()} icon={Gift} color="text-emerald-400" />
        <CollabStat label="Feedback Recibido" value={feedback.length.toString()} icon={MessageSquareQuote} color="text-primary" />
        <CollabStat label="Registros Totales" value={filtered.length.toString()} icon={Activity} color="text-white/40" />
      </div>

      {error && (
        <Card className="glass-panel border-amber-500/30 bg-amber-500/5 rounded-2xl">
          <CardContent className="py-4 text-[10px] font-bold text-amber-100/90 uppercase tracking-wide">{error}</CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <TabsList className="bg-black/40 border border-white/10 p-1.5 h-14 rounded-2xl w-full max-w-lg">
            <TabsTrigger value="all" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black flex-1">
              Todos los Registros <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-none">{filtered.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="leads" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black flex-1">
              Alianzas Club <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-none">{leads.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black flex-1">
              Sugerencias <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-none">{feedback.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-4 h-4 w-4 text-emerald-500/40" />
            <Input
              placeholder="FILTRAR POR CLUB, EMAIL O TEXTO..."
              className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase focus:border-emerald-500 transition-[background-color,border-color,color,opacity,transform]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <LoadingState />
            ) : filtered.length > 0 ? (
              filtered.map((log) => (
                <CollabItem key={log.id} log={log} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <div className="grid grid-cols-1 gap-4">
            {loading ? <LoadingState /> : leads.length > 0 ? leads.map(log => <CollabItem key={log.id} log={log} />) : <EmptyState />}
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="grid grid-cols-1 gap-4">
            {loading ? <LoadingState /> : feedback.length > 0 ? feedback.map(log => <CollabItem key={log.id} log={log} />) : <EmptyState />}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CollabStat({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="glass-panel p-6 border-white/5 bg-black/20 rounded-[2rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-[background-color,border-color,color,opacity,transform]">
          <Icon className="h-16 w-16 text-emerald-500" />
       </div>
       <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">{label}</p>
          <p className={cn("text-3xl font-black italic tracking-tighter", color)}>{value}</p>
       </div>
    </Card>
  );
}

function CollabItem({ log }: { log: CollabItemRow }) {
  const isLead = log.submissionType === "lead";
  const mailHref = log.email ? `mailto:${log.email}` : null;
  
  return (
    <Card className={cn(
      "glass-panel border-none bg-black/40 rounded-[2rem] overflow-hidden group transition-[background-color,border-color,color,opacity,transform] hover:bg-white/[0.02]",
      isLead ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-primary"
    )}>
      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          <div className={cn(
            "h-14 w-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12",
            isLead ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-primary/10 border-primary/20 text-primary"
          )}>
            {isLead ? <Building2 className="h-6 w-6" /> : <MessageSquareQuote className="h-6 w-6" />}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <Badge className={cn("text-[8px] font-black uppercase", isLead ? "bg-emerald-500 text-black" : "bg-primary text-black")}>
                 {isLead ? "NUEVA_ALIANZA" : "FEEDBACK_TÁCTICO"}
               </Badge>
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{log.desc}</h4>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3 text-emerald-400/40" />
                  <span className="text-[9px] font-black text-white/40 uppercase">
                    {log.clubName ? `Club: ${log.clubName}` : "Vínculo: Nodo_Sandbox"}
                  </span>
               </div>
               <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-emerald-400/40" />
                  <span className="text-[9px] font-black text-white/40 uppercase">
                    {log.email ? log.email : `ID_RED: 0X${log.id.slice(-6).toUpperCase()}`}
                  </span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
           <Button
             variant="ghost"
             className="h-12 border border-white/5 text-white/40 font-black uppercase text-[9px] tracking-widest rounded-xl hover:text-emerald-400 hover:bg-emerald-500/5"
             onClick={() => {
               if (mailHref) {
                 window.location.href = mailHref;
                 return;
               }
               navigator.clipboard.writeText(log.desc).catch(() => {});
             }}
             title={mailHref ? "Contactar por email" : "Sin email: copia rápida del resumen"}
           >
              Contactar Atleta
           </Button>
           <Button
             className={cn(
               "h-12 text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl border-none shadow-xl",
               isLead ? "bg-emerald-500 emerald-glow" : "bg-primary cyan-glow"
             )}
             onClick={() => {
               const text = `[${isLead ? "LEAD" : "FEEDBACK"}] ${log.desc} | ${log.clubName ?? "SIN_CLUB"} | ${log.email ?? "SIN_EMAIL"}`;
               navigator.clipboard.writeText(text).catch(() => {});
             }}
             title="Copiar resumen para gestión manual"
           >
              Gestionar Lead <ArrowRight className="h-3 w-3 ml-2" />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="p-24 text-center space-y-6 border border-dashed border-white/10 bg-white/[0.01] rounded-[3rem]">
       <Sparkles className="h-12 w-12 text-emerald-500/20 mx-auto animate-pulse" />
       <div className="space-y-2">
          <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">Terminal en espera de flujo de datos</p>
          <p className="text-[9px] font-bold text-white/10 uppercase italic">Los leads del Sandbox aparecerán aquí en tiempo real</p>
       </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-24 text-center space-y-6 border border-dashed border-white/10 bg-white/[0.01] rounded-[3rem]">
      <Loader2 className="h-10 w-10 text-emerald-500/30 mx-auto animate-spin" />
      <p className="text-[10px] font-black text-white/25 uppercase tracking-[0.4em]">CARGANDO_COLABORACION</p>
    </div>
  );
}
