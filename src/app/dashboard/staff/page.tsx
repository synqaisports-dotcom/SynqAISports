
"use client";

import { useState } from "react";
import { 
  UserCog, 
  Plus, 
  Search, 
  Users, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Activity, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  ChevronRight,
  TrendingUp,
  Award,
  IdCard,
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
import { useAuth, UserRole } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Matriz de Jerarquía (Rango mayor = más autoridad)
const ROLE_HIERARCHY: Record<string, number> = {
  superadmin: 100,
  club_admin: 90,
  academy_director: 80,
  methodology_director: 70,
  stage_coordinator: 60,
  coach: 50,
  delegate: 40,
  tutor: 30,
  athlete: 20
};

const ROLES_INFO: Record<string, { label: string; color: string }> = {
  club_admin: { label: "Admin Club", color: "text-rose-400 border-rose-500/20 bg-rose-500/5" },
  academy_director: { label: "Director Cantera", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
  methodology_director: { label: "Director Metodología", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
  stage_coordinator: { label: "Coordinador Etapa", color: "text-primary border-primary/20 bg-primary/5" },
  coach: { label: "Entrenador", color: "text-blue-400 border-blue-500/20 bg-blue-500/5" },
  delegate: { label: "Delegado", color: "text-slate-400 border-slate-500/20 bg-slate-500/5" },
};

const INITIAL_STAFF = [
  { id: "s1", name: "Ismael Muñoz", email: "i.munoz@club.com", role: "academy_director", phone: "+34 600 000 001", status: "Active" },
  { id: "s2", name: "Laura Sánchez", email: "l.sanchez@club.com", role: "methodology_director", phone: "+34 600 000 002", status: "Active" },
  { id: "s3", name: "Carlos Ruiz", email: "c.ruiz@club.com", role: "coach", phone: "+34 600 000 003", status: "Active" },
  { id: "s4", name: "Elena Gómez", email: "e.gomez@club.com", role: "stage_coordinator", phone: "+34 600 000 004", status: "Active" },
];

export default function StaffManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "coach" as UserRole,
    countryPrefix: "+34",
    phone: "",
    status: "Active"
  });

  const isSuperAdmin = profile?.role === "superadmin";
  const currentUserRank = ROLE_HIERARCHY[profile?.role || "coach"] || 0;

  // Filtrar roles que el usuario actual PUEDE crear (solo rangos menores)
  const availableRoles = Object.keys(ROLES_INFO).filter(
    role => ROLE_HIERARCHY[role] < currentUserRank
  );

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ 
      firstName: "", 
      lastName: "", 
      email: "", 
      role: (availableRoles[0] as UserRole) || "coach", 
      countryPrefix: "+34",
      phone: "", 
      status: "Active" 
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (member: any) => {
    // Verificar si el usuario tiene permiso para editar a esta persona
    if (ROLE_HIERARCHY[member.role] >= currentUserRank && !isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "ACCESO_DENEGADO",
        description: "No tiene autoridad para modificar este nivel jerárquico.",
      });
      return;
    }

    // Dividir el nombre completo en nombre y apellidos
    const nameParts = member.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Dividir teléfono en prefijo y número
    const phoneFull = member.phone || "";
    const prefixMatch = phoneFull.match(/^(\+\d+)\s*(.*)$/);
    const countryPrefix = prefixMatch ? prefixMatch[1] : "+34";
    const phone = prefixMatch ? prefixMatch[2] : phoneFull;

    setEditingId(member.id);
    setFormData({
      firstName,
      lastName,
      email: member.email,
      role: member.role as UserRole,
      countryPrefix,
      phone,
      status: member.status
    });
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string, name: string, role: string) => {
    if (ROLE_HIERARCHY[role] >= currentUserRank && !isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "PROTOCOLO_BLOQUEADO",
        description: "No puede eliminar a un superior o igual de la red.",
      });
      return;
    }

    setStaff(prev => prev.filter(s => s.id !== id));
    toast({
      variant: "destructive",
      title: "TRABAJADOR_DESVINCULADO",
      description: `${name} ha sido eliminado de la matriz del club.`,
    });
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const fullPhone = `${formData.countryPrefix} ${formData.phone}`.trim();
    
    const savePayload = {
      name: fullName,
      email: formData.email,
      role: formData.role,
      phone: fullPhone,
      status: formData.status
    };

    setTimeout(() => {
      if (editingId) {
        setStaff(prev => prev.map(s => s.id === editingId ? { ...s, ...savePayload } : s));
        toast({ title: "PERFIL_ACTUALIZADO", description: "La identidad ha sido resincronizada." });
      } else {
        const newMember = { id: `s${Date.now()}`, ...savePayload };
        setStaff([newMember, ...staff]);
        toast({ title: "CREDENCIAL_EMITIDA", description: `${fullName} ya es parte de la red.` });
      }
      setLoading(false);
      setIsSheetOpen(false);
    }, 1000);
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ROLES_INFO[s.role]?.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <UserCog className={cn("h-5 w-5 animate-pulse", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
            <span className={cn("text-[10px] font-black tracking-[0.5em] uppercase", isSuperAdmin ? "text-emerald-400" : "text-primary")}>
              {isSuperAdmin ? "Global_Hierarchy_Audit" : "Staff_Hierarchy_Control"}
            </span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Staff Técnico
          </h1>
        </div>
        
        <Button 
          onClick={handleOpenCreate}
          disabled={availableRoles.length === 0}
          className={cn(
            "rounded-none text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none disabled:opacity-30",
            isSuperAdmin ? "bg-emerald-500" : "bg-primary"
          )}
        >
          <Plus className="h-4 w-4 mr-2" /> Alta de Trabajador
        </Button>
      </div>

      {isSuperAdmin && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            MODO_AUDITORÍA_ACTIVO: Tienes autoridad total para gestionar Administradores de Club y Directivos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StaffStat label="Equipo Total" value={staff.length.toString()} icon={Users} />
        <StaffStat label="Entrenadores" value={staff.filter(s => s.role === 'coach').length.toString()} icon={Award} highlight />
        <StaffStat label="Nivel de Mando" value={isSuperAdmin ? 'Autoridad Raíz' : (ROLES_INFO[profile?.role || 'coach']?.label || 'Invitado')} icon={ShieldCheck} />
        <StaffStat label="Actividad Red" value="94%" icon={Activity} />
      </div>

      <Card className="glass-panel border-none bg-black/40 overflow-hidden mb-8">
        <CardHeader className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className={cn("absolute left-3 top-3.5 h-4 w-4 opacity-50", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
            <Input 
              placeholder="BUSCAR POR NOMBRE, MAIL O ROL..." 
              className="pl-10 h-12 bg-white/5 border-primary/20 rounded-none text-white placeholder:text-white/20 font-bold uppercase text-[10px] tracking-widest focus-visible:ring-primary/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Jerarquía Activa:</span>
             <Badge variant="outline" className={cn("rounded-none font-black text-[9px] uppercase tracking-widest px-3", isSuperAdmin ? "border-emerald-500/20 text-emerald-400" : "border-primary/20 text-primary")}>
               {profile?.role?.toUpperCase()}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Identidad / Contacto</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Protocolo de Rol</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-white/40">Estado Red</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/40 text-right">Terminal Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:border-primary/40 transition-all">
                           <IdCard className="h-5 w-5 text-white/20 group-hover:text-primary transition-all" />
                           <div className="absolute inset-0 bg-primary/5 scan-line opacity-0 group-hover:opacity-100" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-white uppercase text-xs italic group-hover:cyan-text-glow transition-all">{member.name}</p>
                          <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-2 w-2 text-primary/40" /> {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className={cn("rounded-none font-black text-[9px] uppercase tracking-widest px-3 py-1", ROLES_INFO[member.role]?.color)}>
                        {ROLES_INFO[member.role]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Sincronizado</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-primary hover:bg-primary/10 border border-primary/10 transition-all"
                          onClick={() => handleEdit(member)}
                          title="Modificar Identidad"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 transition-all"
                          onClick={() => handleDelete(member.id, member.name, member.role)}
                          title="Vincular Baja"
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
          <span>Mostrando {filteredStaff.length} de {staff.length} miembros del staff</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-primary animate-pulse" /> Jerarquía de Mando: ESTABLE</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full animate-pulse", isSuperAdmin ? "bg-emerald-500" : "bg-primary")} />
                <span className={cn("text-[10px] font-black uppercase tracking-[0.4em]", isSuperAdmin ? "text-emerald-400" : "text-primary")}>Credential_Deploy_v1.5</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingId ? "MODIFICAR_IDENTIDAD" : "EMITIR_CREDENCIAL"}
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-left">
                Defina el nivel jerárquico y los parámetros de acceso del trabajador.
              </SheetDescription>
            </SheetHeader>
          </div>

          <form onSubmit={handleSaveStaff} className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nombre</Label>
                  <Input 
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value.toUpperCase()})}
                    placeholder="EJ: JUAN" 
                    className="h-14 bg-white/5 border-primary/20 rounded-none font-bold uppercase focus:border-primary transition-all placeholder:text-white/10 text-lg" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Apellidos</Label>
                  <Input 
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                    placeholder="EJ: PÉREZ" 
                    className="h-14 bg-white/5 border-primary/20 rounded-none font-bold uppercase focus:border-primary transition-all placeholder:text-white/10 text-lg" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Email Profesional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-4 h-4 w-4 text-primary/40" />
                  <Input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="USER@CLUB.COM" 
                    className="pl-10 h-14 bg-white/5 border-primary/20 rounded-none font-bold focus:border-primary transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Nivel Jerárquico</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
                  >
                    <SelectTrigger className="h-12 bg-white/5 border-primary/20 rounded-none text-white/60 font-bold uppercase tracking-widest focus:border-primary transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#04070c] border-primary/20 rounded-none">
                      {availableRoles.map(role => (
                        <SelectItem key={role} value={role} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                          {ROLES_INFO[role]?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Teléfono de Contacto</Label>
                  <div className="flex gap-2">
                    <div className="w-24 shrink-0">
                      <Input 
                        value={formData.countryPrefix}
                        onChange={(e) => setFormData({...formData, countryPrefix: e.target.value})}
                        placeholder="+34" 
                        className="h-12 bg-white/5 border-primary/20 rounded-none font-bold text-center focus:border-primary transition-all" 
                      />
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3.5 h-4 w-4 text-primary/40" />
                      <Input 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="600 000 000" 
                        className="pl-10 h-12 bg-white/5 border-primary/20 rounded-none font-bold focus:border-primary transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cn("p-6 border space-y-3", isSuperAdmin ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/20")}>
              <div className="flex items-center gap-2">
                <ShieldCheck className={cn("h-3 w-3", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", isSuperAdmin ? "text-emerald-400" : "text-primary")}>Protocolo de Jerarquía</span>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed font-bold uppercase italic">
                {isSuperAdmin 
                  ? "SISTEMA_ROOT: Como Superadmin, puedes emitir credenciales para cualquier nivel de la red, incluyendo Administradores de Club."
                  : "El sistema de SynQAI solo permite la creación de perfiles con un rango inferior al del administrador actual."
                }
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
              onClick={handleSaveStaff}
              disabled={loading}
              className={cn(
                "flex-[2] h-16 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-none shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none",
                isSuperAdmin ? "bg-emerald-500" : "bg-primary"
              )}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingId ? "SINCRONIZAR_PERFIL" : "VINCULAR_TRABAJADOR")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function StaffStat({ label, value, icon: Icon, highlight }: any) {
  return (
    <Card className="glass-panel p-5 flex items-center gap-5 relative overflow-hidden group bg-black/20 border border-primary/20">
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl",
         highlight ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
       )}>
          <Icon className={cn("h-6 w-6", highlight ? "text-primary" : "text-white/40")} />
       </div>
       <div className="relative z-10">
          <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               highlight ? "text-primary cyan-text-glow" : "text-white"
             )}>{value}</p>
          </div>
       </div>
       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 scan-line" />
    </Card>
  );
}
