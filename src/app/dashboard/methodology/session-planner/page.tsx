
"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  CalendarDays, 
  Settings2, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Users, 
  LayoutGrid, 
  Layers, 
  CheckCircle2,
  Clock,
  Activity,
  Plus,
  Library,
  Save,
  Trash2,
  Search,
  Filter,
  Flame,
  Dumbbell,
  Wind,
  Info,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Check,
  X,
  History,
  MessageSquareQuote,
  Pencil,
  UserX,
  UserCheck,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { readMethodologyNeural } from "@/lib/neural-warehouse";
import {
  deleteOperativaAssignment,
  upsertOperativaAssignment,
  upsertOperativaChangeRequest,
  upsertOperativaAttendance,
  updateOperativaChangeRequestDecision,
} from "@/lib/operativa-sync";
import { useOperativaSync } from "@/hooks/use-operativa-sync";
import {
  mapOperativaAssignmentsToUi,
  mapOperativaRequestsToUi,
} from "@/lib/operativa-mappers";
import { useClubModulePermissions } from "@/hooks/use-club-module-permissions";

// DATA MAESTRA DE LA TEMPORADA (SEPT - JUN)
const MONTHS = [
  { id: "sept", label: "SEPTIEMBRE", weeks: 4 },
  { id: "oct", label: "OCTUBRE", weeks: 4 },
  { id: "nov", label: "NOVIEMBRE", weeks: 5 },
  { id: "dec", label: "DICIEMBRE", weeks: 4 },
  { id: "jan", label: "ENERO", weeks: 4 },
  { id: "feb", label: "FEBRERO", weeks: 4 },
  { id: "mar", label: "MARZO", weeks: 5 },
  { id: "apr", label: "ABRIL", weeks: 4 },
  { id: "may", label: "MAYO", weeks: 4 },
  { id: "jun", label: "JUNIO", weeks: 4 },
];

const MOCK_ROSTER = [
  { id: "p1", name: "LUCAS GARCÍA", number: 10 },
  { id: "p2", name: "MARC SOLER", number: 1 },
  { id: "p3", name: "ELENA ROSSI", number: 9 },
  { id: "p4", name: "SOFÍA MENDES", number: 4 },
  { id: "p5", name: "JUAN PÉREZ", number: 5 },
  { id: "p6", name: "CARLOS RUIZ", number: 7 },
  { id: "p7", name: "MIGUEL ÁNGEL", number: 8 },
  { id: "p8", name: "LAURA SÁNCHEZ", number: 6 },
];

const PLAYER_STORAGE_KEY = "synq_players";

function safeReadSynqPlayers(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseTeamNameForPlayers(teamName: string): { category?: string; teamSuffix?: string } {
  const parts = String(teamName || "")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (parts.length < 2) return { category: teamName };
  const last = parts[parts.length - 1]?.toUpperCase();
  if (!["A", "B", "C", "D"].includes(last)) return { category: teamName };
  const category = parts.slice(0, -1).join(" ");
  return { category, teamSuffix: last };
}

// MOCK DE EQUIPOS DEL CLUB CON ASIGNACIÓN DE ETAPA
const CLUB_TEAMS = [
  { id: "t1", name: "Infantil A", type: "F11", stage: "Infantil", days: ["L", "M", "X"] },
  { id: "t2", name: "Alevín B", type: "F7", stage: "Alevín", days: ["M", "J"] },
  { id: "t3", name: "Cadete C", type: "F11", stage: "Cadete", days: ["L", "X", "V"] },
  { id: "t4", name: "Primer Equipo", type: "F11", stage: "Rendimiento", days: ["L", "M", "X", "J", "V"] },
  { id: "t5", name: "Debutantes A", type: "F7", stage: "Debutantes", days: ["L", "X"] },
];

// MOCK DE SOLICITUDES DE CAMBIO
const INITIAL_REQUESTS = [
  {
    id: "req1",
    teamId: "t1",
    mcc: "OCT_W2",
    session: "1",
    blockKey: "central",
    original: "Rondo 4x4",
    proposed: "Posesión 5x5 + 2",
    reason: "Falta de intensidad detectada",
    status: "Pending",
    coach: "Carlos Ruiz",
    createdAt: new Date().toISOString(),
  },
];

type BlockKey = "warmup" | "central" | "cooldown";

type SessionBlockSuggestionArgs = {
  proposedExerciseKey?: string;
  proposedTitle?: string;
  reason: string;
};

type ExerciseChoice = {
  key: string;
  title: string;
  stage?: string;
};

type SessionPlannerAssignment = {
  id: string;
  teamId: string;
  mcc: string; // e.g. OCT_W2
  session: string; // "1".."N"
  blockKey: BlockKey;
  exerciseKey?: string;
  exerciseTitle?: string;
  updatedAt: string;
};

type ChangeRequestStatus = "Pending" | "Approved" | "Denied";

type ChangeRequest = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: BlockKey;
  originalExerciseKey?: string;
  original: string;
  proposedExerciseKey?: string;
  proposed: string;
  reason: string;
  status: ChangeRequestStatus;
  coach: string;
  createdAt: string;
  directorComment?: string;
  processedAt?: string;
};

function toAttendanceLegacyKey(teamId: string, mcc: string, session: string): string {
  return `${teamId}_${mcc}_S${session}`;
}

type SessionPlannerPersistedState = {
  version: 1;
  assignments: SessionPlannerAssignment[];
  changeRequests: ChangeRequest[];
  updatedAt: string;
  seasonRange?: {
    startDate?: string; // YYYY-MM-DD
    endDate?: string; // YYYY-MM-DD
  };
  attendance?: Record<string, Record<string, string>>;
};

const STORAGE_SESSION_PLANNER_PREFIX = "synq_methodology_session_planner_v1";
const LEAD_TIME_DAYS = 7;
const STORAGE_METHODOLOGY_LIBRARY_DRAFTS = "synq_methodology_library_drafts";
type HybridSyncState = "remote_ok" | "remote_forbidden" | "remote_error" | "local_only";

function safeParseJsonArray<T>(raw: string | null): T[] {
  try {
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function mccIdToStartDate(mccId: string): Date | null {
  return mccIdToStartDateWithSeason(mccId, null);
}

function mccIdToWeekIndex(mccId: string): number | null {
  // MCC format: {MONTH}_W{n}, ejemplo: OCT_W2
  const m = mccId.match(/^([A-Z]+)_W(\d+)$/i);
  if (!m) return null;
  const monthToken = m[1].toLowerCase();
  const week = parseInt(m[2], 10);
  if (!Number.isFinite(week) || week < 1) return null;

  const monthDef = MONTHS.find((x) => x.id.toLowerCase() === monthToken);
  if (!monthDef) return null;

  let offset = 0;
  for (const mm of MONTHS) {
    if (mm.id === monthDef.id) break;
    offset += mm.weeks;
  }
  return offset + (week - 1);
}

const DAY_MS = 1000 * 60 * 60 * 24;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function mccIdToStartDateWithSeason(mccId: string, seasonStartDate: Date | null): Date | null {
  const weekIndex = mccIdToWeekIndex(mccId);
  if (weekIndex === null) return null;

  if (seasonStartDate && !Number.isNaN(seasonStartDate.getTime())) {
    return addDays(seasonStartDate, weekIndex * 7);
  }

  // Fallback aproximado (si no has configurado inicio real)
  // Temporada típica: Sep..Jun.
  const m = mccId.match(/^([A-Z]+)_W(\d+)$/i);
  if (!m) return null;
  const monthToken = m[1].toLowerCase();
  const week = parseInt(m[2], 10);
  if (!Number.isFinite(week) || week < 1) return null;

  const monthNumberByToken: Record<string, number> = {
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
  };

  const monthNumber = monthNumberByToken[monthToken];
  if (monthNumber === undefined) return null;

  const now = new Date();
  const seasonStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(seasonStartYear, monthNumber, 1 + (week - 1) * 7);
}

function formatDateEs(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function canRequestForSessionDate(sessionDate: Date | null): boolean {
  if (!sessionDate) return true;
  const ms = sessionDate.getTime() - Date.now();
  const days = ms / DAY_MS;
  return days >= LEAD_TIME_DAYS;
}

function getAttendanceSessionKeys(
  teamId: string,
  mcc: string,
  sessionIndex: string,
  sessionMeta: { dayCode?: string; date?: Date } | null,
): { newKey: string; legacyKey: string } {
  const legacyKey = `${teamId}_${mcc}_S${sessionIndex}`;
  const dayCode = sessionMeta?.dayCode ?? "NA";
  const dateStr = sessionMeta?.date ? sessionMeta.date.toISOString().slice(0, 10) : "unknown";
  const newKey = `${teamId}_${mcc}_S${sessionIndex}_${dayCode}_${dateStr}`;
  return { newKey, legacyKey };
}

function dateToInputValue(d: Date): string {
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

const DAY_ORDER = ["L", "M", "X", "J", "V", "S", "D"] as const;
type DayCode = (typeof DAY_ORDER)[number];

function normalizeDayCodes(input: unknown): DayCode[] {
  if (!Array.isArray(input)) return [];
  const set = new Set(
    input.filter((d): d is DayCode => typeof d === "string" && DAY_ORDER.includes(d as DayCode)),
  );
  return DAY_ORDER.filter((d) => set.has(d));
}

function categoryNameToStage(categoryName: string): string {
  if (!categoryName) return categoryName;
  // Alinea nomenclatura con la biblioteca metodológica.
  if (categoryName === "Primer Equipo") return "Senior";
  return categoryName;
}

function buildClubTeamsFromAcademyCategories(categories: any[]): Array<(typeof CLUB_TEAMS)[number]> {
  const out: Array<(typeof CLUB_TEAMS)[number]> = [];
  if (!Array.isArray(categories)) return out;

  for (const cat of categories) {
    const catId = typeof cat?.id === "string" ? cat.id : "cat";
    const catName = typeof cat?.name === "string" ? cat.name : "";
    const stage = categoryNameToStage(catName);
    const teams = Array.isArray(cat?.teams) ? cat.teams : [];

    teams.forEach((team: any, idx: number) => {
      const suffix = typeof team?.suffix === "string" ? team.suffix : `T${idx + 1}`;
      out.push({
        id: `${catId}-${suffix}-${idx}`,
        name: `${team?.name ?? catName} ${suffix}`.trim(),
        type: team?.type ?? "f11",
        stage,
        days: normalizeDayCodes(team?.days),
      });
    });
  }

  // Si no hay datos de Academy, devolvemos fallback del prototipo.
  return out.length ? out : CLUB_TEAMS;
}

function resolveDefaultExerciseByBlock(
  stageExercises: ExerciseChoice[],
  blockKey: BlockKey,
): ExerciseChoice | null {
  if (!stageExercises.length) return null;
  const titles = stageExercises.map((e) => ({
    ...e,
    t: (e.title ?? "").toLowerCase(),
  }));

  const pickByKeywords = (keywords: string[]) => {
    for (const ex of titles) {
      if (keywords.some((k) => ex.t.includes(k))) return ex;
    }
    return null;
  };

  if (blockKey === "warmup") {
    const found = pickByKeywords(["calent", "activ", "prepar", "activación", "activacion"]);
    return found ?? stageExercises[0];
  }

  if (blockKey === "cooldown") {
    const found = pickByKeywords(["vuelta", "estir", "recuper", "calma"]);
    return found ?? stageExercises[0];
  }

  // central
  return stageExercises[0];
}

function readMethodologyDraftExercises(): ExerciseChoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_METHODOLOGY_LIBRARY_DRAFTS) || "[]") as any[];
    const arr = Array.isArray(raw) ? raw : [];
    return arr
      .filter((e) => e && typeof e === "object" && typeof e.id === "string")
      .map((e, i) => ({
        key: `draft-${e.id ?? i}`,
        title: typeof e.title === "string" && e.title.trim() ? e.title : `Draft #${i + 1}`,
        stage: typeof e.stage === "string" ? e.stage : undefined,
      }));
  } catch {
    return [];
  }
}

export default function SessionPlannerPage() {
  const { profile, user, session } = useAuth();
  const { toast } = useToast();
  const plannerPerm = useClubModulePermissions("planner");
  const isPlannerElevated = profile?.role === "superadmin" || profile?.role === "club_admin";
  const canEditPlanner = isPlannerElevated || plannerPerm.canEdit;
  const canDeletePlanner = isPlannerElevated || plannerPerm.canDelete;

  // MODO PROTOTIPO: Switch de Rol para testing
  const [viewRole, setViewRole] = useState<"director" | "coach">("director");

  const clubScopeId = profile?.clubId ?? "global-hq";
  const storageKey = `${STORAGE_SESSION_PLANNER_PREFIX}_${clubScopeId}`;
  const { canUseSupabase, loadSnapshot } = useOperativaSync(clubScopeId);
  const academyCategoriesStorageKey = `synq_academy_categories_v1_${clubScopeId}`;

  const [clubTeams, setClubTeams] = useState(CLUB_TEAMS);

  const defaultSeasonRange = useMemo(() => {
    const now = new Date();
    const seasonStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const start = new Date(seasonStartYear, 8, 1); // 1 Sept
    const end = new Date(seasonStartYear + 1, 5, 30); // 30 Jun
    return {
      startDate: dateToInputValue(start),
      endDate: dateToInputValue(end),
    };
  }, []);
  
  const [selectedTeam, setSelectedTeam] = useState(CLUB_TEAMS[0].id);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [activeSessionInWeek, setActiveSessionInWeek] = useState("1");
  const [changeRequests, setRequests] = useState<ChangeRequest[]>(INITIAL_REQUESTS as ChangeRequest[]);
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<SessionPlannerAssignment[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
  const [seasonRange, setSeasonRange] = useState<{ startDate: string; endDate: string }>(defaultSeasonRange);
  const [syncState, setSyncState] = useState<HybridSyncState>("local_only");

  const seasonStartDate = useMemo(() => {
    if (!seasonRange.startDate) return null;
    const d = new Date(seasonRange.startDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [seasonRange.startDate]);

  const seasonEndDate = useMemo(() => {
    if (!seasonRange.endDate) return null;
    const d = new Date(seasonRange.endDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [seasonRange.endDate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadPlanner = async () => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SessionPlannerPersistedState>;
          const nextAssignments = Array.isArray(parsed?.assignments) ? parsed.assignments : [];
          const nextRequests = Array.isArray(parsed?.changeRequests) ? parsed.changeRequests : INITIAL_REQUESTS;
          setAssignments(nextAssignments as SessionPlannerAssignment[]);
          setRequests(nextRequests as ChangeRequest[]);
          const nextSeason = parsed?.seasonRange;
          if (nextSeason?.startDate && nextSeason?.endDate) {
            setSeasonRange({
              startDate: nextSeason.startDate,
              endDate: nextSeason.endDate,
            });
          }
          const nextAttendance = parsed?.attendance;
          if (nextAttendance && typeof nextAttendance === "object") {
            setAttendance(nextAttendance as Record<string, Record<string, string>>);
          }
        }
      } catch {
        setAssignments([]);
        setRequests(INITIAL_REQUESTS as ChangeRequest[]);
      }

      if (!canUseSupabase) return;
      const snapshot = await loadSnapshot();
      if (snapshot.assignments.length > 0) {
        setAssignments(
          mapOperativaAssignmentsToUi(snapshot.assignments).map((x) => ({
            ...x,
            blockKey: x.blockKey as BlockKey,
            updatedAt: x.updatedAt ?? new Date().toISOString(),
          })),
        );
      }
      if (Object.keys(snapshot.attendance).length > 0) {
        const normalized: Record<string, Record<string, string>> = {};
        Object.entries(snapshot.attendance).forEach(([legacyKey, players]) => {
          normalized[legacyKey] = players;
        });
        setAttendance((prev) => ({ ...prev, ...normalized }));
      }
      if (snapshot.requests.length > 0) {
        setRequests(
          mapOperativaRequestsToUi(snapshot.requests).map((x) => ({
            ...x,
            blockKey: x.blockKey as BlockKey,
            status: x.status as ChangeRequestStatus,
            original: x.original ?? "",
          })),
        );
      }
      setSyncState("remote_ok");
    };
    void loadPlanner().catch(() => {
      setSyncState(canUseSupabase ? "remote_error" : "local_only");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, canUseSupabase, clubScopeId, loadSnapshot]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload: SessionPlannerPersistedState = {
        version: 1,
        assignments,
        changeRequests,
        seasonRange,
        attendance,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [assignments, changeRequests, seasonRange, attendance, storageKey]);

  // Importar equipos/días creados en "Academy/Cantera" (localStorage).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const load = async () => {
        // 1) Supabase (si disponible)
        if (canUseSupabase && session?.access_token) {
          try {
            const res = await fetch("/api/club/methodology-academy", {
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (res.status === 403) {
              setSyncState("remote_forbidden");
              return;
            }
            if (res.ok) {
              const json = (await res.json()) as { ok?: boolean; payload?: any };
              const payload = json?.payload;
              if (Array.isArray(payload)) {
                localStorage.setItem(academyCategoriesStorageKey, JSON.stringify(payload));
                const nextTeams = buildClubTeamsFromAcademyCategories(payload);
                if (!nextTeams.length) return;
                setClubTeams(nextTeams);
                if (!nextTeams.some((t) => t.id === selectedTeam)) setSelectedTeam(nextTeams[0].id);
                setSyncState("remote_ok");
                return;
              }
            }
          } catch {
            setSyncState("remote_error");
          }
        }

        // 2) Fallback local
        const raw = localStorage.getItem(academyCategoriesStorageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const nextTeams = buildClubTeamsFromAcademyCategories(parsed);
        if (!nextTeams.length) return;
        setClubTeams(nextTeams);
        if (!nextTeams.some((t) => t.id === selectedTeam)) setSelectedTeam(nextTeams[0].id);
      };

      void load();
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academyCategoriesStorageKey, canUseSupabase, session?.access_token]);

  // En dispositivos pequeños/antiguos evitamos la matriz horizontal anual.
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [tvMode, setTvMode] = useState(false);
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      setIsCompactLayout(window.innerWidth < 1024);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("synq_tv_mode_session_planner");
      setTvMode(raw === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("synq_tv_mode_session_planner", tvMode ? "1" : "0");
  }, [tvMode]);

  const isCompact = isCompactLayout || tvMode;

  const attendancePlayers = useMemo(() => {
    const team = clubTeams.find((t) => t.id === selectedTeam);
    const parsed = parseTeamNameForPlayers(team?.name || "");
    const all = safeReadSynqPlayers();
    const filtered = all.filter((p: any) => {
      if (!parsed.category || !parsed.teamSuffix) return false;
      return p?.category === parsed.category && p?.teamSuffix === parsed.teamSuffix && p?.status !== "Deleted";
    });

    const mapped = filtered.map((p: any) => ({
      id: String(p.id),
      name: `${p.name ?? ""} ${p.surname ?? ""}`.trim().toUpperCase(),
      number: p.number ?? "00",
    }));

    // Fallback: cuando no hay datos reales (primer arranque del prototipo)
    return mapped.length ? mapped : MOCK_ROSTER;
  }, [clubTeams, selectedTeam]);

  const attendanceKeys = useMemo(() => {
    if (!selectedMCC) return null;
    // Evitamos usar `activeSessionMeta` aquí: en este fichero se inicializa después
    // y en runtime puede causar "Cannot access ... before initialization".
    // Con `null` el helper usa defaults ('NA' y 'unknown') y mantenemos unicidad
    // por `S{sessionIndex}` (SES_1..SES_N) para que la asistencia sea por sesión.
    return getAttendanceSessionKeys(selectedTeam, selectedMCC, activeSessionInWeek, null);
  }, [selectedTeam, selectedMCC, activeSessionInWeek]);

  const allMccOptions = useMemo(() => {
    const out: Array<{ id: string; label: string }> = [];
    for (const m of MONTHS) {
      for (let i = 0; i < m.weeks; i++) {
        const id = `${m.id.toUpperCase()}_W${i + 1}`;
        out.push({ id, label: `${m.label} W${i + 1}` });
      }
    }
    return out;
  }, []);

  useEffect(() => {
    if (!isCompact) return;
    if (selectedMCC) return;
    if (allMccOptions.length > 0) setSelectedMCC(allMccOptions[0].id);
  }, [allMccOptions, isCompact, selectedMCC]);

  // Inicializar asistencia por defecto
  useEffect(() => {
    if (!attendanceKeys) return;
    const { newKey, legacyKey } = attendanceKeys;
    const legacy = attendance[legacyKey] || {};
    const current = attendance[newKey] || legacy || {};
    const missing = attendancePlayers.filter((p) => !current[p.id]);
    if (missing.length === 0) return;
    const patch = Object.fromEntries(missing.map((p) => [p.id, "present"]));
    setAttendance((prev) => ({
      ...prev,
      [newKey]: { ...(prev[newKey] || legacy || {}), ...patch },
    }));
  }, [attendanceKeys, attendance, attendancePlayers]);

  const toggleAttendance = (playerId: string) => {
    if (!attendanceKeys) return;
    const { newKey, legacyKey } = attendanceKeys;
    const current = attendance[newKey] || attendance[legacyKey] || {};
    const status = current[playerId];
    const nextStatus = status === 'present' ? 'absent' : status === 'absent' ? 'late' : 'present';
    
    setAttendance(prev => ({
      ...prev,
      [newKey]: { ...current, [playerId]: nextStatus }
    }));
    if (canUseSupabase && selectedMCC) {
      void upsertOperativaAttendance({
        clubId: clubScopeId,
        teamId: selectedTeam,
        mcc: selectedMCC,
        session: activeSessionInWeek,
        playerId,
        status: nextStatus as "present" | "absent" | "late",
        updatedBy: user?.id ?? null,
      });
    }
  };

  const currentSessionAttendance = useMemo(() => {
    if (!attendanceKeys) return {};
    return attendance[attendanceKeys.newKey] || attendance[attendanceKeys.legacyKey] || {};
  }, [attendance, attendanceKeys]);

  // CONFIGURACIÓN DE TIEMPOS DE SESIÓN
  const [sessionTimes, setSessionTimes] = useState({
    warmup: 10,
    central: 45,
    cooldown: 5
  });

  const totalTime = useMemo(() => 
    sessionTimes.warmup + sessionTimes.central + sessionTimes.cooldown
  , [sessionTimes]);

  const currentTeam = useMemo(
    () => clubTeams.find((t) => t.id === selectedTeam),
    [clubTeams, selectedTeam],
  );

  useEffect(() => {
    if (currentTeam?.days?.length) {
      setSessionsPerWeek(currentTeam.days.length);
    }
  }, [currentTeam?.id]);

  const methodologyExercises = useMemo((): ExerciseChoice[] => {
    const official = readMethodologyNeural().map((e) => ({
      key: e.key,
      title: e.title,
      stage: e.stage,
    }));
    const drafts = readMethodologyDraftExercises();
    // MVP: desduplicamos por `key`.
    const byKey = new Map<string, ExerciseChoice>();
    for (const ex of [...official, ...drafts]) {
      byKey.set(ex.key, ex);
    }
    return Array.from(byKey.values());
  }, []);

  const stageExercises = useMemo(() => {
    const stage = currentTeam?.stage;
    if (!stage) return methodologyExercises;
    const filtered = methodologyExercises.filter((e) => e.stage === stage);
    return filtered.length ? filtered : methodologyExercises;
  }, [methodologyExercises, currentTeam?.stage]);

  const selectedMccDates = useMemo(() => {
    if (!selectedMCC) return null;
    const start = mccIdToStartDateWithSeason(selectedMCC, seasonStartDate);
    if (!start) return null;
    const end = addDays(start, 6);
    return { start, end };
  }, [selectedMCC, seasonStartDate]);

  const selectedMccSessionDates = useMemo(() => {
    if (!selectedMccDates?.start) return [];
    const days = (currentTeam?.days ?? []).slice(0, sessionsPerWeek);
    if (!days.length) return [];

    const jsDowByCode: Record<string, number> = {
      D: 0, // Domingo
      L: 1, // Lunes
      M: 2, // Martes
      X: 3, // Miércoles
      J: 4, // Jueves
      V: 5, // Viernes
      S: 6, // Sábado
    };

    const items: Array<{ dayCode: string; dayLabel: string; date: Date }> = [];
    const dayLabel: Record<string, string> = {
      D: "Dom",
      L: "Lun",
      M: "Mar",
      X: "Mié",
      J: "Jue",
      V: "Vie",
      S: "Sáb",
    };

    for (const code of days) {
      const targetDow = jsDowByCode[code];
      if (targetDow === undefined) continue;
      // Buscamos el primer día dentro del microciclo que coincida con el dayCode.
      let found: Date | null = null;
      for (let offset = 0; offset < 7; offset++) {
        const d = addDays(selectedMccDates.start, offset);
        if (d.getDay() === targetDow) {
          found = d;
          break;
        }
      }
      if (found) {
        items.push({ dayCode: code, dayLabel: dayLabel[code] || code, date: found });
      }
    }

    // Orden por fecha real dentro del microciclo.
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedMccDates?.start, currentTeam?.days, sessionsPerWeek]);

  const activeSessionMeta = useMemo(() => {
    const idx = parseInt(activeSessionInWeek, 10) - 1;
    return selectedMccSessionDates[idx] || null;
  }, [activeSessionInWeek, selectedMccSessionDates]);

  const resolveAssignment = (
    teamId: string,
    mcc: string,
    session: string,
    blockKey: BlockKey,
  ): { exerciseKey?: string; exerciseTitle?: string } => {
    const found = assignments.find(
      (a) =>
        a.teamId === teamId &&
        a.mcc === mcc &&
        a.session === session &&
        a.blockKey === blockKey,
    );
    if (found?.exerciseTitle) return { exerciseKey: found.exerciseKey, exerciseTitle: found.exerciseTitle };
    const fallback = resolveDefaultExerciseByBlock(stageExercises, blockKey);
    return { exerciseKey: fallback?.key, exerciseTitle: fallback?.title };
  };

  const setAssignment = (
    teamId: string,
    mcc: string,
    session: string,
    blockKey: BlockKey,
    exerciseKey: string | undefined,
    exerciseTitle: string | undefined,
  ) => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede modificar asignaciones (matriz del club).",
      });
      return;
    }
    const now = new Date().toISOString();
    const assignmentId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `as-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setAssignments((prev) => {
      const idx = prev.findIndex(
        (a) =>
          a.teamId === teamId &&
          a.mcc === mcc &&
          a.session === session &&
          a.blockKey === blockKey,
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          exerciseKey,
          exerciseTitle,
          updatedAt: now,
        };
        return next;
      }
      return [
        ...prev,
        {
          id: assignmentId,
          teamId,
          mcc,
          session,
          blockKey,
          exerciseKey,
          exerciseTitle,
          updatedAt: now,
        },
      ];
    });
    if (canUseSupabase) {
      void upsertOperativaAssignment({
        clubId: clubScopeId,
        id: assignmentId,
        teamId,
        mcc,
        session,
        blockKey,
        exerciseKey,
        exerciseTitle: exerciseTitle ?? "",
        updatedBy: user?.id ?? null,
      });
    }
  };

  const clearAssignment = (
    teamId: string,
    mcc: string,
    session: string,
    blockKey: BlockKey,
  ) => {
    if (!canDeletePlanner) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede desasignar ejercicios (matriz del club).",
      });
      return;
    }
    setAssignments((prev) =>
      prev.filter(
        (a) =>
          !(
            a.teamId === teamId &&
            a.mcc === mcc &&
            a.session === session &&
            a.blockKey === blockKey
          ),
      ),
    );
    if (canUseSupabase) {
      void deleteOperativaAssignment({ clubId: clubScopeId, teamId, mcc, session, blockKey });
    }
  };

  const canRequestChange = (mcc: string) => {
    const start = mccIdToStartDateWithSeason(mcc, seasonStartDate);
    if (!start) return true;
    const ms = start.getTime() - Date.now();
    const days = ms / (1000 * 60 * 60 * 24);
    return days >= LEAD_TIME_DAYS;
  };

  const handleMCCClic = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
    setActiveSessionInWeek("1");
  };

  const handleSaveConfig = () => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede guardar la configuración del planificador (matriz del club).",
      });
      return;
    }
    toast({
      title: "MATRIZ_SINCRO_EXITOSA",
      description: `Protocolo de tiempos (${totalTime} min) aplicado a ${currentTeam?.name}.`,
    });
    setSelectedMCC(null);
  };

  const buildSeasonPlannerPdfPayload = () => {
    return {
      version: 1,
      clubScopeId,
      seasonRange,
      sessionTimes,
      team: currentTeam ? { id: currentTeam.id, name: currentTeam.name, stage: currentTeam.stage, type: currentTeam.type } : null,
      assignments,
      changeRequests,
      selectedMCC,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleDownloadSeasonPdf = () => {
    try {
      localStorage.setItem(
        "synq_session_planner_pdf_payload_v1",
        JSON.stringify(buildSeasonPlannerPdfPayload()),
      );
    } catch {
      // ignore
    }
    toast({
      title: "GENERANDO_PDF_TEMPORADA",
      description: "Preparando la exportación imprimible (usa 'Guardar como PDF' en el navegador).",
    });
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const handleProcessRequest = async (id: string, approve: boolean, directorComment?: string) => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede resolver solicitudes de cambio (matriz del club).",
      });
      return;
    }
    const req = changeRequests.find((r) => r.id === id);
    if (approve && req) {
      setAssignment(
        req.teamId,
        req.mcc,
        req.session,
        req.blockKey,
        req.proposedExerciseKey,
        req.proposed,
      );
    }
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: approve ? "Approved" : "Denied",
              directorComment: directorComment?.trim() || undefined,
              processedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
    setDecisionNotes((prev) => ({ ...prev, [id]: "" }));
    if (canUseSupabase) {
      await updateOperativaChangeRequestDecision({
        clubId: clubScopeId,
        id,
        status: approve ? "Approved" : "Denied",
        directorComment,
        directorId: user?.id ?? null,
      });
    }
    toast({
      title: approve ? "CAMBIO_AUTORIZADO" : "CAMBIO_DENEGADO",
      description: approve
        ? `${req?.mcc ?? ""} • SES_${req?.session ?? ""} • ${req?.blockKey?.toUpperCase?.() ?? ""} aplicado: ${req?.proposed ?? ""}`
        : `${req?.mcc ?? ""} • SES_${req?.session ?? ""} • ${req?.blockKey?.toUpperCase?.() ?? ""} rechazado (sin cambios en plan).`,
    });
  };

  const handleSendSuggestion = (args: {
    blockKey: BlockKey;
    proposedExerciseKey?: string;
    proposedTitle?: string;
    reason: string;
  }) => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "SIN_PERMISOS",
        description: "Tu rol no puede enviar sugerencias de cambio (matriz del club).",
      });
      return;
    }
    if (!selectedMCC) return;
    const { blockKey, proposedExerciseKey, proposedTitle, reason } = args;
    if (!reason.trim()) {
      toast({ variant: "destructive", title: "MOTIVO_REQUERIDO", description: "Escribe un motivo antes de enviar." });
      return;
    }
    if (!proposedTitle?.trim()) {
      toast({ variant: "destructive", title: "EJERCICIO_REQUERIDO", description: "Selecciona un ejercicio propuesto." });
      return;
    }

    const original = resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, blockKey);

    const reqId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const nextReq: ChangeRequest = {
      id: reqId,
      teamId: selectedTeam,
      mcc: selectedMCC,
      session: activeSessionInWeek,
      blockKey,
      originalExerciseKey: original.exerciseKey,
      original: original.exerciseTitle || "Sin asignación actual",
      proposedExerciseKey,
      proposed: proposedTitle,
      reason: reason.trim(),
      status: "Pending",
      coach: profile?.name || "Coach",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            r.teamId === nextReq.teamId &&
            r.mcc === nextReq.mcc &&
            r.session === nextReq.session &&
            r.blockKey === nextReq.blockKey &&
            r.status === "Pending"
          ),
      );
      return [nextReq, ...filtered];
    });

    if (canUseSupabase) {
      void upsertOperativaChangeRequest({
        id: reqId,
        clubId: clubScopeId,
        teamId: nextReq.teamId,
        mcc: nextReq.mcc,
        session: nextReq.session,
        blockKey: nextReq.blockKey,
        originalExercise: nextReq.original,
        proposedExercise: nextReq.proposed,
        reason: nextReq.reason,
        coachId: user?.id ?? null,
        coachName: nextReq.coach,
        originalExerciseKey: nextReq.originalExerciseKey ?? null,
        proposedExerciseKey: nextReq.proposedExerciseKey ?? null,
      });
    }

    toast({ title: "SOLICITUD_ENVIADA", description: "Tu solicitud queda pendiente de validación del director." });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-4 sm:p-6 lg:p-12">
      
      {/* MODO_SWITCH_PROTOTIPO */}
      <div className="flex justify-end gap-2 mb-4">
         <Badge
           variant="outline"
           className={cn(
             "text-[8px] font-black uppercase tracking-widest",
             syncState === "remote_ok"
               ? "border-emerald-500/30 text-emerald-400"
               : syncState === "remote_forbidden"
                 ? "border-rose-500/30 text-rose-400"
                 : syncState === "remote_error"
                   ? "border-primary/30 text-primary/80"
                   : "border-white/10 text-white/40"
           )}
         >
           {syncState === "remote_ok"
             ? "SYNC: REMOTO_OK"
             : syncState === "remote_forbidden"
               ? "SYNC: REMOTO_DENEGADO"
               : syncState === "remote_error"
                 ? "SYNC: REMOTO_ERROR (LOCAL)"
                 : "SYNC: SOLO_LOCAL"}
         </Badge>
         <Badge variant="outline" className="border-white/5 text-white/20 uppercase text-[8px] font-black mr-4">Preview_Role:</Badge>
        <button onClick={() => setViewRole("director")} className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", viewRole === 'director' ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(0,242,255,0.25)]' : 'bg-white/5 text-white/40 border-white/5')}>DIRECTOR_MODO</button>
        <button onClick={() => setViewRole("coach")} className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all", viewRole === 'coach' ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(0,242,255,0.25)]' : 'bg-white/5 text-white/40 border-white/5')}>COACH_MODO</button>
      </div>

      {/* HEADER DE MANDO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Operational_Planning_v5.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            PLANIFICADOR_MAESTRO
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">
            {viewRole === 'director' ? 'Terminal de Diseño Metodológico Central' : `Terminal Operativa: ${currentTeam?.name}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {viewRole === 'director' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Configuración de Nodo</span>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-[220px] h-12 bg-black border-primary/20 rounded-xl text-primary font-black uppercase text-[10px] tracking-widest focus:ring-primary/30">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f18] border-primary/20">
                    {clubTeams.map(team => (
                      <SelectItem key={team.id} value={team.id} className="text-[10px] font-black uppercase text-primary/80 focus:bg-primary focus:text-black">
                        {team.name} [{team.type}]
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-xl border-primary/20 text-primary hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest px-6">
                    <Settings2 className="h-4 w-4 mr-2" /> Estructura Sesión
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white sm:max-w-md">
                  <SheetHeader className="space-y-4 mb-10">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Arquitectura_Maestra</span>
                    </div>
                    <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none">CONFIG_ESTRUCTURA</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-8">
                    <div className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-2 text-center">
                       <p className="text-[9px] font-black uppercase text-white/20 tracking-widest">Duración Total Sesión</p>
                       <p className="text-5xl font-black text-primary italic tracking-tighter cyan-text-glow">
                        {totalTime} <span className="text-sm text-white/20">MIN</span>
                       </p>
                    </div>

                    <div className="space-y-4 p-5 bg-black/30 border border-white/5 rounded-3xl">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">
                          Temporada Real (Fechas)
                        </Label>
                        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                          Lead-Time
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Inicio</Label>
                        <Input
                          type="date"
                          value={seasonRange.startDate}
                          onChange={(e) =>
                            setSeasonRange((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                          className="h-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase focus:border-primary"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Fin</Label>
                        <Input
                          type="date"
                          value={seasonRange.endDate}
                          onChange={(e) =>
                            setSeasonRange((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                          className="h-12 bg-white/5 border-white/10 rounded-2xl text-white font-bold uppercase focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">1. Calentamiento / Activación</Label>
                          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{sessionTimes.warmup} min</Badge>
                        </div>
                        <Input 
                          type="range" min="5" max="30" step="5"
                          value={sessionTimes.warmup} 
                          onChange={(e) => setSessionTimes({...sessionTimes, warmup: parseInt(e.target.value)})}
                          className="accent-primary" 
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">2. Zona Central (Ejercicios)</Label>
                          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{sessionTimes.central} min</Badge>
                        </div>
                        <Input 
                          type="range" min="20" max="90" step="5"
                          value={sessionTimes.central} 
                          onChange={(e) => setSessionTimes({...sessionTimes, central: parseInt(e.target.value)})}
                          className="accent-primary" 
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest">3. Vuelta a la Calma</Label>
                          <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">{sessionTimes.cooldown} min</Badge>
                        </div>
                        <Input 
                          type="range" min="5" max="20" step="5"
                          value={sessionTimes.cooldown} 
                          onChange={(e) => setSessionTimes({...sessionTimes, cooldown: parseInt(e.target.value)})}
                          className="accent-primary" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Frecuencia Semanal</Label>
                      <Select value={sessionsPerWeek.toString()} onValueChange={(v) => setSessionsPerWeek(parseInt(v))}>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white font-bold uppercase text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-primary/20">
                          {[1,2,3,4,5,6,7].map(n => (
                            <SelectItem key={n} value={n.toString()} className="text-[10px] font-black uppercase">{n} Días / Semana</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-12">
                    <Button
                      onClick={handleSaveConfig}
                      disabled={!canEditPlanner}
                      className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl cyan-glow disabled:opacity-40"
                    >
                      GUARDAR_PROTOCOLO
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest">MODO_LECTURA_OPERATIVA</p>
                  <p className="text-[8px] font-bold text-white/40 uppercase italic">Diseño bloqueado por Metodología</p>
               </div>
            </div>
          )}

          <Button
            type="button"
            onClick={() => setTvMode((v) => !v)}
            className={cn(
              "h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border-none",
              tvMode ? "bg-primary text-black" : "bg-black/40 text-white/60 hover:bg-white/5",
            )}
          >
            {tvMode ? "Modo TV: ON" : "Modo TV: OFF"}
          </Button>
          <Button
            type="button"
            onClick={handleDownloadSeasonPdf}
            className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl cyan-glow hover:scale-105 transition-all border-none"
          >
            <Download className="h-4 w-4 mr-2" /> PDF Temporada
          </Button>
        </div>
      </div>

      {/* DASHBOARD DE VALIDACIONES PARA EL DIRECTOR */}
      {viewRole === 'director' && changeRequests.filter(r => r.status === 'Pending').length > 0 && (
        <div className="animate-in slide-in-from-top-4 duration-700">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-6 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><History className="h-20 w-20 text-primary" /></div>
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">SOLICITUDES_DE_CAMBIO_PENDIENTES</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {changeRequests.filter(r => r.status === 'Pending').map(req => (
                  <div key={req.id} className="p-5 bg-black/60 border border-white/5 rounded-2xl space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-white uppercase italic">{req.coach}</p>
                           <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{req.teamId} • {req.mcc} • SES_{req.session} • {req.blockKey}</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black">PENDIENTE</Badge>
                     </div>
                     <div className="p-3 bg-white/5 rounded-xl space-y-2 border border-white/5">
                        <div className="flex items-center gap-2">
                           <X className="h-3 w-3 text-rose-500" />
                           <span className="text-[9px] font-bold text-white/40 uppercase line-through">{req.original}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Check className="h-3 w-3 text-emerald-500" />
                           <span className="text-[9px] font-bold text-emerald-400 uppercase italic">{req.proposed}</span>
                        </div>
                     </div>
                     <p className="text-[8px] text-white/20 italic">"{req.reason}"</p>
                     <Input
                       value={decisionNotes[req.id] ?? ""}
                       onChange={(e) =>
                         setDecisionNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                       }
                       placeholder="Comentario del director (opcional)"
                       className="h-8 bg-black/40 border-white/10 text-[9px] font-bold text-white/80"
                     />
                     <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleProcessRequest(req.id, true, decisionNotes[req.id])}
                          disabled={!canEditPlanner}
                          className="flex-1 h-8 bg-emerald-500 text-black text-[8px] font-black uppercase rounded-lg"
                        >
                          APROBAR
                        </Button>
                        <Button
                          onClick={() => handleProcessRequest(req.id, false, decisionNotes[req.id])}
                          disabled={!canEditPlanner}
                          variant="ghost"
                          className="flex-1 h-8 border border-white/5 text-white/40 text-[8px] font-black uppercase rounded-lg"
                        >
                          RECHAZAR
                        </Button>
                     </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      )}

      {/* PLANIFICACIÓN COMPACTA (Mobile/Tablet) + Forzado TV_MODE */}
      {isCompact && (
        <div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-primary/10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60">
                    Operativa
                  </span>
                </div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {currentTeam?.name}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                  MCC semanal (microciclo real)
                </p>
                {selectedMccDates && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                    {formatDateEs(selectedMccDates.start)} - {formatDateEs(selectedMccDates.end)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-black/30 text-primary text-[9px] font-black uppercase hidden sm:flex"
                >
                  {sessionsPerWeek} DÍAS/SEM
                </Badge>
                <Button
                  onClick={() => setIsAttendanceOpen(true)}
                  disabled={!canEditPlanner}
                  className="h-9 bg-primary text-black font-black uppercase text-[8px] tracking-widest px-3 rounded-xl shadow-[0_0_18px_rgba(0,242,255,0.25)] hover:scale-105 transition-all border-none disabled:opacity-40"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" /> Asistencia
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                Semana / MCC
              </Label>
              <Select value={selectedMCC ?? undefined} onValueChange={(v) => setSelectedMCC(v)}>
                <SelectTrigger className="h-12 bg-black/30 border-primary/20 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-xl">
                  {allMccOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id} className="text-[10px] font-black uppercase">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {viewRole === "coach" &&
              selectedMCC &&
              !canRequestForSessionDate(activeSessionMeta?.date) && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">
                  Protocolo Inmutable: bloqueo por lead-time (&lt; 7 días)
                </p>
              </div>
            )}

            <div className="space-y-4">
              <SessionBlock
                title="1. Calentamiento / Activación"
                time={sessionTimes.warmup}
                icon={Flame}
                color="orange"
                role={viewRole}
                canRequest={selectedMCC ? canRequestForSessionDate(activeSessionMeta?.date) : false}
                blockKey="warmup"
                sessionMeta={activeSessionMeta}
                exerciseOptions={stageExercises}
                assignedExercise={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup").exerciseTitle
                    : undefined
                }
                assignedExerciseKey={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup").exerciseKey
                    : undefined
                }
                onClearAssignment={
                  selectedMCC
                    ? () => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup")
                    : undefined
                }
                onAssign={(exerciseKey: string, exerciseTitle: string) => {
                  if (!selectedMCC) return;
                  setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup", exerciseKey, exerciseTitle);
                }}
                onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "warmup" })}
                matrixCanEdit={canEditPlanner}
                matrixCanDelete={canDeletePlanner}
              />
              <SessionBlock
                title="2. Zona Central (Ejercicios)"
                time={sessionTimes.central}
                icon={Dumbbell}
                color="amber"
                role={viewRole}
                canRequest={selectedMCC ? canRequestForSessionDate(activeSessionMeta?.date) : false}
                blockKey="central"
                sessionMeta={activeSessionMeta}
                exerciseOptions={stageExercises}
                assignedExercise={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central").exerciseTitle
                    : undefined
                }
                assignedExerciseKey={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central").exerciseKey
                    : undefined
                }
                onClearAssignment={
                  selectedMCC
                    ? () => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central")
                    : undefined
                }
                onAssign={(exerciseKey: string, exerciseTitle: string) => {
                  if (!selectedMCC) return;
                  setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central", exerciseKey, exerciseTitle);
                }}
                onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "central" })}
                matrixCanEdit={canEditPlanner}
                matrixCanDelete={canDeletePlanner}
              />
              <SessionBlock
                title="3. Vuelta a la Calma"
                time={sessionTimes.cooldown}
                icon={Wind}
                color="blue"
                role={viewRole}
                canRequest={selectedMCC ? canRequestForSessionDate(activeSessionMeta?.date) : false}
                blockKey="cooldown"
                sessionMeta={activeSessionMeta}
                exerciseOptions={stageExercises}
                assignedExercise={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown").exerciseTitle
                    : undefined
                }
                assignedExerciseKey={
                  selectedMCC
                    ? resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown").exerciseKey
                    : undefined
                }
                onClearAssignment={
                  selectedMCC
                    ? () => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown")
                    : undefined
                }
                onAssign={(exerciseKey: string, exerciseTitle: string) => {
                  if (!selectedMCC) return;
                  setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown", exerciseKey, exerciseTitle);
                }}
                onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "cooldown" })}
                matrixCanEdit={canEditPlanner}
                matrixCanDelete={canDeletePlanner}
              />
            </div>
          </div>
        </Card>
        </div>
      )}

      {/* MATRIZ DE PLANIFICACIÓN (Desktop) */}
      {!isCompact && (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          
          <div className="bg-primary/15 px-10 py-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-black/20 rounded-xl flex items-center justify-center border border-white/20">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Temporada 2024 / 2025</span>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                  {viewRole === 'director' ? 'Protocolo Metodológico' : 'Mi Agenda Táctica'}: <span className="text-white/80">{currentTeam?.name}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Estado Plan</p>
                  <p className="text-xl font-black text-emerald-400 italic tracking-tighter uppercase">SINCRO_OK</p>
               </div>
               <div className="h-8 w-[1px] bg-white/10" />
               <div className="text-right">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Días Entreno</p>
                  <p className="text-xl font-black text-white italic tracking-tighter">{sessionsPerWeek} DÍAS</p>
               </div>
            </div>
          </div>

          <div className="bg-primary text-black px-10 py-4 flex items-center justify-between border-b border-white/10">
             <div className="flex items-center gap-3">
                <Layers className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-[0.5em]">MACROCICLO_OPERATIVO_ANUAL</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest italic">Septiembre - Junio</span>
                <Badge variant="outline" className="bg-black/10 border-black/20 text-black text-[8px] font-black">ETAPA: {currentTeam?.stage.toUpperCase()}</Badge>
             </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1800px] flex">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex-col group/month hover:bg-white/[0.01] transition-colors">
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-primary tracking-[0.3em] uppercase">{month.label}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {Array.from({ length: month.weeks }).map((_, i) => {
                      const mccId = `${month.id.toUpperCase()}_W${i+1}`;
                      const requestsForMcc = changeRequests.filter(
                        (r) => r.teamId === selectedTeam && r.mcc === mccId,
                      );
                      const hasPending = requestsForMcc.some((r) => r.status === "Pending");
                      const hasValidated = requestsForMcc.length > 0 && !hasPending;
                      
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleMCCClic(month.id, i + 1)}
                          className={cn(
                            "p-4 rounded-xl border transition-all cursor-pointer group/mcc relative overflow-hidden",
                            selectedMCC === mccId 
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,242,255,0.2)]" 
                              : hasPending 
                              ? "border-primary/40 bg-primary/5"
                              : hasValidated
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              selectedMCC === mccId
                                ? "text-primary"
                                : hasPending
                                ? "text-primary/80"
                                : hasValidated
                                ? "text-emerald-400"
                                : "text-white/20"
                            )}>MCC_{i + 1}</span>
                            {hasPending ? (
                              <ShieldAlert className="h-3 w-3 text-primary animate-pulse" />
                            ) : hasValidated ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <LayoutGrid className={cn("h-3 w-3", selectedMCC === mccId ? "text-primary" : "text-white/10")} />
                            )}
                          </div>
                          <p className={cn(
                            "text-[8px] font-bold uppercase",
                            selectedMCC === mccId
                              ? "text-white"
                              : hasPending
                              ? "text-primary/80"
                              : hasValidated
                              ? "text-emerald-300/80"
                              : "text-white/10"
                          )}>
                            {hasPending ? "Cambio pendiente" : hasValidated ? "Cambio validado" : `${sessionsPerWeek} Sesiones`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-primary/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary animate-pulse" /> Sincronización de Red: Óptima
            </span>
            <span>Protocolo de Validación v5.0 • Blindaje Metodológico Activo</span>
          </div>
        </Card>
      </div>
      )}

      {/* PANEL LATERAL DE DETALLE Y SOLICITUDES */}
      <Sheet open={!!selectedMCC && !isCompact} onOpenChange={(open) => !open && setSelectedMCC(null)}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col">
          {selectedMCC && (
            <>
              <div className="p-8 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-2 w-2 rounded-full animate-pulse", viewRole === 'director' ? 'bg-primary/80' : 'bg-primary')} />
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.4em]", "text-primary")}>
                      {viewRole === 'director' ? 'MCC_Design_Studio' : 'MCC_Operational_View'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">
                      Semana {selectedMCC}
                    </SheetTitle>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => setIsAttendanceOpen(true)}
                        disabled={!canEditPlanner}
                        className="h-10 bg-primary text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:scale-105 transition-all border-none disabled:opacity-40"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-2" /> Asistencia
                      </Button>
                      {selectedMccDates && (
                        <Badge
                          variant="outline"
                          className="border-white/10 text-white/40 uppercase text-[8px] font-black tracking-widest w-fit hidden sm:flex"
                        >
                          {formatDateEs(selectedMccDates.start)} - {formatDateEs(selectedMccDates.end)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest px-4 py-1.5 h-auto hidden sm:flex">
                        ETAPA: {currentTeam?.stage.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              {/* SELECTOR DE SESIÓN DENTRO DE LA SEMANA */}
              <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5">
                <Tabs value={activeSessionInWeek} onValueChange={setActiveSessionInWeek} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-black/40 border border-white/10 p-1 h-12 rounded-xl">
                    {selectedMccSessionDates.map((sd, i) => (
                      <TabsTrigger 
                        key={i} 
                        value={(i + 1).toString()}
                    className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                      >
                        SES_{i + 1} • {sd.dayLabel}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
                
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500" key={activeSessionInWeek}>
                  
                  {viewRole === 'coach' && !canRequestForSessionDate(activeSessionMeta?.date) && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4">
                       <ShieldAlert className="h-5 w-5 text-rose-500" />
                       <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Protocolo Inmutable: Sugerencia de cambio bloqueada (Lead-Time &lt; 7 días)</p>
                    </div>
                  )}

                  <div className="space-y-8">
                    <SessionBlock 
                      title="1. Calentamiento / Activación" 
                      time={sessionTimes.warmup} 
                      icon={Flame} 
                      color="orange" 
                      role={viewRole}
                      canRequest={canRequestForSessionDate(activeSessionMeta?.date)}
                      blockKey="warmup"
                      sessionMeta={activeSessionMeta}
                      exerciseOptions={stageExercises}
                      assignedExercise={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup").exerciseTitle}
                      assignedExerciseKey={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup").exerciseKey}
                      onClearAssignment={() => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup")}
                      onAssign={(exerciseKey: string, exerciseTitle: string) => {
                        setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "warmup", exerciseKey, exerciseTitle);
                      }}
                      onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "warmup" })}
                      matrixCanEdit={canEditPlanner}
                      matrixCanDelete={canDeletePlanner}
                    />
                    
                    <SessionBlock 
                      title="2. Zona Central (Ejercicios)" 
                      time={sessionTimes.central} 
                      icon={Dumbbell} 
                      color="amber" 
                      role={viewRole}
                      canRequest={canRequestForSessionDate(activeSessionMeta?.date)}
                      blockKey="central"
                      sessionMeta={activeSessionMeta}
                      exerciseOptions={stageExercises}
                      assignedExercise={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central").exerciseTitle}
                      assignedExerciseKey={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central").exerciseKey}
                      onClearAssignment={() => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central")}
                      onAssign={(exerciseKey: string, exerciseTitle: string) => {
                        setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "central", exerciseKey, exerciseTitle);
                      }}
                      onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "central" })}
                      matrixCanEdit={canEditPlanner}
                      matrixCanDelete={canDeletePlanner}
                    />

                    <SessionBlock 
                      title="3. Vuelta a la Calma" 
                      time={sessionTimes.cooldown} 
                      icon={Wind} 
                      color="blue" 
                      role={viewRole}
                      canRequest={canRequestForSessionDate(activeSessionMeta?.date)}
                      blockKey="cooldown"
                      sessionMeta={activeSessionMeta}
                      exerciseOptions={stageExercises}
                      assignedExercise={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown").exerciseTitle}
                      assignedExerciseKey={resolveAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown").exerciseKey}
                      onClearAssignment={() => clearAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown")}
                      onAssign={(exerciseKey: string, exerciseTitle: string) => {
                        setAssignment(selectedTeam, selectedMCC, activeSessionInWeek, "cooldown", exerciseKey, exerciseTitle);
                      }}
                      onSendSuggestion={(args: SessionBlockSuggestionArgs) => handleSendSuggestion({ ...args, blockKey: "cooldown" })}
                      matrixCanEdit={canEditPlanner}
                      matrixCanDelete={canDeletePlanner}
                    />
                  </div>
                </div>

                {(viewRole === 'director' || (viewRole === 'coach' && canRequestForSessionDate(activeSessionMeta?.date))) && (
                  <div className="pt-12 border-t border-white/5 space-y-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Library className="h-5 w-5 text-primary" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary italic">
                          Biblioteca por Etapa
                        </span>
                      </div>
                      <Badge variant="outline" className="border-white/10 text-white/40 uppercase text-[8px] font-black tracking-widest">
                        {currentTeam?.stage.toUpperCase()} • {stageExercises.length} tareas
                      </Badge>
                    </div>

                    <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2">
                      <p className="text-[10px] font-black uppercase text-white/50">
                        Asignación desde cada bloque
                      </p>
                      <p className="text-[9px] text-white/30">
                        {viewRole === "director"
                          ? "Usa el lápiz para elegir un ejercicio de la biblioteca para Warmup / Central / Cooldown."
                          : "Usa SUGERIR_CAMBIO para proponer un ejercicio al director (con motivo)."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5 flex gap-4">
                <SheetClose asChild>
                  <Button variant="ghost" className="flex-1 h-16 border border-white/10 text-white/40 font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white/5 transition-all">CERRAR</Button>
                </SheetClose>
                {viewRole === 'director' && (
                  <Button
                    onClick={handleSaveConfig}
                    disabled={!canEditPlanner}
                    className="flex-[2] h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl cyan-glow hover:scale-[1.02] transition-all disabled:opacity-40"
                  >
                    SINC_CAMBIOS_MAESTROS
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* PANEL INDEPENDIENTE DE ASISTENCIA */}
      <Sheet open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full animate-pulse bg-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Attendance_Master_Control</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Pasar Lista</SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-primary/40 tracking-widest text-left italic">
                {currentTeam?.name} • SESIÓN {activeSessionInWeek} • {activeSessionMeta?.dayLabel ?? ""} {activeSessionMeta ? formatDateEs(activeSessionMeta.date) : ""} • {selectedMCC}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {attendancePlayers.map(player => {
                const status = currentSessionAttendance[player.id] || 'present';
                return (
                  <div 
                    key={player.id}
                    onClick={() => toggleAttendance(player.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group overflow-hidden relative",
                      status === 'present' ? "bg-emerald-500/5 border-emerald-500/20" :
                      status === 'absent' ? "bg-rose-500/5 border-rose-500/20" :
                      "bg-primary/5 border-primary/20"
                    )}
                  >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                          "h-10 w-10 border rounded-xl flex items-center justify-center text-[11px] font-black italic",
                          status === 'present' ? "bg-black/40 border-emerald-500/30 text-emerald-400" :
                          status === 'absent' ? "bg-black/40 border-rose-500/30 text-rose-400" :
                          "bg-black/40 border-primary/30 text-primary/80"
                        )}>
                          {player.number}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white uppercase italic group-hover:cyan-text-glow transition-all">{player.name}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest",
                            status === 'present' ? "text-emerald-400/60" :
                            status === 'absent' ? "text-rose-400/60" :
                            "text-primary/60"
                          )}>
                            {status === 'present' ? 'SINCRO_OK' : status === 'absent' ? 'AUSENCIA' : 'RETRASO'}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {status === 'present' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in" />
                        ) : status === 'absent' ? (
                          <UserX className="h-5 w-5 text-rose-500 animate-in zoom-in" />
                        ) : (
                          <Clock className="h-5 w-5 text-primary animate-in zoom-in" />
                        )}
                      </div>
                      {status === 'present' && <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-black/60 border-t border-white/5">
            <Button 
              onClick={() => {
                toast({
                  title: "ASISTENCIA_GUARDADA",
                  description: "Registro actualizado para esta sesión (MCC + SES).",
                });
                setIsAttendanceOpen(false);
              }}
              disabled={!canEditPlanner}
              className="flex-1 h-16 bg-primary text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:scale-[1.02] transition-all border-none w-full disabled:opacity-40"
            >
              FINALIZAR_REGISTRO <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SessionBlock({
  title,
  time,
  icon: Icon,
  color,
  role,
  canRequest,
  assignedExercise,
  assignedExerciseKey,
  sessionMeta,
  blockKey,
  exerciseOptions,
  onClearAssignment,
  onAssign,
  onSendSuggestion,
  matrixCanEdit = true,
  matrixCanDelete = true,
}: any) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [reason, setReason] = useState("");
  const [proposedKey, setProposedKey] = useState<string>("");
  const [assignKey, setAssignKey] = useState<string>("");

  const colorClass =
    color === "orange"
      ? "text-orange-500 border-orange-500/20 bg-orange-500/10"
      : color === "amber"
        ? "text-primary border-primary/20 bg-primary/10"
        : "text-blue-500 border-blue-500/20 bg-blue-500/10";

  const opts: ExerciseChoice[] = Array.isArray(exerciseOptions) ? exerciseOptions : [];
  const proposedExercise = opts.find((e) => e.key === proposedKey);
  const assignExercise = opts.find((e) => e.key === assignKey);

  useEffect(() => {
    if (!showAssign) return;
    const initial = (assignedExerciseKey && opts.some((o) => o.key === assignedExerciseKey) && assignedExerciseKey) || opts[0]?.key || "";
    setAssignKey(initial);
  }, [showAssign, assignedExerciseKey, opts]);

  useEffect(() => {
    if (!showSuggest) return;
    const initial = (assignedExerciseKey && opts.some((o) => o.key === assignedExerciseKey) && assignedExerciseKey) || opts[0]?.key || "";
    setProposedKey(initial);
    setReason("");
  }, [showSuggest, assignedExerciseKey, opts]);

  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
            <p className={cn("text-[9px] font-bold uppercase italic opacity-60")}>
              Duración: {time} Minutos
              {sessionMeta ? ` • ${sessionMeta.dayLabel} (${formatDateEs(sessionMeta.date)})` : ""}
            </p>
          </div>
        </div>

        {role === "coach" && canRequest && matrixCanEdit && (
          <Button
            onClick={() => setShowSuggest(true)}
            variant="ghost"
            className="h-8 text-[8px] font-black uppercase text-primary border border-primary/20 hover:bg-primary/10 rounded-lg"
          >
            SUGERIR_CAMBIO
          </Button>
        )}
      </div>

      <div
        className={cn(
          "p-6 border-2 rounded-3xl transition-all relative overflow-hidden",
          assignedExercise ? "bg-white/[0.02] border-white/5" : "border-dashed border-white/5 text-center",
        )}
      >
        {assignedExercise ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center">
                <LayoutGrid className="h-5 w-5 text-white/20" />
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase italic">{assignedExercise}</p>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                  Biblioteca Metodología
                </p>
              </div>
            </div>
            {role === "director" && (matrixCanDelete || matrixCanEdit) && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!matrixCanDelete}
                  onClick={() => onClearAssignment?.()}
                  className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-500 transition-all disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={!matrixCanEdit}
                  onClick={() => setShowAssign(true)}
                  className="p-2 hover:bg-primary/15 rounded-lg text-primary transition-all disabled:opacity-30"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            {role === "director" ? (
              <Button
                type="button"
                variant="ghost"
                disabled={!matrixCanEdit}
                className="h-12 w-full border border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/5 rounded-2xl disabled:opacity-40"
                onClick={() => setShowAssign(true)}
              >
                <Plus className="h-5 w-5 mr-2 text-white/20" />
                ASIGNAR_TAREA
              </Button>
            ) : (
              <>
                <Plus className="h-5 w-5 text-white/10 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">Sin asignar</span>
              </>
            )}
          </div>
        )}
      </div>

      {showAssign && role === "director" && matrixCanEdit && (
        <div className="p-4 bg-black/40 border border-white/10 rounded-2xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-center gap-2">
            <Pencil className="h-3 w-3 text-white/40" />
            <span className="text-[9px] font-black text-white/60 uppercase">ASIGNAR_EJERCICIO</span>
          </div>
          <Select
            value={assignKey || undefined}
            onValueChange={(v) => setAssignKey(v)}
          >
            <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f18] border-white/10 rounded-xl">
              {opts.map((o) => (
                <SelectItem key={o.key} value={o.key} className="text-[10px] font-black uppercase">
                  {o.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                if (!assignExercise?.title) return;
                onAssign?.(assignExercise.key, assignExercise.title);
                setShowAssign(false);
              }}
              className="flex-1 h-8 bg-primary text-black text-[8px] font-black uppercase rounded-lg"
            >
              CONFIRMAR
            </Button>
            <Button
              type="button"
              onClick={() => setShowAssign(false)}
              variant="ghost"
              className="h-8 text-[8px] font-black uppercase text-white/20 border border-white/5 rounded-lg"
            >
              CANCELAR
            </Button>
          </div>
        </div>
      )}

      {showSuggest && role === "coach" && matrixCanEdit && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-primary uppercase">MOTIVO_Y_PROPUESTA</span>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ejercicio propuesto</Label>
            <Select value={proposedKey || undefined} onValueChange={(v) => setProposedKey(v)}>
              <SelectTrigger className="h-10 bg-black/40 border-primary/20 rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f18] border-primary/20 rounded-xl">
                {opts.map((o) => (
                  <SelectItem key={o.key} value={o.key} className="text-[10px] font-black uppercase">
                    {o.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Motivo del cambio</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="EJ: EL GRUPO NECESITA MÁS RITMO..."
              className="h-10 bg-black/40 border-primary/20 text-[10px] uppercase font-bold text-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                if (!proposedExercise?.title) return;
                onSendSuggestion?.({
                  proposedExerciseKey: proposedExercise.key,
                  proposedTitle: proposedExercise.title,
                  reason,
                });
                setShowSuggest(false);
              }}
              className="flex-1 h-8 bg-primary text-black text-[8px] font-black uppercase rounded-lg"
            >
              ENVIAR_SOLICITUD
            </Button>
            <Button
              type="button"
              onClick={() => setShowSuggest(false)}
              variant="ghost"
              className="h-8 text-[8px] font-black uppercase text-white/20 border border-white/5 rounded-lg"
            >
              CANCELAR
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
