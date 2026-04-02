"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarRange, ListOrdered, Pencil, Search, Swords, Trophy, Users } from "lucide-react";
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

type TournamentListItem = {
  record: TournamentIndexItem;
  startDate?: string;
  endDate?: string;
  category: string;
  footballFormat?: TournamentIndexItem["footballFormat"];
  configuredTeams: number;
  loadedTeams: number;
  year: string;
};

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const [tournaments, setTournaments] = useState<TournamentIndexItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TournamentIndexItem["status"]>("all");
  const [formatFilter, setFormatFilter] = useState<"all" | "f11" | "f7" | "futsal">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  useEffect(() => {
    migrateLegacySingleTournamentIfNeeded({
      clubId: clubScopeId,
      legacyPlannerKey: `synq_tournaments_planner_v1_${clubScopeId}`,
      legacyTeamsKey: `synq_tournaments_teams_v1_${clubScopeId}`,
    });
    const list = loadTournamentIndex(clubScopeId);
    setTournaments(list);
  }, [clubScopeId]);

  const listItems = useMemo<TournamentListItem[]>(() => {
    return tournaments
      .map((t) => {
        const cfg = loadTournamentConfigById(clubScopeId, t.id);
        const teams = loadTournamentTeamsById(clubScopeId, t.id);
        const loadedTeams = Array.isArray(teams) ? teams.length : 0;
        const startDate = cfg?.startDate;
        const year = startDate?.slice(0, 4) || t.createdAt.slice(0, 4) || "-";
        const category = (cfg?.categoryLabel || cfg?.categories?.[0] || t.primaryCategory || "-").toString();
        return {
          record: t,
          startDate,
          endDate: cfg?.endDate,
          category,
          footballFormat: cfg?.footballFormat || t.footballFormat,
          configuredTeams: Number(cfg?.teamsCount || 0),
          loadedTeams,
          year,
        };
      })
      .sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt));
  }, [clubScopeId, tournaments]);

  const categories = useMemo(() => {
    return Array.from(new Set(listItems.map((x) => x.category).filter((x) => x && x !== "-"))).sort();
  }, [listItems]);

  const years = useMemo(() => {
    return Array.from(new Set(listItems.map((x) => x.year).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  }, [listItems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listItems.filter((x) => {
      if (statusFilter !== "all" && x.record.status !== statusFilter) return false;
      if (formatFilter !== "all" && x.footballFormat !== formatFilter) return false;
      if (categoryFilter !== "all" && x.category !== categoryFilter) return false;
      if (yearFilter !== "all" && x.year !== yearFilter) return false;
      if (!q) return true;
      const haystack = `${x.record.name} ${x.category} ${formatFootball(x.footballFormat)}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [categoryFilter, formatFilter, listItems, query, statusFilter, yearFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-primary/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ver torneos</h1>
        <p className="mt-2 text-xs text-white/65">
          Roadmap C por fases: F1 Historial y filtros · F2 Clasificación + cruces · F3 Analítica y exportables.
        </p>
      </div>

      {tournaments.length === 0 ? (
        <Card className="glass-panel border border-primary/20 bg-black/30 rounded-2xl">
          <CardContent className="py-8 text-center text-white/70">
            No hay torneos guardados todavía. Crea el primero desde el Planificador.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="glass-panel border border-cyan-500/20 bg-black/30 rounded-2xl">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white font-black uppercase tracking-wider">Torneos</CardTitle>
                <CardDescription>Histórico del club. Cada torneo es independiente.</CardDescription>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
                <label className="lg:col-span-2 h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-cyan-300/80" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar torneo..."
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                  />
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | TournamentIndexItem["status"])}
                  className="h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 text-xs font-black uppercase tracking-[0.12em] text-white outline-none"
                >
                  <option value="all">Estado: todos</option>
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="finished">Finalizado</option>
                </select>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value as "all" | "f11" | "f7" | "futsal")}
                  className="h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 text-xs font-black uppercase tracking-[0.12em] text-white outline-none"
                >
                  <option value="all">Formato: todos</option>
                  <option value="f11">F11</option>
                  <option value="f7">F7</option>
                  <option value="futsal">Futsal</option>
                </select>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 text-xs font-black uppercase tracking-[0.12em] text-white outline-none"
                >
                  <option value="all">Año: todos</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 rounded-xl border border-cyan-500/20 bg-black/35 px-3 text-xs font-black uppercase tracking-[0.12em] text-white outline-none"
                >
                  <option value="all">Categoría: todas</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="lg:col-span-2 h-10 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.14em] text-cyan-200/85">
                  <span>Total torneos visibles</span>
                  <span>{filtered.length}</span>
                </div>
              </div>

              {filtered.map((item) => {
                const t = item.record;
                return (
                  <div key={t.id} className="rounded-2xl border border-cyan-500/20 bg-black/25 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="space-y-2">
                        <p className="text-[11px] font-black text-white uppercase">{t.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-2">
                          <Mini label="Fechas" value={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`} icon={CalendarRange} />
                          <Mini label="Categoría" value={item.category} />
                          <Mini label="Formato" value={formatFootball(item.footballFormat)} />
                          <Mini label="Equipos cfg" value={String(item.configuredTeams || "-")} />
                          <Mini label="Equipos cargados" value={String(item.loadedTeams)} />
                          <Mini label="Estado" value={t.status.toUpperCase()} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveTournamentId(clubScopeId, t.id)}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Activar torneo"
                        >
                          <Trophy className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/dashboard/tournaments/planner?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Modificar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/teams?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Asignar equipos"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/standings?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Ver clasificación"
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/brackets?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Ver cruces"
                        >
                          <Swords className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/dashboard/tournaments/analytics?tournamentId=${encodeURIComponent(t.id)}`}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-primary/25 bg-primary/10 text-primary"
                          title="Analítica"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-cyan-500/20 bg-black/25 p-4 text-sm text-white/65">
                  No hay torneos para los filtros actuales.
                </div>
              ) : null}
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
