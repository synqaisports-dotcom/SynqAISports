"use client";

import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Sparkles,
  Info,
  ArrowRight,
  Monitor,
  Flame,
  Dumbbell,
  Wind,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

const MAX_WARMUP = 4;
const MAX_MAIN = 12;
const MAX_COOLDOWN = 4;
const TOTAL_MAX = 20;

function resolveSandboxAppBasePath(): "/sandbox/app" | "/dashboard/promo" {
  if (typeof window === "undefined") return "/dashboard/promo";
  const p = window.location.pathname || "";
  return p.startsWith("/sandbox/app") ? "/sandbox/app" : "/dashboard/promo";
}

function TaskThumbnail({ elements, fieldType = "f11" }: { elements: unknown[]; fieldType?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !elements) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = fieldType === "futsal" ? "#0a2e5c" : "#143d14";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.beginPath();
    ctx.moveTo(w / 2, 5);
    ctx.lineTo(w / 2, h - 5);
    ctx.stroke();

    (elements as Array<Record<string, unknown>>).forEach((el) => {
      const points = el.points as Array<{ x: number; y: number }> | undefined;
      if (!points || points.length === 0) return;

      ctx.save();
      const centerX = (points[0].x + (points[1]?.x ?? points[0].x)) / 2 * w;
      const centerY = (points[0].y + (points[1]?.y ?? points[0].y)) / 2 * h;

      ctx.translate(centerX, centerY);
      ctx.rotate((el.rotation as number) || 0);
      ctx.translate(-centerX, -centerY);

      ctx.strokeStyle = (el.color as string) || "#00f2ff";
      ctx.fillStyle = `${String(el.color || "#00f2ff")}44`;
      ctx.lineWidth = 2;

      const p0 = { x: points[0].x * w, y: points[0].y * h };
      const p1 = points[1] ? { x: points[1].x * w, y: points[1].y * h } : p0;

      const type = String(el.type || "");
      if (type === "player") {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (type === "ball") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (["arrow", "freehand", "zigzag"].includes(type)) {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      } else if (type === "rect") {
        ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
      } else if (type === "circle") {
        const radius = Math.abs(p1.x - p0.x) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
      }
      ctx.restore();
    });
  }, [elements, fieldType]);

  return <canvas ref={canvasRef} width={240} height={150} className="w-full h-full object-cover" />;
}

export default function PromoTasksPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<{ exercises: unknown[]; sessions: unknown[] }>({ exercises: [], sessions: [] });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": []}');
      if (saved && Array.isArray(saved.exercises)) {
        setVault(saved);
      }
    } catch (e) {
      console.error("Vault Sync Error:", e);
    }
  }, []);

  const exercises = (vault.exercises || []) as Array<Record<string, unknown>>;
  const warmupTasks = exercises.filter((e) => e.block === "warmup");
  const mainTasks = exercises.filter((e) => e.block === "main");
  const cooldownTasks = exercises.filter((e) => e.block === "cooldown");

  const totalUsed = exercises.length;
  const progressPercent = (totalUsed / TOTAL_MAX) * 100;

  const handleDelete = (id: number) => {
    const nextVault = { ...vault, exercises: exercises.filter((e) => Number(e.id) !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "Slot liberado", description: "Ejercicio eliminado del almacén local." });
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <div
        className={cn(
          "flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none",
          PANEL_OUTER,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <LayoutGrid className={cn(iconCyan, "h-6 w-6 shrink-0")} />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de tareas</p>
            <p className="text-sm font-black uppercase tracking-tight text-white truncate">Almacén local · sandbox</p>
          </div>
        </div>
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-cyan-200/70">
            <span>Capacidad</span>
            <span className="font-mono tabular-nums text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]">
              {totalUsed} / {TOTAL_MAX}
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-2 rounded-none border border-white/10 bg-slate-950/50 [&>div]:bg-cyan-500 [&>div]:shadow-[0_0_12px_rgba(34,211,238,0.5)]"
          />
        </div>
      </div>

      <PromoAdsPanel placement="sandbox_tasks_page_horizontal" />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 lg:gap-8">
        <div className="space-y-6 lg:space-y-8">
          <HubPanel>
            <SectionBar
              title="Calentamiento (máx. 4)"
              right={
                <Badge
                  variant="outline"
                  className="rounded-none border-white/15 text-[9px] font-black uppercase text-cyan-200/80 bg-slate-950/40"
                >
                  {warmupTasks.length} / 4
                </Badge>
              }
            />
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: MAX_WARMUP }).map((_, i) => (
                  <TaskSlot key={i} task={warmupTasks[i]} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </HubPanel>

          <HubPanel>
            <SectionBar
              title="Parte principal (máx. 12)"
              right={
                <Badge
                  variant="outline"
                  className="rounded-none border-white/15 text-[9px] font-black uppercase text-cyan-200/80 bg-slate-950/40"
                >
                  {mainTasks.length} / 12
                </Badge>
              }
            />
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: MAX_MAIN }).map((_, i) => (
                  <TaskSlot key={i} task={mainTasks[i]} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </HubPanel>

          <HubPanel>
            <SectionBar
              title="Vuelta a la calma (máx. 4)"
              right={
                <Badge
                  variant="outline"
                  className="rounded-none border-white/15 text-[9px] font-black uppercase text-cyan-200/80 bg-slate-950/40"
                >
                  {cooldownTasks.length} / 4
                </Badge>
              }
            />
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: MAX_COOLDOWN }).map((_, i) => (
                  <TaskSlot key={i} task={cooldownTasks[i]} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </HubPanel>
        </div>

        <div className="space-y-6">
          <HubPanel>
            <SectionBar title="Modo club" right={<Sparkles className={iconCyan} />} />
            <div className="p-4 sm:p-5 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Sincroniza con la nube para acceso multi-dispositivo y almacenamiento ampliado.
              </p>
              <Button
                className="w-full h-12 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:bg-cyan-400"
                asChild
              >
                <Link href="/login">
                  Upgrade club élite
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </HubPanel>

          <HubPanel>
            <SectionBar title="Protocolo sandbox" right={<Info className={cn(iconCyan, "opacity-70")} />} />
            <div className="p-4 sm:p-5">
              <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wide">
                Los ejercicios se guardan en este dispositivo. Al abrir un slot puedes editar y volver a guardar en la
                misma posición.
              </p>
            </div>
          </HubPanel>
        </div>
      </div>
    </div>
  );
}

function TaskSlot({ task, onDelete }: { task?: Record<string, unknown>; onDelete: (id: number) => void }) {
  const basePath = resolveSandboxAppBasePath();
  if (!task) {
    return (
      <Link
        href={`${basePath}/board/promo`}
        className={cn(
          "aspect-video rounded-none border border-dashed border-white/15 bg-slate-950/35 backdrop-blur-md",
          "flex flex-col items-center justify-center gap-2 group hover:border-cyan-400/35 hover:bg-cyan-500/5 transition-colors",
          PANEL_OUTER,
        )}
      >
        <Plus className="h-5 w-5 text-white/25 group-hover:text-cyan-400 transition-colors" />
        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest group-hover:text-cyan-200/80">
          Slot disponible
        </span>
      </Link>
    );
  }

  const tid = Number(task.id);
  const elements = (task.elements as unknown[]) || [];
  const fieldType = String(task.fieldType || "f11");

  return (
    <div
      className={cn(
        "aspect-video rounded-none border border-white/10 bg-slate-950/50 overflow-hidden relative group",
        PANEL_OUTER,
      )}
    >
      <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <TaskThumbnail elements={elements} fieldType={fieldType} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#050812] via-transparent to-transparent opacity-90" />

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/10 bg-black/55 backdrop-blur-md text-white/50 hover:text-cyan-300" asChild>
          <Link href={`${basePath}/board/promo?id=${tid}`}>
            <Monitor className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <button
          type="button"
          onClick={() => onDelete(tid)}
          className="h-8 w-8 rounded-none border border-white/10 bg-black/55 backdrop-blur-md flex items-center justify-center text-rose-400/50 hover:text-rose-400"
          aria-label="Eliminar ejercicio"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <Link href={`${basePath}/board/promo?id=${tid}`} className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
        <p className="text-[9px] font-black text-white uppercase text-center truncate w-full px-2 mt-auto drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
          EJERCICIO_{String(tid).slice(-4)}
        </p>
      </Link>

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/55 backdrop-blur-md border-t border-white/10 flex items-center justify-between z-20">
        <Badge variant="outline" className="rounded-none text-[7px] border-cyan-400/25 text-cyan-300/80 bg-cyan-500/10 uppercase font-black">
          Local
        </Badge>
        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
      </div>
    </div>
  );
}
