
"use client";

import { useState } from "react";
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Trophy, 
  Target, 
  Activity, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  UserCircle,
  LayoutGrid,
  Filter,
  ShieldCheck,
  Star,
  Clock,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MOCK_COACH_TASKS = [
  { id: "ct1", title: "Rondo Dinámico 3v1", stage: "Alevín", dimension: "Técnica", type: "Private", duration: "15 min", color: "border-primary/30" },
  { id: "ct2", title: "Salida de Balón Infantil", stage: "Infantil", dimension: "Táctica", type: "Official", duration: "20 min", color: "border-amber-500/30" },
  { id: "ct3", title: "Duelo 1v1 + Portero", stage: "Alevín", dimension: "Táctica", type: "Private", duration: "10 min", color: "border-primary/30" },
];

export default function CoachLibraryGrid() {
  const [activeTab, setActiveTab] = useState("my-tasks");

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <Dumbbell className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Coach_Personal_Playbook</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            CUADERNO_DE_CAMPO
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Gestión de Tareas y Manual de Club</p>
        </div>
        
        <Button className="rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest h-14 px-10 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 active:scale-95 transition-all border-none">
          <Plus className="h-5 w-5 mr-3" /> Diseñar Nueva Tarea
        </Button>
      </div>

      <Tabs defaultValue="my-tasks" onValueChange={setActiveTab} className="w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="bg-black/40 border border-white/10 p-1.5 h-14 rounded-2xl w-full max-w-md">
            <TabsTrigger value="my-tasks" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black flex-1">
              Mis Tareas <Badge className="ml-2 bg-primary/20 text-primary text-[8px] border-none">08</Badge>
            </TabsTrigger>
            <TabsTrigger value="club-library" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-black flex-1">
              Manual del Club <Badge className="ml-2 bg-amber-500/20 text-amber-500 text-[8px] border-none">42</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-4 h-4 w-4 text-primary/40" />
            <Input placeholder="FILTRAR POR TEMA TÁCTICO..." className="h-14 pl-12 bg-white/5 border-white/10 rounded-2xl text-[10px] font-black uppercase focus:border-primary transition-all" />
          </div>
        </div>

        <TabsContent value="my-tasks" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {MOCK_COACH_TASKS.filter(t => t.type === 'Private').map((task) => (
              <TaskCard key={task.id} task={task} theme="cyan" />
            ))}
            <div className="aspect-video border-2 border-dashed border-primary/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 group hover:border-primary/30 transition-all cursor-pointer bg-primary/5">
               <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-primary" />
               </div>
               <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Añadir Nueva Variante</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="club-library" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {MOCK_COACH_TASKS.filter(t => t.type === 'Official').map((task) => (
              <TaskCard key={task.id} task={task} theme="amber" />
            ))}
            <div className="xl:col-span-2 p-10 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] flex items-center gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><ShieldCheck className="h-32 w-32 text-amber-500" /></div>
               <div className="h-20 w-20 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <Star className="h-10 w-10 text-amber-500" />
               </div>
               <div className="space-y-2 relative z-10">
                  <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Acceso al Libro de Estilo</h3>
                  <p className="text-[11px] text-amber-500/40 font-bold uppercase tracking-widest leading-relaxed">
                    Estás visualizando los ejercicios oficiales autorizados por el Director de Metodología para tu categoría. No puedes editarlos, pero puedes sugerir variantes.
                  </p>
               </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskCard({ task, theme }: any) {
  const accent = theme === 'cyan' ? 'text-primary' : 'text-amber-500';
  const border = theme === 'cyan' ? 'border-primary/20' : 'border-amber-500/20';
  const bg = theme === 'cyan' ? 'bg-primary/5' : 'bg-amber-500/5';

  return (
    <Card className={cn(
      "glass-panel border-none bg-black/40 overflow-hidden group hover:scale-[1.02] transition-all rounded-[2.5rem] shadow-2xl relative",
      theme === 'amber' ? 'hover:bg-amber-500/[0.03]' : 'hover:bg-primary/[0.03]'
    )}>
      <div className={cn("h-1.5 w-full", theme === 'cyan' ? 'bg-primary/40' : 'bg-amber-500/40')} />
      
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border transition-all", bg, border)}>
            <LayoutGrid className={cn("h-6 w-6", accent)} />
          </div>
          <Badge variant="outline" className={cn("rounded-full border-white/10 text-white/40 text-[8px] font-black uppercase px-3")}>
            {task.duration}
          </Badge>
        </div>
        <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase group-hover:cyan-text-glow transition-all">
          {task.title}
        </CardTitle>
        <CardDescription className={cn("text-[9px] font-black uppercase tracking-widest pt-1", accent)}>
          {task.stage} • {task.dimension}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-8">
        <div className="aspect-[1.6/1] bg-black/60 border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:border-primary/20 transition-all">
           <div className="absolute inset-0 bg-grid-pattern opacity-5" />
           <div className="text-center space-y-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Trophy className={cn("h-8 w-8 mx-auto", accent)} />
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Visual_Asset_Preview</span>
           </div>
        </div>
      </CardContent>

      <CardFooter className="px-8 py-6 bg-black/40 border-t border-white/5 flex justify-between items-center rounded-b-[2.5rem]">
        <div className="flex items-center gap-2">
           <Clock className="h-3 w-3 text-white/20" />
           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">SINCRO_OK</span>
        </div>
        <Button variant="ghost" className={cn("h-10 rounded-xl font-black uppercase text-[9px] tracking-widest", accent)}>
          Abrir Ficha <ChevronRight className="h-3.5 w-3.5 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}
