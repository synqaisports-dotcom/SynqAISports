"use client";

import { useMemo } from "react";
import { CalendarRange, Eye, Trophy } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

type PlannerConfig = {
  tournamentName?: string;
  startDate?: string;
  endDate?: string;
  teamsCount?: number;
  tournamentDays?: number;
  fieldsCount?: number;
  groupsCount?: number;
};

function formatDate(value?: string): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-ES");
}

export default function TournamentsListPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global-hq";
  const storageKey = useMemo(() => `synq_tournaments_planner_v1_${clubScopeId}`, [clubScopeId]);

  const data = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as PlannerConfig;
    } catch {
      return null;
    }
  }, [storageKey]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="border-b border-violet-400/15 pb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-300/70">NODO TORNEOS · LISTADO</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">Ver torneos</h1>
      </div>

      {!data ? (
        <Card className="border border-violet-400/20 bg-black/30 rounded-2xl">
          <CardContent className="py-8 text-center text-white/70">
            No hay torneos guardados todavía. Crea el primero desde el Planificador.
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-violet-400/20 bg-black/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-violet-300" />
              {data.tournamentName || "Torneo sin nombre"}
            </CardTitle>
            <CardDescription>
              Club: {clubScopeId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Mini label="Fechas" value={`${formatDate(data.startDate)} - ${formatDate(data.endDate)}`} icon={CalendarRange} />
              <Mini label="Equipos" value={String(data.teamsCount ?? "-")} />
              <Mini label="Grupos" value={String(data.groupsCount ?? "-")} />
              <Mini label="Campos" value={String(data.fieldsCount ?? "-")} />
            </div>
            <Link
              href="/dashboard/tournaments/planner"
              className="inline-flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-200"
            >
              <Eye className="h-3.5 w-3.5" />
              Ver / editar en planificador
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Mini(props: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }) {
  const Icon = props.icon;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55 flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 text-violet-300/80" /> : null}
        {props.label}
      </p>
      <p className="mt-1 text-[11px] font-black text-white">{props.value}</p>
    </div>
  );
}
