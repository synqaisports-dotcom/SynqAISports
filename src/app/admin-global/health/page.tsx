"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Database,
  Fingerprint,
  KeyRound,
  Loader2,
  Network,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

type HealthJson = {
  ok?: boolean;
  error?: string;
  status?: number;
  checks?: Array<{
    id: string;
    label: string;
    ok: boolean;
    severity?: "info" | "warn" | "crit";
    detail?: string;
    hint?: string;
  }>;
};

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-2xl font-black text-[9px] uppercase tracking-widest px-3 py-1 italic",
        ok ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20",
      )}
    >
      {label}
    </Badge>
  );
}

function CheckRow(props: { icon: any; title: string; ok: boolean; detail?: string; hint?: string; severity?: "info" | "warn" | "crit" }) {
  const Icon = props.icon;
  const tone =
    props.ok ? "text-emerald-400" : props.severity === "crit" ? "text-rose-400" : props.severity === "warn" ? "text-amber-400" : "text-white/50";
  const border =
    props.ok ? "border-emerald-500/20 bg-emerald-500/5" : props.severity === "crit" ? "border-rose-500/20 bg-rose-500/5" : "border-white/10 bg-white/[0.03]";

  return (
    <div className={cn("rounded-3xl border p-5 flex items-start gap-4", border)}>
      <div className={cn("h-10 w-10 rounded-2xl border border-white/10 bg-black/30 flex items-center justify-center shrink-0", props.ok ? "border-emerald-500/30" : "border-white/10")}>
        <Icon className={cn("h-5 w-5", tone)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className={cn("text-[10px] font-black uppercase tracking-[0.35em] italic", tone)}>{props.title}</p>
          <StatusPill ok={props.ok} label={props.ok ? "OK" : "FAIL"} />
        </div>
        {props.detail ? <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/60 break-words">{props.detail}</p> : null}
        {props.hint ? <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-primary/70 break-words">{props.hint}</p> : null}
      </div>
    </div>
  );
}

export default function AdminGlobalHealthPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [json, setJson] = useState<HealthJson | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!session?.access_token) {
        setJson({ ok: false, checks: [{ id: "no_session", label: "Sesión", ok: false, severity: "crit", detail: "No hay access_token.", hint: "Inicia sesión con un superadmin." }] });
        return;
      }
      const res = await fetch("/api/admin/health", { headers: { Authorization: `Bearer ${session.access_token}` } });
      const j = (await res.json().catch(() => ({}))) as HealthJson & { error?: string };
      if (!res.ok) {
        // Mostramos error pero seguimos pintando checks si vienen (fail-soft UX).
        setError(j?.error ?? `HTTP ${res.status}`);
      }
      // Si por cualquier motivo la API no trae checks, generamos un check único
      // para evitar el estado infinito de "Cargando checks…".
      if (!Array.isArray(j.checks) || j.checks.length === 0) {
        setJson({
          ok: false,
          error: j.error ?? undefined,
          status: (j as any).status ?? res.status,
          checks: [
            {
              id: "health_payload_invalid",
              label: "Payload Health",
              ok: false,
              severity: "crit",
              detail: "La API no devolvió `checks[]`.",
              hint: "Revisa /api/admin/health en servidor (deploy/env).",
            },
          ],
        });
        return;
      }
      setJson(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void load();
  }, [load]);

  const checks = json?.checks ?? [];
  const allOk = checks.length > 0 && checks.every((c) => c.ok);
  const failing = checks.filter((c) => !c.ok);

  const iconFor = useMemo(() => {
    const map = new Map<string, any>([
      ["superadmin_gate", ShieldAlert],
      ["service_role_key", KeyRound],
      ["supabase_public_env", Network],
      ["synq_roles_read", Fingerprint],
      ["clubs_read", Database],
      ["profiles_read", Cpu],
    ]);
    return (id: string) => map.get(id) ?? ClipboardList;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-emerald-400/50">Admin-global</p>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase italic">System_Health</span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter emerald-text-glow">
            Diagnóstico de Producción
          </h1>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">
            Si algo no carga en `admin-global`, aquí verás la causa exacta (rol, sesión, RLS, migraciones o variables).
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-8 shadow-[0_0_20px_rgba(16,185,129,0.25)] border-none"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Re-ejecutar"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-emerald-500/20 text-emerald-300 font-black uppercase text-[10px] tracking-widest h-12 px-6 bg-black/30"
          >
            <Link href="/admin-global">Volver</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="glass-panel border-rose-500/20 bg-rose-500/5 rounded-3xl">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-rose-300">ERROR_HTTP</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/70 break-words">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel border-emerald-500/20 bg-black/30 rounded-3xl lg:col-span-1">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400">
              Estado General
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Checks</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">{checks.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Fallos</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", failing.length ? "text-rose-400" : "text-emerald-400")}>
                {failing.length}
              </span>
            </div>
            <div className="pt-2">
              <div className="flex items-center gap-3">
                {allOk ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <ShieldAlert className="h-5 w-5 text-rose-400" />}
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                  {allOk ? "READY" : "NEEDS_ATTENTION"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-emerald-500/20 bg-black/30 rounded-3xl lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-400">
              Acciones rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild className="h-14 rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest border-none">
              <Link href="/admin-global/clubs">Gestionar Clubs</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-black uppercase text-[10px] tracking-widest">
              <Link href="/admin-global/users">Gestionar Usuarios</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-black uppercase text-[10px] tracking-widest">
              <Link href="/admin-global/roles">Catálogo Roles</Link>
            </Button>
            <Button asChild className="h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-black uppercase text-[10px] tracking-widest">
              <Link href="/admin-global/plans">Planes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {checks.length === 0 ? (
          <Card className="glass-panel border-white/10 bg-white/[0.03] rounded-3xl">
            <CardContent className="p-6 flex items-center gap-3">
              <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Cargando checks…</span>
            </CardContent>
          </Card>
        ) : (
          checks.map((c) => (
            <CheckRow
              key={c.id}
              icon={iconFor(c.id)}
              title={c.label}
              ok={!!c.ok}
              severity={c.severity}
              detail={c.detail}
              hint={c.hint}
            />
          ))
        )}
      </div>
    </div>
  );
}

