"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Info, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
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
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Migración: torneo único (v1) -> multi-torneo (v2)
    migrateLegacyTournamentToV2(clubScopeId);
    const index = loadTournamentIndex(clubScopeId);
    setTournaments(index);
    const currentId = getActiveTournamentId(clubScopeId) ?? index[0]?.id ?? null;
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
  }, [storageKey]);

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
    }));
  };

  const handleSave = () => {
    try {
      if (!activeTournamentId) return;
      const currentStatus = tournaments.find((t) => t.id === activeTournamentId)?.status ?? "draft";
      if (currentStatus === "finished") return;
      upsertTournament({ clubId: clubScopeId, tournamentId: activeTournamentId, config, status: currentStatus });
      // Mantener legacy key durante transición
      localStorage.setItem(storageKey, JSON.stringify(config));
      setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
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
            <label className="space-y-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nombre del torneo</span>
              <input
                type="text"
                value={config.tournamentName}
                onChange={(e) => setConfig((prev) => ({ ...prev, tournamentName: e.target.value }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none"
                placeholder="Ej: Torneo Verano Ciudad"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº equipos</span>
              <input
                type="number"
                min={2}
                value={computedTeamsCount}
                disabled
                readOnly
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/30 px-3 text-white/80 outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] cursor-not-allowed"
              />
              <span className="text-[10px] text-white/55">
                Calculado automáticamente: grupos × equipos/grupo.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                Titulares en campo (por equipo)
              </span>
              <input
                type="number"
                min={3}
                value={config.startersPerTeam ?? 0}
                disabled
                readOnly
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/30 px-3 text-white/80 outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] cursor-not-allowed"
              />
              <span className="text-[10px] text-white/55">
                Calculado automáticamente por formato (F11=11, F7=7, Futsal=5).
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                Suplentes (por equipo)
              </span>
              <input
                type="number"
                min={0}
                value={config.substitutesPerTeam ?? 0}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    substitutesPerTeam: Math.max(0, Number(e.target.value) || 0) || 0,
                  }))
                }
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
              <span className="text-[10px] text-white/55">
                Número de reservas convocados para el banquillo.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº días torneo</span>
              <input
                type="number"
                min={1}
                value={config.tournamentDays}
                onChange={(e) => setConfig((prev) => ({ ...prev, tournamentDays: Number(e.target.value) || 1 }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Fecha inicio</span>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) =>
                  setConfig((prev) => {
                    const nextStart = e.target.value;
                    return {
                      ...prev,
                      startDate: nextStart,
                      endDate: prev.endDate < nextStart ? nextStart : prev.endDate,
                    };
                  })
                }
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [color-scheme:dark]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Fecha fin</span>
              <input
                type="date"
                min={config.startDate}
                value={config.endDate}
                onChange={(e) => setConfig((prev) => ({ ...prev, endDate: e.target.value || prev.startDate }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [color-scheme:dark]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº grupos</span>
              <input
                type="number"
                min={1}
                value={config.groupsCount}
                onChange={(e) => setConfig((prev) => ({ ...prev, groupsCount: Math.max(1, Number(e.target.value) || 1) }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Equipos por grupo</span>
              <input
                type="number"
                min={0}
                value={config.teamsPerGroup}
                onChange={(e) => setConfig((prev) => ({ ...prev, teamsPerGroup: Math.max(0, Number(e.target.value) || 0) }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Nº campos disponibles</span>
              <input
                type="number"
                min={1}
                value={config.fieldsCount}
                onChange={(e) => setConfig((prev) => ({ ...prev, fieldsCount: Number(e.target.value) || 1 }))}
                className="h-11 w-full rounded-xl border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
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

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Duración y buffers</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Nº partes</span>
                <Select
                  value={String(config.halvesCount)}
                  onValueChange={(v) => setConfig((prev) => ({ ...prev, halvesCount: v === "1" ? 1 : 2 }))}
                  disabled={isFinished}
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20 text-white rounded-2xl shadow-2xl">
                    <SelectItem value="1">1 parte</SelectItem>
                    <SelectItem value="2">2 partes</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Min por parte</span>
                <input
                  type="number"
                  min={5}
                  value={config.minutesPerHalf}
                  onChange={(e) => setConfig((prev) => ({ ...prev, minutesPerHalf: Number(e.target.value) || 5 }))}
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Descanso partes (min)</span>
                <input
                  type="number"
                  min={0}
                  value={config.breakMinutes}
                  onChange={(e) => setConfig((prev) => ({ ...prev, breakMinutes: Math.max(0, Number(e.target.value) || 0) }))}
                  disabled={config.halvesCount === 1}
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Buffer partidos (min)</span>
                <input
                  type="number"
                  min={0}
                  value={config.bufferBetweenMatches}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, bufferBetweenMatches: Math.max(0, Number(e.target.value) || 0) }))
                  }
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
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
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Puntuación liguilla</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Victoria</span>
                <input
                  type="number"
                  min={0}
                  value={config.pointsWin}
                  onChange={(e) => setConfig((prev) => ({ ...prev, pointsWin: Math.max(0, Number(e.target.value) || 0) }))}
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Empate</span>
                <input
                  type="number"
                  min={0}
                  value={config.pointsDraw}
                  onChange={(e) => setConfig((prev) => ({ ...prev, pointsDraw: Math.max(0, Number(e.target.value) || 0) }))}
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/70">Derrota</span>
                <input
                  type="number"
                  min={0}
                  value={config.pointsLoss}
                  onChange={(e) => setConfig((prev) => ({ ...prev, pointsLoss: Math.max(0, Number(e.target.value) || 0) }))}
                  className="h-10 w-full rounded-lg border border-primary/25 bg-black/40 px-3 text-white outline-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
                />
              </label>
            </div>
            <p className="text-[10px] text-white/55">
              Esta configuración se usará para calcular la clasificación de grupos y los cruces de eliminatoria.
            </p>
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
