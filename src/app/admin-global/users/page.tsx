"use client";

import { useState, useEffect } from "react";
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
  ShieldAlert,
  Pencil,
  CheckCircle2,
  RefreshCw,
  Zap,
  Trash2,
  IdCard
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
import Image from "next/image";

const MOCK_REQUESTS = [
  // NODO RECUPERADO (Legacy)
  { id: "u-tp", name: "COACH", surname: "TRES PIEDRAS", email: "admin@trespiedras.fc", country: "España", status: "Approved", lastSeen: "Online", role: "promo_coach", clubId: "SND-MFGBFN" },
  
  { id: "u1", name: "MARC", surname: "GARCÍA", email: "m.garcia@elite.com", country: "España", status: "Approved", lastSeen: "2m ago", role: "club_admin" },
  { id: "u2", name: "ELENA", surname: "ROSSI", email: "e.rossi@milan-training.it", country: "Italia", status: "Approved", lastSeen: "5h ago", role: "academy_director" },
  { id: "u3", name: "JOHN", surname: "SMITH", email: "j.smith@us-soccer.org", country: "USA", status: "Denied", lastSeen: "1d ago", role: "coach" },
  { id: "u4", name: "LUCAS", surname: "SILVA", email: "l.silva@sandbox.br", country: "Brasil", status: "Approved", lastSeen: "Just now", role: "promo_coach" },
];

const AVAILABLE_ROLES = [
  { value: "superadmin", label: "Superadmin" },
  { value: "club_admin", label: "Administrador de Club" },
  { value: "academy_director", label: "Director de Cantera" },
  { value: "methodology_director", label: "Director Metodología" },
  { value: "coach", label: "Entrenador Pro" },
  { value: "promo_coach", label: "Entrenador Promo" },
  { value: "tutor", label: "Tutor / Familia" },
];

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    country: "España",
    role: "promo_coach"
  });

  useEffect(() => {
    // Sincronización con el almacenamiento global de usuarios
    const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
    // Mezclamos con los mocks evitando duplicados por email
    const merged = [...MOCK_REQUESTS];
    savedUsers.forEach((su: any) => {
      if (!merged.find(m => m.email === su.email)) {
        merged.push({
          ...su,
          status: su.status || "Approved",
          lastSeen: "Online"
        });
      }
    });
    setUsers(merged);
  }, []);

  const addAuditLog = (title: string, desc: string, type: 'Success' | 'Info' | 'Warning' = 'Success') => {
    const existingLogs = JSON.parse(localStorage.getItem("synq_audit_logs") || "[]");
    const newLog = {
      id: Date.now().toString(),
      title,
      desc,
      type,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem("synq_audit_logs", JSON.stringify([newLog, ...existingLogs].slice(0, 15)));
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return;

    const nextUsers = users.map(u => u.id === id ? { ...u, status: newStatus } : u);
    setUsers(nextUsers);
    
    // Sincronizar con el storage global
    const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
    const updatedGlobal = savedUsers.map((su: any) => su.email === user.email ? { ...su, status: newStatus } : su);
    localStorage.setItem("synq_global_users", JSON.stringify(updatedGlobal));

    const title = newStatus === 'Approved' ? "ACCESO_AUTORIZADO" : 
                  newStatus === 'Denied' ? "ACCESO_BLOQUEADO" : "PROTOCOLO_RESETEADO";
    const type = newStatus === 'Approved' ? 'Success' : 
                 newStatus === 'Denied' ? 'Warning' : 'Info';
    
    addAuditLog(title, `Estado de ${user.name}: ${newStatus.toUpperCase()}.`, type);
    
    toast({
      title: title,
      description: `El nodo de usuario ha cambiado su protocolo a ${newStatus.toUpperCase()}.`,
    });
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", surname: "", email: "", country: "España", role: "promo_coach" });
    setIsSheetOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      surname: user.surname || "",
      email: user.email,
      country: user.country || "España",
      role: user.role
    });
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const nextUsers = users.filter(u => u.id !== id);
    setUsers(nextUsers);
    
    // Eliminar del storage global si existe
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
      const updatedGlobal = savedUsers.filter((su: any) => su.email !== userToDelete.email);
      localStorage.setItem("synq_global_users", JSON.stringify(updatedGlobal));
    }

    addAuditLog("USUARIO_ELIMINADO", `Nodo de ${name} desconectado de la red.`, "Warning");
    toast({ variant: "destructive", title: "NODO_ELIMINADO", description: "El usuario ha sido desvinculado de la red." });
  };

  const handleCreateCredential = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (editingId) {
        setUsers(prev => prev.map(u => u.id === editingId ? { ...u, ...formData } : u));
        addAuditLog("MODIFICACIÓN_USUARIO", `Perfil de ${formData.name} actualizado.`, "Info");
        toast({ title: "CREDENCIAL_ACTUALIZADA", description: `Sincronizado: ${formData.name}.` });
      } else {
        const newUser = {
          id: `u${Date.now()}`,
          ...formData,
          status: "Approved",
          lastSeen: "Just now"
        };
        setUsers([newUser, ...users]);
        
        // Guardar en storage global para persistencia
        const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
        localStorage.setItem("synq_global_users", JSON.stringify([...savedUsers, newUser]));

        addAuditLog("NUEVA_CREDENCIAL", `Identidad emitida para ${formData.name}.`, "Success");
        toast({ title: "CREDENCIAL_EMITIDA", description: `Acceso generado para ${formData.name}.` });
      }
      setLoading(false);
      setIsSheetOpen(false);
    }, 1000);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase italic">Global_User_Registry_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Gestión de Usuarios
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all border-none"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Nueva Credencial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricMiniCard label="Total Nodos" value={users.length.toString()} color="text-white" />
        <MetricMiniCard label="Entrenadores Promo" value={users.filter(u => u.role === 'promo_coach').length.toString()} color="text-blue-400" />
        <MetricMiniCard label="Administradores Pro" value={users.filter(u => u.role === 'club_admin').length.toString()} color="text-emerald-400" />
      </div>

      <Card className="glass-panel shadow-2xl overflow-hidden relative border border-emerald-500/20 bg-black/40 rounded-3xl">
        <CardHeader className="bg-black/40 border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="FILTRAR POR IDENTIDAD O MAIL..." 
              className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 placeholder:text-emerald-400/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="border-blue-500/20 text-blue-400 font-black text-[8px] uppercase px-3">Promo: {users.filter(u => u.role === 'promo_coach').length}</Badge>
             <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 font-black text-[8px] uppercase px-3">Pro: {users.filter(u => u.role === 'club_admin').length}</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400/40 h-14 pl-8">Identidad_Usuario</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400/40">Mail_Acceso</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400/40">Protocolo_Rol</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400/40 text-center">Status</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-[0.3em] text-emerald-400/40 pr-8">Terminal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-emerald-500/[0.02] transition-colors group">
                  <TableCell className="pl-8">
                    <div className="flex items-center gap-4 py-2">
                      <div className={cn(
                        "h-10 w-10 border rounded-full flex items-center justify-center relative overflow-hidden transition-all",
                        user.role === 'promo_coach' ? "bg-blue-500/5 border-blue-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                      )}>
                        <Activity className={cn("h-4 w-4 opacity-40 group-hover:opacity-100", user.role === 'promo_coach' ? "text-blue-400" : "text-emerald-400")} />
                        <div className="absolute inset-0 bg-white/5 scan-line" />
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
                    <span className="text-xs font-headline font-bold text-white/60 tracking-wide lowercase">{user.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "rounded-2xl font-black text-[9px] uppercase tracking-widest px-3",
                      user.role === 'promo_coach' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    )}>
                      {AVAILABLE_ROLES.find(r => r.value === user.role)?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <StatusBadge status={user.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-xl transition-all" onClick={() => handleEdit(user)}><Pencil className="h-4 w-4" /></Button>
                      {user.status === 'Denied' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-xl transition-all" onClick={() => handleStatusChange(user.id, 'Approved')}><UserCheck className="h-4 w-4" /></Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 border border-white/5 rounded-xl transition-all" onClick={() => handleStatusChange(user.id, 'Denied')}><UserX className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500/20 hover:text-rose-500 border border-white/5 rounded-xl transition-all" onClick={() => handleDelete(user.id, user.name)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[8px] font-black text-emerald-400/40 uppercase tracking-[0.5em] rounded-b-3xl">
          <span>Monitorizando {filteredUsers.length} nodos de identidad</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-400 animate-pulse" /> Sincronización Global: Estable</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 italic">Credential_Factory_v2.0</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left leading-none">
                {editingId ? "EDITAR_NODO" : "EMITIR_ACCESO"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <form onSubmit={handleCreateCredential} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Nombre</Label>
                  <Input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
                    className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 text-emerald-400" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Apellidos</Label>
                  <Input 
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value.toUpperCase()})}
                    className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold uppercase focus:border-emerald-500 text-emerald-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Mail de Acceso</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500/40" />
                  <Input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl font-bold focus:border-emerald-500 text-emerald-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Protocolo de Rol</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({...formData, role: v})}>
                  <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#04070c] border-emerald-500/20 rounded-2xl">
                    {AVAILABLE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value} className="text-[10px] font-black uppercase tracking-widest focus:bg-emerald-500 focus:text-black">
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3 w-3 text-emerald-400" />
                <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest italic">Aviso de Auditoría</span>
              </div>
              <p className="text-[9px] text-emerald-400/40 leading-relaxed font-bold uppercase italic">
                Cualquier cambio en la credencial del usuario será registrado en los logs de seguridad global de SynqAI.
              </p>
            </div>
          </form>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className="flex-1 h-16 border border-emerald-500/20 text-emerald-400/40 font-black uppercase text-[10px] tracking-widest rounded-2xl">CANCELAR</Button>
            </SheetClose>
            <Button 
              onClick={handleCreateCredential}
              disabled={loading}
              className="flex-[2] h-16 bg-emerald-500 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "SINCRONIZAR_CAMBIOS" : "EMITIR_CREDENCIAL")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetricMiniCard({ label, value, color }: any) {
  return (
    <Card className="glass-panel p-4 relative group overflow-hidden border border-emerald-500/20 bg-black/20 rounded-3xl">
      <div className="absolute top-0 right-0 p-2 opacity-5"><Zap className="h-8 w-8 text-emerald-500" /></div>
      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-400/40 mb-1 italic">{label}</p>
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
    <Badge variant="outline" className={cn("rounded-2xl font-black text-[8px] uppercase tracking-widest px-3 py-1 italic", styles[status])}>
      {status}
    </Badge>
  );
}
