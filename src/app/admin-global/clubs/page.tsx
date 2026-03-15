
"use client";

import { useState, useEffect } from "react";
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
import { Plus, Search, MoreHorizontal, Building2, Globe2, Activity, Pencil, Pause, Play, ShieldCheck, Globe, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter, 
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
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClubId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    plan: "Pro",
    country: "ES",
    status: "Active"
  });

  useEffect(() => {
    // Sincronización con el "almacenamiento global simulado" del prototipo
    const savedClubs = JSON.parse(localStorage.getItem("synq_global_clubs") || "[]");
    if (savedClubs.length > 0) {
      // Evitar duplicados si ya existen en INITIAL_CLUBS (solo para el prototipo)
      const merged = [...INITIAL_CLUBS];
      savedClubs.forEach((sc: any) => {
        if (!merged.find(m => m.id === sc.id)) {
          merged.push(sc);
        }
      });
      setClubs(merged);
    }
  }, []);

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

  const handleEdit = (club: any) => {
    setEditingId(club.id);
    setFormData({
      name: club.name,
      plan: club.plan,
      country: club.country,
      status: club.status
    });
    setIsSheetOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClubs(prev => prev.map(c => 
      c.id === editingClubId ? { ...c, ...formData } : c
    ));
    
    toast({
      title: "NODO_ACTUALIZADO",
      description: `La configuración de ${formData.name} ha sido sincronizada en la red.`,
    });
    
    setIsSheetOpen(false);
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
              className="pl-12 h-12 bg-white/5 border-emerald-500/20 rounded-xl text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-all"
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
                        <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em] rounded-b-3xl">
          <span>Mostrando {filteredClubs.length} de {clubs.length} registros globales</span>
          <span className="flex items-center gap-2"><Activity className="h-3 w-3 text-emerald-500 animate-pulse" /> Sincronización de Red: Óptima</span>
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
                MODIFICAR_NODO
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left italic">
                Ajuste los parámetros del club en la red global.
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
                    <SelectContent className="bg-[#04070c] border-emerald-500/20">
                      <SelectItem value="Enterprise" className="text-[10px] font-black uppercase">ENTERPRISE</SelectItem>
                      <SelectItem value="Pro" className="text-[10px] font-black uppercase">PRO</SelectItem>
                      <SelectItem value="Basic" className="text-[10px] font-black uppercase">BASIC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Sector País</Label>
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
                  <SelectContent className="bg-[#04070c] border-emerald-500/20">
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
                La modificación de estos parámetros afecta la visibilidad y capacidad de cómputo del nodo en tiempo real.
              </p>
            </div>
          </form>

          <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-14 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSave}
              className="flex-[2] h-14 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              SINCRONIZAR_NODO
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
