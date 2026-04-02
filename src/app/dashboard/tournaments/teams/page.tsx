"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Save, Users, ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  getActiveTournamentId,
  loadTournamentConfigById,
  loadTournamentTeamsById,
  saveTournamentTeamsById,
  migrateLegacySingleTournamentIfNeeded,
  loadTournamentIndex,
} from "@/lib/tournaments-storage";

type TeamRow = {
  id: string;
  name: string;
  groupIndex?: number; // 0..groupsCount-1
};

export default function TournamentsTeamsPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const activeTournamentId = useMemo(() => getActiveTournamentId(clubScopeId), [clubScopeId]);

  const [planner, setPlanner] = useState<{ tournamentName?: string; groupsCount?: number } | null>(null);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);
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
    setTeams(loadTournamentTeamsById(clubScopeId, activeTournamentId));
  }, [activeTournamentId, clubScopeId]);

  const groupsCount = Math.max(1, Number(planner?.groupsCount ?? 1));

  const addTeam = () => {
    if (isFinished) return;
    const next: TeamRow = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: "",
      groupIndex: undefined,
    };
    setTeams((prev) => [next, ...prev]);
  };

  const saveTeams = () => {
    if (isFinished) return;
    const normalized = teams
      .map((t) => ({ ...t, name: String(t.name || "").trim() }))
      .filter((t) => t.name.length > 0);
    saveTournamentTeamsById(clubScopeId, activeTournamentId, normalized);
    setTeams(normalized);
    setSavedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
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
            <CardDescription>Nombre y asignación manual de grupo (temporal, hasta motor automático).</CardDescription>
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
                <div key={team.id} className="rounded-xl border border-cyan-500/15 bg-black/25 p-3 flex flex-col md:flex-row gap-3 md:items-center">
                  <input
                    value={team.name}
                    disabled={isFinished}
                    onChange={(e) =>
                      setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, name: e.target.value } : t)))
                    }
                    placeholder="Nombre del equipo"
                    className="h-10 flex-1 rounded-lg border border-cyan-500/15 bg-black/40 px-3 text-white outline-none"
                  />
                  <select
                    value={team.groupIndex == null ? "" : String(team.groupIndex)}
                    disabled={isFinished}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTeams((prev) =>
                        prev.map((t) =>
                          t.id === team.id
                            ? { ...t, groupIndex: v === "" ? undefined : Math.max(0, Math.min(groupsCount - 1, Number(v))) }
                            : t,
                        ),
                      );
                    }}
                    className="h-10 rounded-lg border border-cyan-500/15 bg-black/40 px-3 text-white outline-none md:w-[180px]"
                  >
                    <option value="">Sin grupo</option>
                    {Array.from({ length: groupsCount }).map((_, idx) => (
                      <option key={idx} value={String(idx)}>
                        Grupo {String.fromCharCode(65 + idx)}
                      </option>
                    ))}
                  </select>
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

