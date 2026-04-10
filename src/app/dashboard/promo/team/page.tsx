"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  Users,
  Save,
  LayoutGrid,
  ArrowRight,
  ShieldCheck,
  Info,
  Sparkles,
  Zap,
  Plus,
  Activity,
  Dumbbell,
  Building2,
  Globe,
  MapPin,
  Trophy,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TeamType = "f11" | "f7" | "futsal";

const POSITIONS: Record<TeamType, string[]> = {
  f11: ["POR", "LD", "LI", "DFC", "DFC", "MCD", "MC", "MCO", "ED", "EI", "DC"],
  f7: ["POR", "DEF", "DEF", "DEF", "MID", "MID", "ATK"],
  futsal: ["POR", "FIXO", "ALA", "ALA", "PIVOT"],
};

const PANEL_OUTER =
  "drop-shadow-[0_0_15px_rgba(6,182,212,0.1)] shadow-[0_18px_60px_rgba(0,0,0,0.45)]";

const inputProClass =
  "h-11 rounded-none border border-white/10 bg-slate-950/45 backdrop-blur-md text-white font-bold uppercase text-xs placeholder:text-white/25 " +
  "focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/45 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_18px_rgba(34,211,238,0.25)] " +
  "transition-[border-color,box-shadow] duration-200";

const iconCyan = "h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]";

function HubSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <Icon className={cn(iconCyan, "h-5 w-5")} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.35em] text-white">{title}</h3>
      </div>
      <div
        className={cn(
          "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden",
          PANEL_OUTER,
        )}
      >
        {children}
      </div>
    </section>
  );
}

function SectionBar({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/85 truncate">{title}</p>
      {right}
    </div>
  );
}

function normalizeFixedLength(list: unknown, len: number): string[] {
  const src = Array.isArray(list) ? list : [];
  return Array.from({ length: len }, (_, i) => String(src[i] ?? ""));
}

export default function PromoTeamPage() {
  const { toast } = useToast();
  const [teamType, setTeamType] = useState<TeamType>("f11");
  const [teamName, setTeamName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [starters, setStarters] = useState<string[]>([]);
  const [substitutes, setSubstitutes] = useState<string[]>(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const didHydrateRef = useRef(false);
  const savedTeamRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("synq_promo_team") || "null");
    if (saved) {
      savedTeamRef.current = saved;
      const savedType = (saved.type || "f11") as TeamType;
      setTeamType(savedType);
      setTeamName(saved.name || "");
      setCountry(saved.country || "");
      setCity(saved.city || "");
      setCategory(saved.category || "");
      setStarters(normalizeFixedLength(saved.starters, POSITIONS[savedType].length));
      setSubstitutes(normalizeFixedLength(saved.substitutes, 4));
    } else {
      setStarters(Array(POSITIONS[teamType].length).fill(""));
    }
    didHydrateRef.current = true;
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const saved = savedTeamRef.current ?? JSON.parse(localStorage.getItem("synq_promo_team") || "null");
    if (saved?.starters) {
      setStarters(normalizeFixedLength(saved.starters, POSITIONS[teamType].length));
      return;
    }
    setStarters(Array(POSITIONS[teamType].length).fill(""));
  }, [teamType]);

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      const teamData = {
        type: teamType,
        name: teamName.toUpperCase(),
        country: country.toUpperCase(),
        city: city.toUpperCase(),
        category: category.toUpperCase(),
        starters,
        substitutes,
        sportType: "football",
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem("synq_promo_team", JSON.stringify(teamData));

      const vault = JSON.parse(
        localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": [], "matches": []}',
      );
      localStorage.setItem("synq_promo_vault", JSON.stringify({ ...vault, team: teamData }));

      setLoading(false);
      toast({
        title: "Plantilla sincronizada",
        description: "Datos blindados en el nodo local. Pizarra lista para leer el roster.",
      });
    }, 600);
  };

  const updateStarter = (idx: number, name: string) => {
    const next = [...starters];
    next[idx] = name.toUpperCase();
    setStarters(next);
  };

  const updateSub = (idx: number, name: string) => {
    const next = [...substitutes];
    next[idx] = name.toUpperCase();
    setSubstitutes(next);
  };

  return (
    <form onSubmit={handleSaveTeam} className="space-y-6 lg:space-y-8 animate-in fade-in duration-700">
      {/* Barra operativa: formato + guardar (estilo tablet) */}
      <div
        className={cn(
          "flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-4 p-4 border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-none",
          PANEL_OUTER,
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Users className={cn(iconCyan, "h-6 w-6 shrink-0")} />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-cyan-300/80">Terminal de datos</p>
            <p className="text-sm font-black uppercase tracking-tight text-white truncate">Plantilla local · sandbox</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Formato</span>
            <Select value={teamType} onValueChange={(v: TeamType) => setTeamType(v)}>
              <SelectTrigger
                className={cn(
                  "w-full sm:w-[200px] h-11 rounded-none border-white/10 bg-slate-950/50 backdrop-blur-md text-cyan-200 font-black uppercase text-[10px] tracking-widest",
                  "focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400",
                )}
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-none border-white/10 bg-[#0a1220] backdrop-blur-xl">
                <SelectItem value="f11" className="text-[10px] font-black uppercase">
                  Fútbol 11
                </SelectItem>
                <SelectItem value="f7" className="text-[10px] font-black uppercase">
                  Fútbol 7
                </SelectItem>
                <SelectItem value="futsal" className="text-[10px] font-black uppercase">
                  Fútbol Sala
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-12 sm:h-11 px-8 rounded-none bg-cyan-500 text-black font-black uppercase text-[11px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:bg-cyan-400 hover:shadow-[0_0_36px_rgba(34,211,238,0.75)]"
          >
            {loading ? "Sincronizando…" : "Guardar plantilla"}
            <Save className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-8 space-y-8">
          {/* ATRIBUTOS DEL NODO */}
          <HubSection title="Atributos del nodo" icon={Building2}>
            <SectionBar title="Identidad · geolocalización" />
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Nombre del equipo</Label>
                <div className="relative">
                  <Trophy className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", iconCyan)} />
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="EJ: TRES COLORES"
                    className={cn(inputProClass, "pl-10")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Categoría / etapa</Label>
                <div className="relative">
                  <Dumbbell className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", iconCyan)} />
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="EJ: ALEVÍN A"
                    className={cn(inputProClass, "pl-10")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">País nodo</Label>
                <div className="relative">
                  <Globe className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", iconCyan)} />
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="EJ: ESPAÑA"
                    className={cn(inputProClass, "pl-10")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-cyan-200/70 tracking-widest">Ciudad sede</Label>
                <div className="relative">
                  <MapPin className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", iconCyan)} />
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="EJ: MADRID"
                    className={cn(inputProClass, "pl-10")}
                  />
                </div>
              </div>
            </div>
          </HubSection>

          {/* ONCE TITULAR */}
          <HubSection title="Once titular" icon={ShieldCheck}>
            <SectionBar title="Fichas tácticas · roster en vivo" />
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {POSITIONS[teamType].map((pos, i) => {
                const filled = Boolean((starters[i] || "").trim());
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-3 p-3 sm:p-4 rounded-none border border-white/10 bg-slate-950/40 backdrop-blur-md",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-cyan-400/20 transition-colors",
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-11 shrink-0 flex items-center justify-center rounded-none border border-cyan-400/35 bg-cyan-500/10",
                        "text-[9px] font-black text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.65)]",
                      )}
                    >
                      {pos}
                    </div>
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        filled ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" : "bg-white/15",
                      )}
                      title={filled ? "Dato activo" : "Vacante"}
                      aria-hidden
                    />
                    <Input
                      value={starters[i] || ""}
                      onChange={(e) => updateStarter(i, e.target.value)}
                      placeholder="NOMBRE JUGADOR"
                      className={cn(
                        "flex-1 h-10 rounded-none border-transparent bg-transparent text-white font-bold uppercase text-xs",
                        "focus-visible:border-cyan-400/50 focus-visible:ring-1 focus-visible:ring-cyan-400/40",
                        "placeholder:text-white/20",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </HubSection>

          {/* SUPLENTES */}
          <HubSection title="Suplentes / rotación" icon={Activity}>
            <SectionBar title="Banco táctico" />
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {substitutes.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-none border border-dashed border-white/15 bg-slate-950/30 backdrop-blur-md"
                >
                  <div className="h-9 w-11 shrink-0 flex items-center justify-center rounded-none border border-white/15 bg-white/5 text-[9px] font-black text-white/50">
                    SUB
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => updateSub(i, e.target.value)}
                    placeholder="NOMBRE SUPLENTE"
                    className={cn(
                      "flex-1 h-10 rounded-none border-transparent bg-transparent text-white/90 font-bold uppercase text-xs",
                      "focus-visible:border-cyan-400/40 focus-visible:ring-1 focus-visible:ring-cyan-400/30",
                    )}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSubstitutes([...substitutes, ""])}
                className="p-4 rounded-none border border-dashed border-white/15 bg-slate-950/20 flex items-center justify-center gap-2 text-white/35 hover:border-cyan-400/30 hover:text-cyan-200/80 transition-colors min-h-[3.25rem]"
              >
                <Plus className="h-4 w-4 text-cyan-400/70" />
                <span className="text-[9px] font-black uppercase tracking-widest">Añadir slot</span>
              </button>
            </div>
          </HubSection>
        </div>

        <aside className="xl:col-span-4 space-y-6">
          {/* SINCRO PIZARRA — estilo monetización */}
          <div
            className={cn(
              "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden",
              PANEL_OUTER,
            )}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/85">Sincro pizarra</p>
              <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin drop-shadow-[0_0_12px_rgba(34,211,238,0.85)] [animation-duration:2.8s]" />
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Los nombres y atributos de este nodo se reflejan en la pizarra de partido y en el flujo táctico del sandbox.
              </p>
              <div className="p-4 rounded-none border border-white/10 bg-black/35 backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-200/90">Cepo local</span>
                </div>
                <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed">
                  Persistencia en navegador. Sin envío a servidor en modo sandbox promocional.
                </p>
              </div>
            </div>
          </div>

          {/* VENTAJA ELITE */}
          <div
            className={cn(
              "rounded-none border border-white/10 bg-slate-900/60 backdrop-blur-md overflow-hidden",
              PANEL_OUTER,
            )}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/85">Ventaja élite club</p>
              <Sparkles className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-400 animate-pulse drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
                <h4 className="text-xs font-black uppercase tracking-tight text-white">Escala profesional</h4>
              </div>
              <p className="text-[10px] text-cyan-200/55 font-bold uppercase tracking-widest leading-relaxed">
                Importación masiva, historial y telemetría en planes club. Operación unificada fuera del sandbox.
              </p>
              <Button
                className="w-full h-12 rounded-none bg-cyan-500 text-black font-black uppercase text-[10px] tracking-widest border-0 shadow-[0_0_28px_rgba(6,182,212,0.65)] hover:bg-cyan-400"
                asChild
              >
                <Link href="/login">
                  Actualizar a pro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <input type="hidden" name="sportType" value="football" />
    </form>
  );
}
