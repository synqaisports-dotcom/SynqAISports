
"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { 
  ShieldCheck, 
  UserCog, 
  Lock, 
  ShieldAlert,
  Users,
  MapPin,
  Monitor,
  Dumbbell,
  Sprout,
  Activity,
  Building,
  Eye,
  Pencil,
  Trash2,
  ChevronRight,
  Info,
  Library,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { canUseOperativaSupabase } from "@/lib/operativa-sync";
import { useClubAccessMatrix } from "@/contexts/club-access-matrix-context";
import {
  ROLES_TO_MANAGE,
  CLUB_MODULE_LABELS,
  CLUB_MODULE_DESCRIPTIONS,
  CLUB_MODULE_UI_SECTIONS,
  buildDefaultStaffAccessMatrix,
  createDefaultModuleStateMap,
  normalizeStaffAccessMatrix,
  STAFF_ACCESS_MATRIX_PREFIX,
  type ClubModuleId,
  type ModulePermState,
  type StaffAccessMatrix,
  type ManagedRoleId,
} from "@/lib/club-permissions";

const MODULE_ICONS: Record<ClubModuleId, typeof Building> = {
  club: Building,
  staff: UserCog,
  academy: Sprout,
  players: Users,
  facilities: MapPin,
  peripherals: Smartphone,
  board: Monitor,
  exercises: Dumbbell,
  planner: Activity,
};

export default function AdminPermissionsPage() {
  const { profile, session } = useAuth();
  const { refetch: refetchClubMatrix } = useClubAccessMatrix();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<ManagedRoleId>(ROLES_TO_MANAGE[0].id);
  const [loading, setLoading] = useState(false);
  const clubScopeId = profile?.clubId ?? "global";
  const canUseMatrixSupabase =
    canUseOperativaSupabase(clubScopeId) &&
    !!session?.access_token &&
    !!profile?.role &&
    ["superadmin", "club_admin", "academy_director"].includes(profile.role);
  const matrixStorageKey = `${STAFF_ACCESS_MATRIX_PREFIX}_${clubScopeId}`;
  const [staffAccessMatrix, setStaffAccessMatrix] = useState<StaffAccessMatrix>({});

  // Control de acceso a la página
  const isAuthorized = profile && ["superadmin", "club_admin", "academy_director"].includes(profile.role);

  if (!isAuthorized) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse" />
          <ShieldAlert className="h-20 w-20 text-rose-500 relative z-10" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Acceso de Nivel Insuficiente</h2>
        <p className="text-white/40 font-bold uppercase text-[10px] tracking-[0.4em] max-w-md mx-auto leading-relaxed">
          Este terminal requiere privilegios de autoridad raíz o directiva. Su identidad actual no tiene permisos para modificar la matriz de red.
        </p>
      </div>
    );
  }

  const buildDefaultMatrix = useMemo(() => buildDefaultStaffAccessMatrix(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const load = async () => {
      // 1) Supabase (preferido en desarrollo real)
      if (canUseMatrixSupabase) {
        try {
          const res = await fetch("/api/club/staff-access-matrix", {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          });
          if (res.ok) {
            const json = (await res.json()) as { ok?: boolean; payload?: StaffAccessMatrix };
            const payload = json?.payload;
            if (!cancelled && payload && typeof payload === "object") {
              const normalized = normalizeStaffAccessMatrix(payload as StaffAccessMatrix, buildDefaultMatrix);
              setStaffAccessMatrix(normalized);
              try {
                localStorage.setItem(matrixStorageKey, JSON.stringify(normalized));
              } catch {
                // ignore
              }
              return;
            }
          }
        } catch {
          // fallback => localStorage
        }
      }

      // 2) Fallback localStorage
      try {
        const raw = localStorage.getItem(matrixStorageKey);
        if (!raw) {
          setStaffAccessMatrix(buildDefaultMatrix);
          return;
        }
        const parsed = JSON.parse(raw) as StaffAccessMatrix;
        if (!parsed || typeof parsed !== "object") {
          setStaffAccessMatrix(buildDefaultMatrix);
          return;
        }
        setStaffAccessMatrix(normalizeStaffAccessMatrix(parsed, buildDefaultMatrix));
      } catch {
        setStaffAccessMatrix(buildDefaultMatrix);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [matrixStorageKey, buildDefaultMatrix, canUseMatrixSupabase, session?.access_token]);

  const normalizedMatrix = useMemo(
    () => normalizeStaffAccessMatrix(staffAccessMatrix, buildDefaultMatrix),
    [staffAccessMatrix, buildDefaultMatrix]
  );
  const selectedRule = normalizedMatrix[selectedRole] ?? buildDefaultMatrix[selectedRole]!;

  const toggleStaffRole = (kind: "viewRoles" | "createRoles", roleId: string, checked: boolean) => {
    setStaffAccessMatrix((prev) => {
      const merged = normalizeStaffAccessMatrix(prev, buildDefaultMatrix);
      const base = merged[selectedRole]!;
      const current = new Set(base[kind] ?? []);
      if (checked) current.add(roleId);
      else current.delete(roleId);
      return {
        ...merged,
        [selectedRole]: {
          ...base,
          [kind]: [...current],
        },
      };
    });
  };

  const toggleModulePermission = (moduleId: string, key: keyof ModulePermState, checked: boolean) => {
    setStaffAccessMatrix((prev) => {
      const merged = normalizeStaffAccessMatrix(prev, buildDefaultMatrix);
      const base = merged[selectedRole]!;
      const modules = { ...base.modules! };
      modules[moduleId] = { ...modules[moduleId], [key]: checked };
      return {
        ...merged,
        [selectedRole]: { ...base, modules },
      };
    });
  };

  const handleSaveMatrix = () => {
    setLoading(true);
    setTimeout(async () => {
      const snapshot = normalizeStaffAccessMatrix(staffAccessMatrix, buildDefaultMatrix);
      try {
        localStorage.setItem(matrixStorageKey, JSON.stringify(snapshot));
      } catch {
        // noop
      }

      if (canUseMatrixSupabase) {
        try {
          await fetch("/api/club/staff-access-matrix", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ payload: snapshot }),
          });
        } catch {
          // fallback a local
        }
      }

      toast({
        title: "MATRIZ_SINCRO",
        description: "Los protocolos de permisos han sido actualizados en el nodo.",
      });
      void refetchClubMatrix();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-24">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Auth_Matrix_Control</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic cyan-text-glow">
            Admin & Permisos
          </h1>
        </div>
        
        <Button 
          onClick={handleSaveMatrix}
          disabled={loading}
          className="rounded-none bg-primary text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none"
        >
          {loading ? "Sincronizando..." : "Guardar Cambios Matriz"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
        {/* LISTA DE ROLES (JERARQUÍA) */}
        <aside className="space-y-6">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl">
             <div className="flex items-center gap-3 mb-4">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Jerarquía de Mando</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Seleccione un nivel jerárquico para configurar sus capacidades operativas dentro de la plataforma.
             </p>
          </div>

          <div className="flex flex-col gap-2">
            {ROLES_TO_MANAGE.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-2xl border transition-[background-color,border-color,color,opacity,transform] group relative overflow-hidden",
                  selectedRole === role.id 
                    ? "bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(0,242,255,0.1)]" 
                    : "bg-white/5 border-white/5 text-white/40 hover:border-primary/20 hover:text-white"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    selectedRole === role.id ? "bg-primary animate-pulse" : "bg-white/10"
                  )} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{role.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  selectedRole === role.id ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
                {selectedRole === role.id && (
                  <div className="absolute inset-0 bg-primary/5 scan-line opacity-20" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* MATRIZ DE CONFIGURACIÓN */}
        <main className="space-y-8">
          <Card className="glass-panel border-none bg-black/40 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase">
                    Configuración de Capacidades: {ROLES_TO_MANAGE.find(r => r.id === selectedRole)?.label}
                  </CardTitle>
                  <CardDescription className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                    Por bloque: club y operaciones; luego metodología (cada área con Acceder / Ver / Editar / Borrar).
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 rounded-none uppercase text-[9px] tracking-widest">
                  Nivel_Autoridad: {ROLES_TO_MANAGE.find(r => r.id === selectedRole)?.rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {CLUB_MODULE_UI_SECTIONS.map((section) => (
                  <div key={section.id} className="divide-y divide-white/5">
                    <div
                      className={cn(
                        "px-8 py-5 flex items-start gap-4 border-b border-white/5",
                        section.id === "methodology"
                          ? "bg-amber-500/[0.06] border-l-2 border-l-amber-500/40"
                          : "bg-primary/[0.04] border-l-2 border-l-primary/30",
                      )}
                    >
                      <div
                        className={cn(
                          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border",
                          section.id === "methodology"
                            ? "bg-amber-500/10 border-amber-500/25"
                            : "bg-primary/10 border-primary/20",
                        )}
                      >
                        {section.id === "methodology" ? (
                          <Library className="h-5 w-5 text-amber-400" />
                        ) : (
                          <Building className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                          {section.title}
                        </h3>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-1.5 leading-relaxed">
                          {section.subtitle}
                        </p>
                      </div>
                    </div>

                    {section.modules.map((moduleId) => {
                      const Icon = MODULE_ICONS[moduleId];
                      const modState =
                        selectedRule.modules?.[moduleId] ?? createDefaultModuleStateMap()[moduleId];
                      return (
                        <div
                          key={moduleId}
                          className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-white/[0.01] transition-colors"
                        >
                          <div className="flex items-center gap-6 min-w-[240px]">
                            <div className="h-14 w-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform]">
                              <Icon className="h-6 w-6 text-white/20 group-hover:text-primary transition-[background-color,border-color,color,opacity,transform]" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <h4 className="text-sm font-black text-white uppercase italic tracking-widest group-hover:cyan-text-glow">
                                {CLUB_MODULE_LABELS[moduleId]}
                              </h4>
                              <p className="text-[9px] text-white/35 font-bold uppercase tracking-wide leading-snug">
                                {CLUB_MODULE_DESCRIPTIONS[moduleId]}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 flex-1">
                            <PermissionToggle
                              label="Acceder"
                              icon={Eye}
                              checked={modState.access}
                              onCheckedChange={(v) => toggleModulePermission(moduleId, "access", v)}
                            />
                            <PermissionToggle
                              label="Ver"
                              icon={Eye}
                              checked={modState.view}
                              onCheckedChange={(v) => toggleModulePermission(moduleId, "view", v)}
                            />
                            <PermissionToggle
                              label="Editar"
                              icon={Pencil}
                              checked={modState.edit}
                              onCheckedChange={(v) => toggleModulePermission(moduleId, "edit", v)}
                            />
                            <PermissionToggle
                              label="Borrar"
                              icon={Trash2}
                              critical
                              checked={modState.delete}
                              onCheckedChange={(v) => toggleModulePermission(moduleId, "delete", v)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
              <span>Sincronización de Identidad: Activa</span>
              <span className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-primary/40" /> Cifrado de Permisos AES-256
              </span>
            </div>
          </Card>

          <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Protocolo de Seguridad Crítica</span>
             </div>
             <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase italic">
               Cualquier cambio en esta matriz afectará de forma inmediata al acceso de todos los usuarios vinculados a este rol. Asegúrese de no revocar permisos críticos para la operativa diaria del club.
             </p>
          </div>

          <Card className="glass-panel border border-primary/20 bg-black/30 overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-xl font-black text-white italic tracking-tighter uppercase">
                Staff_Access_Matrix: {ROLES_TO_MANAGE.find((r) => r.id === selectedRole)?.label}
              </CardTitle>
              <CardDescription className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Define qué perfiles puede ver y crear este rol en el módulo Staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Puede ver perfiles</p>
                {ROLES_TO_MANAGE.map((target) => (
                  <label key={`view-${target.id}`} className="flex items-center gap-3 text-sm text-white/80">
                    <Checkbox
                      checked={selectedRule.viewRoles.includes(target.id)}
                      onCheckedChange={(v) => toggleStaffRole("viewRoles", target.id, Boolean(v))}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">{target.label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Puede crear perfiles</p>
                {ROLES_TO_MANAGE.map((target) => (
                  <label key={`create-${target.id}`} className="flex items-center gap-3 text-sm text-white/80">
                    <Checkbox
                      checked={selectedRule.createRoles.includes(target.id)}
                      onCheckedChange={(v) => toggleStaffRole("createRoles", target.id, Boolean(v))}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">{target.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function PermissionToggle({
  label,
  icon: Icon,
  checked,
  onCheckedChange,
  critical,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 p-4 border transition-[background-color,border-color,color,opacity,transform] cursor-pointer rounded-2xl group/toggle",
        checked
          ? critical
            ? "bg-rose-500/10 border-rose-500/30"
            : "bg-primary/5 border-primary/30"
          : "bg-white/5 border-white/5 hover:border-white/10"
      )}
      role="button"
      tabIndex={0}
      onClick={() => onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center border transition-[background-color,border-color,color,opacity,transform]",
          checked
            ? critical
              ? "bg-rose-500/20 border-rose-500/40"
              : "bg-primary/20 border-primary/40"
            : "bg-black border-white/5 group-hover/toggle:border-white/20"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            checked
              ? critical
                ? "text-rose-400"
                : "text-primary"
              : "text-white/10 group-hover/toggle:text-white/30"
          )}
        />
      </div>
      <span
        className={cn(
          "text-[9px] font-black uppercase tracking-widest",
          checked ? "text-white" : "text-white/20"
        )}
      >
        {label}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "scale-75",
          checked && !critical ? "data-[state=checked]:bg-primary" : "",
          checked && critical ? "data-[state=checked]:bg-rose-500" : ""
        )}
      />
    </div>
  );
}
