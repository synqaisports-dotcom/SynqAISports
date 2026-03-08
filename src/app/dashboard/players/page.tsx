
"use client";

import { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Activity, 
  Trophy, 
  Target, 
  Calendar, 
  Mail, 
  Phone, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  CheckCircle2,
  Loader2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  IdCard,
  LayoutGrid,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter, 
  SheetClose,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "Debutantes", label: "Debutantes" },
  { value: "Prebenjamín", label: "Prebenjamín" },
  { value: "Benjamín", label: "Benjamín" },
  { value: "Alevín", label: "Alevín" },
  { value: "Infantil", label: "Infantil" },
  { value: "Cadete", label: "Cadete" },
  { value: "Juvenil", label: "Juvenil" },
  { value: "Senior", label: "Senior" },
  { value: "Primer Equipo", label: "Primer Equipo" },
];

const TEAM_SUFFIXES = ["A", "B", "C", "D"];

const POSITIONS = [
  { value: "Portero", label: "Portero / Guardameta" },
  { value: "Defensa", label: "Defensa / Zaguero" },
  { value: "Medio", label: "Mediocentro / Volante" },
  { value: "Delantero", label: "Delantero / Punta" },
];

const INITIAL_PLAYERS = [
  { id: "p1", name: "Lucas", surname: "García", email: "l.garcia@tutor.com", category: "Infantil", teamSuffix: "A", position: "Medio", status: "Active", attendance: "98%" },
  { id: "p2", name: "Elena", surname: "Rossi", email: "e.rossi@tutor.it", category: "Alevín", teamSuffix: "B", position: "Delantero", status: "Active", attendance: "92%" },
  { id: "p3", name: "Marc", surname: "Soler", email: "m.soler@tutor.es", category: "Cadete", teamSuffix: "C", position: "Portero", status: "Injured", attendance: "45%" },
  { id: "p4", name: "Sofía", surname: "Mendes", email: "s.mendes@tutor.br", category: "Benjamín", teamSuffix: "A", position: "Defensa", status: "Active", attendance: "100%" },
];

export default function PlayersManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    category: "Alevín",
    teamSuffix: "A",
    position: "Medio",
    status: "Active"
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ 
      name: "", 
      surname: "", 
      email: "", 
      category: "Alevín", 
      teamSuffix: "A",
      position: "Medio", 
      status: "Active" 
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (player: any) => {
    setEditingId(player.id);
    setFormData({
      name: player.name,
      surname: player.surname,
      email: player.email,
      category: player.category,
      teamSuffix: player.teamSuffix,
      position: player.position,
      status: player.status
    });
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    toast({
      variant: "destructive",
      title: "ATLETA_DESVINCULADO",
      description: `${name} ha sido eliminado de la base de datos de cantera.`,
    });
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (editingId) {
        setPlayers(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } : p));
        toast({ title: "FICHA_ACTUALIZADA", description: "Protocolo de atleta sincronizado." });
      } else {
        const newPlayer = { 
          id: `p${Date.now()}`, 
          ...formData, 
          attendance: "100%" 
        };
        setPlayers([newPlayer, ...players]);
        toast({ title: "ATLETA_REGISTRADO", description: `${formData.name} ya forma parte de la red.` });
      }
      setLoading(false);
      setIsSheetOpen(false);
    }, 1000);
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Athlete_Network_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Gestión de Jugadores
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Nueva Inscripción
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <PlayerStat label="Atletas Totales" value={players.length.toString()} icon={Users} />
        <PlayerStat label="Asistencia Media" value="94.2%" icon={Activity} highlight />
        <PlayerStat label="En Enfermería" value={players.filter(p => p.status === 'Injured').length.toString()} icon={Stethoscope} warning={players.some(p => p.status === 'Injured')} />
        <PlayerStat label="Progreso Red" value="+12%" icon={TrendingUp} />
      </div>

      <Card className="glass-panel border-none bg-black/40 overflow-hidden mb-8 shadow-2xl">
        <CardHeader className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-primary opacity-50" />
            <Input 
              placeholder="BUSCAR POR NOMBRE O CATEGORÍA..." 
              className="pl-10 h-12 bg-white/5 border-white/10 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Filtro de Categoría</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">TODOS_LOS_NODOS</span>
             </div>
             <LayoutGrid className="h-5 w-5 text-primary/40 hover:text-primary cursor-pointer transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Atleta / Identidad</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Categoría - Equipo</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Posición</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Asistencia</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Estatus</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="group hover:bg-white/[0.02] transition-colors cursor-default">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:border-primary/40 transition-all">
                           <IdCard className="h-5 w-5 text-white/20 group-hover:text-primary transition-all" />
                           <div className="absolute inset-0 bg-primary/5 scan-line opacity-0 group-hover:opacity-100" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-white uppercase text-xs italic group-hover:cyan-text-glow transition-all">{player.name} {player.surname}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-2 w-2 text-primary/40" /> {player.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-none border-white/10 text-white/60 font-black text-[9px] uppercase tracking-widest bg-white/5 px-3">
                          {player.category}
                        </Badge>
                        <span className="text-[10px] font-black text-primary italic">[{player.teamSuffix}]</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-tighter">{player.position}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: player.attendance }} />
                         </div>
                         <span className="text-[10px] font-mono font-bold text-primary/80">{player.attendance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-1.5 w-1.5 rounded-full animate-pulse",
                          player.status === 'Active' ? 'bg-primary shadow-[0_0_8px_var(--primary)]' : 
                          player.status === 'Injured' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-amber-400'
                        )} />
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          player.status === 'Active' ? 'text-primary' : 
                          player.status === 'Injured' ? 'text-rose-400' : 'text-amber-400'
                        )}>{player.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-white/20 hover:text-primary border border-white/5"
                          onClick={() => handleEdit(player)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-white/20 hover:text-rose-400 border border-white/5"
                          onClick={() => handleDelete(player.id, player.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
          <span>Mostrando {filteredPlayers.length} de {players.length} atletas vinculados</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-primary animate-pulse" /> Sincronización de Nodo: ÓPTIMA</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Athlete_Deploy_v1.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingId ? "MODIFICAR_ATLETA" : "ALTA_DE_ATLETA"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Genere la ficha técnica y asigne categoría federativa.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSavePlayer} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    placeholder="EJ: LUCAS" 
                    className="h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-primary/50 transition-all placeholder:text-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Apellidos</Label>
                  <Input 
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value.toUpperCase()})}
                    placeholder="EJ: GARCÍA" 
                    className="h-12 bg-white/5 border-white/10 rounded-none font-bold uppercase focus:border-primary/50 transition-all placeholder:text-white/10" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Mail Tutor / Familia</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-primary/40" />
                  <Input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="TUTOR@MAIL.COM" 
                    className="pl-10 h-12 bg-white/5 border-white/10 rounded-none font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({...formData, category: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary/50 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Equipo (Letra)</Label>
                  <Select 
                    value={formData.teamSuffix} 
                    onValueChange={(v) => setFormData({...formData, teamSuffix: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary/50 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      {TEAM_SUFFIXES.map(suffix => (
                        <SelectItem key={suffix} value={suffix} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          EQUIPO {suffix}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Posición Táctica</Label>
                  <Select 
                    value={formData.position} 
                    onValueChange={(v) => setFormData({...formData, position: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary/50 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      {POSITIONS.map(pos => (
                        <SelectItem key={pos.value} value={pos.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Estatus del Atleta</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({...formData, status: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary/50 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      <SelectItem value="Active" className="text-[10px] font-black uppercase">ACTIVO / DISPONIBLE</SelectItem>
                      <SelectItem value="Injured" className="text-[10px] font-black uppercase text-rose-400">LESIONADO / BAJA</SelectItem>
                      <SelectItem value="Away" className="text-[10px] font-black uppercase">AUSENCIA_TEMPORAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase text-primary tracking-widest">Protocolo de Privacidad</span>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                La creación de una ficha activa automáticamente el Portal de Tutor. La familia recibirá un código de sincronización para acceder a la telemetría del atleta.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest hover:bg-white/5">
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSavePlayer}
              disabled={loading}
              className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "SINCRONIZAR_FICHA" : "VINCULAR_ATLETA")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PlayerStat({ label, value, icon: Icon, highlight, warning }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group border-none bg-black/20">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl",
         highlight ? "bg-primary/10 border-primary/20" : 
         warning ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10"
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary" : warning ? "text-rose-400" : "text-white/40")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary" : warning ? "text-rose-400" : "text-white"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}
