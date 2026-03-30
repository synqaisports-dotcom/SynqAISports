"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, LogOut, MonitorSmartphone, Tv2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { readContinuityContext } from "@/lib/continuity-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

type ContinuityCtx = {
  mode: "match" | "training";
  teamId: string;
  mcc: string;
  session: string;
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
  const { profile, loading, logout } = useAuth();
  const router = useRouter();
  const [now, setNow] = useState(nowLabel());
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [continuity, setContinuity] = useState<ContinuityCtx | null>(null);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(nowLabel()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!profile?.clubId || profile.clubId === "global-hq") return;

    const load = () => {
      const clubId = String(profile.clubId);
      const facilitiesKey = `synq_methodology_facilities_v1_${clubId}`;
      const teamsKey = `synq_methodology_warehouse_teams_v1_${clubId}`;

      setFacilities(safeParse<Facility[]>(localStorage.getItem(facilitiesKey), []));
      setTeams(safeParse<Team[]>(localStorage.getItem(teamsKey), []));
      setContinuity(readContinuityContext(clubId));
    };

    load();
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);
    const poll = window.setInterval(load, 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(poll);
    };
  }, [profile?.clubId, loading]);

  const cards = useMemo(() => {
    return facilities.map((f, idx) => {
      const team = teams.find((t) => t.id === continuity?.teamId) || teams[idx % Math.max(teams.length, 1)];
      const isActiveField = continuity && idx === 0;
      const modeLabel = continuity?.mode === "match" ? "PARTIDO" : "ENTRENO";
      const slotLabel = continuity ? `${modeLabel} · ${continuity.mcc} ${continuity.session}` : "SIN SESIÓN ACTIVA";
      const maintenance = String(f.status || "").toLowerCase() === "maintenance";

      return {
        id: f.id,
        field: f.name || `Campo ${idx + 1}`,
        type: f.type || "Campo",
        sport: f.sport || "Fútbol",
        team: team?.name || "Equipo no asignado",
        slot: slotLabel,
        state: maintenance ? "Mantenimiento" : isActiveField ? "En uso" : "Libre",
      };
    });
  }, [facilities, teams, continuity]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center">
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Cargando terminal…</p>
      </main>
    );
  }

  const isLogged = !!profile;
  const isElite = !!profile?.clubId && profile.clubId !== "global-hq";
  if (!isLogged) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-cyan-500/20 bg-black/40 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Live Fields · Acceso protegido</p>
          <h1 className="mt-3 text-2xl font-black uppercase">Inicia sesión para continuar</h1>
          <p className="mt-3 text-sm text-white/70">
            Esta terminal requiere identificar el club para cargar datos de campos en tiempo real.
          </p>
          <div className="mt-6">
            <Button
              className="h-11 rounded-2xl bg-primary text-black font-black uppercase text-[10px] tracking-widest px-6"
              onClick={() => router.push("/login?next=/live-fields")}
            >
              Ir a login
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!isElite) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-cyan-500/20 bg-black/40 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Live Fields · Elite</p>
          <h1 className="mt-3 text-2xl font-black uppercase">Terminal solo para datos de club</h1>
          <p className="mt-3 text-sm text-white/70">
            Esta micro-app consume únicamente datos Elite (instalaciones, equipos y contexto operativo por club).
          </p>
        </div>
      </main>
    );
  }

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
          <div className="flex items-center gap-2">
            <div className="rounded-2xl border border-cyan-500/25 bg-black/40 px-4 py-2 flex items-center gap-3">
              <Clock3 className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-black tabular-nums">{now}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-cyan-500/25 bg-black/40 text-cyan-200 hover:text-white hover:bg-cyan-500/10 font-black uppercase text-[10px] tracking-widest"
              onClick={async () => {
                await logout();
                router.replace("/login?next=/live-fields");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill icon={Tv2} text="Optimizado para TV / monitor / All‑in‑One" />
          <Pill icon={MonitorSmartphone} text="Responsive fallback para pantallas pequeñas" />
          <Pill icon={Activity} text="Sin barra de navegación" />
        </div>
      </section>

      <section className="relative z-10 p-4 sm:p-6 lg:p-10">
        {cards.length === 0 ? (
          <div className="rounded-3xl border border-cyan-500/20 bg-black/35 p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Sin datos elite</p>
            <p className="mt-2 text-sm text-white/70">
              Crea instalaciones y equipos en el BackOffice para visualizar estado en esta terminal.
            </p>
          </div>
        ) : null}
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
