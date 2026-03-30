"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PromoTeam = {
  type?: "f11" | "f7" | "futsal";
  starters?: string[];
};

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function SandboxTeamPage() {
  const [team, setTeam] = useState<PromoTeam>({ type: "f11", starters: Array.from({ length: 11 }, () => "") });
  const slots = useMemo(() => (team.type === "futsal" ? 5 : team.type === "f7" ? 7 : 11), [team.type]);

  useEffect(() => {
    const saved = safeJsonParse<PromoTeam>(localStorage.getItem("synq_promo_team"), { type: "f11", starters: [] });
    const starters = Array.isArray(saved.starters) ? saved.starters : [];
    const normalized: PromoTeam = {
      type: saved.type ?? "f11",
      starters: Array.from({ length: 11 }, (_, i) => starters[i] ?? ""),
    };
    setTeam(normalized);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">Sandbox</p>
            <h1 className="mt-2 text-xl sm:text-2xl font-black uppercase tracking-tight">Configurar equipo</h1>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[10px] tracking-widest"
          >
            <Link href="/sandbox/board">Volver a la pizarra</Link>
          </Button>
        </div>

        <div className="mt-6 rounded-3xl border border-primary/20 bg-white/[0.02] p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Tipo de campo</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["f11", "f7", "futsal"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    onClick={() => setTeam((prev) => ({ ...prev, type: t }))}
                    className={
                      "h-10 rounded-2xl font-black uppercase text-[10px] tracking-widest " +
                      (team.type === t ? "bg-primary text-black" : "bg-white/5 text-white/70 border border-white/10")
                    }
                  >
                    {t.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Titulares</Label>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: slots }, (_, i) => (
                  <div key={i} className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">#{i + 1}</Label>
                    <Input
                      value={(team.starters?.[i] ?? "") as string}
                      onChange={(e) =>
                        setTeam((prev) => {
                          const starters = Array.from({ length: 11 }, (_, idx) => prev.starters?.[idx] ?? "");
                          starters[i] = e.target.value;
                          return { ...prev, starters };
                        })
                      }
                      className="h-11 rounded-2xl bg-black/40 border-white/10 text-white/90 font-bold uppercase"
                      placeholder="Nombre"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              className="h-12 rounded-2xl bg-primary text-black font-black uppercase text-[11px] tracking-widest"
              onClick={() => {
                const payload: PromoTeam = { type: team.type ?? "f11", starters: team.starters ?? [] };
                localStorage.setItem("synq_promo_team", JSON.stringify(payload));
              }}
            >
              Guardar (local)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-white/10 text-white/80 font-black uppercase text-[11px] tracking-widest"
              onClick={() => {
                localStorage.removeItem("synq_promo_team");
                setTeam({ type: "f11", starters: Array.from({ length: 11 }, () => "") });
              }}
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

