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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  MATCH_TIMER_SYNC_KEY,
  readMatchTimerPresetMinutes,
  readMatchTimerSync,
  shouldApplyRemoteTimer,
  writeMatchTimerSync,
} from "@/lib/match-timer-sync";
import {
  MATCH_SCORE_SYNC_KEY,
  readMatchScoreSync,
  shouldApplyRemoteScore,
  writeMatchScoreSync,
} from "@/lib/match-score-sync";
import { synqSync } from "@/lib/sync-service";
import { upsertOperativaAttendance } from "@/lib/operativa-sync";
import { readPlayersLocal } from "@/lib/player-storage";

type Incident = {
  id: string;
  label: string;
};

type ContinuityTeam = {
  id: string;
  name: string;
  stage?: string;
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

export default function MobileContinuityPage() {
  const { toast } = useToast();
  const { profile, session } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [score, setScore] = useState({ home: 0, guest: 0 });
  const [remainingSec, setRemainingSec] = useState(45 * 60);
  const [running, setRunning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [teams, setTeams] = useState<ContinuityTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedMcc, setSelectedMcc] = useState<string>("OCT_W1");
  const [selectedSession, setSelectedSession] = useState<string>("S1");
  const [history, setHistory] = useState<IncidentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyAllClub, setHistoryAllClub] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [roster, setRoster] = useState<SessionRosterPlayer[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>({});
  const lastTimerAppliedRef = useRef(0);
  const lastScoreAppliedRef = useRef(0);

  const players = useMemo(() => readPlayersLocal(clubScopeId), [clubScopeId]);

  const watchUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/smartwatch`;
    const params = new URLSearchParams({
      mode: "continuity",
      team: selectedTeamId || "team_unknown",
      mcc: selectedMcc,
      session: selectedSession,
    });
    return `${base}?${params.toString()}`;
  }, [selectedTeamId, selectedMcc, selectedSession]);

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
    const remoteTimer = readMatchTimerSync();
    if (remoteTimer) {
      setRemainingSec(Math.max(0, remoteTimer.remainingSec));
      setRunning(Boolean(remoteTimer.running));
      lastTimerAppliedRef.current = remoteTimer.updatedAt;
    }
    const remoteScore = readMatchScoreSync();
    if (remoteScore) {
      setScore({ home: Math.max(0, remoteScore.home), guest: Math.max(0, remoteScore.guest) });
      lastScoreAppliedRef.current = remoteScore.updatedAt;
    }
    const clubScopeId = profile?.clubId ?? "global";
    const raw = localStorage.getItem(`${TEAMS_STORAGE_PREFIX}_${clubScopeId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ContinuityTeam[];
      const nextTeams = Array.isArray(parsed)
        ? parsed
            .filter((t) => t && typeof t.id === "string" && typeof t.name === "string")
            .map((t) => ({ id: t.id, name: t.name, stage: t.stage }))
        : [];
      setTeams(nextTeams);
      if (nextTeams[0]?.id) setSelectedTeamId(nextTeams[0].id);
    } catch {
      // fallback silencioso
    }
  }, [profile?.clubId]);

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
    const id = window.setInterval(() => {
      setRemainingSec((prev) => {
        const next = Math.max(0, prev - 1);
        const now = Date.now();
        lastTimerAppliedRef.current = now;
        writeMatchTimerSync({ remainingSec: next, running: next > 0, updatedAt: now, origin: "watch" });
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === MATCH_TIMER_SYNC_KEY || e.key === null) {
        const remote = readMatchTimerSync();
        if (shouldApplyRemoteTimer(remote, lastTimerAppliedRef.current)) {
          lastTimerAppliedRef.current = remote.updatedAt;
          setRemainingSec(Math.max(0, remote.remainingSec));
          setRunning(Boolean(remote.running));
        }
      }
      if (e.key === MATCH_SCORE_SYNC_KEY || e.key === null) {
        const remote = readMatchScoreSync();
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
  }, []);

  const changeScore = (dh: number, dg: number) => {
    setScore((prev) => {
      const next = {
        home: Math.max(0, prev.home + dh),
        guest: Math.max(0, prev.guest + dg),
      };
      const now = Date.now();
      lastScoreAppliedRef.current = now;
      writeMatchScoreSync({ ...next, updatedAt: now, origin: "watch" });
      return next;
    });
  };

  const toggleTimer = () => {
    setRunning((prev) => {
      const next = !prev;
      const now = Date.now();
      lastTimerAppliedRef.current = now;
      writeMatchTimerSync({ remainingSec, running: next, updatedAt: now, origin: "watch" });
      return next;
    });
  };

  const resetTimer = () => {
    const sec = readMatchTimerPresetMinutes(45) * 60;
    setRemainingSec(sec);
    setRunning(false);
    const now = Date.now();
    lastTimerAppliedRef.current = now;
    writeMatchTimerSync({ remainingSec: sec, running: false, updatedAt: now, origin: "watch" });
  };

  const sendIncident = async (incident: Incident) => {
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
        await fetch("/api/operativa/incidents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            teamId: selectedTeamId || "team_unknown",
            mcc: selectedMcc,
            session: selectedSession,
            incidentId: incident.id,
            incidentLabel: incident.label,
            score,
            remainingSec,
            source: "mobile_continuity",
          }),
        });
      } catch {
        // Si falla remoto, la cola offline ya lo retiene.
      }
    }

    toast({
      title: "INCIDENCIA_ENCOLADA",
      description: `${incident.label} registrada (${selectedMcc} ${selectedSession}).`,
    });
    void fetchIncidentHistory();
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
    <div className="space-y-6 animate-in fade-in duration-500 p-4 sm:p-6 lg:p-10">
      <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary tracking-[0.4em] uppercase">Modo_Continuidad</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Consola Móvil de Respaldo</h1>
        <p className="text-[10px] uppercase text-white/40 font-bold">
          Coexiste con tablet y smartwatch. Si no hay tablet, el móvil mantiene la operativa.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Switch checked={cloudSyncEnabled} onCheckedChange={setCloudSyncEnabled} />
          <span className="text-[10px] uppercase text-white/60 font-black">
            Sync cloud (Supabase): {cloudSyncEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-panel border-primary/20 bg-primary/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white uppercase text-sm tracking-widest flex items-center gap-2">
              <Timer className="h-4 w-4 text-primary" /> Partido en vivo
            </CardTitle>
            <CardDescription className="text-[10px] uppercase text-white/40">
              Mando rápido para cronómetro y marcador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-white/50">Equipo</Label>
                <Select value={selectedTeamId || undefined} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="h-9 border-white/10">
                    <SelectValue placeholder="Selecciona equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-white/50">MCC</Label>
                <Select value={selectedMcc} onValueChange={setSelectedMcc}>
                  <SelectTrigger className="h-9 border-white/10">
                    <SelectValue placeholder="MCC" />
                  </SelectTrigger>
                  <SelectContent>
                    {mccOptions.map((mcc) => (
                      <SelectItem key={mcc} value={mcc}>
                        {mcc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-white/50">Sesión</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger className="h-9 border-white/10">
                    <SelectValue placeholder="Sesión" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S1">S1</SelectItem>
                    <SelectItem value="S2">S2</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                    <SelectItem value="S4">S4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="text-lg font-black px-4 py-2 border-primary/20 text-primary">
                {formatClock(remainingSec)}
              </Badge>
              <Button variant="outline" onClick={toggleTimer} className="border-white/10">
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={resetTimer} className="border-white/10">
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
          </CardContent>
        </Card>

        <Card className="glass-panel border-amber-500/20 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-white uppercase text-sm tracking-widest flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Incidencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {INCIDENTS.map((i) => (
              <Button
                key={i.id}
                variant="outline"
                className="w-full justify-start text-[10px] uppercase font-black border-white/10"
                onClick={() => sendIncident(i)}
              >
                {i.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-indigo-500/20 bg-indigo-500/5">
        <CardHeader>
          <CardTitle className="text-white uppercase text-sm tracking-widest flex items-center gap-2">
            <QrCode className="h-4 w-4 text-indigo-300" /> Emparejado móvil - reloj
          </CardTitle>
          <CardDescription className="text-[10px] uppercase text-white/40">
            Escanea para abrir el smartwatch con el contexto actual
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <div className="rounded-xl bg-white p-2">
            <QRCodeCanvas value={watchUrl || "about:blank"} size={180} level="H" fgColor="#000000" bgColor="#ffffff" />
          </div>
          <p className="text-[10px] uppercase text-white/50 break-all text-center">{watchUrl}</p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="text-white uppercase text-sm tracking-widest">Pasar lista (móvil)</CardTitle>
          <CardDescription className="text-[10px] uppercase text-white/40">
            Offline por defecto. Se guarda en local y solo sincroniza cloud si activas el switch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {roster.length === 0 ? (
            <p className="text-[10px] uppercase text-white/40">Sin jugadores para el equipo seleccionado.</p>
          ) : (
            roster.map((p) => {
              const mark = attendance[p.id];
              return (
                <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">#{p.number} {p.name}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn("h-8 border-white/10 text-[10px] uppercase", mark === "absent" && "border-red-500/40 text-red-300")}
                      onClick={() => void setPlayerAttendance(p.id, "absent")}
                    >
                      Aus
                    </Button>
                    <Button
                      size="sm"
                      className={cn("h-8 text-[10px] uppercase", mark === "present" ? "bg-emerald-500 text-black" : "bg-primary text-black")}
                      onClick={() => void setPlayerAttendance(p.id, "present")}
                    >
                      OK
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10 bg-black/20">
        <CardHeader>
          <CardTitle className="text-white uppercase text-sm tracking-widest flex items-center justify-between gap-2">
            <span>Histórico incidencias</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-white/50">Todo club</span>
              <Switch checked={historyAllClub} onCheckedChange={setHistoryAllClub} />
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/10 text-[10px] uppercase"
                onClick={() => void fetchIncidentHistory()}
                disabled={loadingHistory}
              >
                <RefreshCcw className={cn("h-3 w-3 mr-1", loadingHistory && "animate-spin")} />
                Refrescar
              </Button>
            </div>
          </CardTitle>
          <CardDescription className="text-[10px] uppercase text-white/40">
            {historyAllClub
              ? "Vista global club"
              : `Filtro activo: ${selectedTeamId || "equipo"} · ${selectedMcc} · ${selectedSession}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!session?.access_token ? (
            <p className="text-[10px] uppercase text-white/40">Inicia sesión para ver histórico en Supabase.</p>
          ) : history.length === 0 ? (
            <p className="text-[10px] uppercase text-white/40">Sin incidencias en este filtro.</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase">
                  <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                    {item.incident_label}
                  </Badge>
                  <Badge variant="outline" className="border-white/15 text-white/60">
                    {item.mcc} {item.session}
                  </Badge>
                  <Badge variant="outline" className="border-white/15 text-white/60">
                    {item.team_id}
                  </Badge>
                </div>
                <p className="mt-2 text-[10px] uppercase text-white/50">
                  Marcador {item.score_home}-{item.score_guest} · Tiempo {formatClock(item.remaining_sec)} ·{" "}
                  {new Date(item.created_at).toLocaleString("es-ES")}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10 bg-black/30">
        <CardContent className="pt-6 flex flex-wrap items-center gap-3 text-[10px] uppercase font-black">
          <Badge variant="outline" className={cn("border-white/15", isOnline ? "text-emerald-400" : "text-amber-400")}>
            {isOnline ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline" className="border-primary/20 text-primary">
            Cola eventos: {pendingEvents}
          </Badge>
          <Badge variant="outline" className="border-white/15 text-white/60">
            <Watch className="h-3 w-3 mr-1" /> Coexistencia tablet + móvil activa
          </Badge>
        </CardContent>
      </Card>
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
    <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02] space-y-3">
      <p className="text-[10px] uppercase font-black text-white/50">{title}</p>
      <p className="text-4xl font-black text-white italic tracking-tighter">{value}</p>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 border-white/10" onClick={onDec}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button className="flex-1 bg-primary text-black border-none" onClick={onInc}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
