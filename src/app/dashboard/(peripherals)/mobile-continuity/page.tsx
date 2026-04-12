"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Smartphone,
  Watch,
  Timer,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  QrCode,
  RefreshCcw,
  Share2,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { QRCodeCanvas } from "qrcode.react";
import { Copy } from "lucide-react";
import {
  MATCH_TIMER_SYNC_KEY,
  matchTimerSyncKey,
  readMatchTimerPresetMinutes,
  readMatchTimerSync,
  shouldApplyRemoteTimer,
  writeMatchTimerSync,
} from "@/lib/match-timer-sync";
import {
  MATCH_SCORE_SYNC_KEY,
  matchScoreSyncKey,
  readMatchScoreSync,
  shouldApplyRemoteScore,
  writeMatchScoreSync,
} from "@/lib/match-score-sync";
import { synqSync } from "@/lib/sync-service";
import { insertIncident } from "@/lib/local-db/database-service";
import {
  enqueueContinuityIncidentSync,
  flushContinuityIncidentQueue,
  promoteContinuityIncident,
  removeContinuityIncidentFromQueue,
} from "@/lib/continuity-incident-sync";
import { upsertOperativaAttendance } from "@/lib/operativa-sync";
import { readPlayersLocal } from "@/lib/player-storage";
import { ensureWatchPairingCode } from "@/lib/watch-pairing";
import { writeContinuityContext } from "@/lib/continuity-context";
import {
  readWatchAlertsConfig,
  writeWatchAlertsConfig,
  type WatchAlertsConfig,
} from "@/lib/watch-alert-config";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

const selectTriggerHub =
  "h-9 rounded-none border-white/10 bg-slate-950/50 backdrop-blur-md text-[10px] font-black uppercase text-cyan-100 " +
  "focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400";

const selectContentHub = "rounded-none border-white/10 bg-[#0a1220] backdrop-blur-xl z-[200]";

type Incident = {
  id: string;
  label: string;
};

type ContinuityTeam = {
  id: string;
  name: string;
  stage?: string;
};

type PromoMatch = {
  id?: number | string;
  date?: string;
  rivalName?: string;
  location?: string;
  status?: string;
  score?: { home?: number; guest?: number };
};

type IncidentHistoryItem = {
  id: string;
  team_id: string;
  mcc: string;
  session: string;
  incident_id: string;
  incident_label: string;
  score_home: number;
  score_guest: number;
  remaining_sec: number;
  source: string;
  created_at: string;
};

type PlayerRow = {
  id?: string;
  name?: string;
  surname?: string;
  nickname?: string;
  number?: string | number;
  category?: string;
  teamSuffix?: string;
};

type SessionRosterPlayer = {
  id: string;
  name: string;
  number: number;
};

const INCIDENTS: Incident[] = [
  { id: "injury", label: "Lesión" },
  { id: "material", label: "Falta material" },
  { id: "field", label: "Incidencia campo" },
  { id: "discipline", label: "Incidencia disciplina" },
];

const TEAMS_STORAGE_PREFIX = "synq_methodology_warehouse_teams_v1";
const MOBILE_ATTENDANCE_STORAGE_PREFIX = "synq_mobile_continuity_attendance_v1";
const MONTHS = [
  { id: "sept", weeks: 4 },
  { id: "oct", weeks: 4 },
  { id: "nov", weeks: 5 },
  { id: "dec", weeks: 4 },
  { id: "jan", weeks: 4 },
  { id: "feb", weeks: 4 },
  { id: "mar", weeks: 5 },
  { id: "apr", weeks: 4 },
  { id: "may", weeks: 4 },
  { id: "jun", weeks: 4 },
];

function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function parseTeamName(teamName: string): { category: string; teamSuffix: string | null } {
  const parts = String(teamName || "").trim().split(/\s+/);
  if (parts.length < 2) return { category: teamName, teamSuffix: null };
  const last = String(parts[parts.length - 1] || "").toUpperCase();
  if (!["A", "B", "C", "D"].includes(last)) return { category: teamName, teamSuffix: null };
  return { category: parts.slice(0, -1).join(" "), teamSuffix: last };
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function MobileContinuityPage() {
  const { toast } = useToast();
  const { profile, session } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const continuityEnv = profile?.clubId && profile.clubId !== "global-hq" ? "elite" : "sandbox";
  const [mode, setMode] = useState<"match" | "training">("match");
  const [panel, setPanel] = useState<"ops" | "watchSettings">("ops");
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [remainingSec, setRemainingSec] = useState(45 * 60);
  const [running, setRunning] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [teams, setTeams] = useState<ContinuityTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedMcc, setSelectedMcc] = useState<string>("OCT_W1");
  const [selectedSession, setSelectedSession] = useState<string>("S1");
  const [promoMatches, setPromoMatches] = useState<PromoMatch[]>([]);
  const [selectedPromoMatchId, setSelectedPromoMatchId] = useState<string>("");
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyAllClub, setHistoryAllClub] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [roster, setRoster] = useState<SessionRosterPlayer[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const [watchSettings, setWatchSettings] = useState<WatchAlertsConfig>(() =>
    readWatchAlertsConfig({
      clubId: clubScopeId,
      mode,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    }),
  );
  const lastTimerAppliedRef = useRef(0);
  const lastScoreAppliedRef = useRef(0);
  const lastTickAtRef = useRef<number | null>(null);

  const players = useMemo(() => readPlayersLocal(clubScopeId), [clubScopeId]);

  const continuityScope = useMemo(
    () => ({
      clubId: clubScopeId,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
      mode,
    }),
    [clubScopeId, selectedTeamId, selectedMcc, selectedSession, mode],
  );
  const watchAlertScope = useMemo(
    () => ({
      clubId: clubScopeId,
      mode,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    }),
    [clubScopeId, mode, selectedTeamId, selectedMcc, selectedSession],
  );

  const timerSyncKey = useMemo(() => matchTimerSyncKey(continuityScope), [continuityScope]);
  const scoreSyncKey = useMemo(() => matchScoreSyncKey(continuityScope), [continuityScope]);

  const watchPairingCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    // Mantener “continuity” como bucket de pairing (misma app smartwatch), pero el enlace lleva `mode=match|training`
    // y las claves de sincronización ya están scopeadas por `mode`.
    return ensureWatchPairingCode({ clubId: clubScopeId, mode: "continuity" });
  }, [clubScopeId]);

  const watchUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/smartwatch`;
    const params = new URLSearchParams({
      code: watchPairingCode || "",
      mode,
      team: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    });
    return `${base}?${params.toString()}`;
  }, [watchPairingCode, selectedTeamId, selectedMcc, selectedSession, mode]);

  const isSandboxMatchMode = continuityEnv === "sandbox" && mode === "match";

  const promoMatchOptions = useMemo(() => {
    if (!isSandboxMatchMode) return [];
    const raw = promoMatches
      .filter((m) => m && (m.id !== null && m.id !== undefined))
      .map((m) => {
        const id = String(m.id);
        const date = String(m.date || "").trim();
        const rival = String(m.rivalName || "").trim();
        const loc = String(m.location || "").trim();
        const labelParts = [
          date || "Pendiente fecha",
          loc || "Pendiente sede",
          rival ? `vs ${rival}` : "Pendiente rival",
        ];
        return { id, label: labelParts.join(" · "), match: m };
      });
    // Ordena por fecha si parece ISO YYYY-MM-DD
    raw.sort((a, b) => {
      const ta = Date.parse(a.match.date || "");
      const tb = Date.parse(b.match.date || "");
      if (Number.isFinite(ta) && Number.isFinite(tb)) return ta - tb;
      if (Number.isFinite(ta)) return -1;
      if (Number.isFinite(tb)) return 1;
      return a.id.localeCompare(b.id);
    });
    return raw;
  }, [isSandboxMatchMode, promoMatches]);

  const applyPromoMatchContext = (matchId: string) => {
    const id = String(matchId || "").trim();
    if (!id) return;
    setSelectedPromoMatchId(id);
    // Usamos el id del partido como contexto estable para sincronización.
    setSelectedMcc((prev) => (prev.startsWith("SBX_MATCH_") ? `SBX_MATCH_${id}` : prev));
    setSelectedSession((prev) => (prev.startsWith("M") || prev.startsWith("SBX_") ? `SBX_${id.slice(-6)}` : prev));
    // Si el usuario no había cambiado manualmente MCC/Sesión, forzamos contexto sandbox.
    setSelectedMcc((prev) => (prev && prev !== "OCT_W1" ? prev : `SBX_MATCH_${id}`));
    setSelectedSession((prev) => (prev && prev !== "S1" ? prev : `SBX_${id.slice(-6)}`));
  };

  // Mantener el “último contexto” actualizado para que el reloj pueda abrir sin parámetros.
  useEffect(() => {
    if (typeof window === "undefined") return;
    writeContinuityContext({
      clubId: clubScopeId,
      mode,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    });
  }, [clubScopeId, mode, selectedTeamId, selectedMcc, selectedSession]);

  useEffect(() => {
    const preset = readWatchAlertsConfig(watchAlertScope);
    setWatchSettings(preset);
  }, [watchAlertScope]);

  useEffect(() => {
    writeWatchAlertsConfig(watchAlertScope, {
      enabled: watchSettings.enabled,
      alertMatchTime: watchSettings.alertMatchTime,
      changeInterval: watchSettings.changeInterval,
      vibrateOnPeriod: watchSettings.vibrateOnPeriod,
      vibrateIntensity: watchSettings.vibrateIntensity,
      syncSubs: watchSettings.syncSubs,
      fatigueThreshold: watchSettings.fatigueThreshold,
    });
  }, [watchSettings, watchAlertScope]);

  const copyText = async (label: string, value: string) => {
    const text = String(value || "").trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "COPIADO", description: `${label} copiado al portapapeles.` });
    } catch {
      toast({ title: "NO_COPIADO", description: "No se pudo copiar. Mantén pulsado para seleccionar." });
    }
  };

  const mccOptions = useMemo(
    () =>
      MONTHS.flatMap((m) =>
        Array.from({ length: m.weeks }, (_, i) => `${m.id.toUpperCase()}_W${i + 1}`),
      ),
    [],
  );
  const selectedTeam = useMemo(() => teams.find((t) => t.id === selectedTeamId) ?? null, [teams, selectedTeamId]);
  const attendanceStorageKey = useMemo(
    () => `${MOBILE_ATTENDANCE_STORAGE_PREFIX}_${profile?.clubId ?? "global"}_${selectedTeamId || "team"}_${selectedMcc}_${selectedSession}`,
    [profile?.clubId, selectedTeamId, selectedMcc, selectedSession],
  );

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const preset = readMatchTimerPresetMinutes(45);
    setRemainingSec(preset * 60);
    const remoteTimer = readMatchTimerSync(timerSyncKey);
    if (remoteTimer) {
      setRemainingSec(Math.max(0, remoteTimer.remainingSec));
      setRunning(Boolean(remoteTimer.running));
      lastTimerAppliedRef.current = remoteTimer.updatedAt;
    }
    const remoteScore = readMatchScoreSync(scoreSyncKey);
    if (remoteScore) {
      setScore({ home: Math.max(0, remoteScore.home), guest: Math.max(0, remoteScore.guest) });
      lastScoreAppliedRef.current = remoteScore.updatedAt;
    }
    const teamsClubScopeId = profile?.clubId ?? "global";
    const raw = localStorage.getItem(`${TEAMS_STORAGE_PREFIX}_${teamsClubScopeId}`);
    const parsed = safeParseJson<ContinuityTeam[] | null>(raw, null);
    const nextTeams = Array.isArray(parsed)
      ? parsed
          .filter((t) => t && typeof t.id === "string" && typeof t.name === "string")
          .map((t) => ({ id: t.id, name: t.name, stage: t.stage }))
      : [];

    // Sandbox: si no hay equipos de metodología, usar el único equipo promo (Mi equipo).
    if (nextTeams.length === 0 && continuityEnv === "sandbox") {
      const promo = safeParseJson<any>(localStorage.getItem("synq_promo_team"), null);
      const promoName = String(promo?.name || "").trim();
      const promoCategory = String(promo?.category || "").trim();
      const displayName = promoName || promoCategory || "Equipo Sandbox";
      const fallbackTeam: ContinuityTeam = { id: "promo_team", name: displayName };
      setTeams([fallbackTeam]);
      setSelectedTeamId((prev) => prev || fallbackTeam.id);

      // También cargar partidos sandbox para poder seleccionarlos en modo partido.
      const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { matches: [] });
      const matches = Array.isArray(vault?.matches) ? (vault.matches as PromoMatch[]) : [];
      setPromoMatches(matches);
      if (!selectedPromoMatchId) {
        const first = matches.find((m) => (m.status || "").toLowerCase() === "scheduled") ?? matches[0];
        if (first?.id != null) applyPromoMatchContext(String(first.id));
      }
      return;
    }

    setTeams(nextTeams);
    if (nextTeams[0]?.id) setSelectedTeamId((prev) => prev || nextTeams[0].id);
  }, [profile?.clubId, timerSyncKey, scoreSyncKey]);

  // Mantener lista de partidos Sandbox fresca si se modifica el vault en otra pestaña.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isSandboxMatchMode) return;
    const load = () => {
      const vault = safeParseJson<any>(localStorage.getItem("synq_promo_vault"), { matches: [] });
      const matches = Array.isArray(vault?.matches) ? (vault.matches as PromoMatch[]) : [];
      setPromoMatches(matches);
      if (!selectedPromoMatchId) {
        const first = matches.find((m) => (m.status || "").toLowerCase() === "scheduled") ?? matches[0];
        if (first?.id != null) applyPromoMatchContext(String(first.id));
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "synq_promo_vault" || e.key === null) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isSandboxMatchMode, selectedPromoMatchId]);

  useEffect(() => {
    const selectedName = selectedTeam?.name;
    if (!selectedName) {
      setRoster([]);
      return;
    }
    try {
      const all = readPlayersLocal(clubScopeId) as PlayerRow[];
      const teamParsed = parseTeamName(selectedName);
      const nextRoster = all
        .filter((p) => {
          const cat = String(p.category || "").trim().toLowerCase();
          const suffix = String(p.teamSuffix || "").trim().toUpperCase();
          if (cat !== String(teamParsed.category || "").trim().toLowerCase()) return false;
          if (!teamParsed.teamSuffix) return true;
          return suffix === teamParsed.teamSuffix;
        })
        .map((p, idx) => ({
          id: p.id || `pl-${idx}`,
          name: [p.name, p.surname].filter(Boolean).join(" ").trim() || p.nickname || `Jugador ${idx + 1}`,
          number: Number(p.number) || idx + 1,
        }))
        .sort((a, b) => a.number - b.number);
      setRoster(nextRoster);
    } catch {
      setRoster([]);
    }
  }, [clubScopeId, selectedTeam?.name]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(attendanceStorageKey);
      if (!raw) {
        setAttendance({});
        return;
      }
      const parsed = JSON.parse(raw) as { attendance?: Record<string, "present" | "absent"> };
      setAttendance(parsed?.attendance && typeof parsed.attendance === "object" ? parsed.attendance : {});
    } catch {
      setAttendance({});
    }
  }, [attendanceStorageKey]);

  useEffect(() => {
    localStorage.setItem(
      attendanceStorageKey,
      JSON.stringify({ attendance, updatedAt: new Date().toISOString() }),
    );
  }, [attendanceStorageKey, attendance]);

  useEffect(() => {
    if (!running) return;
    lastTickAtRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const last = lastTickAtRef.current ?? now;
      const deltaSec = Math.max(0, Math.floor((now - last) / 1000));
      if (deltaSec <= 0) return;
      lastTickAtRef.current = last + deltaSec * 1000;
      setRemainingSec((prev) => {
        const next = Math.max(0, prev - deltaSec);
        lastTimerAppliedRef.current = now;
        // La continuidad no es el "watch": escribe para sincronizar el reloj con el hub móvil.
        // Marcarlo como origin "continuity" evita que el smartwatch lo trate como escritura propia.
        writeMatchTimerSync(
          { remainingSec: next, running: next > 0, updatedAt: now, origin: "continuity" as any },
          timerSyncKey,
        );
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, timerSyncKey]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === timerSyncKey || e.key === null) {
        const remote = readMatchTimerSync(timerSyncKey);
        if (shouldApplyRemoteTimer(remote, lastTimerAppliedRef.current)) {
          lastTimerAppliedRef.current = remote.updatedAt;
          setRemainingSec(Math.max(0, remote.remainingSec));
          setRunning(Boolean(remote.running));
        }
      }
      if (e.key === scoreSyncKey || e.key === null) {
        const remote = readMatchScoreSync(scoreSyncKey);
        if (shouldApplyRemoteScore(remote, lastScoreAppliedRef.current)) {
          lastScoreAppliedRef.current = remote.updatedAt;
          setScore({ home: Math.max(0, remote.home), guest: Math.max(0, remote.guest) });
        }
      }
    };
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("storage", onStorage);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [timerSyncKey, scoreSyncKey]);

  const changeScore = (dh: number, dg: number) => {
    setScore((prev) => {
      const next = {
        home: Math.max(0, prev.home + dh),
        guest: Math.max(0, prev.guest + dg),
      };
      const now = Date.now();
      lastScoreAppliedRef.current = now;
      writeMatchScoreSync({ ...next, updatedAt: now, origin: "watch" }, scoreSyncKey);
      return next;
    });
  };

  const toggleTimer = () => {
    setRunning((prev) => {
      const next = !prev;
      const now = Date.now();
      if (next) lastTickAtRef.current = now;
      lastTimerAppliedRef.current = now;
      // Ver comentario superior: origin "continuity".
      writeMatchTimerSync(
        { remainingSec, running: next, updatedAt: now, origin: "continuity" as any },
        timerSyncKey,
      );
      return next;
    });
  };

  const resetTimer = () => {
    const sec = readMatchTimerPresetMinutes(45) * 60;
    setRemainingSec(sec);
    setRunning(false);
    lastTickAtRef.current = null;
    const now = Date.now();
    lastTimerAppliedRef.current = now;
    // Ver comentario superior: origin "continuity".
    writeMatchTimerSync(
      { remainingSec: sec, running: false, updatedAt: now, origin: "continuity" as any },
      timerSyncKey,
    );
  };

  const sendIncident = async (incident: Incident) => {
    const localIncidentId = await insertIncident("continuity", "mobile_continuity", {
      incidentId: incident.id,
      incidentLabel: incident.label,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
      score,
      remainingSec,
      cloudSyncEnabled,
    });
    const syncKey = `continuity:${localIncidentId}`;

    const pending = {
      syncKey,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
      incidentId: incident.id,
      incidentLabel: incident.label,
      score: { home: score.home, guest: score.guest },
      remainingSec,
      source: "mobile_continuity",
    };
    enqueueContinuityIncidentSync(pending);

    synqSync.trackEvent("session_save", {
      source: "mobile_continuity",
      kind: "incident",
      incidentId: incident.id,
      incidentLabel: incident.label,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
      score,
      remainingSec,
    });

    if (cloudSyncEnabled && session?.access_token) {
      try {
        const promoted = await promoteContinuityIncident(session.access_token, pending);
        if (promoted.ok) {
          removeContinuityIncidentFromQueue(syncKey);
        }
      } catch {
        /* cola local synq_continuity_pending_incidents_v1 */
      }
    }

    toast({
      title: "INCIDENCIA_ENCOLADA",
      description: `${incident.label} registrada (${selectedMcc} ${selectedSession}).`,
    });
    void fetchIncidentHistory();
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "COPIADO", description: `${label} copiado al portapapeles.` });
    } catch {
      toast({ title: "NO_COPIADO", description: "No se pudo copiar. Mantén pulsado para copiar manualmente." });
    }
  };

  const handleShareToWatch = async () => {
    try {
      if (!("share" in navigator)) {
        await handleCopy(watchUrl, "Enlace");
        return;
      }
      await (navigator as unknown as { share: (data: { title?: string; text?: string; url?: string }) => Promise<void> }).share({
        title: "SynqAI Smartwatch",
        text: "Abrir smartwatch (Continuidad)",
        url: watchUrl,
      });
    } catch {
      // Si el usuario cancela share, no hacemos ruido.
    }
  };

  const pendingEvents = useMemo(() => synqSync.getPendingCount(), [isOnline, score.home, score.guest, remainingSec]);

  const fetchIncidentHistory = async () => {
    if (!session?.access_token) return;
    setLoadingHistory(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (!historyAllClub) {
        params.set("mcc", selectedMcc);
        params.set("session", selectedSession);
        if (selectedTeamId) params.set("teamId", selectedTeamId);
      }
      const res = await fetch(`/api/operativa/incidents?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { incidents?: IncidentHistoryItem[] };
      setHistory(Array.isArray(data?.incidents) ? data.incidents : []);
    } catch {
      // Sin cortar UX; dejamos la última lista válida.
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    void fetchIncidentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token, selectedTeamId, selectedMcc, selectedSession, historyAllClub]);

  useEffect(() => {
    if (!cloudSyncEnabled || !session?.access_token) return;
    void flushContinuityIncidentQueue(session.access_token).then(() => void fetchIncidentHistory());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudSyncEnabled, session?.access_token]);

  useEffect(() => {
    if (!cloudSyncEnabled || !session?.access_token) return;
    const onOnline = () => {
      void flushContinuityIncidentQueue(session.access_token).then(() => void fetchIncidentHistory());
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [cloudSyncEnabled, session?.access_token]);

  const setPlayerAttendance = async (playerId: string, status: "present" | "absent") => {
    setAttendance((prev) => ({ ...prev, [playerId]: status }));
    synqSync.trackEvent("session_save", {
      source: "mobile_continuity",
      kind: "attendance",
      playerId,
      attendance: status,
      teamId: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    });
    if (cloudSyncEnabled && session?.access_token && selectedTeamId && profile?.clubId) {
      await upsertOperativaAttendance({
        clubId: profile.clubId,
        teamId: selectedTeamId,
        mcc: selectedMcc,
        session: selectedSession,
        playerId,
        status,
        updatedBy: session.user?.id ?? null,
      });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      <div
        className={cn(
          "flex flex-col gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none",
          PANEL_OUTER,
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Smartphone className={cn(iconCyan, "h-6 w-6 shrink-0 mt-0.5")} />
            <div className="min-w-0 space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de continuidad</p>
              <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Consola móvil de respaldo</h1>
              <p className="text-[10px] uppercase text-slate-500 font-bold leading-relaxed max-w-xl">
                {mode === "match"
                  ? "Partido: marcador, cronómetro, incidencias y enlace con reloj."
                  : "Entreno: asistencia e incidencias de sesión."}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 rounded-none border text-[9px] uppercase font-black tracking-widest self-start sm:self-center",
              continuityEnv === "elite"
                ? "border-cyan-400/30 text-cyan-200 bg-cyan-500/10"
                : "border-sky-500/30 text-sky-300 bg-sky-500/5",
            )}
          >
            {continuityEnv === "elite" ? "Elite / Pro" : "Sandbox"}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row flex-wrap gap-3 lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-9 rounded-none font-black uppercase text-[10px] tracking-widest border",
                mode === "match"
                  ? "border-cyan-400/40 bg-cyan-500 text-black shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:bg-cyan-400"
                  : "border-white/10 bg-slate-950/40 text-white/80 hover:border-cyan-400/25",
              )}
              onClick={() => setMode("match")}
            >
              <Timer className="h-4 w-4 mr-2" /> Partido
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-9 rounded-none font-black uppercase text-[10px] tracking-widest border",
                mode === "training"
                  ? "border-emerald-400/40 bg-emerald-500 text-black shadow-[0_0_14px_rgba(16,185,129,0.35)] hover:bg-emerald-400"
                  : "border-white/10 bg-slate-950/40 text-white/80 hover:border-emerald-400/25",
              )}
              onClick={() => setMode("training")}
            >
              <Dumbbell className="h-4 w-4 mr-2" /> Entreno
            </Button>
            {continuityEnv === "sandbox" ? (
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-9 rounded-none font-black uppercase text-[10px] tracking-widest border",
                  panel === "watchSettings"
                    ? "border-violet-400/40 bg-violet-500 text-black hover:bg-violet-400"
                    : "border-white/10 bg-slate-950/40 text-white/80 hover:border-violet-400/30",
                )}
                onClick={() => setPanel((p) => (p === "watchSettings" ? "ops" : "watchSettings"))}
              >
                <Watch className="h-4 w-4 mr-2" /> Ajustes watch
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={cloudSyncEnabled} onCheckedChange={setCloudSyncEnabled} />
              <span className="text-[9px] uppercase text-slate-500 font-black tracking-wide">
                Sync cloud: <span className="text-cyan-200/90">{cloudSyncEnabled ? "ON" : "OFF"}</span>
              </span>
            </div>
            <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-none border-white/10 text-cyan-200/80 font-black uppercase text-[10px] tracking-widest hover:border-cyan-400/30"
                >
                  Ayuda
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none bg-[#050812]/98 backdrop-blur-2xl border border-white/10 text-white max-w-lg z-[200]">
                <DialogHeader>
                  <DialogTitle className="text-white uppercase font-black tracking-widest text-sm">Guía rápida</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase text-slate-500 font-bold leading-relaxed text-left">
                    Respaldo móvil sin tablet. Local siempre; con Sync cloud también en Supabase.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-[10px] uppercase font-bold text-slate-500">
                  <div className="rounded-none border border-white/10 bg-slate-950/50 p-4 space-y-2">
                    <p className="text-cyan-200/90 font-black tracking-widest">¿Qué es MCC?</p>
                    <p className="leading-relaxed normal-case text-slate-400">
                      Código de semana/bloque (ej. OCT_W1) para ordenar incidencias y asistencia.
                    </p>
                  </div>
                  <div className="rounded-none border border-white/10 bg-slate-950/50 p-4 space-y-2">
                    <p className="text-cyan-200/90 font-black tracking-widest">Incidencias</p>
                    <p className="leading-relaxed normal-case text-slate-400">
                      Cola local offline; con Sync ON se envían a /api/operativa/incidents (operativa_mobile_incidents).
                    </p>
                  </div>
                  <div className="rounded-none border border-white/10 bg-slate-950/50 p-4 space-y-2">
                    <p className="text-cyan-200/90 font-black tracking-widest">Reloj sin cámara</p>
                    <p className="leading-relaxed normal-case text-slate-400">
                      Usa el código manual en el reloj; el QR es para móvil con cámara.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <PromoAdsPanel placement="sandbox_continuity_page_horizontal" />

      {continuityEnv === "sandbox" && panel === "watchSettings" && (
        <HubPanel>
          <SectionBar
            title="Ajustes smartwatch (sandbox)"
            right={<Watch className="h-4 w-4 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.45)]" />}
          />
          <div className="p-4 sm:p-5 space-y-4">
            <p className="text-[10px] uppercase text-slate-500 font-bold leading-relaxed">
              Avisos locales por contexto. No altera el canal de sync de cronómetro/marcador.
            </p>
            <div className="flex items-center justify-between rounded-none border border-white/10 bg-slate-950/40 p-3">
              <div>
                <p className="text-[10px] font-black uppercase text-white">Avisos activos</p>
                <p className="text-[9px] uppercase text-slate-500">Master switch</p>
              </div>
              <Switch
                checked={watchSettings.enabled}
                onCheckedChange={(v) => setWatchSettings((prev: WatchAlertsConfig) => ({ ...prev, enabled: v }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-none border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[10px] font-black uppercase text-white">Aviso de tiempo</p>
                <Switch
                  checked={watchSettings.alertMatchTime}
                  onCheckedChange={(v) =>
                    setWatchSettings((prev: WatchAlertsConfig) => ({ ...prev, alertMatchTime: v }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-none border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[10px] font-black uppercase text-white">Sugerir cambios</p>
                <Switch
                  checked={watchSettings.syncSubs}
                  onCheckedChange={(v) => setWatchSettings((prev: WatchAlertsConfig) => ({ ...prev, syncSubs: v }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-none border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[10px] font-black uppercase text-white">Vibración periodo</p>
                <Switch
                  checked={watchSettings.vibrateOnPeriod}
                  onCheckedChange={(v) =>
                    setWatchSettings((prev: WatchAlertsConfig) => ({ ...prev, vibrateOnPeriod: v }))
                  }
                />
              </div>
              <div className="space-y-2 rounded-none border border-white/10 bg-slate-950/40 p-3">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Intervalo cambios</Label>
                <Select
                  value={watchSettings.changeInterval}
                  onValueChange={(v: "5" | "8" | "half") =>
                    setWatchSettings((prev: WatchAlertsConfig) => ({ ...prev, changeInterval: v }))
                  }
                >
                  <SelectTrigger className={selectTriggerHub}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentHub}>
                    <SelectItem value="5" className="rounded-none text-[10px] font-black uppercase">
                      Cada 5 min
                    </SelectItem>
                    <SelectItem value="8" className="rounded-none text-[10px] font-black uppercase">
                      Cada 8 min
                    </SelectItem>
                    <SelectItem value="half" className="rounded-none text-[10px] font-black uppercase">
                      Mitad de tiempo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-[9px] uppercase text-slate-600 font-mono break-all">
              Scope: {watchAlertScope.clubId} · {watchAlertScope.teamId} · {watchAlertScope.mcc} · {watchAlertScope.session} ·{" "}
              {watchAlertScope.mode}
            </p>
          </div>
        </HubPanel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <HubPanel>
          <SectionBar
            title={mode === "match" ? "Partido en vivo" : "Entrenamiento"}
            right={
              mode === "match" ? (
                <Timer className={iconCyan} />
              ) : (
                <Dumbbell className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
              )
            }
          />
          <div className="p-4 sm:p-5 space-y-5">
            <p className="text-[10px] uppercase text-slate-500 font-bold">
              {mode === "match" ? "Cronómetro y marcador" : "Contexto de sesión (asistencia e incidencias)"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Equipo</Label>
                {continuityEnv === "sandbox" ? (
                  <div className="h-9 rounded-none border border-white/10 bg-slate-950/45 px-3 flex items-center backdrop-blur-md">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                      {selectedTeam?.name || "Pendiente de configurar"}
                    </span>
                  </div>
                ) : (
                  <Select value={selectedTeamId || undefined} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className={selectTriggerHub}>
                      <SelectValue placeholder="Selecciona equipo" />
                    </SelectTrigger>
                    <SelectContent className={selectContentHub}>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} className="rounded-none text-[10px] font-black uppercase">
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {isSandboxMatchMode ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Partido (sandbox)</Label>
                  <Select value={selectedPromoMatchId || undefined} onValueChange={(v) => applyPromoMatchContext(v)}>
                    <SelectTrigger className={selectTriggerHub}>
                      <SelectValue placeholder="Selecciona tu partido" />
                    </SelectTrigger>
                    <SelectContent className={selectContentHub}>
                      {promoMatchOptions.length === 0 ? (
                        <SelectItem value="__none" disabled className="rounded-none text-[10px]">
                          No hay partidos (Mis partidos)
                        </SelectItem>
                      ) : (
                        promoMatchOptions.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="rounded-none text-[10px] font-black uppercase">
                            {m.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[9px] uppercase text-slate-600 font-bold">Contexto de sync con smartwatch.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">
                      {mode === "match" ? "Jornada / clave" : "Semana (MCC)"}
                    </Label>
                    <Select value={selectedMcc} onValueChange={setSelectedMcc}>
                      <SelectTrigger className={selectTriggerHub}>
                        <SelectValue placeholder={mode === "match" ? "Clave" : "MCC"} />
                      </SelectTrigger>
                      <SelectContent className={selectContentHub}>
                        {mccOptions.map((mcc) => (
                          <SelectItem key={mcc} value={mcc} className="rounded-none text-[10px] font-black uppercase">
                            {mcc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">
                      {mode === "match" ? "Bloque" : "Sesión"}
                    </Label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger className={selectTriggerHub}>
                        <SelectValue placeholder={mode === "match" ? "Bloque" : "Sesión"} />
                      </SelectTrigger>
                      <SelectContent className={selectContentHub}>
                        <SelectItem value="S1" className="rounded-none text-[10px] font-black uppercase">
                          S1
                        </SelectItem>
                        <SelectItem value="S2" className="rounded-none text-[10px] font-black uppercase">
                          S2
                        </SelectItem>
                        <SelectItem value="S3" className="rounded-none text-[10px] font-black uppercase">
                          S3
                        </SelectItem>
                        <SelectItem value="S4" className="rounded-none text-[10px] font-black uppercase">
                          S4
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            {mode === "match" ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-none font-mono text-lg font-black px-4 py-2 border-cyan-400/30 text-cyan-300 bg-slate-950/50 shadow-[0_0_14px_rgba(34,211,238,0.25)]"
                  >
                    {formatClock(remainingSec)}
                  </Badge>
                  <Button
                    variant="outline"
                    onClick={toggleTimer}
                    className="rounded-none border-white/10 bg-slate-950/40 h-10 w-10 p-0 hover:border-cyan-400/35"
                  >
                    {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTimer}
                    className="rounded-none border-white/10 bg-slate-950/40 h-10 w-10 p-0 hover:border-cyan-400/35"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ScorePad
                    title="Local"
                    value={score.home}
                    onInc={() => changeScore(1, 0)}
                    onDec={() => changeScore(-1, 0)}
                  />
                  <ScorePad
                    title="Visitante"
                    value={score.guest}
                    onInc={() => changeScore(0, 1)}
                    onDec={() => changeScore(0, -1)}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-none border border-emerald-500/25 bg-emerald-500/5 p-4">
                <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest">
                  Foco: asistencia + incidencias (sin marcador).
                </p>
              </div>
            )}
          </div>
        </HubPanel>

        <HubPanel>
          <SectionBar
            title={mode === "match" ? "Incidencias · partido" : "Incidencias · entreno"}
            right={<AlertTriangle className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]" />}
          />
          <div className="p-4 sm:p-5 space-y-2">
            {INCIDENTS.map((i) => (
              <Button
                key={i.id}
                variant="outline"
                className="w-full justify-start rounded-none text-[10px] uppercase font-black border-white/10 bg-slate-950/35 hover:border-cyan-400/30 hover:bg-cyan-500/5"
                onClick={() => sendIncident(i)}
              >
                {i.label}
              </Button>
            ))}
          </div>
        </HubPanel>
      </div>

      <HubPanel>
        <SectionBar
          title="Emparejado móvil · reloj"
          right={<QrCode className="h-4 w-4 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]" />}
        />
        <div className="p-4 sm:p-6 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase text-slate-500 font-bold text-center max-w-md">
            Escanea con cámara o introduce el código manual en el reloj.
          </p>
          <div className="rounded-none border border-white/10 bg-white p-2 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
            <QRCodeCanvas value={watchUrl || "about:blank"} size={180} level="H" fgColor="#000000" bgColor="#ffffff" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              className="h-9 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:bg-cyan-400"
              onClick={() => window.open(watchUrl, "_blank", "noopener,noreferrer")}
            >
              <Watch className="h-4 w-4 mr-2" /> Abrir smartwatch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-none border-white/10 bg-slate-950/40 text-cyan-100/90 font-black uppercase text-[10px]"
              onClick={handleShareToWatch}
            >
              <Share2 className="h-4 w-4 mr-2" /> Enviar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-none border-white/10 bg-slate-950/40 text-cyan-100/90 font-black uppercase text-[10px]"
              onClick={() => void handleCopy(watchUrl, "Enlace")}
            >
              <Copy className="h-4 w-4 mr-2" /> Copiar enlace
            </Button>
          </div>
          <div className="w-full max-w-md rounded-none border border-white/10 bg-slate-950/45 backdrop-blur-md p-4">
            <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest text-center">Código manual (reloj)</p>
            <p className="mt-2 text-center font-mono text-2xl font-black tracking-[0.25em] text-cyan-200 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
              {watchPairingCode || "------"}
            </p>
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-none border-white/10 font-black uppercase text-[10px]"
                onClick={() => void handleCopy(watchPairingCode || "", "Código")}
                disabled={!watchPairingCode}
              >
                <Copy className="h-4 w-4 mr-2" /> Copiar código
              </Button>
            </div>
          </div>
          <p className="text-[9px] uppercase text-slate-600 break-all text-center font-mono max-w-full">{watchUrl}</p>
        </div>
      </HubPanel>

      {mode === "training" && (
        <HubPanel>
          <SectionBar title="Pasar lista (móvil)" right={<CheckCircle2 className="h-4 w-4 text-emerald-400" />} />
          <div className="p-4 sm:p-5 space-y-2">
            <p className="text-[10px] uppercase text-slate-500 font-bold pb-2">
              Local por defecto; cloud si activas Sync.
            </p>
            {roster.length === 0 ? (
              <p className="text-[10px] uppercase text-slate-600">Sin jugadores para el equipo seleccionado.</p>
            ) : (
              roster.map((p) => {
                const mark = attendance[p.id];
                return (
                  <div
                    key={p.id}
                    className="rounded-none border border-white/10 bg-slate-950/35 backdrop-blur-md p-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate uppercase">
                        #{p.number} {p.name}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "h-8 rounded-none text-[10px] font-black uppercase border-white/10",
                          mark === "absent" && "border-rose-500/40 text-rose-300 bg-rose-500/10",
                        )}
                        onClick={() => void setPlayerAttendance(p.id, "absent")}
                      >
                        Aus
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          "h-8 rounded-none text-[10px] font-black uppercase border-0",
                          mark === "present"
                            ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                            : "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.35)]",
                        )}
                        onClick={() => void setPlayerAttendance(p.id, "present")}
                      >
                        OK
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </HubPanel>
      )}

      <HubPanel>
        <SectionBar
          title="Histórico incidencias"
          right={
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] uppercase text-slate-500 font-black hidden sm:inline">Todo club</span>
              <Switch checked={historyAllClub} onCheckedChange={setHistoryAllClub} />
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-none border-white/10 text-[10px] font-black uppercase"
                onClick={() => void fetchIncidentHistory()}
                disabled={loadingHistory}
              >
                <RefreshCcw className={cn("h-3 w-3 mr-1", loadingHistory && "animate-spin")} />
                Refrescar
              </Button>
            </div>
          }
        />
        <div className="px-4 py-2 border-b border-white/10">
          <p className="text-[9px] uppercase text-slate-600 font-bold">
            {historyAllClub
              ? "Vista global club"
              : `Filtro: ${selectedTeamId || "equipo"} · ${selectedMcc} · ${selectedSession}`}
          </p>
        </div>
        <div className="p-4 sm:p-5 space-y-2">
          {!session?.access_token ? (
            <p className="text-[10px] uppercase text-slate-600">Inicia sesión para ver histórico en Supabase.</p>
          ) : history.length === 0 ? (
            <p className="text-[10px] uppercase text-slate-600">Sin incidencias en este filtro.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-none border border-white/10 bg-slate-950/35 p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase">
                  <Badge variant="outline" className="rounded-none border-amber-500/35 text-amber-300 bg-amber-500/5">
                    {item.incident_label}
                  </Badge>
                  <Badge variant="outline" className="rounded-none border-white/15 text-slate-400">
                    {item.mcc} {item.session}
                  </Badge>
                  <Badge variant="outline" className="rounded-none border-white/15 text-slate-500 font-mono">
                    {item.team_id}
                  </Badge>
                </div>
                <p className="mt-2 text-[10px] uppercase text-slate-500 font-mono">
                  Marcador {item.score_home}-{item.score_guest} · {formatClock(item.remaining_sec)} ·{" "}
                  {new Date(item.created_at).toLocaleString("es-ES")}
                </p>
              </div>
            ))
          )}
        </div>
      </HubPanel>

      <div
        className={cn(
          "flex flex-wrap items-center gap-3 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none",
          PANEL_OUTER,
        )}
      >
        <Badge
          variant="outline"
          className={cn(
            "rounded-none border-white/15 font-black uppercase text-[10px]",
            isOnline ? "text-emerald-400 border-emerald-500/30" : "text-amber-400 border-amber-500/30",
          )}
        >
          {isOnline ? <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : <WifiOff className="h-3 w-3 mr-1 inline" />}
          {isOnline ? "Online" : "Offline"}
        </Badge>
        <Badge variant="outline" className="rounded-none border-cyan-400/30 text-cyan-200 font-black uppercase text-[10px]">
          Cola: {pendingEvents}
        </Badge>
        <Badge variant="outline" className="rounded-none border-white/15 text-slate-400 font-black uppercase text-[10px]">
          <Watch className="h-3 w-3 mr-1 inline text-cyan-400" /> Tablet + móvil
        </Badge>
      </div>
    </div>
  );
}

function ScorePad({
  title,
  value,
  onInc,
  onDec,
}: {
  title: string;
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="rounded-none border border-white/10 p-4 bg-slate-950/40 backdrop-blur-md space-y-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{title}</p>
      <p className="font-mono text-4xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_14px_rgba(34,211,238,0.45)]">
        {value}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-none border-white/10 bg-slate-950/50 h-10 hover:border-cyan-400/30"
          onClick={onDec}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          className="flex-1 rounded-none bg-cyan-500 text-black font-black border-0 h-10 shadow-[0_0_18px_rgba(6,182,212,0.5)] hover:bg-cyan-400"
          onClick={onInc}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
