"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Info, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

type TimeWindow = "morning" | "afternoon" | "both";
type FootballFormat = "f11" | "f7" | "futsal";

type PlannerConfig = {
  teamsCount: number;
  categories: string[];
  tournamentDays: number;
  timeWindow: TimeWindow;
  fieldsCount: number;
  footballFormat: FootballFormat;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

const DEFAULT_CONFIG: PlannerConfig = {
  teamsCount: 8,
  categories: [],
  tournamentDays: 1,
  timeWindow: "both",
  fieldsCount: 2,
  footballFormat: "f11",
  morningStart: "09:00",
  morningEnd: "14:00",
  afternoonStart: "16:00",
  afternoonEnd: "21:00",
};

const CATEGORY_OPTIONS = [
  "Prebenjamín",
  "Benjamín",
  "Alevín",
  "Infantil",
  "Cadete",
  "Juvenil",
  "Senior",
];

export default function TournamentsPlannerPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const storageKey = useMemo(
    () => `synq_tournaments_planner_v1_${clubScopeId}`,
    [clubScopeId],
  );
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PlannerConfig>;
      setConfig({
        teamsCount: Number(parsed.teamsCount) > 0 ? Number(parsed.teamsCount) : DEFAULT_CONFIG.teamsCount,
        categories: Array.isArray(parsed.categories)
          ? parsed.categories.filter((c): c is string => typeof c === "string")
          : [],
        tournamentDays: Number(parsed.tournamentDays) > 0 ? Number(parsed.tournamentDays) : DEFAULT_CONFIG.tournamentDays,
        timeWindow:
          parsed.timeWindow === "morning" || parsed.timeWindow === "afternoon" || parsed.timeWindow === "both"
            ? parsed.timeWindow
            : DEFAULT_CONFIG.timeWindow,
        fieldsCount: Number(parsed.fieldsCount) > 0 ? Number(parsed.fieldsCount) : DEFAULT_CONFIG.fieldsCount,
        footballFormat:
          parsed.footballFormat === "f11" || parsed.footballFormat === "f7" || parsed.footballFormat === "futsal"
            ? parsed.footballFormat
            : DEFAULT_CONFIG.footballFormat,
        morningStart: typeof parsed.morningStart === "string" ? parsed.morningStart : DEFAULT_CONFIG.morningStart,
        morningEnd: typeof parsed.morningEnd === "string" ? parsed.morningEnd : DEFAULT_CONFIG.morningEnd,
        afternoonStart: typeof parsed.afternoonStart === "string" ? parsed.afternoonStart : DEFAULT_CONFIG.afternoonStart,
        afternoonEnd: typeof parsed.afternoonEnd === "string" ? parsed.afternoonEnd : DEFAULT_CONFIG.afternoonEnd,
      });
    } catch {
      // ignore
    }
  }, [storageKey]);

  const toggleCategory = (category: string) => {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
      setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/10 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">TORNEOS · PLANIFICADOR</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
          Planificador de Campos y Horarios
        </h1>
      </div>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Motor de planificación (Fase 1)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/75">
          <p>Se añadirá aquí la programación automática por campo/hora con buffers entre partidos.</p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-[12px]">
              Reglas previstas: 1xX min o 2xX min, descanso entre partes y 10 min entre partidos (configurable).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider">Configuración operativa (MVP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº equipos</span>
              <input
                type="number"
                min={2}
                value={config.teamsCount}
                onChange={(e) => setConfig((prev) => ({ ...prev, teamsCount: Number(e.target.value) || 2 }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº días torneo</span>
              <input
                type="number"
                min={1}
                value={config.tournamentDays}
                onChange={(e) => setConfig((prev) => ({ ...prev, tournamentDays: Number(e.target.value) || 1 }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº campos disponibles</span>
              <input
                type="number"
                min={1}
                value={config.fieldsCount}
                onChange={(e) => setConfig((prev) => ({ ...prev, fieldsCount: Number(e.target.value) || 1 }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none"
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Categorías</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = config.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wide transition-[background-color,border-color,color,opacity,transform] ${
                      active
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-white/15 bg-white/5 text-white/70"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Horario del torneo</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: "morning", label: "Mañana" },
                { value: "afternoon", label: "Tarde" },
                { value: "both", label: "Mañana y tarde" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, timeWindow: opt.value as TimeWindow }))}
                  className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-[0.16em] ${
                    config.timeWindow === opt.value
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-white/15 bg-white/5 text-white/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Formato fútbol (por ahora)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: "f11", label: "Fútbol 11" },
                { value: "f7", label: "Fútbol 7" },
                { value: "futsal", label: "Fútbol Sala" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfig((prev) => ({ ...prev, footballFormat: opt.value as FootballFormat }))}
                  className={`h-10 rounded-xl border text-[10px] font-black uppercase tracking-[0.16em] ${
                    config.footballFormat === opt.value
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-white/15 bg-white/5 text-white/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/55">
              Preparado para evolucionar a multideporte en próximas fases.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Horas por franja</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Mañana</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={config.morningStart}
                    onChange={(e) => setConfig((prev) => ({ ...prev, morningStart: e.target.value }))}
                    className="h-10 rounded-lg border border-primary/25 bg-black/40 px-2 text-white outline-none"
                  />
                  <input
                    type="time"
                    value={config.morningEnd}
                    onChange={(e) => setConfig((prev) => ({ ...prev, morningEnd: e.target.value }))}
                    className="h-10 rounded-lg border border-primary/25 bg-black/40 px-2 text-white outline-none"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Tarde</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={config.afternoonStart}
                    onChange={(e) => setConfig((prev) => ({ ...prev, afternoonStart: e.target.value }))}
                    className="h-10 rounded-lg border border-primary/25 bg-black/40 px-2 text-white outline-none"
                  />
                  <input
                    type="time"
                    value={config.afternoonEnd}
                    onChange={(e) => setConfig((prev) => ({ ...prev, afternoonEnd: e.target.value }))}
                    className="h-10 rounded-lg border border-primary/25 bg-black/40 px-2 text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              {savedAt ? `Guardado local: ${savedAt}` : "Pendiente de guardar"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/30 bg-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar configuración
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
