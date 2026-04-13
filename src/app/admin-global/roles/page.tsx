
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Fingerprint,
  Plus,
  Shield,
  Search,
  Activity,
  Info,
  Lock,
  Loader2,
  RefreshCw,
  Users,
  ExternalLink,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { ROLE_CATALOG, type RoleCatalogEntry } from "@/lib/role-catalog";
import type { Database } from "@/lib/supabase";

type SynqRoleRow = Database["public"]["Tables"]["synq_roles"]["Row"];

export default function GlobalRolesPage() {
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [refDialogOpen, setRefDialogOpen] = useState(false);
  const [refRole, setRefRole] = useState<RoleCatalogEntry | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [profilesTotal, setProfilesTotal] = useState<number | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryOffline, setSummaryOffline] = useState(false);
  const [synqAdminRows, setSynqAdminRows] = useState<SynqRoleRow[]>([]);
  const [synqAdminLoading, setSynqAdminLoading] = useState(false);
  const [synqAdminError, setSynqAdminError] = useState<string | null>(null);
  const [newCustomKey, setNewCustomKey] = useState("");
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [synqSaving, setSynqSaving] = useState(false);
  const { toast } = useToast();

  const loadSummary = useCallback(async () => {
    if (!session?.access_token) {
      setSummaryLoading(false);
      setSummaryError("Inicia sesión como superadmin.");
      return;
    }
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/admin/roles-summary", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const text = await res.text();
      let j: {
        ok?: boolean;
        offline?: boolean;
        error?: string;
        counts?: Record<string, number>;
        total?: number;
      } = {};
      try {
        j = text ? (JSON.parse(text) as typeof j) : {};
      } catch {
        setSummaryError("Respuesta inválida del servidor.");
        return;
      }
      if (res.status === 501 && j.offline) {
        setSummaryOffline(true);
        setSummaryError(j.error ?? "Sin service role en servidor.");
        setCounts({});
        setProfilesTotal(null);
        return;
      }
      if (!res.ok) {
        setSummaryError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      setSummaryOffline(false);
      setCounts(j.counts ?? {});
      setProfilesTotal(typeof j.total === "number" ? j.total : null);
    } catch (e) {
      setSummaryError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setSummaryLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const loadSynqAdmin = useCallback(async () => {
    if (!session?.access_token) {
      setSynqAdminRows([]);
      return;
    }
    setSynqAdminLoading(true);
    setSynqAdminError(null);
    try {
      const res = await fetch("/api/admin/synq-roles", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const text = await res.text();
      let j: { roles?: SynqRoleRow[]; error?: string; offline?: boolean } = {};
      try {
        j = text ? (JSON.parse(text) as typeof j) : {};
      } catch {
        setSynqAdminError("Respuesta inválida del servidor.");
        setSynqAdminRows([]);
        return;
      }
      if (!res.ok) {
        setSynqAdminError(j.error ?? `HTTP ${res.status}`);
        setSynqAdminRows([]);
        return;
      }
      setSynqAdminRows(j.roles ?? []);
    } catch (e) {
      setSynqAdminError(e instanceof Error ? e.message : "Error de red");
      setSynqAdminRows([]);
    } finally {
      setSynqAdminLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadSynqAdmin();
  }, [loadSynqAdmin]);

  const openRefDialog = (role: RoleCatalogEntry | null = null) => {
    setRefRole(role);
    setRefDialogOpen(true);
  };

  const rows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ROLE_CATALOG.filter(
      (r) =>
        !q ||
        r.label.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    );
  }, [searchTerm]);

  const systemRoleCount = ROLE_CATALOG.filter((r) => r.systemLocked).length;

  const customSynqRoles = useMemo(
    () => synqAdminRows.filter((r) => !r.is_system),
    [synqAdminRows],
  );

  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    const key = newCustomKey.trim().toLowerCase();
    const label = newCustomLabel.trim();
    if (!key || !label) {
      toast({ variant: "destructive", title: "DATOS_INCOMPLETOS", description: "Clave y etiqueta son obligatorias." });
      return;
    }
    setSynqSaving(true);
    try {
      const res = await fetch("/api/admin/synq-roles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, label }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast({ variant: "destructive", title: "ERROR", description: j.error ?? `HTTP ${res.status}` });
        return;
      }
      toast({ title: "ROL_CREADO", description: `Clave ${key} registrada en synq_roles.` });
      setNewCustomKey("");
      setNewCustomLabel("");
      await loadSynqAdmin();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "ERROR",
        description: err instanceof Error ? err.message : "Error de red",
      });
    } finally {
      setSynqSaving(false);
    }
  };

  const handleDeleteCustomRole = async (key: string) => {
    if (!session?.access_token) return;
    setSynqSaving(true);
    try {
      const res = await fetch(`/api/admin/synq-roles/${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast({ variant: "destructive", title: "NO_SE_PUDO_BORRAR", description: j.error ?? `HTTP ${res.status}` });
        return;
      }
      toast({ title: "ROL_ELIMINADO", description: key });
      await loadSynqAdmin();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "ERROR",
        description: err instanceof Error ? err.message : "Error de red",
      });
    } finally {
      setSynqSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <Card className="glass-panel border-emerald-500/25 bg-emerald-500/[0.04] rounded-3xl">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start">
          <Info className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="space-y-2 text-[11px] font-bold uppercase tracking-widest text-white/70 leading-relaxed">
            <p>
              Los roles efectivos viven en <span className="text-emerald-400">profiles.role</span> (Supabase).
              Para <span className="text-white">cambiar el rol de una persona</span>, usa{" "}
              <Link
                href="/admin-global/users"
                className="text-emerald-400 underline-offset-2 hover:underline inline-flex items-center gap-1"
              >
                Usuarios global <ExternalLink className="h-3 w-3" />
              </Link>
              .
            </p>
            <p className="text-white/45 normal-case font-semibold tracking-normal">
              Catálogo persistente: tabla <span className="text-emerald-400/90">synq_roles</span> (migración + seed) y
              API <span className="text-white/70">/api/admin/synq-roles</span>. La matriz lateral sigue siendo solo
              documentación de módulos.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-panel border-primary/25 bg-primary/[0.05] rounded-3xl">
        <CardContent className="p-6 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            FLUJO_CORRECTO_DE_ROLES
          </p>
          <div className="grid gap-2 text-[10px] font-bold uppercase tracking-widest text-white/65">
            <p>
              1) Crear/editar catálogo en <span className="text-primary">Roles</span> (tabla{" "}
              <span className="text-emerald-300">synq_roles</span>).
            </p>
            <p>
              2) Asignar rol efectivo en <span className="text-primary">Usuarios</span> (campo{" "}
              <span className="text-emerald-300">profiles.role</span>).
            </p>
            <p>
              3) Validar acceso en menú/rutas según matriz y guardias de módulo.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6 border-b border-white/5 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Home</p>
          <div className="mb-1 flex items-center gap-3">
            <Fingerprint className="h-5 w-5 animate-pulse text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400">
              Auth_Protocol_Matrix
            </span>
          </div>
          <h1 className="font-headline text-4xl font-black uppercase italic tracking-tighter text-white emerald-text-glow">
            Dashboard_Roles
          </h1>
          <p className="max-w-xl text-[10px] font-bold uppercase tracking-widest text-white/35">
            Catálogo sincronizado con el esquema Synq · conteos desde red en vivo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadSummary()}
            className="h-12 rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest"
          >
            {summaryLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refrescar conteos
          </Button>
          <Button
            type="button"
            onClick={() => openRefDialog(null)}
            className="h-14 rounded-2xl border-none bg-emerald-500 px-10 font-black uppercase text-[10px] tracking-widest text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-[background-color,border-color,color,opacity,transform]"
          >
            <BookOpen className="mr-2 h-5 w-5" /> Guía de referencia
          </Button>
        </div>
      </div>

      {summaryError && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
          {summaryOffline ? "Modo sin service key: " : ""}
          {summaryError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <Card className="glass-panel relative overflow-hidden rounded-[2.5rem] border-none bg-slate-950/80 shadow-2xl">
          <CardHeader className="p-8 pb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-4 h-5 w-5 text-emerald-500 opacity-50" />
              <Input
                placeholder="FILTRAR POR ROL O DESCRIPCIÓN..."
                className="h-14 rounded-2xl border-emerald-500/20 bg-white/[0.03] pl-12 font-bold uppercase text-[11px] tracking-widest text-white focus:ring-emerald-500/30 transition-[background-color,border-color,color,opacity,transform]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="h-16 pl-10 text-[11px] font-black uppercase italic tracking-[0.2em] text-white/40">
                    Rol
                  </TableHead>
                  <TableHead className="text-center text-[11px] font-black uppercase italic tracking-[0.2em] text-white/40">
                    Perfiles
                  </TableHead>
                  <TableHead className="text-center text-[11px] font-black uppercase italic tracking-[0.2em] text-white/40">
                    Tipo
                  </TableHead>
                  <TableHead className="pr-10 text-right text-[11px] font-black uppercase italic tracking-[0.2em] text-white/40">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((role) => {
                  const n = counts[role.id] ?? 0;
                  return (
                    <TableRow
                      key={role.id}
                      className="border-white/5 transition-[background-color,border-color,color,opacity,transform] hover:bg-white/[0.03] group"
                    >
                      <TableCell className="py-6 pl-10">
                        <div className="flex items-center gap-5">
                          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10 transition-[background-color,border-color,color,opacity,transform] group-hover:scale-110 group-hover:bg-emerald-500/20">
                            <Fingerprint className="relative z-10 h-5 w-5 text-emerald-400" />
                            <div className="absolute inset-0 bg-emerald-500/5 scan-line" />
                          </div>
                          <div>
                            <p className="font-headline text-sm font-black uppercase italic tracking-tighter text-white transition-[background-color,border-color,color,opacity,transform] group-hover:emerald-text-glow">
                              {role.label}
                            </p>
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                              ID: {role.id}
                            </p>
                            <p className="mt-1 max-w-md text-[9px] font-semibold normal-case text-white/40 tracking-normal">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Activity className="h-3 w-3 text-emerald-500/30" />
                          <span className="font-mono text-base font-bold text-white/80">
                            {summaryLoading ? "…" : n}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full px-4 py-1.5 font-black text-[9px] uppercase tracking-widest",
                            role.systemLocked
                              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-400"
                              : "border-white/10 bg-white/5 text-white/50",
                          )}
                        >
                          {role.systemLocked ? "Sistema" : "Estándar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-10 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl border border-white/5 text-white/20 transition-[background-color,border-color,color,opacity,transform] hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                            onClick={() => openRefDialog(role)}
                            title="Referencia de rol (enlaces)"
                          >
                            <BookOpen className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-xl border border-white/10 font-black uppercase text-[9px] tracking-widest text-white/50 hover:text-emerald-400"
                            asChild
                          >
                            <Link href="/admin-global/users">Usuarios</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel group overflow-hidden rounded-[2rem] border-emerald-500/20 bg-emerald-500/[0.03]">
            <CardHeader className="p-8">
              <CardTitle className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
                <Shield className="h-4 w-4 animate-pulse" /> Resumen de red
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              <div className="space-y-2 rounded-2xl border border-white/5 bg-black/60 p-6 transition-[background-color,border-color,color,opacity,transform] group-hover:border-emerald-500/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Perfiles en base
                </p>
                <div className="flex items-end gap-3">
                  <p className="font-headline text-4xl font-black italic tracking-tighter text-white">
                    {summaryLoading ? "…" : profilesTotal ?? "—"}
                  </p>
                  <span className="mb-1 text-[10px] font-bold uppercase italic tracking-widest text-emerald-400">
                    TOTAL
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/5 bg-black/60 p-6 transition-[background-color,border-color,color,opacity,transform] group-hover:border-emerald-500/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Roles de sistema (bloqueados)
                </p>
                <div className="flex items-end gap-3">
                  <p className="font-headline text-4xl font-black italic tracking-tighter text-emerald-400">
                    {String(systemRoleCount).padStart(2, "0")}
                  </p>
                  <span className="mb-1 text-[10px] font-bold uppercase italic tracking-widest text-white/30">
                    CATÁLOGO
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/5 bg-black/60 p-6 transition-[background-color,border-color,color,opacity,transform] group-hover:border-emerald-500/30">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Roles listados
                </p>
                <div className="flex items-end gap-3">
                  <p className="font-headline text-4xl font-black italic tracking-tighter text-white">
                    {rows.length}
                  </p>
                  <span className="mb-1 text-[10px] font-bold uppercase italic tracking-widest text-white/30">
                    FILA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="group relative space-y-4 overflow-hidden rounded-[2.5rem] border border-white/5 bg-black/40 p-8">
            <div className="absolute right-0 top-0 p-4 opacity-5 transition-[background-color,border-color,color,opacity,transform] group-hover:opacity-20">
              <Lock className="h-20 w-20 text-emerald-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">
                Operativa_Matrix
              </span>
            </div>
            <p className="text-[10px] font-bold uppercase italic leading-relaxed tracking-wider text-white/40">
              El middleware y el layout admin-global limitan el núcleo a superadmin. RLS en Supabase restringe
              profiles, clubs, exercises, athletes y matches por club y rol (ver migración synq_roles / RLS).
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl border-emerald-500/30 font-black uppercase text-[10px] tracking-widest"
              asChild
            >
              <Link href="/admin-global/users" className="gap-2">
                <Users className="h-4 w-4" />
                Ir a usuarios
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="glass-panel overflow-hidden rounded-[2rem] border border-emerald-500/20 bg-black/40 shadow-2xl">
        <CardHeader className="flex flex-col gap-2 border-b border-white/5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">
            Roles custom (synq_roles)
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={synqAdminLoading}
            onClick={() => void loadSynqAdmin()}
            className="rounded-2xl font-black uppercase text-[10px] tracking-widest"
          >
            {synqAdminLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sincronizar BD
          </Button>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {synqAdminError && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90">{synqAdminError}</p>
          )}
          <form onSubmit={handleCreateCustomRole} className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                  Clave (snake_case)
                </label>
                <Input
                  value={newCustomKey}
                  onChange={(e) => setNewCustomKey(e.target.value)}
                  placeholder="ej: scout_regional"
                  className="h-12 rounded-2xl border-emerald-500/20 bg-white/5 font-mono text-xs text-emerald-200"
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-emerald-400/60">
                  Etiqueta
                </label>
                <Input
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  placeholder="Nombre visible"
                  className="h-12 rounded-2xl border-emerald-500/20 bg-white/5 text-xs font-bold uppercase text-white"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={synqSaving || synqAdminLoading}
              className="h-12 rounded-2xl bg-emerald-500 font-black uppercase text-[10px] tracking-widest text-black"
            >
              {synqSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Alta rol
            </Button>
          </form>

          <div className="rounded-2xl border border-white/5">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="pl-6 text-[10px] font-black uppercase text-white/40">Clave</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-white/40">Etiqueta</TableHead>
                  <TableHead className="pr-6 text-right text-[10px] font-black uppercase text-white/40">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customSynqRoles.length === 0 ? (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={3} className="py-8 text-center text-[10px] font-bold uppercase text-white/35">
                      {synqAdminLoading ? "Cargando…" : "Sin roles custom (o ejecuta la migración synq_roles)."}
                    </TableCell>
                  </TableRow>
                ) : (
                  customSynqRoles.map((r) => (
                    <TableRow key={r.key} className="border-white/5">
                      <TableCell className="pl-6 font-mono text-xs text-emerald-300/90">{r.key}</TableCell>
                      <TableCell className="text-sm font-bold text-white/80">{r.label}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={synqSaving}
                          className="h-9 w-9 rounded-xl border border-white/10 text-rose-400/70 hover:bg-rose-500/10 hover:text-rose-400"
                          onClick={() => void handleDeleteCustomRole(r.key)}
                          title="Eliminar rol custom"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={refDialogOpen} onOpenChange={setRefDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-emerald-500/25 bg-[#04070c] text-white shadow-[0_0_50px_rgba(0,0,0,0.85)]">
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="font-headline text-xl font-black uppercase italic tracking-tight text-white">
              {refRole ? `Referencia · ${refRole.label}` : "Guía de referencia de roles"}
            </DialogTitle>
            <DialogDescription className="text-left text-[11px] font-semibold normal-case tracking-normal text-white/65 leading-relaxed">
              Esta vista no persiste permisos. El rol efectivo está en{" "}
              <span className="text-emerald-400">profiles.role</span>; la matriz operativa por club se edita en Cuadro
              Matriz Club. Inventario CTO: archivo{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-emerald-200/90">docs/ADMIN_GLOBAL_SECTIONS.md</code>.
            </DialogDescription>
          </DialogHeader>
          {refRole && (
            <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-[10px] text-white/55">
              <p className="font-black uppercase tracking-widest text-emerald-400/80">ID</p>
              <p className="mt-1 font-mono text-emerald-200/90">{refRole.id}</p>
              <p className="mt-3 font-black uppercase tracking-widest text-emerald-400/80">Descripción</p>
              <p className="mt-1 normal-case font-semibold leading-relaxed">{refRole.description}</p>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              className="h-12 w-full rounded-2xl bg-emerald-500 font-black uppercase text-[10px] tracking-widest text-black"
              asChild
            >
              <Link href="/admin-global/users" className="gap-2">
                <Users className="h-4 w-4" />
                Asignar rol en usuarios
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-2xl border-emerald-500/35 font-black uppercase text-[10px] tracking-widest text-emerald-200"
              asChild
            >
              <Link href="/admin-global/club-access-matrix" className="gap-2">
                <Shield className="h-4 w-4" />
                Cuadro matriz club
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-2xl font-black uppercase text-[9px] tracking-widest text-white/50 hover:text-white"
              onClick={() => setRefDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
