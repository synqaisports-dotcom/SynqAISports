
"use client";

import { useState } from "react";
import { 
  Database, 
  Search, 
  Filter, 
  Globe, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  LayoutGrid,
  Download,
  Eye,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_GLOBAL_DATA = [
  { id: "ex1", title: "Rondo de Transición 4x4", club: "Elite Madrid", sport: "Fútbol", stage: "Alevín", country: "ES", uses: 1240, efficiency: "92%" },
  { id: "ex2", title: "Salida de Presión 2-2", club: "Futsal Porto", sport: "Futsal", stage: "Cadete", country: "PT", uses: 850, efficiency: "88%" },
  { id: "ex3", title: "Juego de Pies Base", club: "Velocity NY", sport: "Baloncesto", stage: "Infantil", country: "US", uses: 2100, efficiency: "95%" },
];

export default function GlobalExercisesWarehouse() {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Neural_Data_Warehouse</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            ALMACÉN_NEURAL
          </h1>
        </div>
        <Button className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
          <Download className="h-4 w-4 mr-2" /> Exportar para Gemini
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricMini label="Tareas Totales" value="14.2k" icon={Database} />
        <MetricMini label="Entrenamiento IA" value="84%" icon={Cpu} highlight />
        <MetricMini label="Nodos Activos" value="124" icon={Globe} />
        <MetricMini label="Índice Calidad" value="9.2" icon={ShieldCheck} />
      </div>

      <Card className="glass-panel border-emerald-500/20 bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-4 h-4 w-4 text-emerald-500 opacity-50" />
            <Input placeholder="FILTRAR POR TÁCTICA O PAÍS..." className="pl-12 h-14 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase text-[10px] tracking-widest" />
          </div>
          <div className="flex gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-emerald-400/40 uppercase tracking-widest">Sincronización Neural</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">DATOS_ANONIMIZADOS_OK</span>
             </div>
             <BarChart3 className="h-6 w-6 text-emerald-400/40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40">Título Tarea / Nodo Origen</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40">Deporte / Etapa</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-center">Usos Red</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-center">Eficiencia</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-right">Mando</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_GLOBAL_DATA.map((ex) => (
                <TableRow key={ex.id} className="border-white/5 hover:bg-emerald-500/[0.03] transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all">
                        <Activity className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-all">{ex.title}</p>
                        <p className="text-[8px] text-emerald-400/40 font-bold uppercase tracking-widest mt-1">Origin: {ex.club} • {ex.country}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="w-fit rounded-lg border-emerald-500/20 text-emerald-400 text-[8px] font-black px-2">{ex.sport}</Badge>
                      <span className="text-[9px] font-bold text-white/30 uppercase">{ex.stage}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs font-bold text-white/60">{ex.uses}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-black text-emerald-400 italic">{ex.efficiency}</span>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Button variant="ghost" size="icon" className="h-9 w-9 border border-white/5 rounded-xl text-emerald-400 hover:bg-emerald-500/10">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricMini({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-5 border-emerald-500/20 bg-black/20 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
        <Icon className="h-12 w-12 text-emerald-500" />
      </div>
      <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest italic mb-1">{label}</p>
      <p className={cn("text-2xl font-black italic tracking-tighter", highlight ? "text-emerald-400 emerald-text-glow" : "text-white")}>{value}</p>
    </Card>
  );
}
