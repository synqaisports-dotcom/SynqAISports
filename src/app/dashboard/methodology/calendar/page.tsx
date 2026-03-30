"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock3, Filter, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useOperativaSync } from "@/hooks/use-operativa-sync";

type SessionEvent = {
  id: string;
  title: string;
  section: string;
  team: string;
  field: string;
  coach: string;
  date: string;
  startTime: string;
  endTime: string;
};

type CalendarView = "month" | "week" | "day";

const STORAGE_KEY_PREFIX = "synq_methodology_calendar_v1";
const FIELDS = ["CAMPO 1", "CAMPO 2", "CAMPO 3", "PABELLON", "PISCINA"];
const SECTIONS = ["DEBUTANTES", "ALEVIN", "INFANTIL", "CADETE", "JUVENIL", "PRIMER EQUIPO"];

function readEvents(storageKey: string): SessionEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionEvent[]) : [];
  } catch {
    return [];
  }
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "2-digit" }).toUpperCase();
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function overlaps(a: SessionEvent, b: SessionEvent): boolean {
  if (a.date !== b.date || a.field !== b.field || a.id === b.id) return false;
  const a1 = timeToMinutes(a.startTime);
  const a2 = timeToMinutes(a.endTime);
  const b1 = timeToMinutes(b.startTime);
  const b2 = timeToMinutes(b.endTime);
  return a1 < b2 && b1 < a2;
}

function parseMccToMonthWeek(mcc: string): { month: number; week: number } | null {
  const m = mcc.match(/^([A-Z]+)_W(\d+)$/i);
  if (!m) return null;
  const token = m[1].toLowerCase();
  const week = Number(m[2]);
  const monthMap: Record<string, number> = {
    sept: 8, oct: 9, nov: 10, dec: 11, jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  };
  const month = monthMap[token];
  if (!Number.isFinite(week) || !Number.isFinite(month)) return null;
  return { month, week };
}

function estimateSessionDate(mcc: string, session: string): string {
  const parsed = parseMccToMonthWeek(mcc);
  if (!parsed) return new Date().toISOString().slice(0, 10);
  const now = new Date();
  const seasonStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  const year = parsed.month >= 8 ? seasonStartYear : seasonStartYear + 1;
  const dayOffset = (parsed.week - 1) * 7 + Math.max(0, Number(session) - 1);
  const date = new Date(year, parsed.month, 1 + dayOffset);
  return date.toISOString().slice(0, 10);
}

function fieldBySession(session: string): string {
  const idx = Math.max(0, (Number(session) || 1) - 1) % FIELDS.length;
  return FIELDS[idx];
}

export default function MethodologyCalendarPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const storageKey = `${STORAGE_KEY_PREFIX}_${clubScopeId}`;
  const legacyStorageKey = STORAGE_KEY_PREFIX;
  const { canUseSupabase, loadSnapshot } = useOperativaSync(clubScopeId);
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");

  useEffect(() => {
    // Migración legacy: mover calendario global anterior a clave por club si existe.
    if (typeof window === "undefined") return;
    const scopedRaw = localStorage.getItem(storageKey);
    if (scopedRaw) {
      setEvents(readEvents(storageKey));
      return;
    }
    const legacyRaw = localStorage.getItem(legacyStorageKey);
    if (legacyRaw) {
      localStorage.setItem(storageKey, legacyRaw);
      setEvents(readEvents(storageKey));
      return;
    }
    setEvents([]);
  }, [storageKey, legacyStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify(events));
  }, [events, storageKey]);

  useEffect(() => {
    if (!canUseSupabase) return;
    const loadCalendar = async () => {
      const snapshot = await loadSnapshot();
      if (snapshot.assignments.length === 0) return;
      const map = new Map<string, SessionEvent>();
      snapshot.assignments.forEach((a) => {
        const key = `${a.teamId}_${a.mcc}_${a.session}`;
        if (map.has(key)) return;
        map.set(key, {
          id: key,
          title: `SESION ${a.session} · ${a.mcc}`,
          section: String(a.teamId || "SECCION"),
          team: String(a.teamId || "EQUIPO"),
          field: fieldBySession(a.session),
          coach: "OPERATIVA",
          date: estimateSessionDate(a.mcc, a.session),
          startTime: "18:00",
          endTime: "19:30",
        });
      });
      if (map.size > 0) {
        setEvents(Array.from(map.values()));
      }
    };
    void loadCalendar();
  }, [canUseSupabase, loadSnapshot]);

  const weekStart = useMemo(() => startOfWeek(anchorDate), [anchorDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const dayKey = toIsoDate(anchorDate);

  const range = useMemo(() => {
    if (view === "day") {
      return { start: dayKey, end: dayKey, keys: new Set([dayKey]) };
    }
    if (view === "week") {
      const keys = new Set(weekDays.map(toIsoDate));
      return { start: toIsoDate(weekDays[0]), end: toIsoDate(weekDays[6]), keys };
    }
    const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    const keys = new Set<string>();
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) keys.add(toIsoDate(d));
    return { start: toIsoDate(start), end: toIsoDate(end), keys };
  }, [view, dayKey, weekDays, anchorDate]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => range.keys.has(e.date))
      .filter((e) => (sectionFilter === "all" ? true : e.section === sectionFilter))
      .filter((e) => (fieldFilter === "all" ? true : e.field === fieldFilter))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
  }, [events, range, sectionFilter, fieldFilter]);

  const groupedByDay = useMemo(() => {
    const m = new Map<string, SessionEvent[]>();
    for (const e of filtered) {
      const list = m.get(e.date) ?? [];
      list.push(e);
      m.set(e.date, list);
    }
    return m;
  }, [filtered]);

  const conflicts = useMemo(() => {
    const out: string[] = [];
    for (const [date, list] of groupedByDay.entries()) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (overlaps(list[i], list[j])) out.push(`${date} · ${list[i].field}`);
        }
      }
    }
    return Array.from(new Set(out));
  }, [groupedByDay]);

  const visibleDays = useMemo(() => {
    if (view === "day") return [anchorDate];
    if (view === "week") return weekDays;
    const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
    const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
    const out: Date[] = [];
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) out.push(new Date(d));
    return out;
  }, [view, anchorDate, weekDays]);

  const moveRange = (delta: number) => {
    setAnchorDate((d) => {
      const next = new Date(d);
      if (view === "day") next.setDate(next.getDate() + delta);
      else if (view === "week") next.setDate(next.getDate() + delta * 7);
      else next.setMonth(next.getMonth() + delta);
      return next;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-8 lg:p-12">
      <div className="flex flex-col gap-3 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase">Agenda_Operativa</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow">
          CALENDARIO_DE_OCUPACION
        </h1>
        <p className="text-[10px] font-black text-primary/30 tracking-[0.2em] uppercase">
          Visualización agenda (mes/semana/día) sin edición
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-panel lg:col-span-3 border border-primary/20 bg-black/20 rounded-3xl">
          <CardHeader className="border-b border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-10 w-10 rounded-xl border border-white/10" onClick={() => moveRange(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Badge variant="outline" className="text-[10px] font-black border-primary/30 text-primary/80 px-4 py-2">
                  {view === "day"
                    ? `DIA ${dayLabel(anchorDate)}`
                    : view === "week"
                      ? `SEMANA ${dayLabel(weekDays[0])} - ${dayLabel(weekDays[6])}`
                      : `MES ${anchorDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()}`}
                </Badge>
                <Button variant="ghost" className="h-10 w-10 rounded-xl border border-white/10" onClick={() => moveRange(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
                  <SelectTrigger className="h-10 w-[130px] bg-white/5 border-white/10 text-[10px] font-black uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    <SelectItem value="month">MES</SelectItem>
                    <SelectItem value="week">SEMANA</SelectItem>
                    <SelectItem value="day">DIA</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger className="h-10 w-[170px] bg-white/5 border-white/10 text-[10px] font-black uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    <SelectItem value="all">TODAS SECCIONES</SelectItem>
                    {SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger className="h-10 w-[150px] bg-white/5 border-white/10 text-[10px] font-black uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    <SelectItem value="all">TODOS CAMPOS</SelectItem>
                    {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className={cn("grid gap-4", view === "month" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-5" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4")}>
              {visibleDays.map((d) => {
                const key = toIsoDate(d);
                const items = groupedByDay.get(key) ?? [];
                return (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3 min-h-[200px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary/80 uppercase tracking-widest">{dayLabel(d)}</span>
                      <Badge variant="outline" className="text-[8px] border-white/15 text-white/60">{items.length} SES.</Badge>
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 ? (
                        <p className="text-[9px] uppercase text-white/25 font-bold">Sin ocupacion</p>
                      ) : (
                        items.map((it) => (
                          <div key={it.id} className="rounded-xl border border-primary/20 bg-primary/5 p-2.5">
                            <p className="text-[9px] font-black text-white uppercase truncate">{it.title}</p>
                            <p className="text-[8px] text-white/50 uppercase">{it.team} · {it.field}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[8px] text-primary/80 font-black">{it.section}</span>
                              <span className="text-[8px] text-white/60 font-black">{it.startTime}-{it.endTime}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Resumen agenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
              <p className="text-[8px] text-white/40 uppercase font-black">Sesiones visibles</p>
              <p className="text-3xl font-black text-white italic">{filtered.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
              <p className="text-[8px] text-white/40 uppercase font-black">Minutos visibles</p>
              <p className="text-3xl font-black text-primary italic cyan-text-glow">
                {Math.round(filtered.reduce((s, e) => s + Math.max(0, timeToMinutes(e.endTime) - timeToMinutes(e.startTime)), 0))}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
              <p className="text-[8px] text-white/40 uppercase font-black">Solapes detectados</p>
              <p className={cn("text-2xl font-black italic", conflicts.length > 0 ? "text-rose-400" : "text-emerald-400")}>{conflicts.length}</p>
              {conflicts.slice(0, 3).map((c) => (
                <p key={c} className="text-[8px] uppercase text-white/45 mt-1 truncate">{c}</p>
              ))}
            </div>
            <div className="pt-2 text-[8px] text-white/35 uppercase font-bold space-y-1">
              <p className="flex items-center gap-2"><Clock3 className="h-3 w-3 text-primary/60" /> Solo visualizacion; alta en Planif. Sesiones.</p>
              <p className="flex items-center gap-2"><Users className="h-3 w-3 text-primary/60" /> Filtro por seccion/campo para ocupacion.</p>
              <p className="flex items-center gap-2"><ShieldCheck className="h-3 w-3 text-primary/60" /> Base operativa para KDS multideporte.</p>
              {conflicts.length > 0 && <p className="flex items-center gap-2 text-rose-400/80"><AlertTriangle className="h-3 w-3" /> Revisa campos con solape.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
