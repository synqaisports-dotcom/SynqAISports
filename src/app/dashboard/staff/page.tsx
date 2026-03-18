
"use client";

import { useState, useEffect } from "react";
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
  ShieldAlert,
  Camera,
  X
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
import Image from "next/image";

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
  { id: "s1", name: "Ismael Muñoz", email: "i.munoz@club.com", role: "academy_director", phone: "+34 600 000 001", status: "Active", photoUrl: "" },
  { id: "s2", name: "Laura Sánchez", email: "l.sanchez@club.com", role: "methodology_director", phone: "+34 600 000 002", status: "Active", photoUrl: "" },
  { id: "s3", name: "Carlos Ruiz", email: "c.ruiz@club.com", role: "coach", phone: "+34 600 000 003", status: "Active", photoUrl: "" },
  { id: "s4", name: "Elena Gómez", email: "e.gomez@club.com", role: "stage_coordinator", phone: "+34 600 000 004", status: "Active", photoUrl: "" },
];

export default function StaffManagementPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);

  // OPTIMIZACIÓN: Renderizado Diferido del formulario
  useEffect(() => {
    if (isSheetOpen) {
      const timer = setTimeout(() => setIsFormReady(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsFormReady(false);
    }
  }, [isSheetOpen]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photoUrl: "",
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
      photoUrl: "",
      role: (availableRoles[0] as UserRole) || "coach", 
      countryPrefix: "+34",
      phone: "", 
      status: "Active" 
    });
    setIsSheetOpen(true);
  };

  const handleEdit = (member: any) => {
    if (ROLE_HIERARCHY[member.role] >= currentUserRank && !isSuperAdmin) {
      toast({
        variant: "destructive",
        title: "ACCESO_DENEGADO",
        description: "No tiene autoridad para modificar este nivel jerárquico.",
      });
      return;
    }

    const nameParts = member.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const phoneFull = member.phone || "";
    const prefixMatch = phoneFull.match(/^(\+\d+)\s*(.*)$/);
    const countryPrefix = prefixMatch ? prefixMatch[1] : "+34";
    const phone = prefixMatch ? prefixMatch[2] : phoneFull;

    setEditingId(member.id);
    setFormData({
      firstName,
      lastName,
      email: member.email,
      photoUrl: member.photoUrl || "",
      role: member.role as UserRole,
      countryPrefix,
      phone,
      status: member.status
    });
    setIsSheetOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
      photoUrl: formData.photoUrl,
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
            <span className={cn("text-[10px] font-black tracking-[0.5em] uppercase italic", isSuperAdmin ? "text-emerald-400" : "text-primary")}>
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
            "rounded-2xl text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all border-none disabled:opacity-30",
            isSuperAdmin ? "bg-emerald-500" : "bg-primary"
          )}
        >
          <Plus className="h-4 w-4 mr-2" /> Alta de Trabajador
        </Button>
      </div>

      {isSuperAdmin && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
            MODO_AUDITORÍA_ACTIVO: Tienes autoridad total para gestionar Administradores de Club y Directivos.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StaffStat label="Equipo Total" value={staff.length.toString()} icon={Users} isSuperAdmin={isSuperAdmin} />
        <StaffStat label="Entrenadores" value={staff.filter(s => s.role === 'coach').length.toString()} icon={Award} highlight isSuperAdmin={isSuperAdmin} />
        <StaffStat label="Nivel de Mando" value={isSuperAdmin ? 'Autoridad Raíz' : (ROLES_INFO[profile?.role || 'coach']?.label || 'Invitado')} icon={ShieldCheck} isSuperAdmin={isSuperAdmin} />
        <StaffStat label="Actividad Red" value="94%" icon={Activity} isSuperAdmin={isSuperAdmin} />
      </div>

      <Card className={cn("glass-panel border bg-black/40 overflow-hidden mb-8 shadow-2xl rounded-3xl", isSuperAdmin ? "border-emerald-500/20" : "border-primary/20")}>
        <CardHeader className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className={cn("absolute left-3 top-3.5 h-4 w-4 opacity-50", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
            <Input 
              placeholder="BUSCAR POR NOMBRE, MAIL O ROL..." 
              className={cn(
                "pl-10 h-12 bg-white/5 border rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all",
                isSuperAdmin ? "border-emerald-500/20 focus-visible:ring-emerald-500/50 text-emerald-400 placeholder:text-emerald-400/20" : "border-primary/20 focus-visible:ring-primary/50 text-primary placeholder:text-primary/20"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <span className={cn("text-[9px] font-black uppercase tracking-widest italic", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>Jerarquía Activa:</span>
             <Badge variant="outline" className={cn("rounded-2xl font-black text-[9px] uppercase tracking-widest px-3", isSuperAdmin ? "border-emerald-500/20 text-emerald-400" : "border-primary/20 text-primary")}>
               {profile?.role?.toUpperCase()}
             </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-widest", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>Identidad / Contacto</th>
                  <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-widest", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>Protocolo de Rol</th>
                  <th className={cn("px-6 py-5 text-[10px] font-black uppercase tracking-widest", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>Estado Red</th>
                  <th className={cn("px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>Terminal Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStaff.map((member) => (
                  <tr key={member.id} className={cn("group transition-colors", isSuperAdmin ? "hover:bg-emerald-500/[0.02]" : "hover:bg-primary/[0.02]")}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center relative overflow-hidden transition-all", isSuperAdmin ? "group-hover:border-emerald-500/40" : "group-hover:border-primary/40")}>
                           {member.photoUrl ? (
                             <Image src={member.photoUrl} alt={member.name} fill className="object-cover rounded-full" />
                           ) : (
                             <IdCard className={cn("h-5 w-5 transition-all", isSuperAdmin ? "text-emerald-400/20 group-hover:text-emerald-400" : "text-primary/20 group-hover:text-primary")} />
                           )}
                           <div className={cn("absolute inset-0 scan-line opacity-0 group-hover:opacity-100", isSuperAdmin ? "bg-emerald-500/5" : "bg-primary/5")} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-white uppercase text-xs italic transition-all group-hover:cyan-text-glow">{member.name}</p>
                          <p className={cn("text-[9px] font-bold uppercase tracking-widest flex items-center gap-2", isSuperAdmin ? "text-emerald-400" : "text-primary")}>
                            <Mail className="h-2 w-2" /> {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className={cn("rounded-2xl font-black text-[9px] uppercase tracking-widest px-3 py-1", ROLES_INFO[member.role]?.color)}>
                        {ROLES_INFO[member.role]?.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", isSuperAdmin ? "bg-emerald-500 shadow-[0_0_8px_var(--emerald-500)]" : "bg-primary shadow-[0_0_8px_var(--primary)]")} />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", isSuperAdmin ? "text-emerald-400/80" : "text-primary/80")}>Sincronizado</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={cn("h-9 w-9 border border-white/10 transition-all rounded-xl", isSuperAdmin ? "text-emerald-400 hover:bg-emerald-500/10" : "text-primary hover:bg-primary/10")}
                          onClick={() => handleEdit(member)}
                          title="Modificar Identidad"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 border border-rose-500/10 transition-all rounded-xl"
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
        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.5em] rounded-b-3xl">
          <span className={isSuperAdmin ? "text-emerald-400/30" : "text-primary/30"}>Mostrando {filteredStaff.length} de {staff.length} miembros del staff</span>
          <span className="flex items-center gap-2 text-primary"><CheckCircle2 className={cn("h-3 w-3 animate-pulse", isSuperAdmin ? "text-emerald-400" : "text-primary")} /> Jerarquía de Mando: ESTABLE</span>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className={cn("bg-[#04070c]/98 backdrop-blur-xl border-l text-white w-full sm:max-w-md shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col", isSuperAdmin ? "border-emerald-500/20" : "border-primary/20")}>
          <div className="p-10 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full animate-pulse", isSuperAdmin ? "bg-emerald-500" : "bg-primary")} />
                <span className={cn("text-[10px] font-black uppercase tracking-[0.4em] italic", isSuperAdmin ? "text-emerald-400" : "text-primary")}>Credential_Deploy_v1.5</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter text-white uppercase text-left">
                {editingId ? "MODIFICAR_IDENTIDAD" : "EMITIR_CREDENCIAL"}
              </SheetTitle>
              <SheetDescription className={cn("text-[10px] uppercase font-bold tracking-widest text-left italic", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>
                Defina el nivel jerárquico y los parámetros de acceso del trabajador.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
            {!isFormReady ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Formulario...</span>
              </div>
            ) : (
              <form onSubmit={handleSaveStaff} className="space-y-10 animate-in fade-in duration-300">
                {/* SECCIÓN DE IDENTIDAD VISUAL CIRCULAR */}
                <div className="space-y-4">
                  <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Identidad Visual Staff</Label>
                  <div className={cn("flex flex-col items-center justify-center p-8 rounded-3xl relative overflow-hidden", isSuperAdmin ? "bg-emerald-500/5" : "bg-primary/5")}>
                    <div className={cn("relative h-40 w-40 rounded-full border-2 border-dashed group cursor-pointer transition-all flex items-center justify-center bg-black/40 shadow-[0_0_30px_rgba(0,0,0,0.5)]", isSuperAdmin ? "border-emerald-500/30 hover:border-emerald-500/60" : "border-primary/30 hover:border-primary/60")}>
                      {formData.photoUrl ? (
                        <div className={cn("relative h-full w-full rounded-full overflow-hidden border", isSuperAdmin ? "border-emerald-500/40" : "border-primary/40")}>
                          <Image src={formData.photoUrl} alt="Preview" fill className="object-cover rounded-full" />
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, photoUrl: ""}); }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className={cn("h-16 w-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform", isSuperAdmin ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-primary/10 border border-primary/20")}>
                            <Camera className={cn("h-8 w-8", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")} />
                          </div>
                          <span className={cn("text-[8px] font-black uppercase tracking-widest text-center italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>SINCRO_FOTO</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Nombre</Label>
                      <Input 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value.toUpperCase()})}
                        placeholder="EJ: JUAN" 
                        className={cn(
                          "h-14 bg-white/5 border rounded-2xl font-bold uppercase transition-all text-lg",
                          isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400 placeholder:text-emerald-400/20" : "border-primary/20 focus:border-primary text-primary placeholder:text-primary/20"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Apellidos</Label>
                      <Input 
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value.toUpperCase()})}
                        placeholder="EJ: PÉREZ" 
                        className={cn(
                          "h-14 bg-white/5 border rounded-2xl font-bold uppercase transition-all text-lg",
                          isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400 placeholder:text-emerald-400/20" : "border-primary/20 focus:border-primary text-primary placeholder:text-primary/20"
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Email Profesional</Label>
                    <div className="relative">
                      <Mail className={cn("absolute left-3 top-4 h-4 w-4", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")} />
                      <Input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="USER@CLUB.COM" 
                        className={cn(
                          "pl-10 h-14 bg-white/5 border rounded-2xl font-bold transition-all",
                          isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400 placeholder:text-emerald-400/20" : "border-primary/20 focus:border-primary text-primary placeholder:text-primary/20"
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Nivel Jerárquico</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(v) => setFormData({...formData, role: v as UserRole})}
                      >
                        <SelectTrigger className={cn(
                          "h-12 bg-white/5 border rounded-2xl font-bold uppercase tracking-widest transition-all",
                          isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400" : "border-primary/20 focus:border-primary text-primary"
                        )}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#04070c] border-primary/20 rounded-2xl">
                          {availableRoles.map(role => (
                            <SelectItem key={role} value={role} className="text-[10px] font-black uppercase tracking-widest focus:bg-primary">
                              {ROLES_INFO[role]?.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={cn("text-[10px] font-black uppercase tracking-widest ml-1 italic", isSuperAdmin ? "text-emerald-400/60" : "text-primary/60")}>Teléfono de Contacto</Label>
                      <div className="flex gap-2">
                        <div className="w-24 shrink-0">
                          <Input 
                            value={formData.countryPrefix}
                            onChange={(e) => setFormData({...formData, countryPrefix: e.target.value})}
                            placeholder="+34" 
                            className={cn(
                              "h-12 bg-white/5 border rounded-2xl font-bold text-center transition-all",
                              isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400" : "border-primary/20 focus:border-primary text-primary"
                            )}
                          />
                        </div>
                        <div className="relative flex-1">
                          <Phone className={cn("absolute left-3 top-3.5 h-4 w-4", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")} />
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            placeholder="600 000 000" 
                            className={cn(
                              "pl-10 h-12 bg-white/5 border rounded-2xl font-bold transition-all",
                              isSuperAdmin ? "border-emerald-500/20 focus:border-emerald-500 text-emerald-400 placeholder:text-emerald-400/20" : "border-primary/20 focus:border-primary text-primary placeholder:text-primary/20"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cn("p-6 border space-y-3 rounded-3xl", isSuperAdmin ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/20")}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("h-3 w-3", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
                    <span className={cn("text-[9px] font-black uppercase tracking-widest italic", isSuperAdmin ? "text-emerald-400" : "text-primary")}>Protocolo de Jerarquía</span>
                  </div>
                  <p className={cn("text-[9px] leading-relaxed font-bold uppercase italic", isSuperAdmin ? "text-emerald-400/40" : "text-primary/40")}>
                    {isSuperAdmin 
                      ? "SISTEMA_ROOT: Como Superadmin, puedes emitir credenciales para cualquier nivel de la red, incluyendo Administradores de Club."
                      : "El sistema de SynQAI solo permite la creación de perfiles con un rango inferior al del administrador actual."
                    }
                  </p>
                </div>
              </form>
            )}
          </div>

          <div className="p-10 bg-black/40 border-t border-white/5 flex gap-4">
            <SheetClose asChild>
              <Button variant="ghost" className={cn("flex-1 h-16 border font-black uppercase text-[10px] tracking-widest transition-all rounded-2xl active:scale-95", isSuperAdmin ? "border-emerald-500/20 text-emerald-400/60 hover:bg-emerald-500/10" : "border-primary/20 text-primary/60 hover:bg-primary/10")}>
                CANCELAR
              </Button>
            </SheetClose>
            <Button 
              onClick={handleSaveStaff}
              disabled={loading || !isFormReady}
              className={cn(
                "flex-[2] h-16 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] hover:scale-[1.02] transition-all border-none active:scale-95",
                isSuperAdmin ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-primary"
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

function StaffStat({ label, value, icon: Icon, highlight, isSuperAdmin }: any) {
  return (
    <Card className={cn("glass-panel p-5 flex items-center gap-5 relative overflow-hidden group bg-black/20 border transition-all rounded-3xl", isSuperAdmin ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-primary/20 hover:border-primary/40")}>
       <div className={cn(
         "h-12 w-12 flex items-center justify-center border transition-all rotate-3 group-hover:rotate-0 duration-500 rounded-2xl bg-white/5",
         isSuperAdmin ? "border-emerald-500/20" : "border-primary/20"
       )}>
          <Icon className={cn("h-6 w-6", isSuperAdmin ? "text-emerald-400" : "text-primary")} />
       </div>
       <div className="relative z-10">
          <p className={cn("text-[9px] font-black uppercase tracking-widest italic", isSuperAdmin ? "text-emerald-400" : "text-primary")}>{label}</p>
          <div className="flex items-baseline gap-2">
             <p className={cn(
               "text-2xl font-black italic tracking-tighter",
               isSuperAdmin ? "text-emerald-400 emerald-text-glow" : "text-primary cyan-text-glow"
             )}>{value}</p>
          </div>
       </div>
       <div className={cn("absolute inset-0 scan-line opacity-0 group-hover:opacity-10", isSuperAdmin ? "bg-emerald-500/5" : "bg-primary/5")} />
    </Card>
  );
}
