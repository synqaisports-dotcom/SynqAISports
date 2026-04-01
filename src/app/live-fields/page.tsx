"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, LogOut, MonitorSmartphone, Tv2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { readContinuityContext } from "@/lib/continuity-context";
import { canAccessEliteTerminal, canAccessEliteTerminalAsDev, isEliteClubId, resolveTerminalEffectiveClubId } from "@/lib/club-permissions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";

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

type MockSlot = {
  start: string;
  end: string;
  teamName: string;
  coachName: string;
};

type MockZoneSchedule = {
  zone: string;
  slots: MockSlot[];
};

type LiveFieldsScheduleItem = {
  facilityId: string;
  zone: string;
  start: string;
  end: string;
  teamName: string;
  coachName: string;
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

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

function getCurrentMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export default function LiveFieldsPage() {
  const { user, session, profile, loading, logout } = useAuth();
  const router = useRouter();
  const [now, setNow] = useState(nowLabel());
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [continuity, setContinuity] = useState<ContinuityCtx | null>(null);
  const [devClubId, setDevClubId] = useState<string>("");
  const [scheduleItems, setScheduleItems] = useState<LiveFieldsScheduleItem[]>([]);
  const { t } = useI18n();

  const isDevAdmin = canAccessEliteTerminalAsDev(profile);
  const effectiveClubId = resolveTerminalEffectiveClubId(profile, devClubId);
  const isFounderGuest = user?.id === "synq-root-dev" && profile?.role === "superadmin";
  const isLogged = (!!user && !!session) || isFounderGuest;

  useEffect(() => {
    if (loading) return;
    if (isLogged) return;
    const target = "/login?next=/live-fields";
    router.replace(target);
    // Fallback robusto para entornos donde el router cliente no completa la navegación.
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        if (window.location.pathname === "/live-fields") {
          window.location.replace(target);
        }
      }, 120);
    }
  }, [isLogged, loading, router]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(nowLabel()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (loading) return;
    const load = () => {
      const clubId = String(effectiveClubId || "global-hq");
      const facilitiesKey = `synq_methodology_facilities_v1_${clubId}`;
      const teamsKey = `synq_methodology_warehouse_teams_v1_${clubId}`;
      const scheduleKey = `synq_live_fields_schedule_v1_${clubId}`;

      setFacilities(safeParse<Facility[]>(localStorage.getItem(facilitiesKey), []));
      setTeams(safeParse<Team[]>(localStorage.getItem(teamsKey), []));
      setScheduleItems(safeParse<LiveFieldsScheduleItem[]>(localStorage.getItem(scheduleKey), []));
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
  }, [effectiveClubId, loading]);

  const cards = useMemo(() => {
    const scopedFacilities =
      facilities.length > 0
        ? facilities
        : [
            { id: "mock_f1", name: "Campo 1 (Dividido 2)", type: "Campo", sport: "Fútbol", status: "active" },
            { id: "mock_f2", name: "Campo 2", type: "Campo", sport: "Fútbol", status: "active" },
          ];

    return scopedFacilities.map((f, idx) => {
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

  const mockScheduleCards = useMemo(() => {
    const fallbackTeams =
      teams.length > 0
        ? teams.map((t, idx) => ({ name: t.name, coachName: `Entrenador ${idx + 1}` }))
        : [
            { name: "Alevín A", coachName: "David Martín" },
            { name: "Infantil B", coachName: "Laura Ruiz" },
            { name: "Cadete A", coachName: "Pablo García" },
            { name: "Juvenil A", coachName: "Sara López" },
          ];

    return cards.map((c, idx) => {
      const base = fallbackTeams[idx % fallbackTeams.length];
      const altA = fallbackTeams[(idx + 1) % fallbackTeams.length];
      const altB = fallbackTeams[(idx + 2) % fallbackTeams.length];
      const facilityName = c.field.toLowerCase();
      const hasDivision = /(2|4|media|mitad|half|dividido)/.test(facilityName) || idx % 2 === 0;

      const scheduleFromStorage = scheduleItems.filter((it) => it.facilityId === c.id);

      const zones: MockZoneSchedule[] =
        scheduleFromStorage.length > 0
          ? Object.values(
              scheduleFromStorage.reduce((acc, item) => {
                const zoneKey = item.zone || "CAMPO COMPLETO";
                const current = acc[zoneKey] ?? { zone: zoneKey, slots: [] as MockSlot[] };
                current.slots.push({
                  start: item.start,
                  end: item.end,
                  teamName: item.teamName,
                  coachName: item.coachName,
                });
                acc[zoneKey] = current;
                return acc;
              }, {} as Record<string, MockZoneSchedule>),
            ).map((z) => ({
              ...z,
              slots: z.slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
            }))
          : hasDivision
            ? [
                {
                  zone: "MITAD SUPERIOR",
                  slots: [
                    { start: "17:00", end: "18:00", teamName: base.name, coachName: base.coachName },
                    { start: "18:00", end: "19:00", teamName: altA.name, coachName: altA.coachName },
                    { start: "19:00", end: "20:00", teamName: altB.name, coachName: altB.coachName },
                  ],
                },
                {
                  zone: "MITAD INFERIOR",
                  slots: [
                    { start: "17:00", end: "18:00", teamName: altB.name, coachName: altB.coachName },
                    { start: "18:00", end: "19:00", teamName: base.name, coachName: base.coachName },
                    { start: "19:00", end: "20:00", teamName: altA.name, coachName: altA.coachName },
                  ],
                },
              ]
            : [
                {
                  zone: "CAMPO COMPLETO",
                  slots: [
                    { start: "17:00", end: "18:15", teamName: base.name, coachName: base.coachName },
                    { start: "18:15", end: "19:30", teamName: altA.name, coachName: altA.coachName },
                    { start: "19:30", end: "20:45", teamName: altB.name, coachName: altB.coachName },
                  ],
                },
              ];

      const nowMin = getCurrentMinutes();
      const withCurrent = zones.map((z) => {
        const currentSlot =
          z.slots.find((s) => nowMin >= toMinutes(s.start) && nowMin < toMinutes(s.end)) ?? null;
        return { ...z, currentSlot };
      });

      return {
        ...c,
        zones: withCurrent,
      };
    });
  }, [cards, teams, scheduleItems]);

  if (loading) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center">
        <p className="text-[11px] font-black uppercase tracking-[0.35em] text-cyan-300/80">{t("live_fields.loading_terminal")}</p>
      </main>
    );
  }

  const canAccess = canAccessEliteTerminal(profile, devClubId) || canAccessEliteTerminalAsDev(profile);
  if (!isLogged) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-cyan-500/20 bg-black/40 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">{t("live_fields.protected_access")}</p>
          <h1 className="mt-3 text-2xl font-black uppercase">{t("live_fields.redirecting_login")}</h1>
          <p className="mt-3 text-sm text-white/70">{t("live_fields.validating_session")}</p>
        </div>
      </main>
    );
  }

  if (!canAccess) {
    return (
      <main className="min-h-[100dvh] bg-[#03060d] text-white flex items-center justify-center p-6">
        <div className="max-w-xl rounded-3xl border border-cyan-500/20 bg-black/40 p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">{t("live_fields.elite")}</p>
          <h1 className="mt-3 text-2xl font-black uppercase">{t("live_fields.club_only_terminal")}</h1>
          <p className="mt-3 text-sm text-white/70">
            {t("live_fields.elite_desc")}
          </p>
          {isDevAdmin ? (
            <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-black/35 p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300/80">{t("live_fields.dev_access")}</p>
              <p className="mt-2 text-[11px] text-white/65">{t("live_fields.enter_club_id")}</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={devClubId}
                  onChange={(e) => setDevClubId(e.target.value)}
                  placeholder="UUID club_id"
                  className="h-10 flex-1 rounded-xl border border-cyan-500/25 bg-black/40 px-3 text-xs font-black tracking-wider text-white outline-none"
                />
                <Button
                  type="button"
                  className="h-10 bg-primary text-black font-black uppercase text-[10px] tracking-widest"
                  onClick={() => setDevClubId((v) => v.trim())}
                >
                  {t("common.load")}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#03060d] text-white overflow-hidden">
      {/* Fondo ligero tipo campo de fútbol (sin imágenes) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.20),rgba(3,6,13,0.88)_50%,rgba(3,6,13,1)_100%)]" />
        <div className="absolute inset-0 opacity-[0.34]">
          <svg viewBox="0 0 1000 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <pattern id="synq-grass" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="transparent" />
                <path d="M0 0 L20 20 M20 0 L0 20" stroke="rgba(16,185,129,0.18)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="1000" height="600" fill="url(#synq-grass)" />
            {/* Líneas del campo */}
            <g fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="2">
              <rect x="40" y="40" width="920" height="520" rx="18" />
              <line x1="500" y1="40" x2="500" y2="560" />
              <circle cx="500" cy="300" r="70" />
              <circle cx="500" cy="300" r="6" fill="rgba(34,211,238,0.22)" />
              {/* Áreas */}
              <rect x="40" y="160" width="120" height="280" rx="10" />
              <rect x="840" y="160" width="120" height="280" rx="10" />
              <rect x="40" y="210" width="55" height="180" rx="10" />
              <rect x="905" y="210" width="55" height="180" rx="10" />
              {/* Puntos de penalti */}
              <circle cx="135" cy="300" r="4" fill="rgba(34,211,238,0.20)" />
              <circle cx="865" cy="300" r="4" fill="rgba(34,211,238,0.20)" />
              {/* Arcos */}
              <path d="M160 300 a55 55 0 0 0 0 0.01" />
              <path d="M840 300 a55 55 0 0 1 0 0.01" />
            </g>
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#03060d]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_60%)] mix-blend-screen" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <section className="relative z-10 px-4 sm:px-6 lg:px-10 pt-6 pb-4 border-b border-cyan-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.38em] text-cyan-300/80">Terminal · Live Fields</p>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              {t("live_fields.realtime_fields_status")}
            </h1>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              Club: {effectiveClubId}
            </p>
            {!isEliteClubId(effectiveClubId) && isDevAdmin ? (
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300/80">
                {t("live_fields.enter_club_id_hint")}
              </p>
            ) : null}
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
              {t("common.logout")}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Pill icon={Tv2} text={t("live_fields.optimized_tv")} />
          <Pill icon={MonitorSmartphone} text={t("live_fields.responsive_fallback")} />
          <Pill icon={Activity} text={t("live_fields.no_navbar")} />
        </div>
      </section>

      <section className="relative z-10 p-4 sm:p-6 lg:p-10 pb-28">
        {cards.length === 0 ? (
          <div className="rounded-3xl border border-cyan-500/20 bg-black/35 p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300/80">{t("live_fields.no_elite_data")}</p>
            <p className="mt-2 text-sm text-white/70">
              {t("live_fields.no_data_desc")}
            </p>
          </div>
        ) : null}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {mockScheduleCards.map((c) => (
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
                  {c.state === "Mantenimiento" ? t("live_fields.state_maintenance") : c.state === "En uso" ? t("live_fields.state_in_use") : t("live_fields.state_free")}
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase font-black tracking-[0.2em] text-white/45">
                {c.type} · {c.sport}
              </p>
              <div className="mt-4 space-y-3">
                {c.zones.map((zone) => (
                  <div key={`${c.id}_${zone.zone}`} className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] uppercase font-black tracking-[0.25em] text-cyan-300/80">{zone.zone}</p>
                      {zone.currentSlot ? (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border border-emerald-400/30 text-emerald-300 bg-emerald-500/10">
                          En curso
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-md border border-white/15 text-white/70 bg-white/5">
                          Sin actividad
                        </span>
                      )}
                    </div>
                    <div className="mt-2 space-y-2">
                      {zone.slots.map((slot, slotIdx) => {
                        const isCurrent = zone.currentSlot?.start === slot.start && zone.currentSlot?.end === slot.end;
                        return (
                          <div
                            key={`${zone.zone}_${slot.start}_${slotIdx}`}
                            className={cn(
                              "rounded-xl border px-3 py-2 transition-[background-color,border-color,color,opacity,transform]",
                              isCurrent
                                ? "border-emerald-400/35 bg-emerald-500/10"
                                : "border-cyan-500/15 bg-black/25",
                            )}
                          >
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                              {slot.start} - {slot.end}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-black uppercase text-cyan-200">{slot.teamName}</span>
                              <span className="text-[10px] font-black uppercase text-white/70">{slot.coachName}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/65">
                <Users className="h-4 w-4 text-cyan-300/80" />
                <span className="text-[11px] font-black uppercase">Mock horario (pendiente BBDD real)</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Banda inferior: 2 slots AdMob (placeholder) 50/50 */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-cyan-500/20 bg-black/55 backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-10 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-16 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">AdMob · Slot A</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-200/70">
                  {t("ads.placeholder", "ANUNCIO")}
                </p>
              </div>
            </div>
            <div className="h-16 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">AdMob · Slot B</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-200/70">
                  {t("ads.placeholder", "ANUNCIO")}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
            {t("ads.split_note", "Reparto 50/50")}
          </p>
        </div>
      </footer>
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
