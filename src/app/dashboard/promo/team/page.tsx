"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Save,
  LayoutGrid,
  Plus,
  Dumbbell,
  Globe,
  MapPin,
  Trophy,
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
import { FORMATIONS_DATA } from "@/lib/formations";
import {
  HubPanel,
  SectionBar,
  PromoAdsPanel,
  PANEL_OUTER,
  inputProClass,
  iconCyan,
} from "@/app/dashboard/promo/command-hub-ui";

type TeamType = "f11" | "f7" | "futsal";

const POSITIONS: Record<TeamType, string[]> = {
  f11: ["POR", "LD", "LI", "DFC", "DFC", "MCD", "MC", "MCO", "ED", "EI", "DC"],
  f7: ["POR", "DEF", "DEF", "DEF", "MID", "MID", "ATK"],
  futsal: ["POR", "FIXO", "ALA", "ALA", "PIVOT"],
};

/** Evita crash si localStorage tiene type inválido ("F11", vacío, etc.): POSITIONS[teamType] sería undefined. */
function coerceTeamType(raw: unknown): TeamType {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (s === "f11" || s === "f7" || s === "futsal") return s;
  return "f11";
}

function formationKeysFor(t: TeamType): string[] {
  const block = FORMATIONS_DATA[t];
  return block ? Object.keys(block) : [];
}

function defaultFormationFor(t: TeamType): string {
  const keys = formationKeysFor(t);
  return keys[0] ?? "4-3-3";
}

function normalizeFixedLength(list: unknown, len: number): string[] {
  const src = Array.isArray(list) ? list : [];
  return Array.from({ length: len }, (_, i) => String(src[i] ?? ""));
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
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
  const [formationKey, setFormationKey] = useState<string>(() => defaultFormationFor("f11"));
  const [loading, setLoading] = useState(false);
  const didHydrateRef = useRef(false);
  const savedTeamRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    const saved = safeParseJson<Record<string, unknown> | null>(localStorage.getItem("synq_promo_team"), null);
    if (saved) {
      savedTeamRef.current = saved;
      const savedType = coerceTeamType(saved.type);
      setTeamType(savedType);
      setTeamName(String(saved.name ?? ""));
      setCountry(String(saved.country ?? ""));
      setCity(String(saved.city ?? ""));
      setCategory(String(saved.category ?? ""));
      setStarters(normalizeFixedLength(saved.starters, POSITIONS[savedType].length));
      setSubstitutes(normalizeFixedLength(saved.substitutes, 4));
      const fk = formationKeysFor(savedType);
      const savedForm = String(saved.formation ?? "").trim();
      setFormationKey(fk.includes(savedForm) ? savedForm : defaultFormationFor(savedType));
    } else {
      setStarters(Array(POSITIONS[teamType].length).fill(""));
    }
    didHydrateRef.current = true;
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    const saved = savedTeamRef.current ?? safeParseJson<Record<string, unknown> | null>(localStorage.getItem("synq_promo_team"), null);
    if (saved?.starters) {
      const t = coerceTeamType(teamType);
      setStarters(normalizeFixedLength(saved.starters, POSITIONS[t].length));
      return;
    }
    setStarters(Array(POSITIONS[coerceTeamType(teamType)].length).fill(""));
  }, [teamType]);

  useEffect(() => {
    const t = coerceTeamType(teamType);
    const keys = formationKeysFor(t);
    setFormationKey((prev) => (keys.includes(prev) ? prev : defaultFormationFor(t)));
  }, [teamType]);

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    window.setTimeout(() => {
      const teamData = {
        type: coerceTeamType(teamType),
        formation: formationKey,
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

      const vault = safeParseJson<Record<string, unknown>>(
        localStorage.getItem("synq_promo_vault"),
        { exercises: [], sessions: [], matches: [] },
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

  const resolvedType = coerceTeamType(teamType);
  const positionList = POSITIONS[resolvedType];
  const safeSubstitutes = Array.isArray(substitutes) ? substitutes : [];
  const formationOptions = formationKeysFor(resolvedType);

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
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:justify-end">
          <Select value={formationKey} onValueChange={setFormationKey}>
            <SelectTrigger
              className={cn(
                "w-full sm:w-[200px] h-11 rounded-none border-white/10 bg-slate-950/50 backdrop-blur-md text-cyan-200 font-black uppercase text-[10px] tracking-widest",
                "focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400",
              )}
            >
              <SelectValue placeholder="Formación" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-white/10 bg-[#0a1220] backdrop-blur-xl max-h-72">
              {formationOptions.map((k) => (
                <SelectItem key={k} value={k} className="text-[10px] font-black uppercase">
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resolvedType} onValueChange={(v) => setTeamType(coerceTeamType(v))}>
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

      <div className="space-y-8 w-full min-w-0">
        <div className="space-y-8 w-full min-w-0">
          <HubPanel>
            <SectionBar title="Datos del equipo" />
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
          </HubPanel>

          <PromoAdsPanel placement="sandbox_team_page_horizontal" />

          <HubPanel>
            <SectionBar title="Once titular" />
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {positionList.map((pos, i) => {
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
          </HubPanel>

          <HubPanel>
            <SectionBar title="Suplentes / rotación" />
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {safeSubstitutes.map((name, i) => (
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
                onClick={() => setSubstitutes([...safeSubstitutes, ""])}
                className="p-4 rounded-none border border-dashed border-white/15 bg-slate-950/20 flex items-center justify-center gap-2 text-white/35 hover:border-cyan-400/30 hover:text-cyan-200/80 transition-colors min-h-[3.25rem]"
              >
                <Plus className="h-4 w-4 text-cyan-400/70" />
                <span className="text-[9px] font-black uppercase tracking-widest">Añadir slot</span>
              </button>
            </div>
          </HubPanel>
        </div>
      </div>

      <input type="hidden" name="sportType" value="football" />
    </form>
  );
}
