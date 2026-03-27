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
import { Plus, Search, MoreHorizontal, Building2, Globe2, Activity, Pencil, Pause, Play, ShieldCheck, Globe, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Club } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function ManageClubsPage() {
  const { session } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const { toast } = useToast();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClubId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    plan: "Pro",
    country: "ES",
    status: "Active"
  });

  // Cargar clubs desde Supabase
  const loadClubs = async () => {
    setIsLoading(true);
    setHasError(false);
    
    if (!session?.access_token) {
      const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
      setClubs(savedClubs);
      setIsUsingFallback(true);
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/admin/clubs", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as { clubs?: Club[]; error?: string };
      if (!res.ok) {
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const data = Array.isArray(j.clubs) ? j.clubs : [];

      if (data && data.length > 0) {
        setClubs(data);
        setIsUsingFallback(false);
        toast({
          title: "SINCRONIZACIÓN_COMPLETA",
          description: `${data.length} nodos de club cargados desde la red.`,
        });
      } else {
        // Si no hay datos en Supabase, usar únicamente localStorage de trabajo.
        const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
        setClubs(savedClubs);
        setIsUsingFallback(true);
        toast({
          title: "MODO_OFFLINE",
          description: "Sin seed de prueba: usando datos locales persistidos.",
        });
      }
    } catch (error) {
      console.error("[SynqAI] Error en loadClubs:", error);
      setHasError(true);
      
      // Fallback a datos locales (sin datos de prueba)
      const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
      setClubs(savedClubs);
      setIsUsingFallback(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadClubs();
  }, [session?.access_token]);

  const handleToggleStatus = async (id: string) => {
    const club = clubs.find(c => c.id === id);
    if (!club) return;

    const isCurrentlyActive = club.status === "Active";
    const newStatus = isCurrentlyActive ? "Inactive" : "Active";

    // Actualizar localmente primero
    setClubs(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus } : c
    ));

    // Intentar actualizar en Supabase
    if (!isUsingFallback && session?.access_token) {
      const res = await fetch("/api/admin/clubs", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        console.error("[SynqAI] Error actualizando status:", res.status);
        // Revertir cambio local si falla
        setClubs(prev => prev.map(c => 
          c.id === id ? { ...c, status: club.status } : c
        ));
        toast({
          variant: "destructive",
          title: "ERROR_SINCRO",
          description: "No se pudo actualizar el estado del nodo.",
        });
        return;
      }
    }

    toast({
      title: isCurrentlyActive ? "NODO_SUSPENDIDO" : "NODO_ACTIVADO",
      description: `El nodo ${club.name} ha cambiado su protocolo a ${newStatus.toUpperCase()}.`,
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      plan: "Pro",
      country: "ES",
      status: "Active"
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (club: Club) => {
    setEditingId(club.id);
    setFormData({
      name: club.name,
      plan: club.plan,
      country: club.country,
      status: club.status
    });
    setIsSheetOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingClubId) {
        // Actualizar club existente
        if (!isUsingFallback && session?.access_token) {
          const res = await fetch("/api/admin/clubs", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              id: editingClubId,
              name: formData.name,
              plan: formData.plan,
              country: formData.country,
              status: formData.status,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }

        setClubs(prev => prev.map(c => 
          c.id === editingClubId ? { ...c, ...formData } : c
        ));

        toast({
          title: "NODO_ACTUALIZADO",
          description: `La configuración de ${formData.name} ha sido sincronizada en la red.`,
        });
      } else {
        // Crear nuevo club
        const newClub: Club = {
          id: `c${Date.now()}`,
          name: formData.name,
          plan: formData.plan,
          country: formData.country,
          status: formData.status,
          users: 0
        };

        if (!isUsingFallback && session?.access_token) {
          const res = await fetch("/api/admin/clubs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              name: newClub.name,
              plan: newClub.plan,
              country: newClub.country,
              status: newClub.status,
              users: newClub.users,
            }),
          });
          const j = (await res.json()) as { club?: Club; error?: string };
          if (!res.ok) throw new Error(j.error ?? `HTTP ${res.status}`);
          if (j.club?.id) newClub.id = j.club.id;
        }

        setClubs(prev => [newClub, ...prev]);
        
        // Guardar también en localStorage como backup
        const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
        localStorage.setItem("synq_global_clubs", JSON.stringify([newClub, ...savedClubs]));

        toast({
          title: "NODO_VINCULADO",
          description: `El club ${formData.name} ha sido desplegado correctamente.`,
        });
      }
      
      setIsSheetOpen(false);
    } catch (error) {
      console.error("[SynqAI] Error guardando club:", error);
      toast({
        variant: "destructive",
        title: "ERROR_SINCRO",
        description: "No se pudo guardar los cambios en la red.",
      });
    } finally {
      setIsSaving(false);
    }
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
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">
              {isUsingFallback ? "Modo_Offline" : "Club_Network_Active"}
            </span>
            {isUsingFallback && (
              <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[8px]">
                DATOS LOCALES
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Gestion de clubes
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={loadClubs}
            variant="ghost"
            disabled={isLoading}
            className="h-12 px-4 border border-white/10 rounded-2xl text-white/60 hover:text-emerald-400 hover:border-emerald-500/30"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Sincronizar
          </Button>
          <Button 
            onClick={handleOpenCreate}
            className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none"
          >
            <Plus className="h-4 w-4 mr-2" /> Vincular Nuevo Nodo
          </Button>
        </div>
      </div>

      {hasError && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400" />
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">
            Conexion a Supabase no disponible. Mostrando datos locales. Configure las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </div>
      )}

      <Card className="glass-panel overflow-hidden relative border-none">
        <CardHeader className="bg-black/40 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-4 top-4 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="BUSCAR IDENTIDAD DE CLUB..." 
              className="pl-12 h-12 bg-white/5 border-emerald-500/20 rounded-xl text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Estado de Sincronizacion</span>
               <span className={cn(
                 "text-[10px] font-black uppercase tracking-widest italic",
                 isUsingFallback ? "text-amber-400" : "text-emerald-400"
               )}>
                 {isLoading ? "SINCRONIZANDO..." : isUsingFallback ? "MODO_LOCAL" : "ESTABLE_100%"}
               </span>
            </div>
            <Badge variant="outline" className="rounded-full border-emerald-500/20 text-emerald-400 font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">
              Total: {filteredClubs.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Sincronizando_Nodos...</p>
            </div>
          ) : (
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
                {filteredClubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">No se encontraron nodos de club</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClubs.map((club) => (
                    <TableRow key={club.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-4 py-3">
                          <div className="h-12 w-12 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-500/10 transition-all rotate-12 group-hover:rotate-0 duration-500">
                            <Building2 className="h-5 w-5 text-emerald-500" />
                            <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />
                          </div>
                          <div>
                            <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-all tracking-tighter">
                              {club.name}
                            </p>
                            <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                              ID: {club.id.toUpperCase()} | Sector: {club.country}
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
                            onClick={() => handleEdit(club)}
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
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span>Mostrando {filteredClubs.length} de {clubs.length} registros globales</span>
          <span className="flex items-center gap-2">
            <Activity className={cn("h-3 w-3 animate-pulse", isUsingFallback ? "text-amber-400" : "text-emerald-500")} />
            Sincronizacion de Red: {isUsingFallback ? "Local" : "Optima"}
          </span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Node_Config_v2.0</span>
              </div>
              <SheetTitle className="text-3xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingClubId ? "MODIFICAR_NODO" : "VINCULAR_NODO"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left italic">
                Ajuste los parametros del club en la red global.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Nombre de la Entidad</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 transition-all text-emerald-400" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Protocolo Plan</Label>
                  <Select value={formData.plan} onValueChange={(v) => setFormData({...formData, plan: v})}>
                    <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0f18] border-emerald-500/20">
                      <SelectItem value="Enterprise" className="text-[10px] font-black uppercase">ENTERPRISE</SelectItem>
                      <SelectItem value="Pro" className="text-[10px] font-black uppercase">PRO</SelectItem>
                      <SelectItem value="Basic" className="text-[10px] font-black uppercase">BASIC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Sector Pais</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value.toUpperCase()})}
                      className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase text-emerald-400" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Estatus de Red</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-emerald-500/20">
                    <SelectItem value="Active" className="text-[10px] font-black uppercase">ACTIVO</SelectItem>
                    <SelectItem value="Inactive" className="text-[10px] font-black uppercase text-rose-400">INACTIVO</SelectItem>
                    <SelectItem value="Overdue" className="text-[10px] font-black uppercase text-amber-400">PAGO_PENDIENTE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest italic">Aviso de Seguridad</span>
              </div>
              <p className="text-[9px] text-emerald-400/40 leading-relaxed font-bold uppercase italic">
                La modificacion de estos parametros afecta la visibilidad y capacidad de computo del nodo en tiempo real.
              </p>
            </div>
          </form>

          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  SINCRONIZANDO...
                </>
              ) : (
                editingClubId ? "SINCRONIZAR_NODO" : "DESPLEGAR_NODO"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
