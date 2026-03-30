
"use client";

import { useState, useEffect, useMemo, useCallback, type ComponentType } from "react";
import {
  Database,
  Search,
  Globe,
  Activity,
  Cpu,
  ShieldCheck,
  Download,
  Eye,
  BarChart3,
  RefreshCw,
  Loader2,
  FileJson,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  mapRemoteToUnified,
  readPromoVaultExercises,
  readMethodologyNeural,
  readTrainingNeural,
  sanitizeRemoteNeuralRows,
  isUnifiedNeuralExercise,
  type UnifiedNeuralExercise,
  type NeuralOrigin,
  type RemoteNeuralRow,
} from "@/lib/neural-warehouse";

/** Si ves "v5" en pantalla, el bundle nuevo está cargado (no el JS cacheado). */
const NEURAL_UI_MARK = "v5";

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** Evita crash si el payload no es serializable (referencias circulares, BigInt). */
function safeJsonStringify(value: unknown): string {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_key, v) => {
        if (typeof v === "bigint") return v.toString();
        if (typeof v === "object" && v !== null) {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2,
    );
  } catch {
    return String(value);
  }
}

const ORIGIN_LABEL: Record<NeuralOrigin, string> = {
  supabase: "Red (Supabase)",
  sandbox_promo: "Sandbox promo",
  methodology_local: "Metodología (local)",
  training_studio: "Training / élite",
};

function originBadgeClass(o: string): string {
  switch (o) {
    case "supabase":
      return "border-emerald-500/40 text-emerald-400 bg-emerald-500/10";
    case "sandbox_promo":
      return "border-violet-500/40 text-violet-300 bg-violet-500/10";
    case "methodology_local":
      return "border-amber-500/40 text-amber-400 bg-amber-500/10";
    case "training_studio":
      return "border-sky-500/40 text-sky-300 bg-sky-500/10";
    default:
      return "border-white/20 text-white/60";
  }
}

export default function GlobalExercisesWarehouse() {
  const { session } = useAuth();
  const [remote, setRemote] = useState<RemoteNeuralRow[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [localTick, setLocalTick] = useState(0);
  const [search, setSearch] = useState("");
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [preview, setPreview] = useState<UnifiedNeuralExercise | null>(null);
  const [includeLocalCache, setIncludeLocalCache] = useState(false);
  /** Evita leer localStorage en el primer render = mismo HTML servidor/cliente (sin error de hidratación). */
  const [vaultReady, setVaultReady] = useState(false);

  const bumpLocal = useCallback(() => {
    setLocalTick((t) => t + 1);
  }, []);

  const loadRemote = useCallback(async () => {
    if (!session?.access_token) {
      setRemote([]);
      setRemoteError("Inicia sesión como superadmin para cargar la red central.");
      setRemoteLoading(false);
      setOffline(false);
      return;
    }
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const res = await fetch("/api/admin/neural-warehouse", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const text = await res.text();
      let j: {
        ok?: boolean;
        offline?: boolean;
        error?: string;
        remote?: RemoteNeuralRow[];
      } = {};
      try {
        j = text ? (JSON.parse(text) as typeof j) : {};
      } catch {
        setRemote([]);
        setRemoteError("Respuesta inválida del servidor (no es JSON).");
        return;
      }
      if (res.status === 501 && j.offline) {
        setRemote([]);
        setOffline(true);
        setRemoteError(j.error ?? "Configura SUPABASE_SERVICE_ROLE_KEY en el servidor.");
        return;
      }
      if (!res.ok) {
        setRemote([]);
        setOffline(false);
        setRemoteError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      setRemote(sanitizeRemoteNeuralRows(j.remote));
      setOffline(false);
      setRemoteError(null);
    } catch (e) {
      setRemote([]);
      setRemoteError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setRemoteLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadRemote();
  }, [loadRemote]);

  useEffect(() => {
    if (offline || !!remoteError) setIncludeLocalCache(true);
  }, [offline, remoteError]);

  useEffect(() => {
    setVaultReady(true);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      const k = e.key;
      if (
        k != null &&
        (k === "synq_promo_vault" ||
          k === "synq_methodology_neural" ||
          k === "synq_training_neural")
      ) {
        bumpLocal();
      }
    };
    window.addEventListener("storage", onStorage);
    const onVis = () => {
      if (document.visibilityState === "visible") bumpLocal();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [bumpLocal]);

  const merged = useMemo((): UnifiedNeuralExercise[] => {
    try {
      const fromRemote = remote
        .map(mapRemoteToUnified)
        .filter((row): row is UnifiedNeuralExercise => row != null && Boolean(row.key));
      const local = includeLocalCache && vaultReady
        ? [
            ...readPromoVaultExercises(),
            ...readMethodologyNeural(),
            ...readTrainingNeural(),
          ].filter(isUnifiedNeuralExercise)
        : [];
      const all = [...fromRemote, ...local].filter(isUnifiedNeuralExercise);
      all.sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
      return all;
    } catch {
      return [];
    }
  }, [remote, localTick, vaultReady, includeLocalCache]);

  const filtered = useMemo((): UnifiedNeuralExercise[] => {
    const q = search.trim().toLowerCase();
    const out: UnifiedNeuralExercise[] = [];
    for (const row of merged) {
      if (!isUnifiedNeuralExercise(row)) continue;
      if (originFilter !== "all" && row.origin !== originFilter) continue;
      if (!q) {
        out.push(row);
        continue;
      }
      const hay = [
        row.title,
        row.subtitle,
        row.clubLabel,
        row.country,
        row.sport,
        row.stage,
        row.dimension,
        row.block,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (hay.includes(q)) out.push(row);
    }
    return out;
  }, [merged, search, originFilter]);

  const tableRows = useMemo(
    () => filtered.filter((r): r is UnifiedNeuralExercise => isUnifiedNeuralExercise(r)),
    [filtered],
  );

  const stats = useMemo(() => {
    const remoteN = merged.filter(
      (r) => isUnifiedNeuralExercise(r) && r.origin === "supabase",
    ).length;
    const localN = merged.length - remoteN;
    const bytes = merged.reduce(
      (s, r) => s + (isUnifiedNeuralExercise(r) ? r.bytesApprox : 0),
      0,
    );
    return {
      total: merged.length,
      remoteN,
      localN,
      bytes,
    };
  }, [merged]);

  const exportJsonl = () => {
    const lines = filtered.filter(isUnifiedNeuralExercise).map((r) =>
      JSON.stringify({
        key: r.key,
        origin: r.origin,
        title: r.title,
        club: r.clubLabel,
        country: r.country,
        stage: r.stage,
        dimension: r.dimension,
        payload: r.payload,
      }),
    );
    const blob = new Blob([lines.join("\n")], { type: "application/x-ndjson" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `synq-neural-warehouse-${new Date().toISOString().slice(0, 10)}.jsonl`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(filtered.filter(isUnifiedNeuralExercise), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `synq-neural-warehouse-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.5em] uppercase">
              Neural_Data_Warehouse
            </span>
          </div>
          <h1 className="text-4xl font-headline font-black text-white uppercase tracking-tighter italic emerald-text-glow">
            ALMACÉN_NEURAL
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest max-w-xl">
            Corpus para entrenamiento IA: por defecto solo red (Supabase). La caché local del navegador
            (sandbox promo, metodología, pizarra training) se activa manualmente para diagnóstico.{" "}
            <span className="text-emerald-500/50">[{NEURAL_UI_MARK}]</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIncludeLocalCache((v) => !v)}
            className={cn(
              "rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-4",
              includeLocalCache
                ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                : "border-white/10 text-white/60",
            )}
          >
            <Cpu className="h-4 w-4 mr-2" />
            Cache local {includeLocalCache ? "ON" : "OFF"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              bumpLocal();
              void loadRemote();
            }}
            className="rounded-2xl border-white/10 font-black uppercase text-[10px] tracking-widest h-12"
          >
            {remoteLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button
            type="button"
            onClick={exportJsonl}
            className="rounded-2xl bg-emerald-500 text-black font-black uppercase text-[10px] tracking-widest h-12 px-6 shadow-[0_0_20px_rgba(16,185,129,0.3)] border-none"
          >
            <Download className="h-4 w-4 mr-2" /> JSONL (Gemini)
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={exportJson}
            className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-4 bg-white/10 text-white border border-white/10"
          >
            <FileJson className="h-4 w-4 mr-2" /> JSON
          </Button>
        </div>
      </div>

      {remoteError && (
        <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest">
          {offline ? "Modo parcial: " : ""}
          {remoteError}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricMini label="Ítems totales" value={formatNum(stats.total)} icon={Database} />
        <MetricMini label="En red (Supabase)" value={formatNum(stats.remoteN)} icon={Globe} highlight />
        <MetricMini label="Vault local (navegador)" value={formatNum(stats.localN)} icon={Cpu} />
        <MetricMini label="Peso corpus (aprox.)" value={formatBytes(stats.bytes)} icon={ShieldCheck} />
      </div>

      <Card className="glass-panel border-emerald-500/20 bg-black/40 overflow-hidden shadow-2xl rounded-3xl">
        <CardHeader className="p-8 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-4 h-4 w-4 text-emerald-500 opacity-50" />
            <Input
              placeholder="FILTRAR POR TÍTULO, CLUB, PAÍS, ETAPA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-white/5 border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase text-[10px] tracking-widest"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="sr-only" htmlFor="neural-origin-filter">
              Origen de datos
            </label>
            <select
              id="neural-origin-filter"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="h-12 w-[220px] rounded-2xl border border-emerald-500/30 bg-slate-950/90 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/40 transition-colors"
            >
              <option className="bg-slate-950 text-emerald-300" value="all">Todos los orígenes</option>
              <option className="bg-slate-950 text-emerald-300" value="supabase">Red (Supabase)</option>
              <option className="bg-slate-950 text-emerald-300" value="sandbox_promo">Sandbox promo</option>
              <option className="bg-slate-950 text-emerald-300" value="methodology_local">Metodología (local)</option>
              <option className="bg-slate-950 text-emerald-300" value="training_studio">Training / élite</option>
            </select>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-emerald-400/40 uppercase tracking-widest">
                Mostrando
              </span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
                {tableRows.length} / {merged.length}
              </span>
            </div>
            <BarChart3 className="h-6 w-6 text-emerald-400/40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.02]">
              <TableRow className="border-white/5">
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40">
                  Título / Origen
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40">
                  Club / País
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-center">
                  Etapa / Dim.
                </TableHead>
                <TableHead className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-center">
                  Peso
                </TableHead>
                <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/40 text-right">
                  Vista
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
                    {remoteLoading
                      ? "Cargando red central…"
                      : "Sin resultados. Guarda ejercicios en sandbox, metodología o training, o sincroniza a Supabase."}
                  </TableCell>
                </TableRow>
              )}
              {tableRows.map((ex, rowIdx) => (
                <TableRow
                  key={`neural-${String(ex.key)}-${rowIdx}`}
                  className="border-white/5 hover:bg-emerald-500/[0.03] transition-colors group"
                >
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-[background-color,border-color,color,opacity,transform]">
                        <Activity className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs italic group-hover:emerald-text-glow transition-[background-color,border-color,color,opacity,transform]">
                          {ex.title}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-lg text-[8px] font-black px-2",
                              originBadgeClass(ex.origin),
                            )}
                          >
                            {ORIGIN_LABEL[ex.origin as NeuralOrigin] ?? ex.origin}
                          </Badge>
                          {ex.subtitle && (
                            <span className="text-[8px] text-emerald-400/50 font-bold uppercase tracking-widest">
                              {ex.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white/80 uppercase">
                        {ex.clubLabel ?? "—"}
                      </span>
                      <span className="text-[9px] font-bold text-white/30 uppercase">
                        {ex.country ?? ex.sport ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <Badge
                        variant="outline"
                        className="w-fit rounded-lg border-emerald-500/20 text-emerald-400 text-[8px] font-black px-2"
                      >
                        {ex.stage ?? "—"}
                      </Badge>
                      <span className="text-[9px] font-bold text-white/30 uppercase">
                        {ex.dimension ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs font-bold text-white/60">
                    {formatBytes(ex.bytesApprox)}
                  </TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 border border-white/5 rounded-xl text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setPreview(ex)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {preview && isUnifiedNeuralExercise(preview) ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="neural-preview-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-emerald-500/20 bg-zinc-950 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2
                  id="neural-preview-title"
                  className="text-lg font-black uppercase italic tracking-tight text-emerald-400"
                >
                  {preview.title}
                </h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {ORIGIN_LABEL[preview.origin as NeuralOrigin] ?? preview.origin} · {preview.key}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-xl border border-white/10 text-white hover:bg-white/10"
                onClick={() => setPreview(null)}
                aria-label="Cerrar vista previa"
              >
                ×
              </Button>
            </div>
            <pre className="flex-1 overflow-auto p-5 text-[10px] font-mono whitespace-pre-wrap break-words text-emerald-200/90">
              {safeJsonStringify(preview.payload)}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MetricMini({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Card className="glass-panel p-5 border-emerald-500/20 bg-black/20 rounded-3xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-[background-color,border-color,color,opacity,transform]">
        <Icon className="h-12 w-12 text-emerald-500" />
      </div>
      <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest italic mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-black italic tracking-tighter",
          highlight ? "text-emerald-400 emerald-text-glow" : "text-white",
        )}
      >
        {value}
      </p>
    </Card>
  );
}
