
"use client";

import { useState, useEffect } from "react";
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
  Megaphone
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

export default function PromoTasksPage() {
  const { toast } = useToast();
  const [vault, setVault] = useState<any>({ exercises: [], sessions: [] });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": []}');
    setVault(saved);
  }, []);

  const warmupTasks = vault.exercises.filter((e: any) => e.block === 'warmup');
  const mainTasks = vault.exercises.filter((e: any) => e.block === 'main');
  const cooldownTasks = vault.exercises.filter((e: any) => e.block === 'cooldown');

  const totalUsed = vault.exercises.length;
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
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
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
          {/* SECCIÓN CALENTAMIENTO */}
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

          {/* SECCIÓN PARTE PRINCIPAL */}
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

          {/* SECCIÓN VUELTA A LA CALMA */}
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
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Sparkles className="h-32 w-32 text-primary" /></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">REQUISITO_PRO</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10 leading-loose italic">
              Sincroniza tus tareas con la nube para acceder desde cualquier dispositivo y desbloquea el almacenamiento ilimitado.
            </p>
            <Button className="w-full h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-all shadow-xl border-none" asChild>
              <Link href="/login">Upgrade a Elite Club <ArrowRight className="h-4 w-4 ml-3" /></Link>
            </Button>
          </Card>

          <div className="p-8 border border-white/5 bg-black/40 rounded-[2.5rem] space-y-6">
             <div className="flex items-center gap-3"><Info className="h-4 w-4 text-primary/40" /><span className="text-[10px] font-black uppercase tracking-widest text-white/40">Protocolo Sandbox</span></div>
             <p className="text-[10px] text-white/20 leading-relaxed font-bold uppercase italic">
               Los ejercicios se guardan mediante IndexedDB en este navegador. Si borras el historial o cambias de dispositivo, perderás el acceso a estos slots.
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
  if (!task) {
    return (
      <Link href="/board/promo" className="aspect-video bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-primary/20 hover:bg-primary/5 transition-all">
        <Plus className="h-5 w-5 text-white/10 group-hover:text-primary/40 transition-colors" />
        <span className="text-[8px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary/40">Slot Disponible</span>
      </Link>
    );
  }

  return (
    <Card className="aspect-video bg-black border border-white/10 rounded-2xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
         <button className="h-7 w-7 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-white/40 hover:text-primary"><Monitor className="h-3.5 w-3.5" /></button>
         <button onClick={() => onDelete(task.id)} className="h-7 w-7 bg-black/60 backdrop-blur-md rounded-lg flex items-center justify-center text-rose-500/40 hover:text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
         <Zap className="h-6 w-6 text-primary/20 mb-2" />
         <p className="text-[9px] font-black text-white/60 uppercase text-center truncate w-full px-2">EJERCICIO_{task.id.toString().slice(-4)}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
         <Badge variant="outline" className="text-[7px] border-white/10 text-white/40">SINCRO_LOCAL</Badge>
         <Lock className="h-2.5 w-2.5 text-white/10" />
      </div>
    </Card>
  );
}
