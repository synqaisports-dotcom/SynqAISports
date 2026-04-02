"use client";

import { useEffect, useState } from "react";
import { CalendarRange, Pencil, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import {
  ensureTournamentId,
  getActiveTournamentId,
  loadTournamentIndex,
  migrateLegacySingleTournamentIfNeeded,
  loadTournamentConfigById,
  loadTournamentTeamsById,
  saveTournamentIndex,
  saveTournamentConfigById,
  setActiveTournamentId,
  type TournamentIndexItem,
} from "@/lib/tournaments-storage";

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-ES");
}

function formatFootball(value?: TournamentIndexItem["footballFormat"]): string {
  if (!value) return "-";
  return value === "f11" ? "F11" : value === "f7" ? "F7" : "FUTSAL";
}

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [tournaments, setTournaments] = useState<TournamentIndexItem[]>([]);

  useEffect(() => {
    migrateLegacySingleTournamentIfNeeded({
      clubId: clubScopeId,
      legacyPlannerKey: `synq_tournaments_planner_v1_${clubScopeId}`,
      legacyTeamsKey: `synq_tournaments_teams_v1_${clubScopeId}`,
    });
    const list = loadTournamentIndex(clubScopeId);
    setTournaments(list);
  }, [clubScopeId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ver torneos</h1>
      </div>

      {tournaments.length === 0 ? (
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardContent className="py-8 text-center text-white/70">
            No hay torneos guardados todavía. Crea el primero desde el Planificador.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white font-black uppercase tracking-wider">Torneos</CardTitle>
                <CardDescription>Lista de torneos con acciones rápidas por torneo.</CardDescription>
              </div>
              <button
                type="button"
                onClick={() => {
                  const id = ensureTournamentId();
                  const now = new Date().toISOString();
                  const next: TournamentIndexItem = {
                    id,
                    name: `Nuevo torneo ${tournaments.length + 1}`,
                    status: "draft",
                    createdAt: now,
                    updatedAt: now,
                  };
                  try {
                    const merged = [...tournaments, next];
                    saveTournamentIndex(clubScopeId, merged);
                    saveTournamentConfigById(clubScopeId, id, {
                      tournamentName: next.name,
                      categoryLabel: "Alevín",
                      categories: [],
                      teamsCount: 8,
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
                    });
                    setTournaments(merged);
                    setActiveTournamentId(clubScopeId, id);
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/25 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.16em]"
              >
                + Nuevo torneo
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tournaments.map((t) => {
                const cfg = loadTournamentConfigById(clubScopeId, t.id);
                const teams = loadTournamentTeamsById(clubScopeId, t.id);
                const teamsCount = Array.isArray(teams) ? teams.length : 0;
                return (
                  <div key={t.id} className="rounded-2xl border border-primary/20 bg-black/25 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-white uppercase">{t.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
                          <Mini label="Fechas" value={`${formatDate(cfg?.startDate)} - ${formatDate(cfg?.endDate)}`} icon={CalendarRange} />
                          <Mini label="Categoría" value={(cfg?.categories?.[0] ?? "-").toString()} />
                          <Mini label="Formato" value={formatFootball(cfg?.footballFormat)} />
                          <Mini label="Equipos cfg" value={String(cfg?.teamsCount ?? "-")} />
                          <Mini label="Equipos cargados" value={String(teamsCount)} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTournamentId(clubScopeId, t.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                          Activar
                        </button>
                        <Link
                          href={`/dashboard/tournaments/planner?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modificar
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/teams?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Equipos
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Mini(props: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  const Icon = props.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55 flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 text-primary/80" /> : null}
        {props.label}
      </p>
      <p className="mt-1 text-[11px] font-black text-white">{props.value}</p>
    </div>
  );
}
