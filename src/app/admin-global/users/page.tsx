
"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Globe2, 
  Mail, 
  Shield,
  Activity,
  Fingerprint,
  MapPin,
  Loader2,
  ShieldAlert
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MOCK_REQUESTS = [
  { id: "u1", name: "Marc", surname: "García", email: "m.garcia@elite.com", country: "España", status: "Pending", lastSeen: "2m ago" },
  { id: "u2", name: "Elena", surname: "Rossi", email: "e.rossi@milan-training.it", country: "Italia", status: "Approved", lastSeen: "5h ago" },
  { id: "u3", name: "John", surname: "Smith", email: "j.smith@us-soccer.org", country: "USA", status: "Denied", lastSeen: "1d ago" },
  { id: "u4", name: "Lucas", surname: "Silva", email: "l.silva@brasil-academy.br", country: "Brasil", status: "Pending", lastSeen: "Just now" },
];

const AVAILABLE_ROLES = [
  { value: "superadmin", label: "Superadmin" },
  { value: "club_admin", label: "Administrador de Club" },
  { value: "academy_director", label: "Director de Cantera" },
  { value: "coach", label: "Entrenador" },
  { value: "tutor", label: "Tutor / Familia" },
];

export default function GlobalUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    country: "España",
    role: "club_admin"
  });

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de creación de credencial en el nodo central
    setTimeout(() => {
      toast({
        title: "CREDENCIAL_EMITIDA",
        description: `Se ha generado el protocolo de acceso para ${formData.name} ${formData.surname}.`,
      });
      setLoading(false);
      setIsSheetOpen(false);
      setFormData({ name: "", surname: "", email: "", country: "España", role: "club_admin" });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER SECTOR */}
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">Security_Protocol_Active</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Gestión de Usuarios
          </h1>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="rounded-none bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none">
              <UserPlus className="h-4 w-4 mr-2" /> Nueva Credencial
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
            <div className="p-10 border-b border-white/5 bg-black/40">
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Credential_Factory_v1.0</span>
                </div>
                <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                  EMITIR_ACCESO
                </SheetTitle>
                <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                  Genere una nueva identidad autorizada en el núcleo central de SynQAI.
                </SheetDescription>
              </SheetHeader>
            </div>

            <form onSubmit={handleCreateCredential} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Nombre</Label>
                    <Input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="EJ: MARC" 
                      className="h-12 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase focus:border-emerald-500 transition-all placeholder:text-white/10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Apellidos</Label>
                    <Input 
                      required
                      value={formData.surname}
                      onChange={(e) => setFormData({...formData, surname: e.target.value})}
                      placeholder="EJ: GARCÍA" 
                      className="h-12 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase focus:border-emerald-500 transition-all placeholder:text-white/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Mail de Acceso</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="USER@CLUB.COM" 
                      className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-none font-bold focus:border-emerald-500 transition-all placeholder:text-white/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Nodo_País</Label>
                  <div className="relative">
                    <Globe2 className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500/30" />
                    <Input 
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      placeholder="ESPAÑA" 
                      className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-none font-bold uppercase focus:border-emerald-500 transition-all placeholder:text-white/10" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1">Protocolo de Rol</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData({...formData, role: v})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-emerald-500 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-none">
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-emerald-500 focus:text-black">
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3 text-emerald-400" />
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">Aviso de Seguridad</span>
                </div>
                <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                  La emisión de una credencial genera un token de sincronización único. El usuario deberá validar su identidad en el primer acceso.
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
                onClick={handleCreateCredential}
                disabled={loading}
                className="flex-[2] h-16 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all border-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "EMITIR_CREDENCIAL"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricMiniCard label="Solicitudes Pendientes" value="14" color="text-emerald-400" />
        <MetricMiniCard label="Nodos Activos Hoy" value="1.2k" color="text-white" />
        <MetricMiniCard label="Alertas de Acceso" value="0" color="text-emerald-400" />
      </div>

      {/* MAIN DATA TERMINAL */}
      <Card className="glass-panel shadow-2xl overflow-hidden relative border-none bg-black/40">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <CardHeader className="bg-black/40 border-b border-white/5 p-6 space-y-4 md:space-y-0 md:flex md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="BUSCAR IDENTIDAD O PAÍS..." 
              className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Filtrar por Status:</span>
            <div className="flex gap-1">
              {['Todos', 'Pendiente', 'Activo'].map(f => (
                <button key={f} className="text-[9px] font-black uppercase px-3 py-1 border border-white/5 hover:border-emerald-500/40 text-white/40 hover:text-emerald-400 transition-all">
                  {f}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 h-14 pl-8">Identidad_Usuario</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Mail_Acceso</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40">Nodo_Pais</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 text-center">Protocolo_Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.3em] text-white/40 pr-8">Terminal_Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_REQUESTS.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-10 w-10 bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center relative overflow-hidden group-hover:bg-emerald-500/10 transition-all">
                        <Activity className="h-4 w-4 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-emerald-500/5 scan-line" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-all">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-1">
                          ID: {user.id.toUpperCase()} • {user.lastSeen}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-500/60" />
                      <span className="text-xs font-headline font-bold text-emerald-400 tracking-wide uppercase">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe2 className="h-3 w-3 text-emerald-500/40" />
                      <span className="text-[10px] font-black uppercase text-white/70">{user.country}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <StatusBadge status={user.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/10 text-white/20 hover:text-rose-400 transition-all">
                        <UserX className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-white/20 hover:text-emerald-400 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
          <span>Mostrando 4 de 1.2k registros</span>
          <span>Sincronización de Base de Datos: Estable</span>
        </div>
      </Card>
    </div>
  );
}

function MetricMiniCard({ label, value, color }: any) {
  return (
    <Card className="glass-panel p-4 relative group overflow-hidden border-none bg-black/20">
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <Activity className="h-8 w-8 text-emerald-500" />
      </div>
      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">{label}</p>
      <p className={cn("text-2xl font-black italic", color)}>{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Denied: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
  return (
    <Badge variant="outline" className={cn("rounded-none font-black text-[8px] uppercase tracking-widest px-3 py-1", styles[status])}>
      {status}
    </Badge>
  );
}
