
"use client";

import { useState } from "react";
import { 
  Library, 
  Plus, 
  Search, 
  ShieldCheck, 
  Activity, 
  Pencil, 
  Trash2, 
  Filter,
  CheckCircle2,
  Lock,
  Globe,
  MoreHorizontal,
  ChevronRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STAGES = ["Debutantes", "Prebenjamín", "Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Senior"];

const MOCK_EXERCISES = [
  { id: "ex1", title: "Rondo 4x4 + 3 Comodines", stage: "Infantil", dimension: "Táctica", status: "Official", author: "I. Muñoz", date: "12 Oct 2024" },
  { id: "ex2", title: "Circuito de Coordinación 01", stage: "Alevín", dimension: "Técnica", status: "Official", author: "L. Sánchez", date: "10 Oct 2024" },
  { id: "ex3", title: "Finalización tras Centros", stage: "Cadete", dimension: "Táctica", status: "Coach_Draft", author: "C. Ruiz", date: "08 Oct 2024" },
];

export default function ExerciseLibraryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Library className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black text-amber-500 tracking-[0.5em] uppercase italic">Club_Tactical_Stylebook</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic amber-text-glow leading-none">
            BIBLIOTECA_OFICIAL
          </h1>
        </div>
        
        <Button className="rounded-2xl bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transition-all border-none">
          <Plus className="h-4 w-4 mr-2" /> Crear Tarea Maestra
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <LibraryStat label="Tareas Validadas" value="42" icon={ShieldCheck} highlight />
        <LibraryStat label="Propuestas Coach" value="12" icon={Activity} />
        <LibraryStat label="Etapa Dominante" value="Alevín" icon={Info} />
      </div>

      <Card className="glass-panel border-amber-500/20 bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-4 h-4 w-4 text-amber-500 opacity-50" />
            <Input 
              placeholder="BUSCAR EN EL LIBRO DE ESTILO..." 
              className="pl-12 h-14 bg-white/5 border-amber-500/20 rounded-2xl text-amber-500 font-bold uppercase text-[10px] tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-widest italic">Control de Acceso Metodológico</span>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">SINCRO_CLUB_MASTER</span>
             </div>
             <Filter className="h-5 w-5 text-amber-500/40 cursor-pointer hover:text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40">Título de la Tarea / Autor</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40">Etapa Objetivada</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40">Dimensión</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-center">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-amber-500/40 text-right">Acciones</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_EXERCISES.map((ex) => (
                <TableRow key={ex.id} className="border-white/5 hover:bg-amber-500/[0.03] transition-colors group">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all">
                        <Library className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:amber-text-glow transition-all">{ex.title}</p>
                        <p className="text-[8px] text-amber-500/40 font-bold uppercase tracking-widest mt-1">Por: {ex.author} • {ex.date}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg border-amber-500/20 text-amber-500 text-[8px] font-black px-3 py-1 uppercase">{ex.stage}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest italic">{ex.dimension}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <div className={cn("h-1.5 w-1.5 rounded-full", ex.status === 'Official' ? 'bg-amber-500 shadow-[0_0_8px_var(--amber-500)]' : 'bg-white/20')} />
                       <span className={cn("text-[9px] font-black uppercase", ex.status === 'Official' ? 'text-amber-500' : 'text-white/20')}>{ex.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-amber-500/40 hover:text-amber-500 border border-white/5 rounded-xl"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500/40 hover:text-rose-500 border border-white/5 rounded-xl"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-amber-500/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 animate-pulse" /> Sincronización de Estilo: Activa</span>
          <span>Modelo de Blindaje v6.0</span>
        </div>
      </Card>
    </div>
  );
}

function LibraryStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-6 border-amber-500/20 bg-black/20 rounded-[2rem] relative overflow-hidden group">
       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
          <Icon className="h-16 w-16 text-amber-500" />
       </div>
       <div className="relative z-10 space-y-1">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">{label}</p>
          <p className={cn("text-3xl font-black italic tracking-tighter", highlight ? "text-amber-500 amber-text-glow" : "text-white")}>{value}</p>
       </div>
    </Card>
  );
}
