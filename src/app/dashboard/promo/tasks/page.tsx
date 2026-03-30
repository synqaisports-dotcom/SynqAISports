
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Lock, 
  Zap, 
  Sparkles, 
  Info, 
  ArrowRight,
  Monitor,
  Flame,
  Dumbbell,
  Wind,
  Search,
  Megaphone,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MAX_WARMUP = 4;
const MAX_MAIN = 12;
const MAX_COOLDOWN = 4;
const TOTAL_MAX = 20;

function resolveSandboxAppBasePath(): "/sandbox/app" | "/dashboard/promo" {
  if (typeof window === "undefined") return "/dashboard/promo";
  const p = window.location.pathname || "";
  return p.startsWith("/sandbox/app") ? "/sandbox/app" : "/dashboard/promo";
}

/**
 * Componente de renderizado de miniatura táctica.
 * Replica de forma simplificada la lógica de dibujo de la pizarra.
 */
function TaskThumbnail({ elements, fieldType = 'f11' }: { elements: any[], fieldType?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !elements) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensiones de la miniatura
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dibujar fondo de campo simplificado
    ctx.fillStyle = fieldType === 'futsal' ? '#0a2e5c' : '#143d14';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.beginPath();
    ctx.moveTo(w/2, 5);
    ctx.lineTo(w/2, h - 5);
    ctx.stroke();

    // Dibujar elementos
    elements.forEach(el => {
      if (!el.points || el.points.length === 0) return;
      
      ctx.save();
      const centerX = (el.points[0].x + (el.points[1]?.x || el.points[0].x)) / 2 * w;
      const centerY = (el.points[0].y + (el.points[1]?.y || el.points[0].y)) / 2 * h;
      
      ctx.translate(centerX, centerY);
      ctx.rotate(el.rotation || 0);
      ctx.translate(-centerX, -centerY);
      
      ctx.strokeStyle = el.color || '#00f2ff';
      ctx.fillStyle = el.color + '44'; // Opacidad baja para el relleno
      ctx.lineWidth = 2;

      const p0 = { x: el.points[0].x * w, y: el.points[0].y * h };
      const p1 = el.points[1] ? { x: el.points[1].x * w, y: el.points[1].y * h } : p0;

      if (el.type === 'player') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (el.type === 'ball') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (['arrow', 'freehand', 'zigzag'].includes(el.type)) {
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      } else if (el.type === 'rect') {
        ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
      } else if (el.type === 'circle') {
        const radius = Math.abs(p1.x - p0.x) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Material genérico (conos, etc)
        ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
      }
      ctx.restore();
    });
  }, [elements, fieldType]);

  return <canvas ref={canvasRef} width={240} height={150} className="w-full h-full object-cover" />;
}

export default function PromoTasksPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [] });

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

  const warmupTasks = (vault.exercises || []).filter((e: any) => e.block === 'warmup');
  const mainTasks = (vault.exercises || []).filter((e: any) => e.block === 'main');
  const cooldownTasks = (vault.exercises || []).filter((e: any) => e.block === 'cooldown');

  const totalUsed = (vault.exercises || []).length;
  const progressPercent = (totalUsed / TOTAL_MAX) * 100;

  const handleDelete = (id: number) => {
    const nextVault = { ...vault, exercises: vault.exercises.filter((e: any) => e.id !== id) };
    setVault(nextVault);
    localStorage.setItem("synq_promo_vault", JSON.stringify(nextVault));
    toast({ title: "SLOT_LIBERADO", description: "Ejercicio eliminado del Sandbox local." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Sandbox_Storage_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            MIS_TAREAS
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Almacenamiento Local Temporal</p>
        </div>

        <div className="w-full lg:w-72 space-y-2">
           <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-primary/60">
              <span>Capacidad Local</span>
              <span>{totalUsed} / {TOTAL_MAX} SLOTS</span>
           </div>
           <Progress value={progressPercent} className="h-2 bg-white/5" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="space-y-16">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">CALENTAMIENTO (Max 4)</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/20 uppercase">{warmupTasks.length} / 4</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: MAX_WARMUP }).map((_, i) => {
                const task = warmupTasks[i];
                return <TaskSlot key={i} task={task} onDelete={handleDelete} type="warmup" />;
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Dumbbell className="h-4 w-4 text-amber-500" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">PARTE PRINCIPAL (Max 12)</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/20 uppercase">{mainTasks.length} / 12</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: MAX_MAIN }).map((_, i) => {
                const task = mainTasks[i];
                return <TaskSlot key={i} task={task} onDelete={handleDelete} type="main" />;
              })}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Wind className="h-4 w-4 text-blue-400" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">VUELTA A LA CALMA (Max 4)</h3>
              </div>
              <Badge variant="outline" className="text-[8px] font-black border-white/5 text-white/20 uppercase">{cooldownTasks.length} / 4</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: MAX_COOLDOWN }).map((_, i) => {
                const task = cooldownTasks[i];
                return <TaskSlot key={i} task={task} onDelete={handleDelete} type="cooldown" />;
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-[background-color,border-color,color,opacity,transform]"><Sparkles className="h-32 w-32 text-primary" /></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">REQUISITO_PRO</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10 leading-loose italic">
              Sincroniza tus tareas con la nube para acceder desde cualquier dispositivo y desbloquea el almacenamiento ilimitado.
            </p>
            <Button className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] shadow-xl border-none" asChild>
              <Link href="/login">Upgrade a Elite Club <ArrowRight className="h-4 w-4 ml-3" /></Link>
            </Button>
          </Card>

          <div className="p-8 border border-white/5 bg-black/40 rounded-[2.5rem] space-y-6">
             <div className="flex items-center gap-3"><Info className="h-4 w-4 text-primary/40" /><span className="text-[10px] font-black uppercase tracking-widest text-white/40">Protocolo Sandbox</span></div>
             <p className="text-[10px] text-white/20 leading-relaxed font-bold uppercase italic">
               Los ejercicios se guardan localmente. Al cargar un ejercicio, podrás editarlo y re-guardarlo en el mismo slot.
             </p>
          </div>

          <div className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center group">
             <Megaphone className="h-10 w-10 text-white/10 mb-4 group-hover:text-primary/20 transition-colors" />
             <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Google_Ad_Slot_Vertical_Sandbox</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TaskSlot({ task, onDelete, type }: { task?: any, onDelete: (id: number) => void, type: string }) {
  const basePath = resolveSandboxAppBasePath();
  if (!task) {
    return (
      <Link href={`${basePath}/board/promo`} className="aspect-video bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-primary/20 hover:bg-primary/5 transition-[background-color,border-color,color,opacity,transform]">
        <Plus className="h-5 w-5 text-white/10 group-hover:text-primary/40 transition-colors" />
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40">Slot Disponible</span>
      </Link>
    );
  }

  return (
    <Card className="aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden relative group">
      {/* Miniatura Dinámica */}
      <div className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity">
        <TaskThumbnail elements={task.elements} fieldType={task.fieldType} />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-[background-color,border-color,color,opacity,transform] z-20">
         <Button variant="ghost" size="icon" className="h-7 w-7 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white/40 hover:text-primary" asChild>
            <Link href={`${basePath}/board/promo?id=${task.id}`}><Monitor className="h-3.5 w-3.5" /></Link>
         </Button>
         <button onClick={() => onDelete(task.id)} className="h-7 w-7 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-500/40 hover:text-rose-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>

      <Link href={`${basePath}/board/promo?id=${task.id}`} className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">
         <p className="text-[9px] font-black text-white uppercase text-center truncate w-full px-2 mt-auto group-hover:cyan-text-glow transition-[background-color,border-color,color,opacity,transform]">EJERCICIO_{task.id.toString().slice(-4)}</p>
      </Link>

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between z-20">
         <Badge variant="outline" className="text-[7px] border-primary/20 text-primary/60 bg-primary/5 uppercase font-black">SINCRO_LOCAL</Badge>
         <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500/40" />
      </div>
    </Card>
  );
}
