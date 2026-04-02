"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Info, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type TournamentConfig,
  migrateLegacyTournamentToV2,
  getActiveTournamentId,
  loadTournamentIndex,
  upsertTournament,
  setActiveTournamentId,
} from "@/lib/tournaments-storage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Estilo SynqAI (alineado con /dashboard/tournaments/list)
const labelClass = `text-[10px] uppercase tracking-widest text-[#00F2FF]/60 font-bold`;
const inputClass =
  "h-11 w-full rounded-xl border border-[#00F2FF]/20 bg-[#0F172A]/40 px-3 text-white outline-none hover:border-[#00F2FF]/35 focus-visible:border-[#00F2FF]/50 transition-[background-color,border-color,color,opacity,transform]";
const inputDisabledClass =
  "h-11 w-full rounded-xl border border-[#00F2FF]/15 bg-[#0F172A]/30 px-3 text-white/80 outline-none cursor-not-allowed";
const sectionCardClass =
  "relative overflow-hidden bg-[#0F172A]/60 backdrop-blur-md border border-white/5 hover:border-[#00F2FF]/30 rounded-2xl transition-all duration-300 group";
const infoPanelClass =
  "rounded-xl border border-white/5 bg-black/25 p-3 flex items-start gap-2";

function clampNumber(n: number, min?: number, max?: number) {
  let out = n;
  if (typeof min === "number") out = Math.max(min, out);
  if (typeof max === "number") out = Math.min(max, out);
  return out;
}

function NumericInput({
  value,
  onCommit,
  min,
  max,
  step,
  disabled,
  className,
}: {
  value: number;
  onCommit: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [text, setText] = useState<string>(() => String(value));

  useEffect(() => {
    // Si el usuario no está editando (o se cambió desde fuera), sincronizar.
    setText(String(value));
  }, [value]);

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={text}
      disabled={disabled}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const next = e.target.value;
        // Permitimos vacío para que Backspace/Delete no “reemplace” por 0/1.
        if (next === "") {
          setText("");
          return;
        }
        // Solo dígitos
        if (!/^\d+$/.test(next)) return;
        setText(next);
      }}
      onBlur={() => {
        if (disabled) return;
        const trimmed = text.trim();
        if (trimmed === "") {
          // Si lo dejan vacío, revertimos al valor actual.
          setText(String(value));
          return;
        }
        const n = Number(trimmed);
        if (!Number.isFinite(n)) {
          setText(String(value));
          return;
        }
        const clamped = clampNumber(n, min, max);
        onCommit(clamped);
        setText(String(clamped));
      }}
      className={cn(className)}
      data-step={step ? String(step) : undefined}
    />
  );
}

function TimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const [h, m] = (value || "00:00").split(":");
  const hour = /^\d{2}$/.test(h) ? h : "00";
  const minute = /^\d{2}$/.test(m) ? m : "00";

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")); // pasos de 5'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-left text-white outline-none hover:border-[#00F2FF]/40 focus-visible:border-[#00F2FF]/50 transition-[background-color,border-color,color,opacity,transform]",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          <span className="text-[11px] font-black tabular-nums">{`${hour}:${minute}`}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-3 bg-[#0a0f18] border border-[#00F2FF]/20 rounded-2xl shadow-2xl"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className={labelClass}>Hora</p>
            <Select
              value={hour}
              onValueChange={(v) => onChange(`${v}:${minute}`)}
              disabled={disabled}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border border-[#00F2FF]/20 text-white rounded-2xl shadow-2xl p-1">
                {hours.map((hh) => (
                  <SelectItem
                    key={hh}
                    value={hh}
                    className="rounded-xl focus:bg-[#00F2FF]/10 focus:text-[#00F2FF] data-[state=checked]:bg-[#00F2FF]/10"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] tabular-nums">{hh}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <p className={labelClass}>Min</p>
            <Select
              value={minute}
              onValueChange={(v) => onChange(`${hour}:${v}`)}
              disabled={disabled}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border border-[#00F2FF]/20 text-white rounded-2xl shadow-2xl p-1">
                {minutes.map((mm) => (
                  <SelectItem
                    key={mm}
                    value={mm}
                    className="rounded-xl focus:bg-[#00F2FF]/10 focus:text-[#00F2FF] data-[state=checked]:bg-[#00F2FF]/10"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] tabular-nums">{mm}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function formatDateLabel(value?: string): string {
  if (!value) return "Selecciona fecha";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-ES");
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  // Parse local para evitar desfases por UTC (YYYY-MM-DD se interpreta distinto según navegador/zona).
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const da = Number(m[3]);
    const d = new Date(y, mo, da);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toISODate(d: Date): string {
  // Formato YYYY-MM-DD en hora local (sin UTC) para que no “baje” un día.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

type TimeWindow = "morning" | "afternoon" | "both";
type FootballFormat = "f11" | "f7" | "futsal";

type PlannerConfig = TournamentConfig;

const DEFAULT_CONFIG: PlannerConfig = {
  tournamentName: "Torneo Primavera",
  categoryLabel: "Alevín",
  teamsCount: 8,
  startersPerTeam: 11,
  substitutesPerTeam: 7,
  categories: [],
  tournamentDays: 1,
  startDate: toISODate(new Date()),
  endDate: toISODate(new Date()),
  groupsCount: 2,
  teamsPerGroup: 4,
  timeWindow: "both",
  fieldsCount: 2,
  footballFormat: "f11",
  morningStart: "09:00",
  morningEnd: "14:00",
  afternoonStart: "16:00",
  afternoonEnd: "21:00",
  halvesCount: 2,
  minutesPerHalf: 20,
  breakMinutes: 0,
  bufferBetweenMatches: 10,
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentIdFromUrl = searchParams.get("tournamentId");
  const storageKey = useMemo(() => `synq_tournaments_planner_v1_${clubScopeId}`, [clubScopeId]);
  const [tournaments, setTournaments] = useState(() => loadTournamentIndex(clubScopeId));
  const [config, setConfig] = useState<PlannerConfig>(DEFAULT_CONFIG);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [activeTournamentId, setActiveTournamentIdState] = useState<string | null>(null);
  const isFinished = useMemo(() => {
    const t = tournaments.find((x) => x.id === activeTournamentId);
    return t?.status === "finished";
  }, [tournaments, activeTournamentId]);
  const computedTeamsCount = Math.max(2, (Number(config.groupsCount) || 1) * (Number(config.teamsPerGroup) || 0));

  const selectAllOnFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    // UX: evita concatenar dígitos (p.ej. 1 -> 14) al editar números/horas en móvil/tablet.
    // Seleccionamos todo para que al teclear se reemplace el valor completo.
    try {
      e.currentTarget.select();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Migración: torneo único (v1) -> multi-torneo (v2)
    migrateLegacyTournamentToV2(clubScopeId);
    const index = loadTournamentIndex(clubScopeId);
    setTournaments(index);
    const currentId = tournamentIdFromUrl ?? getActiveTournamentId(clubScopeId) ?? index[0]?.id ?? null;
    if (!currentId) return;
    setActiveTournamentId(clubScopeId, currentId);
    setActiveTournamentIdState(currentId);

    // Cargar config del torneo activo (si existe), si no mantener defaults.
    try {
      const rawConfig = localStorage.getItem(`synq_tournament_config_v1_${clubScopeId}_${currentId}`);
      const parsed = rawConfig ? (JSON.parse(rawConfig) as unknown) : null;
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Partial<TournamentConfig> & { playersPerTeam?: unknown };
        const next: TournamentConfig = { ...DEFAULT_CONFIG, ...raw };
        const ff = next.footballFormat;
        const startersFromFormat = ff === "f7" ? 7 : ff === "futsal" ? 5 : 11;
        // Migración: si venía de playersPerTeam, lo tratamos como titulares.
        const legacyPlayers = typeof raw.playersPerTeam === "number" ? raw.playersPerTeam : undefined;
        const startersCandidate =
          typeof next.startersPerTeam === "number" && next.startersPerTeam > 0
            ? next.startersPerTeam
            : typeof legacyPlayers === "number" && legacyPlayers > 0
              ? legacyPlayers
              : startersFromFormat;
        setConfig({
          ...next,
          startersPerTeam: startersCandidate,
          substitutesPerTeam:
            typeof next.substitutesPerTeam === "number" && next.substitutesPerTeam >= 0 ? next.substitutesPerTeam : 7,
        });
      }
    } catch {
      // ignore
    }
  }, [clubScopeId, storageKey, tournamentIdFromUrl]);

  // Mantener consistencia: nº equipos = nº grupos * equipos por grupo
  useEffect(() => {
    setConfig((prev) => {
      const nextCount = Math.max(2, (Number(prev.groupsCount) || 1) * (Number(prev.teamsPerGroup) || 0));
      return prev.teamsCount === nextCount ? prev : { ...prev, teamsCount: nextCount };
    });
  }, [config.groupsCount, config.teamsPerGroup]);

  // Titulares por equipo: siempre se refresca por formato (no editable).
  useEffect(() => {
    setConfig((prev) => {
      const ff = prev.footballFormat;
      const starters = ff === "f7" ? 7 : ff === "futsal" ? 5 : 11;
      return prev.startersPerTeam === starters ? prev : { ...prev, startersPerTeam: starters };
    });
  }, [config.footballFormat]);

  const toggleCategory = (category: string) => {
    setConfig((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
      // Si no hay categoría principal o está en default, usar la que se marca como referencia.
      categoryLabel:
        !prev.categoryLabel || prev.categoryLabel === DEFAULT_CONFIG.categoryLabel ? category : prev.categoryLabel,
    }));
  };

  const handleSave = () => {
    try {
      if (!activeTournamentId) return;
      const currentStatus = tournaments.find((t) => t.id === activeTournamentId)?.status ?? "draft";
      // Permitimos modificar configuración incluso si está finalizado.
      // No cambiamos el status aquí: el auto-estado lo gestiona la lista por fechas.
      upsertTournament({ clubId: clubScopeId, tournamentId: activeTournamentId, config, status: currentStatus });
      // Mantener legacy key durante transición
      localStorage.setItem(storageKey, JSON.stringify(config));
      setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      router.push("/dashboard/tournaments/list");
    } catch {
      // ignore
    }
  };

  const addMinutesToHHMM = (hhmm: string, delta: number) => {
    const [h, m] = hhmm.split(":").map((v) => Number(v));
    const total = h * 60 + m + delta;
    const normalized = ((total % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hh = String(Math.floor(normalized / 60)).padStart(2, "0");
    const mm = String(normalized % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map((v) => Number(v));
    return h * 60 + m;
  };

  const matchTotalMinutes = config.halvesCount * config.minutesPerHalf + (config.halvesCount === 2 ? config.breakMinutes : 0);
  const slotMinutes = matchTotalMinutes + config.bufferBetweenMatches;
  const slotsPerFieldPerDay = useMemo(() => {
    const ranges: Array<{ start: string; end: string }> = [];
    if (config.timeWindow === "morning" || config.timeWindow === "both") {
      ranges.push({ start: config.morningStart, end: config.morningEnd });
    }
    if (config.timeWindow === "afternoon" || config.timeWindow === "both") {
      ranges.push({ start: config.afternoonStart, end: config.afternoonEnd });
    }
    const total = ranges.reduce((acc, r) => {
      const diff = Math.max(0, toMinutes(r.end) - toMinutes(r.start));
      return acc + Math.floor(diff / Math.max(1, slotMinutes));
    }, 0);
    return total;
  }, [
    config.timeWindow,
    config.morningStart,
    config.morningEnd,
    config.afternoonStart,
    config.afternoonEnd,
    slotMinutes,
  ]);

  const totalSlots = slotsPerFieldPerDay * config.fieldsCount * config.tournamentDays;
  const inferredTeamsPerGroup = Math.max(2, Math.ceil(config.teamsCount / config.groupsCount));
  const estimatedMatchesGroupStage = config.groupsCount * Math.floor((inferredTeamsPerGroup * (inferredTeamsPerGroup - 1)) / 2);
  const sampleSlots = useMemo(() => {
    const firstField = "Campo 1";
    const out: Array<{ day: number; field: string; start: string; end: string }> = [];
    const ranges: Array<{ start: string; end: string }> = [];
    if (config.timeWindow === "morning" || config.timeWindow === "both") {
      ranges.push({ start: config.morningStart, end: config.morningEnd });
    }
    if (config.timeWindow === "afternoon" || config.timeWindow === "both") {
      ranges.push({ start: config.afternoonStart, end: config.afternoonEnd });
    }
    for (let day = 1; day <= Math.min(config.tournamentDays, 2); day++) {
      for (const r of ranges) {
        let cur = r.start;
        while (toMinutes(addMinutesToHHMM(cur, slotMinutes)) <= toMinutes(r.end) && out.length < 8) {
          out.push({
            day,
            field: firstField,
            start: cur,
            end: addMinutesToHHMM(cur, matchTotalMinutes),
          });
          cur = addMinutesToHHMM(cur, slotMinutes);
        }
      }
    }
    return out;
  }, [
    config.timeWindow,
    config.morningStart,
    config.morningEnd,
    config.afternoonStart,
    config.afternoonEnd,
    config.tournamentDays,
    slotMinutes,
    matchTotalMinutes,
  ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/10 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60">TORNEOS · PLANIFICADOR</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
          Planificador de Campos y Horarios
        </h1>
      </div>

      <Card className={sectionCardClass}>
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#00F2FF]" />
            Motor de planificación (Fase 1)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-white/75">
          <p>Se añadirá aquí la programación automática por campo/hora con buffers entre partidos.</p>
          <div className={infoPanelClass}>
            <Info className="h-4 w-4 text-[#00F2FF] mt-0.5" />
            <p className="text-[12px]">
              Reglas previstas: 1xX min o 2xX min, descanso entre partes y 10 min entre partidos (configurable).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={sectionCardClass}>
        <CardHeader>
          <CardTitle className="text-white font-black uppercase tracking-wider">Configuración operativa (MVP)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 md:col-span-2">
              <span className={labelClass}>Nombre del torneo</span>
              <input
                type="text"
                value={config.tournamentName}
                onChange={(e) => setConfig((prev) => ({ ...prev, tournamentName: e.target.value }))}
                className={inputClass}
                placeholder="Ej: Torneo Verano Ciudad"
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Nº equipos</span>
              <input
                type="number"
                min={2}
                value={computedTeamsCount}
                disabled
                readOnly
                className={`${inputDisabledClass} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]`}
              />
              <span className="text-[10px] text-white/55">
                Calculado automáticamente: grupos × equipos/grupo.
              </span>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Titulares en campo (por equipo)</span>
              <input
                type="number"
                min={3}
                value={config.startersPerTeam ?? 0}
                disabled
                readOnly
                className={`${inputDisabledClass} [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]`}
              />
              <span className="text-[10px] text-white/55">
                Calculado automáticamente por formato (F11=11, F7=7, Futsal=5).
              </span>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Suplentes (por equipo)</span>
              <NumericInput
                value={config.substitutesPerTeam ?? 0}
                min={0}
                onCommit={(n) => setConfig((prev) => ({ ...prev, substitutesPerTeam: Math.max(0, n) }))}
                className={inputClass}
              />
              <span className="text-[10px] text-white/55">
                Número de reservas convocados para el banquillo.
              </span>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Nº días torneo</span>
              <NumericInput
                value={config.tournamentDays}
                min={1}
                onCommit={(n) => setConfig((prev) => ({ ...prev, tournamentDays: Math.max(1, n) }))}
                className={inputClass}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Fecha inicio</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(inputClass, "text-left")}
                  >
                    <span className="text-[11px] font-black">
                      {formatDateLabel(config.startDate)}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0 bg-[#0a0f18] border border-white/5 rounded-2xl shadow-2xl">
                  <Calendar
                    mode="single"
                    selected={toDate(config.startDate)}
                    onSelect={(d) => {
                      if (!d) return;
                      const nextStart = toISODate(d);
                      setConfig((prev) => ({
                        ...prev,
                        startDate: nextStart,
                        endDate: prev.endDate < nextStart ? nextStart : prev.endDate,
                      }));
                    }}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Fecha fin</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(inputClass, "text-left")}
                  >
                    <span className="text-[11px] font-black">
                      {formatDateLabel(config.endDate)}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0 bg-[#0a0f18] border border-white/5 rounded-2xl shadow-2xl">
                  <Calendar
                    mode="single"
                    selected={toDate(config.endDate)}
                    disabled={(d) => {
                      const start = toDate(config.startDate);
                      if (!start) return false;
                      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
                      const minDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
                      return day < minDay;
                    }}
                    onSelect={(d) => {
                      if (!d) return;
                      const nextEnd = toISODate(d);
                      setConfig((prev) => ({ ...prev, endDate: nextEnd || prev.startDate }));
                    }}
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Nº grupos</span>
              <NumericInput
                value={config.groupsCount}
                min={1}
                onCommit={(n) => setConfig((prev) => ({ ...prev, groupsCount: Math.max(1, n) }))}
                className={inputClass}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Equipos por grupo</span>
              <NumericInput
                value={config.teamsPerGroup}
                min={0}
                onCommit={(n) => setConfig((prev) => ({ ...prev, teamsPerGroup: Math.max(0, n) }))}
                className={inputClass}
              />
            </label>

            <label className="space-y-2">
              <span className={labelClass}>Nº campos disponibles</span>
              <NumericInput
                value={config.fieldsCount}
                min={1}
                onCommit={(n) => setConfig((prev) => ({ ...prev, fieldsCount: Math.max(1, n) }))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Categorías</span>
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
                        ? "border-[#00F2FF]/35 bg-[#00F2FF]/10 text-[#00F2FF]"
                        : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.05]"
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
              <div
                className={`rounded-xl border bg-white/5 p-3 space-y-2 transition-[background-color,border-color,color,opacity,transform] ${
                  config.timeWindow === "afternoon" ? "border-white/5 opacity-40" : "border-white/10 opacity-100"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Mañana</p>
                <div className="grid grid-cols-2 gap-2">
                  <TimePicker
                    value={config.morningStart}
                    onChange={(v) => setConfig((prev) => ({ ...prev, morningStart: v }))}
                    disabled={isFinished || config.timeWindow === "afternoon"}
                  />
                  <TimePicker
                    value={config.morningEnd}
                    onChange={(v) => setConfig((prev) => ({ ...prev, morningEnd: v }))}
                    disabled={isFinished || config.timeWindow === "afternoon"}
                  />
                </div>
              </div>
              <div
                className={`rounded-xl border bg-white/5 p-3 space-y-2 transition-[background-color,border-color,color,opacity,transform] ${
                  config.timeWindow === "morning" ? "border-white/5 opacity-40" : "border-white/10 opacity-100"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Tarde</p>
                <div className="grid grid-cols-2 gap-2">
                  <TimePicker
                    value={config.afternoonStart}
                    onChange={(v) => setConfig((prev) => ({ ...prev, afternoonStart: v }))}
                    disabled={isFinished || config.timeWindow === "morning"}
                  />
                  <TimePicker
                    value={config.afternoonEnd}
                    onChange={(v) => setConfig((prev) => ({ ...prev, afternoonEnd: v }))}
                    disabled={isFinished || config.timeWindow === "morning"}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Duración y buffers</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className={labelClass}>Nº partes</span>
                <Select
                  value={String(config.halvesCount)}
                  onValueChange={(v) => setConfig((prev) => ({ ...prev, halvesCount: v === "1" ? 1 : 2 }))}
                  disabled={isFinished}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none hover:border-[#00F2FF]/40 focus-visible:border-[#00F2FF]/50 focus:ring-0 focus:ring-offset-0 transition-[background-color,border-color,color,opacity,transform]">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border border-[#00F2FF]/20 text-white rounded-2xl shadow-2xl">
                    <SelectItem value="1">1 parte</SelectItem>
                    <SelectItem value="2">2 partes</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Min por parte</span>
                <NumericInput
                  value={config.minutesPerHalf}
                  min={5}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, minutesPerHalf: Math.max(5, n || 5) }))}
                  className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none hover:border-[#00F2FF]/40 focus-visible:border-[#00F2FF]/50 transition-[background-color,border-color,color,opacity,transform]"
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Descanso partes (min)</span>
                <NumericInput
                  value={config.breakMinutes}
                  min={0}
                  disabled={config.halvesCount === 1}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, breakMinutes: Math.max(0, n) }))}
                  className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none hover:border-[#00F2FF]/40 focus-visible:border-[#00F2FF]/50 disabled:opacity-60 disabled:cursor-not-allowed transition-[background-color,border-color,color,opacity,transform]"
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Buffer partidos (min)</span>
                <NumericInput
                  value={config.bufferBetweenMatches}
                  min={0}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, bufferBetweenMatches: Math.max(0, n) }))}
                  className="h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0F172A]/40 px-3 text-white outline-none hover:border-[#00F2FF]/40 focus-visible:border-[#00F2FF]/50 transition-[background-color,border-color,color,opacity,transform]"
                />
              </label>
            </div>
            <p className="text-[10px] text-white/55">
              Duración efectiva partido: <span className="text-white font-black">{matchTotalMinutes} min</span> · Slot total:{" "}
              <span className="text-white font-black">{slotMinutes} min</span>
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/90">
              Simulación rápida del torneo (preview)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[9px] uppercase text-white/55 font-black">Slots/día/campo</p>
                <p className="text-sm font-black text-white">{slotsPerFieldPerDay}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2 md:col-span-2">
                <p className="text-[9px] uppercase text-white/55 font-black">Torneo</p>
                <p className="text-sm font-black text-white truncate">{config.tournamentName || "Sin nombre"}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[9px] uppercase text-white/55 font-black">Slots totales</p>
                <p className="text-sm font-black text-white">{totalSlots}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[9px] uppercase text-white/55 font-black">Partidos estimados</p>
                <p className="text-sm font-black text-white">{estimatedMatchesGroupStage}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                <p className="text-[9px] uppercase text-white/55 font-black">Cobertura</p>
                <p className="text-sm font-black text-white">{totalSlots >= estimatedMatchesGroupStage ? "OK" : "Ajustar"}</p>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-[9px] uppercase text-white/55 font-black">Fechas torneo</p>
              <p className="text-[11px] font-black text-white">
                {config.startDate} → {config.endDate}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/70">Ejemplo de slots (primeros)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sampleSlots.length === 0 ? (
                  <p className="text-[11px] text-white/60">No hay franja válida para generar slots.</p>
                ) : (
                  sampleSlots.map((slot, idx) => (
                    <div key={`${slot.day}_${slot.start}_${idx}`} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
                      <p className="text-[9px] uppercase text-primary/80 font-black">
                        Día {slot.day} · {slot.field}
                      </p>
                      <p className="text-[11px] font-black text-white">
                        {slot.start} - {slot.end}
                      </p>
                      <p className="text-[9px] text-white/60">
                        {config.halvesCount}x{config.minutesPerHalf}
                        {config.halvesCount === 2 ? ` + desc ${config.breakMinutes}m` : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Puntuación liguilla</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className={labelClass}>Victoria</span>
                <NumericInput
                  value={config.pointsWin}
                  min={0}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, pointsWin: Math.max(0, n) }))}
                  className={cn(inputClass, "h-10 rounded-lg")}
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Empate</span>
                <NumericInput
                  value={config.pointsDraw}
                  min={0}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, pointsDraw: Math.max(0, n) }))}
                  className={cn(inputClass, "h-10 rounded-lg")}
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Derrota</span>
                <NumericInput
                  value={config.pointsLoss}
                  min={0}
                  onCommit={(n) => setConfig((prev) => ({ ...prev, pointsLoss: Math.max(0, n) }))}
                  className={cn(inputClass, "h-10 rounded-lg")}
                />
              </label>
            </div>
            <p className="text-[10px] text-white/55">
              Esta configuración se usará para calcular la clasificación de grupos y los cruces de eliminatoria.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00F2FF]/50">
              {savedAt ? `Guardado local: ${savedAt}` : "Pendiente de guardar"}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#00F2FF]/15 transition-[background-color,border-color,color,opacity,transform]"
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
