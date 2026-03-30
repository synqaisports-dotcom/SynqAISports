
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  Save, 
  LayoutGrid, 
  ArrowRight, 
  ShieldCheck, 
  Info,
  Sparkles,
  Zap,
  Trash2,
  Plus,
  Activity,
  Dumbbell,
  Building2,
  Globe,
  MapPin,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TeamType = "f11" | "f7" | "futsal";

const POSITIONS: Record<TeamType, string[]> = {
  f11: ["POR", "LD", "LI", "DFC", "DFC", "MCD", "MC", "MCO", "ED", "EI", "DC"],
  f7: ["POR", "DEF", "DEF", "DEF", "MID", "MID", "ATK"],
  futsal: ["POR", "FIXO", "ALA", "ALA", "PIVOT"]
};

function normalizeFixedLength(list: unknown, len: number): string[] {
  const src = Array.isArray(list) ? list : [];
  const out = Array.from({ length: len }, (_, i) => String(src[i] ?? ""));
  return out;
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
  const savedTeamRef = useRef<any>(null);

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

  // Efecto para reajustar titulares al cambiar de formato si no hay datos
  useEffect(() => {
    if (!didHydrateRef.current) return;
    const saved = savedTeamRef.current ?? JSON.parse(localStorage.getItem("synq_promo_team") || "null");
    // Política estable: si hay starters guardados, rehidratar siempre desde storage y normalizar a la longitud del formato actual.
    if (saved?.starters) {
      setStarters(normalizeFixedLength(saved.starters, POSITIONS[teamType].length));
      return;
    }
    // Si no hay starters guardados, solo entonces inicializamos vacío con longitud correcta.
    setStarters(Array(POSITIONS[teamType].length).fill(""));
  }, [teamType]);

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const teamData = {
        type: teamType,
        name: teamName.toUpperCase(),
        country: country.toUpperCase(),
        city: city.toUpperCase(),
        category: category.toUpperCase(),
        starters,
        substitutes,
        sportType: "football", 
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem("synq_promo_team", JSON.stringify(teamData));
      
      const vault = JSON.parse(localStorage.getItem("synq_promo_vault") || '{"exercises": [], "sessions": [], "matches": []}');
      localStorage.setItem("synq_promo_vault", JSON.stringify({ ...vault, team: teamData }));

      setLoading(false);
      toast({
        title: "EQUIPO_SINCRO_LOCAL",
        description: "Tu plantilla y atributos han sido blindados en el navegador.",
      });
    }, 1000);
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
    <div className="space-y-8 animate-in fade-in duration-1000 p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary tracking-[0.5em] uppercase italic">Local_Squad_Designer_v1.0</span>
          </div>
          <h1 className="text-5xl font-headline font-black text-white uppercase italic tracking-tighter blue-text-glow leading-none">
            MI_EQUIPO_LOCAL
          </h1>
          <p className="text-[11px] font-black text-primary/30 tracking-[0.3em] uppercase">Gestión de Plantilla Sandbox</p>
        </div>

        <div className="flex gap-4">
           <div className="flex flex-col gap-1.5">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Formato de Juego</span>
              <Select value={teamType} onValueChange={(v: TeamType) => setTeamType(v)}>
                <SelectTrigger className="w-[200px] h-12 bg-black border-primary/20 rounded-xl text-primary font-black uppercase text-[10px] tracking-widest focus:ring-primary/30">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#0a0f18] border-primary/20">
                  <SelectItem value="f11" className="text-[10px] font-black uppercase">Fútbol 11</SelectItem>
                  <SelectItem value="f7" className="text-[10px] font-black uppercase">Fútbol 7</SelectItem>
                  <SelectItem value="futsal" className="text-[10px] font-black uppercase">Fútbol Sala</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <Button 
            onClick={handleSaveTeam}
            disabled={loading}
            className="h-12 mt-auto bg-primary text-black font-black uppercase text-[10px] tracking-widest px-8 rounded-xl blue-glow hover:scale-105 transition-[background-color,border-color,color,opacity,transform] border-none"
           >
            {loading ? "Sincronizando..." : "Guardar Plantilla"} <Save className="h-4 w-4 ml-2" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        <div className="xl:col-span-2 space-y-10">
          {/* SECCIÓN 1: ATRIBUTOS DE IDENTIDAD */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">ATRIBUTOS_DEL_NODO</h3>
            </div>
            <Card className="glass-panel border-white/5 bg-black/40 p-8 rounded-[2rem]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Nombre del Equipo</Label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-3 h-4 w-4 text-primary/20" />
                    <Input 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="EJ: RAYO VALLECANO" 
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold uppercase focus:border-primary pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Categoría / Etapa</Label>
                  <div className="relative">
                    <Dumbbell className="absolute left-3 top-3 h-4 w-4 text-primary/20" />
                    <Input 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="EJ: ALEVÍN A" 
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold uppercase focus:border-primary pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">País Nodo</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-primary/20" />
                    <Input 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="EJ: ESPAÑA" 
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold uppercase focus:border-primary pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1 italic">Ciudad Sede</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-primary/20" />
                    <Input 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="EJ: MADRID" 
                      className="h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold uppercase focus:border-primary pl-10"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* SECCIÓN 2: ROSTER TITULAR */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white">ONCE_TITULAR_DE_ESTILO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POSITIONS[teamType].map((pos, i) => (
                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-[background-color,border-color,color,opacity,transform]">
                   <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-[10px] font-black italic text-primary shrink-0 group-hover:scale-110 transition-transform">
                      {pos}
                   </div>
                   <Input 
                    value={starters[i] || ""}
                    onChange={(e) => updateStarter(i, e.target.value)}
                    placeholder="NOMBRE DEL JUGADOR" 
                    className="h-10 bg-transparent border-none text-white font-bold uppercase text-xs focus-visible:ring-0 placeholder:text-white/5"
                   />
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 3: SUPLENTES */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Activity className="h-4 w-4 text-primary/40" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">SUPLENTES / ROTACIÓN</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {substitutes.map((name, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-[background-color,border-color,color,opacity,transform] opacity-60 hover:opacity-100">
                   <div className="h-10 w-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black italic text-white/20 shrink-0">
                      SUB
                   </div>
                   <Input 
                    value={name}
                    onChange={(e) => updateSub(i, e.target.value)}
                    placeholder="NOMBRE SUPLENTE" 
                    className="h-10 bg-transparent border-none text-white/60 font-bold uppercase text-xs focus-visible:ring-0 placeholder:text-white/5"
                   />
                </div>
              ))}
              <button 
                onClick={() => setSubstitutes([...substitutes, ""])}
                className="p-4 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/10 hover:border-primary/20 hover:text-primary/40 transition-[background-color,border-color,color,opacity,transform]"
              >
                <Plus className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Añadir Slot</span>
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-[background-color,border-color,color,opacity,transform]"><Sparkles className="h-32 w-32 text-primary" /></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6">SINCRO_PIZARRA</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-10 leading-loose italic">
              Los nombres y atributos configurados aquí aparecerán automáticamente en las fichas de la Pizarra de Partido y el Pocket Master.
            </p>
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl space-y-4">
               <div className="flex items-center gap-3">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary">Cepo de Datos Local</span>
               </div>
               <p className="text-[9px] text-white/20 uppercase font-bold leading-relaxed italic">
                 Estamos estabilizando el protocolo de Fútbol. La información geográfica nos ayuda a optimizar los servidores regionales para tu Sandbox.
               </p>
            </div>
          </Card>

          <Card className="glass-panel border-primary/20 bg-primary/5 p-8 rounded-[2.5rem]">
             <div className="flex items-center gap-3 mb-6">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <h4 className="text-sm font-black italic uppercase text-white tracking-tighter">Ventaja Elite Club</h4>
             </div>
             <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest leading-relaxed mb-8">
               ¿Cansado de escribir nombres manualmente? El plan Pro permite importar atletas desde Excel, gestionar historiales médicos y telemetría de fatiga en tiempo real.
             </p>
             <Button className="w-full h-14 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl blue-glow border-none" asChild>
                <Link href="/login">ACTUALIZAR A PRO <ArrowRight className="h-4 w-4 ml-2" /></Link>
             </Button>
          </Card>

          <input type="hidden" name="sportType" value="football" />
        </aside>
      </div>
    </div>
  );
}
