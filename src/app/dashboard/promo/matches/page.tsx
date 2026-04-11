"use client";

import { useState, useEffect } from "react";
import { Swords, Plus, Trash2, Pencil, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  inputProClass,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

const MAX_MATCHES = 20;

type PromoMatch = {
  id: number;
  date?: string;
  rivalName?: string;
  location?: string;
  status?: string;
  score?: { home?: number; guest?: number };
};

type PromoVault = {
  exercises?: unknown[];
  sessions?: unknown[];
  matches?: PromoMatch[];
};

function resolveSandboxBoardBase(): "/sandbox/app/board" | "/board" {
  if (typeof window === "undefined") return "/board";
  const p = window.location.pathname || "";
  return p.startsWith("/sandbox/app") ? "/sandbox/app/board" : "/board";
}

const selectTriggerHub =
  "h-12 rounded-none border-white/10 bg-slate-950/50 backdrop-blur-md text-[10px] font-black uppercase text-cyan-100 " +
  "focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400";

const selectContentHub = "rounded-none border-white/10 bg-[#0a1220] backdrop-blur-xl z-[200]";

export default function PromoMatchesPage() {
  const { toast } = useToast();
  const boardBase = resolveSandboxBoardBase();
  const [vault, setVault] = useState<PromoVault>({ exercises: [], sessions: [], matches: [] });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    rival: "",
    date: new Date().toISOString().split("T")[0],
    location: "Local",
    status: "Scheduled",
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || "{}") as PromoVault;
      setVault({
        exercises: Array.isArray(saved.exercises) ? saved.exercises : [],
        sessions: Array.isArray(saved.sessions) ? saved.sessions : [],
        matches: Array.isArray(saved.matches) ? saved.matches : [],
      });
    } catch {
      setVault({ exercises: [], sessions: [], matches: [] });
    }
  }, []);

  const matches = Array.isArray(vault.matches) ? vault.matches : [];
  const totalUsed = matches.length;
  const progressPercent = (totalUsed / MAX_MATCHES) * 100;

  const handleOpenCreate = () => {
    setEditingMatchId(null);
    setFormData({
      rival: "",
      date: new Date().toISOString().split("T")[0],
      location: "Local",
      status: "Scheduled",
    });
    setIsSheetOpen(true);
  };

  const handleEditMatch = (match: PromoMatch) => {
    setEditingMatchId(String(match.id));
    setFormData({
      rival: String(match.rivalName || "").trim(),
      date: String(match.date || new Date().toISOString().split("T")[0]),
      location: String(match.location || "Local"),
      status: String(match.status || "Scheduled"),
    });
    setIsSheetOpen(true);
  };

  const handleUpsertMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const rival = String(formData.rival || "").trim();
    const date = String(formData.date || "").trim();
    if (!rival || !date) {
      toast({ variant: "destructive", title: "Datos incompletos", description: "Rival y fecha son obligatorios." });
      return;
    }

    if (!editingMatchId && totalUsed >= MAX_MATCHES) {
      toast({ variant: "destructive", title: "Cuota agotada", description: "Límite de 20 partidos locales." });
      return;
    }

    const payload = {
      date,
      rivalName: rival.toUpperCase(),
      location: formData.location,
      status: formData.status,
    };

    const nextMatches = editingMatchId
      ? matches.map((m) =>
          String(m.id) === editingMatchId
            ? { ...m, ...payload, score: m.score ?? { home: 0, guest: 0 } }
            : m,
        )
      : [
          {
            id: Date.now(),
            ...payload,
            score: { home: 0, guest: 0 },
          },
          ...matches,
        ];

    const nextVault = { ...vault, matches: nextMatches };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    setIsSheetOpen(false);
    setEditingMatchId(null);
    toast({
      title: editingMatchId ? "Partido actualizado" : "Partido agendado",
      description: editingMatchId ? "Datos guardados en el nodo local." : "Encuentro añadido al calendario sandbox.",
    });
  };

  const handleDeleteMatch = (id: number) => {
    const nextVault = { ...vault, matches: matches.filter((m) => m.id !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "Slot liberado", description: "Partido eliminado del historial local." });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <div
        className={cn(
          "flex flex-col lg:flex-row flex-wrap items-stretch lg:items-center justify-between gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none",
          PANEL_OUTER,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Swords className={cn(iconCyan, "h-6 w-6 shrink-0")} />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de partidos</p>
            <p className="text-sm font-black uppercase tracking-tight text-white truncate">Calendario local · sandbox</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:justify-end">
          <div className="w-full sm:w-48 space-y-2">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-cyan-200/70">
              <span>Slots</span>
              <span className="font-mono tabular-nums text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]">
                {totalUsed} / {MAX_MATCHES}
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-2 rounded-none border border-white/10 bg-slate-950/50 [&>div]:bg-cyan-500 [&>div]:shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />
          </div>
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-11 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest px-6 border-0 shadow-[0_0_24px_rgba(6,182,212,0.55)] hover:bg-cyan-400 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agendar partido
          </Button>
        </div>
      </div>

      <PromoAdsPanel placement="sandbox_matches_page_horizontal" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5 auto-rows-max min-w-0">
          {matches.map((match) => (
            <div key={match.id} className="group min-w-0">
            <HubPanel>
              <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="rounded-none border-cyan-400/25 text-[8px] font-black text-cyan-200/90 bg-slate-950/40"
                    >
                      {match.date}
                    </Badge>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{match.location}</span>
                  </div>
                  <p className="text-sm font-black text-white uppercase tracking-tight truncate">vs {match.rivalName}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                  <button
                    type="button"
                    onClick={() => handleEditMatch(match)}
                    className="p-2 rounded-none border border-white/10 bg-slate-950/50 text-cyan-400/70 hover:text-cyan-300"
                    title="Modificar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMatch(match.id)}
                    className="p-2 rounded-none border border-white/10 bg-slate-950/50 text-rose-400/60 hover:text-rose-400"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-center gap-6 py-4 rounded-none border border-white/10 bg-slate-950/40">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Local</p>
                    <p className="font-mono text-3xl font-black text-cyan-300 drop-shadow-[0_0_14px_rgba(34,211,238,0.45)]">
                      {match.score?.home ?? 0}
                    </p>
                  </div>
                  <div className="text-xl font-black text-cyan-500/30">—</div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Rival</p>
                    <p className="font-mono text-3xl font-black text-white">{match.score?.guest ?? 0}</p>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4">
                <Button
                  variant="ghost"
                  className="w-full h-10 rounded-none border border-white/10 text-[9px] font-black uppercase text-cyan-300 tracking-widest hover:bg-cyan-500/10 hover:border-cyan-400/30"
                  asChild
                >
                  <Link href={`${boardBase}/match?source=sandbox&matchId=${encodeURIComponent(String(match.id))}`}>
                    Dirigir partido
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </HubPanel>
            </div>
          ))}

          {totalUsed < MAX_MATCHES ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className={cn(
                "group min-h-[240px] rounded-none border border-dashed border-white/15 bg-slate-950/25 backdrop-blur-md",
                "flex flex-col items-center justify-center gap-3 hover:border-cyan-400/35 hover:bg-cyan-500/[0.04] transition-colors",
                PANEL_OUTER,
              )}
            >
              <div className="h-12 w-12 rounded-none border border-white/10 bg-slate-900/50 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                <Plus className="h-6 w-6 text-white/25 group-hover:text-cyan-400" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-cyan-200/90">
                Añadir slot de temporada
              </span>
            </button>
          ) : null}
        </div>

        <div className="space-y-6">
          <HubPanel>
            <SectionBar title="Marcador y pizarra" right={<Zap className={iconCyan} />} />
            <div className="p-4 sm:p-5 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Al guardar en la pizarra de partido, el marcador se refleja aquí en tu calendario local.
              </p>
              <div className="p-4 rounded-none border border-cyan-400/20 bg-cyan-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[9px] font-black uppercase text-cyan-200/80 tracking-widest">Modo club</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase">
                  En élite: sincronización con familias y analíticas por jugador.
                </p>
                <Button
                  className="w-full h-11 rounded-none bg-cyan-500 text-black font-black uppercase text-[9px] tracking-widest border-0 shadow-[0_0_22px_rgba(6,182,212,0.5)] hover:bg-cyan-400"
                  asChild
                >
                  <Link href="/login">Upgrade a pro</Link>
                </Button>
              </div>
            </div>
          </HubPanel>

          <PromoAdsPanel placement="sandbox_matches_sidebar_horizontal" sectionTitle="Espacio publicitario" />
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="rounded-none bg-[#050812]/98 backdrop-blur-2xl border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden flex flex-col z-[200]"
        >
          <div className="p-6 border-b border-white/10 bg-slate-900/40">
            <SheetHeader className="space-y-2 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Despliegue de partido</p>
              <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white">
                {editingMatchId ? "Modificar partido" : "Agendar partido"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <form id="promo-match-upsert" onSubmit={handleUpsertMatch} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Nombre del rival</Label>
              <Input
                required
                value={formData.rival}
                onChange={(e) => setFormData({ ...formData, rival: e.target.value })}
                placeholder="EJ: CLUB CIUDAD"
                className={cn(inputProClass, "h-12")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Fecha</Label>
              <Input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={cn(inputProClass, "h-12 [color-scheme:dark]")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Ubicación</Label>
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger className={selectTriggerHub}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentHub}>
                    <SelectItem value="Local" className="text-[10px] font-black uppercase rounded-none">
                      En casa
                    </SelectItem>
                    <SelectItem value="Visitante" className="text-[10px] font-black uppercase rounded-none">
                      Fuera
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Estado</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger className={selectTriggerHub}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentHub}>
                    <SelectItem value="Scheduled" className="text-[10px] font-black uppercase rounded-none">
                      Programado
                    </SelectItem>
                    <SelectItem value="Played" className="text-[10px] font-black uppercase rounded-none">
                      Finalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-none border border-cyan-400/20 bg-cyan-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[9px] font-black uppercase text-cyan-200/80 tracking-widest">Slot local</span>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed font-bold uppercase">
                Este slot vincula cronómetro y marcador durante el partido en la pizarra.
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
              type="submit"
              form="promo-match-upsert"
              className="flex-[2] h-12 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.55)] hover:bg-cyan-400"
            >
              {editingMatchId ? "Actualizar" : "Guardar partido"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
