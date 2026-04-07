"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, QrCode, Search, ShieldCheck, Users, XCircle, Volume2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { loadTournamentIndex, loadTournamentTeamsById, safeJsonParse } from "@/lib/tournaments-storage";
import { PwaInstallBanner } from "@/components/pwa/PwaInstallBanner";

type RegistrationStatus =
  | "draft"
  | "preinscrito"
  | "pendiente_validacion"
  | "aprobado"
  | "waitlist"
  | "rechazado"
  | "completo";

type RegistrationTeam = {
  id: string;
  teamName: string;
  category: string;
  expectedPlayers: number;
  status: "incompleto" | "completo" | "verificado";
};

type TournamentRegistration = {
  id: string;
  tournamentId: string;
  clubName: string;
  status: RegistrationStatus;
  controlComment?: string;
  teams: RegistrationTeam[];
};

type RegistrationsPayload = {
  registrations: TournamentRegistration[];
};

type TeamCheckinEvent = {
  at: string;
  action: "checkin" | "checkout";
  by: string;
  note?: string;
};

type TeamRow = {
  id: string;
  name: string;
  groupIndex?: number;
  crestDataUrl?: string;
  checkin?: {
    present: boolean;
    checkedAt?: string;
    checkedBy?: string;
    note?: string;
    history?: TeamCheckinEvent[];
  };
};

type ScanLog = {
  at: string;
  teamId: string;
  teamName: string;
  source: "camera" | "manual";
  action: "select" | "checkin" | "checkout";
};

const inputClass =
  "h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0A1322]/85 px-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#00F2FF]/55 focus:ring-2 focus:ring-[#00F2FF]/20 transition-[background-color,border-color,color,opacity,transform]";

function normalize(text: string) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function registrationKey(clubId: string, tournamentId: string) {
  return `synq_tournament_registrations_v1_${clubId}_${tournamentId}`;
}

function readRegistrations(clubId: string, tournamentId: string): RegistrationsPayload {
  const raw = safeJsonParse<unknown>(localStorage.getItem(registrationKey(clubId, tournamentId)));
  if (!raw || typeof raw !== "object") return { registrations: [] };
  const list = Array.isArray((raw as { registrations?: unknown }).registrations)
    ? ((raw as { registrations: unknown[] }).registrations as unknown[])
    : [];
  const registrations: TournamentRegistration[] = [];
  for (const r of list) {
    if (!r || typeof r !== "object") continue;
    const x = r as Record<string, unknown>;
    const id = String(x.id ?? "").trim();
    const regTournamentId = String(x.tournamentId ?? "").trim();
    if (!id || !regTournamentId) continue;
    const teamsRaw = Array.isArray(x.teams) ? x.teams : [];
    const teams: RegistrationTeam[] = [];
    for (const t of teamsRaw) {
      if (!t || typeof t !== "object") continue;
      const y = t as Record<string, unknown>;
      const teamName = String(y.teamName ?? "").trim();
      if (!teamName) continue;
      teams.push({
        id: String(y.id ?? `reg_team_${Math.random().toString(36).slice(2, 8)}`),
        teamName,
        category: String(y.category ?? "").trim(),
        expectedPlayers: Math.max(0, Number(y.expectedPlayers ?? 0) || 0),
        status: String(y.status ?? "incompleto") as RegistrationTeam["status"],
      });
    }
    registrations.push({
      id,
      tournamentId: regTournamentId,
      clubName: String(x.clubName ?? "").trim(),
      status: String(x.status ?? "preinscrito") as RegistrationStatus,
      controlComment: String(x.controlComment ?? "").trim(),
      teams,
    });
  }
  return { registrations };
}

function findRegistrationForTeam(payload: RegistrationsPayload, teamName: string): TournamentRegistration | null {
  const key = normalize(teamName);
  if (!key) return null;
  for (const reg of payload.registrations) {
    if (!Array.isArray(reg.teams)) continue;
    if (reg.teams.some((t) => normalize(t.teamName) === key)) return reg;
  }
  return null;
}

export default function TournamentCheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#040812] text-white flex items-center justify-center">
          <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl px-5 py-4 text-sm text-white/80">
            Cargando terminal de check-in…
          </div>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const searchParams = useSearchParams();
  const clubId = searchParams.get("clubId") ?? "global-hq";
  const tournamentIdFromQr = searchParams.get("tournamentId") ?? "";
  const teamIdFromQr = searchParams.get("teamId") ?? "";
  const teamNameFromQr = searchParams.get("teamName") ?? "";
  const operatorFromQr = searchParams.get("operator") ?? "terminal";

  const tournaments = useMemo(() => {
    if (typeof window === "undefined") return [];
    return loadTournamentIndex(clubId);
  }, [clubId]);

  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [operatorName, setOperatorName] = useState(operatorFromQr || "terminal");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"ok" | "warn" | "error">("ok");
  const [scannerSupported, setScannerSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const [lastScanAt, setLastScanAt] = useState("");
  const [onlyPending, setOnlyPending] = useState(true);
  const [compactMode, setCompactMode] = useState(true);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const hasCamera = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
    const hasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;
    setScannerSupported(hasCamera && hasBarcodeDetector);
  }, []);

  useEffect(() => {
    if (selectedTournamentId) return;
    if (tournamentIdFromQr) {
      setSelectedTournamentId(tournamentIdFromQr);
      return;
    }
    if (tournaments.length > 0) {
      setSelectedTournamentId(tournaments[0]!.id);
    }
  }, [selectedTournamentId, tournamentIdFromQr, tournaments]);

  useEffect(() => {
    if (!selectedTournamentId) return;
    const list = loadTournamentTeamsById(clubId, selectedTournamentId);
    const normalized: TeamRow[] = [];
    for (const t of Array.isArray(list) ? list : []) {
      if (!t || typeof t !== "object") continue;
      const x = t as Record<string, unknown>;
      const id = String(x.id ?? "").trim();
      const name = String(x.name ?? "").trim();
      if (!id || !name) continue;
      const checkinRaw = x.checkin as Record<string, unknown> | undefined;
      const historyRaw = Array.isArray(checkinRaw?.history) ? checkinRaw.history : [];
      const history: TeamCheckinEvent[] = [];
      for (const e of historyRaw) {
        if (!e || typeof e !== "object") continue;
        const y = e as Record<string, unknown>;
        const action = String(y.action ?? "").trim();
        if (action !== "checkin" && action !== "checkout") continue;
        history.push({
          at: String(y.at ?? new Date().toISOString()),
          action,
          by: String(y.by ?? "terminal"),
          note: String(y.note ?? "").trim(),
        });
      }
      normalized.push({
        id,
        name,
        groupIndex: typeof x.groupIndex === "number" ? x.groupIndex : undefined,
        crestDataUrl: typeof x.crestDataUrl === "string" ? x.crestDataUrl : undefined,
        checkin: {
          present: Boolean(checkinRaw?.present),
          checkedAt: typeof checkinRaw?.checkedAt === "string" ? checkinRaw.checkedAt : undefined,
          checkedBy: typeof checkinRaw?.checkedBy === "string" ? checkinRaw.checkedBy : undefined,
          note: typeof checkinRaw?.note === "string" ? checkinRaw.note : undefined,
          history,
        },
      });
    }
    setTeams(normalized);
  }, [clubId, selectedTournamentId]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current !== null) window.clearTimeout(scanTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!teamIdFromQr && !teamNameFromQr) return;
    if (teamIdFromQr) {
      setSelectedTeamId(teamIdFromQr);
      return;
    }
    if (teamNameFromQr) {
      const byName = teams.find((t) => normalize(t.name) === normalize(teamNameFromQr));
      if (byName) setSelectedTeamId(byName.id);
    }
  }, [teamIdFromQr, teamNameFromQr, teams]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId]
  );

  const registrations = useMemo(() => {
    if (!selectedTournamentId) return { registrations: [] } satisfies RegistrationsPayload;
    return readRegistrations(clubId, selectedTournamentId);
  }, [clubId, selectedTournamentId]);

  const registrationForSelectedTeam = useMemo(() => {
    if (!selectedTeam) return null;
    return findRegistrationForTeam(registrations, selectedTeam.name);
  }, [registrations, selectedTeam]);

  const filteredTeams = useMemo(() => {
    const key = normalize(search);
    const base = onlyPending ? teams.filter((t) => !t.checkin?.present) : teams;
    if (!key) return base;
    return base.filter((t) => normalize(t.name).includes(key));
  }, [onlyPending, search, teams]);

  const presentCount = useMemo(() => teams.filter((t) => t.checkin?.present).length, [teams]);
  const pendingCount = useMemo(() => Math.max(0, teams.length - presentCount), [presentCount, teams.length]);

  const writeTeams = (next: TeamRow[]) => {
    if (!selectedTournamentId) return;
    saveTournamentTeams(next);
  };

  const saveTournamentTeams = (next: TeamRow[]) => {
    const base = loadTournamentTeamsById(clubId, selectedTournamentId);
    const nextMap = new Map(next.map((t) => [t.id, t]));
    const merged = (Array.isArray(base) ? base : []).map((row) => {
      if (!row || typeof row !== "object") return row;
      const id = String((row as { id?: unknown }).id ?? "");
      const found = nextMap.get(id);
      if (!found) return row;
      return {
        ...(row as object),
        checkin: {
          present: Boolean(found.checkin?.present),
          checkedAt: found.checkin?.checkedAt ?? "",
          checkedBy: found.checkin?.checkedBy ?? "",
          note: found.checkin?.note ?? "",
          history: Array.isArray(found.checkin?.history) ? found.checkin?.history : [],
        },
      };
    });
    localStorage.setItem(
      `synq_tournament_teams_v1_${clubId}_${selectedTournamentId}`,
      JSON.stringify(merged)
    );
  };

  const pushScanLog = (entry: ScanLog) => {
    setScanLogs((prev) => [entry, ...prev].slice(0, 8));
  };

  const beepFeedback = (tone: "ok" | "warn" | "error" = "ok") => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(tone === "ok" ? [40] : tone === "warn" ? [30, 30, 30] : [60, 60, 60, 60]);
      }
    } catch {
      // noop
    }
  };

  const markPresence = (present: boolean, source: "camera" | "manual" = "manual") => {
    if (!selectedTeam) return false;
    const regStatus = registrationForSelectedTeam?.status;
    if (regStatus && !["aprobado", "completo"].includes(regStatus)) {
      setMessageTone("warn");
      setMessage(
        `Equipo con inscripción "${regStatus}". Puedes registrar presencia, pero conviene validarlo en mesa de control.`
      );
      beepFeedback("warn");
    } else {
      setMessageTone("ok");
      setMessage(present ? "Check-in registrado correctamente." : "Check-out registrado correctamente.");
      beepFeedback("ok");
    }
    const at = new Date().toISOString();
    const by = operatorName.trim() || "terminal";
    const event: TeamCheckinEvent = {
      at,
      action: present ? "checkin" : "checkout",
      by,
      note: note.trim(),
    };
    const next = teams.map((t) =>
      t.id !== selectedTeam.id
        ? t
        : {
            ...t,
            checkin: {
              present,
              checkedAt: at,
              checkedBy: by,
              note: note.trim(),
              history: [...(t.checkin?.history ?? []), event].slice(-20),
            },
          }
    );
    setTeams(next);
    writeTeams(next);
    pushScanLog({
      at,
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      source,
      action: present ? "checkin" : "checkout",
    });
    return true;
  };

  const applyScanPayload = (payload: { tournamentId?: string; teamId?: string; teamName?: string }) => {
    if (payload.tournamentId) {
      setSelectedTournamentId(payload.tournamentId);
    }
    if (payload.teamId) {
      setSelectedTeamId(payload.teamId);
      return;
    }
    if (payload.teamName) {
      const found = teams.find((t) => normalize(t.name) === normalize(payload.teamName ?? ""));
      if (found) setSelectedTeamId(found.id);
    }
  };

  const parseDecodedString = (decoded: string) => {
    const raw = String(decoded || "").trim();
    if (!raw) return;
    try {
      const url = new URL(raw, window.location.origin);
      const tid = url.searchParams.get("tournamentId") ?? "";
      const teamId = url.searchParams.get("teamId") ?? "";
      const teamName = url.searchParams.get("teamName") ?? "";
      const cid = url.searchParams.get("clubId") ?? "";
      if (cid && cid !== clubId) {
        setMessageTone("warn");
        setMessage(`QR de otro club (${cid}). Operando con club actual (${clubId}).`);
      }
      applyScanPayload({ tournamentId: tid || undefined, teamId: teamId || undefined, teamName: teamName || undefined });
      setLastScanAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      setMessageTone("ok");
      setMessage("QR leído correctamente.");
    } catch {
      const foundByName = teams.find((t) => normalize(t.name) === normalize(raw));
      if (foundByName) {
        setSelectedTeamId(foundByName.id);
        setLastScanAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
        setMessageTone("ok");
        setMessage("Equipo detectado por nombre.");
      } else {
        setMessageTone("error");
        setMessage("QR inválido o equipo no encontrado.");
        beepFeedback("error");
      }
    }
  };

  const stopScanning = () => {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startScanning = async () => {
    if (!scannerSupported || isScanning) return;
    setScannerError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsScanning(true);

      const DetectorCtor = (window as unknown as { BarcodeDetector?: new (args: { formats: string[] }) => any }).BarcodeDetector;
      if (!DetectorCtor) throw new Error("BarcodeDetector no disponible");
      const detector = new DetectorCtor({ formats: ["qr_code"] });

      const loop = async () => {
        if (!videoRef.current || !isScanning) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (Array.isArray(codes) && codes.length > 0) {
            const value = String(codes[0]?.rawValue ?? "").trim();
            if (value) {
              parseDecodedString(value);
              stopScanning();
              setMessageTone("ok");
              setMessage("QR leído correctamente.");
              return;
            }
          }
        } catch {
          // sigue intentando hasta que el operador cancele
        }
        scanTimerRef.current = window.setTimeout(loop, 350);
      };
      scanTimerRef.current = window.setTimeout(loop, 350);
    } catch {
      stopScanning();
      setScannerError("No se pudo abrir la cámara. Revisa permisos del navegador.");
      beepFeedback("error");
    }
  };

  useEffect(() => {
    if (!selectedTeam) return;
    if (!isScanning) return;
    if (selectedTeam.checkin?.present) return;
    const ok = markPresence(true, "camera");
    if (ok) {
      stopScanning();
      setMessageTone("ok");
      setMessage("Check-in automático tras escaneo.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam?.id, isScanning]);

  return (
    <div className="min-h-[100dvh] bg-[#040812] text-white relative overflow-hidden">
      <PwaInstallBanner appName="Check-in Torneo" storageKeyScope="tournaments-checkin" />
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <main className={`relative z-10 mx-auto w-full ${compactMode ? "max-w-5xl" : "max-w-6xl"} px-3 sm:px-4 py-5 sm:py-8 space-y-4`}>
        <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F2FF]/60">SYNQAI · TERMINAL CHECK-IN</p>
          <h1 className="mt-2 text-xl sm:text-2xl font-black uppercase tracking-tight">Fase 6.1 · Terminal de campo</h1>
          <p className="mt-2 text-sm text-white/70">
            Escanea QR (o abre con parámetros), valida estado y marca presencia de equipos en el día de torneo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-3 sm:p-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00F2FF]/70">Contexto terminal</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOnlyPending((v) => !v)}
                className={`h-9 rounded-lg border text-[10px] font-black uppercase tracking-[0.12em] ${
                  onlyPending
                    ? "border-amber-400/35 bg-amber-400/10 text-amber-200"
                    : "border-white/15 bg-white/[0.03] text-white/70"
                }`}
              >
                {onlyPending ? "Solo pendientes: ON" : "Solo pendientes: OFF"}
              </button>
              <button
                type="button"
                onClick={() => setCompactMode((v) => !v)}
                className={`h-9 rounded-lg border text-[10px] font-black uppercase tracking-[0.12em] ${
                  compactMode
                    ? "border-primary/35 bg-primary/10 text-primary"
                    : "border-white/15 bg-white/[0.03] text-white/70"
                }`}
              >
                {compactMode ? "Modo compacto: ON" : "Modo compacto: OFF"}
              </button>
            </div>
            <select
              value={selectedTournamentId}
              onChange={(e) => {
                setSelectedTournamentId(e.target.value);
                setSelectedTeamId("");
              }}
              className={`${inputClass} appearance-none text-[11px] font-black uppercase tracking-[0.12em]`}
            >
              {tournaments.length === 0 ? <option value="">Sin torneos creados</option> : null}
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <div className="relative">
              <Search className="h-4 w-4 text-[#00F2FF]/75 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar equipo..."
                className={`${inputClass} pl-10`}
              />
            </div>
            <input
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Operador terminal"
              className={inputClass}
            />
            <div className="rounded-xl border border-[#00F2FF]/20 bg-black/25 p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[#00F2FF]/75">Escáner QR móvil</p>
                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/55">
                  {lastScanAt ? `Último: ${lastScanAt}` : "Sin lecturas"}
                </span>
              </div>
              <video
                ref={videoRef}
                muted
                playsInline
                className={`w-full rounded-lg border border-white/10 bg-black/60 ${isScanning ? "block" : "hidden"}`}
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void startScanning();
                  }}
                  disabled={!scannerSupported || isScanning}
                  className="h-9 rounded-lg border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-45"
                >
                  Escanear
                </button>
                <button
                  type="button"
                  onClick={stopScanning}
                  disabled={!isScanning}
                  className="h-9 rounded-lg border border-white/15 bg-white/[0.04] text-white/75 text-[10px] font-black uppercase tracking-[0.12em] disabled:opacity-45"
                >
                  Parar
                </button>
              </div>
              {!scannerSupported ? (
                <p className="text-[10px] text-amber-300 font-black uppercase tracking-[0.12em]">
                  Este navegador no soporta escaneo nativo.
                </p>
              ) : null}
              {scannerError ? (
                <p className="text-[10px] text-rose-300 font-black uppercase tracking-[0.12em]">{scannerError}</p>
              ) : null}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Observaciones check-in"
              className="min-h-[90px] w-full rounded-lg border border-[#00F2FF]/25 bg-[#0A1322]/85 px-3 py-2 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-[#00F2FF]/55 focus:ring-2 focus:ring-[#00F2FF]/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => markPresence(true)}
                disabled={!selectedTeam}
                className="h-14 rounded-xl border border-emerald-500/35 bg-emerald-500/15 text-emerald-100 text-[12px] font-black uppercase tracking-[0.14em] disabled:opacity-45"
              >
                Check-in
              </button>
              <button
                type="button"
                onClick={() => markPresence(false)}
                disabled={!selectedTeam}
                className="h-14 rounded-xl border border-rose-500/35 bg-rose-500/15 text-rose-100 text-[12px] font-black uppercase tracking-[0.14em] disabled:opacity-45"
              >
                Check-out
              </button>
            </div>
            {message ? (
              <p
                className={`text-[10px] font-black uppercase tracking-[0.14em] ${
                  messageTone === "error"
                    ? "text-rose-300"
                    : messageTone === "warn"
                      ? "text-amber-300"
                      : "text-emerald-300"
                }`}
              >
                {message}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00F2FF]/70">Equipos del torneo</p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-white/70">
                  Total {teams.length}
                </span>
                <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                  Presentes {presentCount}
                </span>
                <span className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-200">
                  Pendientes {pendingCount}
                </span>
              </div>
            </div>

            <div className={`${compactMode ? "max-h-[300px]" : "max-h-[380px]"} overflow-auto pr-1 space-y-2`}>
              {filteredTeams.map((t) => {
                const selected = t.id === selectedTeamId;
                const present = Boolean(t.checkin?.present);
                const label = typeof t.groupIndex === "number" ? `Grupo ${String.fromCharCode(65 + t.groupIndex)}` : "Sin grupo";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTeamId(t.id)}
                    className={`w-full text-left rounded-xl border ${compactMode ? "px-2 py-2" : "px-3 py-2"} transition-[background-color,border-color,color,opacity,transform] ${
                      selected
                        ? "border-[#00F2FF]/45 bg-[#00F2FF]/10"
                        : present
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "border-white/10 bg-black/25 hover:border-[#00F2FF]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {t.crestDataUrl ? (
                          <img src={t.crestDataUrl} alt={t.name} className="h-8 w-8 rounded-lg object-contain border border-white/15 bg-black/20" />
                        ) : (
                          <div className="h-8 w-8 rounded-lg border border-white/10 bg-black/30 grid place-items-center">
                            <Users className="h-4 w-4 text-white/45" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`${compactMode ? "text-[13px]" : "text-sm"} font-black truncate`}>{t.name}</p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-white/55">{label}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${
                          present
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                            : "border-amber-500/25 bg-amber-500/10 text-amber-200"
                        }`}
                      >
                        {present ? "Presente" : "Pendiente"}
                      </span>
                    </div>
                  </button>
                );
              })}
              {filteredTeams.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-4 text-[11px] text-white/65">
                  No hay equipos que coincidan con el filtro.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00F2FF]/75">Últimos escaneos / acciones</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/60">
              <Volume2 className="h-3.5 w-3.5 text-primary/80" />
              Feedback háptico activo
            </span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-auto pr-1">
            {scanLogs.length === 0 ? (
              <p className="text-[10px] text-white/55">Sin lecturas todavía.</p>
            ) : (
              scanLogs.map((log, idx) => (
                <div
                  key={`${log.at}_${log.teamId}_${idx}`}
                  className="rounded-lg border border-white/10 bg-black/25 px-2 py-1.5 text-[10px] text-white/80"
                >
                  <span className="font-black text-primary/80">{new Date(log.at).toLocaleTimeString("es-ES")}</span> ·{" "}
                  <span className="font-black">{log.teamName}</span> ·{" "}
                  <span className={log.action === "checkin" ? "text-emerald-300 font-black" : log.action === "checkout" ? "text-rose-300 font-black" : "text-cyan-300 font-black"}>
                    {log.action.toUpperCase()}
                  </span>{" "}
                  · {log.source}
                </div>
              ))
            )}
          </div>
        </div>

        {selectedTeam ? (
          <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00F2FF]/70">Detalle equipo seleccionado</p>
              {selectedTeam.checkin?.present ? (
                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Presente
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-rose-200">
                  <XCircle className="h-3.5 w-3.5" /> No registrado
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MiniData label="Equipo" value={selectedTeam.name} />
              <MiniData
                label="Inscripción"
                value={registrationForSelectedTeam?.status ?? "sin registro"}
                tone={
                  registrationForSelectedTeam && ["aprobado", "completo"].includes(registrationForSelectedTeam.status)
                    ? "ok"
                    : "warn"
                }
              />
              <MiniData
                label="Último check"
                value={
                  selectedTeam.checkin?.checkedAt
                    ? `${new Date(selectedTeam.checkin.checkedAt).toLocaleString("es-ES")} · ${selectedTeam.checkin.checkedBy || "terminal"}`
                    : "—"
                }
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/65 mb-2">Auditoría reciente</p>
              <div className="space-y-1 max-h-32 overflow-auto pr-1">
                {(selectedTeam.checkin?.history ?? []).length === 0 ? (
                  <p className="text-[10px] text-white/55">Sin eventos todavía.</p>
                ) : (
                  [...(selectedTeam.checkin?.history ?? [])].slice(-6).reverse().map((ev, idx) => (
                    <p key={`${ev.at}_${idx}`} className="text-[10px] text-white/75">
                      <span className="text-primary/80 font-black">{new Date(ev.at).toLocaleString("es-ES")}</span> ·{" "}
                      <span className={ev.action === "checkin" ? "text-emerald-300" : "text-rose-300"}>
                        {ev.action === "checkin" ? "CHECK-IN" : "CHECK-OUT"}
                      </span>{" "}
                      · {ev.by}
                      {ev.note ? ` · ${ev.note}` : ""}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-[11px] text-white/70">
            Selecciona un equipo para operar check-in.
          </div>
        )}

        <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Terminal de acceso activa · QR + búsqueda manual + persistencia en equipos del torneo
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/tournaments/registration"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em]"
          >
            Volver a inscripciones
          </Link>
          <Link
            href="/dashboard/tournaments/list"
            className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-white/10 bg-black/25 text-white/80 text-[10px] font-black uppercase tracking-[0.16em]"
          >
            Torneos
          </Link>
          <span className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] h-10 px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/65">
            <QrCode className="h-4 w-4 text-[#00F2FF]/80" />
            QR sugerido: /tournaments/checkin?clubId=...&tournamentId=...&teamId=...
          </span>
        </div>
      </main>
    </div>
  );
}

function MiniData({
  label,
  value,
  tone = "base",
}: {
  label: string;
  value: string;
  tone?: "base" | "ok" | "warn";
}) {
  const color =
    tone === "ok"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
      : tone === "warn"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-200"
        : "border-white/10 bg-white/[0.03] text-white/85";
  return (
    <div className={`rounded-xl border px-3 py-2 ${color}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/65">{label}</p>
      <p className="mt-1 text-[11px] font-black break-all">{value}</p>
    </div>
  );
}
