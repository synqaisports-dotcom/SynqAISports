
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
import { Plus, Search, MoreHorizontal, Building2, Globe2, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MOCK_CLUBS = [
  { id: "c1", name: "Elite Soccer Academy", plan: "Enterprise", users: 120, status: "Active", country: "ES" },
  { id: "c2", name: "Velocity Basketball", plan: "Pro", users: 45, status: "Active", country: "US" },
  { id: "c3", name: "AquaSwim Club", plan: "Basic", users: 22, status: "Overdue", country: "IT" },
  { id: "c4", name: "Manchester Training", plan: "Enterprise", users: 89, status: "Active", country: "UK" },
];

export default function ManageClubsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Globe2 className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Club_Network_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            NODE_CLUB_MANAGEMENT
          </h1>
        </div>
        <Button className="rounded-none bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 cyan-glow hover:scale-105 transition-all">
          <Plus className="h-4 w-4 mr-2" /> Vincular Nuevo Nodo
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden relative">
        <CardHeader className="bg-black/40 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR IDENTIDAD DE CLUB..." 
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estado de Sincronización</span>
               <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">ESTABLE_100%</span>
            </div>
            <Badge variant="outline" className="rounded-none border-primary/20 text-primary font-black text-[9px] px-3 py-1 uppercase tracking-widest">
              Total: {MOCK_CLUBS.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-14 pl-8">Identificador_Club</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Protocolo_Plan</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">Nodos_Activos</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Estatus_Red</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.3em] text-white/40 pr-8">Terminal_Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CLUBS.map((club) => (
                <TableRow key={club.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-10 w-10 bg-primary/5 border border-primary/20 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/10 transition-all rotate-45">
                        <Building2 className="h-4 w-4 text-primary -rotate-45" />
                        <div className="absolute inset-0 bg-primary/5 scan-line" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:cyan-text-glow transition-all tracking-tighter">
                          {club.name}
                        </p>
                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                          ID: {club.id.toUpperCase()} • Sector: {club.country}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-none border-white/10 text-white/60 font-black text-[9px] uppercase tracking-widest bg-white/5">
                      {club.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-xs font-headline font-bold text-white group-hover:text-primary transition-colors">
                      {club.users}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        club.status === "Active" ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-amber-400"
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em]",
                        club.status === "Active" ? "text-primary" : "text-amber-400"
                      )}>
                        {club.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-primary/50 hover:bg-primary/10 text-white/20 hover:text-primary transition-all">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
          <span>Mostrando {MOCK_CLUBS.length} de 24 registros globales</span>
          <span className="flex items-center gap-2"><Activity className="h-2 w-2 text-primary animate-pulse" /> Sincronización: Estable</span>
        </div>
      </Card>
    </div>
  );
}
