"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
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
import { Plus, Search, MoreHorizontal, Building2, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase, type Club } from "@/lib/supabase";

const FALLBACK_CLUBS: Club[] = [
  { id: "c1", name: "Elite Soccer Academy", plan: "Enterprise", users: 120, status: "Active", country: "ES" },
  { id: "c2", name: "Velocity Basketball", plan: "Pro", users: 45, status: "Active", country: "US" },
  { id: "c3", name: "AquaSwim Club", plan: "Basic", users: 22, status: "Overdue", country: "IT" },
];

export default function ManageClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const { toast } = useToast();

  const loadClubs = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("[SynqAI] Error cargando clubs:", error);
        throw error;
      }

      if (data && data.length > 0) {
        setClubs(data);
        setIsUsingFallback(false);
      } else {
        const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
        const merged = [...FALLBACK_CLUBS];
        savedClubs.forEach((sc: Club) => {
          if (!merged.find(m => m.id === sc.id)) {
            merged.push(sc);
          }
        });
        setClubs(merged);
        setIsUsingFallback(true);
      }
    } catch (error) {
      console.error("[SynqAI] Error en loadClubs:", error);
      const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
      const merged = [...FALLBACK_CLUBS];
      savedClubs.forEach((sc: Club) => {
        if (!merged.find(m => m.id === sc.id)) {
          merged.push(sc);
        }
      });
      setClubs(merged);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const filteredClubs = clubs.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-white uppercase tracking-tighter italic">
            SECTOR_CLUB_MANAGEMENT
          </h1>
          <p className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">
            Sincronizacion de Nodos Locales {isUsingFallback && "(Modo Local)"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={loadClubs}
            variant="ghost"
            disabled={isLoading}
            className="h-12 px-4 border border-white/10 rounded-none text-white/60 hover:text-primary hover:border-primary/30"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button className="rounded-none bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 px-8 cyan-glow hover:scale-105 transition-all">
            <Plus className="h-4 w-4 mr-2" /> Vincular Nuevo Club
          </Button>
        </div>
      </div>

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <CardHeader className="bg-black/20 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR NODOS DE CLUB..." 
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-none border-primary/20 text-primary font-black text-[9px] px-3 py-1 uppercase tracking-widest">
              Total: {filteredClubs.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Sincronizando_Nodos...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/[0.02] border-b border-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 h-14">Identificador_Club</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Protocolo_Plan</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40 text-center">Nodos_Activos</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-white/40">Estatus_Red</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-white/40">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClubs.map((club) => (
                  <TableRow key={club.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center rotate-45 group-hover:bg-primary/20 transition-all">
                          <Building2 className="h-4 w-4 text-primary -rotate-45" />
                        </div>
                        <span className="font-black text-white uppercase text-xs tracking-tighter italic group-hover:cyan-text-glow">{club.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none border-white/10 text-white/60 font-black text-[9px] uppercase tracking-widest bg-white/5">
                        {club.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-black text-white/80 font-mono text-sm">
                      {club.users}
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white/40 hover:text-primary">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
