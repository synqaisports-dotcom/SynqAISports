
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CalendarDays, 
  ChevronRight, 
  Download, 
  Users, 
  LayoutGrid, 
  Layers, 
  CheckCircle2,
  Clock,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Dumbbell,
  Wind,
  Search,
  Check,
  X,
  MessageSquareQuote,
  History,
  Info,
  UserX,
  UserCheck,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { readPlayersLocal } from "@/lib/player-storage";
import {
  upsertOperativaAttendance,
  upsertOperativaChangeRequest,
} from "@/lib/operativa-sync";
import { useOperativaSync } from "@/hooks/use-operativa-sync";
import { useClubModulePermissions } from "@/hooks/use-club-module-permissions";
import {
  mapOperativaAssignmentsToUi,
  mapOperativaRequestsToUi,
} from "@/lib/operativa-mappers";

// DATA MAESTRA DE LA TEMPORADA
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

const TEAMS_STORAGE_PREFIX = "synq_methodology_warehouse_teams_v1";
const SESSION_PLANNER_STORAGE_PREFIX = "synq_methodology_session_planner_v1";
const ACADEMY_CATEGORIES_STORAGE_PREFIX = "synq_academy_categories_v1";
const SESSIONS_ATTENDANCE_STORAGE_PREFIX = "synq_coach_sessions_attendance_v1";
const SESSIONS_REQUEST_SEEN_STORAGE_PREFIX = "synq_coach_sessions_request_seen_v1";

type PlayerRow = {
  id?: string;
  name?: string;
  surname?: string;
  nickname?: string;
  number?: string | number;
  category?: string;
  teamSuffix?: string;
};

type OperationalTeam = {
  id: string;
  name: string;
  stage: string;
  sessionsPerWeek?: number;
};

type SessionRosterPlayer = {
  id: string;
  name: string;
  number: number;
};

type SessionPlannerAssignment = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: "warmup" | "central" | "cooldown";
  exerciseTitle?: string;
};

type SessionPlannerPersistedState = {
  assignments?: SessionPlannerAssignment[];
  changeRequests?: SessionPlannerChangeRequest[];
  updatedAt?: string;
};

type SessionPlannerChangeRequest = {
  id: string;
  teamId: string;
  mcc: string;
  session: string;
  blockKey: "warmup" | "central" | "cooldown";
  original?: string;
  proposed: string;
  reason: string;
  status: "Pending" | "Approved" | "Denied";
  coach: string;
  createdAt: string;
  directorComment?: string;
  processedAt?: string;
};

type AcademyTeam = {
  id: string;
  name: string;
  stage: string;
};

function parseTeamName(teamName: string): { category: string; teamSuffix: string | null } {
  const parts = String(teamName || "").trim().split(" ").filter(Boolean);
  if (parts.length < 2) return { category: teamName, teamSuffix: null };
  const last = parts[parts.length - 1]?.toUpperCase();
  if (!["A", "B", "C", "D"].includes(last)) return { category: teamName, teamSuffix: null };
  return { category: parts.slice(0, -1).join(" "), teamSuffix: last };
}

function blockTitleToKey(title: string): "warmup" | "central" | "cooldown" {
  const safe = title.toLowerCase();
  if (safe.includes("calent")) return "warmup";
  if (safe.includes("central")) return "central";
  if (safe.includes("calma")) return "cooldown";
  return "central";
}

export default function CoachSessionsPage() {
  const searchParams = useSearchParams();
  const { profile, user, session } = useAuth();
  const { toast } = useToast();
  const [syncMode, setSyncMode] = useState<"remote" | "local" | "restricted">("local");
  const [myTeam, setMyTeam] = useState<OperationalTeam | null>(null);
  const [roster, setRoster] = useState<SessionRosterPlayer[]>([]);
  
  const [selectedMCC, setSelectedMCC] = useState<string | null>(null);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [activeSessionInWeek, setActiveSessionInWeek] = useState("1");
  const [attendance, setAttendance] = useState<Record<string, Record<string, string>>>({});
  const sessionsPerWeek = myTeam?.sessionsPerWeek ?? 3;
  const [plannerAssignments, setPlannerAssignments] = useState<SessionPlannerAssignment[]>([]);
  const [plannerTeams, setPlannerTeams] = useState<AcademyTeam[]>([]);
  const [coachRequests, setCoachRequests] = useState<SessionPlannerChangeRequest[]>([]);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [seenResponses, setSeenResponses] = useState<Record<string, boolean>>({});
  const notifiedResponseIdsRef = useRef<Record<string, boolean>>({});

  const clubScopeId = profile?.clubId ?? "global-hq";
  const attendanceStorageKey = `${SESSIONS_ATTENDANCE_STORAGE_PREFIX}_${clubScopeId}`;
  const requestSeenStorageKey = `${SESSIONS_REQUEST_SEEN_STORAGE_PREFIX}_${clubScopeId}`;
  const { canUseSupabase, loadSnapshot } = useOperativaSync(clubScopeId);
  const { canEdit: canEditPlanner } = useClubModulePermissions("planner");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(attendanceStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { attendance?: Record<string, Record<string, string>> };
      if (parsed?.attendance && typeof parsed.attendance === "object") {
        setAttendance(parsed.attendance);
      }
    } catch {
      /* noop */
    }
  }, [attendanceStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        attendanceStorageKey,
        JSON.stringify({
          version: 1,
          updatedAt: new Date().toISOString(),
          attendance,
        }),
      );
    } catch {
      /* noop */
    }
  }, [attendanceStorageKey, attendance]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(requestSeenStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      if (parsed && typeof parsed === "object") {
        setSeenResponses(parsed);
      }
    } catch {
      /* noop */
    }
  }, [requestSeenStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(requestSeenStorageKey, JSON.stringify(seenResponses));
    } catch {
      /* noop */
    }
  }, [requestSeenStorageKey, seenResponses]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const queryTeam = (searchParams.get("team") || "").trim().toUpperCase();
    const queryMcc = (searchParams.get("mcc") || "").trim().toUpperCase();
    const querySessionRaw = (searchParams.get("session") || "").trim().toUpperCase();

    const accessToken = session?.access_token;
    let cancelled = false;

    const run = async () => {
      const teamsRaw = localStorage.getItem(`${TEAMS_STORAGE_PREFIX}_${clubScopeId}`);
      const plannerRaw = localStorage.getItem(`${SESSION_PLANNER_STORAGE_PREFIX}_${clubScopeId}`);
      const academyRaw = localStorage.getItem(`${ACADEMY_CATEGORIES_STORAGE_PREFIX}_${clubScopeId}`);

      let selectedTeam: OperationalTeam | null = null;
      let usedRemote = false;
      let restricted = false;

      // 1) Warehouse teams (Supabase o local)
      let warehouseTeams: Array<{ id?: string; name?: string; stage?: string; sessionsPerWeek?: number }> = [];
      try {
        if (canUseSupabase && accessToken) {
          const whRes = await fetch("/api/club/methodology-warehouse", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (whRes.status === 403) restricted = true;
          if (!cancelled && whRes.ok) {
            usedRemote = true;
            const json = (await whRes.json()) as { ok?: boolean; payload?: any };
            const remoteTeams = json?.payload?.teams;
            if (Array.isArray(remoteTeams)) {
              warehouseTeams = remoteTeams.map((t: any) => ({
                id: t?.id,
                name: t?.name,
                stage: t?.stage,
                sessionsPerWeek: typeof t?.sessionsPerWeek === "number" ? t.sessionsPerWeek : 3,
              }));
            }
          }
        } else {
          const parsed = JSON.parse(teamsRaw || "[]") as Array<{ id?: string; name?: string; stage?: string; sessionsPerWeek?: number }>;
          if (Array.isArray(parsed) && parsed.length > 0) warehouseTeams = parsed;
        }
      } catch {
        // fallback silencioso
      }

      try {
        const byQuery =
          queryTeam.length > 0
            ? warehouseTeams.find((item) => String(item?.name ?? "").trim().toUpperCase() === queryTeam)
            : null;
        const t = byQuery ?? warehouseTeams[0];
        if (t) {
          selectedTeam = {
            id: String(t.id ?? `team_${Date.now()}`),
            name: String(t.name ?? "INFANTIL A"),
            stage: String(t.stage ?? "Infantil"),
            sessionsPerWeek: typeof t.sessionsPerWeek === "number" ? t.sessionsPerWeek : 3,
          };
        }
      } catch {
        /* noop */
      }

      // 2) Planner local state (assignments/requests)
      try {
        const parsed = JSON.parse(plannerRaw || "{}") as SessionPlannerPersistedState;
        if (!cancelled) {
          setPlannerAssignments(Array.isArray(parsed?.assignments) ? parsed.assignments : []);
          setCoachRequests(Array.isArray(parsed?.changeRequests) ? parsed.changeRequests : []);
        }
      } catch {
        if (!cancelled) {
          setPlannerAssignments([]);
          setCoachRequests([]);
        }
      }

      // 3) Academy categories => plannerTeams (Supabase o local)
      try {
        let parsedAcademy: any[] = [];
        if (canUseSupabase && accessToken) {
          const res = await fetch("/api/club/methodology-academy", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.status === 403) restricted = true;
          if (res.ok) {
            usedRemote = true;
            const json = (await res.json()) as { ok?: boolean; payload?: any };
            if (Array.isArray(json?.payload)) parsedAcademy = json.payload;
          }
        }
        if (parsedAcademy.length === 0) {
          parsedAcademy = JSON.parse(academyRaw || "[]") as any[];
        }

        const teams: AcademyTeam[] = [];
        for (const cat of parsedAcademy) {
          const catName = String(cat?.name ?? "").trim();
          const catId = String(cat?.id ?? "cat");
          const catTeams = Array.isArray(cat?.teams) ? cat.teams : [];
          catTeams.forEach((t: any, idx: number) => {
            const suffix = String(t?.suffix ?? `T${idx + 1}`);
            teams.push({
              id: `${catId}-${suffix}-${idx}`,
              name: `${String(t?.name ?? catName)} ${suffix}`.trim(),
              stage: catName,
            });
          });
        }
        if (!cancelled) setPlannerTeams(teams);
      } catch {
        if (!cancelled) setPlannerTeams([]);
      }

      // 4) Roster (local)
      const players = readPlayersLocal(clubScopeId) as PlayerRow[];

      if (!selectedTeam) {
        const firstCategory = String(players[0]?.category || "Infantil");
        const firstSuffix = String(players[0]?.teamSuffix || "A");
        selectedTeam = {
          id: `team_${firstCategory}_${firstSuffix}`,
          name: `${firstCategory} ${firstSuffix}`.trim().toUpperCase(),
          stage: firstCategory,
          sessionsPerWeek: 3,
        };
      }

      if (!cancelled) {
        setMyTeam(selectedTeam);

        const parsedTeam = parseTeamName(selectedTeam.name);
        const filteredPlayers = players
          .filter((p) => {
            const cat = String(p.category || "").toUpperCase();
            const suffix = String(p.teamSuffix || "").toUpperCase();
            const needCat = parsedTeam.category.toUpperCase();
            if (cat !== needCat) return false;
            if (!parsedTeam.teamSuffix) return true;
            return suffix === parsedTeam.teamSuffix;
          })
          .slice(0, 30)
          .map((p, idx) => {
            const numberRaw =
              typeof p.number === "string" ? parseInt(p.number, 10) : Number(p.number ?? idx + 1);
            const number = Number.isFinite(numberRaw) ? numberRaw : idx + 1;
            const name =
              (p.nickname || `${p.name || ""} ${p.surname || ""}`.trim() || `JUGADOR ${idx + 1}`).toUpperCase();
            return {
              id: String(p.id ?? `p_${idx}`),
              name,
              number,
            };
          });
        setRoster(filteredPlayers);
      }

      if (!cancelled) {
        if (/^[A-Z]{3,4}_W\d+$/.test(queryMcc)) setSelectedMCC(queryMcc);
        if (/^S?\d+$/.test(querySessionRaw)) {
          const n = String(querySessionRaw).replace(/^S/i, "");
          if (n) setActiveSessionInWeek(n);
        }
      }

      if (!cancelled) {
        if (restricted) setSyncMode("restricted");
        else if (usedRemote) setSyncMode("remote");
        else setSyncMode("local");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [clubScopeId, searchParams, canUseSupabase, session?.access_token]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const plannerStorageKey = `${SESSION_PLANNER_STORAGE_PREFIX}_${clubScopeId}`;
    const readRequests = async () => {
      try {
        const raw = localStorage.getItem(plannerStorageKey);
        const parsed = (raw ? JSON.parse(raw) : {}) as SessionPlannerPersistedState;
        setCoachRequests(Array.isArray(parsed?.changeRequests) ? parsed.changeRequests : []);
      } catch {
        setCoachRequests([]);
      }
      if (!canUseSupabase) return;
      const snapshot = await loadSnapshot();
      if (snapshot.assignments.length > 0) {
        setPlannerAssignments(mapOperativaAssignmentsToUi(snapshot.assignments));
      }
      if (Object.keys(snapshot.attendance).length > 0) {
        setAttendance((prev) => ({ ...prev, ...snapshot.attendance }));
      }
      if (snapshot.requests.length > 0) {
        setCoachRequests(mapOperativaRequestsToUi(snapshot.requests));
      }
    };
    void readRequests();
    const onStorage = (event: StorageEvent) => {
      if (event.key === plannerStorageKey) void readRequests();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [clubScopeId, canUseSupabase, loadSnapshot]);

  const activePlannerTeamId = useMemo(() => {
    if (!myTeam) return null;
    const myName = myTeam.name.trim().toUpperCase();
    const exact = plannerTeams.find((t) => t.name.trim().toUpperCase() === myName);
    if (exact) return exact.id;
    const parsedCurrent = parseTeamName(myTeam.name);
    const byCategory = plannerTeams.find((t) => {
      const parsed = parseTeamName(t.name);
      return (
        parsed.category.trim().toUpperCase() === parsedCurrent.category.trim().toUpperCase() &&
        (!parsedCurrent.teamSuffix || parsed.teamSuffix === parsedCurrent.teamSuffix)
      );
    });
    return byCategory?.id ?? null;
  }, [myTeam, plannerTeams]);

  // Importante: el "teamId operativo" debe coincidir con el que usa Metodología/Planner (Academy-derived),
  // para que asistencia/solicitudes/asignaciones se crucen correctamente entre pantallas.
  const operativaTeamId = useMemo(() => {
    return activePlannerTeamId ?? myTeam?.id ?? "team_unknown";
  }, [activePlannerTeamId, myTeam?.id]);

  const currentAttendanceKey = useMemo(() => {
    return `${operativaTeamId}_${selectedMCC}_S${activeSessionInWeek}`;
  }, [operativaTeamId, selectedMCC, activeSessionInWeek]);

  // Inicializar asistencia por defecto
  useEffect(() => {
    if (selectedMCC && roster.length > 0) {
      if (!attendance[currentAttendanceKey]) {
        const defaultAtt = Object.fromEntries(roster.map((p) => [p.id, "present"]));
        setAttendance(prev => ({ ...prev, [currentAttendanceKey]: defaultAtt }));
      }
    }
  }, [selectedMCC, attendance, currentAttendanceKey, roster]);

  const toggleAttendance = (playerId: string) => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso de edición en operativa / planificación.",
      });
      return;
    }
    const current = attendance[currentAttendanceKey] || {};
    const status = current[playerId];
    const nextStatus = status === 'present' ? 'absent' : status === 'absent' ? 'late' : 'present';
    
    setAttendance(prev => ({
      ...prev,
      [currentAttendanceKey]: { ...current, [playerId]: nextStatus }
    }));
    if (canUseSupabase && operativaTeamId && selectedMCC) {
      void upsertOperativaAttendance({
        clubId: clubScopeId,
        teamId: operativaTeamId,
        mcc: selectedMCC,
        session: activeSessionInWeek,
        playerId,
        status: nextStatus as "present" | "absent" | "late",
        updatedBy: user?.id ?? null,
      });
    }
  };

  const canRequestChange = (mcc: string) => {
    if (mcc.startsWith("SEPT")) return false; 
    return true; 
  };

  const handleMccClick = (month: string, week: number) => {
    setSelectedMCC(`${month.toUpperCase()}_W${week}`);
    setActiveSessionInWeek("1");
  };

  const handleSendRequest = async (blockTitle: string, reason: string, proposedExerciseTitle: string) => {
    if (!canEditPlanner) {
      toast({
        variant: "destructive",
        title: "PERMISO_DENEGADO",
        description: "No tienes permiso para enviar sugerencias de cambio.",
      });
      return;
    }
    const plannerStorageKey = `${SESSION_PLANNER_STORAGE_PREFIX}_${clubScopeId}`;
    const targetTeamId = activePlannerTeamId ?? myTeam?.id ?? "team_unknown";
    const mcc = selectedMCC ?? "MCC_UNKNOWN";
    const blockKey = blockTitleToKey(blockTitle);
    const currentPlanned =
      blockKey === "warmup"
        ? plannedByBlock.warmup
        : blockKey === "central"
          ? plannedByBlock.central
          : plannedByBlock.cooldown;

    try {
      const raw = localStorage.getItem(plannerStorageKey);
      const parsed = (raw ? JSON.parse(raw) : {}) as SessionPlannerPersistedState;
      const prevRequests = Array.isArray(parsed?.changeRequests) ? parsed.changeRequests : [];
      const cleanReason = reason.trim();
      const cleanProposed = proposedExerciseTitle.trim();
      if (!cleanReason || !cleanProposed) {
        toast({
          title: "DATOS_INCOMPLETOS",
          description: "Escribe motivo y ejercicio propuesto.",
          variant: "destructive",
        });
        return;
      }
      const reqId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const nextReq: SessionPlannerChangeRequest = {
        id: reqId,
        teamId: targetTeamId,
        mcc,
        session: activeSessionInWeek,
        blockKey,
        original: currentPlanned,
        proposed: cleanProposed,
        reason: cleanReason,
        status: "Pending",
        coach: "Coach Operativa",
        createdAt: new Date().toISOString(),
      };
      const filtered = prevRequests.filter(
        (r) =>
          !(
            r.teamId === nextReq.teamId &&
            r.mcc === nextReq.mcc &&
            r.session === nextReq.session &&
            r.blockKey === nextReq.blockKey &&
            r.status === "Pending"
          ),
      );
      const nextPayload: SessionPlannerPersistedState = {
        ...parsed,
        assignments: Array.isArray(parsed?.assignments) ? parsed.assignments : [],
        changeRequests: [nextReq, ...filtered].slice(0, 300),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(plannerStorageKey, JSON.stringify(nextPayload));
      setCoachRequests(nextPayload.changeRequests ?? []);
      if (canUseSupabase) {
        await upsertOperativaChangeRequest({
          id: reqId,
          clubId: clubScopeId,
          teamId: targetTeamId,
          mcc,
          session: activeSessionInWeek,
          blockKey,
          originalExercise: currentPlanned,
          proposedExercise: cleanProposed,
          reason: cleanReason,
          coachId: user?.id ?? null,
          coachName: profile?.name ?? "Coach Operativa",
        });
      }
    } catch {
      toast({
        title: "ERROR_GUARDANDO_SOLICITUD",
        description: "No se pudo guardar en Planificador Maestro.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "SOLICITUD_ENVIADA",
      description: `${blockTitle}: ${proposedExerciseTitle.slice(0, 60)}${proposedExerciseTitle.length > 60 ? "..." : ""}`,
    });
  };

  const currentSessionAttendance = useMemo(() => {
    return attendance[currentAttendanceKey] || {};
  }, [attendance, currentAttendanceKey]);

  const visibleCoachRequests = useMemo(() => {
    const teamId = activePlannerTeamId ?? myTeam?.id;
    if (!teamId) return [];
    return coachRequests
      .filter((r) => r.teamId === teamId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [coachRequests, activePlannerTeamId, myTeam?.id]);

  const unreadResponsesCount = useMemo(
    () =>
      visibleCoachRequests.filter((r) => r.status !== "Pending" && !seenResponses[r.id]).length,
    [visibleCoachRequests, seenResponses],
  );

  const markResponsesAsSeen = () => {
    setSeenResponses((prev) => {
      const next = { ...prev };
      visibleCoachRequests.forEach((r) => {
        if (r.status !== "Pending") next[r.id] = true;
      });
      return next;
    });
  };

  useEffect(() => {
    visibleCoachRequests.forEach((req) => {
      if (req.status === "Pending") return;
      if (notifiedResponseIdsRef.current[req.id]) return;
      notifiedResponseIdsRef.current[req.id] = true;
      toast({
        title: req.status === "Approved" ? "CAMBIO_APROBADO" : "CAMBIO_DENEGADO",
        description: `${req.mcc} • SES_${req.session} • ${req.blockKey.toUpperCase()}${req.directorComment ? ` • ${req.directorComment}` : ""}`,
        variant: req.status === "Approved" ? "default" : "destructive",
      });
    });
  }, [visibleCoachRequests, toast]);

  const plannedByBlock = useMemo(() => {
    const fallback = {
      warmup: "Rondo de Activación 4x1",
      central: "Posesión 5x5 + 2 Comodines",
      cooldown: "Estiramientos y Feedback",
    };
    if (!selectedMCC || !activePlannerTeamId) return fallback;
    const forSession = plannerAssignments.filter(
      (a) => a.teamId === activePlannerTeamId && a.mcc === selectedMCC && a.session === activeSessionInWeek,
    );
    if (!forSession.length) return fallback;
    return {
      warmup: forSession.find((a) => a.blockKey === "warmup")?.exerciseTitle || fallback.warmup,
      central: forSession.find((a) => a.blockKey === "central")?.exerciseTitle || fallback.central,
      cooldown: forSession.find((a) => a.blockKey === "cooldown")?.exerciseTitle || fallback.cooldown,
    };
  }, [plannerAssignments, activePlannerTeamId, selectedMCC, activeSessionInWeek]);

  const blockRequestStatus = useMemo(() => {
    const out: Record<"warmup" | "central" | "cooldown", SessionPlannerChangeRequest["status"] | null> = {
      warmup: null,
      central: null,
      cooldown: null,
    };
    if (!selectedMCC) return out;
    const forCurrent = visibleCoachRequests.filter(
      (r) => r.mcc === selectedMCC && r.session === activeSessionInWeek,
    );
    (["warmup", "central", "cooldown"] as const).forEach((k) => {
      const latest = forCurrent.find((r) => r.blockKey === k);
      out[k] = latest?.status ?? null;
    });
    return out;
  }, [visibleCoachRequests, selectedMCC, activeSessionInWeek]);

  const allMccOptions = useMemo(() => {
    const out: Array<{ id: string; label: string }> = [];
    MONTHS.forEach((month) => {
      for (let i = 1; i <= month.weeks; i++) {
        out.push({
          id: `${month.id.toUpperCase()}_W${i}`,
          label: `${month.label} · SEMANA ${i}`,
        });
      }
    });
    return out;
  }, []);

  const activeMccIndex = useMemo(
    () => (selectedMCC ? allMccOptions.findIndex((m) => m.id === selectedMCC) : -1),
    [allMccOptions, selectedMCC],
  );

  const goToPrevMcc = () => {
    if (activeMccIndex <= 0) return;
    setSelectedMCC(allMccOptions[activeMccIndex - 1].id);
    setActiveSessionInWeek("1");
  };

  const goToNextMcc = () => {
    if (activeMccIndex < 0 || activeMccIndex >= allMccOptions.length - 1) return;
    setSelectedMCC(allMccOptions[activeMccIndex + 1].id);
    setActiveSessionInWeek("1");
  };

  useEffect(() => {
    const current = parseInt(activeSessionInWeek, 10);
    if (!Number.isFinite(current) || current < 1 || current > sessionsPerWeek) {
      setActiveSessionInWeek("1");
    }
  }, [activeSessionInWeek, sessionsPerWeek]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-4 sm:p-6 lg:p-12">
      
      <div className="flex justify-end gap-2 mb-4">
         <Badge variant="outline" className="border-white/5 text-white/20 uppercase text-[8px] font-black mr-4">Preview_Role:</Badge>
         <button className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-[background-color,border-color,color,opacity,transform] bg-primary text-black border-primary">COACH_MODO</button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Coach_Operational_Mirror_v5.1</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-black text-white uppercase italic tracking-tighter cyan-text-glow leading-none">
            PLANIFICACIÓN_Y_SESIONES
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">
            Equipo Asignado: {myTeam?.name ?? "SIN_EQUIPO"} • Etapa {myTeam?.stage ?? "—"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
             <ShieldCheck className="h-5 w-5 text-primary" />
             <div>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">MODO_LECTURA_ACTIVO</p>
                <p className="text-[8px] font-bold text-white/40 uppercase italic">
                  {syncMode === "remote"
                    ? "Sincronizado con Metodología Central"
                    : syncMode === "restricted"
                      ? "Acceso restringido por permisos"
                      : "Modo local (sin red) / Sandbox"}
                </p>
             </div>
          </div>
          <Button className="h-12 bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6 sm:px-8 rounded-xl cyan-glow hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" /> Mi Temporada
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsRequestsOpen(true);
              markResponsesAsSeen();
            }}
            className="h-12 border-white/15 text-white font-black uppercase text-[10px] tracking-widest px-5 rounded-xl relative w-full sm:w-auto"
          >
            <History className="h-4 w-4 mr-2" /> Mis Solicitudes
            {unreadResponsesCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-emerald-500 text-black text-[9px] leading-5 font-black">
                {unreadResponsesCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <Card className="glass-panel border-none bg-black/60 overflow-hidden relative rounded-[2rem] shadow-2xl">
          
          <div className="bg-primary px-10 py-6 flex items-center justify-between border-b border-black/10">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 bg-black/20 rounded-xl flex items-center justify-center border border-black/10">
                <LayoutGrid className="h-6 w-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-black/60 uppercase tracking-[0.4em]">Temporada 2024 / 2025</span>
                <h2 className="text-2xl font-black text-black italic tracking-tighter uppercase leading-none">
                  Mi Agenda Táctica: <span className="text-black/80">{myTeam?.name ?? "SIN_EQUIPO"}</span>
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">Sincronización</p>
                  <p className="text-xl font-black text-black italic tracking-tighter uppercase">
                    {syncMode === "remote" ? "REMOTO_OK" : syncMode === "restricted" ? "RESTRINGIDO" : "LOCAL"}
                  </p>
               </div>
               <div className="h-8 w-[1px] bg-black/10" />
               <div className="text-right">
                  <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">Sesiones/Semana</p>
                  <p className="text-xl font-black text-black italic tracking-tighter">{sessionsPerWeek} DÍAS</p>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[1200px] lg:min-w-[1800px] flex">
              {MONTHS.map((month) => (
                <div key={month.id} className="flex-1 border-r border-white/5 flex-col group/month hover:bg-white/[0.01] transition-colors">
                  <div className="p-4 text-center border-b border-white/5 bg-white/[0.02]">
                    <span className="text-[11px] font-black text-primary tracking-[0.3em] uppercase">{month.label}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {Array.from({ length: month.weeks }).map((_, i) => {
                      const mccId = `${month.id.toUpperCase()}_W${i+1}`;
                      return (
                        <div 
                          key={i} 
                          onClick={() => handleMccClick(month.id, i + 1)}
                          className={cn(
                            "p-4 rounded-xl border transition-[background-color,border-color,color,opacity,transform] cursor-pointer group/mcc relative overflow-hidden",
                            selectedMCC === mccId 
                              ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(242,255,255,0.2)]" 
                              : "bg-white/5 border-white/5 hover:border-primary/40 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              selectedMCC === mccId ? "text-primary" : "text-white/20"
                            )}>MCC_{i + 1}</span>
                            <LayoutGrid className={cn("h-3 w-3", selectedMCC === mccId ? "text-primary" : "text-white/10")} />
                          </div>
                          <p className={cn(
                            "text-[8px] font-bold uppercase",
                            selectedMCC === mccId ? "text-white" : "text-white/10"
                          )}>{sessionsPerWeek} Sesiones Previstas</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center gap-3">
            <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest whitespace-nowrap">
              Salto rápido MCC
            </span>
            <Select
              value={selectedMCC ?? undefined}
              onValueChange={(value) => {
                setSelectedMCC(value);
                setActiveSessionInWeek("1");
              }}
            >
              <SelectTrigger className="h-9 w-full max-w-[320px] bg-black/50 border-white/10 text-[10px] font-black uppercase tracking-wider">
                <SelectValue placeholder="Selecciona semana MCC" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0f14] border-white/10 text-white">
                {allMccOptions.map((mcc) => (
                  <SelectItem
                    key={mcc.id}
                    value={mcc.id}
                    className="text-[10px] font-bold uppercase tracking-wide"
                  >
                    {mcc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-6 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-primary/20 uppercase tracking-[0.5em]">
            <span className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-primary animate-pulse" /> Sincronizado con el Nodo de Metodología
            </span>
            <span>Protocolo de Espejo Operativo • Blindaje de Edición Activo</span>
          </div>
        </Card>
      </div>

      <Sheet open={!!selectedMCC} onOpenChange={(open) => !open && setSelectedMCC(null)}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-2xl lg:max-w-3xl p-0 overflow-hidden flex flex-col">
          {selectedMCC && (
            <>
              <div className="p-8 border-b border-white/5 bg-black/40">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full animate-pulse bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Detalle de Sesiones</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Semana {selectedMCC}</SheetTitle>
                    <div className="flex gap-3">
                      <Button
                        onClick={goToPrevMcc}
                        variant="outline"
                        disabled={activeMccIndex <= 0}
                        className="h-10 border-white/15 text-white/80 font-black uppercase text-[9px] tracking-widest px-4 rounded-xl disabled:opacity-30"
                      >
                        Anterior
                      </Button>
                      <Button
                        onClick={goToNextMcc}
                        variant="outline"
                        disabled={activeMccIndex < 0 || activeMccIndex >= allMccOptions.length - 1}
                        className="h-10 border-white/15 text-white/80 font-black uppercase text-[9px] tracking-widest px-4 rounded-xl disabled:opacity-30"
                      >
                        Siguiente
                      </Button>
                      <Button 
                        onClick={() => setIsAttendanceOpen(true)}
                        disabled={roster.length === 0 || !canEditPlanner}
                        className="h-10 bg-emerald-500 text-black font-black uppercase text-[9px] tracking-widest px-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none disabled:opacity-40"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-2" /> Asistencia
                      </Button>
                      <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase tracking-widest px-4 py-1.5 h-auto hidden sm:flex">
                        CATEGORÍA: {(myTeam?.stage ?? "—").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </SheetHeader>
              </div>

              <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5">
                <Tabs value={activeSessionInWeek} onValueChange={setActiveSessionInWeek} className="w-full">
                  <TabsList
                    className="grid w-full bg-black/40 border border-white/10 p-1 h-12 rounded-xl"
                    style={{ gridTemplateColumns: `repeat(${Math.max(1, sessionsPerWeek)}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: sessionsPerWeek }).map((_, i) => (
                      <TabsTrigger 
                        key={i} 
                        value={(i + 1).toString()}
                        className="rounded-lg font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black"
                      >
                        SES_{i + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12">
                <div className="space-y-10" key={activeSessionInWeek}>
                  
                  {!canRequestChange(selectedMCC) ? (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-4">
                       <ShieldAlert className="h-5 w-5 text-rose-500" />
                       <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">Protocolo Inmutable: Sugerencia de cambio bloqueada (Lead-Time &lt; 7 días)</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                       <Info className="h-5 w-5 text-primary" />
                       <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Terminal Activa: Puede sugerir cambios hasta 7 días antes de la sesión.</p>
                    </div>
                  )}

                  <div className="space-y-8">
                    <CoachSessionBlock 
                      title="1. Calentamiento / Activación" 
                      time={15} 
                      icon={Flame} 
                      color="orange" 
                      canRequest={canRequestChange(selectedMCC) && canEditPlanner}
                      assignedExercise={plannedByBlock.warmup}
                      onSuggest={handleSendRequest}
                      requestStatus={blockRequestStatus.warmup}
                    />
                    
                    <CoachSessionBlock 
                      title="2. Zona Central (Ejercicios)" 
                      time={45} 
                      icon={Dumbbell} 
                      color="amber" 
                      canRequest={canRequestChange(selectedMCC) && canEditPlanner}
                      assignedExercise={plannedByBlock.central}
                      onSuggest={handleSendRequest}
                      requestStatus={blockRequestStatus.central}
                    />

                    <CoachSessionBlock 
                      title="3. Vuelta a la Calma" 
                      time={10} 
                      icon={Wind} 
                      color="blue" 
                      canRequest={canRequestChange(selectedMCC) && canEditPlanner}
                      assignedExercise={plannedByBlock.cooldown}
                      onSuggest={handleSendRequest}
                      requestStatus={blockRequestStatus.cooldown}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/60 border-t border-white/5">
                <SheetClose asChild>
                  <Button variant="ghost" className="h-16 border border-white/10 text-white/40 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/5 transition-[background-color,border-color,color,opacity,transform] w-full">CERRAR_TERMINAL</Button>
                </SheetClose>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* PANEL INDEPENDIENTE DE ASISTENCIA */}
      <Sheet open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-emerald-500/20 text-white w-full sm:max-w-xl shadow-[-20px_0_60px_rgba(0,0,0,0.8)] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full animate-pulse bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Attendance_Control_Studio</span>
              </div>
              <SheetTitle className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">Pasar Lista</SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-emerald-500/40 tracking-widest text-left italic">
                SESIÓN {activeSessionInWeek} • {selectedMCC} • PULSE PARA ALTERNAR ESTADO
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roster.length === 0 && (
                <div className="col-span-full rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                    Sin roster cargado para este equipo. Revisa Cantera/Jugadores.
                  </p>
                </div>
              )}
              {roster.map(player => {
                const status = currentSessionAttendance[player.id] || 'present';
                return (
                  <div 
                    key={player.id}
                    onClick={() => toggleAttendance(player.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-[background-color,border-color,color,opacity,transform] flex items-center justify-between group overflow-hidden relative",
                      canEditPlanner ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                      status === 'present' ? "bg-emerald-500/5 border-emerald-500/20" :
                      status === 'absent' ? "bg-rose-500/5 border-rose-500/20" :
                      "bg-amber-500/5 border-amber-500/20"
                    )}
                  >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                          "h-10 w-10 border rounded-xl flex items-center justify-center text-[11px] font-black italic transition-colors",
                          status === 'present' ? "bg-black/40 border-emerald-500/30 text-emerald-400" :
                          status === 'absent' ? "bg-black/40 border-rose-500/30 text-rose-400" :
                          "bg-black/40 border-amber-500/30 text-amber-400"
                        )}>
                          {player.number}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-white uppercase italic group-hover:emerald-text-glow transition-[background-color,border-color,color,opacity,transform]">{player.name}</span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-widest",
                            status === 'present' ? "text-emerald-400/60" :
                            status === 'absent' ? "text-rose-400/60" :
                            "text-amber-400/60"
                          )}>
                            {status === 'present' ? 'SINCRO_OK' : status === 'absent' ? 'AUSENCIA_DETECTADA' : 'RETRASO_REGISTRADO'}
                          </span>
                        </div>
                      </div>
                      <div className="relative z-10">
                        {status === 'present' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 animate-in zoom-in" />
                        ) : status === 'absent' ? (
                          <UserX className="h-5 w-5 text-rose-500 animate-in zoom-in" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-500 animate-in zoom-in" />
                        )}
                      </div>
                      {status === 'present' && <div className="absolute inset-0 bg-emerald-500/5 scan-line opacity-20" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 bg-black/60 border-t border-white/5 flex gap-4">
            <Button 
              onClick={() => {
                toast({ title: "ASISTENCIA_GUARDADA", description: "Datos sincronizados con éxito." });
                setIsAttendanceOpen(false);
              }}
              disabled={!canEditPlanner}
              className="flex-1 h-16 bg-emerald-500 text-black font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] border-none disabled:opacity-40"
            >
              CONFIRMAR_ASISTENCIA <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={isRequestsOpen}
        onOpenChange={(open) => {
          setIsRequestsOpen(open);
          if (open) markResponsesAsSeen();
        }}
      >
        <SheetContent side="right" className="bg-[#04070c]/98 backdrop-blur-3xl border-l border-primary/20 text-white w-full sm:max-w-xl p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-white/5 bg-black/40">
            <SheetHeader className="space-y-3">
              <SheetTitle className="text-3xl font-black italic tracking-tighter uppercase leading-none text-white">
                Mis Solicitudes
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold text-primary/50 tracking-widest text-left">
                Respuestas del Planificador Maestro
              </SheetDescription>
            </SheetHeader>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
            {visibleCoachRequests.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">
                  Aún no hay solicitudes para este equipo.
                </p>
              </div>
            )}
            {visibleCoachRequests.map((req) => {
              const tone =
                req.status === "Approved"
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                  : req.status === "Denied"
                    ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                    : "border-amber-500/30 bg-amber-500/5 text-amber-300";
              return (
                <div key={req.id} className={cn("rounded-2xl border p-4 space-y-2", tone)}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      {req.mcc} • SES_{req.session} • {req.blockKey.toUpperCase()}
                    </p>
                    <Badge variant="outline" className="text-[9px] font-black uppercase">
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] font-bold uppercase text-white/80">{req.reason}</p>
                  {req.directorComment && (
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      Director: {req.directorComment}
                    </p>
                  )}
                  <p className="text-[9px] font-bold uppercase text-white/40">
                    {(req.processedAt ? new Date(req.processedAt) : new Date(req.createdAt)).toLocaleString("es-ES")}
                  </p>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CoachSessionBlock({
  title,
  time,
  icon: Icon,
  color,
  canRequest,
  assignedExercise,
  onSuggest,
  requestStatus,
}: {
  title: string;
  time: number;
  icon: any;
  color: "orange" | "amber" | "blue";
  canRequest: boolean;
  assignedExercise: string;
  onSuggest: (blockTitle: string, reason: string, proposedExerciseTitle: string) => void;
  requestStatus: "Pending" | "Approved" | "Denied" | null;
}) {
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestionReason, setSuggestionReason] = useState("");
  const [proposedExercise, setProposedExercise] = useState("");
  const colorClass = color === 'orange' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' : 
                     color === 'amber' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' : 
                     'text-blue-500 border-blue-500/20 bg-blue-500/10';

  return (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">{title}</h4>
            <p className={cn("text-[9px] font-bold uppercase italic opacity-60")}>Duración: {time} Minutos</p>
          </div>
        </div>
        {canRequest && (
          <Button onClick={() => setShowSuggest(true)} variant="ghost" className="h-8 text-[8px] font-black uppercase text-primary border border-primary/20 hover:bg-primary/10 rounded-lg">SUGERIR_CAMBIO</Button>
        )}
      </div>

      <div className="p-6 border-2 rounded-3xl bg-white/[0.02] border-white/5 transition-[background-color,border-color,color,opacity,transform] relative overflow-hidden">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center">
                 <LayoutGrid className="h-5 w-5 text-white/20" />
              </div>
              <div>
                 <p className="text-xs font-black text-white uppercase italic">{assignedExercise}</p>
                 <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Protocolo Metodológico • SINCRO_OK</p>
              </div>
           </div>
           <Badge
             variant="outline"
             className={cn(
               "text-[8px] font-black uppercase",
               requestStatus === "Approved"
                 ? "border-emerald-500/20 text-emerald-400"
                 : requestStatus === "Denied"
                   ? "border-rose-500/20 text-rose-400"
                   : requestStatus === "Pending"
                     ? "border-amber-500/20 text-amber-400"
                     : "border-emerald-500/20 text-emerald-400",
             )}
           >
             {requestStatus === "Approved"
               ? "APROBADA"
               : requestStatus === "Denied"
                 ? "DENEGADA"
                 : requestStatus === "Pending"
                   ? "PENDIENTE"
                   : "VALIDADO"}
           </Badge>
        </div>
      </div>

      {showSuggest && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 space-y-4">
           <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-black text-primary uppercase">Motivo de la Sugerencia</span>
           </div>
           <Input
             value={proposedExercise}
             onChange={(e) => setProposedExercise(e.target.value)}
             placeholder="EJ: POSESIÓN 6X4 + 3 APOYOS"
             className="h-10 bg-black/40 border-primary/20 text-[10px] uppercase font-bold text-primary"
           />
           <Input
             value={suggestionReason}
             onChange={(e) => setSuggestionReason(e.target.value)}
             placeholder="EJ: PREFIERO UN TRABAJO DE MÁS INTENSIDAD..."
             className="h-10 bg-black/40 border-primary/20 text-[10px] uppercase font-bold text-primary"
           />
           <div className="flex gap-2">
              <Button
                onClick={() => {
                  const reason = suggestionReason.trim();
                  const proposed = proposedExercise.trim();
                  if (!reason || !proposed) return;
                  onSuggest(title, reason, proposed);
                  setSuggestionReason("");
                  setProposedExercise("");
                  setShowSuggest(false);
                }}
                disabled={!suggestionReason.trim() || !proposedExercise.trim()}
                className="flex-1 h-8 bg-primary text-black text-[8px] font-black uppercase rounded-lg disabled:opacity-40"
              >
                ENVIAR_SOLICITUD
              </Button>
              <Button
                onClick={() => {
                  setSuggestionReason("");
                  setProposedExercise("");
                  setShowSuggest(false);
                }}
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
