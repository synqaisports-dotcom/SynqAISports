"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Flame, Target, Users } from "lucide-react";
import PromoTasksPage from "@/app/dashboard/promo/tasks/page";
import { HubPanel, SectionBar, PANEL_OUTER, iconCyan } from "@/app/dashboard/promo/command-hub-ui";
import { cn } from "@/lib/utils";

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
    { label: "Warmup", value: warmupCount, className: "bg-cyan-400/90 shadow-[0_0_12px_rgba(34,211,238,0.45)]" },
    { label: "Main", value: mainCount, className: "bg-cyan-500/95 shadow-[0_0_14px_rgba(6,182,212,0.5)]" },
    { label: "Cool", value: coolCount, className: "bg-sky-400/85 shadow-[0_0_12px_rgba(56,189,248,0.4)]" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <HubPanel>
        <SectionBar
          title="Insights · Mis tareas"
          right={
            <div className="inline-flex items-center gap-2 rounded-none border border-white/10 bg-slate-950/40 px-3 py-1.5">
              <Activity className={cn(iconCyan, "h-3.5 w-3.5")} />
              <span className="text-[8px] font-black uppercase tracking-[0.28em] text-cyan-200/75">Local-first</span>
            </div>
          }
        />
        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Target, label: "Ejercicios", value: vaultCount, sub: `${usagePct}% capacidad` },
              { icon: Users, label: "Titulares", value: startersCount, sub: "En plantilla" },
              { icon: Flame, label: "Warmup", value: warmupCount, sub: "Bloque inicial" },
              {
                icon: BarChart3,
                label: "Main / Cool",
                value: `${mainCount}/${coolCount}`,
                sub: "Centro / cierre",
              },
            ].map((m) => (
              <div
                key={m.label}
                className={cn(
                  "rounded-none border border-white/10 bg-slate-950/40 backdrop-blur-md p-3",
                  PANEL_OUTER,
                )}
              >
                <div className="flex items-center gap-2 text-cyan-200/75">
                  <m.icon className={iconCyan} />
                  <p className="text-[8px] font-black uppercase tracking-widest">{m.label}</p>
                </div>
                <p className="mt-1 font-mono text-xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]">
                  {m.value}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">{m.sub}</p>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "rounded-none border border-white/10 bg-slate-950/35 backdrop-blur-md p-4",
              "drop-shadow-[0_0_12px_rgba(6,182,212,0.08)]",
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-200/80">Distribución</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono tabular-nums">
                {vaultCount} totales
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 items-end h-28">
              {bars.map((b) => {
                const h = Math.max(12, Math.round((b.value / maxBlock) * 100));
                return (
                  <div key={b.label} className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-[80px] h-20 rounded-none border border-white/10 bg-black/40 flex items-end p-1">
                      <div className={`w-full rounded-none ${b.className}`} style={{ height: `${h}%` }} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{b.label}</p>
                    <p className="text-[10px] font-mono font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                      {b.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </HubPanel>

      <PromoTasksPage />
    </div>
  );
}
