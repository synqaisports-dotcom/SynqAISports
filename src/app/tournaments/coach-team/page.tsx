"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Save, ShieldCheck, Trash2, Upload, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { loadTournamentConfigById, loadTournamentTeamsById, saveTournamentTeamsById } from "@/lib/tournaments-storage";

type TeamPlayer = {
  id: string;
  name: string;
  jerseyNumber: string;
};

type TeamRow = {
  id: string;
  name: string;
  groupIndex?: number;
  crestDataUrl?: string;
  players?: TeamPlayer[];
};

const synqInputClass =
  "h-10 w-full rounded-lg border border-[#00F2FF]/25 bg-[#0B1220]/80 px-3 text-sm font-bold text-white placeholder:text-white/35 outline-none ring-0 transition-[background-color,border-color,color,opacity,transform] focus:border-[#00F2FF]/55 focus:bg-[#0F172A]/95";

export default function TournamentCoachTeamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#040812] text-white flex items-center justify-center">
          <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl px-5 py-4 text-sm text-white/80">
            Cargando terminal de equipo…
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
  const clubId = searchParams.get("clubId") ?? "";
  const tournamentId = searchParams.get("tournamentId") ?? "";
  const teamId = searchParams.get("teamId") ?? "";

  const [team, setTeam] = useState<TeamRow | null>(null);
  const [savedAt, setSavedAt] = useState("");
  const [statusText, setStatusText] = useState("Preparado");

  const desiredPlayersPerTeam = useMemo(() => {
    if (!clubId || !tournamentId) return 0;
    const cfg = loadTournamentConfigById(clubId, tournamentId);
    return Math.max(
      0,
      Number(cfg?.startersPerTeam ?? 0) + Number(cfg?.substitutesPerTeam ?? 0) || Number(cfg?.playersPerTeam ?? 0) || 0
    );
  }, [clubId, tournamentId]);

  useEffect(() => {
    if (!clubId || !tournamentId || !teamId) return;
    const teams = loadTournamentTeamsById(clubId, tournamentId);
    const found = Array.isArray(teams)
      ? teams.find((t) => t && typeof t === "object" && String((t as { id?: unknown }).id ?? "") === teamId)
      : null;
    if (!found || typeof found !== "object") {
      setTeam(null);
      return;
    }
    const parsed = found as Record<string, unknown>;
    const playersRaw = Array.isArray(parsed.players) ? parsed.players : [];
    const players = playersRaw
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const x = p as Record<string, unknown>;
        return {
          id: String(x.id ?? `pl_${Math.random().toString(36).slice(2, 8)}`),
          name: String(x.name ?? ""),
          jerseyNumber: String(x.jerseyNumber ?? ""),
        } satisfies TeamPlayer;
      })
      .filter((x): x is TeamPlayer => x !== null);

    let normalizedPlayers = players;
    if (desiredPlayersPerTeam > 0 && players.length < desiredPlayersPerTeam) {
      normalizedPlayers = [...players];
      for (let i = players.length; i < desiredPlayersPerTeam; i++) {
        normalizedPlayers.push({
          id: `${String(parsed.id)}_pl_${i + 1}`,
          name: "",
          jerseyNumber: "",
        });
      }
    }

    setTeam({
      id: String(parsed.id ?? ""),
      name: String(parsed.name ?? ""),
      groupIndex: typeof parsed.groupIndex === "number" ? parsed.groupIndex : undefined,
      crestDataUrl: typeof parsed.crestDataUrl === "string" ? parsed.crestDataUrl : undefined,
      players: normalizedPlayers,
    });
  }, [clubId, desiredPlayersPerTeam, teamId, tournamentId]);

  const completion = useMemo(() => {
    if (!team) return { playersNamed: 0, total: 0, hasCrest: false, complete: false };
    const list = Array.isArray(team.players) ? team.players : [];
    const playersNamed = list.filter((p) => String(p.name).trim().length > 0).length;
    const hasCrest = String(team.crestDataUrl ?? "").trim().length > 0;
    const complete = hasCrest && playersNamed > 0;
    return { playersNamed, total: list.length, hasCrest, complete };
  }, [team]);

  const saveTeam = () => {
    if (!clubId || !tournamentId || !teamId || !team) return;
    const teams = loadTournamentTeamsById(clubId, tournamentId);
    if (!Array.isArray(teams)) return;
    const next = teams.map((t) => {
      if (!t || typeof t !== "object") return t;
      const id = String((t as { id?: unknown }).id ?? "");
      if (id !== teamId) return t;
      return {
        ...(t as object),
        name: String(team.name ?? "").trim(),
        crestDataUrl: team.crestDataUrl ?? "",
        players: (team.players ?? []).map((p) => ({
          id: p.id,
          name: String(p.name ?? "").trim(),
          jerseyNumber: String(p.jerseyNumber ?? "").trim(),
        })),
      };
    });
    saveTournamentTeamsById(clubId, tournamentId, next as any[]);
    setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
    setStatusText(completion.complete ? "Plantilla completa" : "Guardado parcial");
  };

  const uploadCrest = async (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Error al leer imagen"));
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) return;
    setTeam((prev) => (prev ? { ...prev, crestDataUrl: dataUrl } : prev));
  };

  if (!clubId || !tournamentId || !teamId) {
    return (
      <div className="min-h-[100dvh] bg-[#040812] text-white px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F2FF]/70">Terminal Equipo</p>
          <h1 className="mt-2 text-2xl font-black uppercase">Parámetros incompletos</h1>
          <p className="mt-2 text-sm text-white/70">El QR debe contener clubId, tournamentId y teamId.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#040812] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10 space-y-4">
        <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F2FF]/60">SYNQAI · TERMINAL EQUIPO</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight">
            {team ? `Plantilla · ${team.name || "Equipo"}` : "Equipo no encontrado"}
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Completa jugadores y sube el escudo/logo del equipo para validar la participación.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              {statusText}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
              {savedAt ? `Guardado ${savedAt}` : "Sin guardar"}
            </span>
          </div>
        </div>

        {!team ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-rose-200 text-sm">
            El equipo no existe en este torneo o aún no fue volcado desde la mesa de control.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F2FF]/70">Identidad del equipo</p>
                <input
                  value={team.name}
                  onChange={(e) => setTeam((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  className={synqInputClass}
                />
                <div className="rounded-xl border border-white/10 bg-black/25 p-3 grid place-items-center min-h-[130px]">
                  {team.crestDataUrl ? (
                    <img src={team.crestDataUrl} alt="Escudo equipo" className="h-24 w-24 rounded-2xl object-contain border border-white/20" />
                  ) : (
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/55">Subir logo obligatorio</p>
                  )}
                </div>
                <label className="inline-flex items-center justify-center h-10 px-3 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em] cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Subir logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      void uploadCrest(e.target.files?.[0] ?? null);
                    }}
                  />
                </label>
              </div>

              <div className="lg:col-span-2 rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00F2FF]/70">Plantilla de jugadores</p>
                  <button
                    type="button"
                    onClick={() =>
                      setTeam((prev) =>
                        prev
                          ? {
                              ...prev,
                              players: [
                                ...(prev.players ?? []),
                                { id: `pl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: "", jerseyNumber: "" },
                              ],
                            }
                          : prev
                      )
                    }
                    className="h-8 px-2 rounded-lg border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[9px] font-black uppercase tracking-[0.14em]"
                  >
                    <Plus className="h-3.5 w-3.5 inline mr-1" />
                    Jugador
                  </button>
                </div>

                {(team.players ?? []).length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-[11px] text-white/65">
                    Añade al menos un jugador para completar plantilla.
                  </div>
                ) : null}

                <div className="space-y-2">
                  {(team.players ?? []).map((p, idx) => (
                    <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <div className="md:col-span-1 h-10 rounded-lg border border-white/10 bg-black/25 text-[10px] font-black uppercase text-white/65 grid place-items-center">
                        {idx + 1}
                      </div>
                      <input
                        value={p.name}
                        onChange={(e) =>
                          setTeam((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  players: (prev.players ?? []).map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)),
                                }
                              : prev
                          )
                        }
                        placeholder="Nombre jugador"
                        className={`md:col-span-8 ${synqInputClass}`}
                      />
                      <input
                        value={p.jerseyNumber}
                        onChange={(e) =>
                          setTeam((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  players: (prev.players ?? []).map((x) => (x.id === p.id ? { ...x, jerseyNumber: e.target.value } : x)),
                                }
                              : prev
                          )
                        }
                        placeholder="Dorsal"
                        className={`md:col-span-2 ${synqInputClass}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setTeam((prev) =>
                            prev ? { ...prev, players: (prev.players ?? []).filter((x) => x.id !== p.id) } : prev
                          )
                        }
                        className="md:col-span-1 h-10 rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-300 grid place-items-center"
                        title="Eliminar jugador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/55 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.14em]">
                <span className={`rounded-lg border px-2 py-1 ${completion.hasCrest ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>
                  {completion.hasCrest ? "Logo OK" : "Falta logo"}
                </span>
                <span className={`rounded-lg border px-2 py-1 ${completion.playersNamed > 0 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-amber-500/25 bg-amber-500/10 text-amber-300"}`}>
                  Jugadores {completion.playersNamed}/{completion.total}
                </span>
                <span className={`rounded-lg border px-2 py-1 ${completion.complete ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.03] text-white/65"}`}>
                  {completion.complete ? "Plantilla completa" : "Pendiente completar"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveTeam}
                  className="inline-flex items-center h-10 px-4 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar equipo
                </button>
                <Link
                  href="/dashboard/tournaments/list"
                  className="inline-flex items-center h-10 px-4 rounded-xl border border-white/10 bg-black/25 text-white/80 text-[10px] font-black uppercase tracking-[0.16em]"
                >
                  Volver
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Terminal de acceso activo · Edición de plantilla y logo vinculada al torneo
        </div>
      </main>
    </div>
  );
}
