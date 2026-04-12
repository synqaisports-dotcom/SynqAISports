"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Trash2,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  CalendarDays,
  ShieldCheck,
  Smartphone,
  Download,
  ClipboardList,
  Flame,
  Dumbbell,
  Wind,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDocumentJson, upsertDocument } from "@/lib/local-db/database-service";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  inputProClass,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

const MAX_SESSIONS = 4;

function resolveSandboxAppBasePath(): "/sandbox/app" | "/dashboard/promo" {
  if (typeof window === "undefined") return "/dashboard/promo";
  const p = window.location.pathname || "";
  return p.startsWith("/sandbox/app") ? "/sandbox/app" : "/dashboard/promo";
}

function resolveSandboxBoardHref(kind: "match" | "promo", opts?: { id?: string | number }): string {
  const base = resolveSandboxAppBasePath();
  const inApp = base === "/sandbox/app";
  if (kind === "match") {
    return inApp ? "/sandbox/app/board/match?source=sandbox" : "/board/match?source=sandbox";
  }
  const id = opts?.id != null ? String(opts.id) : "";
  const q = id ? `?id=${encodeURIComponent(id)}` : "";
  return inApp ? `/sandbox/app/board/promo${q}` : `/board/promo${q}`;
}

const selectTriggerHub =
  "h-12 rounded-none border-white/10 bg-slate-950/50 backdrop-blur-md text-[10px] font-black uppercase text-cyan-100 " +
  "focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400";

const selectContentHub = "rounded-none border-white/10 bg-[#0a1220] backdrop-blur-xl z-[200]";

export default function PromoSessionsPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<{ exercises: unknown[]; sessions: unknown[] }>({ exercises: [], sessions: [] });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    warmupId: "",
    mainId: "",
    cooldownId: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const fromDb = await getDocumentJson<{ exercises?: unknown[]; sessions?: unknown[] } | null>(
          "sandbox-coach",
          "vault",
          "promo_vault",
          null,
        );
        const saved =
          fromDb ??
          JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": []}');
        setVault(saved);
      } catch {
        setVault({ exercises: [], sessions: [] });
      }
    })();
  }, []);

  const exercises = (vault.exercises || []) as Array<Record<string, unknown>>;
  const sessions = (vault.sessions || []) as Array<Record<string, unknown>>;
  const warmupTasks = exercises.filter((e) => e.block === "warmup");
  const mainTasks = exercises.filter((e) => e.block === "main");
  const cooldownTasks = exercises.filter((e) => e.block === "cooldown");

  const handleDeleteSession = (id: number) => {
    const nextVault = { ...vault, sessions: sessions.filter((s) => Number(s.id) !== id) };
    setVault(nextVault);
    void upsertDocument("sandbox-coach", "vault", "promo_vault", nextVault);
    toast({ title: "Sesión liberada", description: "Plan eliminado de la agenda local." });
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessions.length >= MAX_SESSIONS) {
      toast({ variant: "destructive", title: "Cuota agotada", description: "Límite de 4 sesiones alcanzado." });
      return;
    }

    const newSession = {
      id: Date.now(),
      title: formData.title.toUpperCase() || `SESIÓN_${sessions.length + 1}`,
      createdAt: new Date().toISOString().split("T")[0],
      warmup: warmupTasks.find((t) => String(t.id) === formData.warmupId),
      main: mainTasks.find((t) => String(t.id) === formData.mainId),
      cooldown: cooldownTasks.find((t) => String(t.id) === formData.cooldownId),
    };

    const nextVault = { ...vault, sessions: [newSession, ...sessions] };
    setVault(nextVault);
    void upsertDocument("sandbox-coach", "vault", "promo_vault", nextVault);
    setIsSheetOpen(false);
    setFormData({ title: "", warmupId: "", mainId: "", cooldownId: "" });
    toast({ title: "Sesión planificada", description: "Plan añadido a tu agenda sandbox." });
  };

  const handlePrintSession = () => {
    toast({
      title: "Generando ficha",
      description: "Preparando documento con los tres bloques.",
    });
    window.setTimeout(() => {
      window.print();
    }, 600);
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 print:p-0 print:bg-white">
      <div
        className={cn(
          "flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none print:border-black/10",
          PANEL_OUTER,
        )}
      >
        <div className="flex items-center gap-3 min-w-0 print:hidden">
          <Calendar className={cn(iconCyan, "h-6 w-6 shrink-0")} />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de agenda</p>
            <p className="text-sm font-black uppercase tracking-tight text-white truncate">Planificación local · sandbox</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 print:hidden">
          <Badge
            variant="outline"
            className="rounded-none border-cyan-400/25 text-cyan-200 font-black uppercase text-[9px] tracking-widest px-4 py-2 justify-center bg-slate-950/40"
          >
            Cuota:{" "}
            <span className="font-mono tabular-nums text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)] ml-1">
              {sessions.length} / {MAX_SESSIONS}
            </span>
          </Badge>
          <Button
            onClick={handlePrintSession}
            className="h-11 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest px-6 border-0 shadow-[0_0_24px_rgba(6,182,212,0.55)] hover:bg-cyan-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Ficha de sesión
          </Button>
        </div>
      </div>

      <PromoAdsPanel placement="sandbox_sessions_page_horizontal" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 print:grid-cols-1">
        {Array.from({ length: MAX_SESSIONS }).map((_, i) => {
          const session = sessions[i] as
            | {
                id: number;
                title: string;
                warmup?: unknown;
                main?: unknown;
                cooldown?: unknown;
              }
            | undefined;
          return (
            <div key={i} className="space-y-3 print:mb-8">
              <div className="flex items-center justify-between px-1 print:hidden">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Slot 0{i + 1}</span>
                {session ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(session.id)}
                    className="text-rose-400/50 hover:text-rose-400 transition-colors p-1"
                    aria-label="Eliminar sesión"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              {session ? (
                <HubPanel>
                  <SectionBar
                    title={session.title}
                    right={<Clock className={cn(iconCyan, "h-4 w-4 opacity-80")} />}
                  />
                  <div className="p-4 sm:p-5 space-y-3 print:bg-white">
                    <p className="text-[8px] font-bold text-cyan-300/60 uppercase tracking-[0.2em] print:text-black/50">
                      ID {String(session.id).slice(-4)}
                    </p>
                    <SessionPart label="Activación" status={session.warmup ? "Sincronizado" : "Pendiente"} active={!!session.warmup} />
                    <SessionPart label="Parte principal" status={session.main ? "Sincronizado" : "Pendiente"} active={!!session.main} />
                    <SessionPart label="Vuelta a la calma" status={session.cooldown ? "Sincronizado" : "Pendiente"} active={!!session.cooldown} />
                    <div className="pt-2 print:hidden">
                      <Button
                        variant="ghost"
                        className="w-full h-10 rounded-none border border-white/10 text-[9px] font-black text-cyan-300 uppercase tracking-widest hover:bg-cyan-500/10 hover:border-cyan-400/30"
                        asChild
                      >
                        <Link href={resolveSandboxBoardHref("match")}>
                          Dirigir en partido
                          <ArrowRight className="h-3 w-3 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </HubPanel>
              ) : (
                <Sheet open={isSheetOpen && i === sessions.length} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      disabled={i !== sessions.length}
                      className={cn(
                        "group min-h-[320px] lg:min-h-[380px] w-full rounded-none border border-dashed border-white/15",
                        "bg-slate-950/25 backdrop-blur-md flex flex-col items-center justify-center gap-3",
                        "hover:border-cyan-400/35 hover:bg-cyan-500/[0.04] transition-colors print:hidden",
                        "disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:border-white/15",
                        PANEL_OUTER,
                      )}
                    >
                      <div className="h-12 w-12 rounded-none border border-white/10 bg-slate-900/50 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                        <Plus className="h-6 w-6 text-white/20 group-hover:text-cyan-400" />
                      </div>
                      <div className="text-center space-y-1 px-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-200/90">
                          Crear plan diario
                        </p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Slot disponible</p>
                      </div>
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="rounded-none bg-[#050812]/98 backdrop-blur-2xl border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden flex flex-col z-[200]"
                  >
                    <div className="p-6 border-b border-white/10 bg-slate-900/40">
                      <SheetHeader className="space-y-3 text-left">
                        <div className="flex items-center gap-2">
                          <ClipboardList className={cn(iconCyan, "h-5 w-5")} />
                          <span className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Arquitecto de sesión</span>
                        </div>
                        <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white">
                          Planificar <span className="text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">día</span>
                        </SheetTitle>
                        <SheetDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-left">
                          Vincula tareas del almacén local a esta sesión.
                        </SheetDescription>
                      </SheetHeader>
                    </div>

                    <form onSubmit={handleCreateSession} className="flex-1 overflow-y-auto p-6 space-y-8">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Identificador</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                          placeholder="EJ: MICROCICLO_01"
                          className={cn(inputProClass, "h-12 text-sm")}
                        />
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]" />
                            <Label className="text-[9px] font-black uppercase tracking-widest text-white">1. Activación</Label>
                          </div>
                          {warmupTasks.length > 0 ? (
                            <Select value={formData.warmupId} onValueChange={(v) => setFormData({ ...formData, warmupId: v })}>
                              <SelectTrigger className={selectTriggerHub}>
                                <SelectValue placeholder="Seleccionar tarea…" />
                              </SelectTrigger>
                              <SelectContent className={selectContentHub}>
                                {warmupTasks.map((t) => (
                                  <SelectItem key={String(t.id)} value={String(t.id)} className="text-[10px] font-black uppercase rounded-none">
                                    {(t.metadata as { title?: string } | undefined)?.title || `Tarea_${String(t.id).slice(-4)}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Link
                              href={resolveSandboxBoardHref("promo")}
                              className="flex items-center justify-between p-3 rounded-none border border-dashed border-orange-400/25 bg-orange-500/5 hover:border-orange-400/45 transition-colors"
                            >
                              <span className="text-[9px] font-bold text-orange-300/70 uppercase tracking-widest">Sin tareas warmup</span>
                              <Pencil className="h-3 w-3 text-orange-400/60" />
                            </Link>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]" />
                            <Label className="text-[9px] font-black uppercase tracking-widest text-white">2. Parte principal</Label>
                          </div>
                          {mainTasks.length > 0 ? (
                            <Select value={formData.mainId} onValueChange={(v) => setFormData({ ...formData, mainId: v })}>
                              <SelectTrigger className={selectTriggerHub}>
                                <SelectValue placeholder="Seleccionar tarea…" />
                              </SelectTrigger>
                              <SelectContent className={selectContentHub}>
                                {mainTasks.map((t) => (
                                  <SelectItem key={String(t.id)} value={String(t.id)} className="text-[10px] font-black uppercase rounded-none">
                                    {(t.metadata as { title?: string } | undefined)?.title || `Tarea_${String(t.id).slice(-4)}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Link
                              href={resolveSandboxBoardHref("promo")}
                              className="flex items-center justify-between p-3 rounded-none border border-dashed border-amber-400/25 bg-amber-500/5 hover:border-amber-400/45 transition-colors"
                            >
                              <span className="text-[9px] font-bold text-amber-300/70 uppercase tracking-widest">Sin tareas main</span>
                              <Pencil className="h-3 w-3 text-amber-400/60" />
                            </Link>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.35)]" />
                            <Label className="text-[9px] font-black uppercase tracking-widest text-white">3. Vuelta a la calma</Label>
                          </div>
                          {cooldownTasks.length > 0 ? (
                            <Select value={formData.cooldownId} onValueChange={(v) => setFormData({ ...formData, cooldownId: v })}>
                              <SelectTrigger className={selectTriggerHub}>
                                <SelectValue placeholder="Seleccionar tarea…" />
                              </SelectTrigger>
                              <SelectContent className={selectContentHub}>
                                {cooldownTasks.map((t) => (
                                  <SelectItem key={String(t.id)} value={String(t.id)} className="text-[10px] font-black uppercase rounded-none">
                                    {(t.metadata as { title?: string } | undefined)?.title || `Tarea_${String(t.id).slice(-4)}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Link
                              href={resolveSandboxBoardHref("promo")}
                              className="flex items-center justify-between p-3 rounded-none border border-dashed border-sky-400/25 bg-sky-500/5 hover:border-sky-400/45 transition-colors"
                            >
                              <span className="text-[9px] font-bold text-sky-300/70 uppercase tracking-widest">Sin tareas cool</span>
                              <Pencil className="h-3 w-3 text-sky-400/60" />
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-none border border-cyan-400/20 bg-cyan-500/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="text-[9px] font-black uppercase text-cyan-200/80 tracking-widest">Composición</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase">
                          Las tareas no asignadas aparecerán como pendientes en la tarjeta de sesión.
                        </p>
                      </div>
                    </form>

                    <div className="p-6 border-t border-white/10 bg-slate-950/50 flex gap-3">
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          className="flex-1 h-12 rounded-none border border-white/10 text-cyan-200/70 font-black uppercase text-[10px] tracking-widest hover:bg-white/5"
                        >
                          Cancelar
                        </Button>
                      </SheetClose>
                      <Button
                        type="button"
                        onClick={handleCreateSession}
                        className="flex-[2] h-12 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.55)] hover:bg-cyan-400"
                      >
                        Ensamblar plan
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          );
        })}
      </div>

      <HubPanel>
        <SectionBar title="Profesionalización del club" right={<Zap className={iconCyan} />} />
        <div className="p-5 sm:p-6 relative overflow-hidden print:hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.06] pointer-events-none" />
          <div className="absolute top-2 right-2 opacity-[0.06] pointer-events-none">
            <CalendarDays className="h-32 w-32 text-cyan-400" />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/75">Macrociclo y metodología</p>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                Planificación sin límites <span className="text-cyan-300 drop-shadow-[0_0_16px_rgba(34,211,238,0.45)]">para tu club</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                Histórico, asistencia y sincronización multiplataforma fuera del modo promo sandbox.
              </p>
            </div>
            <Button
              className="h-12 px-8 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.55)] hover:bg-cyan-400 shrink-0"
              asChild
            >
              <Link href="/login">
                Modo pro
                <Zap className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </HubPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <HubPanel>
          <SectionBar title="Watch link" right={<Smartphone className={cn(iconCyan, "opacity-80")} />} />
          <div className="p-4 sm:p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              En promo puedes usar cronómetro y marcador en el reloj cuando esté disponible.
            </p>
          </div>
        </HubPanel>
        <PromoAdsPanel placement="sandbox_sessions_footer_horizontal" sectionTitle="Espacio publicitario" />
      </div>
    </div>
  );
}

function SessionPart({ label, status, active }: { label: string; status: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-none border bg-slate-950/40 backdrop-blur-md transition-colors print:bg-white print:border-black/10",
        active ? "border-white/10 hover:border-cyan-400/25" : "border-dashed border-white/10 opacity-50",
      )}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest print:text-black/45">{label}</span>
        <span className={cn("text-[10px] font-black uppercase mt-0.5 truncate print:text-black", active ? "text-white" : "text-slate-600")}>
          {status}
        </span>
      </div>
      {active ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)] print:text-emerald-600" />
      ) : (
        <Clock className="h-4 w-4 shrink-0 text-slate-600" />
      )}
    </div>
  );
}
