"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clipboard, Plus, QrCode, Save, ShieldCheck, Trash2, Upload, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  getActiveTournamentId,
  loadTournamentConfigById,
  loadTournamentTeamsById,
  saveTournamentTeamsById,
  migrateLegacySingleTournamentIfNeeded,
  loadTournamentIndex,
} from "@/lib/tournaments-storage";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

type TeamRow = {
  id: string;
  name: string;
  groupIndex?: number; // 0..groupsCount-1
  crestDataUrl?: string; // base64 (localStorage)
  players?: Array<{ id: string; name: string; jerseyNumber: string }>;
};

function safeTeamName(t: unknown): string {
  return t && typeof t === "object" ? String((t as any).name ?? "").trim() : "";
}

function ensurePlayersSlots(team: TeamRow, desiredCount: number): TeamRow {
  const count = Math.max(0, Number(desiredCount) || 0);
  const current = Array.isArray(team.players) ? team.players : [];
  if (count === 0) return { ...team, players: current };
  if (current.length >= count) return { ...team, players: current.slice(0, count) };
  const next = [...current];
  for (let i = next.length; i < count; i++) {
    next.push({
      id: `${team.id}_pl_${i + 1}`,
      name: "",
      jerseyNumber: "",
    });
  }
  return { ...team, players: next };
}

function normalizeTeamsInput(raw: any[]): TeamRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => {
      if (!t || typeof t !== "object") return null;
      const id = String((t as any).id ?? "").trim();
      if (!id) return null;
      const name = String((t as any).name ?? "");
      const groupIndexRaw = (t as any).groupIndex;
      const groupIndex = typeof groupIndexRaw === "number" && Number.isFinite(groupIndexRaw) ? groupIndexRaw : undefined;
      const crestDataUrl = typeof (t as any).crestDataUrl === "string" ? String((t as any).crestDataUrl) : undefined;
      const playersRaw = (t as any).players;
      const players = Array.isArray(playersRaw)
        ? playersRaw
            .map((p: any) => {
              if (!p || typeof p !== "object") return null;
              const pid = String(p.id ?? "").trim() || `p_${Math.random().toString(36).slice(2, 8)}`;
              return {
                id: pid,
                name: String(p.name ?? ""),
                jerseyNumber: String(p.jerseyNumber ?? ""),
              };
            })
            .filter(Boolean)
        : [];
      return { id, name, groupIndex, crestDataUrl, players } as TeamRow;
    })
    .filter((x): x is TeamRow => x !== null);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

function buildCoachTeamUrl(args: { clubId: string; tournamentId: string; teamId: string }) {
  const qs = new URLSearchParams({
    clubId: args.clubId,
    tournamentId: args.tournamentId,
    teamId: args.teamId,
  });
  return `/tournaments/coach-team?${qs.toString()}`;
}

export default function TournamentsTeamsPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const activeTournamentId = useMemo(() => getActiveTournamentId(clubScopeId), [clubScopeId]);
  const router = useRouter();

  const [planner, setPlanner] = useState<{
    tournamentName?: string;
    groupsCount?: number;
    teamsPerGroup?: number;
    startersPerTeam?: number;
    substitutesPerTeam?: number;
  } | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [qrTeam, setQrTeam] = useState<{ id: string; name: string } | null>(null);
  const isFinished = useMemo(() => {
    const t = loadTournamentIndex(clubScopeId).find((x) => x.id === activeTournamentId);
    return t?.status === "finished";
  }, [clubScopeId, activeTournamentId]);

  useEffect(() => {
    migrateLegacySingleTournamentIfNeeded({
      clubId: clubScopeId,
      legacyPlannerKey: `synq_tournaments_planner_v1_${clubScopeId}`,
      legacyTeamsKey: `synq_tournaments_teams_v1_${clubScopeId}`,
    });
    setPlanner(loadTournamentConfigById(clubScopeId, activeTournamentId));
    const rawTeams = loadTournamentTeamsById(clubScopeId, activeTournamentId);
    setTeams(normalizeTeamsInput(rawTeams));
  }, [activeTournamentId, clubScopeId]);

  const groupsCount = Math.max(1, Number(planner?.groupsCount ?? 1));
  const teamsPerGroup = Math.max(0, Number(planner?.teamsPerGroup ?? 0));
  const slotsCount = Math.max(0, groupsCount * teamsPerGroup);
  const desiredPlayersPerTeam = Math.max(
    0,
    (Number(planner?.startersPerTeam) || 0) + (Number(planner?.substitutesPerTeam) || 0),
  );

  // Precargar plazas según configuración (grupos × equipos/grupo).
  useEffect(() => {
    if (!activeTournamentId) return;
    if (slotsCount <= 0) return;
    setTeams((prev) => {
      // Si ya hay al menos el nº de plazas, no tocamos.
      if (prev.length >= slotsCount) return prev;

      const next = [...prev];
      const usedIds = new Set(next.map((t) => t.id));
      for (let gi = 0; gi < groupsCount; gi++) {
        for (let si = 0; si < teamsPerGroup; si++) {
          const slotId = `slot_${gi}_${si}`;
          if (usedIds.has(slotId)) continue;
          next.push({
            id: slotId,
            name: "",
            groupIndex: gi,
            crestDataUrl: undefined,
            players: [],
          });
          usedIds.add(slotId);
          if (next.length >= slotsCount) break;
        }
        if (next.length >= slotsCount) break;
      }
      return next;
    });
  }, [activeTournamentId, groupsCount, teamsPerGroup, slotsCount]);

  // Precargar jugadores por equipo: titulares + suplentes.
  useEffect(() => {
    if (!activeTournamentId) return;
    if (desiredPlayersPerTeam <= 0) return;
    setTeams((prev) => prev.map((t) => ensurePlayersSlots(t, desiredPlayersPerTeam)));
  }, [activeTournamentId, desiredPlayersPerTeam]);

  const addTeam = () => {
    if (isFinished) return;
    const next: TeamRow = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      groupIndex: undefined,
      crestDataUrl: undefined,
      players: desiredPlayersPerTeam > 0 ? ensurePlayersSlots({ id: "tmp", name: "" }, desiredPlayersPerTeam).players : [],
    };
    setTeams((prev) => [next, ...prev]);
  };

  const saveTeams = () => {
    if (isFinished) return;
    const normalized = teams.map((t) => {
      const base: TeamRow = {
        ...t,
        name: String(t.name || "").trim(),
        crestDataUrl: typeof t.crestDataUrl === "string" ? t.crestDataUrl : undefined,
        players: Array.isArray(t.players)
          ? t.players.map((p) => ({
              ...p,
              name: String(p.name || "").trim(),
              jerseyNumber: String(p.jerseyNumber || "").trim(),
            }))
          : [],
      };
      return desiredPlayersPerTeam > 0 ? ensurePlayersSlots(base, desiredPlayersPerTeam) : base;
    });
    saveTournamentTeamsById(clubScopeId, activeTournamentId, normalized as any);
    setTeams(normalized);
    setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    router.push("/dashboard/tournaments/list");
  };

  const coachTeamUrl = useMemo(() => {
    if (!qrTeam || !activeTournamentId) return null;
    return buildCoachTeamUrl({ clubId: clubScopeId, tournamentId: activeTournamentId, teamId: qrTeam.id });
  }, [qrTeam, activeTournamentId, clubScopeId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Dialog open={!!qrTeam} onOpenChange={(open) => (open ? null : setQrTeam(null))}>
        <DialogContent className="border border-[#00F2FF]/20 bg-[#0a0f18]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-black uppercase tracking-wide">QR del equipo</DialogTitle>
            <DialogDescription className="text-white/70">
              {qrTeam ? (
                <>
                  Comparte este QR con el entrenador del equipo{" "}
                  <span className="text-white font-black">{qrTeam.name || "—"}</span>. La micro‑app se definirá más adelante.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="rounded-2xl border border-white/5 bg-black/25 p-4 flex items-center justify-center">
              {coachTeamUrl ? (
                <QRCodeCanvas value={coachTeamUrl} size={220} bgColor="#0a0f18" fgColor="#00F2FF" includeMargin />
              ) : (
                <div className="text-sm text-white/70">—</div>
              )}
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/5 bg-black/25 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00F2FF]/60">URL</p>
                <p className="mt-1 font-mono text-[11px] text-white/85 break-all">{coachTeamUrl ?? "—"}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!coachTeamUrl) return;
                  try {
                    await navigator.clipboard.writeText(coachTeamUrl);
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#00F2FF]/15 transition-[background-color,border-color,color,opacity,transform]"
              >
                <Clipboard className="h-4 w-4" />
                Copiar enlace
              </button>
              <div className="rounded-xl border border-white/5 bg-black/25 p-3 text-[11px] text-white/70 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-[#00F2FF] mt-0.5" />
                <span>Este QR será parte de la documentación del torneo para micro‑apps/terminales.</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="border-b border-cyan-500/15 pb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/70">TORNEOS · EQUIPOS</p>
            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-300" />
              Equipos del torneo
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {planner?.tournamentName ? `Torneo: ${planner.tournamentName}` : "Torneo (sin nombre)"} · Grupos: {groupsCount}
              {teamsPerGroup ? ` · Equipos/grupo: ${teamsPerGroup}` : ""} {slotsCount ? `· Plazas: ${slotsCount}` : ""}
            </p>
          </div>
          <Link
            href="/dashboard/tournaments/list"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-black/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200 hover:bg-cyan-500/10 transition-[background-color,border-color,color,opacity,transform]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </div>
      </div>

      <Card className="glass-panel border border-cyan-500/20 bg-black/30 rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-white font-black uppercase tracking-wider">Listado de equipos</CardTitle>
            <CardDescription>Nombre, escudo, jugadores y QR por equipo (micro‑app entrenadores).</CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addTeam}
              disabled={isFinished}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-200 text-[10px] font-black uppercase tracking-[0.16em]"
            >
              <Plus className="h-4 w-4" />
              Añadir
            </button>
            <button
              type="button"
              onClick={saveTeams}
              disabled={isFinished}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-cyan-500/25 bg-black/40 text-cyan-200 text-[10px] font-black uppercase tracking-[0.16em]"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isFinished ? (
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/5 p-3 text-[11px] text-amber-200/90 font-black">
              Torneo finalizado: edición bloqueada.
            </div>
          ) : null}
          {teams.length === 0 ? (
            <div className="rounded-xl border border-cyan-500/15 bg-black/25 p-4 text-white/70 text-sm">
              Aún no hay equipos. Pulsa “Añadir”.
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="rounded-xl border border-cyan-500/15 bg-black/25 p-3 space-y-3">
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl border border-cyan-500/15 bg-black/40 overflow-hidden flex items-center justify-center">
                        {team.crestDataUrl ? (
                          // Sin “fondo” extra del contenedor; el PNG con transparencia se ve perfecto.
                          // Si la imagen sube con fondo, no lo podemos eliminar automáticamente en cliente.
                          <img src={team.crestDataUrl} alt="Escudo" className="h-full w-full object-contain" />
                        ) : (
                          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">ESC</div>
                        )}
                      </div>
                      <label className={cn(isFinished && "opacity-60 pointer-events-none", "inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-cyan-500/15 bg-black/40 text-cyan-200 text-[10px] font-black uppercase tracking-[0.16em] cursor-pointer hover:bg-cyan-500/10 transition-[background-color,border-color,color,opacity,transform]")}>
                        <Upload className="h-4 w-4" />
                        Escudo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            try {
                              const dataUrl = await readFileAsDataUrl(f);
                              setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, crestDataUrl: dataUrl } : t)));
                            } catch {
                              // ignore
                            } finally {
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>

                    <input
                      value={team.name}
                      disabled={isFinished}
                      onChange={(e) =>
                        setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: e.target.value } : t)))
                      }
                      placeholder="Nombre del equipo"
                      className="h-10 flex-1 rounded-lg border border-cyan-500/15 bg-black/40 px-3 text-white outline-none"
                    />

                    <div className="md:w-[220px]">
                      <Select
                        value={team.groupIndex == null ? "none" : String(team.groupIndex)}
                        disabled={isFinished}
                        onValueChange={(v) => {
                          setTeams((prev) =>
                            prev.map((t) =>
                              t.id === team.id
                                ? {
                                    ...t,
                                    groupIndex: v === "none" ? undefined : Math.max(0, Math.min(groupsCount - 1, Number(v))),
                                  }
                                : t,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger className="h-10 rounded-lg border border-cyan-500/15 bg-black/40 text-white outline-none focus:ring-0 focus:ring-offset-0">
                          <SelectValue placeholder="Grupo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0f18] border-cyan-500/20 text-white rounded-2xl shadow-2xl">
                          <SelectItem value="none">Sin grupo</SelectItem>
                          {Array.from({ length: groupsCount }).map((_, idx) => (
                            <SelectItem key={idx} value={String(idx)}>
                              Grupo {String.fromCharCode(65 + idx)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQrTeam({ id: team.id, name: safeTeamName(team) })}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-cyan-500/15 bg-black/40 text-cyan-200 hover:bg-cyan-500/10 transition-[background-color,border-color,color,opacity,transform]"
                      title="QR del equipo"
                    >
                      <QrCode className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeams((prev) => prev.filter((t) => t.id !== team.id))}
                      disabled={isFinished}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-black/20 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00F2FF]/60">
                        Jugadores (nombre + dorsal)
                      </p>
                      <button
                        type="button"
                        disabled={isFinished}
                        onClick={() => {
                          const pid = `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
                          setTeams((prev) =>
                            prev.map((t) =>
                              t.id === team.id
                                ? {
                                    ...t,
                                    players: [...(t.players ?? []), { id: pid, name: "", jerseyNumber: "" }],
                                  }
                                : t,
                            ),
                          );
                        }}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-[#00F2FF]/20 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#00F2FF]/15 transition-[background-color,border-color,color,opacity,transform]"
                      >
                        <Plus className="h-4 w-4" />
                        Añadir jugador
                      </button>
                    </div>

                    {Array.isArray(team.players) && team.players.length > 0 ? (
                      <div className="space-y-2">
                        {team.players.map((p) => (
                          <div key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_40px] gap-2 items-center">
                            <input
                              value={p.name}
                              disabled={isFinished}
                              onChange={(e) =>
                                setTeams((prev) =>
                                  prev.map((t) =>
                                    t.id === team.id
                                      ? {
                                          ...t,
                                          players: (t.players ?? []).map((pp) =>
                                            pp.id === p.id ? { ...pp, name: e.target.value } : pp,
                                          ),
                                        }
                                      : t,
                                  ),
                                )
                              }
                              placeholder="Nombre jugador"
                              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none"
                            />
                            <input
                              value={p.jerseyNumber}
                              disabled={isFinished}
                              onChange={(e) =>
                                setTeams((prev) =>
                                  prev.map((t) =>
                                    t.id === team.id
                                      ? {
                                          ...t,
                                          players: (t.players ?? []).map((pp) =>
                                            pp.id === p.id ? { ...pp, jerseyNumber: e.target.value } : pp,
                                          ),
                                        }
                                      : t,
                                  ),
                                )
                              }
                              placeholder="Dorsal"
                              inputMode="numeric"
                              className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-white outline-none tabular-nums"
                            />
                            <button
                              type="button"
                              disabled={isFinished}
                              onClick={() =>
                                setTeams((prev) =>
                                  prev.map((t) =>
                                    t.id === team.id
                                      ? { ...t, players: (t.players ?? []).filter((pp) => pp.id !== p.id) }
                                      : t,
                                  ),
                                )
                              }
                              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-300"
                              title="Eliminar jugador"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-white/60">Aún no hay jugadores.</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
            {savedAt ? `Guardado local: ${savedAt}` : "Pendiente de guardar"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

