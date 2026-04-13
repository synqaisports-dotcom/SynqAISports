"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Globe2, 
  Mail, 
  Phone,
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
import { useAuth } from "@/lib/auth-context";
import {
  buildRoleSelectOptions,
  getAssignableRoleSelectOptions,
  getRoleDisplayLabel,
  type SynqRoleRowLike,
} from "@/lib/role-catalog";

export default function GlobalUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [clubs, setClubs] = useState<Array<{ id: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingUserIds, setUpdatingUserIds] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    country: "España",
    phonePrefix: "+34",
    phone: "",
    role: "promo_coach",
    clubId: "",
  });

  const { session } = useAuth();
  const [synqRoleRows, setSynqRoleRows] = useState<SynqRoleRowLike[]>([]);

  const roleSelectOptions = useMemo(() => {
    const remote = buildRoleSelectOptions(synqRoleRows, { includeSuperadmin: true });
    const base = remote.length > 0 ? remote : getAssignableRoleSelectOptions();
    if (formData.role && !base.some((o) => o.value === formData.role)) {
      return [
        ...base,
        {
          value: formData.role,
          label: getRoleDisplayLabel(formData.role, synqRoleRows),
        },
      ].sort((a, b) => a.label.localeCompare(b.label, "es"));
    }
    return base;
  }, [synqRoleRows, formData.role]);

  useEffect(() => {
    if (!session?.access_token) {
      setSynqRoleRows([]);
      return;
    }
    let cancelled = false;
    void fetch("/api/roles/catalog", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        const j = (await res.json()) as { roles?: SynqRoleRowLike[] };
        if (!cancelled) setSynqRoleRows(j.roles ?? []);
      })
      .catch(() => {
        if (!cancelled) setSynqRoleRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token) {
      setClubs([]);
      return;
    }
    let cancelled = false;
    void fetch("/api/admin/clubs", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("clubs_fetch_failed");
        const payload = (await res.json()) as { clubs?: Array<{ id?: string; name?: string }> };
        if (cancelled) return;
        const parsed = (payload.clubs ?? [])
          .filter((c) => typeof c.id === "string" && typeof c.name === "string")
          .map((c) => ({ id: String(c.id), name: String(c.name) }))
          .sort((a, b) => a.name.localeCompare(b.name, "es"));
        setClubs(parsed);
      })
      .catch(() => {
        if (!cancelled) setClubs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    const loadUsers = async () => {
      const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
      const normalized = savedUsers.map((su: any) => ({
        ...su,
        status: su.status || "Approved",
        lastSeen: su.lastSeen || "Online",
      }));

      if (!session?.access_token) {
        setUsers(normalized);
        return;
      }
      try {
        const res = await fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          setUsers(normalized);
          return;
        }
        const data = (await res.json()) as { users?: any[] };
        if (Array.isArray(data?.users)) {
          setUsers(data.users);
          localStorage.setItem("synq_global_users", JSON.stringify(data.users));
        } else {
          setUsers(normalized);
        }
      } catch {
        setUsers(normalized);
      }
    };
    void loadUsers();
  }, [session?.access_token]);

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
    if (session?.access_token) {
      void fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          description: desc,
          type,
          actorEmail: "",
        }),
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (updatingUserIds[id]) return;
    const user = users.find(u => u.id === id);
    if (!user) return;
    setUpdatingUserIds((prev) => ({ ...prev, [id]: true }));

    const prevUsers = users;
    const nextUsers = users.map(u => u.id === id ? { ...u, status: newStatus } : u);
    setUsers(nextUsers);
    
    // Sincronizar con el storage global
    const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
    const updatedGlobal = savedUsers.map((su: any) => su.email === user.email ? { ...su, status: newStatus } : su);
    localStorage.setItem("synq_global_users", JSON.stringify(updatedGlobal));
    if (user.source === "remote" && session?.access_token) {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status: newStatus, lastSeen: "Online" }),
      });
      if (!res.ok) {
        setUsers(prevUsers);
        toast({
          variant: "destructive",
          title: "ERROR_REMOTO",
          description: "No se pudo actualizar el estado en red.",
        });
        setUpdatingUserIds((prev) => ({ ...prev, [id]: false }));
        return;
      }
    }

    const title = newStatus === 'Approved' ? "ACCESO_AUTORIZADO" : 
                  newStatus === 'Denied' ? "ACCESO_BLOQUEADO" : "PROTOCOLO_RESETEADO";
    const type = newStatus === 'Approved' ? 'Success' : 
                 newStatus === 'Denied' ? 'Warning' : 'Info';
    
    addAuditLog(title, `Estado de ${user.name}: ${newStatus.toUpperCase()}.`, type);
    
    toast({
      title: title,
      description: `El nodo de usuario ha cambiado su protocolo a ${newStatus.toUpperCase()}.`,
    });
    setUpdatingUserIds((prev) => ({ ...prev, [id]: false }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      surname: "",
      email: "",
      country: "España",
      phonePrefix: "+34",
      phone: "",
      role: "promo_coach",
      clubId: "",
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (user: any) => {
    const phoneFull = String(user.phone || "");
    const prefixMatch = phoneFull.match(/^(\+\d+)\s*(.*)$/);
    const phonePrefix = prefixMatch ? prefixMatch[1] : "+34";
    const phone = prefixMatch ? prefixMatch[2] : phoneFull;
    setEditingId(user.id);
    setFormData({
      name: user.name,
      surname: user.surname || "",
      email: user.email,
      country: user.country || "España",
      phonePrefix,
      phone,
      role: user.role,
      clubId: user.clubId ?? "",
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    if (userToDelete.source === "remote" && session?.access_token) {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, status: "Denied", lastSeen: "Blocked_by_admin" }),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "ERROR_REMOTO",
          description: "No se pudo bloquear el usuario remoto.",
        });
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "Denied", lastSeen: "Blocked_by_admin" } : u)));
      addAuditLog("USUARIO_BLOQUEADO", `Nodo remoto de ${name} bloqueado por superadmin.`, "Warning");
      toast({ title: "USUARIO_BLOQUEADO", description: "Usuario remoto marcado como DENIED." });
      return;
    }

    const nextUsers = users.filter(u => u.id !== id);
    setUsers(nextUsers);
    const savedUsers = JSON.parse(localStorage.getItem("synq_global_users") || "[]");
    const updatedGlobal = savedUsers.filter((su: any) => su.email !== userToDelete.email);
    localStorage.setItem("synq_global_users", JSON.stringify(updatedGlobal));
    addAuditLog("USUARIO_ELIMINADO", `Nodo local de ${name} eliminado.`, "Warning");
    toast({ variant: "destructive", title: "NODO_ELIMINADO", description: "Usuario local eliminado." });
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const fullPhone = `${formData.phonePrefix} ${formData.phone}`.trim();
    const roleNormalized = String(formData.role || "").trim().toLowerCase();
    const requiresClub = roleNormalized.length > 0 && roleNormalized !== "superadmin";
    if (requiresClub && !formData.clubId) {
      toast({
        variant: "destructive",
        title: "CLUB_REQUERIDO",
        description: "Selecciona un club para ese protocolo de rol.",
      });
      setLoading(false);
      return;
    }
    try {
      if (editingId) {
        const editedUser = users.find((u) => u.id === editingId);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingId ? { ...u, ...formData, phone: fullPhone } : u)),
        );
        if (editedUser?.source === "remote" && session?.access_token) {
          const res = await fetch("/api/admin/users", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              id: editingId,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              country: formData.country,
              phone: fullPhone,
              clubId: formData.clubId || null,
            }),
          });
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(j.error ?? `HTTP ${res.status}`);
          }
        }
        addAuditLog("MODIFICACIÓN_USUARIO", `Perfil de ${formData.name} actualizado.`, "Info");
        toast({ title: "CREDENCIAL_ACTUALIZADA", description: `Sincronizado: ${formData.name}.` });
      } else {
        if (!session?.access_token) {
          throw new Error("Sesión superadmin no disponible para alta remota.");
        }
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            country: formData.country,
            phone: fullPhone,
            clubId: formData.clubId || null,
            status: "Approved",
            lastSeen: "Just now",
          }),
        });
        const j = (await res.json().catch(() => ({}))) as { user?: any; error?: string };
        if (!res.ok || !j.user?.id) {
          throw new Error(j.error ?? `HTTP ${res.status}`);
        }
        const newUser = {
          id: j.user.id,
          name: j.user.name ?? formData.name,
          surname: j.user.surname ?? formData.surname,
          email: j.user.email ?? formData.email,
          country: j.user.country ?? formData.country,
          phone: fullPhone,
          role: j.user.role ?? formData.role,
          clubId: j.user.clubId ?? formData.clubId ?? null,
          status: j.user.status ?? "Approved",
          lastSeen: j.user.lastSeen ?? "Just now",
          source: "remote",
        };
        setUsers((prev) => [newUser, ...prev]);
        addAuditLog("NUEVA_CREDENCIAL", `Identidad emitida para ${formData.name}.`, "Success");
        toast({ title: "CREDENCIAL_EMITIDA", description: `Acceso generado para ${formData.name}.` });
      }
      setIsSheetOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error desconocido en alta/edición.";
      console.error("[admin-global/users] handleCreateCredential error:", error);
      toast({ variant: "destructive", title: "ERROR_SINCRO_USUARIO", description: msg });
    } finally {
      setLoading(false);
    }
  };

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const filteredUsers = useMemo(() => {
    const q = deferredSearchTerm.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q)
    );
  }, [users, deferredSearchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Home</p>
          <div className="flex items-center gap-3 mb-2">
            <Fingerprint className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase italic">Global_User_Registry_v2.0</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            Dashboard_Usuarios
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-[background-color,border-color,color,opacity,transform] border-none"
        >
          <UserPlus className="h-4 w-4 mr-2" /> Nueva Credencial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricMiniCard label="Total Nodos" value={users.length.toString()} color="text-white" />
        <MetricMiniCard label="Entrenadores Promo" value={users.filter(u => u.role === 'promo_coach').length.toString()} color="text-blue-400" />
        <MetricMiniCard label="Administradores Pro" value={users.filter(u => u.role === 'club_admin').length.toString()} color="text-emerald-400" />
      </div>

      <Card className="glass-panel shadow-2xl overflow-hidden relative border border-emerald-500/20 bg-slate-950/80 rounded-3xl">
        <CardHeader className="bg-slate-950/80 border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-emerald-500 opacity-50" />
            <Input 
              placeholder="FILTRAR POR IDENTIDAD O MAIL..." 
              className="pl-10 h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 placeholder:text-emerald-400/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-emerald-500/50 transition-[background-color,border-color,color,opacity,transform]"
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
                        "h-10 w-10 border rounded-full flex items-center justify-center relative overflow-hidden transition-[background-color,border-color,color,opacity,transform]",
                        user.role === 'promo_coach' ? "bg-blue-500/5 border-blue-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                      )}>
                        <Activity className={cn("h-4 w-4 opacity-40 group-hover:opacity-100", user.role === 'promo_coach' ? "text-blue-400" : "text-emerald-400")} />
                        <div className="absolute inset-0 bg-white/5 scan-line" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-[background-color,border-color,color,opacity,transform]">
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
                      {getRoleDisplayLabel(String(user.role), synqRoleRows)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <StatusBadge status={user.status} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-xl transition-[background-color,border-color,color,opacity,transform]" onClick={() => handleEdit(user)}><Pencil className="h-4 w-4" /></Button>
                      {user.status === 'Denied' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400/40 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-xl transition-[background-color,border-color,color,opacity,transform]" onClick={() => handleStatusChange(user.id, 'Approved')} disabled={!!updatingUserIds[user.id]}><UserCheck className="h-4 w-4" /></Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/5 border border-white/5 rounded-xl transition-[background-color,border-color,color,opacity,transform]" onClick={() => handleStatusChange(user.id, 'Denied')} disabled={!!updatingUserIds[user.id]}><UserX className="h-4 w-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500/20 hover:text-rose-500 border border-white/5 rounded-xl transition-[background-color,border-color,color,opacity,transform]" onClick={() => handleDelete(user.id, user.name)}><Trash2 className="h-4 w-4" /></Button>
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
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-lg shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
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

          <form id="admin-users-form" onSubmit={handleCreateCredential} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-8">
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
                  <SelectContent className="z-[200] bg-[#04070c] border-emerald-500/20 rounded-2xl text-white">
                    {roleSelectOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value} className="text-[10px] font-black uppercase tracking-widest text-white focus:bg-emerald-500 focus:text-black">
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">
                  Club vinculado
                </Label>
                <Select
                  value={formData.clubId || "__none__"}
                  onValueChange={(v) => setFormData({ ...formData, clubId: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger className="h-12 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase">
                    <SelectValue placeholder="Seleccionar club" />
                  </SelectTrigger>
                  <SelectContent className="z-[200] bg-[#04070c] border-emerald-500/20 rounded-2xl text-white">
                    <SelectItem value="__none__" className="text-[10px] font-black uppercase tracking-widest text-white focus:bg-emerald-500 focus:text-black">
                      Sin club
                    </SelectItem>
                    {clubs.map((club) => (
                      <SelectItem
                        key={club.id}
                        value={club.id}
                        className="text-[10px] font-black uppercase tracking-widest text-white focus:bg-emerald-500 focus:text-black"
                      >
                        {club.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/40">
                  Obligatorio para roles no globales.
                </p>
              </div>

              <div className="space-y-2 min-w-0">
                <Label className="text-[10px] font-black uppercase text-emerald-400/60 tracking-widest ml-1 italic">Teléfono de Contacto</Label>
                <div className="flex w-full min-w-0 gap-2">
                  <div className="w-[5.25rem] shrink-0 sm:w-24">
                    <Input
                      value={formData.phonePrefix}
                      onChange={(e) => setFormData({ ...formData, phonePrefix: e.target.value })}
                      placeholder="+34"
                      className="h-12 w-full bg-white/5 border-emerald-500/20 rounded-2xl font-bold text-center transition-[background-color,border-color,color,opacity,transform] focus:border-emerald-500 text-emerald-400"
                    />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500/40" />
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="600 000 000"
                      className="h-12 w-full min-w-0 pl-10 bg-white/5 border-emerald-500/20 rounded-2xl font-bold focus:border-emerald-500 text-emerald-400"
                    />
                  </div>
                </div>
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
              type="submit"
              form="admin-users-form"
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
