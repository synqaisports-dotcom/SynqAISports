"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, MonitorSmartphone, Tv2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type Facility = {
  id: string;
  name?: string;
  type?: string;
  sport?: string;
  status?: string;
};

type Team = {
  id: string;
  name: string;
};

type SessionItem = {
  id?: string | number;
  title?: string;
  createdAt?: string;
  warmup?: { title?: string };
  main?: { title?: string };
  cooldown?: { title?: string };
};

type MatchItem = {
  id?: string | number;
  date?: string;
  rivalName?: string;
  location?: string;
  status?: string;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function nowLabel(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LiveFieldsPage() {
  const [now, setNow] = useState(nowLabel());
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(nowLabel()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = () => {
      const profile = safeParse<{ clubId?: string } | null>(localStorage.getItem("synq_profile"), null);
      const clubId = String(profile?.clubId || "global-hq");
      const facilitiesKey = `synq_methodology_facilities_v1_${clubId}`;
      const teamsKey = `synq_methodology_warehouse_teams_v1_${clubId}`;

      setFacilities(safeParse<Facility[]>(localStorage.getItem(facilitiesKey), []));
      setTeams(safeParse<Team[]>(localStorage.getItem(teamsKey), []));

      const vault = safeParse<{ sessions?: SessionItem[]; matches?: MatchItem[] }>(
        localStorage.getItem("synq_promo_vault"),
        {},
      );
      setSessions(Array.isArray(vault.sessions) ? vault.sessions : []);
      setMatches(Array.isArray(vault.matches) ? vault.matches : []);
    };

    load();
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    const poll = window.setInterval(load, 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poll);
    };
  }, []);

  const cards = useMemo(() => {
    const fallbackFacilities =
      facilities.length > 0
        ? facilities
        : [
            { id: "f-1", name: "Campo Principal", type: "F11", sport: "Fútbol", status: "Active" },
            { id: "f-2", name: "Campo Secundario", type: "F7", sport: "Fútbol", status: "Active" },
            { id: "f-3", name: "Pista cubierta", type: "Indoor", sport: "Multideporte", status: "Active" },
          ];

    return fallbackFacilities.map((f, idx) => {
      const team = teams[idx % Math.max(teams.length, 1)];
      const session = sessions[idx % Math.max(sessions.length, 1)];
      const match = matches[idx % Math.max(matches.length, 1)];
      const trainingTitle = session?.title || session?.main?.title || "Entrenamiento libre";
      const isMatch = String(match?.status || "").toLowerCase() === "scheduled";

      return {
        id: f.id,
        field: f.name || `Campo ${idx + 1}`,
        type: f.type || "Campo",
        sport: f.sport || "Fútbol",
        team: team?.name || "Equipo sin asignar",
        slot: isMatch
          ? `PARTIDO · VS ${String(match?.rivalName || "Rival por definir").toUpperCase()}`
          : `ENTRENO · ${String(trainingTitle || "").toUpperCase()}`,
        state: String(f.status || "Active").toLowerCase() === "maintenance" ? "Mantenimiento" : "En uso",
      };
    });
  }, [facilities, teams, sessions, matches]);

  return (
    <main className="min-h-[100dvh] bg-[#03060d] text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <section className="relative z-10 px-4 sm:px-6 lg:px-10 pt-6 pb-4 border-b border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.38em] text-cyan-300/80">Terminal · Live Fields</p>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Estado en tiempo real de campos
            </h1>
          </div>
          <div className="rounded-2xl border border-cyan-500/25 bg-black/40 px-4 py-2 flex items-center gap-3">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            <span className="text-sm font-black tabular-nums">{now}</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill icon={Tv2} text="Optimizado para TV / monitor / All‑in‑One" />
          <Pill icon={MonitorSmartphone} text="Responsive fallback para pantallas pequeñas" />
          <Pill icon={Activity} text="Sin barra de navegación" />
        </div>
      </section>

      <section className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {cards.map((c) => (
            <article
              key={c.id}
              className="rounded-3xl border border-cyan-500/20 bg-black/35 backdrop-blur-sm p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black uppercase tracking-tight">{c.field}</h2>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg border",
                    c.state === "Mantenimiento"
                      ? "border-amber-400/40 text-amber-300 bg-amber-500/10"
                      : "border-emerald-400/30 text-emerald-300 bg-emerald-500/10",
                  )}
                >
                  {c.state}
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase font-black tracking-[0.2em] text-white/45">
                {c.type} · {c.sport}
              </p>
              <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
                <p className="text-[10px] uppercase font-black tracking-[0.25em] text-cyan-300/70">Actividad</p>
                <p className="mt-1 text-sm font-black uppercase">{c.slot}</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-300/80" />
                <span className="text-sm font-black uppercase">{c.team}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Pill(props: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  const Icon = props.icon;
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-black/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/80">
      <Icon className="h-3.5 w-3.5" />
      {props.text}
    </span>
  );
}
