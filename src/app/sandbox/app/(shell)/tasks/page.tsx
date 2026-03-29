"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Flame, Target, Users } from "lucide-react";
import PromoTasksPage from "@/app/dashboard/promo/tasks/page";

type PromoExercise = {
  id?: number | string;
  block?: string;
  metadata?: {
    title?: string;
    objective?: string;
  };
};

type PromoVault = {
  exercises?: PromoExercise[];
};

type TeamCfg = {
  starters?: string[];
};

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const MAX_CAPACITY = 20;

export default function SandboxAppTasksPage() {
  const [vaultCount, setVaultCount] = useState(0);
  const [warmupCount, setWarmupCount] = useState(0);
  const [mainCount, setMainCount] = useState(0);
  const [coolCount, setCoolCount] = useState(0);
  const [startersCount, setStartersCount] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const vault = safeParseJson<PromoVault>(localStorage.getItem("synq_promo_vault"), { exercises: [] });
    const team = safeParseJson<TeamCfg>(localStorage.getItem("synq_promo_team"), { starters: [] });
    const exercises = Array.isArray(vault.exercises) ? vault.exercises : [];
    setVaultCount(exercises.length);
    setWarmupCount(exercises.filter((e) => (e.block || "").toLowerCase() === "warmup").length);
    setMainCount(exercises.filter((e) => (e.block || "").toLowerCase() === "main").length);
    setCoolCount(exercises.filter((e) => (e.block || "").toLowerCase() === "cooldown").length);
    setStartersCount((team.starters || []).filter((n) => (n || "").trim() !== "").length);
  }, []);

  const usagePct = useMemo(() => Math.min(100, Math.round((vaultCount / MAX_CAPACITY) * 100)), [vaultCount]);

  const maxBlock = Math.max(warmupCount, mainCount, coolCount, 1);
  const bars = [
    { label: "Warmup", value: warmupCount, className: "bg-cyan-300/80" },
    { label: "Main", value: mainCount, className: "bg-cyan-400/90" },
    { label: "Cool", value: coolCount, className: "bg-cyan-500/90" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-3xl border border-primary/20 bg-gradient-to-b from-cyan-500/[0.08] to-transparent p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-primary/70">Sandbox Insights</p>
            <h2 className="mt-1 text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Métricas de <span className="text-primary">Mis tareas</span>
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-black/50 px-3 py-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/80">
              Local-first activo
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-primary/20 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-primary/80">
              <Target className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Ejercicios</p>
            </div>
            <p className="mt-1 text-xl font-black text-white">{vaultCount}</p>
            <p className="text-[10px] text-white/50">{usagePct}% de capacidad</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-primary/80">
              <Users className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Titulares</p>
            </div>
            <p className="mt-1 text-xl font-black text-white">{startersCount}</p>
            <p className="text-[10px] text-white/50">Configurados en equipo</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-primary/80">
              <Flame className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Warmup</p>
            </div>
            <p className="mt-1 text-xl font-black text-white">{warmupCount}</p>
            <p className="text-[10px] text-white/50">Bloque inicial</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-black/40 p-3">
            <div className="flex items-center gap-2 text-primary/80">
              <BarChart3 className="h-4 w-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Main/Cool</p>
            </div>
            <p className="mt-1 text-xl font-black text-white">
              {mainCount}/{coolCount}
            </p>
            <p className="text-[10px] text-white/50">Bloques centrales/finales</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-primary/20 bg-black/45 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/75">Distribución de tareas</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{vaultCount} totales</p>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end h-28">
            {bars.map((b) => {
              const h = Math.max(12, Math.round((b.value / maxBlock) * 100));
              return (
                <div key={b.label} className="flex flex-col items-center gap-2">
                  <div className="w-full max-w-[80px] h-20 rounded-xl border border-white/10 bg-black/35 flex items-end p-1">
                    <div className={`w-full rounded-lg ${b.className}`} style={{ height: `${h}%` }} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-white/70">{b.label}</p>
                  <p className="text-[10px] font-black text-primary">{b.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PromoTasksPage />
    </div>
  );
}


