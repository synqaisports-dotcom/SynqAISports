
"use client";

import { useAuth } from "@/lib/auth-context";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Activity,
  UserCog,
  Clock,
  ChevronRight,
  Heart,
  Award,
  Zap,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useOperativaSync } from "@/hooks/use-operativa-sync";
import { readPlayersLocal } from "@/lib/player-storage";
import { Area, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Dashboard Maestro - v10.1.0
 * Centro de mando simplificado. La gamificación se ha movido a Estadísticas Sandbox
 * para usuarios Free para optimizar el túnel de conversión.
 */
export default function DashboardPage() {
  const { profile } = useAuth();
  const clubScopeId = profile?.clubId ?? "global";
  const { loadSnapshot } = useOperativaSync(clubScopeId);
  const [kpis, setKpis] = useState({
    athletes: 0,
    attendanceRate: 0,
    pendingRequests: 0,
    sessionsPlanned: 0,
  });
  const [recentSessions, setRecentSessions] = useState<
    Array<{ id: string; time: string; category: string; focus: string; location: string; status: "ready" | "pending" }>
  >([]);
  const [weeklyPulse, setWeeklyPulse] = useState<Array<{ label: string; sessions: number; attendance: number }>>([]);
  const [isPulseDemo, setIsPulseDemo] = useState(false);

  const trafficBars = [
    { label: "Asistencia", value: Math.max(0, Math.min(100, kpis.attendanceRate)), color: "#34D399" },
    { label: "Sesiones", value: Math.max(0, Math.min(100, kpis.sessionsPlanned * 8)), color: "#00F2FF" },
    { label: "Pendientes", value: Math.max(0, Math.min(100, kpis.pendingRequests * 12)), color: "#FACC15" },
  ];

  const performancePie = [
    { name: "Sesiones", value: Math.max(0, Number(kpis.sessionsPlanned) || 0), color: "#00F2FF" },
    { name: "Pendientes", value: Math.max(0, Number(kpis.pendingRequests) || 0), color: "#FACC15" },
    { name: "Roster", value: Math.max(0, Number(kpis.athletes) || 0), color: "rgba(255,255,255,0.22)" },
  ];

  if (!profile) return null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const loadDashboardOperativa = async () => {
      const players = readPlayersLocal(clubScopeId);

      const localPlannerRaw = localStorage.getItem(`synq_methodology_session_planner_v1_${clubScopeId}`);
      const localPlanner = (() => {
        try {
          return JSON.parse(localPlannerRaw || "{}") as {
            assignments?: Array<{
              id?: string;
              teamId?: string;
              mcc?: string;
              session?: string;
              blockKey?: "warmup" | "central" | "cooldown";
              exerciseTitle?: string;
              updatedAt?: string;
            }>;
            changeRequests?: Array<{ status?: string }>;
            attendance?: Record<string, Record<string, string>>;
          };
        } catch {
          return {};
        }
      })();

      const remote = await loadSnapshot();
      const assignments =
        remote.assignments.length > 0
          ? remote.assignments
          : Array.isArray(localPlanner.assignments)
            ? localPlanner.assignments
            : [];
      const requests =
        remote.requests.length > 0
          ? remote.requests
          : Array.isArray(localPlanner.changeRequests)
            ? localPlanner.changeRequests
            : [];
      const attendance =
        Object.keys(remote.attendance).length > 0
          ? remote.attendance
          : (localPlanner.attendance ?? {});

      let present = 0;
      let total = 0;
      Object.values(attendance).forEach((sessionMap) => {
        Object.values(sessionMap || {}).forEach((v) => {
          total += 1;
          if (String(v).toLowerCase() === "present") present += 1;
        });
      });
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
      const pendingRequests = requests.filter((r) => String(r?.status ?? "").toLowerCase() === "pending").length;
      const sessionsPlanned = new Set(
        assignments.map((a) => `${String(a.teamId)}_${String(a.mcc)}_${String(a.session)}`),
      ).size;

      const top = assignments
        .slice()
        .sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")))
        .slice(0, 3)
        .map((a, idx) => ({
          id: String(a.id ?? `item-${idx}`),
          time: `SES_${String(a.session ?? "1")}`,
          category: String(a.teamId ?? "Equipo"),
          focus: String(a.exerciseTitle ?? "Bloque metodológico"),
          location: String(a.blockKey ?? "central").toUpperCase(),
          status: String((a as { status?: string }).status ?? "").toLowerCase() === "pending" ? "pending" : "ready",
        })) as Array<{ id: string; time: string; category: string; focus: string; location: string; status: "ready" | "pending" }>;

      setKpis({
        athletes: players.length,
        attendanceRate,
        pendingRequests,
        sessionsPlanned,
      });
      setRecentSessions(top);

      const attendanceByMcc = new Map<string, { present: number; total: number }>();
      Object.entries(attendance).forEach(([key, playersMap]) => {
        const parts = key.split("_");
        const mcc = parts.length >= 3 ? `${parts[parts.length - 3]}_${parts[parts.length - 2]}` : "MCC";
        const agg = attendanceByMcc.get(mcc) ?? { present: 0, total: 0 };
        Object.values(playersMap || {}).forEach((v) => {
          agg.total += 1;
          if (String(v).toLowerCase() === "present") agg.present += 1;
        });
        attendanceByMcc.set(mcc, agg);
      });

      const sessionsByMcc = new Map<string, number>();
      assignments.forEach((a) => {
        const mcc = String(a.mcc ?? "MCC");
        sessionsByMcc.set(mcc, (sessionsByMcc.get(mcc) ?? 0) + 1);
      });

      const allMcc = Array.from(new Set([...sessionsByMcc.keys(), ...attendanceByMcc.keys()]))
        .sort((a, b) => a.localeCompare(b))
        .slice(-8);

      const pulse = allMcc.map((mcc) => {
        const att = attendanceByMcc.get(mcc) ?? { present: 0, total: 0 };
        const attendancePct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;
        return {
          label: mcc,
          sessions: sessionsByMcc.get(mcc) ?? 0,
          attendance: attendancePct,
        };
      });
      if (pulse.length > 0) {
        setWeeklyPulse(pulse);
        setIsPulseDemo(false);
      } else {
        setWeeklyPulse([
          { label: "OCT_W1", sessions: 6, attendance: 78 },
          { label: "OCT_W2", sessions: 7, attendance: 72 },
          { label: "OCT_W3", sessions: 5, attendance: 69 },
          { label: "OCT_W4", sessions: 8, attendance: 81 },
          { label: "NOV_W1", sessions: 6, attendance: 74 },
          { label: "NOV_W2", sessions: 9, attendance: 84 },
        ]);
        setIsPulseDemo(true);
      }
    };

    void loadDashboardOperativa();
  }, [clubScopeId, loadSnapshot]);

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <p className="text-[10px] uppercase font-black tracking-widest text-primary/50">Home</p>
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">
              Control de Cantera: {profile.clubName || "MODO_SANDBOX"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black text-white italic tracking-tighter uppercase cyan-text-glow leading-none">
            Dashboard_Operativa
          </h1>
          <p className="text-[10px] font-black text-primary/60 tracking-[0.2em] uppercase">Vista ejecutiva semanal</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-2xl">
             SINCRO_ESTABLE
           </Badge>
        </div>
      </div>
      
      {/* MÉTRICAS OPERATIVAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <OperationalMetricCard 
          title="Atletas Totales" 
          value={String(kpis.athletes)} 
          icon={Users} 
          desc="Niños/as en Formación"
          trend="Roster operativo"
        />
        <OperationalMetricCard 
          title="Solicitudes Pend." 
          value={String(kpis.pendingRequests)} 
          icon={UserCog} 
          desc="Pendientes de validación"
        />
        <OperationalMetricCard 
          title="Sesiones Planif." 
          value={String(kpis.sessionsPlanned)} 
          icon={Calendar} 
          desc="Microciclos activos"
          trend="Operativa viva"
        />
        <OperationalMetricCard 
          title="Asistencia Media" 
          value={`${kpis.attendanceRate}%`} 
          icon={TrendingUp} 
          desc="Estado semanal de presencia"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="glass-panel xl:col-span-2 rounded-3xl border border-primary/20 bg-slate-950/80 overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Rendimiento
              {isPulseDemo && (
                <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[9px] font-black uppercase">
                  Demo_Local
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">
              Enero - Diciembre · Evolución semanal por MCC
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <OperativaPeaks data={weeklyPulse} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <MiniStatCard
                title="Conversión operativa"
                value={`${Math.max(0, 100 - Math.min(100, kpis.pendingRequests * 8))}%`}
                tone="text-emerald-300"
              />
              <MiniStatCard
                title="Carga semanal"
                value={`${kpis.sessionsPlanned}`}
                tone="text-primary"
              />
              <MiniStatCard
                title="Riesgo asistencia"
                value={kpis.attendanceRate < 70 ? "ALTO" : "CONTROLADO"}
                tone={kpis.attendanceRate < 70 ? "text-rose-300" : "text-emerald-300"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-3xl border border-primary/20 bg-slate-950/80 overflow-hidden">
          <CardHeader className="p-6 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Traffic
            </CardTitle>
            <CardDescription className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">
              Jan 01 - Dec 31 · Snapshot
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-44 rounded-2xl border border-primary/30 bg-black/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trafficBars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 10, fontWeight: 800 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,242,255,0.08)" }}
                      contentStyle={{
                        background: "rgba(8,16,28,0.95)",
                        border: "1px solid rgba(0,242,255,0.25)",
                        borderRadius: 12,
                        color: "#fff",
                        fontWeight: 800,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.75)", fontWeight: 900 }}
                      itemStyle={{ color: "#00F2FF", fontWeight: 900 }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                      {trafficBars.map((e) => (
                        <Cell key={e.label} fill={e.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-44 rounded-2xl border border-primary/30 bg-black/30 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={performancePie} dataKey="value" nameKey="name" innerRadius={46} outerRadius={76} paddingAngle={2}>
                      {performancePie.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "rgba(8,16,28,0.95)",
                        border: "1px solid rgba(0,242,255,0.25)",
                        borderRadius: 12,
                        color: "#fff",
                        fontWeight: 800,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.75)", fontWeight: 900 }}
                      itemStyle={{ color: "#00F2FF", fontWeight: 900 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="glass-panel lg:col-span-2 rounded-3xl overflow-hidden border border-primary/20 bg-black/40">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-primary">
                <Dumbbell className="h-5 w-5 text-primary" /> Cronograma de Sesiones
              </CardTitle>
              <CardDescription className="text-[10px] text-primary/40 uppercase font-bold tracking-widest">Actividad de las categorías base</CardDescription>
            </div>
            <Button variant="link" className="text-primary font-black text-[10px] uppercase tracking-widest p-0" asChild>
              <Link href="/dashboard/sessions">Ver Todo <ChevronRight className="h-3 w-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {recentSessions.length === 0 ? (
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
                    Sin sesiones recientes todavía en este entorno.
                  </p>
                </div>
              ) : (
                recentSessions.map((item) => (
                  <TrainingItem
                    key={item.id}
                    time={item.time}
                    category={item.category}
                    focus={item.focus}
                    location={item.location}
                    status={item.status}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel rounded-3xl border border-primary/20 bg-black/40 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Actividad de la Red</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 space-y-6">
              <ActivityLog 
                type="info"
                title="Operativa_Híbrida"
                desc="Supabase primero con fallback local activo para pruebas."
              />
              <ActivityLog 
                type="success" 
                title="Asistencia_Actualizada"
                desc={`${kpis.attendanceRate}% de presencia registrada en sesiones.`}
              />
              <ActivityLog 
                type="warning" 
                title="Pendientes_MCC"
                desc={`${kpis.pendingRequests} solicitudes esperan decisión de dirección.`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OperationalMetricCard({ title, value, icon: Icon, desc, trend, highlight }: any) {
  return (
    <Card className={cn(
      "glass-panel relative overflow-hidden group hover:scale-[1.02] transition-[background-color,border-color,color,opacity,transform] rounded-3xl border border-primary/20 bg-black/20",
      highlight && "border-primary/50 bg-primary/5 shadow-[0_0_30px_rgba(0,242,255,0.1)]"
    )}>
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">{title}</p>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black italic tracking-tighter text-primary cyan-text-glow">{value}</p>
            {trend && <span className="text-[10px] font-bold text-primary mb-1 uppercase italic">{trend}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">{desc}</p>
      </CardContent>
    </Card>
  );
}

function TrainingItem({ time, category, focus, location, status }: any) {
  return (
    <div className="p-6 hover:bg-primary/[0.03] transition-colors group flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center justify-center min-w-[60px] h-14 bg-primary/5 border border-primary/20 rounded-2xl group-hover:border-primary/40 transition-[background-color,border-color,color,opacity,transform]">
          <Clock className="h-3 w-3 text-primary/60 mb-1" />
          <span className="text-xs font-black text-primary">{time}</span>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase text-primary tracking-widest">{category}</p>
          <h4 className="text-sm font-bold text-white uppercase italic">{focus}</h4>
          <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-2 w-2 rounded-full",
          status === 'ready' ? 'bg-primary animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/10'
        )} />
        <Button variant="ghost" size="icon" className="text-primary/20 hover:text-primary transition-[background-color,border-color,color,opacity,transform]">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

function ActivityLog({ type, title, desc }: any) {
  const colors: any = {
    success: "bg-primary shadow-[0_0_10px_rgba(0,242,255,0.3)]",
    info: "bg-primary/40",
    warning: "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
  };
  
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={cn("h-2 w-2 rounded-full mt-1.5", colors[type])} />
        <div className="w-[1px] flex-1 bg-white/5 mt-2" />
      </div>
      <div className="space-y-1 pb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:text-primary transition-colors">{title}</p>
        <p className="text-[10px] font-bold text-primary/30 leading-relaxed uppercase">{desc}</p>
      </div>
    </div>
  );
}

function MiniStatCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{title}</p>
      <p className={cn("text-xl font-black italic tracking-tight mt-1", tone ?? "text-white")}>{value}</p>
    </div>
  );
}

function OperativaBars({
  attendanceRate,
  pendingRequests,
  sessionsPlanned,
}: {
  attendanceRate: number;
  pendingRequests: number;
  sessionsPlanned: number;
}) {
  const data = [
    {
      label: "Asistencia",
      value: Math.max(0, Math.min(100, attendanceRate)),
      text: `${attendanceRate}%`,
      tone: "bg-emerald-400",
    },
    {
      label: "Sesiones",
      value: Math.max(0, Math.min(100, sessionsPlanned * 8)),
      text: String(sessionsPlanned),
      tone: "bg-primary",
    },
    {
      label: "Pendientes",
      value: Math.max(0, 100 - Math.min(100, pendingRequests * 12)),
      text: String(pendingRequests),
      tone: "bg-amber-400",
    },
  ];

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest">
            <span className="text-primary/70">{item.label}</span>
            <span className="text-white">{item.text}</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-[background-color,border-color,color,opacity,transform] duration-500", item.tone)}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function OperativaPeaks({
  data,
}: {
  data: Array<{ label: string; sessions: number; attendance: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold">
        Sin histórico suficiente para pintar picos todavía.
      </p>
    );
  }

  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : null;
  const deltaAttendance = prev ? latest.attendance - prev.attendance : 0;
  const deltaSessions = prev ? latest.sessions - prev.sessions : 0;
  const peakAttendance = Math.max(...data.map((d) => d.attendance));
  const peakSessions = Math.max(...data.map((d) => d.sessions));
  const sessionsMax = Math.max(1, ...data.map((d) => d.sessions));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest">
        <span className="text-primary">Sesiones</span>
        <span className="text-emerald-400">Asistencia</span>
        <span className="text-rose-400">Umbral 70%</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniStatCard title="Última asistencia" value={`${latest.attendance}%`} tone={latest.attendance < 70 ? "text-rose-300" : "text-emerald-300"} />
        <MiniStatCard title="Pico asistencia" value={`${peakAttendance}%`} tone="text-primary" />
        <MiniStatCard title="Últimas sesiones" value={`${latest.sessions}`} tone="text-white" />
        <MiniStatCard title="Pico sesiones" value={`${peakSessions}`} tone="text-primary" />
      </div>
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-3 sm:p-4">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: 800 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="sessions"
                allowDecimals={false}
                domain={[0, sessionsMax]}
                tick={{ fill: "rgba(0,242,255,0.9)", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="attendance"
                orientation="right"
                allowDecimals={false}
                domain={[0, 100]}
                tick={{ fill: "rgba(52,211,153,0.9)", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "rgba(0,242,255,0.45)", strokeDasharray: "4 4" }}
                contentStyle={{
                  background: "rgba(8,16,28,0.95)",
                  border: "1px solid rgba(0,242,255,0.25)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.75)", fontWeight: 900 }}
                itemStyle={{ color: "#00F2FF", fontWeight: 900 }}
                formatter={(value: number | string, name: string) => {
                  if (name === "Asistencia") return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <ReferenceLine
                yAxisId="attendance"
                y={70}
                stroke="rgba(244,63,94,0.9)"
                strokeDasharray="4 4"
                label={{ value: "Umbral 70%", fill: "rgba(244,63,94,0.95)", fontSize: 10, fontWeight: 800 }}
              />
              <Area yAxisId="sessions" type="monotone" dataKey="sessions" fill="rgba(0,242,255,0.10)" stroke="none" />
              <Area yAxisId="attendance" type="monotone" dataKey="attendance" fill="rgba(52,211,153,0.08)" stroke="none" />
              <Line
                yAxisId="sessions"
                type="monotone"
                dataKey="sessions"
                name="Sesiones"
                stroke="#00F2FF"
                strokeWidth={2.2}
                dot={{ r: 3, fill: "#00F2FF", stroke: "#001018", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#00F2FF", stroke: "#001018", strokeWidth: 2 }}
              />
              <Line
                yAxisId="attendance"
                type="monotone"
                dataKey="attendance"
                name="Asistencia"
                stroke="#34D399"
                strokeWidth={2.2}
                dot={{ r: 3, fill: "#34D399", stroke: "#001018", strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: "#34D399", stroke: "#001018", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-black/30 p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-white/15", deltaAttendance >= 0 ? "text-emerald-300 border-emerald-400/30" : "text-rose-300 border-rose-400/30")}>
            Asistencia {deltaAttendance >= 0 ? "+" : ""}{deltaAttendance}%
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-white/15", deltaSessions >= 0 ? "text-primary border-primary/30" : "text-amber-300 border-amber-400/30")}>
            Sesiones {deltaSessions >= 0 ? "+" : ""}{deltaSessions}
          </Badge>
        </div>
        <div className="mt-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data.map((d) => (
            <div key={d.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
              <p className="text-[9px] uppercase font-black text-primary/70">{d.label}</p>
              <p className={cn("text-[10px] uppercase font-bold", d.attendance < 70 ? "text-rose-300" : "text-white/80")}>
                S:{d.sessions} · A:{d.attendance}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
