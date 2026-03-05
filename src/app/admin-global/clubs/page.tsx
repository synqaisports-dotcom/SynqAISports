
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Building2, Globe2, Activity, Pencil, Pause, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const INITIAL_CLUBS = [
  { id: "c1", name: "Elite Soccer Academy", plan: "Enterprise", users: 120, status: "Active", country: "ES" },
  { id: "c2", name: "Velocity Basketball", plan: "Pro", users: 45, status: "Active", country: "US" },
  { id: "c3", name: "AquaSwim Club", plan: "Basic", users: 22, status: "Overdue", country: "IT" },
  { id: "c4", name: "Manchester Training", plan: "Enterprise", users: 89, status: "Active", country: "UK" },
];

export default function ManageClubsPage() {
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleToggleStatus = (id: string) => {
    const club = clubs.find(c => c.id === id);
    if (!club) return;

    const isCurrentlyActive = club.status === "Active";
    const newStatus = isCurrentlyActive ? "Inactive" : "Active";

    setClubs(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));

    toast({
      title: isCurrentlyActive ? "NODO_SUSPENDIDO" : "NODO_ACTIVADO",
      description: `El nodo ${club.name} ha cambiado su protocolo a ${newStatus.toUpperCase()}.`,
    });
  };

  const handleEdit = (name: string) => {
    toast({
      title: "PROTOCOLO_EDICIÓN",
      description: `Sincronizando terminal de configuración para ${name}.`,
    });
  };

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Globe2 className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Club_Network_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Gestión de clubes
          </h1>
        </div>
        <Button className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
          <Plus className="h-4 w-4 mr-2" /> Vincular Nuevo Nodo
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden relative border-none">
        <CardHeader className="bg-black/40 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-4 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="BUSCAR IDENTIDAD DE CLUB..." 
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estado de Sincronización</span>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">ESTABLE_100%</span>
            </div>
            <Badge variant="outline" className="rounded-full border-emerald-500/20 text-emerald-400 font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">
              Total: {filteredClubs.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-16 pl-8">Identificador_Club</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Protocolo_Plan</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">Nodos_Activos</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Estatus_Red</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.3em] text-white/40 pr-8">Terminal_Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClubs.map((club) => (
                <TableRow key={club.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4 py-3">
                      <div className="h-12 w-12 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-500/10 transition-all rotate-12 group-hover:rotate-0 duration-500">
                        <Building2 className="h-5 w-5 text-emerald-500" />
                        <div className="absolute inset-0 bg-emerald-500/5 scan-line" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-all tracking-tighter">
                          {club.name}
                        </p>
                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                          ID: {club.id.toUpperCase()} • Sector: {club.country}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full border-white/10 text-white/60 font-black text-[9px] uppercase tracking-widest bg-white/5 px-3">
                      {club.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-headline font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {club.users}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        club.status === "Active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                        club.status === "Inactive" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-amber-400"
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        club.status === "Active" ? "text-emerald-400" : 
                        club.status === "Inactive" ? "text-rose-400" : "text-amber-400"
                      )}>
                        {club.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all" 
                        title="Modificar Protocolo"
                        aria-label="Modificar Protocolo"
                        onClick={() => handleEdit(club.name)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn(
                          "h-10 w-10 rounded-xl border border-white/5 transition-all",
                          club.status === "Active" 
                            ? "hover:border-amber-500/50 hover:bg-amber-500/10 text-white/20 hover:text-amber-400" 
                            : "hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400"
                        )}
                        title={club.status === "Active" ? "Pausar Nodo" : "Activar Nodo"}
                        aria-label={club.status === "Active" ? "Pausar Nodo" : "Activar Nodo"}
                        onClick={() => handleToggleStatus(club.id)}
                      >
                        {club.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span>Mostrando {filteredClubs.length} de {clubs.length} registros globales</span>
          <span className="flex items-center gap-2"><Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Sincronización de Red: Óptima</span>
        </div>
      </Card>
    </div>
  );
}
