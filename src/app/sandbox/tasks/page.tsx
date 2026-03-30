"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type VaultExercise = {
  id: number;
  block?: string;
  fieldType?: string;
  elements?: unknown[];
  metadata?: { title?: string; objective?: string; dimension?: string; stage?: string };
  savedAt?: string;
};

function safeJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function SandboxTasksPage() {
  const [query, setQuery] = useState("");
  const [vault, setVault] = useState<{ exercises: VaultExercise[] }>({ exercises: [] });

  useEffect(() => {
    const v = safeJson<{ exercises?: VaultExercise[] }>(localStorage.getItem("synq_promo_vault"), {});
    setVault({ exercises: Array.isArray(v.exercises) ? v.exercises : [] });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vault.exercises;
    return vault.exercises.filter((ex) => {
      const t = (ex.metadata?.title || "").toLowerCase();
      const o = (ex.metadata?.objective || "").toLowerCase();
      const b = (ex.block || "").toLowerCase();
      return t.includes(q) || o.includes(q) || b.includes(q);
    });
  }, [vault.exercises, query]);

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Sandbox (Biblioteca local)</p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black uppercase tracking-tight">Mis tareas</h1>
            <p className="mt-2 text-sm text-white/70">
              Estas tareas se guardan en el dispositivo (localStorage). La pizarra las puede cargar por `id`.
            </p>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[10px] tracking-widest">
            <Link href="/sandbox">Volver</Link>
          </Button>
        </div>

        <div className="mt-8 rounded-3xl border border-primary/20 bg-white/[0.02] p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/60">Buscar</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Título, objetivo o bloque…"
                className="mt-2 h-12 rounded-2xl bg-black/40 border-primary/20 text-white placeholder:text-white/30"
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                localStorage.removeItem("synq_promo_vault");
                setVault({ exercises: [] });
              }}
              variant="outline"
              className="h-12 rounded-2xl border-rose-500/30 text-rose-200/80 font-black uppercase text-[10px] tracking-widest hover:bg-rose-500/10"
            >
              Vaciar biblioteca
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {filtered.length ? (
              filtered.map((ex) => (
                <div key={ex.id} className="rounded-2xl border border-white/5 bg-black/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase italic truncate">{ex.metadata?.title || `Tarea_${String(ex.id).slice(-4)}`}</p>
                      <p className="mt-1 text-[11px] text-white/60 line-clamp-2">{ex.metadata?.objective || "Sin objetivo"}</p>
                      <p className="mt-2 text-[10px] text-white/40 uppercase tracking-widest">
                        {ex.block ? `Bloque: ${ex.block}` : "Bloque: —"} · {ex.fieldType ? `Campo: ${ex.fieldType}` : "Campo: —"}
                      </p>
                    </div>
                    <Button
                      asChild
                      className="h-10 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest shrink-0"
                    >
                      <Link href={`/sandbox/board?id=${encodeURIComponent(String(ex.id))}`}>Abrir</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/5 bg-black/40 p-6 text-center">
                <p className="text-xs font-bold text-white/60">No hay tareas guardadas (o el filtro no devuelve resultados).</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

